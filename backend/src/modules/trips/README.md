# Trips Module

This module handles trip management in the Trip Organizer application.

## Structure

```
modules/trips/
├── entities/
│   └── trip.entity.ts              # Trip entity with TypeORM decorators
├── dto/
│   ├── create-trip.dto.ts          # DTO for creating trips (to be implemented)
│   └── update-trip.dto.ts          # DTO for updating trips (to be implemented)
├── trips.repository.ts             # Repository for trip CRUD operations
├── trips.service.ts                # Business logic service (to be implemented)
├── trips.controller.ts             # REST API controller (to be implemented)
├── trips.module.ts                 # NestJS module configuration
├── trips.repository.spec.ts        # Unit tests for repository
└── trips.repository.integration.spec.ts  # Integration tests
```

## Trip Entity

The `Trip` entity represents a travel trip with the following fields:

- **id**: UUID string (primary key)
- **title**: Trip name (required, max 255 chars)
- **description**: Optional detailed description
- **startDate**: Optional trip start date
- **endDate**: Optional trip end date
- **createdAt**: Automatically set on creation
- **updatedAt**: Automatically updated on modification
- **itineraryItems**: One-to-many relationship with itinerary items

## TripsRepository

The repository provides the following methods:

### `findAll(): Promise<Trip[]>`
Returns all trips ordered by creation date (newest first).

```typescript
const trips = await tripsRepository.findAll();
```

### `findById(id: string): Promise<Trip | null>`
Finds a trip by ID, including its itinerary items.

```typescript
const trip = await tripsRepository.findById('trip-id-123');
```

### `create(tripData: Partial<Trip>): Promise<Trip>`
Creates a new trip with the provided data.

```typescript
const trip = await tripsRepository.create({
  id: uuidv4(),
  title: 'Summer Vacation 2025',
  description: 'A trip to Europe',
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-06-15'),
});
```

### `update(id: string, tripData: Partial<Trip>): Promise<Trip | null>`
Updates an existing trip. Returns null if trip not found.

```typescript
const updated = await tripsRepository.update('trip-id-123', {
  title: 'Updated Title',
  description: 'Updated Description',
});
```

### `delete(id: string): Promise<boolean>`
Deletes a trip by ID. Returns true if deleted, false if not found.

```typescript
const deleted = await tripsRepository.delete('trip-id-123');
```

### `count(): Promise<number>`
Returns the total number of trips.

```typescript
const total = await tripsRepository.count();
```

### `exists(id: string): Promise<boolean>`
Checks if a trip exists.

```typescript
const exists = await tripsRepository.exists('trip-id-123');
```

## Usage Example

```typescript
import { TripsRepository } from './trips.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TripsService {
  constructor(private readonly tripsRepository: TripsRepository) {}

  async createTrip(data: CreateTripDto): Promise<Trip> {
    return this.tripsRepository.create({
      id: uuidv4(),
      ...data,
    });
  }

  async getAllTrips(): Promise<Trip[]> {
    return this.tripsRepository.findAll();
  }

  async getTripById(id: string): Promise<Trip> {
    const trip = await this.tripsRepository.findById(id);
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return trip;
  }
}
```

## Testing

### Unit Tests
```bash
npm test -- trips.repository.spec.ts
```

### Integration Tests
```bash
npm test -- trips.repository.integration.spec.ts
```

### Manual Testing
A manual test script is provided for verification:
```bash
npx ts-node src/modules/trips/test-repository.ts
```

## Database Operations

The repository uses TypeORM for database operations:

- **Transactions**: Not yet implemented (to be added for complex operations)
- **Cascade**: Deleting a trip automatically deletes associated itinerary items
- **Timestamps**: Automatically managed by TypeORM decorators
- **Soft Delete**: Not implemented (hard delete only)

## Future Enhancements

- [ ] Add pagination support for `findAll()`
- [ ] Add filtering and sorting options
- [ ] Implement soft delete functionality
- [ ] Add transaction support for complex operations
- [ ] Add search functionality (by title, description, dates)
- [ ] Add trip statistics (duration, item counts, etc.)
