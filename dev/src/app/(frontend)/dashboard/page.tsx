import { cookies } from "next/headers";
import { logout } from "../actions/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { Appointment } from "../../../payload-types";
import { getDashboardData } from "@lib/dashboardData";
import AppointmentsList from "@components/Appointments";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_token");

  if (!session) {
    redirect("/login");
  }

  let dashboardData;
  try {
    dashboardData = await getDashboardData();
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

  const appointments = dashboardData.user.appointments.docs as Appointment[];
  const currentDate = new Date();

  const upcomingAppointments = appointments.filter((appointment) => new Date(appointment.start!) >= currentDate);
  const pastAppointments = appointments.filter((appointment) => new Date(appointment.start!) < currentDate);

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
          <div className="flex flex-col gap-4">
            <AppointmentsList appointments={upcomingAppointments} />
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="flex flex-col gap-4">
            <AppointmentsList appointments={pastAppointments} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
