"use client";

import { Button, Form, FormSubmit, Modal } from "@payloadcms/ui";
import { useAppointments } from "../providers/AppointmentsProvider";
import "./AppointmentModal.scss";

const baseClass = "add-edit-appointment";

export const AppointmentModal = () => {
	const { addAppointment, editAppointment, removeAppointment } =
		useAppointments();

	async function submit(data: any) {
		try {
			// if (modalProps.props.type === "edit") {
			// 	editAppointment(data);
			// 	return;
			// }
			// addAppointment(data);
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<Modal className={baseClass} slug="add-edit-appointment">
			<div className={`${baseClass}__wrapper`}>
				<div className={`${baseClass}__content`}>
					<h1>Add/Edit appointment</h1>
				</div>
				<Form onSubmit={submit}>
					<p>Hello World</p>
				</Form>
			</div>
		</Modal>
	);
};
