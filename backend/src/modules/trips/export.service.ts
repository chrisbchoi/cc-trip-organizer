import { Injectable } from '@nestjs/common';
import ical from 'ical-generator';
import { Trip } from './entities/trip.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';

/**
 * Service for exporting trip data to various formats
 */
@Injectable()
export class ExportService {
  /**
   * Export trip and itinerary items as iCalendar (.ics) format
   * @param trip - Trip entity with details
   * @param items - Array of itinerary items with type-specific details
   * @returns iCalendar string content
   */
  exportToICalendar(trip: Trip, items: any[]): string {
    // Create calendar instance
    const calendar = ical({
      name: trip.title,
      description: trip.description || `Trip from ${trip.startDate ? this.formatDate(trip.startDate) : 'TBD'} to ${trip.endDate ? this.formatDate(trip.endDate) : 'TBD'}`,
      timezone: 'UTC',
      prodId: {
        company: 'Trip Organizer',
        product: 'Trip Organizer App',
        language: 'EN',
      },
    });

    // Add each itinerary item as an event
    items.forEach((item: any) => {
      this.addItemToCalendar(calendar, item, trip);
    });

    // Generate and return the iCalendar string
    return calendar.toString();
  }

  /**
   * Add a single itinerary item to the calendar as an event
   * @param calendar - iCalendar instance
   * @param item - Itinerary item with type-specific details
   * @param trip - Parent trip entity
   */
  private addItemToCalendar(calendar: any, item: any, trip: Trip): void {
    const baseItem = item as ItineraryItem;
    
    // Determine event summary and description based on item type
    const summary = baseItem.title;
    const description = this.buildDescription(item);
    const location = this.extractLocation(item);

    // Create the event
    const event = calendar.createEvent({
      start: new Date(baseItem.startDate),
      end: new Date(baseItem.endDate),
      summary: summary,
      description: description,
      location: location,
      url: `trip-organizer://trips/${trip.id}/items/${baseItem.id}`,
    });

    // Add additional details as notes if present
    if (baseItem.notes) {
      event.description(`${description}\n\nNotes: ${baseItem.notes}`);
    }
  }

  /**
   * Build detailed description for the calendar event
   * @param item - Itinerary item with type-specific details
   * @returns Description string
   */
  private buildDescription(item: any): string {
    const baseItem = item as ItineraryItem;
    const parts: string[] = [];

    parts.push(`Type: ${baseItem.type.toUpperCase()}`);
    parts.push(`Duration: ${this.calculateDuration(baseItem.startDate, baseItem.endDate)}`);

    // Add type-specific details
    if (baseItem.type === 'flight' && item.flight) {
      const flight = item.flight;
      if (flight.flightNumber) parts.push(`Flight: ${flight.flightNumber}`);
      if (flight.airline) parts.push(`Airline: ${flight.airline}`);
      if (flight.confirmationCode) parts.push(`Confirmation: ${flight.confirmationCode}`);
      parts.push(`From: ${this.formatLocation(flight.departureLocation)}`);
      parts.push(`To: ${this.formatLocation(flight.arrivalLocation)}`);
    } else if (baseItem.type === 'transport' && item.transport) {
      const transport = item.transport;
      parts.push(`Transport Type: ${transport.transportType}`);
      if (transport.provider) parts.push(`Provider: ${transport.provider}`);
      if (transport.confirmationCode) parts.push(`Confirmation: ${transport.confirmationCode}`);
      parts.push(`From: ${this.formatLocation(transport.departureLocation)}`);
      parts.push(`To: ${this.formatLocation(transport.arrivalLocation)}`);
    } else if (baseItem.type === 'accommodation' && item.accommodation) {
      const accommodation = item.accommodation;
      parts.push(`Name: ${accommodation.name}`);
      if (accommodation.confirmationNumber) parts.push(`Confirmation: ${accommodation.confirmationNumber}`);
      if (accommodation.phoneNumber) parts.push(`Phone: ${accommodation.phoneNumber}`);
    }

    return parts.join('\n');
  }

  /**
   * Extract location from itinerary item
   * @param item - Itinerary item with type-specific details
   * @returns Location string for calendar event
   */
  private extractLocation(item: any): string {
    const baseItem = item as ItineraryItem;

    if (baseItem.type === 'flight' && item.flight) {
      const departure = this.formatLocation(item.flight.departureLocation);
      const arrival = this.formatLocation(item.flight.arrivalLocation);
      return `${departure} → ${arrival}`;
    } else if (baseItem.type === 'transport' && item.transport) {
      const departure = this.formatLocation(item.transport.departureLocation);
      const arrival = this.formatLocation(item.transport.arrivalLocation);
      return `${departure} → ${arrival}`;
    } else if (baseItem.type === 'accommodation' && item.accommodation) {
      return this.formatLocation(item.accommodation.location);
    }

    return '';
  }

  /**
   * Format location object to readable string
   * @param location - Location object
   * @returns Formatted location string
   */
  private formatLocation(location: any): string {
    if (!location) return 'Unknown';
    
    const parts: string[] = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  }

  /**
   * Calculate duration between two dates
   * @param start - Start date
   * @param end - End date
   * @returns Human-readable duration string
   */
  private calculateDuration(start: Date, end: Date): string {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours} hours ${minutes} minutes`;
  }

  /**
   * Format date to readable string
   * @param date - Date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }
}
