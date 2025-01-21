import { FieldHook } from "payload";
import { addMinutes, format } from "date-fns";

export const setEndDateTime: FieldHook = async ({ siblingData, req }) => {
  if (siblingData.appointmentType !== "appointment") {
    return siblingData.end;
  }

  if (!siblingData.services?.length) {
    return format(new Date(siblingData.start), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  }

  try {
    const services = await req.payload.find({
      collection: "services",
      where: {
        id: {
          in: siblingData.services,
        },
      },
      depth: 0,
      limit: siblingData.services.length,
    });

    const totalDuration = services.docs.reduce((total, service) => total + (service.duration || 0), 0);
    const startDate = new Date(siblingData.start);
    return format(addMinutes(startDate, totalDuration), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  } catch (error) {
    req.payload.logger.error(`Error calculating end time: ${error}`);
    return format(new Date(siblingData.start), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  }
};
