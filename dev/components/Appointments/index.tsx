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
        <Card className="" key={appointment.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {moment(appointment.start).format('dddd, MMM Do YYYY')}
            </CardTitle>
            <CardDescription>
              {moment(appointment.start).format('HH:mm')}
              {' - '}
              {moment(appointment.end).format('HH:mm')}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <div className="mb-2" key={index}>
                  <p className="text-sm">
                    {startsAt} {service && typeof service === 'object' ? service.title : ''} <br />
                    <span className="text-neutral-950/50">
                      with{' '}
                      {typeof appointment.host !== 'string' && typeof appointment.host === 'object'
                        ? appointment.host?.firstName
                        : null}
                    </span>
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )
    })
  ) : (
    <p>No appointments</p>
  )

export default Appointments
