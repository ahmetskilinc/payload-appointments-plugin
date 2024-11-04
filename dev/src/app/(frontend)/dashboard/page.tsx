import { cookies } from "next/headers";
import { logout } from "../actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { Appointment } from "../../../payload-types";
import moment from "moment";

import { getDashboardData } from "@lib/dashboardData";

const SERVER_URL = process.env.SERVER_URL;

const fetchAppointmentsForCustomer = async (id: string, email: string) => {
  const response = await fetch(`${SERVER_URL}/api/auth/get-appointments`, {
    method: "post",
    body: JSON.stringify({ id, email }),
  });

  const { data } = await response.json();
  return data as Appointment[];
};

export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_token");

  if (!session) {
    redirect("/login");
  }

  let dashboardData;
  let appointments;
  try {
    dashboardData = await getDashboardData();
    appointments = await fetchAppointmentsForCustomer(dashboardData.user.id, dashboardData.user.email);
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-4">Failed to load dashboard data. Please try logging in again.</p>
        <form action={logout}>
          <Button type="submit">Logout</Button>
        </form>
      </div>
    );
  }

  const currentDate = new Date();

  // @ts-expect-error
  const upcomingAppointments = appointments.filter((appointment) => new Date(appointment.start) >= currentDate);
  // @ts-expect-error
  const pastAppointments = appointments.filter((appointment) => new Date(appointment.start) < currentDate);

  return (
    <div className="w-screen flex justify-center py-4 px-4">
      <Tabs defaultValue="upcoming" className="w-[520px]">
        <TabsList className="w-full flex">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {upcomingAppointments && upcomingAppointments.length ? (
            upcomingAppointments.map((appointment: Appointment) => {
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

                      // @ts-ignore
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
          )}
        </TabsContent>
        <TabsContent value="past">
          {pastAppointments && pastAppointments.length ? (
            pastAppointments.map((appointment: Appointment) => {
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

                      // @ts-ignore
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
