/**
 * Minimal, PII-safe appointment shape returned by the public token endpoints.
 * Never expose internalNotes, payment details, tokens, or full customer records here.
 */
export type PublicAppointment = {
  cancelledAt?: string | null;
  end: string;
  hostName: string | null;
  id: string;
  services: string[];
  start: string;
  status?: string | null;
};

export const toPublicAppointment = (doc: Record<string, unknown>): PublicAppointment => {
  const appointment = doc as {
    cancelledAt?: string | null;
    end: string;
    host?: unknown;
    id: number | string;
    services?: unknown;
    start: string;
    status?: string | null;
  };
  const host = appointment.host as
    | { firstName?: string; lastName?: string; preferredNameAppointments?: string }
    | number
    | string
    | null
    | undefined;

  const hostName =
    host && typeof host === 'object'
      ? host.preferredNameAppointments ||
        `${host.firstName || ''} ${host.lastName || ''}`.trim() ||
        null
      : null;

  const services = Array.isArray(appointment.services)
    ? appointment.services
        .map((s: unknown) =>
          s && typeof s === 'object' ? (s as { title?: string }).title : undefined,
        )
        .filter((title): title is string => Boolean(title))
    : [];

  return {
    id: String(appointment.id),
    cancelledAt: appointment.cancelledAt,
    end: appointment.end,
    hostName,
    services,
    start: appointment.start,
    status: appointment.status,
  };
};
