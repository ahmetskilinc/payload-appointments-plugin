/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  collections: {
    users: User;
    appointments: Appointment;
    customers: Customer;
    services: Service;
    hosts: Host;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  globals: {
    openingTimes: OpeningTime;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "appointments".
 */
export interface Appointment {
  id: string;
  appointmentType: 'appointment' | 'blockout';
  host?: (string | null) | Host;
  customer?: (string | null) | Customer;
  services?: (string | Service)[] | null;
  title?: string | null;
  start?: string | null;
  end?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "hosts".
 */
export interface Host {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  prefferedName?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "customers".
 */
export interface Customer {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  dob: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "services".
 */
export interface Service {
  id: string;
  title: string;
  description?: string | null;
  duration: number;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: string;
  user:
    | {
        relationTo: 'users';
        value: string | User;
      }
    | {
        relationTo: 'customers';
        value: string | Customer;
      };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: string;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "openingTimes".
 */
export interface OpeningTime {
  id: string;
  monday?: {
    isOpen?: boolean | null;
    opening: string;
    closing: string;
  };
  tuesday?: {
    isOpen?: boolean | null;
    opening: string;
    closing: string;
  };
  wednesday?: {
    isOpen?: boolean | null;
    opening: string;
    closing: string;
  };
  thursday?: {
    isOpen?: boolean | null;
    opening: string;
    closing: string;
  };
  friday?: {
    isOpen?: boolean | null;
    opening: string;
    closing: string;
  };
  saturday?: {
    isOpen?: boolean | null;
    opening: string;
    closing: string;
  };
  sunday?: {
    isOpen?: boolean | null;
    opening: string;
    closing: string;
  };
  updatedAt?: string | null;
  createdAt?: string | null;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}