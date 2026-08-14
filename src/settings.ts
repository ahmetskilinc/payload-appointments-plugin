import type { Config, SanitizedConfig } from 'payload';

import type { AppointmentsPluginSlugs } from './slugs';

import { defaultSlugs } from './slugs';

/** API endpoint paths, mounted under Payload's API route. */
export type AppointmentsPluginEndpointPaths = {
  analytics: string;
  appointmentByToken: string;
  availableSlots: string;
  cancelAppointment: string;
  cancelAppointmentByToken: string;
  cancelRecurring: string;
  icalFeed: string;
  paymentWebhook: string;
  updateRecurring: string;
  waitlistJoin: string;
  waitlistLeave: string;
  waitlistPosition: string;
};

export type AppointmentsPluginViewSettings = {
  /** Label shown in the admin nav. */
  label: string;
  /** Route relative to the admin panel (must start with `/`). */
  path: `/${string}`;
};

export type AppointmentsPluginJobSlugs = {
  autoComplete: string;
  expireWaitlist: string;
  reminder: string;
};

export type AppointmentsPluginCalendarSettings = {
  /** Last hour shown on the schedule calendar (0-24). */
  dayEndHour: number;
  /** First hour shown on the schedule calendar (0-24). */
  dayStartHour: number;
  /** Calendar slot step in minutes. */
  step: number;
};

/**
 * Every resolved, serializable runtime setting of the plugin. Stored on
 * `config.custom.appointmentsPlugin.settings` (server) and mirrored to
 * `config.admin.custom.appointmentsPlugin.settings` (admin client), so any
 * code path can look settings up without importing hardcoded literals.
 */
export type AppointmentsPluginSettings = {
  adminGroup: string;
  calendar: AppointmentsPluginCalendarSettings;
  /**
   * Frontend page path the emailed cancellation link points at; the
   * cancellation token is appended as the last segment.
   */
  cancelPagePath: string;
  /** Fallback appointment length in minutes when no end/services are given. */
  defaultAppointmentDuration: number;
  endpoints: AppointmentsPluginEndpointPaths;
  jobs: AppointmentsPluginJobSlugs;
  slugs: AppointmentsPluginSlugs;
  views: {
    analytics: AppointmentsPluginViewSettings;
    schedule: AppointmentsPluginViewSettings;
  };
  /** Reminder emails go out when an appointment starts within this window. */
  reminderHours: number;
  /** Hours a notified waitlist entry has to book before it expires. */
  waitlistExpiryHours: number;
};

export const defaultSettings: AppointmentsPluginSettings = {
  adminGroup: 'Appointments',
  cancelPagePath: '/cancel',
  calendar: {
    dayEndHour: 19,
    dayStartHour: 9,
    step: 15,
  },
  defaultAppointmentDuration: 30,
  endpoints: {
    analytics: '/appointments-analytics',
    appointmentByToken: '/appointment-by-token',
    availableSlots: '/get-available-appointment-slots',
    cancelAppointment: '/cancel-appointment',
    cancelAppointmentByToken: '/cancel-appointment-by-token',
    cancelRecurring: '/cancel-recurring-appointment',
    icalFeed: '/appointments-ical',
    paymentWebhook: '/appointments-payment-webhook',
    updateRecurring: '/update-recurring-appointment',
    waitlistJoin: '/waitlist/join',
    waitlistLeave: '/waitlist/leave',
    waitlistPosition: '/waitlist/position',
  },
  jobs: {
    autoComplete: 'appointmentsAutoComplete',
    expireWaitlist: 'appointmentsExpireWaitlist',
    reminder: 'appointmentsReminder',
  },
  slugs: defaultSlugs,
  reminderHours: 24,
  views: {
    analytics: { label: 'Analytics', path: '/appointments/analytics' },
    schedule: { label: 'Appointments Schedule', path: '/appointments/schedule' },
  },
  waitlistExpiryHours: 2,
};

type ConfigWithCustom = {
  custom?: { appointmentsPlugin?: { settings?: AppointmentsPluginSettings } };
};

/**
 * Read the resolved plugin settings at runtime. Works with the server config
 * (`payload.config` / `req.payload.config`); admin client components read the
 * mirrored copy from `useConfig().config.custom` instead.
 */
export const getSettings = (config: Config | SanitizedConfig): AppointmentsPluginSettings =>
  (config as ConfigWithCustom).custom?.appointmentsPlugin?.settings ?? defaultSettings;
