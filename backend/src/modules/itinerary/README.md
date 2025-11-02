# Itinerary Repository

Repository for managing itinerary items and their specific types (Flight, Transport, Accommodation) in the Trip Organizer application.

## Overview

The `ItineraryRepository` provides a comprehensive data access layer for all itinerary item operations. It handles the complexity of managing base itinerary items alongside their type-specific data (flights, transport, accommodations) with proper transaction support.

## Key Features

- **Type-Safe CRUD Operations**: Create, read, update, and delete operations for all itinerary item types
- **Transaction Support**: All create operations use database transactions to ensure data integrity
- **Automatic Sorting**: Items are automatically sorted by `startDate` and `orderIndex`
- **Relation Loading**: Automatically loads specific entity data (Flight/Transport/Accommodation) when querying items
- **Location Handling**: Seamless serialization/deserialization of JSON location data
- **Reordering Support**: Bulk update operations for drag-and-drop functionality

## Architecture

### Entity Structure

```
ItineraryItem (Base Table)
├── Flight (One-to-One)
├── Transport (One-to-One)
└── Accommodation (One-to-One)
```

Each itinerary item has:
- **Base data** in `itinerary_items` table (common fields like title, dates, notes)
- **Specific data** in type-specific tables (flight details, transport details, etc.)

### Relationships

- `Trip` → `ItineraryItem`: One-to-Many with cascade
- `ItineraryItem` → `Flight/Transport/Accommodation`: One-to-One with CASCADE DELETE

## Usage

### Dependency Injection

```typescript
import { ItineraryRepository } from './itinerary/itinerary.repository';

@Injectable()
export class ItineraryService {
  constructor(private readonly itineraryRepository: ItineraryRepository) {}
}
```

### Creating Items

#### Create a Flight

```typescript
const flight = await itineraryRepository.createFlight({
  tripId: 'trip-uuid',
  title: 'Flight to New York',
  startDate: new Date('2024-06-01T10:00:00'),
  endDate: new Date('2024-06-01T14:00:00'),
  notes: 'Window seat preferred',
  orderIndex: 0,
  departureLocation: {
    address: 'LAX Airport',
    latitude: 33.9416,
    longitude: -118.4085,
    city: 'Los Angeles',
    country: 'USA',
  },
  arrivalLocation: {
    address: 'JFK Airport',
    latitude: 40.6413,
    longitude: -73.7781,
    city: 'New York',
    country: 'USA',
  },
  flightNumber: 'AA123',
  airline: 'American Airlines',
  confirmationCode: 'ABC123',
  duration: 240, // minutes
});

console.log(flight.item.id); // Base itinerary item
console.log(flight.flight.flightNumber); // Flight-specific data
```

#### Create Transport

```typescript
const transport = await itineraryRepository.createTransport({
  tripId: 'trip-uuid',
  title: 'Train to Boston',
  startDate: new Date('2024-06-02T08:00:00'),
  endDate: new Date('2024-06-02T12:00:00'),
  transportType: 'train',
  departureLocation: locationA,
  arrivalLocation: locationB,
  provider: 'Amtrak',
  confirmationCode: 'TRAIN456',
  duration: 240,
});
```

#### Create Accommodation

```typescript
const accommodation = await itineraryRepository.createAccommodation({
  tripId: 'trip-uuid',
  title: 'Hotel Stay',
  startDate: new Date('2024-06-01T15:00:00'),
  endDate: new Date('2024-06-03T11:00:00'),
  name: 'Grand Hotel',
  location: {
    address: '123 Main St, New York, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'USA',
  },
  confirmationNumber: 'HOTEL789',
  phoneNumber: '+1-555-1234',
  duration: 2880, // minutes (2 days)
});
```

### Querying Items

#### Get All Items for a Trip

```typescript
const items = await itineraryRepository.findByTripId('trip-uuid');
// Returns items sorted by startDate ASC, then orderIndex ASC
```

#### Get Single Item with Specific Type Data

```typescript
const item = await itineraryRepository.findById('item-uuid');

if (item) {
  console.log(item.type); // 'flight', 'transport', or 'accommodation'
  
  if (item.type === 'flight') {
    const flight = (item as any).flight;
    console.log(flight.flightNumber);
    console.log(flight.departureLocation.city);
  }
}
```

### Updating Items

#### Update Base Item Data

```typescript
await itineraryRepository.update('item-uuid', {
  title: 'Updated Title',
  notes: 'New notes',
  orderIndex: 5,
});
```

