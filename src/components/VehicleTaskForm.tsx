"use client";

import { useState, useEffect } from "react";
import { X, Loader2, LayoutTemplate } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { BuildTemplatePicker } from "./BuildTemplatePicker";
import type { BuildGoalTag, TaskCategory, TaskUrgency } from "@/lib/task-priority";

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  estimatedCost: number | null;
  estimatedHours: number | null;
  urgency: string;
  status: string;
  dependencyIds: string | null;
  buildGoalTag: string | null;
}

interface VehicleTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editTask?: Task | null;
  allTasks: Task[];
  vehicleId: string;
}

export function VehicleTaskForm({ open, onClose, onSave, editTask, allTasks }: VehicleTaskFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("maintenance");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [dependencyIds, setDependencyIds] = useState<string[]>([]);
  const [buildGoalTag, setBuildGoalTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (open) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description || "");
        setCategory(editTask.category);
        setEstimatedCost(editTask.estimatedCost?.toString() || "");
        setEstimatedHours(editTask.estimatedHours?.toString() || "");
        setUrgency(editTask.urgency);
        setDependencyIds(editTask.dependencyIds ? JSON.parse(editTask.dependencyIds) : []);
        setBuildGoalTag(editTask.buildGoalTag || "");
      } else {
        setTitle("");
        setDescription("");
        setCategory("maintenance");
        setEstimatedCost("");
        setEstimatedHours("");
        setUrgency("medium");
        setDependencyIds([]);
        setBuildGoalTag("");
      }
      setError("");
    }
  }, [open, editTask]);

  if (!open) return null;

  const pendingTasks = allTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled" && t.id !== editTask?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        category,
        estimatedCost: estimatedCost ? Number(estimatedCost) : null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        urgency,
        dependencyIds,
        buildGoalTag: buildGoalTag || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (templateTasks: { title: string; category: string; urgency: string; estimatedCost?: number; estimatedHours?: number }[]) => {
    if (templateTasks.length > 0) {
      const first = templateTasks[0];
      setTitle(first.title);
      setCategory(first.category);
      setUrgency(first.urgency);
      if (first.estimatedCost) setEstimatedCost(first.estimatedCost.toString());
      if (first.estimatedHours) setEstimatedHours(first.estimatedHours.toString());
    }
    setShowTemplates(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
        <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              {editTask ? t("dashboard.vehicleTasks.forms.editTitle") : t("dashboard.vehicleTasks.forms.title")}
            </h3>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.vehicleTasks.fields.title")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                placeholder="e.g. Replace brake pads"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.vehicleTasks.fields.description")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.vehicleTasks.fields.category")}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  {Object.entries(t("dashboard.vehicleTasks.categories")).map(([key, val]) => (
                    <option key={key} value={key}>{val as string}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.vehicleTasks.fields.urgency")}</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  {Object.entries(t("dashboard.vehicleTasks.urgency")).map(([key, val]) => (
                    <option key={key} value={key}>{val as string}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.vehicleTasks.fields.estimatedCost")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.vehicleTasks.fields.estimatedHours")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
            </div>

            {pendingTasks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.vehicleTasks.fields.dependencies")}</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {pendingTasks.map((pt) => (
                    <label key={pt.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dependencyIds.includes(pt.id)}
                        onChange={(e) => {
                          if (e.target.checked) setDependencyIds([...dependencyIds, pt.id]);
                          else setDependencyIds(dependencyIds.filter((id) => id !== pt.id));
                        }}
                        className="rounded border-input"
                      />
                      {pt.title}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("dashboard.vehicleTasks.fields.buildGoalTag")}</label>
              <select
                value={buildGoalTag}
                onChange={(e) => setBuildGoalTag(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              >
                <option value="">{t("dashboard.vehicleTasks.fields.buildGoalTag")}...</option>
                {Object.entries(t("dashboard.vehicleTasks.buildGoalTags")).map(([key, val]) => (
                  <option key={key} value={key}>{val as string}</option>
                ))}
              </select>
            </div>

            {!editTask && (
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                <LayoutTemplate className="w-4 h-4" />
                {t("dashboard.vehicleTasks.forms.applyTemplate")}
              </button>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent">
                {t("common.cancel")}
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editTask ? t("dashboard.vehicleTasks.forms.editTitle") : t("dashboard.vehicleTasks.forms.save")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <BuildTemplatePicker
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApply={handleApplyTemplate}
      />
    </>
  );
}
