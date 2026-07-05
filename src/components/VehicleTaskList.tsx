"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, DollarSign, Trash2, GripVertical, Loader2, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  estimatedCost: number | null;
  estimatedHours: number | null;
  urgency: string;
  status: string;
  priorityScore: number | null;
  priorityLabel: string | null;
  explanation: string | null;
  dependencyIds: string | null;
  buildGoalTag: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface VehicleTaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAdd: () => void;
  onEdit: (task: Task) => void;
}

const PRIORITY_COLORS: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  critical: { border: "border-red-500", bg: "bg-red-50 dark:bg-red-950/20", badge: "bg-red-500/10 text-red-600 dark:text-red-400", text: "text-red-600 dark:text-red-400" },
  high: { border: "border-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20", badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400", text: "text-orange-600 dark:text-orange-400" },
  medium: { border: "border-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20", badge: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", text: "text-yellow-600 dark:text-yellow-400" },
  low: { border: "border-green-500", bg: "bg-green-50 dark:bg-green-950/20", badge: "bg-green-500/10 text-green-600 dark:text-green-400", text: "text-green-600 dark:text-green-400" },
};

const CATEGORY_ICONS: Record<string, string> = {
  safety_repair: "🛡️",
  maintenance: "🔧",
  performance_mod: "⚡",
  aesthetic: "✨",
  offroad_conversion: "🏔️",
};

export function VehicleTaskList({ tasks, isLoading, onToggleComplete, onDelete, onAdd, onEdit }: VehicleTaskListProps) {
  const { t } = useLanguage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const pendingTasks = tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const displayTasks = pendingTasks.length > 0 ? pendingTasks : completedTasks;

  return (
    <div className="space-y-3">
      {displayTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t("dashboard.vehicleTasks.noTasks")}</p>
          <button onClick={onAdd} className="mt-2 text-sm text-primary hover:underline font-medium">
            {t("dashboard.vehicleTasks.addFirstTask")}
          </button>
        </div>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  completingId={completingId}
                  deletingId={deletingId}
                  setCompletingId={setCompletingId}
                  setDeletingId={setDeletingId}
                />
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <details className="group">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground font-medium py-2">
                {t("dashboard.vehicleTasks.status.completed")} ({completedTasks.length})
              </summary>
              <div className="mt-2 space-y-2">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    completingId={completingId}
                    deletingId={deletingId}
                    setCompletingId={setCompletingId}
                    setDeletingId={setDeletingId}
                  />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function TaskCard({
  task, onToggleComplete, onDelete, onEdit,
  completingId, deletingId, setCompletingId, setDeletingId,
}: {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  completingId: string | null;
  deletingId: string | null;
  setCompletingId: (id: string | null) => void;
  setDeletingId: (id: string | null) => void;
}) {
  const { t } = useLanguage();
  const priority = task.priorityLabel || "low";
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;
  const isCompleted = task.status === "completed";

  return (
    <div
      className={`relative border-l-4 ${colors.border} ${colors.bg} rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${isCompleted ? "opacity-60" : ""}`}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); setCompletingId(task.id); onToggleComplete(task); }}
          disabled={completingId === task.id}
          className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? "bg-primary border-primary text-white" : "border-muted-foreground hover:border-primary"}`}
        >
          {isCompleted && <CheckCircle2 className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm">{CATEGORY_ICONS[task.category] || "📋"}</span>
            <h4 className={`font-medium text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </h4>
            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${colors.badge}`}>
              {t(`dashboard.vehicleTasks.priority.${priority}`)}
            </span>
          </div>
          {task.explanation && !isCompleted && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {task.explanation}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {task.estimatedCost != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />${task.estimatedCost}
              </span>
            )}
            {task.estimatedHours != null && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />{task.estimatedHours}h
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${task.urgency === "critical" ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" : task.urgency === "high" ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400" : "bg-muted text-muted-foreground"}`}>
              {t(`dashboard.vehicleTasks.urgency.${task.urgency}`)}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setDeletingId(task.id); onDelete(task); }}
          disabled={deletingId === task.id}
          className="shrink-0 p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
        >
          {deletingId === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
