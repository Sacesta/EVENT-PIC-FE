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
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  startDateError?: string;
  endDateError?: string;
  startTimeError?: string;
  endTimeError?: string;
}

export const DateTimeSelector = React.memo<DateTimeSelectorProps>(({ 
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  startDateError,
  endDateError,
  startTimeError,
  endTimeError
}) => {
  const { t } = useTranslation();
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  
  const selectedStartDate = useMemo(() => startDate ? new Date(startDate) : undefined, [startDate]);
  const selectedEndDate = useMemo(() => endDate ? new Date(endDate) : undefined, [endDate]);
  
  const today = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return todayDate;
  }, []);

  const now = useMemo(() => new Date(), []);

  // Check if selected start date is today
  const isStartToday = useMemo(() => {
    if (!selectedStartDate) return false;
    const selected = new Date(selectedStartDate);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  }, [selectedStartDate, today]);

  // Check if start and end dates are the same day
  const isSameDay = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return start.getTime() === end.getTime();
  }, [selectedStartDate, selectedEndDate]);

  // Filter start time slots to only show future times if today is selected
  const availableStartTimeSlots = useMemo(() => {
    if (!isStartToday) {
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
  }, [isStartToday, now]);

  // Filter end time slots based on start time if same day
  const availableEndTimeSlots = useMemo(() => {
    if (!isSameDay || !startTime) {
      return TIME_SLOTS;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;

    return TIME_SLOTS.filter(timeSlot => {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotTime = hours * 60 + minutes;
      
      // End time must be at least 30 minutes after start time
      return slotTime > startTimeInMinutes + 30;
    });
  }, [isSameDay, startTime]);

  const handleStartCalendarSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      onStartDateChange(selectedDate.toISOString());
      setIsStartCalendarOpen(false);
      
      // If selecting today and current time is already selected, clear it
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      if (selected.getTime() === today.getTime() && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const slotTime = hours * 60 + minutes;
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        if (slotTime <= currentTime + 30) {
          onStartTimeChange('');
        }
      }

      // If end date is before new start date, clear end date
      if (endDate) {
        const newStart = new Date(selectedDate);
        const currentEnd = new Date(endDate);
        newStart.setHours(0, 0, 0, 0);
        currentEnd.setHours(0, 0, 0, 0);
        
        if (currentEnd < newStart) {
          onEndDateChange('');
          onEndTimeChange('');
        }
      }
    }
  }, [onStartDateChange, today, startTime, now, onStartTimeChange, endDate, onEndDateChange, onEndTimeChange]);

  const handleEndCalendarSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      onEndDateChange(selectedDate.toISOString());
      setIsEndCalendarOpen(false);
    }
  }, [onEndDateChange]);

  const handleStartCalendarOpen = useCallback((open: boolean) => {
    setIsStartCalendarOpen(open);
  }, []);

  const handleEndCalendarOpen = useCallback((open: boolean) => {
    setIsEndCalendarOpen(open);
  }, []);

  const disabledStartDateCheck = useCallback((date: Date) => date < today, [today]);
  
  const disabledEndDateCheck = useCallback((date: Date) => {
    if (!selectedStartDate) return date < today;
    const start = new Date(selectedStartDate);
    start.setHours(0, 0, 0, 0);
    return date < start;
  }, [selectedStartDate, today]);

  return (
    <div className="space-y-6">
      {/* Event Duration Section */}
      <div className="space-y-4">
        {/* Start Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              {t('createEvent.step2.startDate')} <span className="text-red-500">*</span>
            </Label>
            <Popover open={isStartCalendarOpen} onOpenChange={handleStartCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12",
                    !startDate && "text-muted-foreground",
                    startDateError ? "border-red-500" : ""
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm">
                      {startDate && selectedStartDate ? format(selectedStartDate, "PPP") : t('createEvent.step2.pickStartDate')}
                    </span>
                    {startDate && (
                      <span className="text-xs text-muted-foreground">
                        {format(selectedStartDate!, "EEEE")}
                      </span>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedStartDate}
                  onSelect={handleStartCalendarSelect}
                  disabled={disabledStartDateCheck}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {startDateError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {startDateError}
              </p>
            )}
          </div>

          {/* Start Time Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {t('createEvent.step2.startTime')} {startDate && <span className="text-red-500">*</span>}
            </Label>
            <Select 
              value={startTime} 
              onValueChange={onStartTimeChange}
              disabled={!startDate}
            >
              <SelectTrigger className={cn(
                "h-12",
                startTimeError ? "border-red-500" : "",
                !startDate ? "opacity-50" : ""
              )}>
                <Clock className="mr-3 h-5 w-5 text-primary" />
                <SelectValue placeholder={startDate ? t('createEvent.step2.selectStartTime') : t('createEvent.step2.pickStartDate')} />
              </SelectTrigger>
              <SelectContent>
                {availableStartTimeSlots.length > 0 ? (
                  availableStartTimeSlots.map((timeSlot) => (
                    <SelectItem key={timeSlot} value={timeSlot} className="py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{timeSlot}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    {t('createEvent.step2.noTimeSlotsAvailable')}
                  </div>
                )}
              </SelectContent>
            </Select>
            {startTimeError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {startTimeError}
              </p>
            )}
            {isStartToday && availableStartTimeSlots.length > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {t('createEvent.step2.onlyFutureTimesAvailable')}
              </p>
            )}
          </div>
        </div>

        {/* Visual Separator */}
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-px bg-border"></div>
            <span className="text-xs font-medium px-2">TO</span>
            <div className="w-8 h-px bg-border"></div>
          </div>
        </div>

        {/* End Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* End Date Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              {t('createEvent.step2.endDate')} <span className="text-red-500">*</span>
            </Label>
            <Popover open={isEndCalendarOpen} onOpenChange={handleEndCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!startDate}
                  className={cn(
                    "w-full justify-start text-left font-normal h-12",
                    !endDate && "text-muted-foreground",
                    endDateError ? "border-red-500" : "",
                    !startDate ? "opacity-50" : ""
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm">
                      {endDate && selectedEndDate ? format(selectedEndDate, "PPP") : t('createEvent.step2.pickEndDate')}
                    </span>
                    {endDate && (
                      <span className="text-xs text-muted-foreground">
                        {format(selectedEndDate!, "EEEE")}
                      </span>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedEndDate}
                  onSelect={handleEndCalendarSelect}
                  disabled={disabledEndDateCheck}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {endDateError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {endDateError}
              </p>
            )}
          </div>

          {/* End Time Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {t('createEvent.step2.endTime')} {endDate && <span className="text-red-500">*</span>}
            </Label>
            <Select 
              value={endTime} 
              onValueChange={onEndTimeChange}
              disabled={!endDate}
            >
              <SelectTrigger className={cn(
                "h-12",
                endTimeError ? "border-red-500" : "",
                !endDate ? "opacity-50" : ""
              )}>
                <Clock className="mr-3 h-5 w-5 text-primary" />
                <SelectValue placeholder={endDate ? t('createEvent.step2.selectEndTime') : t('createEvent.step2.pickEndDate')} />
              </SelectTrigger>
              <SelectContent>
                {availableEndTimeSlots.length > 0 ? (
                  availableEndTimeSlots.map((timeSlot) => (
                    <SelectItem key={timeSlot} value={timeSlot} className="py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{timeSlot}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    {isSameDay 
                      ? t('createEvent.step2.endTimeMustBeAfterStart')
                      : t('createEvent.step2.noTimeSlotsAvailable')
                    }
                  </div>
                )}
              </SelectContent>
            </Select>
            {endTimeError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {endTimeError}
              </p>
            )}
            {isSameDay && availableEndTimeSlots.length > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {t('createEvent.step2.endTimeMustBeAfterStartTime')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

DateTimeSelector.displayName = 'DateTimeSelector';
