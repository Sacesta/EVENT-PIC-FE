import React, { useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Lock,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Ticket,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Types
interface Ticket {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface EventData {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  eventType: string;
  isPrivate: boolean;
  eventPassword: string;
  isPaid: boolean;
  isFree: boolean;
  freeTicketLimit: number;
  tickets: Ticket[];
  services: string[];
  selectedSuppliers: { [service: string]: { [supplierId: string]: string[] } };
  specialRequests: string;
  currentTab: string;
}

interface Step2_DetailsProps {
  eventData: EventData;
  onUpdate: (field: string, value: unknown) => void;
  onNext: () => void;
  onBack: () => void;
}

// Import constants from the constants file
import { EVENT_TYPES, POPULAR_LOCATIONS } from './constants';
import { TicketsSection } from './form-components/TicketsSection';

// Time slots - moved outside component
const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

// Memoized Input Component
const MemoizedInput = React.memo<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  icon?: any;
  error?: string;
}>(
  ({
    label,
    placeholder,
    value,
    onChange,
    required = false,
    type = "text",
    icon: Icon,
    error,
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
  )
);

// Memoized Textarea Component
const MemoizedTextarea = React.memo<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}>(({ label, placeholder, value, onChange, required = false }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="resize-none"
    />
  </div>
));

// Memoized Select Component
const MemoizedSelect = React.memo<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; labelKey: string }>;
  required?: boolean;
  error?: string;
}>(
  ({
    label,
    placeholder,
    value,
    onChange,
    options,
    required = false,
    error,
  }) => {
    const { t } = useTranslation();
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

// Location Input Component
const LocationInput = React.memo<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
}>(({ value, onChange, error }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {t('createEvent.step2.location')} <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={t('createEvent.step2.locationPlaceholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("pl-10", error ? "border-red-500" : "")}
        />
      </div>

      {/* Popular Locations */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">{t('createEvent.step2.popular')}</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_LOCATIONS.map((location) => (
            <Button
              key={location.value}
              variant="outline"
              size="sm"
              onClick={() => onChange(t(location.labelKey))}
              className="text-xs h-7"
            >
              {t(location.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
});

// Date Time Selector Component
const DateTimeSelector = React.memo<{
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateError?: string;
  timeError?: string;
}>(({ date, time, onDateChange, onTimeChange, dateError, timeError }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const selectedDate = useMemo(
    () => (date ? new Date(date) : undefined),
    [date]
  );
  const today = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return todayDate;
  }, []);

  const handleCalendarSelect = useCallback(
    (selectedDate: Date | undefined) => {
      if (selectedDate) {
        onDateChange(selectedDate.toISOString());
        setIsCalendarOpen(false);
      }
    },
    [onDateChange]
  );

  const handleCalendarOpen = useCallback((open: boolean) => {
    setIsCalendarOpen(open);
  }, []);

  const disabledDateCheck = useCallback((date: Date) => date < today, [today]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Date Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Event Date <span className="text-red-500">*</span>
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
              {date && selectedDate
                ? format(selectedDate, "PPP")
                : "Select date"}
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
          Event Time {date && <span className="text-red-500">*</span>}
        </Label>
        <Select value={time} onValueChange={onTimeChange} disabled={!date}>
          <SelectTrigger
            className={cn(
              timeError ? "border-red-500" : "",
              !date ? "opacity-50" : ""
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            <SelectValue
              placeholder={date ? "Select time" : "Select date first"}
            />
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((timeSlot) => (
              <SelectItem key={timeSlot} value={timeSlot}>
                {timeSlot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {timeError && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {timeError}
          </p>
        )}
      </div>
    </div>
  );
});

// Toggle Card Component
const ToggleCard = React.memo<{
  title: string;
  description: string;
  icon: any;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
}>(({ title, description, icon: Icon, isEnabled, onToggle, children }) => (
  <Card
    className={cn(
      "transition-all duration-200",
      isEnabled ? "ring-2 ring-primary border-primary bg-primary/5" : ""
    )}
  >
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isEnabled
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-600"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      </div>
    </CardHeader>
    {isEnabled && children && (
      <CardContent className="pt-0">{children}</CardContent>
    )}
  </Card>
));

// Ticket Item Component
const TicketItem = React.memo<{
  ticket: Ticket;
  onUpdate: (id: string, updates: Partial<Ticket>) => void;
  onRemove: (id: string) => void;
}>(({ ticket, onUpdate, onRemove }) => {
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(ticket.id, { name: e.target.value });
    },
    [ticket.id, onUpdate]
  );

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        onUpdate(ticket.id, { quantity: 0 });
      } else {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
          onUpdate(ticket.id, { quantity: numValue });
        }
      }
    },
    [ticket.id, onUpdate]
  );

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        onUpdate(ticket.id, { price: 0 });
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          onUpdate(ticket.id, { price: numValue });
        }
      }
    },
    [ticket.id, onUpdate]
  );

  const handleRemove = useCallback(() => {
    onRemove(ticket.id);
  }, [ticket.id, onRemove]);

  const totalRevenue = useMemo(() => {
    return ((ticket.quantity || 0) * (ticket.price || 0)).toFixed(2);
  }, [ticket.quantity, ticket.price]);

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="font-medium">Ticket Type</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-gray-500">Ticket Name</Label>
            <Input
              placeholder="e.g., General Admission"
              value={ticket.name}
              onChange={handleNameChange}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Quantity</Label>
            <Input
              type="number"
              min="1"
              placeholder="100"
              value={ticket.quantity === 0 ? "" : ticket.quantity}
              onChange={handleQuantityChange}
              onBlur={(e) => {
                if (e.target.value === "") {
                  onUpdate(ticket.id, { quantity: 0 });
                }
              }}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Price (₪)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="50.00"
              value={ticket.price === 0 ? "" : ticket.price}
              onChange={handlePriceChange}
              onBlur={(e) => {
                if (e.target.value === "") {
                  onUpdate(ticket.id, { price: 0 });
                }
              }}
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          Total Revenue: ₪{totalRevenue}
        </div>
      </div>
    </Card>
  );
});


