"use client";

import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface SectionLoaderProps {
  message?: string;
}

export function SectionLoader({ message }: SectionLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

interface SectionErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function SectionError({ title, message, onRetry }: SectionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <AlertCircle className="w-8 h-8 text-destructive" />
      {title && <p className="text-sm font-medium text-foreground">{title}</p>}
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}

interface SectionEmptyProps {
  icon?: React.ElementType;
  message: string;
  action?: React.ReactNode;
}

export function SectionEmpty({ icon: Icon, message, action }: SectionEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      {Icon && <Icon className="w-8 h-8 text-muted-foreground" />}
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