#### Update Flight-Specific Data

```typescript
await itineraryRepository.updateFlight('item-uuid', {
  flightNumber: 'AA456',
  airline: 'Delta Airlines',
  departureLocation: newLocation,
});
```

#### Update Transport-Specific Data

```typescript
await itineraryRepository.updateTransport('item-uuid', {
  transportType: 'bus',
  provider: 'Updated Provider',
  confirmationCode: 'NEW123',
});
```

#### Update Accommodation-Specific Data

```typescript
await itineraryRepository.updateAccommodation('item-uuid', {
  name: 'Updated Hotel',
  phoneNumber: '+1-555-9999',
  location: updatedLocation,
});
```

### Deleting Items

```typescript
const deleted = await itineraryRepository.delete('item-uuid');
// Returns true if deleted, false if not found
// CASCADE DELETE automatically removes flight/transport/accommodation data
```

### Reordering Items

Useful for drag-and-drop functionality:

```typescript
await itineraryRepository.reorder([
  { id: 'item-1', orderIndex: 2 },
  { id: 'item-2', orderIndex: 0 },
  { id: 'item-3', orderIndex: 1 },
]);
```

### Utility Methods

#### Count Items

```typescript
const count = await itineraryRepository.countByTripId('trip-uuid');
console.log(`Trip has ${count} itinerary items`);
```

#### Check Existence

```typescript
const exists = await itineraryRepository.exists('item-uuid');
if (exists) {
  // Item exists
}
```

## Data Interfaces

### CreateFlightData

```typescript
interface CreateFlightData {
  tripId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  orderIndex?: number;
  departureLocation: Location;
  arrivalLocation: Location;
  flightNumber?: string;
  airline?: string;
  confirmationCode?: string;
  duration: number; // minutes
}
```

### CreateTransportData

```typescript
interface CreateTransportData {
  tripId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  orderIndex?: number;
  transportType: string; // 'train', 'bus', 'car', 'ferry', etc.
  departureLocation: Location;
  arrivalLocation: Location;
  provider?: string;
  confirmationCode?: string;
  duration: number; // minutes
}
```

### CreateAccommodationData

```typescript
interface CreateAccommodationData {
  tripId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  orderIndex?: number;
  name: string;
  location: Location;
  confirmationNumber?: string;
  phoneNumber?: string;
  duration: number; // minutes
}
```

### Location Interface

```typescript
interface Location {
  address: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  placeId?: string; // Google Places ID
}
```

## Transaction Handling

All create operations are wrapped in database transactions to ensure atomicity:

1. Create base `ItineraryItem` record
2. Create type-specific record (Flight/Transport/Accommodation)
3. Set location data using virtual setters (automatic JSON serialization)
4. Commit transaction

If any step fails, the entire operation is rolled back.

## Error Handling

- Returns `null` for find operations when item doesn't exist
- Returns `false` for delete operations when item doesn't exist
- Throws exceptions for database errors (automatically handled by NestJS)

## Testing

The repository has comprehensive test coverage:

- **Unit Tests**: 15 tests covering all methods with mocked dependencies
- **Integration Tests**: 19 tests with real database operations (in-memory SQLite)

Run tests:
```bash
npm test -- --testPathPattern=itinerary.repository
```

## Best Practices

1. **Always use transactions** for operations that modify multiple tables
2. **Use virtual setters** for location data to ensure proper JSON serialization
3. **Load specific type data** when needed using `findById()`
4. **Sort by startDate** for chronological itinerary display
5. **Use orderIndex** for manual ordering (drag-and-drop)
6. **Check existence** before operations if needed using `exists()`

## Performance Considerations

- Indexes on `tripId`, `startDate`, and `endDate` for fast queries
- Transactions use database connection pool efficiently
- JSON columns stored as TEXT with virtual getters for minimal overhead
- CASCADE DELETE handles cleanup automatically

## Module Integration

To use this repository in a NestJS module:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItineraryRepository } from './itinerary.repository';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { Flight } from './entities/flight.entity';
import { Transport } from './entities/transport.entity';
import { Accommodation } from './entities/accommodation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItineraryItem,
      Flight,
      Transport,
      Accommodation,
    ]),
  ],
  providers: [ItineraryRepository],
  exports: [ItineraryRepository],
})
export class ItineraryModule {}
```

## Future Enhancements

Potential additions for future versions:

- Bulk create operations
- Query filtering by date range
- Full-text search on titles and notes
- Soft delete support
- Audit logging
- Optimistic locking for concurrent updates
