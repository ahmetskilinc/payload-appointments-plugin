import React, { useEffect, useState } from "react";
import Select from "payload/dist/admin/components/forms/field-types/Select";
import { Props } from "payload/dist/admin/components/forms/field-types/Select/types";
import { useFormFields } from "payload/components/forms";
import { Option } from "payload/types";
import { usePayloadAPI } from "payload/components/hooks";
import { useConfig } from "payload/components/utilities";
import { User } from "../types";

const HostsSelectField = ({ name, label, access, defaultValue, path, required }: Props) => {
	// const options: Option[] = [];

	const {
		routes: { api },
		admin,
		serverURL,
	} = useConfig();

	const [
		{
			data: { docs: users },
		},
	] = usePayloadAPI(`${serverURL}${api}/${admin.user}`);

	const options = users.map((user: User) => {
		return {
			value: user.id,
			label: user.email,
		};
	});

	return (
		<Select
			name={name}
			label={label}
			access={access}
			defaultValue={defaultValue}
			path={path}
			options={options}
			required={required}
		/>
	);
};

export default HostsSelectField;
