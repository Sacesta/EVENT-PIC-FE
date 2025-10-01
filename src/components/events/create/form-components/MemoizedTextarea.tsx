import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoizedTextareaProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  minLength?: number;
}

export const MemoizedTextarea = React.memo<MemoizedTextareaProps>(({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  error,
  minLength
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
      {minLength && (
        <span className="text-xs text-muted-foreground ml-2">
          (Min. {minLength} characters)
        </span>
      )}
    </Label>
    <Textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className={cn(
        "resize-none",
        error && "border-red-500 focus-visible:ring-red-500"
      )}
      minLength={minLength}
    />
    {error && (
      <p className="text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
    {minLength && value && (
      <p className={cn(
        "text-xs",
        value.trim().length >= minLength 
          ? "text-green-600 dark:text-green-400" 
          : "text-muted-foreground"
      )}>
        {value.trim().length}/{minLength} characters
      </p>
    )}
  </div>
));

MemoizedTextarea.displayName = 'MemoizedTextarea';
