import { FieldHook } from "payload/types";
import moment from "moment";
import { Service } from "../types";

export const setEndDateTime: FieldHook = async ({ siblingData, req }) => {
	const durations = await Promise.all(
		siblingData.services.map((service: string) => {
			return req.payload
				.findByID({
					collection: "services",
					id: service,
				})
				.then((res: Service) => {
					return res.duration;
				});
		}),
	).catch((error: any) => {
		console.error(error);
		return [0];
	});

	let totalDuration = 0;
	durations.forEach(el => (totalDuration += el));

	const end = moment(siblingData.start).add(totalDuration, "minutes");
	return moment(end).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
};
