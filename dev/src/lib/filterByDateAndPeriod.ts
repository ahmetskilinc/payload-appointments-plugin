import moment from "moment";

export function filterByDateAndPeriod(
	period: "afternoon" | "evening" | "morning",
	chosenDateTime: Date,
	availableSlotsForDate: string[],
) {
	const startOfDay = moment(chosenDateTime).startOf("day");

	const timeRanges = {
		morning: {
			start: moment(startOfDay).set({ hour: 8, minute: 59, second: 0 }),
			end: moment(startOfDay).set({ hour: 11, minute: 59, second: 59 }),
		},
		afternoon: {
			start: moment(startOfDay).set({ hour: 11, minute: 59, second: 0 }),
			end: moment(startOfDay).set({ hour: 15, minute: 59, second: 59 }),
		},
		evening: {
			start: moment(startOfDay).set({ hour: 15, minute: 59, second: 0 }),
			end: moment(startOfDay).set({ hour: 19, minute: 0, second: 0 }),
		},
	};

	const currentRange = timeRanges[period];

	if (!currentRange) {
		console.error(`Invalid period: ${period}`);
		return [];
	}

	const filtered = availableSlotsForDate.filter((availability) => {
		const availabilityMoment = moment(availability, "HH:mm").set({
			year: moment(chosenDateTime).year(),
			month: moment(chosenDateTime).month(),
			date: moment(chosenDateTime).date(),
		});
		const range = availabilityMoment.isBetween(
			currentRange.start,
			currentRange.end,
			"minute",
		);
		return range;
	});

	return filtered;
}
