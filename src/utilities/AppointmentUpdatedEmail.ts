import { RenderedEmail } from "../emails/AppointmentUpdatedEmail";
import { Appointment } from "../types";

export const appointmentUpdatedEmail = (doc: Appointment) => {
  return {
    to: doc.customer.email,
    from: "Payload Appointments <ahmet@kilinc.me>",
    html: RenderedEmail({ doc }),
    subject: "Your appointment has been updated.",
  };
};
