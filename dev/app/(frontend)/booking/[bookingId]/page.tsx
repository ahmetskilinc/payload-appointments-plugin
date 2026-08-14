import configPromise from '@payload-config';
import moment from 'moment';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import type { Service, TeamMember } from '../../../../payload-types';

import { Button } from '../../../../components/ui/button';
import { formatPrice } from '../../../../lib/formatPrice';
import { CancelButton } from './page.client';

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

const statusConfig: Record<
  AppointmentStatus,
  { label: string; bgColor: string; textColor: string; icon?: string }
> = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-amber-500',
    textColor: 'text-white',
  },
  confirmed: {
    label: 'Confirmed',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
  },
  'no-show': {
    label: 'No Show',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
  },
};

export default async function BookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const payload = await getPayload({ config: configPromise });

  const appointment = await payload.findByID({
    collection: 'appointments',
    id: Number(bookingId),
    depth: 2,
  });

  if (!appointment || appointment.appointmentType !== 'appointment') {
    notFound();
  }

  const host = appointment.host as TeamMember | null;
  const services = (appointment.services || []) as Service[];
  const totalPrice = services.reduce((acc, service) => acc + (service.price || 0), 0);
  const totalDuration = services.reduce((acc, service) => acc + service.duration, 0);

  const startDate = moment(appointment.start);
  const endDate = moment(appointment.end);
  const status = (appointment.status as AppointmentStatus) || 'confirmed';
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';
  const isNoShow = status === 'no-show';
  const isPast = startDate.isBefore(moment());
  const isToday = startDate.isSame(moment(), 'day');
  const canCancel = !isCancelled && !isCompleted && !isNoShow && !isPast;

  const statusInfo = statusConfig[status];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-gray-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to appointments
        </Link>

        <div className={`glass-card overflow-hidden ${isCancelled ? 'opacity-75' : ''}`}>
          <div className={`p-6 text-white ${isCancelled ? 'bg-gray-600' : 'bg-gray-900'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                  >
                    {status === 'confirmed' && isToday && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    )}
                    {statusInfo.label}
                    {status === 'confirmed' && isToday && ' - Today'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-1">
                  {startDate.format('dddd, MMMM Do YYYY')}
                </h1>
                <p className="text-gray-300 text-lg">
                  {startDate.format('HH:mm')} - {endDate.format('HH:mm')}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {host && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                  {host.preferredNameAppointments?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Host
                  </p>
                  <p className="text-gray-900 font-semibold">{host.preferredNameAppointments}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Services
              </p>
              <div className="space-y-3">
                {services.map((service, index) => {
                  const previousServicesDuration = services
                    .slice(0, index)
                    .reduce((total, s) => total + s.duration, 0);
                  const serviceStartTime = startDate
                    .clone()
                    .add(previousServicesDuration, 'minutes');

                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-900 bg-gray-200 px-3 py-1.5 rounded-lg tabular-nums">
                          {serviceStartTime.format('HH:mm')}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{service.title}</p>
                          {service.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                          )}
                          <p className="text-sm text-gray-400 mt-1">{service.duration} minutes</p>
                        </div>
                      </div>
                      {service.paidService && service.price && (
                        <p className="font-semibold text-gray-900">{formatPrice(service.price)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Total Duration
                </p>
                <p className="text-xl font-bold text-gray-900">{totalDuration} min</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Total Amount
                </p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            {appointment.customerNotes && (
              <>
                <div className="h-px bg-gray-100" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                    {appointment.customerNotes}
                  </p>
                </div>
              </>
            )}

            <div className="h-px bg-gray-100" />

            <div className="flex items-center justify-between text-sm text-gray-400">
              <p>Booking ID: #{appointment.id}</p>
              <p>Booked {moment(appointment.createdAt).fromNow()}</p>
            </div>

            {isCancelled && appointment.cancelledAt && (
              <>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl text-gray-600">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">This appointment was cancelled</p>
                    <p className="text-sm text-gray-500">
                      Cancelled {moment(appointment.cancelledAt).fromNow()}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 pt-0 space-y-3">
            {canCancel && <CancelButton appointmentId={appointment.id} />}
            <Button asChild className="w-full" size="lg">
              <Link href="/book">Book Another Appointment</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
