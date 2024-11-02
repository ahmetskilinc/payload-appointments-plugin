"use client";

import React, { createContext, useContext } from "react";
import { Appointment } from "../types";

type AppointmentContextType = {
	addAppointment: (appointment: Appointment) => void;
};

const AppointmentContext = createContext<AppointmentContextType>({
	addAppointment: () => {},
});

export const AppointmentProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const addAppointment = async () => {
		console.log("addAppointment Clicked");
	};

	return (
		<AppointmentContext.Provider
			value={{
				addAppointment,
			}}
		>
			{children}
		</AppointmentContext.Provider>
	);
};

export const useAppointments = () => useContext(AppointmentContext);
