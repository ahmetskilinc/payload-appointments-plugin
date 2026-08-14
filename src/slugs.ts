import type { Config, SanitizedConfig } from 'payload';

/**
 * Resolved slugs for every collection/global the plugin owns, plus the app's
 * auth collection (`users`), which the plugin only references via
 * relationships.
 */
export type AppointmentsPluginSlugs = {
  appointments: string;
  guestCustomers: string;
  openingTimes: string;
  sentEmails: string;
  services: string;
  teamMembers: string;
  users: string;
  waitlist: string;
};

export const defaultSlugs: AppointmentsPluginSlugs = {
  appointments: 'appointments',
  guestCustomers: 'guestCustomers',
  openingTimes: 'openingTimes',
  sentEmails: 'sentEmails',
  services: 'services',
  teamMembers: 'teamMembers',
  users: 'users',
  waitlist: 'waitlist',
};

/**
 * Read the resolved slugs at runtime. The plugin stores them on
 * `config.custom` so hooks, endpoints, jobs, and admin views can look them up
 * without threading them through every call site.
 */
export const getSlugs = (config: Config | SanitizedConfig): AppointmentsPluginSlugs => {
  const stored = (
    config.custom as { appointmentsPlugin?: { slugs?: AppointmentsPluginSlugs } } | undefined
  )?.appointmentsPlugin?.slugs;

  return stored ?? defaultSlugs;
};
