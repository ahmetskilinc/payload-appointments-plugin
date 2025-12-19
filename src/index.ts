import type { Config } from 'payload';

import Appointments from './collections/Appointments';
import GuestCustomers from './collections/GuestCustomers';
import Services from './collections/Services';
import TeamMembers from './collections/TeamMembers';
import { getAppointmentsForDayAndHost } from './endpoints/getAppointmentsForDayAndHost';
import OpeningTimes from './globals/OpeningTimes';
import { seedAppointmentsData } from './seed';

export type AppointmentsPluginConfig = {
  disabled?: boolean;
  seedData?: boolean;
  showDashboardCards?: boolean;
  showNavItems?: boolean;
};

export const appointmentsPlugin =
  ({
    disabled = false,
    seedData = false,
    showDashboardCards = true,
    showNavItems = true,
  }: AppointmentsPluginConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = [];
    }

    if (disabled) {
      return config;
    }

    if (!config.endpoints) {
      config.endpoints = [];
    }

    if (!config.admin) {
      config.admin = {};
    }

    if (!config.admin.components) {
      config.admin.components = {};
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = [];
    }

    config.collections = [
      ...(config.collections || []),
      Appointments,
      GuestCustomers,
      TeamMembers,
      Services,
    ];
    config.globals = [...(config.globals || []), OpeningTimes];

    config.admin = {
      ...config.admin,
      components: {
        ...config.admin.components,
        beforeDashboard: [
          ...(config.admin?.components?.beforeDashboard || []),
          ...(showDashboardCards ? ['payload-appointments-plugin/BeforeDashboard'] : []),
        ],
        beforeNavLinks: [
          ...(config.admin?.components?.beforeNavLinks || []),
          ...(showNavItems ? ['payload-appointments-plugin/BeforeNavLinks'] : []),
        ],
        views: {
          ...config.admin.components.views,
          AppointmentsList: {
            Component: 'payload-appointments-plugin/AppointmentsList',
            exact: true,
            path: '/appointments/schedule',
          },
        },
      },
    };

    config.endpoints = [
      ...(config.endpoints || []),
      {
        handler: getAppointmentsForDayAndHost,
        method: 'get',
        path: '/get-available-appointment-slots',
      },
    ];

    const incomingOnInit = config.onInit;

    config.onInit = async (payload) => {
      if (incomingOnInit) {
        await incomingOnInit(payload);
      }

      if (seedData) {
        await seedAppointmentsData(payload);
      }
    };

    return config;
  };

export { seedAppointmentsData } from './seed';
export { openingTimesSeed, servicesSeed, teamMembersSeed } from './seed/data';
