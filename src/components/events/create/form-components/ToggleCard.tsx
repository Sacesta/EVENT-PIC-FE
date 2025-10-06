import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ToggleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
}

export const ToggleCard = React.memo<ToggleCardProps>(({ 
  title, 
  description, 
  icon: Icon, 
  isEnabled, 
  onToggle, 
  children 
}) => (
  <Card className={cn(
    "transition-all duration-200 overflow-hidden",
    isEnabled ? "ring-2 ring-primary border-primary bg-primary/5" : ""
  )}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between gap-3 rtl:flex-row-reverse">
        <div className="flex items-center gap-3 rtl:flex-row-reverse flex-1 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            isEnabled ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-600"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="rtl:text-right flex-1 min-w-0">
            <CardTitle className="text-base truncate">{title}</CardTitle>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          </div>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onToggle} className="flex-shrink-0" />
      </div>
    </CardHeader>
    {isEnabled && children && (
      <CardContent className="pt-0">
        {children}
      </CardContent>
    )}
  </Card>
));

ToggleCard.displayName = 'ToggleCard';
