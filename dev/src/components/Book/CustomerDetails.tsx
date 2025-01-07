import React from "react";
import { Service, TeamMember } from "../../../src/payload-types";

const CustomerDetails: React.FC<{
  chosenDateTime: Date | null;
  chosenServices: Service[];
  chosenStaff: TeamMember | null;
  setCustomerDetails: React.Dispatch<
    React.SetStateAction<{
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      notes: string;
    }>
  >;
  customerDetails: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    notes: string;
  };
}> = ({ chosenDateTime, chosenServices, chosenStaff, customerDetails, setCustomerDetails }) => {
  return (
    <div className="flex flex-col gap-2 md:gap-4 mt-6">
      <div className="flex gap-2 md:gap-6 w-full">
        <label className="w-full" htmlFor="chosenServices">
          <span className="text-sm font-semibold leading-6 text-gray-900">Services</span>
          <div className="mt-2.5">
            <input
              className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              id="chosenServices"
              name="chosenServices"
              type="text"
              disabled
              value={chosenServices.map((service) => service.id)}
            />
          </div>
        </label>
        <label className="w-full block" htmlFor="host">
          <span className="text-sm font-semibold leading-6 text-gray-900">Host</span>
          <div className="mt-2.5">
            <input
              className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              id="host"
              disabled
              name="host"
              type="text"
              value={chosenStaff?.id}
              onChange={() => {}}
            />
          </div>
        </label>
      </div>
      <label className="w-full block" htmlFor="host">
        <span className="text-sm font-semibold leading-6 text-gray-900">Date/Time</span>
        <div className="mt-2.5">
          <input
            className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
            id="host"
            disabled
            name="host"
            type="text"
            value={chosenDateTime?.toISOString()}
          />
        </div>
      </label>
      <label className="w-full block" htmlFor="message">
        <span className="text-sm font-semibold leading-6 text-gray-900">Customer notes (optional)</span>
        <div className="mt-2.5">
          <textarea
            className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
            id="message"
            name="message"
            placeholder="Customer notes (Optional)"
            rows={3}
            value={customerDetails.notes}
            onChange={(e) => {
              setCustomerDetails({
                ...customerDetails,
                notes: e.currentTarget.value,
              });
            }}
          />
        </div>
      </label>
    </div>
  );
};

export default CustomerDetails;
