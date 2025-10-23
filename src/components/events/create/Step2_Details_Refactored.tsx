
import React, { useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Lock,
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Ticket as TicketIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Step2_DetailsProps, Ticket } from "./types";
import { EVENT_TYPES } from "./constants";
import {
  MemoizedInput,
  MemoizedTextarea,
  MemoizedSelect,
  LocationInput,
  DateTimeSelector,
  ToggleCard,
  TicketsSection,
  ImageUpload,
} from "./form-components";

const Step2_Details: React.FC<Step2_DetailsProps> = ({
  eventData,
  onUpdate,
  onNext,
  onBack,
  isEditMode = false,
}) => {
  const { t, i18n } = useTranslation();
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

  const isDateTimeInPast = useCallback((dateStr: string, timeStr: string): boolean => {
    const now = new Date();
    const dateTime = new Date(`${dateStr}T${timeStr}:00`);
    return dateTime < now;
  }, []);

  const isEndDateTimeAfterStartDateTime = useCallback(
    (
      startDateStr: string,
      startTimeStr: string,
      endDateStr: string,
      endTimeStr: string
    ): boolean => {
      const startDateTime = new Date(`${startDateStr}T${startTimeStr}:00`);
      const endDateTime = new Date(`${endDateStr}T${endTimeStr}:00`);
      return endDateTime > startDateTime;
    },
    []
  );

  // Helper function to extract date in YYYY-MM-DD format from various inputs
  const getNormalizedDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return "";
    
    // If it's already a string in YYYY-MM-DD format, return it
    if (typeof dateValue === "string" && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // If it's an ISO string with time, extract the date part
    if (typeof dateValue === "string" && dateValue.includes("T")) {
      return dateValue.split("T")[0];
    }
    
    // If it's a Date object, convert to YYYY-MM-DD
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split("T")[0];
    }
    
    // Try to parse it as a date
    try {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
      }
    } catch (error) {
      return "";
    }
    
    return "";
  };

  // Updated validateForm
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!eventData.name.trim()) {
      newErrors.name = t("auth.validation.required");
    }

    if (!eventData.startDate) {
      newErrors.startDate = t("auth.validation.required");
    }

    if (!eventData.startTime) {
      newErrors.startTime = t("auth.validation.required");
    }

    if (!eventData.endDate) {
      newErrors.endDate = t("auth.validation.required");
    }

    if (!eventData.endTime) {
      newErrors.endTime = t("auth.validation.required");
    }

    // Normalize dates before validation
    const normalizedStartDate = getNormalizedDate(eventData.startDate);
    const normalizedEndDate = getNormalizedDate(eventData.endDate);

    // Check if start date/time is not in past
    if (normalizedStartDate && eventData.startTime) {
      if (isDateTimeInPast(normalizedStartDate, eventData.startTime)) {
        newErrors.startDate = t("auth.validation.cannotBePast") || "Start date/time cannot be in the past";
        newErrors.startTime = t("auth.validation.cannotBePast") || "Start date/time cannot be in the past";
      }
    }

    // Validate end date/time is after start date/time
    if (normalizedStartDate && normalizedEndDate && eventData.startTime && eventData.endTime) {
      if (
        !isEndDateTimeAfterStartDateTime(
          normalizedStartDate,
          eventData.startTime,
          normalizedEndDate,
          eventData.endTime
        )
      ) {
        newErrors.endDate = t("auth.validation.mustBeAfterStart") || "End date/time must be after start date/time";
        newErrors.endTime = t("auth.validation.mustBeAfterStart") || "End date/time must be after start date/time";
      }
    }

    // Validate date format for start
    if (normalizedStartDate && eventData.startTime) {
      try {
        const startDateTime = new Date(`${normalizedStartDate}T${eventData.startTime}:00`);
        if (isNaN(startDateTime.getTime())) {
          newErrors.startDate = "Invalid start date/time format";
        }
      } catch (error) {
        newErrors.startDate = "Invalid start date/time format";
      }
    }

    // Validate date format for end
    if (normalizedEndDate && eventData.endTime) {
      try {
        const endDateTime = new Date(`${normalizedEndDate}T${eventData.endTime}:00`);
        if (isNaN(endDateTime.getTime())) {
          newErrors.endDate = "Invalid end date/time format";
        }
      } catch (error) {
        newErrors.endDate = "Invalid end date/time format";
      }
    }

    if (!eventData.location.trim()) {
      newErrors.location = t("auth.validation.required");
    }

    if (!eventData.eventType) {
      newErrors.eventType = t("auth.validation.required");
    }

    if (eventData.isPrivate && !eventData.eventPassword?.trim()) {
      newErrors.eventPassword = t("auth.validation.required");
    }

    if (eventData.isPaid && eventData.tickets.length === 0) {
      newErrors.tickets = t("auth.validation.required");
    }

    if (!eventData.isPaid && (!eventData.maxAttendees || eventData.maxAttendees <= 0)) {
      newErrors.maxAttendees = t("auth.validation.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [eventData, t, isDateTimeInPast, isEndDateTimeAfterStartDateTime]);

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

  const handleAddTicket = useCallback((newTicket?: Ticket | Ticket[]) => {
    if (Array.isArray(newTicket)) {
      handleUpdate("tickets", newTicket);
    } else {
      const ticket = newTicket || {
        id: Date.now().toString(),
        name: "",
        quantity: 0,
        price: 0,
      };
      const newTickets = [...eventData.tickets, ticket];
      handleUpdate("tickets", newTickets);
    }
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

  const handleImageChange = useCallback(
    (file: File | null) => {
      handleUpdate("eventImage", file);
    },
    [handleUpdate]
  );

  // Check if form is valid for continue button - optimized with single dependency
  const isFormValid = useMemo(() => {
    return (
      eventData.name.trim() &&
      eventData.startDate &&
      eventData.startTime &&
      eventData.endDate &&
      eventData.endTime &&
      eventData.location.trim() &&
      eventData.eventType &&
      (!eventData.isPrivate || eventData.eventPassword?.trim()) &&
      (eventData.isPaid ? eventData.tickets.length > 0 : (eventData.maxAttendees && eventData.maxAttendees > 0))
    );
  }, [eventData]);




  // Compute min values for date/time inputs
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toISOString().split("T")[1].slice(0, 5);

  console.log("Rendering Step2_Detail222222");
  return (
    <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 text-center pb-4">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {t("createEvent.step2.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("createEvent.step2.subtitle")}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2 -mr-2">
        <div className="space-y-6 pb-4">
          {/* Event Name */}
          <MemoizedInput
            label={t("createEvent.step2.eventName")}
            placeholder={t("createEvent.step2.eventNamePlaceholder")}
            value={eventData.name}
            onChange={handleNameChange}
            required
            error={errors.name}
          />

          {/* Date & Time Selector */}
          <DateTimeSelector
            startDate={eventData.startDate}
            endDate={eventData.endDate}
            startTime={eventData.startTime}
            endTime={eventData.endTime}
            onStartDateChange={(value) => handleUpdate("startDate", value)}
            onEndDateChange={(value) => handleUpdate("endDate", value)}
            onStartTimeChange={(value) => handleUpdate("startTime", value)}
            onEndTimeChange={(value) => handleUpdate("endTime", value)}
            startDateError={errors.startDate}
            endDateError={errors.endDate}
            startTimeError={errors.startTime}
            endTimeError={errors.endTime}
          />

          {/* Event Image */}
          <ImageUpload
            label={t("createEvent.step2.eventImage")}
            value={eventData.eventImage || null}
            onChange={handleImageChange}
          />


          {/* Event Type */}
          <MemoizedSelect
            label={t("createEvent.step2.eventType")}
            placeholder={t("createEvent.step2.selectEventType")}
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

          {/* Event Toggles - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Private Event Toggle */}
            <ToggleCard
              title={t("createEvent.step2.privateEvent")}
              description={t("createEvent.step2.privateEventDesc")}
              icon={Lock}
              isEnabled={eventData.isPrivate}
              onToggle={handlePrivateToggle}
            >
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("createEvent.step2.passwordPlaceholder")}
                  value={eventData.eventPassword || ""}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={errors.eventPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute ltr:right-2 rtl:left-2 top-1/2 transform -translate-y-1/2"
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

            {/* Ticketing Type Toggle */}
            <ToggleCard
              title={
                eventData.isPaid
                  ? t("createEvent.step2.paidTickets")
                  : t("createEvent.step2.freeTickets")
              }
              description={
                eventData.isPaid
                  ? t("createEvent.step2.chargeAttendees")
                  : t("createEvent.step2.noChargeAttendees")
              }
              icon={DollarSign}
              isEnabled={eventData.isPaid}
              onToggle={handlePaidToggle}
            >
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {eventData.isPaid
                    ? t("createEvent.step2.setPricesBelow")
                    : t("createEvent.step2.toggleForPaid")}
                </p>
              </div>
            </ToggleCard>
          </div>

          {/* Tickets Section - Show only for Paid Events */}
          {eventData.isPaid ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {t("createEvent.step2.ticketTypesPricing")} *
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("createEvent.step2.createTicketTiers")}
              </p>
              <TicketsSection
                tickets={eventData.tickets}
                onUpdate={handleUpdateTicket}
                onAdd={handleAddTicket}
                onRemove={handleRemoveTicket}
                isPaid={eventData.isPaid}
              />
              {errors.tickets && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {errors.tickets}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {t("createEvent.step2.maxAttendees")} *
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("createEvent.step2.setMaxAttendees")}
              </p>
              <Input
                type="number"
                min="1"
                placeholder={t("createEvent.step2.maxAttendeesPlaceholder")}
                value={eventData.maxAttendees || ''}
                onChange={(e) => handleUpdate("maxAttendees", parseInt(e.target.value) || 0)}
                className={errors.maxAttendees ? "border-red-500" : ""}
              />
              {errors.maxAttendees && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {errors.maxAttendees}
                </p>
              )}
            </div>
          )}

          {/* Event Description */}
          <MemoizedTextarea
            label={t("createEvent.step2.description")}
            placeholder={t("createEvent.step2.descriptionPlaceholder")}
            value={eventData.description}
            onChange={handleDescriptionChange}
            error={errors.description}
          />
        </div>
      </div>

      {/* Navigation - Fixed at bottom - Hidden in edit mode */}
      {!isEditMode && (
        <div className="flex-shrink-0 flex justify-between pt-4 border-t nav-wrapper-dark">
          <Button variant="outline" onClick={onBack} className="px-8">
            {t("common.back")}
          </Button>
          <Button onClick={handleNext} disabled={!isFormValid} className="px-8">
            {t("createEvent.step2.continue")}
            {isFormValid && <CheckCircle className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      )}
    </div>
  );
};

Step2_Details.displayName = "Step2_Details";

export default Step2_Details;
