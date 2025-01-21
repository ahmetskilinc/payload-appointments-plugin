import { PayloadHandler, PayloadRequest } from "payload";
import moment from "moment";

const curateSlots = (slotInterval: number, startTime: string, endTime: string): string[] => {
  const slots: string[] = [];
  let current = moment(startTime);
  const end = moment(endTime);

  while (current.isBefore(end)) {
    slots.push(current.format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
    current.add(slotInterval, "minutes");
  }

  return slots;
};

const filterSlotsForHost = async (
  req: PayloadRequest,
  day: string,
  availableSlots: string[],
  slotInterval: number
): Promise<string[]> => {
  const startOfDay = moment(day).startOf("day");
  const endOfDay = moment(day).endOf("day");

  const existingAppointments = await req.payload.find({
    collection: "appointments",
    where: {
      start: {
        greater_than_equal: startOfDay.toISOString(),
        less_than_equal: endOfDay.toISOString()
      }
    },
    depth: 0
  });

  const bookedSlots = new Set(
    existingAppointments.docs.map(appointment => 
      moment(appointment.start).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
    )
  );

  return availableSlots.filter(slot => !bookedSlots.has(slot));
};

export const getAppointmentsForDayAndHost: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const { services, day } = req.query;

    if (!services || !day || typeof services !== "string" || typeof day !== "string") {
      return Response.json(
        { error: "Missing or invalid services or day parameter" },
        { status: 400 }
      );
    }

    const servicesArray = services.split(",");
    const servicesData = await req.payload.find({
      collection: "services",
      where: {
        id: {
          in: servicesArray
        }
      },
      depth: 0
    });

    const slotInterval = servicesData.docs.reduce(
      (total, service) => total + (service.duration || 0),
      0
    );

    const openingTimes = await req.payload.findGlobal({ 
      slug: "openingTimes",
      depth: 0
    });
    
    const dayOfWeek = moment(day).format("dddd").toLowerCase();
    
    if (!openingTimes || !openingTimes[dayOfWeek]) {
      return Response.json(
        { error: "Opening times not configured for this day" },
        { status: 400 }
      );
    }

    const { opening, closing } = openingTimes[dayOfWeek];
    const startTime = moment(opening, "HH:mm");
    const endTime = moment(closing, "HH:mm");

    const availableSlots = curateSlots(slotInterval, startTime.toISOString(), endTime.toISOString());
    const filteredSlots = await filterSlotsForHost(req, day, availableSlots, slotInterval);

    return Response.json({
      availableSlots,
      filteredSlots
    });
  } catch (error) {
    req.payload.logger.error(`Error getting appointments: ${error}`);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
