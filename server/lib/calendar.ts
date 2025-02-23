import { format } from "date-fns";
import axios from "axios";
import type { InsertAppointment } from "@shared/schema";

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const CALENDAR_ID = process.env.CALENDAR_ID;

interface CalendarEventResponse {
  id: string;
  htmlLink: string;
  start: { dateTime: string };
  end: { dateTime: string };
  attendees?: { email: string; responseStatus: string }[];
}

export async function createAppointment(appointment: InsertAppointment): Promise<string> {
  try {
    const response = await axios.post<CalendarEventResponse>(
      `${CALENDAR_API_BASE}/calendars/${CALENDAR_ID}/events`,
      {
        start: { dateTime: format(appointment.startTime, "yyyy-MM-dd'T'HH:mm:ssxxx") },
        end: { dateTime: format(appointment.endTime, "yyyy-MM-dd'T'HH:mm:ssxxx") },
        attendees: [{ email: appointment.attendeeEmail }],
        summary: "Property Viewing Appointment",
        description: `Property viewing appointment for property ID: ${appointment.propertyId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CALENDAR_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.id;
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    throw new Error("Failed to schedule appointment");
  }
}

export async function getAvailableSlots(date: Date): Promise<Date[]> {
  try {
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0); // Business hours start at 9 AM
    
    const endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0); // Business hours end at 5 PM

    const response = await axios.get<{ items: CalendarEventResponse[] }>(
      `${CALENDAR_API_BASE}/calendars/${CALENDAR_ID}/events`,
      {
        params: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        },
        headers: {
          Authorization: `Bearer ${process.env.CALENDAR_ACCESS_TOKEN}`,
        },
      }
    );

    // Generate available 1-hour slots
    const bookedSlots = response.data.items.map(event => ({
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
    }));

    const availableSlots: Date[] = [];
    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setHours(currentSlot.getHours() + 1);

      const isAvailable = !bookedSlots.some(
        bookedSlot =>
          (currentSlot >= bookedSlot.start && currentSlot < bookedSlot.end) ||
          (slotEnd > bookedSlot.start && slotEnd <= bookedSlot.end)
      );

      if (isAvailable) {
        availableSlots.push(new Date(currentSlot));
      }

      currentSlot.setHours(currentSlot.getHours() + 1);
    }

    return availableSlots;
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    throw new Error("Failed to get available appointment slots");
  }
}
