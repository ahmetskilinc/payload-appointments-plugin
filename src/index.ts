import type { CollectionConfig, Config, Field, GlobalConfig } from 'payload';

import createAppointmentsCollection from './collections/Appointments';
import createGuestCustomersCollection from './collections/GuestCustomers';
import createSentEmailsCollection from './collections/SentEmails';
import createServicesCollection from './collections/Services';
import createTeamMembersCollection from './collections/TeamMembers';
import createWaitlistCollection from './collections/Waitlist';
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
import createOpeningTimesGlobal from './globals/OpeningTimes';
import { createRequestPaymentHook } from './hooks/requestPayment';
import { autoCompleteTask } from './jobs/autoCompleteTask';
import { expireWaitlistTask } from './jobs/expireWaitlistTask';
import { seedAppointmentsData } from './seed';
import { defaultSlugs } from './slugs';

import type { AppointmentsPluginSlugs } from './slugs';
import type { PaymentHooks } from './types';

export type { AppointmentsPluginSlugs } from './slugs';
export { getSlugs } from './slugs';

type FieldsOverride = (args: { defaultFields: Field[] }) => Field[];

/**
 * Override a plugin collection. Properties are shallow-merged over the
 * defaults, except:
 * - `slug` renames the collection (all internal references follow it)
 * - `access` and `admin` are merged one level deep with the defaults
 * - `hooks` are appended after the plugin's own hooks, never replacing them
 * - `fields` is a function receiving the default fields and returning the
 *   final field array
 */
export type CollectionOverride = {
  fields?: FieldsOverride;
} & Omit<Partial<CollectionConfig>, 'fields'>;

/** Same override semantics as {@link CollectionOverride}, for a global. */
export type GlobalOverride = {
  fields?: FieldsOverride;
} & Omit<Partial<GlobalConfig>, 'fields'>;

export type AppointmentsPluginCollectionOverrides = {
  appointments?: CollectionOverride;
  guestCustomers?: CollectionOverride;
  sentEmails?: CollectionOverride;
  services?: CollectionOverride;
  teamMembers?: CollectionOverride;
  waitlist?: CollectionOverride;
};

export type AppointmentsPluginGlobalOverrides = {
  openingTimes?: GlobalOverride;
};

export type AppointmentsPluginConfig = {
  /**
   * Per-collection config overrides, including `slug` renames.
   * See {@link CollectionOverride} for merge semantics.
   */
  collections?: AppointmentsPluginCollectionOverrides;
  disabled?: boolean;
  /**
   * Per-global config overrides, including `slug` renames.
   */
  globals?: AppointmentsPluginGlobalOverrides;
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

type HookArrays = { [key: string]: unknown } | undefined;

const mergeHooks = <T extends HookArrays>(base: T, override: T): T => {
  if (!override) {
    return base;
  }
  const merged: { [key: string]: unknown } = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (!Array.isArray(value)) {
      continue;
    }
    const existing = merged[key];
    merged[key] = [...(Array.isArray(existing) ? existing : []), ...value];
  }
  return merged as T;
};

const applyCollectionOverride = (
  base: CollectionConfig,
  override?: CollectionOverride,
): CollectionConfig => {
  if (!override) {
    return base;
  }
  const { access, admin, fields, hooks, ...rest } = override;
  return {
    ...base,
    ...rest,
    // The factory already received the resolved slug.
    slug: base.slug,
    access: { ...base.access, ...access },
    admin: { ...base.admin, ...admin },
    fields: typeof fields === 'function' ? fields({ defaultFields: base.fields }) : base.fields,
    hooks: mergeHooks(base.hooks, hooks),
  };
};

const applyGlobalOverride = (base: GlobalConfig, override?: GlobalOverride): GlobalConfig => {
  if (!override) {
    return base;
  }
  const { access, admin, fields, hooks, ...rest } = override;
  return {
    ...base,
    ...rest,
    slug: base.slug,
    access: { ...base.access, ...access },
    admin: { ...base.admin, ...admin },
    fields: typeof fields === 'function' ? fields({ defaultFields: base.fields }) : base.fields,
    hooks: mergeHooks(base.hooks, hooks),
  };
};

export const appointmentsPlugin =
  ({
    collections: collectionOverrides,
    disabled = false,
    globals: globalOverrides,
    paymentHooks,
    seedData = false,
    showDashboardCards = true,
    showNavItems = true,
    webhookSecret,
  }: AppointmentsPluginConfig = {}) =>
  (config: Config): Config => {
    const slugs: AppointmentsPluginSlugs = {
      appointments: collectionOverrides?.appointments?.slug ?? defaultSlugs.appointments,
      guestCustomers: collectionOverrides?.guestCustomers?.slug ?? defaultSlugs.guestCustomers,
      openingTimes: globalOverrides?.openingTimes?.slug ?? defaultSlugs.openingTimes,
      sentEmails: collectionOverrides?.sentEmails?.slug ?? defaultSlugs.sentEmails,
      services: collectionOverrides?.services?.slug ?? defaultSlugs.services,
      teamMembers: collectionOverrides?.teamMembers?.slug ?? defaultSlugs.teamMembers,
      // The plugin references the app's auth collection in relationships.
      users: typeof config.admin?.user === 'string' ? config.admin.user : defaultSlugs.users,
      waitlist: collectionOverrides?.waitlist?.slug ?? defaultSlugs.waitlist,
    };

    // Hooks, endpoints, jobs, and admin views resolve the slugs at runtime via
    // `getSlugs(config)` instead of importing hardcoded literals.
    config.custom = {
      ...config.custom,
      appointmentsPlugin: {
        ...(config.custom?.appointmentsPlugin ?? {}),
        slugs,
      },
    };

    // Collections and globals are always registered — even when the plugin is
    // disabled — so that toggling `disabled` never changes the database schema.
    // (Hooks don't affect the schema, so appending the payment hook here is safe.)
    const Appointments = createAppointmentsCollection(slugs);
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
      applyCollectionOverride(appointmentsCollection, collectionOverrides?.appointments),
      applyCollectionOverride(createGuestCustomersCollection(slugs), collectionOverrides?.guestCustomers),
      applyCollectionOverride(createSentEmailsCollection(slugs), collectionOverrides?.sentEmails),
      applyCollectionOverride(createTeamMembersCollection(slugs), collectionOverrides?.teamMembers),
      applyCollectionOverride(createServicesCollection(slugs), collectionOverrides?.services),
      applyCollectionOverride(createWaitlistCollection(slugs), collectionOverrides?.waitlist),
    ];
    config.globals = [
      ...(config.globals || []),
      applyGlobalOverride(createOpeningTimesGlobal(slugs), globalOverrides?.openingTimes),
    ];

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
