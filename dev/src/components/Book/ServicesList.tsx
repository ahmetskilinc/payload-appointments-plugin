import React from "react";
import { formatPrice } from "../../lib/formatPrice";
import { Service } from "../../payload-types";

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
						<input
							defaultChecked={false}
							id={service.id}
							name={service.id}
							type="checkbox"
							className="mr-3"
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
					</label>
				);
			})}
		</div>
	);
};

export default ServicesList;
