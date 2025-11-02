# Trip Organizer

A comprehensive trip planning and organization application that helps travelers create, manage, and visualize their travel itineraries with detailed information about flights, accommodations, and other travel segments.

## Features

- **Trip Management**: Create, edit, and organize multiple trips
- **Flight Tracking**: Add detailed flight information with departure/arrival times and locations
- **Transportation**: Track various transportation methods (trains, buses, cars, ferries, etc.)
- **Accommodation Management**: Manage hotel bookings and lodging details
- **Gap Detection**: Automatically identify gaps and inconsistencies in your itinerary
- **Google Maps Integration**: Geocode locations and visualize your journey
- **Drag-and-Drop**: Easily reorganize itinerary items
- **Timeline View**: See your trip in chronological order
- **Data Export**: Export trips to JSON and iCalendar formats

## Technology Stack

### Frontend

- **Angular 18+** - Modern web framework
- **NgRx Signals** - State management with reactive signals
- **SCSS** - Styling with mobile-first approach
- **TypeScript 5.0+** - Type-safe development
- **Angular CDK** - Drag-and-drop functionality

### Backend (BFF)

- **NestJS** - Backend for Frontend API layer
- **TypeScript 5.0+** - Type-safe server code
- **SQLite** - Local database storage
- **TypeORM** - Type-safe database queries
- **Google Maps API** - Geocoding and location services (proxied for security)

## Architecture

The application uses a three-tier architecture:

```
┌─────────────────────────────────┐
│     Angular Frontend (SPA)      │
│  - NgRx Store with Signals      │
│  - Component-based UI           │
└──────────────┬──────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────┐
│    BFF API Layer (NestJS)       │
│  - REST endpoints               │
│  - API key management           │
│  - Business logic               │
└──────────────┬──────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────┐
│    SQLite Database (Local)      │
│  - Trip data                    │
│  - Itinerary items              │
│  - Location cache               │
└─────────────────────────────────┘
```

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Angular CLI** (will be installed locally)
- **NestJS CLI** (will be installed locally)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd trip-organizer
```

2. **Install dependencies**

```bash
npm run install:all
```

This will install dependencies for the root project, frontend, and backend.

3. **Configure environment variables**

Backend configuration:

```bash
cd backend
cp .env.example .env
# Edit .env and add your Google Maps API key
```

4. **Run database migrations**

```bash
cd backend
npm run migration:run
```

### Development

**Run both frontend and backend concurrently:**

```bash
npm run dev
```

This will start:

- Backend API at http://localhost:3000
- Frontend app at http://localhost:4200

**Or run them separately:**

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or build separately
npm run build:backend
npm run build:frontend
```

### Testing

```bash
# Run all tests
npm test

# Run tests separately
npm run test:backend
npm run test:frontend
```

### Linting

```bash
# Lint all code
npm run lint

# Lint separately
npm run lint:backend
npm run lint:frontend
```

## Project Structure

```
trip-organizer/
├── frontend/               # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Services, models, guards
│   │   │   ├── features/  # Feature modules (trips, itinerary, maps)
│   │   │   ├── shared/    # Shared components, pipes, directives
│   │   │   └── store/     # NgRx root state
│   │   ├── assets/        # Static assets
│   │   ├── environments/  # Environment configs
│   │   └── styles.scss    # Global styles
│   └── package.json
├── backend/               # NestJS BFF API
│   ├── src/
│   │   ├── modules/       # Feature modules (trips, itinerary, maps)
│   │   ├── common/        # Shared utilities
│   │   ├── config/        # Configuration
│   │   └── main.ts
│   ├── database/          # SQLite database files
│   └── package.json
├── shared/                # Shared TypeScript types
│   └── types/
├── package.json           # Root workspace config
└── README.md
```

## API Documentation

The backend API provides the following endpoints:

### Trips

- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Itinerary Items

- `GET /api/trips/:tripId/itinerary` - Get all items for a trip
- `POST /api/trips/:tripId/itinerary/flight` - Create flight
- `POST /api/trips/:tripId/itinerary/transport` - Create transportation
- `POST /api/trips/:tripId/itinerary/accommodation` - Create accommodation
- `PUT /api/itinerary/:id` - Update item
- `DELETE /api/itinerary/:id` - Delete item

### Gap Detection

- `GET /api/trips/:tripId/gaps` - Get detected gaps in itinerary

### Maps (Proxied)

- `POST /api/maps/geocode` - Geocode an address
- `GET /api/maps/place/:placeId` - Get place details

### Export

- `GET /api/trips/:id/export/json` - Export trip as JSON
- `GET /api/trips/:id/export/ical` - Export trip as iCalendar

## Key Features Implementation

### Gap Detection

The system automatically detects:

- Time gaps between consecutive items (>2 hours)
- Location mismatches (arrival city ≠ next departure city)
- Missing overnight accommodations

### Google Maps Integration

- All location data is geocoded through the BFF API
- API keys are never exposed to the frontend
- Results are cached in the database to minimize API calls

### Drag-and-Drop

- Uses Angular CDK for smooth drag-and-drop
- Automatically recalculates dates/times when items are reordered
- Triggers gap detection after reordering

## Security

- **API Key Protection**: Google Maps API keys stored securely on backend
- **CORS**: Properly configured for frontend-backend communication
- **Input Validation**: All inputs validated on both frontend and backend
- **Data Sanitization**: User inputs sanitized to prevent XSS attacks

## Performance

- **Lazy Loading**: Feature modules loaded on demand
- **OnPush Change Detection**: Optimized component updates
- **Database Indexing**: Optimized queries with proper indexes
- **Response Caching**: Location geocoding results cached

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

- **Unit Tests**: >80% code coverage target
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Critical user flows tested with Cypress/Playwright

## Accessibility

The application follows WCAG 2.1 Level AA guidelines:

- Keyboard navigation support
- Screen reader compatible
- Sufficient color contrast
- Proper ARIA labels

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see LICENSE file for details

## Roadmap

### Phase 1 (Current)

- ✅ Basic trip CRUD operations
- ✅ Itinerary item management
- ✅ Gap detection
- ✅ Google Maps integration

### Phase 2 (Planned)

- PWA support for offline mode
- Multi-timezone display
- Advanced map views with routes
- Export to PDF

### Phase 3 (Future)

- Cloud sync
- Multi-user collaboration
- Budget tracking
- Weather integration
- Mobile native apps

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Angular team for the amazing framework
- NestJS team for the powerful backend framework
- Google Maps Platform for geocoding services
