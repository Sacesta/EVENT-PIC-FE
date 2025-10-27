import { format } from 'date-fns';

/**
 * Formats a date to the format required by Google Calendar (YYYYMMDDTHHMMSSZ)
 */
const formatGoogleCalendarDate = (date: Date): string => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

/**
 * Formats a date to the format required by Apple Calendar (.ics format)
 */
const formatICSDate = (date: Date): string => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

/**
 * Generates a Google Calendar URL for an event
 */
export const generateGoogleCalendarUrl = (
  eventName: string,
  startDate: Date,
  endDate: Date,
  location: string,
  description?: string
): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventName,
    dates: `${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}`,
    location: location,
    details: description || '',
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generates an .ics file content for Apple Calendar and other calendar apps
 */
export const generateICSFile = (
  eventName: string,
  startDate: Date,
  endDate: Date,
  location: string,
  description?: string
): string => {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Event Calendar//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${eventName}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description || ''}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
};

/**
 * Downloads an .ics file for Apple Calendar
 */
export const downloadICSFile = (
  eventName: string,
  startDate: Date,
  endDate: Date,
  location: string,
  description?: string
): void => {
  const icsContent = generateICSFile(eventName, startDate, endDate, location, description);

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);
};
