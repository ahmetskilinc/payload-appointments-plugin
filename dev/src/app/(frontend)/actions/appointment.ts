"use server";

import { getDashboardData } from "@lib/dashboardData";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import moment from "moment";

export async function createAppointment(host: string, services: string[], start: Date) {
  const customer = await getDashboardData();
  const payload = await getPayload({ config: configPromise });
  const response = await payload.create({
    collection: "appointments",
    overrideAccess: false,
    user: customer,
    data: {
      host,
      customer: customer.user.id,
      services,
      appointmentType: "appointment",
      start: moment(start).toISOString(),
    },
  });

  if (!response.id) {
    throw new Error("Login failed");
  }

  return {
    success: true,
    message: "Appointment created successfully",
  };
}
