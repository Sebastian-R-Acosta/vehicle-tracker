"use client";

import { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { BUILD_TEMPLATES } from "@/lib/task-priority";

interface TemplateTask {
  title: string;
  category: string;
  urgency: string;
  estimatedCost: number;
  estimatedHours: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  tasks: TemplateTask[];
}

interface BuildTemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onApply: (tasks: TemplateTask[]) => void;
}

export function BuildTemplatePicker({ open, onClose, onApply }: BuildTemplatePickerProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!open) return null;

  const template = selected ? BUILD_TEMPLATES.find((t) => t.id === selected) || null : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Build Path Templates</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {!selected ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {BUILD_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelected(tpl.id)}
                  className="text-left p-4 border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all bg-card"
                >
                  <h4 className="font-semibold text-foreground">{tpl.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{tpl.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{tpl.tasks.length} tasks</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline">&larr; Back to templates</button>
              <h4 className="font-semibold text-foreground text-lg">{template?.name}</h4>
              <p className="text-sm text-muted-foreground">{template?.description}</p>

              <div className="space-y-2">
                {template?.tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.category.replace("_", " ")} &middot; est. ${task.estimatedCost} &middot; {task.estimatedHours}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (template) onApply(template.tasks);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <Check className="w-4 h-4" />
                Add first task from template (you can add the rest after)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
