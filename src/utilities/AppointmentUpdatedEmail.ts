import { RenderedEmail } from "../emails/AppointmentUpdatedEmail";
import { Appointment } from "../types";

export const appointmentUpdatedEmail = async (doc: Appointment) => {
  return {
    to: doc.customer.email,
    from: "Payload Appointments <ahmet@kilinc.me>",
    html: await RenderedEmail({ doc }),
    subject: "Your appointment has been updated.",
  };
};
