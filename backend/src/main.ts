import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for frontend application
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Set Global Prefix for API routes
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Dorahacks NestJS Backend')
    .setDescription('API documentation for the Dorahacks NestJS backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Endpoints related to user authentication')
    .addTag('Hackathons', 'Endpoints related to hackathon management')
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
