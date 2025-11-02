import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'better-sqlite3',
  database: process.env.DATABASE_PATH || './database/trip-organizer.db',
  entities: ['src/modules/**/entities/*.entity.ts'],
  migrations: ['src/modules/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
