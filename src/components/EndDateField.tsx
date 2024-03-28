import React, { useEffect, useState } from "react";
import DateTime from "payload/dist/admin/components/forms/field-types/DateTime";
import { Props } from "payload/dist/admin/components/forms/field-types/DateTime/types";
import { useFormFields } from "payload/components/forms";

const EndDateField = ({ name, label, access, defaultValue, path, admin: adminProp }: Props) => {
	const appointmentType = useFormFields(([fields, dispatch]) => fields.appointmentType);
	const [readOnly, setReadOnly] = useState(appointmentType.value === "appointment");

	useEffect(() => {
		setReadOnly(appointmentType.value === "appointment" ? true : false);
	}, [appointmentType]);

	const admin = {
		...adminProp,
		readOnly,
	};

	return (
		<DateTime
			name={name}
			label={label}
			access={access}
			defaultValue={defaultValue}
			path={path}
			admin={admin}
		/>
	);
};

export default EndDateField;
