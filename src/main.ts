import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable trust proxy for accurate IP detection behind reverse proxies (nginx, load balancers)
  // This allows req.ip to correctly return the client's IP from X-Forwarded-For header
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // Enable CORS for frontend application
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://4hacksdb-front.vercel.app',
    ],
    credentials: true,
  });

  // Enable Cookie Parser Middleware
  app.use(cookieParser());

  // Enable Helmet Middleware (middleware that adds security headers)
  app.use(helmet());

  // Enable Validation Pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Set Global Prefix for API routes
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('4Hacks NestJS Backend')
    .setDescription('API documentation for the 4Hacks NestJS backend')
    .setVersion('1.0')
    .addTag('Authentication', 'Endpoints related to user authentication')
    .addTag(
      'Profile Management',
      'Endpoints related to user profile management',
    )
    .addTag('Users', 'Endpoints related to users management')
    .addTag('Notifications', 'Endpoints related to notifications management')
    .addTag('Organizations', 'Endpoints related to organization management')
    .addTag(
      'Categories',
      'Endpoints related to categories management of the hackathons',
    )
    .addTag('Hackathon Requests', 'Endpoints related to hackathon requests')
    .addTag('Hackathons', 'Endpoints related to hackathon management')
    .addTag(
      'Hackathon Prizes',
      'Endpoints related to hackathon prizes management',
    )
    .addTag(
      'Hackathon Judges Invitations',
      'Endpoints related to judges invitations management of the hackathons',
    )
    .addTag(
      'Hackathon Announcements',
      'Endpoints related to hackathon announcements management',
    )
    .addTag('Hackathon FAQ / Q&A', 'Endpoints related to hackathon FAQ / Q&A')
    .addTag('Hackathon Registration', 'Endpoints for hackathon registrations')
    .addTag(
      'Hackathon Registration Questions',
      'Endpoints for managing custom registration questions for hackathons',
    )
    .addTag('Hackathon Teams', 'Endpoints for hackathon teams')
    .addTag(
      'Hackathon Team Positions',
      'Endpoints related to hackathon team positions',
    )
    .addTag(
      'Hackathon Team Applications',
      'Endpoints related to hackathon team applications',
    )
    .addTag('Hackathon Submissions', 'Endpoints for hackathon submissions')
    .addTag('Submission Scores', 'Endpoints for submission scores')
    .addTag('Admin - User Management', 'Admin endpoints for user management')
    .addTag(
      'Admin - Hackathon Management',
      'Admin endpoints for hackathon management',
    )
    .addTag(
      'Test',
      'Endpoints for testing purposes. do not use them in frontend',
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT Authorization',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 8080;

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Application Swagger is running on: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
