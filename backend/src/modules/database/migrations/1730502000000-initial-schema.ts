import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1730502000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create trips table
    await queryRunner.createTable(
      new Table({
        name: 'trips',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            length: '36',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create itinerary_items table (base table)
    await queryRunner.createTable(
      new Table({
        name: 'itinerary_items',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            length: '36',
          },
          {
            name: 'trip_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'order_index',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key for itinerary_items -> trips
    await queryRunner.createForeignKey(
      'itinerary_items',
      new TableForeignKey({
        columnNames: ['trip_id'],
        referencedTableName: 'trips',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for itinerary_items
    await queryRunner.createIndex(
      'itinerary_items',
      new TableIndex({
        name: 'IDX_ITINERARY_TRIP_ID',
        columnNames: ['trip_id'],
      }),
    );

    await queryRunner.createIndex(
      'itinerary_items',
      new TableIndex({
        name: 'IDX_ITINERARY_DATES',
        columnNames: ['start_date', 'end_date'],
      }),
    );

    await queryRunner.createIndex(
      'itinerary_items',
      new TableIndex({
        name: 'IDX_ITINERARY_ORDER',
        columnNames: ['trip_id', 'order_index'],
      }),
    );

    // Create flights table
    await queryRunner.createTable(
      new Table({
        name: 'flights',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            length: '36',
          },
          {
            name: 'itinerary_item_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'departure_location',
            type: 'text',
            isNullable: false,
            comment: 'JSON stored as string',
          },
          {
            name: 'arrival_location',
            type: 'text',
            isNullable: false,
            comment: 'JSON stored as string',
          },
          {
            name: 'flight_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'airline',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'confirmation_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'integer',
            isNullable: false,
            comment: 'Duration in minutes',
          },
        ],
      }),
      true,
    );

    // Add foreign key for flights -> itinerary_items
    await queryRunner.createForeignKey(
      'flights',
      new TableForeignKey({
        columnNames: ['itinerary_item_id'],
        referencedTableName: 'itinerary_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create transportation table
    await queryRunner.createTable(
      new Table({
        name: 'transportation',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            length: '36',
          },
          {
            name: 'itinerary_item_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'transport_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'train, bus, car, ferry, etc.',
          },
          {
            name: 'departure_location',
            type: 'text',
            isNullable: false,
            comment: 'JSON stored as string',
          },
          {
            name: 'arrival_location',
            type: 'text',
            isNullable: false,
            comment: 'JSON stored as string',
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'confirmation_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'integer',
            isNullable: false,
            comment: 'Duration in minutes',
          },
        ],
      }),
      true,
    );

    // Add foreign key for transportation -> itinerary_items
    await queryRunner.createForeignKey(
      'transportation',
      new TableForeignKey({
        columnNames: ['itinerary_item_id'],
        referencedTableName: 'itinerary_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create accommodations table
    await queryRunner.createTable(
      new Table({
        name: 'accommodations',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            length: '36',
          },
          {
            name: 'itinerary_item_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'location',
            type: 'text',
            isNullable: false,
            comment: 'JSON stored as string',
          },
          {
            name: 'confirmation_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'integer',
            isNullable: false,
            comment: 'Duration in minutes',
          },
        ],
      }),
      true,
    );

    // Add foreign key for accommodations -> itinerary_items
    await queryRunner.createForeignKey(
      'accommodations',
      new TableForeignKey({
        columnNames: ['itinerary_item_id'],
        referencedTableName: 'itinerary_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create location_cache table (for geocoding results)
    await queryRunner.createTable(
      new Table({
        name: 'location_cache',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            length: '36',
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'formatted_address',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: false,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'place_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create index on address for location cache lookups
    await queryRunner.createIndex(
      'location_cache',
      new TableIndex({
        name: 'IDX_LOCATION_ADDRESS',
        columnNames: ['address'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to respect foreign keys
    await queryRunner.dropTable('location_cache', true);
    await queryRunner.dropTable('accommodations', true);
    await queryRunner.dropTable('transportation', true);
    await queryRunner.dropTable('flights', true);
    await queryRunner.dropTable('itinerary_items', true);
    await queryRunner.dropTable('trips', true);
  }
}
