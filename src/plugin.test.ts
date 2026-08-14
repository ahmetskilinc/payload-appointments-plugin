import type { CollectionConfig, Config } from 'payload';

import { describe, expect, it } from 'vitest';

import { appointmentsPlugin, getSettings, getSlugs } from './index';
import { defaultSettings } from './settings';
import { defaultSlugs } from './slugs';

const baseConfig = (): Config =>
  ({
    admin: { user: 'users' },
    collections: [],
  }) as unknown as Config;

const findCollection = (config: Config, slug: string): CollectionConfig => {
  const collection = config.collections?.find((c) => c.slug === slug);
  if (!collection) {
    throw new Error(`Collection ${slug} not found`);
  }
  return collection;
};

describe('appointmentsPlugin collection/slug overrides', () => {
  it('registers the default slugs when no overrides are given', () => {
    const config = appointmentsPlugin()(baseConfig());

    for (const slug of [
      'appointments',
      'guestCustomers',
      'sentEmails',
      'teamMembers',
      'services',
      'waitlist',
    ]) {
      expect(config.collections?.some((c) => c.slug === slug)).toBe(true);
    }
    expect(config.globals?.some((g) => g.slug === 'openingTimes')).toBe(true);
    expect(getSlugs(config)).toEqual(defaultSlugs);
  });

  it('renames collections and globals via slug overrides', () => {
    const config = appointmentsPlugin({
      collections: {
        appointments: { slug: 'bookings' },
        teamMembers: { slug: 'staff' },
      },
      globals: {
        openingTimes: { slug: 'businessHours' },
      },
    })(baseConfig());

    expect(config.collections?.some((c) => c.slug === 'bookings')).toBe(true);
    expect(config.collections?.some((c) => c.slug === 'appointments')).toBe(false);
    expect(config.globals?.[0]?.slug).toBe('businessHours');

    const slugs = getSlugs(config);
    expect(slugs.appointments).toBe('bookings');
    expect(slugs.teamMembers).toBe('staff');
    expect(slugs.openingTimes).toBe('businessHours');
    // Untouched collections keep their defaults.
    expect(slugs.services).toBe('services');
  });

  it('follows slug renames in relationship fields', () => {
    const config = appointmentsPlugin({
      collections: {
        services: { slug: 'treatments' },
        teamMembers: { slug: 'staff' },
      },
    })(baseConfig());

    const appointments = findCollection(config, 'appointments');
    const hostField = appointments.fields.find(
      (f) => 'name' in f && f.name === 'host',
    ) as { relationTo: string };
    const servicesField = appointments.fields.find(
      (f) => 'name' in f && f.name === 'services',
    ) as { relationTo: string };

    expect(hostField.relationTo).toBe('staff');
    expect(servicesField.relationTo).toBe('treatments');
  });

  it('uses the app auth collection for customer relationships', () => {
    const config = baseConfig();
    (config.admin as { user?: string }).user = 'members';

    const result = appointmentsPlugin()(config);
    const appointments = findCollection(result, 'appointments');
    const customerField = appointments.fields.find(
      (f) => 'name' in f && f.name === 'customer',
    ) as { relationTo: string };

    expect(customerField.relationTo).toBe('members');
    expect(getSlugs(result).users).toBe('members');
  });

  it('appends override hooks instead of replacing plugin hooks', () => {
    const extraHook = () => undefined;
    const config = appointmentsPlugin({
      collections: {
        appointments: { hooks: { afterChange: [extraHook] } },
      },
    })(baseConfig());

    const appointments = findCollection(config, 'appointments');
    const afterChange = appointments.hooks?.afterChange ?? [];
    expect(afterChange.length).toBeGreaterThan(1);
    expect(afterChange[afterChange.length - 1]).toBe(extraHook);
  });

  it('lets the fields override extend the default fields', () => {
    const config = appointmentsPlugin({
      collections: {
        services: {
          fields: ({ defaultFields }) => [
            ...defaultFields,
            { name: 'color', type: 'text' },
          ],
        },
      },
    })(baseConfig());

    const services = findCollection(config, 'services');
    expect(services.fields.some((f) => 'name' in f && f.name === 'color')).toBe(true);
    expect(services.fields.some((f) => 'name' in f && f.name === 'title')).toBe(true);
  });

  it('resolves default settings and mirrors them to the admin client config', () => {
    const config = appointmentsPlugin()(baseConfig());

    expect(getSettings(config)).toEqual(defaultSettings);
    expect(
      (config.admin?.custom as { appointmentsPlugin?: { settings?: unknown } })?.appointmentsPlugin
        ?.settings,
    ).toEqual(defaultSettings);
  });

  it('applies endpoint path overrides', () => {
    const config = appointmentsPlugin({
      endpoints: { analytics: '/booking-analytics', waitlistJoin: '/queue/join' },
    })(baseConfig());

    const paths = (config.endpoints ?? []).map((e) => e.path);
    expect(paths).toContain('/booking-analytics');
    expect(paths).toContain('/queue/join');
    expect(paths).not.toContain('/appointments-analytics');
    // Untouched endpoints keep their defaults.
    expect(paths).toContain('/cancel-appointment');
  });

  it('applies job slug, view, and admin group overrides', () => {
    const config = appointmentsPlugin({
      adminGroup: 'Bookings',
      jobs: { autoComplete: 'bookingsAutoComplete' },
      views: { schedule: { label: 'Calendar', path: '/bookings/calendar' } },
    })(baseConfig());

    const taskSlugs = (config.jobs?.tasks ?? []).map((t) => t.slug);
    expect(taskSlugs).toContain('bookingsAutoComplete');
    expect(taskSlugs).toContain('appointmentsExpireWaitlist');

    const settings = getSettings(config);
    expect(settings.views.schedule).toEqual({ label: 'Calendar', path: '/bookings/calendar' });
    expect(settings.views.analytics).toEqual(defaultSettings.views.analytics);

    const views = config.admin?.components?.views as Record<string, { path: string }>;
    expect(views.AppointmentsList.path).toBe('/bookings/calendar');

    for (const collection of config.collections ?? []) {
      expect(collection.admin?.group).toBe('Bookings');
    }
    expect(config.globals?.[0]?.admin?.group).toBe('Bookings');
  });

  it('resolves tunables into settings', () => {
    const config = appointmentsPlugin({
      calendar: { dayStartHour: 7 },
      cancelPagePath: '/cancel-booking',
      defaultAppointmentDuration: 45,
      waitlistExpiryHours: 6,
    })(baseConfig());

    const settings = getSettings(config);
    expect(settings.calendar).toEqual({ ...defaultSettings.calendar, dayStartHour: 7 });
    expect(settings.cancelPagePath).toBe('/cancel-booking');
    expect(settings.defaultAppointmentDuration).toBe(45);
    expect(settings.waitlistExpiryHours).toBe(6);
  });

  it('merges access and admin overrides one level deep', () => {
    const readAccess = () => true;
    const config = appointmentsPlugin({
      collections: {
        appointments: {
          access: { read: readAccess },
          admin: { group: 'Bookings' },
        },
      },
    })(baseConfig());

    const appointments = findCollection(config, 'appointments');
    expect(appointments.access?.read).toBe(readAccess);
    // Non-overridden keys survive.
    expect(appointments.access?.create).toBeDefined();
    expect(appointments.admin?.group).toBe('Bookings');
    expect(appointments.admin?.useAsTitle).toBe('adminTitle');
  });
});
