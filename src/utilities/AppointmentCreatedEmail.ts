import { RenderedEmail } from "../emails/AppointmentCreatedEmail";
import { Appointment } from "../types";

export const appointmentCreatedEmail = (doc: Appointment) => {
  return {
    to: doc.customer.email,
    from: "Payload Appointments <ahmet@kilinc.me>",
    html: RenderedEmail({ doc }),
    subject: "Your appointment has been booked.",
  };
};
