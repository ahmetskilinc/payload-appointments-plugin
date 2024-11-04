import React from "react";
import { Service, TeamMember } from "../../../src/payload-types";

const CustomerDetails: React.FC<{
  chosenDateTime: Date | null;
  chosenServices: Service[];
  chosenStaff: TeamMember[];
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
        <label className="w-full" htmlFor="firstname">
          <span className="text-sm font-semibold leading-6 text-gray-900">First name</span>
          <div className="mt-2.5">
            <input
              className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              id="firstname"
              name="firstname"
              placeholder="First name"
              type="text"
              value={customerDetails.firstName}
              onChange={(e) => {
                setCustomerDetails({
                  ...customerDetails,
                  firstName: e.currentTarget.value,
                });
              }}
            />
          </div>
        </label>
        <label className="w-full block" htmlFor="lastname">
          <span className="text-sm font-semibold leading-6 text-gray-900">Last name</span>
          <div className="mt-2.5">
            <input
              className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              id="lastname"
              name="lastname"
              placeholder="Last name"
              type="text"
              value={customerDetails.lastName}
              onChange={(e) => {
                setCustomerDetails({
                  ...customerDetails,
                  lastName: e.currentTarget.value,
                });
              }}
            />
          </div>
        </label>
      </div>
      <div className="flex gap-2 md:gap-6 w-full">
        <label className="w-full block" htmlFor="phone">
          <span className="block text-sm font-medium leading-6 text-gray-900">Phone</span>
          <div className="relative mt-2.5 rounded-none shadow-sm">
            <div className="pointer-events-none absolute text-sm inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500">+44</span>
            </div>
            <input
              className="block w-full rounded-none border-0 py-1.5 px-2 pl-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              id="phone"
              name="phone"
              placeholder="0000000000"
              type="text"
              value={customerDetails.phone}
              onChange={(e) => {
                setCustomerDetails({
                  ...customerDetails,
                  phone: e.currentTarget.value,
                });
              }}
            />
          </div>
        </label>
        <label className="w-full block" htmlFor="email">
          <span className="text-sm font-semibold leading-6 text-gray-900">Email</span>
          <div className="mt-2.5">
            <input
              className="block w-full rounded-none border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              id="email"
              name="email"
              placeholder="Email"
              type="text"
              value={customerDetails.email}
              onChange={(e) => {
                setCustomerDetails({
                  ...customerDetails,
                  email: e.currentTarget.value,
                });
              }}
            />
          </div>
        </label>
      </div>
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
