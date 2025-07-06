import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { rateLimit } from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Rate limiting middleware
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per window
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow non-browser clients

      const allowedOrigins = [
        'http://localhost:3000',
        'https://localhost:3000',
        'https://shared-commenting-app.vercel.app',
        'https://shared-commenting-app-production.up.railway.app',
      ];

      const wildcardOrigins = [
        /\.vercel\.app$/,
        /\.netlify\.app$/,
        /\.onrender\.com$/,
      ];

      const isAllowed =
        allowedOrigins.includes(origin) ||
        wildcardOrigins.some((regex) => regex.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Comment App API')
    .setDescription('A scalable comment application API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the server
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Comment App Backend running on port ${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api`);
}

bootstrap();
