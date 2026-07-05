import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computePriorityScore } from "@/lib/task-priority";
import type { TaskInput, TaskInfo } from "@/lib/task-priority";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!vehicle) return new NextResponse("Not found", { status: 404 });

  const isOwner = vehicle.userId === session.user.id;
  const isOrgMember = vehicle.organizationId
    ? !!(await prisma.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: vehicle.organizationId, userId: session.user.id } },
      }))
    : false;
  if (!isOwner && !isOrgMember) return new NextResponse("Not found", { status: 404 });

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

  for (const task of allTasks) {
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

  const updated = await prisma.vehicleTask.findMany({
    where: { vehicleId: params.id },
    orderBy: [{ priorityScore: "desc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(updated);
}
