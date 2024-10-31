import { DefaultTemplate } from "@payloadcms/next/templates";
import type { AdminViewProps } from "payload";
import { AppointmentModal } from "../../components/AppointmentModal";
import "../../components/Appointments/styles.scss";
import { AppointmentProvider } from "../../providers/AppointmentsProvider";
import { User } from "../../types";
import AppointmentsListClient from "./index.client";

const AppointmentsList: React.FC<AdminViewProps> = ({
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
				<AppointmentsListClient />
			</DefaultTemplate>
		</AppointmentProvider>
	);
};

export default AppointmentsList;
