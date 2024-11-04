"use server";

import configPromise from "@payload-config";
import { getPayloadHMR } from "@payloadcms/next/utilities";
import moment from "moment";

async function createAppointment(host: string, customer: string, services: string[], start: Date) {
  const payload = await getPayloadHMR({ config: configPromise });
  const response = await payload.create({
    collection: "appointments",
    overrideAccess: false,
    data: {
      host,
      customer,
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
