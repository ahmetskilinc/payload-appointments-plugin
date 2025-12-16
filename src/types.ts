export interface PluginTypes {
  overrides?: {};
  showDashboardCards?: boolean;
  showNavItems?: boolean;
}

export type OpeningTimes = {
  [key: string]: {
    closing: string;
    isOpen: boolean;
    opening: string;
  };
} & {
  createdAt: string;
  globalType: 'openingTime';
  id: string;
  timezone: string;
  updatedAt: string;
};

export interface GuestCustomer {
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  phone?: string | null;
  updatedAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface Appointment {
  appointmentType: 'appointment' | 'blockout';
  bookedBy?: 'customer' | 'guest';
  cancelledAt?: string;
  cancellationToken?: string;
  customer?: User;
  customerNotes?: string;
  end: string;
  guestCustomer?: GuestCustomer;
  host: User;
  hostId?: string;
  id: string;
  internalNotes?: string;
  payment?: Payment;
  recurrence?: Recurrence;
  services: Service[];
  start: string;
  status?: AppointmentStatus;
  title?: string;
}

export type BigCalendarAppointment = {
  appointmentType: 'appointment' | 'blockout';
  bookedBy?: 'customer' | 'guest';
  cancelledAt?: string;
  customer?: User;
  customerNotes?: string;
  end: Date;
  guestCustomer?: GuestCustomer;
  host: User;
  hostId: string;
  id: string;
  internalNotes?: string;
  services: Service[];
  start: Date;
  status?: AppointmentStatus;
  title?: string;
};

export interface BaseUser {
  createdAt: string;
  firstName?: null | string;
  id: string;
  lastName?: null | string;
  updatedAt: string;
}

export interface User extends BaseUser {
  adminTitle?: string;
  appointments?: {
    docs: Appointment[];
    hasNextPage: boolean;
  };
  email?: string;
  preferredNameAppointments?: null | string;
  roles?: ('admin' | 'customer') | null;
  takingAppointments?: boolean | null;
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type TeamMemberDayHours = {
  end?: string | null;
  isWorking?: boolean;
  start?: string | null;
};

export type TeamMemberCustomHours = {
  [key in DayOfWeek]?: TeamMemberDayHours;
};

export interface TeamMember extends BaseUser {
  customHours?: TeamMemberCustomHours;
  icalToken?: string;
  maxAppointmentsPerDay?: number;
  preferredNameAppointments?: null | string;
  takingAppointments?: boolean | null;
  useCustomHours?: boolean;
}

export interface Customer extends BaseUser {
  email: string;
}

export interface Service {
  bufferTime?: number;
  depositAmount?: number;
  depositType?: 'full' | 'fixed' | 'percentage';
  description: null | string;
  duration: number;
  id: string;
  maxAdvanceBooking?: number;
  minLeadTime?: number;
  paidService?: boolean;
  paymentRequired?: boolean;
  price?: number;
  title: string;
}

export type PaymentStatus =
  | 'not-required'
  | 'pending'
  | 'deposit-paid'
  | 'paid'
  | 'refunded'
  | 'partial-refund';

export interface Payment {
  amountDue?: number;
  amountPaid?: number;
  externalPaymentId?: string;
  paidAt?: string;
  status: PaymentStatus;
}

export type PaymentHooks = {
  onPaymentRequired?: (appointment: Appointment) => Promise<{
    paymentUrl: string;
    paymentId: string;
  }>;
  onPaymentReceived?: (appointment: Appointment, paymentData: unknown) => Promise<void>;
  onRefundRequested?: (appointment: Appointment) => Promise<void>;
};

export type RecurrencePattern = 'weekly' | 'biweekly' | 'monthly';

export type RecurrenceEndType = 'occurrences' | 'endDate';

export interface Recurrence {
  endDate?: string;
  endType?: RecurrenceEndType;
  isRecurring: boolean;
  occurrences?: number;
  pattern?: RecurrencePattern;
  seriesId?: string;
}

export type WaitlistStatus = 'waiting' | 'notified' | 'booked' | 'expired' | 'cancelled';

export interface WaitlistEntry {
  createdAt: string;
  customer?: User;
  expiresAt?: string;
  guestCustomer?: GuestCustomer;
  host?: TeamMember;
  id: string;
  notes?: string;
  notifiedAt?: string;
  preferredDates?: { date: string }[];
  preferredTimeRange?: {
    start?: string;
    end?: string;
  };
  service: Service;
  status: WaitlistStatus;
  updatedAt: string;
}

export type SentEmailType = 'created' | 'updated' | 'cancelled';

export interface SentEmail {
  appointment?: Appointment | string;
  createdAt: string;
  emailType: SentEmailType;
  from: string;
  html?: string;
  id: string;
  sentAt: string;
  subject: string;
  text?: string;
  to: string;
  updatedAt: string;
}
