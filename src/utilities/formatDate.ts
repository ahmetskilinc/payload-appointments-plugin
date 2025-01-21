import { format, addMinutes, addYears, differenceInDays, isBefore, isAfter, startOfDay } from "date-fns";

export const formatAppointmentDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "EEEE, MMMM d, yyyy 'at' h:mm a");
};

export const formatTimeSlot = (time: string | Date): string => {
  const dateObj = typeof time === "string" ? new Date(time) : time;
  return format(dateObj, "h:mm a");
};

export const isValidAppointmentDate = (date: string | Date): boolean => {
  const appointmentDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  // Appointment must be at least 30 minutes in the future
  const minTime = addMinutes(now, 30);
  if (isBefore(appointmentDate, minTime)) {
    return false;
  }

  // Appointment must be within the next year
  const maxTime = addYears(now, 1);
  if (isAfter(appointmentDate, maxTime)) {
    return false;
  }

  return true;
};

export const getDaysBetweenDates = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  return differenceInDays(startOfDay(end), startOfDay(start));
};
