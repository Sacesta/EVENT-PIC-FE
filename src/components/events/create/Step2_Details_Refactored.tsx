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

const Step2_Details: React.FC<Step2_DetailsProps> = React.memo(
  ({ eventData, onUpdate, onNext, onBack, isEditMode = false }) => {
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

    // Validation - only run when needed, not on every render
    const validateForm = useCallback(() => {
      const newErrors: Record<string, string> = {};

      if (!eventData.name.trim()) {
        newErrors.name = t("auth.validation.required");
      }

      if (!eventData.description.trim()) {
        newErrors.description = t("auth.validation.required");
      } else if (eventData.description.trim().length < 10) {
        newErrors.description = "Description must be at least 10 characters";
      }

      if (!eventData.date) {
        newErrors.date = t("auth.validation.required");
      }

      if (eventData.date && !eventData.time) {
        newErrors.time = t("auth.validation.required");
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

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [eventData, t]);

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
        eventData.description.trim() &&
        eventData.description.trim().length >= 10 &&
        eventData.date &&
        eventData.time &&
        eventData.location.trim() &&
        eventData.eventType &&
        (!eventData.isPrivate || eventData.eventPassword?.trim()) &&
        (!eventData.isPaid || eventData.tickets.length > 0)
      );
    }, [eventData]);
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

            {/* Event Image */}
            <ImageUpload
              label={t("createEvent.step2.eventImage")}
              value={eventData.eventImage || null}
              onChange={handleImageChange}
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
                title={eventData.isPaid ? "Paid Tickets" : "Free Tickets"}
                description={eventData.isPaid ? "Charge attendees for entry" : "No charge for attendees"}
                icon={DollarSign}
                isEnabled={eventData.isPaid}
                onToggle={handlePaidToggle}
              >
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {eventData.isPaid 
                      ? "Set ticket prices in the section below"
                      : "Toggle to enable paid ticketing"}
                  </p>
                </div>
              </ToggleCard>
            </div>

            {/* Tickets Section - Always Visible with Default Ticket */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {eventData.isPaid ? "Ticket Types & Pricing *" : "Ticket Types *"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {eventData.isPaid
                  ? "Create ticket tiers with different prices (e.g., VIP, General Admission, Early Bird)"
                  : "Create ticket categories. All tickets are free - no payment required from attendees."}
              </p>
              <TicketsSection
                tickets={eventData.tickets}
                onUpdate={handleUpdateTicket}
                onAdd={handleAddTicket}
                onRemove={handleRemoveTicket}
              />
              {errors.tickets && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {errors.tickets}
                </p>
              )}
            </div>

            {/* Event Description */}
            <MemoizedTextarea
              label={t("createEvent.step2.description")}
              placeholder={t("createEvent.step2.descriptionPlaceholder")}
              value={eventData.description}
              onChange={handleDescriptionChange}
              required
              error={errors.description}
              minLength={10}
            />
          </div>
        </div>

        {/* Navigation - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-between pt-4 border-t bg-background">
          <Button variant="outline" onClick={onBack} className="px-8">
            {t("common.back")}
          </Button>
          <Button onClick={handleNext} disabled={!isFormValid} className="px-8">
            {t("createEvent.step2.continue")}
            {isFormValid && <CheckCircle className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    );
  }
);

Step2_Details.displayName = "Step2_Details";

export default Step2_Details;
