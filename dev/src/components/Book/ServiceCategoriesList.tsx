"use client";

import { Disclosure, DisclosurePanel } from "@headlessui/react";
import React from "react";
import { isMobile } from "react-device-detect";
import { formatPrice } from "../../lib/formatPrice";
import { millisToMinutes } from "../../lib/millisToMinutes";
import { Service } from "../../../src/payload-types";

const ServiceCategoriesList: React.FC<{
	setChosenServices: React.Dispatch<React.SetStateAction<Service[]>>;
	chosenServices: Service[];
	services: Service[];
}> = ({ setChosenServices, chosenServices, services }) => {
	return (
		<div className="space-y-6">
			<Disclosure as="div" defaultOpen={!isMobile}>
				{({ open }) => (
					<React.Fragment>
						<DisclosurePanel
							as="div"
							className="space-y-4 mt-3"
							unmount={false}
						>
							<ServicesList
								setChosenServices={setChosenServices}
								chosenServices={chosenServices}
								services={services}
							/>
						</DisclosurePanel>
					</React.Fragment>
				)}
			</Disclosure>
		</div>
	);
};

export default ServiceCategoriesList;

const ServicesList: React.FC<{
	setChosenServices: React.Dispatch<React.SetStateAction<Service[]>>;
	chosenServices: Service[];
	services: Service[];
}> = ({ setChosenServices, chosenServices, services }) => {
	return (
		<div className="divide-y divide-gray-100 overflow-hidden bg-white shadow-none md:shadow-sm ring-1 ring-gray-900/5">
			{services.map((service) => {
				return (
					<label
						className="relative flex justify-between gap-x-6 p-2 hover:bg-gray-50 md:p-3 cursor-pointer"
						htmlFor={service.id}
						key={service.id}
					>
						<div className="flex min-w-0 gap-x-4">
							<div className="min-w-0 flex-auto">
								<p className="text-sm font-semibold leading-6 text-gray-900">
									{service.title}
								</p>
								<p className="mt-1 flex text-xs leading-5 text-gray-500">
									{formatPrice(
										Number(
											service.price
												?.toString()
												.slice(0, 2),
										),
									)}{" "}
									· {service.duration} minutes
								</p>
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-x-4">
							<input
								defaultChecked={false}
								id={service.id}
								name={service.id}
								type="checkbox"
								onChange={(e) => {
									if (chosenServices) {
										if (e.target.checked) {
											setChosenServices((prevState) => [
												...prevState,
												service,
											]);
										} else {
											setChosenServices((prevState) => [
												...prevState.filter(
													(prevStateService) =>
														prevStateService.id !==
														service.id,
												),
											]);
										}
									} else {
										setChosenServices([service]);
									}
								}}
							/>
						</div>
					</label>
				);
			})}
		</div>
	);
};
