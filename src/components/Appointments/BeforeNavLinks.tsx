import { Button, NavGroup, useConfig } from "@payloadcms/ui";

const BeforeNavLinks = () => {
	const {
		config: {
			routes: { admin: adminRoute },
		},
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
			{links.map((link) => (
				<Button
					el="link"
					buttonStyle="none"
					to={adminRoute + link.url}
					key={link.url}
				>
					{link.title}
				</Button>
			))}
		</NavGroup>
	);
};

export default BeforeNavLinks;
