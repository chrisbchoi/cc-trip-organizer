# Trip DTOs

This directory contains Data Transfer Objects (DTOs) for the Trip entity with comprehensive validation using `class-validator`.

## Files

### `create-trip.dto.ts`
DTO for creating a new trip with validation rules.

**Fields:**
- `title` (required): Trip title, max 255 characters
- `description` (optional): Trip description, max 2000 characters
- `startDate` (optional): Trip start date in ISO 8601 format
- `endDate` (optional): Trip end date in ISO 8601 format

**Validation Rules:**
- `title`: Required, non-empty string, max 255 characters
- `description`: Optional string, max 2000 characters
- `startDate`: Optional, must be valid ISO 8601 date string
- `endDate`: Optional, must be valid ISO 8601 date string, must be after `startDate`

**Example:**
```typescript
const createTripDto: CreateTripDto = {
  title: 'European Adventure',
  description: 'Two week trip through Europe',
  startDate: '2025-12-01T00:00:00.000Z',
  endDate: '2025-12-15T00:00:00.000Z',
};
```

### `update-trip.dto.ts`
DTO for updating an existing trip. Extends `PartialType(CreateTripDto)` making all fields optional.

**Fields:**
All fields from `CreateTripDto` are optional for partial updates.

**Example:**
```typescript
// Update only the title
const updateTripDto: UpdateTripDto = {
  title: 'Updated European Adventure',
};

// Update multiple fields
const updateTripDto: UpdateTripDto = {
  title: 'Extended European Adventure',
  description: 'Now includes Barcelona!',
  endDate: '2025-12-20T00:00:00.000Z',
};
```

## Custom Validators

### `@IsAfterDate`
Custom validator decorator that ensures a date field is after another date field.

**Location:** `backend/src/common/validators/date-validator.ts`

**Usage:**
```typescript
export class CreateTripDto {
  @IsDateString()
  startDate?: string;

  @IsDateString()
  @IsAfterDate('startDate', {
    message: 'End date must be after start date',
  })
  endDate?: string;
}
```

## Validation Usage

### In Controllers

Use `ValidationPipe` with DTOs:

```typescript
@Controller('api/trips')
export class TripsController {
  @Post()
  async create(@Body(ValidationPipe) createTripDto: CreateTripDto) {
    // DTO will be validated before reaching this point
    return this.tripsService.create(createTripDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, updateTripDto);
  }
}
```

### Manual Validation

For manual validation in services or tests:

```typescript
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

const dto = plainToInstance(CreateTripDto, plainObject);
const errors = await validate(dto);

if (errors.length > 0) {
  // Handle validation errors
  console.log('Validation failed:', errors);
}
```

## Date Handling

### Date Transformation

Dates are automatically transformed to ISO 8601 format using `@Transform` decorator:

```typescript
@Transform(({ value }) => {
  if (!value) return value;
  try {
    return new Date(value).toISOString();
  } catch {
    return value; // Return original to let validator catch it
  }
})
```

### Supported Date Formats

The DTOs accept various date formats and convert them to ISO 8601:
- ISO 8601: `2025-12-01T00:00:00.000Z` (recommended)
- Date strings: `2025-12-01`
- Timestamps: `1733011200000`

Invalid dates will be caught by the `@IsDateString()` validator.

## Error Responses

When validation fails, the API returns a `400 Bad Request` with detailed error information:

```json
{
  "statusCode": 400,
  "message": [
    "Title is required",
    "End date must be after start date"
  ],
  "error": "Bad Request"
}
```

## Testing

Comprehensive test suites are provided:

### `create-trip.dto.spec.ts`
Tests for CreateTripDto including:
- Title validation (required, length limits)
- Description validation (optional, length limits)
- Date validation (format, range)
- Date transformation
- Complete trip validation

### `update-trip.dto.spec.ts`
Tests for UpdateTripDto including:
- Partial updates (single field)
- Complete updates (all fields)
- Validation preservation (length limits, date range)
- Empty updates (all optional)

Run tests:
```bash
npm test -- --testPathPattern=dto
```

## Dependencies

- `class-validator`: Validation decorators
- `class-transformer`: Transformation decorators
- `@nestjs/mapped-types`: PartialType utility for UpdateTripDto

## Best Practices

1. **Always use DTOs with ValidationPipe**: Ensures data integrity at the API boundary
2. **Keep validation messages clear**: Help API consumers understand requirements
3. **Use optional fields wisely**: Required fields enforce data completeness
4. **Test validation thoroughly**: Cover edge cases and invalid input scenarios
5. **Document expected formats**: Especially for dates and complex types
