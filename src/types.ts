export interface PluginTypes {}

export type OpeningTimes = {
	[key: string]: {
		isOpen: boolean;
		opening: string;
		closing: string;
	};
} & {
	createdAt: string;
	updatedAt: string;
	id: string;
	globalType: "openingTime";
};

export interface Appointment {
	id: string;
	customer: Customer;
	host: Host;
	services: Service[];
	title?: string;
	start: string;
	end: string;
	hostId?: string;
	appointmentType: "appointment" | "blockout";
}

export type BigCalendarAppointment = {
	start: Date;
	end: Date;
	hostId: string;
	id: string;
	customer: Customer;
	host: Host;
	services: Service[];
	title?: string;
	appointmentType: "appointment" | "blockout";
};

export interface Host {
	id: string;
	firstName: string;
	lastName: string;
	prefferedName: string;
}

export interface Service {
	id: string;
	title: string;
	description: string | null;
	duration: number;
}

export interface Customer {
	id: string;
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	dob: string;
}
