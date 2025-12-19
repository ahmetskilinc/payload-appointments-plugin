import moment from 'moment';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Service, TeamMember } from '../../../../payload-types';

import { Button } from '../../../../components/ui/button';
import { formatPrice } from '../../../../lib/formatPrice';
import { getAppointmentByToken } from '../../actions/appointment';
import { CancelByTokenButton } from './page.client';

export default async function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const appointment = await getAppointmentByToken(token);

  if (!appointment || appointment.appointmentType !== 'appointment') {
    notFound();
  }

  const host = appointment.host as TeamMember | null;
  const services = (appointment.services || []) as Service[];
  const totalPrice = services.reduce((acc, service) => acc + (service.price || 0), 0);
  const totalDuration = services.reduce((acc, service) => acc + service.duration, 0);

  const startDate = moment(appointment.start);
  const endDate = moment(appointment.end);
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';
  const isPast = startDate.isBefore(moment());
  const canCancel = !isCancelled && !isCompleted && !isPast;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-gray-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className={`glass-card overflow-hidden ${isCancelled ? 'opacity-75' : ''}`}>
          <div className={`p-6 text-white ${isCancelled ? 'bg-gray-600' : 'bg-gray-900'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {isCancelled ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
                      Cancelled
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white">
                      Completed
                    </span>
                  ) : isPast ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      Past
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      Cancel Appointment
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-1">
                  {isCancelled
                    ? 'Appointment Cancelled'
                    : canCancel
                      ? 'Cancel Your Appointment?'
                      : startDate.format('dddd, MMMM Do YYYY')}
                </h1>
                <p className="text-gray-300 text-lg">
                  {startDate.format('dddd, MMMM Do YYYY')} at {startDate.format('HH:mm')} -{' '}
                  {endDate.format('HH:mm')}
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
            {canCancel && (
              <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <svg
                  className="w-6 h-6 text-amber-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-amber-800">
                    Are you sure you want to cancel this appointment?
                  </p>
                  <p className="text-amber-700 text-sm mt-1">
                    This action cannot be undone. You will need to book a new appointment if you
                    change your mind.
                  </p>
                </div>
              </div>
            )}

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
                      className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl ${isCancelled ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-900 bg-gray-200 px-3 py-1.5 rounded-lg tabular-nums">
                          {serviceStartTime.format('HH:mm')}
                        </span>
                        <div>
                          <p
                            className={`font-semibold text-gray-900 ${isCancelled ? 'line-through' : ''}`}
                          >
                            {service.title}
                          </p>
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
                    <p className="font-medium">This appointment has been cancelled</p>
                    <p className="text-sm text-gray-500">
                      Cancelled {moment(appointment.cancelledAt).fromNow()}
                    </p>
                  </div>
                </div>
              </>
            )}

            {!canCancel && !isCancelled && (
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
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">This appointment cannot be cancelled</p>
                    <p className="text-sm text-gray-500">
                      {isCompleted
                        ? 'The appointment has already been completed.'
                        : 'The appointment has already passed.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 pt-0 space-y-3">
            {canCancel && <CancelByTokenButton token={token} />}
            <Button
              asChild
              className="w-full"
              size="lg"
              variant={canCancel ? 'outline' : 'default'}
            >
              <Link href="/book">Book a New Appointment</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

