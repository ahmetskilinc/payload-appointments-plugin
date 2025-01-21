import moment from "moment";

export const formatAppointmentDate = (date: string | Date): string => {
  return moment(date).format("dddd, MMMM D, YYYY [at] h:mm A");
};

export const formatTimeSlot = (time: string | Date): string => {
  return moment(time).format("h:mm A");
};

export const isValidAppointmentDate = (date: string | Date): boolean => {
  const appointmentDate = moment(date);
  const now = moment();
  
  // Appointment must be at least 30 minutes in the future
  if (appointmentDate.isBefore(now.add(30, "minutes"))) {
    return false;
  }
  
  // Appointment must be within the next year
  if (appointmentDate.isAfter(now.add(1, "year"))) {
    return false;
  }
  
  return true;
};

export const getDaysBetweenDates = (startDate: string | Date, endDate: string | Date): number => {
  const start = moment(startDate).startOf("day");
  const end = moment(endDate).startOf("day");
  return end.diff(start, "days");
};
