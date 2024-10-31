"use client";

import { ListHeader, useStepNav } from "@payloadcms/ui";
import { useEffect } from "react";

const AppointmentsMarketingCampaignsClient: React.FC = () => {
	const { setStepNav } = useStepNav();

	useEffect(() => {
		setStepNav([
			{
				label: "Marketing Campaigns",
			},
		]);
	}, [setStepNav]);
	return (
		<div className="collection-list appointments-calendar-view">
			<ListHeader heading="Marketing Campaigns" />
			<p>should be a marketing campaigns here</p>
			{/* TODO: MARKETING CAMPAIGNS */}
		</div>
	);
};

export default AppointmentsMarketingCampaignsClient;
