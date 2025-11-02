import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AppDataSource } from './data-source';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('✓ Database connection established');
      }
    } catch (error) {
      console.error('✗ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✓ Database connection closed');
    }
  }

  getDataSource() {
    return AppDataSource;
  }
}
