import React from 'react';
import { AlertCircle, LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MemoizedInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  icon?: LucideIcon;
  error?: string;
  min?: string;
}

export const MemoizedInput = React.memo<MemoizedInputProps>(({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  type = 'text',
  icon: Icon,
  error,
  min
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      )}
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className={cn(
          Icon ? "pl-10" : "",
          error ? "border-red-500 focus:border-red-500" : ""
        )}
      />
    </div>
    {error && (
      <p className="text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
));

MemoizedInput.displayName = 'MemoizedInput';
