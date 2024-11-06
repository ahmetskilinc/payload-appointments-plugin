import type { Config, Plugin } from "payload";
import type { PluginTypes } from "./types";
import Appointments from "./collections/Appointments";
import Services from "./collections/Services";
import OpeningTimes from "./globals/OpeningTimes";
import TeamMembers from "./collections/TeamMembers";
import { getAppointmentsForDayAndHost } from "./endpoints/getAppointmentsForDayAndHost";

export const appointments =
  ({ showDashboardCards = true, showNavItems = true }: PluginTypes): Plugin =>
  (incomingConfig): Config => {
    let config: Config = { ...incomingConfig };

    config.admin = {
      ...(config.admin || {}),
      components: {
        ...(config.admin?.components || {}),
        views: {
          ...(config.admin?.components?.views || {}),
          AppointmentsList: {
            Component: "payload-appointments-plugin/src/views/AppointmentsList/index",
            path: "/appointments/schedule",
            exact: true,
          },
          // AppointmentsCharts: {
          //   Component: "payload-appointments-plugin/src/views/AppointmentsCharts/index",
          //   path: "/appointments/charts",
          //   exact: true,
          // },
          // AppointmentsMarketingCampaigns: {
          //   Component: "payload-appointments-plugin/src/views/AppointmentsMarketingCampaigns/index",
          //   path: "/appointments/marketing-campaigns",
          //   exact: true,
          // },
          // AppointmentsListMe: {
          //   Component: "payload-appointments-plugin/src/views/AppointmentsListMe/index",
          //   path: "/appointments/schedule/me",
          //   exact: true,
          // },
        },
        beforeDashboard: [
          ...(config.admin?.components?.beforeDashboard || []),
          // TODO: add component for appointments today, appointments yesterday, appointments tomorrow...
          ...(showDashboardCards ? ["payload-appointments-plugin/src/components/BeforeDashboard"] : []),
        ],
        beforeNavLinks: [
          ...(config.admin?.components?.beforeNavLinks || []),
          ...(showNavItems ? ["payload-appointments-plugin/src/components/BeforeNavLinks"] : []),
        ],
      },
    };

    config.collections = [...(config.collections || []), Appointments, TeamMembers, Services];

    config.globals = [...(config.globals || []), OpeningTimes];

    config.endpoints = [
      ...(config.endpoints || []),
      {
        path: "/get-available-appointment-slots",
        method: "get",
        handler: getAppointmentsForDayAndHost,
      },
    ];

    return config;
  };
