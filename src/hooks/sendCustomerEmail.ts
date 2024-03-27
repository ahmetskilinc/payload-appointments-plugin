import { CollectionAfterChangeHook } from "payload/types";
import { appointmentCreatedEmail } from "../utilities/AppointmentCreatedEmail";
import { appointmentUpdatedEmail } from "../utilities/AppointmentUpdatedEmail";

export const sendCustomerEmail: CollectionAfterChangeHook = async ({
	doc, // full document data
	req, // full express request
	previousDoc, // document data before updating the collection
	operation, // name of the operation ie. 'create', 'update'
}) => {
	if (doc.appointmentType === "appointment") {
		if (operation === "create") {
			req.payload.sendEmail(appointmentCreatedEmail(doc, previousDoc));
		} else if (operation === "update") {
			req.payload.sendEmail(appointmentUpdatedEmail(doc, previousDoc));
		}
	}
};
