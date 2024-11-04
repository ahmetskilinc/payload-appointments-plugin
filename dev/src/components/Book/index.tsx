"use client";

import React, { useState } from "react";

import HostList from "./HostList";
import CustomerDetails from "./CustomerDetails";
import SelectDateTime from "./SelectDateTime";
import ServicesList from "./ServicesList";
import Selections from "./Selections";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { Service, TeamMember } from "../../payload-types";
import moment from "moment";

const BookNow: React.FC<{ services: Service[]; teamMembers: TeamMember[] }> = ({ services, teamMembers }) => {
  const [chosenStaff, setChosenStaff] = useState<TeamMember[]>([]);
  const [chosenServices, setChosenServices] = useState<Service[]>([]);
  const [chosenDateTime, setChosenDateTime] = useState<Date | null>(moment().toDate());
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [customerDetails, setCustomerDetails] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    notes: string;
  }>({
    email: "",
    firstName: "",
    lastName: "",
    notes: "",
    phone: "",
  });

  const nextStep = () => {
    setStepIndex(stepIndex + 1);
    if (window !== undefined) {
      window.scrollTo({ top: 0 });
    }
  };

  const prevStep = () => {
    setStepIndex(stepIndex - 1);
    if (window !== undefined) {
      window.scrollTo({ top: 0 });
    }
  };

  const isContinueDisabled = () => {
    if (stepIndex === 0) {
      return !chosenServices?.length;
    } else if (stepIndex === 1) {
      return !chosenStaff?.length;
    } else if (stepIndex === 2) {
      return !chosenDateTime;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-12 gap-4 md:gap-8">
        <Selections chosenStaff={chosenStaff} chosenServices={chosenServices} chosenDateTime={chosenDateTime} setStepIndex={setStepIndex} />
        <div className="col-span-12 md:col-span-8">
          <div className="flex justify-between items-start">
            {stepIndex === 0 ? (
              <div>
                <p className="text-base mb-1">Available services</p>
                <p className="text-xs mb-6 text-gray-500">Select one or more services</p>
              </div>
            ) : stepIndex === 1 ? (
              <div>
                <p className="text-base mb-1">Available staff</p>
                <p className="text-xs mb-6 text-gray-500">Select one staff member</p>
              </div>
            ) : stepIndex === 2 ? (
              <div>
                <p className="text-base mb-1">Available dates and times</p>
              </div>
            ) : stepIndex === 3 ? (
              <div>
                <p className="text-base mb-1">Your details</p>
              </div>
            ) : null}
          </div>
          <div className={cn(stepIndex === 0 ? "block" : "hidden")}>
            <ServicesList setChosenServices={setChosenServices} chosenServices={chosenServices} services={services} />
          </div>

          <div className={cn(stepIndex === 1 ? "block" : "hidden")}>
            <HostList setChosenStaff={setChosenStaff} chosenStaff={chosenStaff} teamMembers={teamMembers} />
          </div>

          <div className={cn(stepIndex === 2 ? "block" : "hidden")}>
            {stepIndex === 2 ? (
              <SelectDateTime setChosenDateTime={setChosenDateTime} chosenDateTime={chosenDateTime} chosenStaff={chosenStaff} chosenServices={chosenServices} />
            ) : null}
          </div>
          <div className={cn(stepIndex === 3 ? "block" : "hidden")}>
            <CustomerDetails
              chosenDateTime={chosenDateTime}
              chosenStaff={chosenStaff}
              chosenServices={chosenServices}
              customerDetails={customerDetails}
              setCustomerDetails={setCustomerDetails}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4 md:gap-8 mt-6">
        <div className="col-span-12 md:col-span-8 md:col-start-5 flex justify-between">
          {stepIndex !== 0 ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <span className="" />
          )}
          {stepIndex <= 2 ? (
            <Button onClick={nextStep} disabled={isContinueDisabled()}>
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              // onClick={() => setStepIndex(stepIndex + 1)}
            >
              Book now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookNow;
