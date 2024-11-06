"use client";

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { filterByDateAndPeriod } from "../../lib/filterByDateAndPeriod";
import { Service, TeamMember } from "../../../src/payload-types";
import moment from "moment";
import MoonLoader from "react-spinners/MoonLoader";
import TimeSelectButton from "./TimeSelectButton";
import { fetchWithAuth } from "@lib/api";

const SelectDateTime: React.FC<{
  chosenServices: Service[];
  chosenStaff: TeamMember | null;
  setChosenDateTime: React.Dispatch<React.SetStateAction<Date | null>>;
  chosenDateTime: Date | null;
}> = ({ chosenServices, chosenStaff, setChosenDateTime, chosenDateTime }) => {
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const services = chosenServices.map((service) => service.id).join(",");
    const day = moment(chosenDateTime).toISOString();
    const getAvailabilities = async () => {
      setLoading(true);
      const data = await fetchWithAuth(`/api/get-available-appointment-slots?services=${services}&host=${chosenStaff?.id}&day=${day}`, {
        method: "get",
      });

      const slots = await data.json();
      setSlots(slots.filteredSlots);
      setLoading(false);
    };

    getAvailabilities();
  }, [chosenDateTime]);

  return (
    <div className="mt-6">
      <React.Fragment>
        <Calendar
          className="!w-full !border-neutral-200 !rounded-md !overflow-hidden"
          locale="en-GB"
          minDate={new Date()}
          maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
          maxDetail="month"
          minDetail="month"
          onChange={(value) => setChosenDateTime(new Date(value!.toString()))}
          value={chosenDateTime}
          defaultValue={chosenDateTime}
        />
        {!loading ? (
          chosenDateTime && slots && slots.length && slots.length > 0 ? (
            <div className="space-y-6 mt-6">
              <p>Morning</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                {filterByDateAndPeriod("morning", chosenDateTime, slots).map((availability) => (
                  <TimeSelectButton key={availability} availability={availability} chosenDateTime={chosenDateTime} setChosenDateTime={setChosenDateTime} />
                ))}
              </div>
              <p>Afternoon</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                {filterByDateAndPeriod("afternoon", chosenDateTime, slots).map((availability) => (
                  <TimeSelectButton key={availability} availability={availability} chosenDateTime={chosenDateTime} setChosenDateTime={setChosenDateTime} />
                ))}
              </div>
              <p>Evening</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                {filterByDateAndPeriod("evening", chosenDateTime, slots).map((availability) => (
                  <TimeSelectButton key={availability} availability={availability} chosenDateTime={chosenDateTime} setChosenDateTime={setChosenDateTime} />
                ))}
              </div>
            </div>
          ) : null
        ) : (
          <div className="flex items-center justify-center h-96">
            <MoonLoader />
          </div>
        )}
      </React.Fragment>
    </div>
  );
};

export default SelectDateTime;
