import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TIME_SLOTS } from '../constants';

interface DateTimeSelectorProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateError?: string;
  timeError?: string;
}

export const DateTimeSelector = React.memo<DateTimeSelectorProps>(({ 
  date, 
  time, 
  onDateChange, 
  onTimeChange, 
  dateError, 
  timeError 
}) => {
  const { t } = useTranslation();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const selectedDate = useMemo(() => date ? new Date(date) : undefined, [date]);
  const today = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return todayDate;
  }, []);

  const now = useMemo(() => new Date(), []);

  // Check if selected date is today
  const isToday = useMemo(() => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  }, [selectedDate, today]);

  // Filter time slots to only show future times if today is selected
  const availableTimeSlots = useMemo(() => {
    if (!isToday) {
      return TIME_SLOTS;
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return TIME_SLOTS.filter(timeSlot => {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotTime = hours * 60 + minutes;
      const currentTime = currentHour * 60 + currentMinute;
      
      // Only show time slots that are at least 30 minutes in the future
      return slotTime > currentTime + 30;
    });
  }, [isToday, now]);

  const handleCalendarSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate.toISOString());
      setIsCalendarOpen(false);
      
      // If selecting today and current time is already selected, clear it
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      if (selected.getTime() === today.getTime() && time) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = hours * 60 + minutes;
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        if (slotTime <= currentTime + 30) {
          onTimeChange('');
        }
      }
    }
  }, [onDateChange, today, time, now, onTimeChange]);

  const handleCalendarOpen = useCallback((open: boolean) => {
    setIsCalendarOpen(open);
  }, []);

  const disabledDateCheck = useCallback((date: Date) => date < today, [today]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Date Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t('createEvent.step2.date')} <span className="text-red-500">*</span>
        </Label>
        <Popover open={isCalendarOpen} onOpenChange={handleCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
                dateError ? "border-red-500" : ""
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date && selectedDate ? format(selectedDate, "PPP") : t('createEvent.step2.pickDate')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              disabled={disabledDateCheck}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {dateError && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {dateError}
          </p>
        )}
      </div>

      {/* Time Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t('createEvent.step2.time')} {date && <span className="text-red-500">*</span>}
        </Label>
        <Select 
          value={time} 
          onValueChange={onTimeChange}
          disabled={!date}
        >
          <SelectTrigger className={cn(
            timeError ? "border-red-500" : "",
            !date ? "opacity-50" : ""
          )}>
            <Clock className="mr-2 h-4 w-4" />
            <SelectValue placeholder={date ? t('createEvent.step2.selectTime') : t('createEvent.step2.pickDate')} />
          </SelectTrigger>
          <SelectContent>
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((timeSlot) => (
                <SelectItem key={timeSlot} value={timeSlot}>
                  {timeSlot}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No available time slots for today. Please select a future date.
              </div>
            )}
          </SelectContent>
        </Select>
        {timeError && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {timeError}
          </p>
        )}
        {isToday && availableTimeSlots.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Only future time slots are available for today
          </p>
        )}
      </div>
    </div>
  );
});

DateTimeSelector.displayName = 'DateTimeSelector';