// Main Component
const Step2_Details: React.FC<Step2_DetailsProps> = ({
  eventData,
  onUpdate,
  onNext,
  onBack,
}) => {
  console.log("Rendering Step2_Details");
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use ref to avoid recreating errors object unnecessarily
  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  // Stable callback references
  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const clearMultipleErrors = useCallback((fields: string[]) => {
    setErrors((prev) => {
      const hasAnyError = fields.some((field) => prev[field]);
      if (hasAnyError) {
        const newErrors = { ...prev };
        fields.forEach((field) => delete newErrors[field]);
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!eventData.name.trim()) {
      newErrors.name = "Event name is required";
    }

    if (!eventData.date) {
      newErrors.date = "Event date is required";
    }

    if (eventData.date && !eventData.time) {
      newErrors.time = "Event time is required when date is selected";
    }

    if (!eventData.location.trim()) {
      newErrors.location = "Event location is required";
    }

    if (!eventData.eventType) {
      newErrors.eventType = "Event type is required";
    }

    if (eventData.isPrivate && !eventData.eventPassword?.trim()) {
      newErrors.eventPassword = "Password is required for private events";
    }

    if (eventData.isPaid && eventData.tickets.length === 0) {
      newErrors.tickets =
        "At least one ticket type is required for paid events";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    eventData.name,
    eventData.date,
    eventData.time,
    eventData.location,
    eventData.eventType,
    eventData.isPrivate,
    eventData.eventPassword,
    eventData.isPaid,
    eventData.tickets.length,
  ]);

  // Memoized handlers
  const handleUpdate = useCallback(
    (field: string, value: unknown) => {
      onUpdate(field, value);
      clearError(field);
    },
    [onUpdate, clearError]
  );

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handlePrivateToggle = useCallback(
    (enabled: boolean) => {
      handleUpdate("isPrivate", enabled);
      if (!enabled) {
        handleUpdate("eventPassword", "");
      }
    },
    [handleUpdate]
  );

  const handlePaidToggle = useCallback(
    (enabled: boolean) => {
      handleUpdate("isPaid", enabled);
      if (!enabled) {
        handleUpdate("tickets", []);
      }
    },
    [handleUpdate]
  );

  const handleAddTicket = useCallback(() => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      name: "",
      quantity: 0,
      price: 0,
    };
    const newTickets = [...eventData.tickets, newTicket];
    handleUpdate("tickets", newTickets);
  }, [eventData.tickets, handleUpdate]);

  const handleUpdateTicket = useCallback(
    (id: string, updates: Partial<Ticket>) => {
      const updatedTickets = eventData.tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, ...updates } : ticket
      );
      handleUpdate("tickets", updatedTickets);
    },
    [eventData.tickets, handleUpdate]
  );

  const handleRemoveTicket = useCallback(
    (id: string) => {
      const updatedTickets = eventData.tickets.filter(
        (ticket) => ticket.id !== id
      );
      handleUpdate("tickets", updatedTickets);
    },
    [eventData.tickets, handleUpdate]
  );

  const handleNext = useCallback(() => {
    if (validateForm()) {
      onNext();
    }
  }, [validateForm, onNext]);

  // Memoized field update handlers
  const handleNameChange = useCallback(
    (value: string) => {
      handleUpdate("name", value);
    },
    [handleUpdate]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      handleUpdate("description", value);
    },
    [handleUpdate]
  );

  const handleDateChange = useCallback(
    (value: string) => {
      handleUpdate("date", value);
    },
    [handleUpdate]
  );

  const handleTimeChange = useCallback(
    (value: string) => {
      handleUpdate("time", value);
    },
    [handleUpdate]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      handleUpdate("location", value);
    },
    [handleUpdate]
  );

  const handleEventTypeChange = useCallback(
    (value: string) => {
      handleUpdate("eventType", value);
    },
    [handleUpdate]
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      handleUpdate("eventPassword", value);
    },
    [handleUpdate]
  );

  // Check if form is valid for continue button
  const isFormValid = useMemo(() => {
    return (
      eventData.name.trim() &&
      eventData.date &&
      eventData.time &&
      eventData.location.trim() &&
      eventData.eventType &&
      (!eventData.isPrivate || eventData.eventPassword?.trim()) &&
      (!eventData.isPaid || eventData.tickets.length > 0)
    );
  }, [
    eventData.name,
    eventData.date,
    eventData.time,
    eventData.location,
    eventData.eventType,
    eventData.isPrivate,
    eventData.eventPassword,
    eventData.isPaid,
    eventData.tickets.length,
  ]);

  return (
    <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 text-center pb-4">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {t('createEvent.step2.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('createEvent.step2.subtitle')}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2 -mr-2">
        <div className="space-y-6 pb-4">
          {/* Event Name */}
          <MemoizedInput
            label={t('createEvent.step2.eventName')}
            placeholder={t('createEvent.step2.eventNamePlaceholder')}
            value={eventData.name}
            onChange={handleNameChange}
            required
            error={errors.name}
          />

          {/* Date & Time */}
          <DateTimeSelector
            date={eventData.date}
            time={eventData.time}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            dateError={errors.date}
            timeError={errors.time}
          />

          {/* Event Type */}
          <MemoizedSelect
            label={t('createEvent.step2.eventType')}
            placeholder={t('createEvent.step2.selectEventType')}
            value={eventData.eventType}
            onChange={handleEventTypeChange}
            options={EVENT_TYPES}
            required
            error={errors.eventType}
          />

          {/* Location */}
          <LocationInput
            value={eventData.location}
            onChange={handleLocationChange}
            error={errors.location}
          />

          {/* Private Event, Free Event, and Paid Event Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Private Event Toggle */}
            <ToggleCard
              title={t('createEvent.step2.privateEvent')}
              description={t('createEvent.step2.privateEventDesc')}
              icon={Lock}
              isEnabled={eventData.isPrivate}
              onToggle={handlePrivateToggle}
            >
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('createEvent.step2.passwordPlaceholder')}
                  value={eventData.eventPassword || ""}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={errors.eventPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={handleTogglePassword}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {errors.eventPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {errors.eventPassword}
                </p>
              )}
            </ToggleCard>

            {/* Free Event Toggle */}
            <ToggleCard
              title="Free Event"
              description="Tickets are free for this event"
              icon={Ticket}
              isEnabled={eventData.isFree || false}
              onToggle={(enabled) => {
                handleUpdate("isFree", enabled);
                if (enabled) {
                  // Disable paid event when free event is enabled
                  handleUpdate("isPaid", false);
                  handleUpdate("tickets", []);
                }
              }}
            >
              <div className="space-y-2">
                <Label className="text-sm font-medium">Set Ticket Limit</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 100"
                  value={eventData.freeTicketLimit || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleUpdate("freeTicketLimit", 0);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        handleUpdate("freeTicketLimit", numValue);
                      }
                    }
                  }}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of free tickets available
                </p>
              </div>
            </ToggleCard>
          </div>

          {/* Paid Event Toggle - Full Width */}
          {!eventData.isFree && (
            <ToggleCard
              title={t('createEvent.step2.paidEvent')}
              description={t('createEvent.step2.paidEventDesc')}
              icon={DollarSign}
              isEnabled={eventData.isPaid}
              onToggle={handlePaidToggle}
            >
              <TicketsSection
                tickets={eventData.tickets}
                onUpdate={handleUpdateTicket}
                onAdd={handleAddTicket}
                onRemove={handleRemoveTicket}
                disabled={!eventData.isPaid}
              />
              {errors.tickets && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {errors.tickets}
                </p>
              )}
            </ToggleCard>
          )}

          {/* Event Description */}
          <MemoizedTextarea
            label={t('createEvent.step2.description')}
            placeholder={t('createEvent.step2.descriptionPlaceholder')}
            value={eventData.description}
            onChange={handleDescriptionChange}
          />
        </div>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="flex-shrink-0 flex justify-between pt-4 border-t bg-background">
        <Button variant="outline" onClick={onBack} className="px-8">
          {t('common.back')}
        </Button>
        <Button onClick={handleNext} disabled={!isFormValid} className="px-8">
          {t('createEvent.step2.continue')}
          {isFormValid && <CheckCircle className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};

export default Step2_Details;
