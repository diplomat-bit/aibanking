import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionGatewayModule } from './infrastructure/gateways/subscription-gateway.module';
import { DraftingCommandBusModule } from './domain/drafting/drafting-command-bus.module';
import { IdentityAuthorityModule } from './infrastructure/identity/identity-authority.module';
import { EventSourcedStateFabricModule } from './infrastructure/persistence/event-sourced-state-fabric.module';
import { DistributedOrchestrationModule } from './infrastructure/orchestration/distributed-orchestration.module';
import { SovereignBffMiddleware } from './infrastructure/middleware/sovereign-bff.middleware';

/**
 * @file server/app.module.ts
 * @description The Central Nervous System of the Sovereign Legislative Architecture.
 * This root module orchestrates the billion-dollar Backend-For-Frontend (BFF) ecosystem,
 * enforcing Zero-Trust protocols, CQRS dispatching, and distributed event-sourcing.
 *
 * Domain Context: Act I through Act V Architectural Transformation.
 * Time Complexity (Bootstrap): O(N * M) where N is the number of injected micro-services and M is dependency depth.
 * Exceptions: Throws InitializationException if the Kafka Cluster or Redis Pub/Sub Fabric is unreachable.
 */
@Module({
  imports: [
    /**
     * @description High-Availability Configuration Engine.
     * Injects environment-specific variables into the Hexagonal Domain.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    /**
     * @description Command Query Responsibility Segregation (CQRS) Fabric.
     * Decouples the Write-Model (Command) from the Read-Model (Query) for hyper-scale concurrency.
     */
    CqrsModule.forRoot(),

    /**
     * @description The Zero-Trust Identity Authority.
     * Manages asymmetric cryptographic handshakes and JWT-based validation for high-tier subscribers.
     */
    IdentityAuthorityModule,

    /**
     * @description The $100/Month Subscription Event Processor.
     * Enforces the legislative gateway tiering via specialized middleware and credit validation.
     */
    SubscriptionGatewayModule,

    /**
     * @description The Drafting Command Bus.
     * Routes frontend-dispatched intents to the appropriate Hexagonal Interactors and AI Generation Strategies.
     */
    DraftingCommandBusModule,

    /**
     * @description Event-Sourced Persistence Layer.
     * Interfaces with Apache Kafka to store immutable domain events and hydrate Redis-backed materialized views.
     */
    EventSourcedStateFabricModule,

    /**
     * @description Distributed WebSocket & Redis Orchestrator.
     * Manages binary-packed buffer streams and cross-node packet delivery for AI-chunk hydration.
     */
    DistributedOrchestrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  /**
   * @description Configures the global middleware stack for the Sovereign BFF.
   * Attaches the Zero-Trust verification layer to all ingress points.
   * 
   * @param consumer - The NestJS Middleware Consumer
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SovereignBffMiddleware)
      .forRoutes('*');
  }
}
