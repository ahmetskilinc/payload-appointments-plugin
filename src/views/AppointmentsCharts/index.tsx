import type { AdminViewProps } from "payload";
import { AppointmentProvider } from "../../providers/AppointmentsProvider";
import { DefaultTemplate } from "@payloadcms/next/templates";
import AppointmentsChartsClient from "./index.client";

import "../styles.css";

const AppointmentsCharts: React.FC<AdminViewProps> = ({
	initPageResult,
	params,
	searchParams,
}) => {
	return (
		<AppointmentProvider>
			<DefaultTemplate
				i18n={initPageResult.req.i18n}
				locale={initPageResult.locale}
				params={params}
				payload={initPageResult.req.payload}
				permissions={initPageResult.permissions}
				searchParams={searchParams}
				user={initPageResult.req.user || undefined}
				visibleEntities={initPageResult.visibleEntities}
			>
				<AppointmentsChartsClient />
			</DefaultTemplate>
		</AppointmentProvider>
	);
};

export default AppointmentsCharts;
