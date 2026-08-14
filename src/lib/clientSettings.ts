import type { AppointmentsPluginSettings } from '../settings';

import { defaultSettings } from '../settings';

/**
 * Read the plugin settings from the admin client config (`useConfig().config`).
 * The plugin mirrors its settings to `admin.custom`, which is the only
 * `custom` object Payload ships to the client.
 */
export const getClientSettings = (config: {
  custom?: { appointmentsPlugin?: { settings?: AppointmentsPluginSettings } };
}): AppointmentsPluginSettings => config.custom?.appointmentsPlugin?.settings ?? defaultSettings;
