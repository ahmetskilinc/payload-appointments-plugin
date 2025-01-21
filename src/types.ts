export interface PluginTypes {
  showDashboardCards?: boolean;
  showNavItems?: boolean;
  overrides?: {}; // TODO: ADD OVERRIDES FOR COLLECTIONS
}

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
  customer: User;
  host: User;
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
  customer: User;
  host: User;
  services: Service[];
  title?: string;
  appointmentType: "appointment" | "blockout";
};

export interface BaseUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface User extends BaseUser {
  roles?: ("admin" | "customer") | null;
  takingAppointments?: boolean | null;
  preferredNameAppointments?: string | null;
  email?: string;
  adminTitle?: string;
  appointments?: {
    docs: Appointment[];
    hasNextPage: boolean;
  };
}

export interface TeamMember extends BaseUser {
  takingAppointments?: boolean | null;
  preferredNameAppointments?: string | null;
}

export interface Customer extends BaseUser {
  email: string;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  duration: number;
}
