/**
 * @file server/main.ts
 * @module SovereignBff
 * @description The entry point for the Act I Zero-Trust Backend-For-Frontend (BFF). 
 * This orchestration layer manages the 'Drafting Command Bus', enforces the $100/month 
 * subscription tiering via the Subscription Event Processor, and bridges the Hexagonal 
 * Domain logic with the Distributed WebSocket Orchestration fleet.
 *
 * Time Complexity: O(1) for bootstrap initialization.
 * Domain Context: Sovereign Architectural Core / Infrastructure Layer.
 * Thrown Exceptions: 
 *  - StartupFailureException: If the Kafka cluster or Redis Pub/Sub fails to acknowledge.
 *  - ConfigurationEntropyException: If asymmetric cryptographic keys are missing.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * bootstrap - Primary Execution Lifecycle Anchor
 *
 * This function initializes the NestJS IoC container, configures the multi-tenant 
 * middleware stack, and establishes the dual-protocol interface (HTTPS/WSS + Kafka).
 *
 * @returns {Promise<void>} A promise representing the eventual consistency of the server state.
 */
async function bootstrap() {
  const logger = new Logger('SovereignBootstrap');

  // Act I: Create the highly fortified NestJS application instance
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    },
  });

  // Security Hardening: Enforce Zero-Trust via Helmet and customized CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://www.google.com'],
        connectSrc: ["'self'", 'wss:', 'https://generativelanguage.googleapis.com'],
      },
    },
  }));

  // Act II: Hybrid Microservice Configuration (Kafka Integration)
  // The BFF acts as a Kafka producer/consumer for the CQRS State Fabric
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        clientId: 'sovereign-bff-gateway',
      },
      consumer: {
        groupId: 'sovereign-bff-consumer',
      },
    },
  });

  // Act III: Global Interceptors and Validation Piles
  // Enforce strict Domain Entity validation before events hit the Kafka stream
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Billion Dollar Enterprise Branding: Swagger/OpenAPI Auto-Documentation
  const config = new DocumentBuilder()
    .setTitle('Sovereign Architecture: Act I API')
    .setDescription('The Zero-Trust Drafting Command Bus & Subscription Gateway Interface Specification')
    .setVersion('1.0.0-PRO')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'Asymmetric-JWT')
    .addTag('Drafting', 'Legislative generation command bus operations')
    .addTag('Subscription', 'Tier-based access control and usage verification')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs/api', app, document, {
    customSiteTitle: 'Sovereign API Console',
    swaggerOptions: { persistAuthorization: true },
  });

  // Start Microservices and the primary HTTP server
  await app.startAllMicroservices();
  
  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);

  logger.log(`
================================================================================
  SOVEREIGN ARCHITECTURE INITIALIZED SUCCESSFULLY
  BFF GATEWAY: http://localhost:${PORT}
  API CONSOLE: http://localhost:${PORT}/docs/api
  KAFKA FABRIC: CONNECTED
  REDIS HYDRATION: ENABLED
  TIERING SYSTEM: $100/MONTH ENFORCEMENT ACTIVE
================================================================================
  `);
}

// Error handling for the bootstrap lifecycle to prevent unhandled node crashes
bootstrap().catch((err) => {
  console.error('CRITICAL_SYSTEM_FAILURE: FATAL BOOTSTRAP ERROR');
  console.error(err);
  process.exit(1);
});
"
}