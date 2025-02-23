import { type Property, type InsertProperty, type Message, type InsertMessage, type Appointment, type InsertAppointment } from "@shared/schema";

export interface IStorage {
  // Property operations
  getProperties(): Promise<Property[]>;
  searchProperties(query: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    location?: string;
  }): Promise<Property[]>;

  // Message operations
  getMessages(): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;

  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(propertyId: number): Promise<Appointment[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private messages: Map<number, Message>;
  private appointments: Map<number, Appointment>;
  private propertyId: number = 1;
  private messageId: number = 1;
  private appointmentId: number = 1;

  constructor() {
    this.properties = new Map();
    this.messages = new Map();
    this.appointments = new Map();
    this.initializeProperties();
  }

  private initializeProperties() {
    const mockProperties: InsertProperty[] = [
      {
        title: "Modern Downtown Apartment",
        description: "Luxurious 2-bed apartment with city views",
        price: 500000,
        bedrooms: 2,
        bathrooms: 2,
        location: "Downtown",
        imageUrl: "https://placehold.co/600x400",
      },
      {
        title: "Suburban Family Home",
        description: "Spacious 4-bed house with garden",
        price: 750000,
        bedrooms: 4,
        bathrooms: 3,
        location: "Suburbs",
        imageUrl: "https://placehold.co/600x400",
      },
    ];

    mockProperties.forEach((property) => {
      const id = this.propertyId++;
      this.properties.set(id, { ...property, id });
    });
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async searchProperties(query: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    location?: string;
  }): Promise<Property[]> {
    return Array.from(this.properties.values()).filter((property) => {
      if (query.minPrice && property.price < query.minPrice) return false;
      if (query.maxPrice && property.price > query.maxPrice) return false;
      if (query.bedrooms && property.bedrooms !== query.bedrooms) return false;
      if (query.location && !property.location.toLowerCase().includes(query.location.toLowerCase())) return false;
      return true;
    });
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage = {
      ...message,
      id,
      metadata: message.metadata || {},
      timestamp: message.timestamp || new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const newAppointment = { 
      ...appointment, 
      id,
      calendarEventId: appointment.calendarEventId || null // Ensure it's never undefined
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async getAppointments(propertyId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.propertyId === propertyId
    );
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
}

export const storage = new MemStorage();