import moment from 'moment'

export const formatAppointmentDate = (date: Date | string): string => {
  return moment(date).format('dddd, MMMM D, YYYY [at] h:mm A')
}

export const formatTimeSlot = (time: Date | string): string => {
  return moment(time).format('h:mm A')
}

export const isValidAppointmentDate = (date: Date | string): boolean => {
  const appointmentDate = moment(date)
  const now = moment()

  // Appointment must be at least 30 minutes in the future
  if (appointmentDate.isBefore(now.add(30, 'minutes'))) {
    return false
  }

  // Appointment must be within the next year
  if (appointmentDate.isAfter(now.add(1, 'year'))) {
    return false
  }

  return true
}

export const getDaysBetweenDates = (startDate: Date | string, endDate: Date | string): number => {
  const start = moment(startDate).startOf('day')
  const end = moment(endDate).startOf('day')
  return end.diff(start, 'days')
}
