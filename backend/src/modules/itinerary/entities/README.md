# Itinerary Entities

This directory contains TypeORM entity definitions for itinerary items (flights, transport, accommodations) and their relationships.

## Entity Structure

### Base Entity: ItineraryItem

The `ItineraryItem` entity serves as the base table for all itinerary entries.

**File**: `itinerary-item.entity.ts`

**Fields**:
- `id` (string): Primary key, UUID
- `tripId` (string): Foreign key to trips table
- `type` (string): Item type ('flight', 'transport', 'accommodation')
- `title` (string): User-friendly title (max 255 chars)
- `startDate` (datetime): Start date/time of the item
- `endDate` (datetime): End date/time of the item
- `notes` (text, optional): Additional notes
- `orderIndex` (integer): Order for display/sorting
- `createdAt` (datetime): Auto-generated creation timestamp
- `updatedAt` (datetime): Auto-generated update timestamp

**Relationships**:
- `trip` (ManyToOne): Belongs to a Trip, cascades on delete

### Flight Entity

Stores flight-specific information with departure and arrival locations.

**File**: `flight.entity.ts`

**Fields**:
- `id` (string): Primary key, UUID
- `itineraryItemId` (string): Foreign key to itinerary_items (OneToOne)
- `departureLocationJson` (text): JSON-serialized Location object
- `arrivalLocationJson` (text): JSON-serialized Location object
- `flightNumber` (string, optional): Flight number (e.g., "AF1234")
- `airline` (string, optional): Airline name
- `confirmationCode` (string, optional): Booking confirmation
- `duration` (integer): Flight duration in minutes

**Virtual Properties**:
- `departureLocation` (getter/setter): Parses departureLocationJson
- `arrivalLocation` (getter/setter): Parses arrivalLocationJson

**Relationships**:
- `itineraryItem` (OneToOne): Links to ItineraryItem, cascades on delete

**Example**:
```typescript
const flight = new Flight();
flight.id = uuidv4();
flight.itineraryItemId = item.id;
flight.flightNumber = 'AF1234';
flight.airline = 'Air France';
flight.duration = 120;

// Using virtual property
flight.departureLocation = {
  address: 'Charles de Gaulle Airport',
  latitude: 49.0097,
  longitude: 2.5479,
  city: 'Paris',
  country: 'France',
};

await flightRepository.save(flight);
```

### Transport Entity

Stores ground/sea transportation details.

**File**: `transport.entity.ts`

**Fields**:
- `id` (string): Primary key, UUID
- `itineraryItemId` (string): Foreign key to itinerary_items (OneToOne)
- `transportType` (string): Type of transport ('train', 'bus', 'car', 'ferry', etc.)
- `departureLocationJson` (text): JSON-serialized Location object
- `arrivalLocationJson` (text): JSON-serialized Location object
- `provider` (string, optional): Transportation provider (e.g., "Eurostar")
- `confirmationCode` (string, optional): Booking confirmation
- `duration` (integer): Travel duration in minutes

**Virtual Properties**:
- `departureLocation` (getter/setter): Parses departureLocationJson
- `arrivalLocation` (getter/setter): Parses arrivalLocationJson

**Relationships**:
- `itineraryItem` (OneToOne): Links to ItineraryItem, cascades on delete

**Example**:
```typescript
const transport = new Transport();
transport.id = uuidv4();
transport.itineraryItemId = item.id;
transport.transportType = 'train';
transport.provider = 'Eurostar';
transport.duration = 135;

transport.departureLocation = {
  address: 'Gare du Nord',
  latitude: 48.8809,
  longitude: 2.3553,
  city: 'Paris',
};

transport.arrivalLocation = {
  address: 'St Pancras International',
  latitude: 51.5308,
  longitude: -0.1238,
  city: 'London',
};

await transportRepository.save(transport);
```

### Accommodation Entity

Stores hotel/lodging information.

**File**: `accommodation.entity.ts`

**Fields**:
- `id` (string): Primary key, UUID
- `itineraryItemId` (string): Foreign key to itinerary_items (OneToOne)
- `name` (string): Accommodation name (max 255 chars)
- `locationJson` (text): JSON-serialized Location object
- `confirmationNumber` (string, optional): Booking confirmation
- `phoneNumber` (string, optional): Contact phone number
- `duration` (integer): Stay duration in minutes

**Virtual Properties**:
- `location` (getter/setter): Parses locationJson

**Relationships**:
- `itineraryItem` (OneToOne): Links to ItineraryItem, cascades on delete

**Example**:
```typescript
const accommodation = new Accommodation();
accommodation.id = uuidv4();
accommodation.itineraryItemId = item.id;
accommodation.name = 'Grand Hotel Paris';
accommodation.confirmationNumber = 'HOTEL123';
accommodation.phoneNumber = '+33-1-2345-6789';
accommodation.duration = 2880; // 48 hours

accommodation.location = {
  address: '123 Rue de Rivoli',
  latitude: 48.8606,
  longitude: 2.3376,
  city: 'Paris',
  country: 'France',
  placeId: 'ChIJ123abc',
};

await accommodationRepository.save(accommodation);
```

