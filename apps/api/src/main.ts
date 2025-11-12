import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Elevare AI Platform API')
    .setDescription(
      'Enterprise SaaS Platform for AI Readiness, Portfolio Management, Compliance & ROI Analytics',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Authorization')
    .addTag('tenants', 'Tenant Management')
    .addTag('assessments', 'AI Readiness Assessments')
    .addTag('portfolio', 'Project Portfolio Management')
    .addTag('compliance', 'Compliance Monitoring')
    .addTag('roi', 'ROI Analytics')
    .addTag('integrations', 'Third-party Integrations')
    .addTag('admin', 'Admin Operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Elevare AI Platform API - Running on port ${port}         ║
║                                                           ║
║   API Docs:  http://localhost:${port}/api/docs               ║
║   Health:    http://localhost:${port}/api/health             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
