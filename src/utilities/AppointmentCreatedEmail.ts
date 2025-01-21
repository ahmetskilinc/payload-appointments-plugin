import { RenderedEmail } from "../emails/AppointmentCreatedEmail";
import { Appointment } from "../types";
import { formatAppointmentDate } from "./formatDate";

export const appointmentCreatedEmail = async (appointment: Appointment) => {
  if (!appointment?.customer?.email) {
    throw new Error("Customer email is required for sending appointment confirmation");
  }

  const formattedDate = formatAppointmentDate(appointment.start);
  const serviceNames = appointment.services.map(service => service.title).join(", ");

  return {
    to: appointment.customer.email,
    from: process.env.APPOINTMENT_EMAIL_FROM || "noreply@yourdomain.com",
    html: await RenderedEmail({ doc: appointment }),
    subject: `Appointment Confirmation - ${formattedDate}`,
    text: `Your appointment for ${serviceNames} has been confirmed for ${formattedDate}.`,
  };
};
