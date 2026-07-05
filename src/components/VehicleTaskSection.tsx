"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ClipboardList, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { VehicleTaskList } from "./VehicleTaskList";
import { VehicleTaskForm } from "./VehicleTaskForm";

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

interface VehicleTaskSectionProps {
  vehicleId: string;
}

export function VehicleTaskSection({ vehicleId }: VehicleTaskSectionProps) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/tasks`);
      if (res.ok) setTasks(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSave = async (data: any) => {
    if (editTask) {
      const res = await fetch(`/api/vehicles/${vehicleId}/tasks/${editTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Task updated");
    } else {
      const res = await fetch(`/api/vehicles/${vehicleId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Task added");
    }
    setEditTask(null);
    await fetchTasks();
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(newStatus === "completed" ? "Task completed" : "Task reopened");
      await fetchTasks();
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (task: Task) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Task deleted");
      await fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleAdd = () => {
    setEditTask(null);
    setShowForm(true);
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowForm(true);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          {t("dashboard.vehicleTasks.heading")}
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm"
        >
          <Plus className="w-4 h-4" />
          {t("dashboard.vehicleTasks.addTask")}
        </button>
      </div>

      <VehicleTaskList
        tasks={tasks}
        isLoading={loading}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      <VehicleTaskForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditTask(null); }}
        onSave={handleSave}
        editTask={editTask}
        allTasks={tasks}
        vehicleId={vehicleId}
      />
    </div>
  );
}
