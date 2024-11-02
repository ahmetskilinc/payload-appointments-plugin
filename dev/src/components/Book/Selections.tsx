"use client";

import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import React from "react";
import { isMobile } from "react-device-detect";
import SelectionsList from "./SelectionsList";
import { Service, TeamMember } from "../../../src/payload-types";

const Selections: React.FC<{
	chosenStaff: TeamMember[];
	chosenServices: Service[];
	chosenDateTime: Date | null;
	setStepIndex: React.Dispatch<React.SetStateAction<number>>;
}> = ({ chosenStaff, chosenServices, chosenDateTime, setStepIndex }) => {
	return (
		<Disclosure
			as="div"
			className="col-span-12 md:col-span-4 !mt-0"
			defaultOpen={!isMobile}
		>
			{({ open }) => (
				<React.Fragment>
					<DisclosureButton
						className="flex w-full items-start justify-between text-left text-gray-900"
						disabled={!isMobile}
					>
						<p className="text-base md:mb-4">Your selection</p>
						<span className="ml-6 flex h-7 items-center md:hidden">
							{open ? (
								<MinusIcon
									aria-hidden="true"
									className="block h-6 w-6 md:hidden"
								/>
							) : (
								<PlusIcon
									aria-hidden="true"
									className="block h-6 w-6 md:hidden"
								/>
							)}
						</span>
					</DisclosureButton>
					<DisclosurePanel as="div" className="space-y-4">
						<SelectionsList
							chosenStaff={chosenStaff}
							chosenServices={chosenServices}
							chosenDateTime={chosenDateTime}
							setStepIndex={setStepIndex}
						/>
					</DisclosurePanel>
				</React.Fragment>
			)}
		</Disclosure>
	);
};

export default Selections;
