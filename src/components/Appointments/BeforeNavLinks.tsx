import React from "react";
import { Button, NavGroup } from "payload/components/elements";
import { useConfig } from "payload/components/utilities";

type Props = {};

const BeforeNavLinks = (props: Props) => {
	const currentPath = "";

	const {
		routes: { admin: adminRoute },
	} = useConfig();

	const links = [
		{
			title: "Appointments Schedule",
			url: "/appointments-schedule",
		},
		// {
		// 	title: "My Appointments Schedule",
		// 	url: "/appointments-schedule/me",
		// },
	];

	return (
		<NavGroup label="Appointments">
			{links.map(link => (
				<Button el="link" buttonStyle="none" to={adminRoute + link.url} key={link.url}>
					{link.title}
				</Button>
			))}
		</NavGroup>
	);
};

export default BeforeNavLinks;
