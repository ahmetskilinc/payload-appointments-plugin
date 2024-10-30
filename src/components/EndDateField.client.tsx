"use client";

import React, { useEffect, useState } from "react";
import { DateTimeField, TextInputProps } from "@payloadcms/ui";
import { useFormFields } from "@payloadcms/ui";
import { DateFieldClientProps } from "payload";

const EndDateFieldClient = ({ field }: DateFieldClientProps) => {
	const appointmentType = useFormFields(
		([fields, dispatch]) => fields.appointmentType,
	);
	const [readOnly, setReadOnly] = useState(
		appointmentType.value === "appointment",
	);

	useEffect(() => {
		setReadOnly(appointmentType.value === "appointment" ? true : false);
	}, [appointmentType]);

	return <DateTimeField field={field!} />;
};

export default EndDateFieldClient;
