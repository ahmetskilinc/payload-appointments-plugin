import { Appointment } from "payload/generated-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import moment from "moment";

type Props = {
  appointments: Appointment[];
};

const Appointments = ({ appointments }: Props) =>
  appointments && appointments.length ? (
    appointments.map((appointment: Appointment) => {
      return (
        <Card className="" key={appointment.id}>
          <CardHeader>
            <CardTitle className="text-base">{moment(appointment.start).format("dddd, MMM Do YYYY")}</CardTitle>
            <CardDescription>
              {moment(appointment.start).format("HH:mm")}
              {" - "}
              {moment(appointment.end).format("HH:mm")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointment.services?.map((service, index) => {
              if (typeof service === "string") return;
              // @ts-expect-error
              const previousServicesDuration = appointment.services!.slice(0, index).reduce((total, s) => total + s.duration, 0);
              const serviceStartTime = moment(appointment.start).add(previousServicesDuration, "minutes");
              const startsAt = serviceStartTime.format("HH:mm");
              return (
                <div key={index} className="mb-2">
                  <p className="text-sm">
                    {startsAt} {service.title} <br />
                    <span className="text-neutral-950/50">with {typeof appointment.host !== "string" ? appointment.host?.firstName : null}</span>
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      );
    })
  ) : (
    <p>No appointments</p>
  );

export default Appointments;
