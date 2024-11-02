"use client";

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { filterByDateAndPeriod } from "../../lib/filterByDateAndPeriod";
import { Service, TeamMember } from "../../../src/payload-types";
import moment from "moment";

const SelectDateTime: React.FC<{
	chosenServices: Service[];
	chosenStaff: TeamMember[];
	setChosenDateTime: React.Dispatch<React.SetStateAction<Date | null>>;
	chosenDateTime: Date | null;
}> = ({ chosenServices, chosenStaff, setChosenDateTime, chosenDateTime }) => {
	const [availabilities, setAvailabilities] = useState<string[]>([]);

	useEffect(() => {
		const getAvailabilities = async () => {
			const data = await fetch(
				`/api/get-available-slots?services=${chosenServices.map((service) => service.id).join(",")}&host=${chosenStaff.map((staff) => staff.id).join(",")}&day=${moment(chosenDateTime).toISOString()}`,
				{
					method: "get",
				},
			);

			const availabilities = await data.json();
			setAvailabilities(availabilities.availableSlotsForDate);
		};

		getAvailabilities();
	}, [chosenDateTime]);

	return (
		<div className="mt-6">
			<React.Fragment>
				<Calendar
					className="!w-full"
					locale="en-GB"
					minDate={new Date()}
					// tileDisabled={({ activeStartDate, date, view }) =>
					// 	availabilities.filter((availability) =>
					// 		moment(availability.startAt).isBetween(
					// 			new Date(
					// 				moment(new Date(date).toISOString())
					// 					.startOf("day")
					// 					.toString(),
					// 			),
					// 			new Date(
					// 				moment(new Date(date).toISOString())
					// 					.endOf("day")
					// 					.toString(),
					// 			),
					// 		),
					// 	).length === 0
					// }
					maxDate={
						new Date(new Date().setMonth(new Date().getMonth() + 1))
					}
					maxDetail="month"
					minDetail="month"
					onChange={(value) =>
						setChosenDateTime(new Date(value!.toString()))
					}
					value={chosenDateTime}
				/>
				{chosenDateTime &&
				availabilities &&
				availabilities.length &&
				availabilities.length > 0 ? (
					<div className="space-y-6 mt-6">
						<p>Morning</p>
						<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
							{filterByDateAndPeriod(
								"morning",
								chosenDateTime,
								availabilities,
							).map((availability) => (
								<div
									className="bg-indigo-500 py-2.5 hover:bg-indigo-600 text-white rounded-sm cursor-pointer"
									key={JSON.stringify(availability)}
								>
									<button
										className="tabular-nums"
										type="button"
										onClick={() =>
											setChosenDateTime(
												moment(availability, "HH:mm")
													.set({
														year: moment(
															chosenDateTime,
														).year(),
														month: moment(
															chosenDateTime,
														).month(),
														date: moment(
															chosenDateTime,
														).date(),
													})
													.toDate(),
											)
										}
									>
										{moment(availability, "HH:mm").format(
											"HH:mm",
										)}
									</button>
								</div>
							))}
						</div>
						<p>Afternoon</p>
						<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
							{filterByDateAndPeriod(
								"afternoon",
								chosenDateTime,
								availabilities,
							).map((availability) => (
								<div
									className="bg-indigo-500 py-2.5 hover:bg-indigo-600 text-white rounded-sm cursor-pointer"
									key={JSON.stringify(availability)}
								>
									<button
										className="tabular-nums"
										type="button"
										onClick={() =>
											setChosenDateTime(
												moment(availability, "HH:mm")
													.set({
														year: moment(
															chosenDateTime,
														).year(),
														month: moment(
															chosenDateTime,
														).month(),
														date: moment(
															chosenDateTime,
														).date(),
													})
													.toDate(),
											)
										}
									>
										{moment(availability, "HH:mm").format(
											"HH:mm",
										)}
									</button>
								</div>
							))}
						</div>
						<p>Evening</p>
						<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
							{filterByDateAndPeriod(
								"evening",
								chosenDateTime,
								availabilities,
							).map((availability) => (
								<div
									className="bg-indigo-500 py-2.5 px-4 hover:bg-indigo-600 text-white rounded-sm cursor-pointer"
									key={JSON.stringify(availability)}
								>
									<button
										className="tabular-nums"
										type="button"
										onClick={() =>
											setChosenDateTime(
												moment(availability, "HH:mm")
													.set({
														year: moment(
															chosenDateTime,
														).year(),
														month: moment(
															chosenDateTime,
														).month(),
														date: moment(
															chosenDateTime,
														).date(),
													})
													.toDate(),
											)
										}
									>
										{moment(availability, "HH:mm").format(
											"HH:mm",
										)}
									</button>
								</div>
							))}
						</div>
					</div>
				) : null}
			</React.Fragment>
		</div>
	);
};

export default SelectDateTime;
