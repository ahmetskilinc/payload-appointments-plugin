import { CollectionAfterChangeHook } from "payload";
import { appointmentCreatedEmail } from "../utilities/AppointmentCreatedEmail";
import { appointmentUpdatedEmail } from "../utilities/AppointmentUpdatedEmail";
import { Appointment } from "../types";

export const sendCustomerEmail: CollectionAfterChangeHook = async ({
	doc, // full document data
	req, // full express request
	operation, // name of the operation ie. 'create', 'update'
}) => {
	if (doc.appointmentType === "appointment") {
		const appointment = await req.payload
			.findByID({
				collection: "appointments",
				id: doc.id,
			})
			.then((res) => {
				return res as Appointment;
			})
			.catch((error: any) => {
				console.error(error);
				return {} as Appointment;
			});

		if (operation === "create") {
			req.payload.sendEmail(appointmentCreatedEmail(appointment));
		} else if (operation === "update") {
			req.payload.sendEmail(appointmentUpdatedEmail(appointment));
		}
	}
};
