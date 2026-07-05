export type TaskCategory = "safety_repair" | "maintenance" | "performance_mod" | "aesthetic" | "offroad_conversion";
export type TaskUrgency = "low" | "medium" | "high" | "critical";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type PriorityLabel = "critical" | "high" | "medium" | "low";
export type BuildGoalTag = "daily_driver" | "offroad_build" | "resale_prep" | "race_performance";

export interface TaskInput {
  title: string;
  category: TaskCategory;
  estimatedCost?: number | null;
  estimatedHours?: number | null;
  urgency: TaskUrgency;
  dependencyIds?: string[] | null;
  buildGoalTag?: BuildGoalTag | null;
}

export interface TaskInfo {
  id: string;
  title: string;
  category: TaskCategory;
  estimatedCost: number | null;
  estimatedHours: number | null;
  urgency: TaskUrgency;
  status: TaskStatus;
  dependencyIds: string[];
  buildGoalTag: string | null;
}

const CATEGORY_SAFETY_SCORE: Record<TaskCategory, number> = {
  safety_repair: 100,
  maintenance: 50,
  performance_mod: 10,
  aesthetic: 0,
  offroad_conversion: 5,
};

const URGENCY_SCORE: Record<TaskUrgency, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

const CATEGORY_DESCRIPTION: Record<TaskCategory, string> = {
  safety_repair: "Safety repair",
  maintenance: "Maintenance",
  performance_mod: "Performance mod",
  aesthetic: "Cosmetic",
  offroad_conversion: "Off-road conversion",
};

const URGENCY_DESCRIPTION: Record<TaskUrgency, string> = {
  critical: "Critical urgency",
  high: "High urgency",
  medium: "Medium urgency",
  low: "Low urgency",
};

export function computePriorityScore(task: TaskInput, allTasks: TaskInfo[]): { score: number; label: PriorityLabel; explanation: string } {
  const safetyScore = CATEGORY_SAFETY_SCORE[task.category] ?? 0;
  const urgencyScore = URGENCY_SCORE[task.urgency] ?? 25;
  const breakdown: string[] = [];

  const safetyWeight = 0.35;
  const urgencyWeight = 0.25;
  const dependencyWeight = 0.15;
  const costEfficiencyWeight = 0.10;
  const goalWeight = 0.10;
  const recencyWeight = 0.05;

  let dependencyScore = 0;
  let dependentCount = 0;
  let hasBlockedDeps = false;

  if (task.dependencyIds && task.dependencyIds.length > 0) {
    const pendingDeps = allTasks.filter((t) => task.dependencyIds!.includes(t.id) && t.status !== "completed");
    if (pendingDeps.length > 0) {
      hasBlockedDeps = true;
      dependencyScore -= 30;
    }
  }

  for (const other of allTasks) {
    if (other.id === (task as any).id) continue;
    const deps = other.dependencyIds || [];
    if (deps.includes((task as any).id) && other.status !== "completed") {
      dependentCount++;
    }
  }
  dependencyScore += dependentCount * 20;

  let costEfficiencyScore = 0;
  if (task.estimatedCost != null && task.category === "safety_repair" && task.estimatedCost < 200) {
    costEfficiencyScore = 80;
    breakdown.push("Cheap fix prevents expensive damage");
  } else if (task.estimatedCost != null && task.estimatedCost < 100) {
    costEfficiencyScore = 50;
    breakdown.push("Low-cost task");
  } else if (task.estimatedCost != null && task.estimatedCost > 1000) {
    costEfficiencyScore = 10;
  } else {
    costEfficiencyScore = 30;
  }

  let goalScore = 0;
  if (task.buildGoalTag) {
    goalScore = 80;
    if (task.category === "offroad_conversion" && task.buildGoalTag === "offroad_build") {
      goalScore = 100;
      breakdown.push("Supports your off-road build goal");
    }
    if (task.category === "performance_mod" && task.buildGoalTag === "race_performance") {
      goalScore = 100;
      breakdown.push("Supports your performance build goal");
    }
    if (task.category === "maintenance" && task.buildGoalTag === "daily_driver") {
      goalScore = 90;
      breakdown.push("Supports daily driver reliability");
    }
    if (task.category === "aesthetic" && task.buildGoalTag === "resale_prep") {
      goalScore = 90;
      breakdown.push("Supports resale value goal");
    }
  } else {
    goalScore = 20;
  }

  const score = Math.round(
    (safetyScore / 100) * safetyWeight * 100 +
    (urgencyScore / 100) * urgencyWeight * 100 +
    (dependencyScore / 100) * dependencyWeight * 100 +
    (costEfficiencyScore / 100) * costEfficiencyWeight * 100 +
    (goalScore / 100) * goalWeight * 100 +
    5 // base recency
  );

  buildExplanation(task, score, safetyScore, urgencyScore, dependencyScore, costEfficiencyScore, goalScore, dependentCount, hasBlockedDeps, breakdown);

  const label = getPriorityLabel(score);

  return { score, label, explanation: breakdown.join(". ") || `${CATEGORY_DESCRIPTION[task.category]} — ${URGENCY_DESCRIPTION[task.urgency]}` };
}

