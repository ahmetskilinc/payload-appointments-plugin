"use client";

import React, { useState } from "react";

import BarbersList from "./BarbersList";
import CustomerDetails from "./CustomerDetails";
import SelectDateTime from "./SelectDateTime";
import ServiceCategoriesList from "./ServiceCategoriesList";
import Selections from "./Selections";
import { cn } from "../../lib/utils";
import { Service, TeamMember } from "../../payload-types";

const BookNow: React.FC<{ services: Service[]; teamMembers: TeamMember[] }> = ({
	services,
	teamMembers,
}) => {
	const [chosenStaff, setChosenStaff] = useState<TeamMember[]>([]);
	const [chosenServices, setChosenServices] = useState<Service[]>([]);
	const [chosenDateTime, setChosenDateTime] = useState<Date | null>(null);
	const [stepIndex, setStepIndex] = useState<number>(0);

	const nextStep = () => {
		setStepIndex(stepIndex + 1);
		window.scrollTo({ top: 0 });
	};

	const prevStep = () => {
		setStepIndex(stepIndex - 1);
		window.scrollTo({ top: 0 });
	};

	const isContinueDisabled = () => {
		if (stepIndex === 0) {
			return !chosenServices?.length;
		} else if (stepIndex === 1) {
			return !chosenStaff;
		} else if (stepIndex === 2) {
			return !chosenDateTime;
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="grid grid-cols-12 gap-4 md:gap-8">
				<Selections
					chosenStaff={chosenStaff}
					chosenServices={chosenServices}
					chosenDateTime={chosenDateTime}
					setStepIndex={setStepIndex}
				/>
				<div className="col-span-12 md:col-span-8">
					<div className="flex justify-between items-start">
						{stepIndex === 0 ? (
							<div>
								<p className="text-base mb-1">
									Available services
								</p>
								<p className="text-xs mb-6 text-gray-500">
									Select one or more services
								</p>
							</div>
						) : stepIndex === 1 ? (
							<div>
								<p className="text-base mb-1">
									Available staff
								</p>
								<p className="text-xs mb-6 text-gray-500">
									Select one staff member
								</p>
							</div>
						) : stepIndex === 2 ? (
							<div>
								<p className="text-base mb-1">
									Available dates and times
								</p>
							</div>
						) : stepIndex === 3 ? (
							<div>
								<p className="text-base mb-1">Your details</p>
							</div>
						) : null}
					</div>
					<div className={cn(stepIndex === 0 ? "block" : "hidden")}>
						<ServiceCategoriesList
							setChosenServices={setChosenServices}
							chosenServices={chosenServices}
							services={services}
						/>
					</div>

					<div className={cn(stepIndex === 1 ? "block" : "hidden")}>
						<BarbersList
							setChosenStaff={setChosenStaff}
							chosenStaff={chosenStaff}
							teamMembers={teamMembers}
						/>
					</div>

					<div className={cn(stepIndex === 2 ? "block" : "hidden")}>
						{stepIndex === 2 ? (
							<SelectDateTime
								setChosenDateTime={setChosenDateTime}
								chosenDateTime={chosenDateTime}
								chosenStaff={chosenStaff}
								chosenServices={chosenServices}
							/>
						) : null}
					</div>
					<div className={cn(stepIndex === 3 ? "block" : "hidden")}>
						<CustomerDetails
							chosenDateTime={chosenDateTime}
							chosenStaff={chosenStaff}
							chosenServices={chosenServices}
						/>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-12 gap-4 md:gap-8 mt-6">
				<div className="col-span-12 md:col-span-8 md:col-start-5 flex justify-between">
					{stepIndex !== 0 ? (
						<button
							className="py-2.5 px-6 ring-inset ring-1 ring-indigo-600 hover:ring-indigo-500 hover:bg-indigo-500 text-black hover:text-white transition-colors"
							type="button"
							onClick={prevStep}
						>
							Back
						</button>
					) : (
						<span className="" />
					)}
					{stepIndex <= 2 ? (
						<button
							className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:bg-gray-400"
							type="button"
							onClick={nextStep}
							disabled={isContinueDisabled()}
						>
							Continue
						</button>
					) : (
						<button
							className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
							type="button"
							// onClick={() => setStepIndex(stepIndex + 1)}
						>
							Book now
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default BookNow;
