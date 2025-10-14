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

interface DateTimeFieldsProps {
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

export const DateTimeFields = React.memo<DateTimeFieldsProps>(({
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

  // Check if selected date is today
  const isStartToday = useMemo(() => {
    if (!selectedStartDate) return false;
    const selected = new Date(selectedStartDate);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  }, [selectedStartDate, today]);

  const isEndToday = useMemo(() => {
    if (!selectedEndDate) return false;
    const selected = new Date(selectedEndDate);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  }, [selectedEndDate, today]);

  // Filter time slots to only show future times if today is selected
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

  const availableEndTimeSlots = useMemo(() => {
    if (!isEndToday) {
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
  }, [isEndToday, now]);

  const handleStartCalendarSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      onStartDateChange(selectedDate.toISOString());
      setIsStartCalendarOpen(false);
    }
  }, [onStartDateChange]);

  const handleEndCalendarSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      onEndDateChange(selectedDate.toISOString());
      setIsEndCalendarOpen(false);
    }
  }, [onEndDateChange]);

  const disabledStartDateCheck = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, []);

  const disabledEndDateCheck = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, []);

  return (
    <div className="space-y-4">
      {/* Start Date & Time Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('createEvent.step2.startDate')} <span className="text-red-500">*</span>
          </Label>
          <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                  startDateError && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate && selectedStartDate ? format(selectedStartDate, "PPP") : t('createEvent.step2.pickStartDate')}
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

        {/* Start Time */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('createEvent.step2.startTime')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={startTime}
            onValueChange={onStartTimeChange}
            disabled={!startDate}
          >
            <SelectTrigger className={cn(
              startTimeError ? "border-red-500" : "",
              !startDate ? "opacity-50" : ""
            )}>
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder={startDate ? t('createEvent.step2.selectStartTime') : t('createEvent.step2.pickStartDate')} />
            </SelectTrigger>
            <SelectContent>
              {availableStartTimeSlots.length > 0 ? (
                availableStartTimeSlots.map((timeSlot) => (
                  <SelectItem key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">
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
            <p className="text-xs text-muted-foreground">
              {t('createEvent.step2.onlyFutureTimesAvailable')}
            </p>
          )}
        </div>
      </div>

      {/* End Date & Time Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* End Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('createEvent.step2.endDate')} <span className="text-red-500">*</span>
          </Label>
          <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                  endDateError && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate && selectedEndDate ? format(selectedEndDate, "PPP") : t('createEvent.step2.pickEndDate')}
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

        {/* End Time */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('createEvent.step2.endTime')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={endTime}
            onValueChange={onEndTimeChange}
            disabled={!endDate}
          >
            <SelectTrigger className={cn(
              endTimeError ? "border-red-500" : "",
              !endDate ? "opacity-50" : ""
            )}>
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder={endDate ? t('createEvent.step2.selectEndTime') : t('createEvent.step2.pickEndDate')} />
            </SelectTrigger>
            <SelectContent>
              {availableEndTimeSlots.length > 0 ? (
                availableEndTimeSlots.map((timeSlot) => (
                  <SelectItem key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  {t('createEvent.step2.noTimeSlotsAvailable')}
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
          {isEndToday && availableEndTimeSlots.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('createEvent.step2.onlyFutureTimesAvailable')}
            </p>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {startDate && startTime && endDate && endTime && (
        <div className="text-xs text-muted-foreground">
          {t('createEvent.step2.endTimeMustBeAfterStart')}
        </div>
      )}
    </div>
  );
});

DateTimeFields.displayName = 'DateTimeFields';
