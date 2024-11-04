import { PayloadHandler, PayloadRequest } from "payload";
import { Service } from "../types";
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
    const durations = (await req.payload
      .find({
        collection: "services",
      })
      .then((res) => {
        return res.docs.filter((obj) => services?.includes(String(obj.id)));
      })
      .catch((error: any) => {
        console.error(error);
        return [];
      })) as Service[];

    let slotInterval = 0;
    durations.forEach((el) => (slotInterval += el.duration));

    const openingTimes = await req.payload
      .findGlobal({
        slug: "openingTimes",
      })
      .then((res) => {
        return res;
      });

    // @ts-expect-error
    const openTime = openingTimes[moment(day).format("dddd").toString().toLowerCase()].opening;
    // @ts-expect-error
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
    if (startTime.isBetween(originalStartTime.subtract(1, "minute"), endTime)) allTimes.push(startTime.format("HH:mm"));
    startTime.add(slotInterval, "minutes");
  }

  return allTimes;
};

const filterSlotsForHost = async (req: PayloadRequest, day: string, availableSlotsForDate: string[], slotInterval: number) => {
  const allAvailableSlots: string[] = [];
  await req.payload
    .find({
      collection: "appointments",
      depth: 999,
      where: {
        "host.id": {
          equals: req.query.host,
        },
        start: {
          greater_than: moment().startOf("day").add(-1, "day").toString(),
        },
      },
    })
    .then((res) => {
      return availableSlotsForDate.forEach((newAppointmentStartTime) => {
        if (
          res.docs.some((doc) => {
            return moment(day).format("YYYY-MM-DD") === moment(doc.start).format("YYYY-MM-DD");
          })
        ) {
          const newAppointmentSlot = moment.range(
            moment(newAppointmentStartTime, "HH:mm"),
            moment(newAppointmentStartTime, "HH:mm").add(slotInterval, "minutes")
          );

          if (
            res.docs.every((doc) => {
              const existingSlot = moment.range(moment(doc.start), moment(doc.end));
              return !newAppointmentSlot.overlaps(existingSlot);
            })
          ) {
            allAvailableSlots.push(newAppointmentStartTime);
          }
        } else {
          allAvailableSlots.push(newAppointmentStartTime);
        }
      });
    });

  const uniqueSlots = new Set(allAvailableSlots);
  return Array.from(uniqueSlots).sort((a, b) => moment(a, "HH:mm").diff(moment(b, "HH:mm")));
};
