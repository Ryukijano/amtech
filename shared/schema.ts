import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  attendeeEmail: text("attendee_email").notNull(),
  status: text("status").notNull(), // 'pending', 'confirmed', 'cancelled'
  calendarEventId: text("calendar_event_id"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

export const insertPropertySchema = createInsertSchema(properties);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertMessageSchema = createInsertSchema(messages);

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;