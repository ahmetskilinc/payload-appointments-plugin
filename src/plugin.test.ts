import type { CollectionConfig, Config } from 'payload';

import { describe, expect, it } from 'vitest';

import { appointmentsPlugin, getSlugs } from './index';
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