function buildExplanation(
  task: TaskInput,
  _score: number,
  safetyScore: number,
  urgencyScore: number,
  dependencyScore: number,
  _costEfficiencyScore: number,
  _goalScore: number,
  dependentCount: number,
  hasBlockedDeps: boolean,
  breakdown: string[]
) {
  if (safetyScore >= 100) {
    breakdown.unshift("Affects safety — top priority");
  }
  if (urgencyScore >= 75) {
    breakdown.unshift(`Urgency: ${task.urgency}`);
  }
  if (dependentCount > 0) {
    breakdown.push(`Blocks ${dependentCount} other task${dependentCount > 1 ? "s" : ""} — unlock them by completing this first`);
  }
  if (hasBlockedDeps) {
    breakdown.push("Waiting on another task — complete dependencies first");
  }
}

function getPriorityLabel(score: number): PriorityLabel {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export const BUILD_TEMPLATES = [
  {
    id: "offroad",
    name: "Off-Road Conversion",
    description: "Build a capable off-road vehicle",
    tasks: [
      { title: "Install suspension lift kit", category: "offroad_conversion" as TaskCategory, urgency: "high" as TaskUrgency, estimatedCost: 1500, estimatedHours: 8 },
      { title: "Upgrade to all-terrain or mud tires", category: "offroad_conversion" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 1200, estimatedHours: 2 },
      { title: "Install skid plates / underbody protection", category: "offroad_conversion" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 400, estimatedHours: 3 },
      { title: "Adjust differential / gear ratio", category: "offroad_conversion" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 800, estimatedHours: 4 },
      { title: "Install winch + recovery gear", category: "offroad_conversion" as TaskCategory, urgency: "low" as TaskUrgency, estimatedCost: 600, estimatedHours: 3 },
      { title: "Install roof rack / auxiliary lighting", category: "offroad_conversion" as TaskCategory, urgency: "low" as TaskUrgency, estimatedCost: 500, estimatedHours: 2 },
    ],
  },
  {
    id: "performance",
    name: "Performance Build",
    description: "Increase horsepower and handling",
    tasks: [
      { title: "Cold air intake upgrade", category: "performance_mod" as TaskCategory, urgency: "low" as TaskUrgency, estimatedCost: 300, estimatedHours: 1 },
      { title: "Performance exhaust system", category: "performance_mod" as TaskCategory, urgency: "low" as TaskUrgency, estimatedCost: 800, estimatedHours: 3 },
      { title: "ECU tune / remap", category: "performance_mod" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 500, estimatedHours: 2 },
      { title: "Upgrade suspension (coilovers / springs)", category: "performance_mod" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 1200, estimatedHours: 5 },
      { title: "Performance brake kit", category: "safety_repair" as TaskCategory, urgency: "high" as TaskUrgency, estimatedCost: 900, estimatedHours: 3 },
      { title: "Lightweight wheels + performance tires", category: "performance_mod" as TaskCategory, urgency: "low" as TaskUrgency, estimatedCost: 2000, estimatedHours: 1 },
    ],
  },
  {
    id: "daily",
    name: "Daily Driver Refresh",
    description: "Restore reliability and comfort for daily use",
    tasks: [
      { title: "Replace engine oil + filter", category: "maintenance" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 65, estimatedHours: 0.5 },
      { title: "Replace air filter + cabin filter", category: "maintenance" as TaskCategory, urgency: "low" as TaskUrgency, estimatedCost: 40, estimatedHours: 0.3 },
      { title: "Replace spark plugs + ignition coils", category: "maintenance" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 200, estimatedHours: 1.5 },
      { title: "Flush coolant + replace thermostat", category: "maintenance" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 150, estimatedHours: 1 },
      { title: "Replace serpentine belt + tensioner", category: "maintenance" as TaskCategory, urgency: "medium" as TaskUrgency, estimatedCost: 120, estimatedHours: 0.5 },
      { title: "Inspect and replace brake pads if worn", category: "safety_repair" as TaskCategory, urgency: "high" as TaskUrgency, estimatedCost: 250, estimatedHours: 2 },
      { title: "Replace tires if tread depth is low", category: "safety_repair" as TaskCategory, urgency: "high" as TaskUrgency, estimatedCost: 600, estimatedHours: 1 },
    ],
  },
];

export function getTemplateTasks(templateId: string) {
  return BUILD_TEMPLATES.find((t) => t.id === templateId) || null;
}
