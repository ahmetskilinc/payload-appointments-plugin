import { SelectField, useConfig, usePayloadAPI } from "@payloadcms/ui";
import { Option, SelectFieldClientProps } from "payload";
import { User } from "../types";

const HostsSelectField = ({ field }: SelectFieldClientProps) => {
	// const options: Option[] = [];

	const {
		config: {
			routes: { api },
			admin,
			serverURL,
		},
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

	return <SelectField field={field} />;
};

export default HostsSelectField;
