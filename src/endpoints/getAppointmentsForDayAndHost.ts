import { addMinutes, areIntervalsOverlapping, endOfDay, format, isBefore, isEqual, parse, startOfDay } from "date-fns";
import { PayloadHandler, PayloadRequest } from "payload";

function isSameOrBefore(date1: Date, date2: Date) {
  return isBefore(date1, date2) || isEqual(date1, date2);
}

export const getAppointmentsForDayAndHost: PayloadHandler = async (req: PayloadRequest) => {
  try {
    const services = req.query.services;
    const day = req.query.day;
    if (!services || !day || typeof services !== "string" || typeof day !== "string") {
      return Response.json({ error: { message: "Invalid request" } }, { status: 500 });
    }

    const durations = await Promise.all(
      await req.payload
        .find({
          collection: "services",
        })
        .then((res) => {
          return res.docs.filter((obj) => services.includes(String(obj.id)));
        })
    ).catch((error: any) => {
      console.error(error);
      return [];
    });

    let slotInterval = 0;
    durations.forEach((el) => (slotInterval += el.duration));

    const openingTimes = await req.payload
      .findGlobal({
        slug: "openingTimes",
      })
      .then((res) => {
        return res;
      });

    const dayOfWeek = format(new Date(day), "EEEE").toLowerCase();
    const openTime = openingTimes[dayOfWeek].opening;
    const closeTime = openingTimes[dayOfWeek].closing;

    const startTime = parse(openTime, "HH:mm", new Date(day));
    const endTime = parse(closeTime, "HH:mm", new Date(day));

    const availableSlotsForDate = curateSlots(slotInterval, startTime, endTime);
    const filteredSlots = await filterSlotsForHost(req, day, availableSlotsForDate, slotInterval);

    return Response.json({ filteredSlots, availableSlotsForDate }, { status: 200 });
  } catch (error) {
    req.payload.logger.error(error);
    return Response.json({ error: { message: error } }, { status: 500 });
  }
};

const curateSlots = (slotInterval: number, startTime: Date, endTime: Date): string[] => {
  const allTimes: string[] = [];
  let currentTime = startTime;

  while (isBefore(currentTime, endTime)) {
    allTimes.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, slotInterval);
  }

  return allTimes;
};

const filterSlotsForHost = async (req: PayloadRequest, day: string, availableSlotsForDate: string[], slotInterval: number): Promise<string[]> => {
  const appointments = await req.payload.find({
    collection: "appointments",
    where: {
      "host.id": {
        equals: req.query.host,
      },
      start: {
        greater_than_equal: startOfDay(new Date(day)),
        less_than: endOfDay(new Date(day)),
      },
    },
  });

  const now = new Date();
  const thirtyMinutesFromNow = addMinutes(now, 30);

  const filteredSlots = availableSlotsForDate.filter((newAppointmentStartTime) => {
    const newAppointmentStart = parse(newAppointmentStartTime, "HH:mm", new Date(day));
    const newAppointmentEnd = addMinutes(newAppointmentStart, slotInterval);

    // Check if the appointment start time has passed or is less than 30 minutes from now
    if (isSameOrBefore(newAppointmentStart, now) || isBefore(newAppointmentStart, thirtyMinutesFromNow)) {
      return false;
    }

    return appointments.docs.every((doc) => {
      return !areIntervalsOverlapping({ start: newAppointmentStart, end: newAppointmentEnd }, { start: new Date(doc.start), end: new Date(doc.end) });
    });
  });

  return filteredSlots.sort((a, b) => {
    const dateA = parse(a, "HH:mm", new Date());
    const dateB = parse(b, "HH:mm", new Date());
    return dateA.getTime() - dateB.getTime();
  });
};
