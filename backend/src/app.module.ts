import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';
import { HealthController } from './health/health.controller';

// Entities
import { User } from './users/entities/user.entity';
import { Comment } from './comments/entities/comment.entity';
import { Notification } from './notifications/entities/notification.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        const isLocalPostgres = databaseUrl?.includes('localhost') || databaseUrl?.includes('postgres:5432');
        const sslDisabled = configService.get('DATABASE_SSL') === 'false';
        
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [User, Comment, Notification],
          synchronize: false, // Use migrations instead of synchronize
          logging: process.env.NODE_ENV !== 'production',
          autoLoadEntities: true,
          // Use environment variable to control SSL, fallback to detecting local postgres
          ssl: sslDisabled || isLocalPostgres ? false : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
        };
      },
    }),

    // Cache (used for caching frequently accessed data)
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default TTL
    }),

    // Task Scheduling
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    CommentsModule,
    NotificationsModule,
    WebSocketModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
