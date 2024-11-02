import React from "react";
import moment from "moment";
import { cn } from "../../lib/utils";

const TimeSelectButton = ({
	availability,
	chosenDateTime,
	setChosenDateTime,
}: {
	availability: string;
	chosenDateTime: Date;
	setChosenDateTime: React.Dispatch<React.SetStateAction<Date | null>>;
}) => {
	return (
		<button
			className={cn(
				"bg-indigo-500 py-2.5 hover:bg-indigo-600 text-white rounded-sm cursor-pointer",
				"tabular-nums",
				"transition-colors",
				"text-sm",
				moment(availability, "HH:mm").format("HH:mm") ===
					moment(chosenDateTime, "HH:mm").format("HH:mm")
					? "bg-red-500 hover:bg-red-600"
					: null,
			)}
			key={JSON.stringify(availability)}
			type="button"
			onClick={() =>
				setChosenDateTime(
					moment(availability, "HH:mm")
						.set({
							year: moment(chosenDateTime).year(),
							month: moment(chosenDateTime).month(),
							date: moment(chosenDateTime).date(),
						})
						.toDate(),
				)
			}
		>
			{moment(availability, "HH:mm").format("HH:mm")}
		</button>
	);
};

export default TimeSelectButton;
