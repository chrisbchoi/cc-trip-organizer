# Database Module

This module handles database configuration and migrations for the Trip Organizer application.

## Structure

```
modules/database/
├── data-source.ts              # TypeORM DataSource configuration for migrations
├── database.module.ts          # NestJS module for database integration
├── database.service.ts         # Service for database lifecycle management
└── migrations/                 # TypeORM migrations
    └── 1730502000000-initial-schema.ts
```

## Entities

The database schema includes the following entities:

### Core Tables
- **trips**: Main trip information
- **itinerary_items**: Base table for all itinerary items
- **flights**: Flight-specific details
- **transportation**: Ground/sea transportation details
- **accommodations**: Lodging details
- **location_cache**: Cached geocoding results

### Relationships
- `trips` ← one-to-many → `itinerary_items` (CASCADE DELETE)
- `itinerary_items` ← one-to-one → `flights` (CASCADE DELETE)
- `itinerary_items` ← one-to-one → `transportation` (CASCADE DELETE)
- `itinerary_items` ← one-to-one → `accommodations` (CASCADE DELETE)

### Indexes
- `IDX_ITINERARY_TRIP_ID`: Fast lookup of items by trip
- `IDX_ITINERARY_DATES`: Fast queries by date range
- `IDX_ITINERARY_ORDER`: Optimized ordering within trips
- `IDX_LOCATION_ADDRESS`: Fast geocoding cache lookups

## Running Migrations

### Run pending migrations
```bash
npm run migration:run
```

### Revert last migration
```bash
npm run migration:revert
```

### Show migration status
```bash
npm run migration:show
```

### Generate new migration (after entity changes)
```bash
npm run migration:generate -- src/modules/database/migrations/MigrationName
```

## Database Configuration

Database configuration is controlled via environment variables:

- `DATABASE_PATH`: Path to SQLite database file (default: `./database/trip-organizer.db`)
- `NODE_ENV`: Set to `development` to enable query logging

## Development

The database is configured to use SQLite with better-sqlite3 for optimal performance.

### Key Features:
- **Synchronize: false** - Always use migrations in production
- **Foreign keys enabled** - Ensures referential integrity
- **Cascade deletes** - Deleting a trip removes all related items
- **Timestamps** - Automatic created_at and updated_at tracking

## Querying the Database

You can directly query the database for inspection:

```bash
# List all tables
sqlite3 database/trip-organizer.db ".tables"

# Show table schema
sqlite3 database/trip-organizer.db ".schema trips"

# Query data
sqlite3 database/trip-organizer.db "SELECT * FROM trips;"
```

## Important Notes

1. **Migrations are one-way**: Always test migrations thoroughly before running in production
2. **Foreign keys**: SQLite foreign keys must be explicitly enabled (PRAGMA foreign_keys = ON)
3. **JSON fields**: Location data is stored as JSON strings in TEXT columns
4. **UUIDs**: Entity IDs are VARCHAR(36) to support UUID format
