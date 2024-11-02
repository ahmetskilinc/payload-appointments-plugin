import React from "react";
import { millisToMinutes } from "../../lib/millisToMinutes";
import moment from "moment";
import { Service, TeamMember } from "../../../src/payload-types";
import { formatPrice } from "../../lib/formatPrice";

const SelectionsList: React.FC<{
	chosenStaff: TeamMember[];
	chosenServices?: Service[] | null;
	chosenDateTime?: Date | null;
	setStepIndex: React.Dispatch<React.SetStateAction<number>>;
}> = ({ chosenStaff, chosenServices, chosenDateTime, setStepIndex }) => {
	return (
		<React.Fragment>
			{chosenServices?.length ? (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<p>Service{chosenServices?.length > 1 ? "s" : ""}</p>
						<button
							className="hover:underline text-sm text-indigo-500 hover:text-indigo-600"
							onClick={() => setStepIndex(0)}
							type="button"
						>
							Edit
						</button>
					</div>
					<div className="space-y-4">
						{chosenServices.map((service) => (
							<div
								className="bg-gray-100 p-3 shadow-none md:shadow-sm"
								key={service.id}
							>
								<p className="text-gray-900 text-sm">
									{service.title}
								</p>
								<p className="text-gray-500 text-xs">
									{service.duration} mins
								</p>
							</div>
						))}
					</div>
				</div>
			) : null}
			{chosenStaff?.length ? (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<p>Host</p>
						<button
							className="hover:underline text-sm text-indigo-500 hover:text-indigo-600"
							onClick={() => setStepIndex(1)}
							type="button"
						>
							Edit
						</button>
					</div>
					<div className="space-y-6">
						{chosenStaff?.length === 1 ? (
							chosenStaff.map((staff) => (
								<div
									className="bg-gray-100 p-3 shadow-none md:shadow-sm"
									key={staff.id}
								>
									<p className="text-gray-900 text-sm">
										{staff.preferredNameAppointments}
									</p>
								</div>
							))
						) : (
							<div className="bg-gray-100 p-3 shadow-none md:shadow-sm">
								<p className="text-gray-900 text-sm">
									Any available staff member
								</p>
							</div>
						)}
					</div>
				</div>
			) : null}
			{chosenDateTime ? (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<p>Date &amp; time</p>
						<button
							className="hover:underline text-sm text-indigo-500 hover:text-indigo-600"
							onClick={() => setStepIndex(2)}
							type="button"
						>
							Edit
						</button>
					</div>
					<div className="space-y-6">
						<div className="bg-gray-100 p-3 shadow-none md:shadow-sm">
							<p className="text-gray-900 text-sm">
								{moment(chosenDateTime).format(
									"dddd, Do MMMM YYYY",
								)}
								{moment(chosenDateTime).isAfter(
									moment(chosenDateTime).startOf("day"),
								) &&
								moment(chosenDateTime).isSame(
									moment(),
									"hour",
								) === false ? (
									<React.Fragment>
										{" "}
										at{" "}
										{moment(chosenDateTime).format("HH:mm")}
									</React.Fragment>
								) : null}
							</p>
						</div>
					</div>
				</div>
			) : null}
			{!chosenStaff?.length &&
			!chosenServices?.length &&
			!chosenDateTime ? (
				<div className="space-y-2">
					<p className="text-gray-500 text-xs">
						You havent made any selections yet.
					</p>
				</div>
			) : null}
			{chosenServices?.length ? (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<p>Total price</p>
					</div>
					<div className="space-y-4">
						<div className="bg-gray-100 p-3 shadow-none md:shadow-sm">
							<p className="text-gray-900 text-sm">
								{formatPrice(
									chosenServices.reduce(
										(acc, { price }) => acc + Number(price),
										0,
									),
								)}
							</p>
						</div>
					</div>
				</div>
			) : null}
		</React.Fragment>
	);
};

export default SelectionsList;
