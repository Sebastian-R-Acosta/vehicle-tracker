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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const vehicle = await getVehicle(session, params.id);
  if (!vehicle) return new NextResponse("Not found", { status: 404 });

  const tasks = await prisma.vehicleTask.findMany({
    where: { vehicleId: params.id },
    orderBy: [{ priorityScore: "desc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const vehicle = await getVehicle(session, params.id);
  if (!vehicle) return new NextResponse("Not found", { status: 404 });

  const body = await request.json();
  const { title, description, category, estimatedCost, estimatedHours, urgency, dependencyIds, buildGoalTag } = body;

  if (!title || !category || !urgency) {
    return new NextResponse("title, category, and urgency are required", { status: 400 });
  }

  const allTasks = await prisma.vehicleTask.findMany({ where: { vehicleId: params.id } });
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

  const scored = computePriorityScore(
    { title, category, estimatedCost, estimatedHours, urgency, dependencyIds: dependencyIds || [], buildGoalTag },
    taskInfo
  );

  const task = await prisma.vehicleTask.create({
    data: {
      vehicleId: params.id,
      userId: session.user.id,
      title,
      description: description || null,
      category,
      estimatedCost: estimatedCost != null ? Number(estimatedCost) : null,
      estimatedHours: estimatedHours != null ? Number(estimatedHours) : null,
      urgency: urgency || "medium",
      dependencyIds: dependencyIds?.length ? JSON.stringify(dependencyIds) : null,
      buildGoalTag: buildGoalTag || null,
      priorityScore: scored.score,
      priorityLabel: scored.label,
      explanation: scored.explanation,
      sortOrder: allTasks.length,
    },
  });

  await rescoreDependents(params.id, task.id);

  return NextResponse.json(task, { status: 201 });
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
