import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computePriorityScore } from "@/lib/task-priority";
import type { TaskInput, TaskInfo } from "@/lib/task-priority";

async function getVehicle(session: any, vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return null;
  const isOwner = vehicle.userId === session.user.id;
  const isOrgMember = vehicle.organizationId
    ? !!(await prisma.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: vehicle.organizationId, userId: session.user.id } },
      }))
    : false;
  if (!isOwner && !isOrgMember) return null;
  return vehicle;
}

export async function PUT(request: Request, { params }: { params: { id: string; taskId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const vehicle = await getVehicle(session, params.id);
  if (!vehicle) return new NextResponse("Not found", { status: 404 });

  const existing = await prisma.vehicleTask.findFirst({ where: { id: params.taskId, vehicleId: params.id } });
  if (!existing) return new NextResponse("Task not found", { status: 404 });

  const body = await request.json();
  const title = body.title ?? existing.title;
  const category = body.category ?? existing.category;
  const urgency = body.urgency ?? existing.urgency;
  const status = body.status ?? existing.status;
  const dependencyIds = body.dependencyIds !== undefined ? body.dependencyIds : (existing.dependencyIds ? JSON.parse(existing.dependencyIds) : []);
  const buildGoalTag = body.buildGoalTag !== undefined ? body.buildGoalTag : existing.buildGoalTag;

  const allTasks = await prisma.vehicleTask.findMany({ where: { vehicleId: params.id } });
  const taskInfo: TaskInfo[] = allTasks
    .filter((t) => t.id !== params.taskId)
    .map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category as any,
      estimatedCost: t.estimatedCost,
      estimatedHours: t.estimatedHours,
      urgency: t.urgency as any,
      status: t.status as any,
      dependencyIds: t.dependencyIds ? JSON.parse(t.dependencyIds) : [],
      buildGoalTag: t.buildGoalTag,
    }));

  const scored = computePriorityScore(
    {
      title,
      category,
      estimatedCost: body.estimatedCost !== undefined ? body.estimatedCost : existing.estimatedCost,
      estimatedHours: body.estimatedHours !== undefined ? body.estimatedHours : existing.estimatedHours,
      urgency,
      dependencyIds,
      buildGoalTag,
    },
    taskInfo
  );

  const data: any = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.category !== undefined) data.category = body.category;
  if (body.estimatedCost !== undefined) data.estimatedCost = body.estimatedCost != null ? Number(body.estimatedCost) : null;
  if (body.estimatedHours !== undefined) data.estimatedHours = body.estimatedHours != null ? Number(body.estimatedHours) : null;
  if (body.urgency !== undefined) data.urgency = body.urgency;
  if (body.status !== undefined) {
    data.status = body.status;
    if (body.status === "completed") data.completedAt = new Date();
    if (body.status === "pending") data.completedAt = null;
  }
  if (body.dependencyIds !== undefined) data.dependencyIds = body.dependencyIds?.length ? JSON.stringify(body.dependencyIds) : null;
  if (body.buildGoalTag !== undefined) data.buildGoalTag = body.buildGoalTag || null;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  data.priorityScore = scored.score;
  data.priorityLabel = scored.label;
  data.explanation = scored.explanation;

  const updated = await prisma.vehicleTask.update({ where: { id: params.taskId }, data });

  await rescoreDependents(params.id, params.taskId);

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string; taskId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const vehicle = await getVehicle(session, params.id);
  if (!vehicle) return new NextResponse("Not found", { status: 404 });

  const existing = await prisma.vehicleTask.findFirst({ where: { id: params.taskId, vehicleId: params.id } });
  if (!existing) return new NextResponse("Task not found", { status: 404 });

  await prisma.vehicleTask.delete({ where: { id: params.taskId } });

  await rescoreDependents(params.id, params.taskId);

  return new NextResponse(null, { status: 204 });
}

async function rescoreDependents(vehicleId: string, excludeId?: string) {
  const allTasks = await prisma.vehicleTask.findMany({ where: { vehicleId } });
  const taskInfo: TaskInfo[] = allTasks.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category as any,
    estimatedCost: t.estimatedCost,
    estimatedHours: t.estimatedHours,
    urgency: t.urgency as any,
    status: t.status as any,
    dependencyIds: t.dependencyIds ? JSON.parse(t.dependencyIds) : [],
    buildGoalTag: t.buildGoalTag,
  }));

  for (const task of allTasks) {
    if (excludeId && task.id === excludeId) continue;
    const info = taskInfo.find((t) => t.id === task.id)!;
    const input: TaskInput = {
      title: info.title,
      category: info.category,
      estimatedCost: info.estimatedCost,
      estimatedHours: info.estimatedHours,
      urgency: info.urgency,
      dependencyIds: info.dependencyIds,
      buildGoalTag: (info.buildGoalTag as any),
    };
    const scored = computePriorityScore(input, taskInfo);
    await prisma.vehicleTask.update({
      where: { id: task.id },
      data: { priorityScore: scored.score, priorityLabel: scored.label, explanation: scored.explanation },
    });
  }
}
