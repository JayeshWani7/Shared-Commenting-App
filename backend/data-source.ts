import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/users/entities/user.entity';
import { Comment } from './src/comments/entities/comment.entity';
import { Notification } from './src/notifications/entities/notification.entity';

// Load environment variables
config();

const databaseUrl = process.env.DATABASE_URL;
const isLocalPostgres = databaseUrl?.includes('localhost') || databaseUrl?.includes('postgres:5432');
const sslDisabled = process.env.DATABASE_SSL === 'false';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User, Comment, Notification],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always false for migrations
  logging: process.env.NODE_ENV !== 'production',
  ssl: sslDisabled || isLocalPostgres ? false : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
});
