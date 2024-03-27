import { PayloadRequest } from "payload/types";
import { Appointment, OpeningTimes } from "../types";

import Moment from "moment";
import { extendMoment } from "moment-range";

//localhost:3000/api/appointments/get-slots?services=65f3368a5f3445326e484b9e,65f336925f3445326e484bab&host=65f9f33c3716497d441e47a7&day=2024-03-24T09:00:00.000Z

// @ts-expect-error
const moment = extendMoment(Moment);

export const getAppointmentsForDayAndHost = async (req: PayloadRequest) => {
	const day = req.query.day;
	console.log("day:", moment(day).format("YYYY-MM-DD"));
	const slotInterval = 35;
	const openingTimes: OpeningTimes = await req.payload
		.findGlobal({
			slug: "openingTimes",
		})
		.then((res: OpeningTimes) => {
			return res;
		});

	const openTime = openingTimes[moment(day).format("dddd").toLowerCase()].opening;
	const closeTime = openingTimes[moment(day).format("dddd").toLowerCase()].closing;

	let startTime = moment(openTime);
	let endTime = moment(closeTime);

	const availableSlotsForDate = curateSlots(slotInterval, startTime, endTime);
	const filteredSlots = await filterSlotsForHost(req, day, availableSlotsForDate);

	return { filteredSlots, availableSlotsForDate };
};

const curateSlots = (slotInterval: number, startTime: Moment.Moment, endTime: Moment.Moment) => {
	let allTimes = [];
	const originalStartTime = moment(startTime, "HH:mm");

	while (startTime < endTime) {
		if (startTime.isBetween(originalStartTime.add(-1, "minute"), endTime))
			allTimes.push(startTime.format("HH:mm"));
		startTime.add(slotInterval, "minutes");
	}

	return allTimes;
};

const filterSlotsForHost = async (
	req: PayloadRequest,
	day: string,
	availableSlotsForDate: string[],
) => {
	const allAvailableSlots: string[] = [];

	await req.payload
		.find({
			collection: "appointments",
			depth: 999,
			where: {
				"host.id": {
					equals: req.query.host,
				},
			},
		})
		.then((res: { docs: Appointment[] }) => {
			return availableSlotsForDate.forEach(newAppointmentStartTime => {
				if (
					res.docs.some(doc => {
						console.log("day in some:", moment(day).format("YYYY-MM-DD"));
						return (
							moment(day).format("YYYY-MM-DD") ===
							moment(doc.start).format("YYYY-MM-DD")
						);
					})
				) {
					const newAppointmentSlot = moment.range(
						moment(newAppointmentStartTime, "HH:mm"),
						moment(newAppointmentStartTime, "HH:mm").add(35, "minutes"),
					);

					if (
						res.docs.every(doc => {
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
