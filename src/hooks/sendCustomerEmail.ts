import { CollectionAfterChangeHook } from "payload";
import { appointmentCreatedEmail } from "../utilities/AppointmentCreatedEmail";
import { appointmentUpdatedEmail } from "../utilities/AppointmentUpdatedEmail";
import { Appointment } from "../types";

export const sendCustomerEmail: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  if (doc.appointmentType !== "appointment") {
    return;
  }

  try {
    const appointment = await req.payload.findByID({
      collection: "appointments",
      id: doc.id,
      depth: 2 // To populate customer and host relationships
    }) as Appointment;

    const emailTemplate = operation === "create" 
      ? await appointmentCreatedEmail(appointment)
      : operation === "update"
        ? await appointmentUpdatedEmail(appointment)
        : null;

    if (emailTemplate) {
      await req.payload.sendEmail(emailTemplate);
    }
  } catch (error) {
    req.payload.logger.error(`Error sending ${operation} email: ${error}`);
  }
};
