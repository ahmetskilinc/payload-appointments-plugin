import moment from 'moment'

import type { Appointment, Service } from '../../payload-types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

type Props = {
  appointments: Appointment[]
}

const Appointments = ({ appointments }: Props) =>
  appointments && appointments.length ? (
    appointments.map((appointment: Appointment) => {
      return (
        <Card
          className="border-0 shadow-md shadow-gray-200/50 hover:shadow-lg transition-shadow duration-200"
          key={appointment.id}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-violet-600"
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
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  {moment(appointment.start).format('dddd, MMM Do YYYY')}
                </CardTitle>
                <CardDescription className="text-violet-600 font-medium">
                  {moment(appointment.start).format('HH:mm')}
                  {' - '}
                  {moment(appointment.end).format('HH:mm')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 border-t border-gray-100 pt-3">
              {appointment.services?.map((service, index) => {
                if (typeof service === 'string') {
                  return
                }
                const previousServicesDuration = appointment
                  .services!.slice(0, index)
                  .reduce(
                    (total: number, s) =>
                      total + (typeof s === 'string' ? 0 : (s as unknown as Service).duration),
                    0,
                  )
                const serviceStartTime = moment(appointment.start).add(
                  previousServicesDuration,
                  'minutes',
                )
                const startsAt = serviceStartTime.format('HH:mm')
                return (
                  <div className="flex items-center gap-2" key={index}>
                    <span className="text-xs font-medium text-gray-400 w-12">{startsAt}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {service && typeof service === 'object' ? service.title : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        with{' '}
                        {typeof appointment.host !== 'string' &&
                        typeof appointment.host === 'object'
                          ? appointment.host?.firstName
                          : null}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )
    })
  ) : (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
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
      <h3 className="text-lg font-semibold text-gray-900 mb-1">No appointments yet</h3>
      <p className="text-gray-500 text-sm">Book your first appointment to get started</p>
    </div>
  )

export default Appointments
