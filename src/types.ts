/**
 * @file src/types.ts
 * @description Master Type Definitions for the Sovereign Legislative Architecture.
 * This file contains the Event-Sourced CQRS, Hexagonal DDD, and Sovereign UI
 * interface contracts required to maintain our zero-trust, $100/mo enterprise tier.
 * @author The Elite AI Implementation Team
 */

import type { ReactNode } from 'react';

// ============================================================================
// ACT I: ZERO-TRUST BFF & SUBSCRIPTION GATEWAY
// ============================================================================

/**
 * @interface IJwtAsymmetricClaims
 * @description Cryptographically secure claims embedded in our asymmetric JWTs.
 * @timeComplexity O(1) attribute access
 * @domainContext Zero-Trust Security / Subscription Gateway
 * @throws {TokenExpiredException} if accessed past exp
 */
export interface IJwtAsymmetricClaims {
  readonly subjectId: string;
  readonly roles: ReadonlyArray<'ADMIN' | 'DRAFTER' | 'ANALYST'>;
  readonly tier: 'FREE' | 'ENTERPRISE_100_USD';
  readonly nonce: string;
  readonly exp: number;
}

/**
 * @interface ISubscriptionEventProcessor
 * @description Contract for processing real-time billing events to enforce the $100/mo tier.
 * @timeComplexity O(log N) for tier verification
 * @domainContext Payment Verification Middleware
 * @throws {PaymentRequiredException} if tier is insufficient
 */
export interface ISubscriptionEventProcessor {
  verifyEnterpriseStatus(claims: IJwtAsymmetricClaims): Promise<boolean>;
  chargeUsageQuota(subjectId: string, computeUnits: number): Promise<void>;
}

// ============================================================================
// ACT II: EVENT-SOURCED CQRS STATE FABRIC
// ============================================================================

/**
 * @interface IDomainEvent
 * @description The immutable base standard for all events published to the Kafka cluster.
 * @timeComplexity O(1) instantiation
 * @domainContext Event Sourcing / CQRS Fabric
 * @throws {InvalidEventPayloadException} on validation failure
 */
export interface IDomainEvent<T = any> {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly timestamp: number;
  readonly type: string;
  readonly payload: T;
}

export interface BillDraftInitiatedPayload {
  readonly purpose: string;
  readonly type: 'Bill' | 'Joint Resolution' | 'Concurrent Resolution' | 'Simple Resolution';
  readonly isAmendatory: boolean;
}

export type BillDraftInitiatedEvent = IDomainEvent<BillDraftInitiatedPayload>;

export interface PdfIngestionCompletedPayload {
  readonly documentId: string;
  readonly extractedKnowledgeBase: string;
  readonly mimeType: string;
}

export type PdfIngestionCompletedEvent = IDomainEvent<PdfIngestionCompletedPayload>;

// ============================================================================
// ACT III: HEXAGONAL DOMAIN-DRIVEN DESIGN (DDD) & INTERFACE POLYMORPHISM
// ============================================================================

/**
 * @interface IAiGenerationStrategy
 * @description The core port for integrating various LLM providers behind our DependencyInjectionContainer.
 * @timeComplexity O(N) where N is token length
 * @domainContext AI Orchestration / Hexagonal Ports
 * @throws {AiProviderTimeoutException} if generation exceeds SLA
 */
export interface IAiGenerationStrategy {
  executePrompt(prompt: string, context: Record<string, unknown>): Promise<string>;
  streamChunks(prompt: string): AsyncGenerator<Uint8Array, void, unknown>;
}

/**
 * @interface ILegislativeParser
 * @description Adapts raw AI output into highly structured LegislativeBillEntities.
 * @timeComplexity O(M) where M is the size of the abstract syntax tree
 * @domainContext Parsing / Anti-Corruption Layer
 * @throws {MalformedLegislativeSyntaxException} on parsing failure
 */
export interface ILegislativeParser {
  parse(rawContent: string): LegislativeBillEntity;
}

/**
 * @interface IDocumentIngestionPort
 * @description Port for handling multi-modal document uploads (PDF, SEC 8-K).
 * @timeComplexity O(S) where S is file size
 * @domainContext Infrastructure Adapters
 * @throws {UnsupportedMimeTypeException}
 */
export interface IDocumentIngestionPort {
  ingest(base64Data: string, mimeType: string): Promise<string>;
}

