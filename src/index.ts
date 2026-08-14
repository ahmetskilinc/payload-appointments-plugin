import type { Config } from 'payload';

import Appointments from './collections/Appointments';
import GuestCustomers from './collections/GuestCustomers';
import SentEmails from './collections/SentEmails';
import Services from './collections/Services';
import TeamMembers from './collections/TeamMembers';
import Waitlist from './collections/Waitlist';
import { cancelAppointment } from './endpoints/cancelAppointment';
import { cancelAppointmentByToken } from './endpoints/cancelAppointmentByToken';
import { cancelRecurringAppointment } from './endpoints/cancelRecurringAppointment';
import { getAnalytics } from './endpoints/getAnalytics';
import { getAppointmentByToken } from './endpoints/getAppointmentByToken';
import { getAppointmentsForDayAndHost } from './endpoints/getAppointmentsForDayAndHost';
import { getICalFeed } from './endpoints/getICalFeed';
import { createPaymentWebhook } from './endpoints/paymentWebhook';
import { updateRecurringAppointment } from './endpoints/updateRecurringAppointment';
import { waitlistJoin } from './endpoints/waitlistJoin';
import { waitlistLeave } from './endpoints/waitlistLeave';
import { waitlistPosition } from './endpoints/waitlistPosition';
import OpeningTimes from './globals/OpeningTimes';
import { createRequestPaymentHook } from './hooks/requestPayment';
import { autoCompleteTask } from './jobs/autoCompleteTask';
import { expireWaitlistTask } from './jobs/expireWaitlistTask';
import { seedAppointmentsData } from './seed';

import type { PaymentHooks } from './types';

export type AppointmentsPluginConfig = {
  disabled?: boolean;
  paymentHooks?: PaymentHooks;
  seedData?: boolean;
  showDashboardCards?: boolean;
  showNavItems?: boolean;
  /**
   * Shared secret used to verify the HMAC-SHA256 signature of payment webhook
   * calls (sent in the `x-appointments-signature` header). The webhook endpoint
   * refuses all requests until this is configured.
   */
  webhookSecret?: string;
};

export const appointmentsPlugin =
  ({
    disabled = false,
    paymentHooks,
    seedData = false,
    showDashboardCards = true,
    showNavItems = true,
    webhookSecret,
  }: AppointmentsPluginConfig = {}) =>
  (config: Config): Config => {
    // Collections and globals are always registered — even when the plugin is
    // disabled — so that toggling `disabled` never changes the database schema.
    // (Hooks don't affect the schema, so appending the payment hook here is safe.)
    const appointmentsCollection = paymentHooks
      ? {
          ...Appointments,
          hooks: {
            ...Appointments.hooks,
            afterChange: [
              ...(Appointments.hooks?.afterChange || []),
              createRequestPaymentHook(paymentHooks),
            ],
          },
        }
      : Appointments;

    config.collections = [
      ...(config.collections || []),
      appointmentsCollection,
      GuestCustomers,
      SentEmails,
      TeamMembers,
      Services,
      Waitlist,
    ];
    config.globals = [...(config.globals || []), OpeningTimes];

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
          AnalyticsView: {
            Component: 'payload-appointments-plugin/AnalyticsView',
            exact: true,
            path: '/appointments/analytics',
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
      {
        handler: cancelAppointment,
        method: 'post',
        path: '/cancel-appointment',
      },
      {
        handler: getAppointmentByToken,
        method: 'get',
        path: '/appointment-by-token',
      },
      {
        handler: cancelAppointmentByToken,
        method: 'post',
        path: '/cancel-appointment-by-token',
      },
      {
        handler: getAnalytics,
        method: 'get',
        path: '/appointments-analytics',
      },
      {
        handler: createPaymentWebhook({ paymentHooks, webhookSecret }),
        method: 'post',
        path: '/appointments-payment-webhook',
      },
      {
        handler: updateRecurringAppointment,
        method: 'put',
        path: '/update-recurring-appointment',
      },
      {
        handler: cancelRecurringAppointment,
        method: 'post',
        path: '/cancel-recurring-appointment',
      },
      {
        handler: getICalFeed,
        method: 'get',
        path: '/appointments-ical',
      },
      {
        handler: waitlistJoin,
        method: 'post',
        path: '/waitlist/join',
      },
      {
        handler: waitlistLeave,
        method: 'delete',
        path: '/waitlist/leave',
      },
      {
        handler: waitlistPosition,
        method: 'get',
        path: '/waitlist/position',
      },
    ];

    // Maintenance tasks (run them via the Jobs Queue — autorun or a cron
    // trigger; see the README).
    config.jobs = {
      ...config.jobs,
      tasks: [...(config.jobs?.tasks || []), autoCompleteTask, expireWaitlistTask],
    };

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
