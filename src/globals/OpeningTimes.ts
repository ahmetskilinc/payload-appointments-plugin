import type { GlobalConfig } from "payload";

const timesOfDay = ["opening", "closing"];
const daysOfWeek = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

const OpeningTimes: GlobalConfig = {
	slug: "openingTimes",
	access: { read: () => true },
	admin: { group: "Booking" },
	fields: daysOfWeek.map((day) => ({
		type: "group",
		name: day,
		fields: [
			{
				name: "isOpen",
				type: "checkbox",
				label: `Open on ${day.charAt(0).toUpperCase() + day.slice(1)}`,
				defaultValue: false,
			},
			{
				type: "row",
				admin: { condition: (siblingData) => siblingData[day].isOpen },
				fields: timesOfDay.map((time) => ({
					label: `${time.charAt(0).toUpperCase() + time.slice(1)}`,
					name: `${time}`,
					type: "date",
					required: true,
					admin: {
						date: {
							displayFormat: "h:mm a",
							pickerAppearance: "timeOnly",
						},
						width: "50%",
					},
				})),
			},
		],
	})),
	label: "Opening Times",
};

export default OpeningTimes;
