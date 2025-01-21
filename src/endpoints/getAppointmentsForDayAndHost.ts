import { PayloadHandler, PayloadRequest } from "payload";
import { parseISO, format, startOfDay, endOfDay, addMinutes, isBefore } from "date-fns";

const curateSlots = (slotInterval: number, startTime: Date, endTime: Date): string[] => {
  const slots: string[] = [];
  let current = startTime;

  while (isBefore(current, endTime)) {
    slots.push(format(current, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
    current = addMinutes(current, slotInterval);
  }

  return slots;
};

const filterSlotsForHost = async (
  req: PayloadRequest,
  day: string,
  availableSlots: string[],
  slotInterval: number
): Promise<string[]> => {
  const dayStart = startOfDay(parseISO(day));
  const dayEnd = endOfDay(parseISO(day));

  // Use index hints for Payload v3
  const existingAppointments = await req.payload.find({
    collection: "appointments",
    where: {
      and: [
        {
          start: {
            greater_than_equal: dayStart.toISOString(),
          }
        },
        {
          start: {
            less_than_equal: dayEnd.toISOString(),
          }
        }
      ]
    },
    depth: 0, // Optimize by not populating relations
    limit: 100 // Add reasonable limit
  });

  const bookedSlots = new Set(
    existingAppointments.docs.map(appointment => 
      format(new Date(appointment.start), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
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
      depth: 0 // Optimize by not populating relations
    });

    const slotInterval = servicesData.docs.reduce(
      (total, service) => total + (service.duration || 0),
      0
    );

    const openingTimes = await req.payload.findGlobal({
      slug: "openingTimes",
      depth: 0 // Optimize by not populating relations
    });
    
    const dayOfWeek = format(parseISO(day), "EEEE").toLowerCase();
    
    if (!openingTimes || !openingTimes[dayOfWeek]) {
      return Response.json(
        { error: "Opening times not configured for this day" },
        { status: 400 }
      );
    }

    const { opening, closing } = openingTimes[dayOfWeek];
    const [openingHour, openingMinute] = opening.split(":").map(Number);
    const [closingHour, closingMinute] = closing.split(":").map(Number);
    
    const dayDate = parseISO(day);
    const startTime = new Date(dayDate.setHours(openingHour, openingMinute, 0, 0));
    const endTime = new Date(dayDate.setHours(closingHour, closingMinute, 0, 0));

    const availableSlots = curateSlots(slotInterval, startTime, endTime);
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
