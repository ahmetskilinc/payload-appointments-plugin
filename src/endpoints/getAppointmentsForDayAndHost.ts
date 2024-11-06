import { PayloadHandler, PayloadRequest } from "payload";
import Moment from "moment";
import { extendMoment } from "moment-range";

// @ts-expect-error
const moment = extendMoment(Moment);

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

    // @ts-ignore
    const openTime = openingTimes[moment(day).format("dddd").toString().toLowerCase()].opening;
    // @ts-ignore
    const closeTime = openingTimes[moment(day).format("dddd").toString().toLowerCase()].closing;

    let startTime = moment(openTime);
    let endTime = moment(closeTime);

    const availableSlotsForDate = curateSlots(slotInterval, startTime, endTime);
    const filteredSlots = await filterSlotsForHost(req, day, availableSlotsForDate, slotInterval);

    return Response.json({ filteredSlots, availableSlotsForDate }, { status: 200 });
  } catch (error) {
    req.payload.logger.error(error);
    return Response.json({ error: { message: error } }, { status: 500 });
  }
};

const curateSlots = (slotInterval: number, startTime: Moment.Moment, endTime: Moment.Moment) => {
  let allTimes = [];
  const originalStartTime = moment(startTime, "HH:mm");

  while (startTime < endTime) {
    if (startTime.isBetween(originalStartTime.add(-1, "minute"), endTime)) allTimes.push(startTime.format("HH:mm"));
    startTime.add(slotInterval, "minutes");
  }

  return allTimes;
};

const filterSlotsForHost = async (req: PayloadRequest, day: string, availableSlotsForDate: string[], slotInterval: number) => {
  const appointments = await req.payload.find({
    collection: "appointments",
    where: {
      "host.id": {
        equals: req.query.host,
      },
      start: {
        greater_than_equal: moment(day).startOf("day").toDate(),
        less_than: moment(day).endOf("day").toDate(),
      },
    },
  });

  const now = moment();
  const thirtyMinutesFromNow = moment().add(30, "minutes");

  const filteredSlots = availableSlotsForDate.filter((newAppointmentStartTime) => {
    const newAppointmentStart = moment(`${day} ${newAppointmentStartTime}`, "YYYY-MM-DD HH:mm");
    const newAppointmentEnd = moment(newAppointmentStart).add(slotInterval, "minutes");
    const newAppointmentSlot = moment.range(newAppointmentStart, newAppointmentEnd);

    // Check if the appointment start time has passed or is less than 30 minutes from now
    if (newAppointmentStart.isSameOrBefore(now) || newAppointmentStart.isBefore(thirtyMinutesFromNow)) {
      return false;
    }

    return appointments.docs.every((doc) => {
      const existingSlot = moment.range(moment(doc.start), moment(doc.end));
      return !newAppointmentSlot.overlaps(existingSlot);
    });
  });

  return filteredSlots.sort((a, b) => moment(a, "HH:mm").diff(moment(b, "HH:mm")));
};