## Location Interface

Shared location type for all entities with location data.

**File**: `types/location.interface.ts`

**Structure**:
```typescript
interface Location {
  address: string;              // Full address
  formattedAddress?: string;    // Formatted by geocoding service
  latitude: number;             // Latitude coordinate
  longitude: number;            // Longitude coordinate
  city?: string;                // City name
  country?: string;             // Country name
  placeId?: string;             // Google Places ID
}
```

## JSON Column Handling

Location data is stored as JSON text in the database for flexibility and ease of querying. Virtual properties (getters/setters) provide convenient access:

### Why JSON Columns?

1. **Flexibility**: Location structure can evolve without schema changes
2. **Simplicity**: No need for separate location tables
3. **Performance**: Single query to fetch all location data
4. **Geocoding**: Easy to store full geocoding results

### Implementation Pattern

```typescript
// Storage column (not accessed directly)
@Column('text', { name: 'departure_location' })
departureLocationJson!: string;

// Virtual getter (parse JSON on access)
get departureLocation(): Location {
  return JSON.parse(this.departureLocationJson);
}

// Virtual setter (stringify on assignment)
set departureLocation(location: Location) {
  this.departureLocationJson = JSON.stringify(location);
}
```

### Usage in Code

```typescript
// Setting location (uses setter)
flight.departureLocation = {
  address: 'Airport',
  latitude: 48.8566,
  longitude: 2.3522,
};

// Getting location (uses getter)
const city = flight.departureLocation.city;
const coords = {
  lat: flight.departureLocation.latitude,
  lng: flight.departureLocation.longitude,
};
```

## Entity Relationships

### Cascade Delete Behavior

All itinerary entities cascade delete from their parent:

```
Trip (DELETE) 
  └─> ItineraryItem (CASCADE DELETE)
        └─> Flight/Transport/Accommodation (CASCADE DELETE)
```

**Example**:
```typescript
// Deleting a trip deletes all associated items and their details
await tripRepository.remove(trip);
// All itinerary items, flights, transports, and accommodations are deleted
```

### Relationship Diagrams

```
Trip 1──────* ItineraryItem
              │
              ├─────1 Flight
              ├─────1 Transport
              └─────1 Accommodation
```

## Querying Patterns

### Load Trip with Items

```typescript
const trip = await tripRepository.findOne({
  where: { id: tripId },
  relations: ['itineraryItems'],
  order: {
    itineraryItems: {
      startDate: 'ASC',
    },
  },
});
```

### Load Item with Flight Details

```typescript
const item = await itineraryItemRepository.findOne({
  where: { id: itemId, type: 'flight' },
});

const flight = await flightRepository.findOne({
  where: { itineraryItemId: item.id },
  relations: ['itineraryItem'],
});

// Access location data
const departure = flight.departureLocation;
console.log(`Flying from ${departure.city}`);
```

### Query Items by Date Range

```typescript
const items = await itineraryItemRepository.find({
  where: {
    tripId: tripId,
    startDate: Between(startDate, endDate),
  },
  order: { startDate: 'ASC' },
});
```

### Find Items by Type

```typescript
const flights = await itineraryItemRepository.find({
  where: { tripId: tripId, type: 'flight' },
  order: { startDate: 'ASC' },
});
```

## Testing

Comprehensive integration tests verify:

✅ Entity creation with all fields  
✅ Relationship loading (ManyToOne, OneToOne)  
✅ JSON column parsing (getters/setters)  
✅ Cascade delete behavior  
✅ Complex queries with relations  
✅ Sorting by dates  

**Run tests**:
```bash
npm test -- --testPathPattern=entities.integration
```

## Migration Support

All entities are registered in TypeORM migrations. Schema changes should be handled through migrations:

```bash
# Generate migration after entity changes
npm run migration:generate -- -n UpdateEntities

# Run migrations
npm run migration:run
```

## Best Practices

1. **Always use virtual properties** for location access (don't parse JSON manually)
2. **Load relations explicitly** when needed (use `relations` option)
3. **Use cascade delete** to maintain referential integrity
4. **Sort by startDate** for chronological display
5. **Validate dates** before saving (endDate > startDate)
6. **Store durations in minutes** for consistency
7. **Use UUIDs** for all entity IDs

## Type Safety

All entities use TypeScript strict mode with definite assignment assertions (`!`):

```typescript
@Column('varchar')
title!: string;  // ! asserts initialization by TypeORM
```

This ensures type safety while acknowledging that TypeORM handles initialization.

## Future Enhancements

Potential improvements:
- Add `@BeforeInsert` hooks for validation
- Implement custom repository methods for common queries
- Add soft delete support with `@DeleteDateColumn`
- Create views/materialized queries for performance
- Add full-text search on titles and notes
