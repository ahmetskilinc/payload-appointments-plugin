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
import { createSendCustomerEmailHook } from './hooks/sendCustomerEmail';
import { createAutoCompleteTask } from './jobs/autoCompleteTask';
import { createExpireWaitlistTask } from './jobs/expireWaitlistTask';
import { seedAppointmentsData } from './seed';
import { defaultSettings } from './settings';
import { defaultSlugs } from './slugs';

import type { AppointmentsEmailOverrides } from './hooks/sendCustomerEmail';
import type { AppointmentsPluginSettings } from './settings';
import type { AppointmentsPluginSlugs } from './slugs';
import type { PaymentHooks } from './types';

export type {
  AppointmentEmailOverride,
  AppointmentEmailRenderArgs,
  AppointmentEmailType,
  AppointmentsEmailOverrides,
} from './hooks/sendCustomerEmail';
export type {
  AppointmentsPluginCalendarSettings,
  AppointmentsPluginEndpointPaths,
  AppointmentsPluginJobSlugs,
  AppointmentsPluginSettings,
  AppointmentsPluginViewSettings,
} from './settings';
export { getSettings } from './settings';
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
   * Admin group under which all plugin collections and globals appear.
   * @default 'Appointments'
   */
  adminGroup?: string;
  /**
   * Schedule calendar display: first/last hour shown and slot step (minutes).
   */
  calendar?: { dayEndHour?: number; dayStartHour?: number; step?: number };
  /**
   * Frontend page path the emailed cancellation link points at; the token is
   * appended as the last segment.
   * @default '/cancel'
   */
  cancelPagePath?: string;
  /**
   * Per-collection config overrides, including `slug` renames.
   * See {@link CollectionOverride} for merge semantics.
   */
  collections?: AppointmentsPluginCollectionOverrides;
  /**
   * Fallback appointment length in minutes used when neither an end time nor
   * services are provided.
   * @default 30
   */
  defaultAppointmentDuration?: number;
  disabled?: boolean;
  /**
   * Customize outgoing customer emails per type ('created' | 'updated' |
   * 'cancelled'): subject, plain text, and/or HTML renderer.
   */
  emails?: AppointmentsEmailOverrides;
  /**
   * Override API endpoint paths (mounted under Payload's API route). Paths
   * must start with `/`.
   */
  endpoints?: {
    analytics?: string;
    appointmentByToken?: string;
    availableSlots?: string;
    cancelAppointment?: string;
    cancelAppointmentByToken?: string;
    cancelRecurring?: string;
    icalFeed?: string;
    paymentWebhook?: string;
    updateRecurring?: string;
    waitlistJoin?: string;
    waitlistLeave?: string;
    waitlistPosition?: string;
  };
  /**
   * Per-global config overrides, including `slug` renames.
   */
  globals?: AppointmentsPluginGlobalOverrides;
  /**
   * Override the Jobs Queue task slugs.
   */
  jobs?: { autoComplete?: string; expireWaitlist?: string };
  paymentHooks?: PaymentHooks;
  seedData?: boolean;
  showDashboardCards?: boolean;
  showNavItems?: boolean;
  /**
   * Admin panel view routes (relative to the admin route, must start with
   * `/`) and their nav labels.
   */
  views?: {
    analytics?: { label?: string; path?: `/${string}` };
    schedule?: { label?: string; path?: `/${string}` };
  };
  /**
   * Hours a notified waitlist entry has to book before it expires.
   * @default 2
   */
  waitlistExpiryHours?: number;
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
    adminGroup = defaultSettings.adminGroup,
    calendar,
    cancelPagePath = defaultSettings.cancelPagePath,
    collections: collectionOverrides,
    defaultAppointmentDuration = defaultSettings.defaultAppointmentDuration,
    disabled = false,
    emails,
    endpoints: endpointOverrides,
    globals: globalOverrides,
    jobs: jobOverrides,
    paymentHooks,
    seedData = false,
    showDashboardCards = true,
    showNavItems = true,
    views: viewOverrides,
    waitlistExpiryHours = defaultSettings.waitlistExpiryHours,
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

    const settings: AppointmentsPluginSettings = {
      adminGroup,
      calendar: { ...defaultSettings.calendar, ...calendar },
      cancelPagePath,
      defaultAppointmentDuration,
      endpoints: { ...defaultSettings.endpoints, ...endpointOverrides },
      jobs: { ...defaultSettings.jobs, ...jobOverrides },
      slugs,
      views: {
        analytics: { ...defaultSettings.views.analytics, ...viewOverrides?.analytics },
        schedule: { ...defaultSettings.views.schedule, ...viewOverrides?.schedule },
      },
      waitlistExpiryHours,
    };

    // Hooks, endpoints, jobs, and admin views resolve slugs and settings at
    // runtime via `getSlugs(config)` / `getSettings(config)` instead of
    // importing hardcoded literals. Everything stored here must stay
    // serializable: the same object is mirrored to `admin.custom` below, which
    // Payload ships to the admin client.
    config.custom = {
      ...config.custom,
      appointmentsPlugin: {
        ...(config.custom?.appointmentsPlugin ?? {}),
        settings,
        slugs,
      },
    };

    // Collections and globals are always registered — even when the plugin is
    // disabled — so that toggling `disabled` never changes the database schema.
    // (Hooks don't affect the schema, so appending the payment hook here is safe.)
    const Appointments = createAppointmentsCollection(
      slugs,
      emails ? { sendCustomerEmailHook: createSendCustomerEmailHook(emails) } : undefined,
    );
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

    const withGroup = (collection: CollectionConfig): CollectionConfig => ({
      ...collection,
      admin: { ...collection.admin, group: adminGroup },
    });

    config.collections = [
      ...(config.collections || []),
      applyCollectionOverride(withGroup(appointmentsCollection), collectionOverrides?.appointments),
      applyCollectionOverride(
        withGroup(createGuestCustomersCollection(slugs)),
        collectionOverrides?.guestCustomers,
      ),
      applyCollectionOverride(
        withGroup(createSentEmailsCollection(slugs)),
        collectionOverrides?.sentEmails,
      ),
      applyCollectionOverride(
        withGroup(createTeamMembersCollection(slugs)),
        collectionOverrides?.teamMembers,
      ),
      applyCollectionOverride(
        withGroup(createServicesCollection(slugs)),
        collectionOverrides?.services,
      ),
      applyCollectionOverride(
        withGroup(createWaitlistCollection(slugs)),
        collectionOverrides?.waitlist,
      ),
    ];
    const openingTimesGlobal = createOpeningTimesGlobal(slugs);
    config.globals = [
      ...(config.globals || []),
      applyGlobalOverride(
        { ...openingTimesGlobal, admin: { ...openingTimesGlobal.admin, group: adminGroup } },
        globalOverrides?.openingTimes,
      ),
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
      // Admin client components (nav links, analytics dashboard) read the
      // settings from the client config, which only receives `admin.custom`.
      custom: {
        ...config.admin.custom,
        appointmentsPlugin: {
          ...(config.admin.custom?.appointmentsPlugin ?? {}),
          settings,
        },
      },
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
            path: settings.views.schedule.path,
          },
          AnalyticsView: {
            Component: 'payload-appointments-plugin/AnalyticsView',
            exact: true,
            path: settings.views.analytics.path,
          },
        },
      },
    };

    config.endpoints = [
      ...(config.endpoints || []),
      {
        handler: getAppointmentsForDayAndHost,
        method: 'get',
        path: settings.endpoints.availableSlots,
      },
      {
        handler: cancelAppointment,
        method: 'post',
        path: settings.endpoints.cancelAppointment,
      },
      {
        handler: getAppointmentByToken,
        method: 'get',
        path: settings.endpoints.appointmentByToken,
      },
      {
        handler: cancelAppointmentByToken,
        method: 'post',
        path: settings.endpoints.cancelAppointmentByToken,
      },
      {
        handler: getAnalytics,
        method: 'get',
        path: settings.endpoints.analytics,
      },
      {
        handler: createPaymentWebhook({ paymentHooks, webhookSecret }),
        method: 'post',
        path: settings.endpoints.paymentWebhook,
      },
      {
        handler: updateRecurringAppointment,
        method: 'put',
        path: settings.endpoints.updateRecurring,
      },
      {
        handler: cancelRecurringAppointment,
        method: 'post',
        path: settings.endpoints.cancelRecurring,
      },
      {
        handler: getICalFeed,
        method: 'get',
        path: settings.endpoints.icalFeed,
      },
      {
        handler: waitlistJoin,
        method: 'post',
        path: settings.endpoints.waitlistJoin,
      },
      {
        handler: waitlistLeave,
        method: 'delete',
        path: settings.endpoints.waitlistLeave,
      },
      {
        handler: waitlistPosition,
        method: 'get',
        path: settings.endpoints.waitlistPosition,
      },
    ];

    // Maintenance tasks (run them via the Jobs Queue — autorun or a cron
    // trigger; see the README).
    config.jobs = {
      ...config.jobs,
      tasks: [
        ...(config.jobs?.tasks || []),
        createAutoCompleteTask(settings.jobs.autoComplete),
        createExpireWaitlistTask(settings.jobs.expireWaitlist),
      ],
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
