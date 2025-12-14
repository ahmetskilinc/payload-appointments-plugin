export interface PluginTypes {
  overrides?: {}
  showDashboardCards?: boolean
  showNavItems?: boolean
}

export type OpeningTimes = {
  [key: string]: {
    closing: string
    isOpen: boolean
    opening: string
  }
} & {
  createdAt: string
  globalType: 'openingTime'
  id: string
  updatedAt: string
}

export interface GuestCustomer {
  createdAt: string
  email: string
  firstName: string
  id: string
  lastName: string
  phone?: string | null
  updatedAt: string
}

export interface Appointment {
  appointmentType: 'appointment' | 'blockout'
  bookedBy?: 'customer' | 'guest'
  customer?: User
  end: string
  guestCustomer?: GuestCustomer
  host: User
  hostId?: string
  id: string
  services: Service[]
  start: string
  title?: string
}

export type BigCalendarAppointment = {
  appointmentType: 'appointment' | 'blockout'
  bookedBy?: 'customer' | 'guest'
  customer?: User
  end: Date
  guestCustomer?: GuestCustomer
  host: User
  hostId: string
  id: string
  services: Service[]
  start: Date
  title?: string
}

export interface BaseUser {
  createdAt: string
  firstName?: null | string
  id: string
  lastName?: null | string
  updatedAt: string
}

export interface User extends BaseUser {
  adminTitle?: string
  appointments?: {
    docs: Appointment[]
    hasNextPage: boolean
  }
  email?: string
  preferredNameAppointments?: null | string
  roles?: ('admin' | 'customer') | null
  takingAppointments?: boolean | null
}

export interface TeamMember extends BaseUser {
  preferredNameAppointments?: null | string
  takingAppointments?: boolean | null
}

export interface Customer extends BaseUser {
  email: string
}

export interface Service {
  description: null | string
  duration: number
  id: string
  title: string
}
