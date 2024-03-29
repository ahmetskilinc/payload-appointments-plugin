import { CollectionAfterChangeHook } from "payload/types";
import { appointmentCreatedEmail } from "../utilities/AppointmentCreatedEmail";
import { appointmentUpdatedEmail } from "../utilities/AppointmentUpdatedEmail";
import { Appointment, Customer } from "../types";

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
			.then((res: Appointment) => {
				return res;
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
