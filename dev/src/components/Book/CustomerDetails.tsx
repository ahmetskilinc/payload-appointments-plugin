import React from "react";
import { Service, TeamMember } from "../../../src/payload-types";

const CustomerDetails: React.FC<{
	chosenDateTime: Date | null;
	chosenServices: Service[];
	chosenStaff: TeamMember[];
}> = ({ chosenDateTime, chosenServices, chosenStaff }) => {
	return (
		<div className="flex flex-col gap-2 md:gap-4 mt-6">
			<div className="flex gap-2 md:gap-6 w-full">
				<label className="w-full" htmlFor="firstname">
					<span className="text-sm font-semibold leading-6 text-gray-900">
						First name
					</span>
					<div className="mt-2.5">
						<input
							className="block w-full"
							id="firstname"
							name="firstname"
							placeholder="First name"
							type="text"
						/>
					</div>
				</label>
				<label className="w-full block" htmlFor="lastname">
					<span className="text-sm font-semibold leading-6 text-gray-900">
						Last name
					</span>
					<div className="mt-2.5">
						<input
							className="block w-full"
							id="lastname"
							name="lastname"
							placeholder="Last name"
							type="text"
						/>
					</div>
				</label>
			</div>
			<label className="w-full block" htmlFor="phone">
				<span className="block text-sm font-medium leading-6 text-gray-900">
					Phone
				</span>
				<div className="relative mt-2 rounded-md shadow-sm">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<span className="text-gray-500">+44</span>
					</div>
					<input
						className="block w-full py-1.5 pl-12"
						id="phone"
						name="phone"
						placeholder="0000000000"
						type="text"
					/>
				</div>
			</label>
			<label className="w-full block" htmlFor="email">
				<span className="text-sm font-semibold leading-6 text-gray-900">
					Email
				</span>
				<div className="mt-2.5">
					<input
						className="block w-full"
						id="email"
						name="email"
						placeholder="Email"
						type="text"
					/>
				</div>
			</label>
			<label className="w-full block" htmlFor="message">
				<span className="text-sm font-semibold leading-6 text-gray-900">
					Customer notes (Optional)
				</span>
				<div className="mt-2.5">
					<textarea
						className="block w-full"
						id="message"
						name="message"
						placeholder="Customer notes (Optional)"
						rows={3}
					/>
				</div>
			</label>
		</div>
	);
};

export default CustomerDetails;