/**
 * @interface CitationValueObject
 * @description An immutable Value Object representing a legal citation.
 */
export interface CitationValueObject {
  readonly title: string;
  readonly section: string;
  readonly rawText: string;
}

/**
 * @interface SectionEntity
 * @description A Domain Entity representing a single legislative section.
 */
export interface SectionEntity {
  readonly id: string;
  heading: string;
  content: string;
  readonly citations: CitationValueObject[];
}

/**
 * @interface LegislativeBillEntity
 * @description The Aggregate Root representing a piece of legislation.
 * @timeComplexity O(1) state access
 * @domainContext Core Domain Entity
 * @throws {InvariantViolationException} if business rules fail
 */
export interface LegislativeBillEntity {
  readonly aggregateId: string;
  longTitle: string;
  shortTitle?: string;
  preamble?: string;
  sections: SectionEntity[];
  policyPoints: string[];
  amendments: string[];
  financials: string[];
  searchSources: string[];
  validateInvariants(): boolean;
}

// ============================================================================
// ACT IV: DISTRIBUTED WEBSOCKET ORCHESTRATION & OPTIMISTIC HYDRATION
// ============================================================================

/**
 * @interface AcceptanceToken
 * @description The cryptographically signed token returned to the frontend upon accepting a draft command.
 * @timeComplexity O(1) verification
 * @domainContext Orchestration / CQRS Write Model
 * @throws {InvalidTokenSignatureException}
 */
export interface AcceptanceToken {
  readonly traceId: string;
  readonly wsEndpoint: string;
  readonly signature: string;
}

/**
 * @interface WebSocketPacket
 * @description The binary-packed buffer payload sent from the GoLang Kafka worker over Redis Pub/Sub.
 * @timeComplexity O(1) decoding per chunk
 * @domainContext Real-time Streaming
 * @throws {BufferOverflowException}
 */
export interface WebSocketPacket {
  readonly sequenceId: number;
  readonly isFinal: boolean;
  readonly compressedPayload: Uint8Array;
}

// ============================================================================
// ACT V: THE 'SOVEREIGN UI' ABSTRACT COMPONENT FRAMEWORK
// ============================================================================

/**
 * @interface ISovereignThemeContext
 * @description The proprietary context feeding design tokens to the Headless Sovereign UI library.
 * @timeComplexity O(1) property resolution
 * @domainContext Frontend Styling Architecture
 * @throws {MissingProviderException} if accessed outside of <SovereignThemeProvider>
 */
export interface ISovereignThemeContext {
  mode: 'billionaire_chic' | 'enterprise_dark' | 'governmental_high_contrast';
  spacing: Record<string, string>;
  typography: Record<string, string>;
  depth: Record<string, string>;
}

/**
 * @interface ISovereignA11yProps
 * @description Enforces strict WCAG 2.1 Level AAA compliance across all abstract components.
 */
export interface ISovereignA11yProps {
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
  readonly role?: string;
  readonly tabIndex?: number;
}

/**
 * @type SovereignInputAbstractType
 * @description Deeply typed discrimination union for semantic input rendering.
 */
export type SovereignInputAbstractType = 
  | 'citation_query' 
  | 'policy_mandate' 
  | 'financial_appropriation' 
  | 'amendment_directive';

// ============================================================================
// LEGACY COMPATIBILITY (DEPRECATED - TO BE REMOVED IN V2)
// ============================================================================

export type BillType = 'Bill' | 'Joint Resolution' | 'Concurrent Resolution' | 'Simple Resolution';

export interface PDFFile {
  name: string;
  data: string;
  mimeType: string;
}

export interface DraftingInput {
  type: BillType;
  purpose: string;
  policyPoints: string[];
  amendments?: string[];
  financials?: string[];
  isAmendatory: boolean;
  targetStatutes: string[];
  pdfs: PDFFile[];
  knowledgeBaseText?: string;
  useGoogleSearch: boolean;
}

export interface AgentResult {
  id: string;
  model: string;
  name: string;
  content: string;
  isStreaming: boolean;
  error?: string;
  parsedBill?: BillData;
}

export interface BillSection {
  heading: string;
  content: string;
}

export interface BillData {
  longTitle: string;
  shortTitle?: string;
  preamble?: string;
  sections: BillSection[];
  policyPoints?: string[];
  amendments?: string[];
  financials?: string[];
  searchSources?: string[];
}
