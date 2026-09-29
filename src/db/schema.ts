import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('ADMIN'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const registrations = pgTable('registrations', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  certificateCode: text('certificate_code'),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  birthDate: text('birth_date').notNull(),
  age: integer('age'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  organization: text('organization'),
  ticketType: text('ticket_type').notNull(),
  notes: text('notes'),
  status: text('status').default('Confirmado').notNull(),
  checkedInAt: timestamp('checked_in_at'),
  checkedInBy: text('checked_in_by'),
  termsAccepted: boolean('terms_accepted').default(true).notNull(),
  qrCodeDataUrl: text('qr_code_data_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tagline: text('tagline'),
  description: text('description').notNull(),
  importantInfo: text('important_info'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  time: text('time'),
  locationName: text('location_name').notNull(),
  locationAddress: text('location_address'),
  bannerUrl: text('banner_url'),
  maxCapacity: integer('max_capacity').default(600).notNull(),
  isRegistrationOpen: boolean('is_registration_open').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
