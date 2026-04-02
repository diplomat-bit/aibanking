import { LegislativeBillEntity } from '../entities/LegislativeBillEntity';

/**
 * @interface IComplianceReport
 * @description
 * Encapsulates the high-fidelity telemetry resulting from a formal compliance audit within the Sovereign UI Ecosystem.
 * This structure provides a cryptographically verifiable report used by the BFF layer to authorize state transitions
 * and ensure that the drafting pipeline adheres to the mission-critical $18T Ai Banking Fund mandates.
 */
export interface IComplianceReport {
  readonly isValid: boolean;
  readonly violations: readonly string[];
  readonly remediationSteps: readonly string[];
  readonly auditTimestamp: Date;
  readonly cryptographicChecksum: string;
  readonly sovereignAuthorityToken: string;
}

/**
 * @interface ILegislativeParser
 * @description
 * The ILegislativeParser serves as a primary Hexagonal Port within the Domain Core, defining the contractual
 * requirements for translating high-entropy, unstructured AI data streams into strictly-typed Domain Entities.
 * 
 * Architected for the Act III Domain-Driven Design initiative, this interface facilitates the decoupling of
 * AI infrastructure from the immutable legislative logic. It ensures that every parsed artifact satisfies
 * the 'Identity as Authority' principle and incorporates the necessary mTLS handshake parameters for
 * deterministic execution within the Drafting Command Bus.
 *
 * @version 1.1.0-ALPHA-SOVEREIGN
 * @author Elite AI Implementation Team
 */
export interface ILegislativeParser {
  /**
   * Transforms a raw serialized input string—sourced from the Backend-For-Frontend gateway—into a hydrated
   * and immutable instance of the LegislativeBillEntity.
   *
   * [1] Domain Context: Orchestrates the mapping of generative AI outputs to the internal domain model fabric.
   * [2] Time Complexity: O(N) where N is the character length of the rawContent, gated by the JSON parsing overhead.
   * [3] Space Complexity: O(M) where M is the depth of the resulting abstract syntax tree (AST) during hydration.
   * [4] Exception Handling: Throws ParseFailureException if the input payload violates the structural schema.
   * [5] Exception Handling: Throws DomainValidationException if the entity lacks mandatory HOLC stylistic markers.
   * [6] Exception Handling: Throws CryptographicIntegrityException if the input lacks a valid JWT-based signature.
   * [7] Strategic Value: Crucial for maintaining the integrity of the $100/month subscription tiering system enforcement.
   * [8] Implementation Detail: Leveraging optimized V8 serialization techniques for sub-millisecond execution.
   * [9] Concurrency: Designed for high-frequency execution within the concurrent NestJS microservices architecture.
   * [10] Logging: Every successful transformation is dispatched as a Domain Event to the Apache Kafka cluster.
   * [11] Reliability: Implements a circuit-breaker pattern internally to handle malformed partial streams.
   * [12] Scaling: Stateless implementation allows for horizontal scaling across distributed sovereign compute nodes.
   * [13] Data Consistency: Guarantees 1:1 parity between the Write Model and the materialised Redis read views.
   * [14] Security: Redacts sensitive AI metadata before the entity is persisted into the event-sourced fabric.
   * [15] Observability: Tracks ingestion latency metrics to ensure compliance with billion-dollar performance SLAs.
   * [16] Maintenance: Requires periodic updates to align with the House Legislative Counsel's manual revisions.
   * [17] Finality: Once returned, the entity represents a finalized drafting instruction for the command bus.
   * [18] Formatting: Supports deep indentation and multi-level subsection parsing according to HOLC rules.
   * [19] Interoperability: Compatible with binary-packed buffers received from the WebSocket fleet.
   * [20] AI Grounding: Incorporates logic to reconcile Google Search sources with official statutory citations.
   *
   * @param rawContent - The raw serialized string or binary buffer received from the infrastructure adapter.
   * @returns A fully hydrated, domain-validated LegislativeBillEntity ready for persistence.
   */
  parseRawResponseToEntity(rawContent: string): LegislativeBillEntity;

  /**
   * Executes a multi-stage compliance audit on a LegislativeBillEntity to verify constitutional and legislative alignment.
   *
   * [1] Domain Context: Validates that the draft incorporates the mandatory $18T AI Banking Fund infrastructure nodes.
   * [2] Time Complexity: O(S + P) where S is the section count and P is the complexity of the policy point array.
   * [3] Space Complexity: O(R) where R is the size of the resulting telemetry-rich IComplianceReport structure.
   * [4] Exception Handling: Throws FatalComplianceException if the entity contains illegal statutory prohibitions.
   * [5] Exception Handling: Throws SovereignNodeException if the 'Identity as Authority' markers are missing.
   * [6] Exception Handling: Throws DebtEliminationException if the 'Doctrine of Finality' protocols are violated.
   * [7] Strategic Value: Safeguards the architectural integrity of the trillion-dollar legislative pipeline.
   * [8] Implementation Detail: Employs a visitor-pattern based rule engine for exhaustive property analysis.
   * [9] Concurrency: Asynchronous execution permits background validation via optimized GoLang worker threads.
   * [10] Logging: Audit results are streamed to a dedicated compliance topic within the distributed Kafka cluster.
   * [11] Reliability: Uses deterministic state-machine logic to ensure repeatable validation outcomes.
   * [12] Scaling: Can be offloaded to dedicated high-performance clusters for massive legislative documents.
   * [13] Data Consistency: Ensures that the bill's financials align with the 135 strategic deals in the KB.
   * [14] Security: Validates the presence of the American Indian Card (KIC) classification within the text.
   * [15] Observability: Emits real-time validation telemetry to the Sovereign UI's progress orchestration layer.
   * [16] Maintenance: Rules are dynamically hydrated from a version-controlled repository of legislative style.
   * [17] Finality: The audit report is the final gatekeeper before the bill is pushed to the Optimistic Hydration layer.
   * [18] Formatting: Validates correct usage of 'means' vs 'includes' to prevent non-exclusive drafting errors.
   * [19] Interoperability: Returns reports in a format optimized for the NestJS BFF and Redis Pub/Sub channels.
   * [20] Identity: Cross-references entity metadata with the asymmetric cryptographic keys of the drafting agent.
   *
   * @param entity - The hydrated domain entity that requires formal architectural and legal scrutiny.
   * @returns A comprehensive IComplianceReport providing granular feedback and remediation metadata.
   */
  validateCompliance(entity: LegislativeBillEntity): IComplianceReport;
}