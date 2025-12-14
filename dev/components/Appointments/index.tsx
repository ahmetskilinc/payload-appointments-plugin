import moment from 'moment';
import Link from 'next/link';

import type { Appointment, Service } from '../../payload-types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type Props = {
  appointments: Appointment[];
};

const Appointments = ({ appointments }: Props) =>
  appointments && appointments.length ? (
    appointments.map((appointment: Appointment, index: number) => {
      return (
        <Link href={`/booking/${appointment.id}`} key={appointment.id}>
          <Card
            className="border-0 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-gray-900/10 transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm animate-fade-in-up cursor-pointer"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/25">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {moment(appointment.start).format('dddd, MMM Do')}
                  </CardTitle>
                  <CardDescription className="text-gray-900 font-semibold flex items-center gap-2 mt-0.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {moment(appointment.start).format('HH:mm')}
                    {' - '}
                    {moment(appointment.end).format('HH:mm')}
                  </CardDescription>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 border-t border-gray-100 pt-4">
                {appointment.services?.map((service, index) => {
                  if (typeof service === 'string') {
                    return;
                  }
                  const previousServicesDuration = appointment
                    .services!.slice(0, index)
                    .reduce(
                      (total: number, s) =>
                        total + (typeof s === 'string' ? 0 : (s as unknown as Service).duration),
                      0,
                    );
                  const serviceStartTime = moment(appointment.start).add(
                    previousServicesDuration,
                    'minutes',
                  );
                  const startsAt = serviceStartTime.format('HH:mm');
                  return (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80"
                      key={index}
                    >
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg tabular-nums">
                        {startsAt}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {service && typeof service === 'object' ? service.title : ''}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
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
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                          with{' '}
                          {typeof appointment.host !== 'string' &&
                          typeof appointment.host === 'object'
                            ? appointment.host?.firstName
                            : null}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    })
  ) : (
    <div className="text-center py-16 animate-fade-in-up">
      <div className="mx-auto w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5 shadow-lg shadow-gray-900/5">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments yet</h3>
      <p className="text-gray-500 max-w-xs mx-auto">
        Book your first appointment to get started with your schedule
      </p>
    </div>
  );

export default Appointments;
