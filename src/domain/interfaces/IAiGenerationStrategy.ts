import { DraftingInput, BillData } from '../../types';

/**
 * @interface IAiGenerationStrategy
 * @description Represents the Sovereign-tier abstraction for large language model orchestration within 
 * the Act III Hexagonal Domain-Driven Design architecture. This interface defines the contract for 
 * concrete AI adapters (e.g., Gemini, GPT-4, Claude) to ensure interoperability and polymorphic execution 
 * across the 'Drafting Command Bus'. By abstracting the generation logic, the system maintains strict 
 * adherence to the Dependency Inversion Principle, allowing the core Legislative Domain to remain 
 * agnostic of the underlying inference engine provider.
 *
 * @version 1.0.0-PRO-TIER
 * @author Elite AI Implementation Team
 */
export interface IAiGenerationStrategy {
  /**
   * @method executeStreamedGeneration
   * @description Initiates a high-concurrency, packet-buffered streaming sequence to generate complex 
   * legislative drafts. This method leverages the 'Sovereign-Stream' protocol to push incremental 
   * Domain Events to the client-side materialized view through a binary-packed WebSocket orchestration layer.
   * 
   * @domain-context Legislative Drafting Pipeline - Initial Generation Phase.
   * @time-complexity O(N * T) where N is the depth of the prompt context and T is the token generation latency of the upstream LLM cluster.
   * @throughput Optimized for $100/month high-tier subscription latency guarantees.
   * 
   * @param {DraftingInput} input - The immutable domain command containing legislative parameters, policy mandates, and PDF-ingested metadata.
   * @param {string} modelIdentifier - The specific hyper-parameterized model version (e.g., 'gemini-3.1-pro-preview') to be utilized for this invocation.
   * 
   * @throws {SubscriptionTierExceededException} Thrown if the billing middleware detects an unauthorized usage spike above the $100/month quota.
   * @throws {UpstreamInferenceException} Thrown if the distributed AI fleet encounters a transient 5xx error or rate-limit saturation.
   * @throws {DomainValidationException} Thrown if the provided input violates the HOLC (House Legislative Counsel) style invariants.
   * 
   * @returns {AsyncGenerator<{ text: string; isDone: boolean; metadata: Record<string, any> }>} An asynchronous stream of chunked bill data and execution telemetry.
   */
  executeStreamedGeneration(
    input: DraftingInput, 
    modelIdentifier: string
  ): AsyncGenerator<{
    text: string;
    isDone: boolean;
    metadata: Record<string, any>;
  }>;

  /**
   * @method executeStreamedImprovement
   * @description Orchestrates a recursive state-transformation sequence where an existing BillData entity 
   * is hydrated with additional policy depth and legal polish by a specialized AI agent (e.g., Constitutional Expert, Policy Analyst).
   * 
   * @domain-context Legislative Drafting Pipeline - Sequential Improvement Phase (CQRS Write Model).
   * @time-complexity O(D + (N * T)) where D is the size of the previous draft state and N*T is the delta generation overhead.
   * @memory-footprint High - requires maintaining the full context window of the previous architectural state to ensure consistency.
   * 
   * @param {BillData} previousState - The current materialized view of the bill before the improvement transformation is applied.
   * @param {DraftingInput} instructions - Supplemental domain instructions and feedback for the refinement stage.
   * @param {string} modelIdentifier - The high-precision model identifier targeted for this specific architectural layer.
   * @param {string} agentRole - The polymorphic persona (e.g., 'Legislative Counsel') assigned to the execution context.
   * 
   * @throws {InvalidStateTransitionException} Thrown if the previousState is corrupted or lacks the minimum required statutory sections.
   * @throws {DependencyInjectionException} Thrown if the required Infrastructure Adapters for the specified agentRole are unavailable.
   * 
   * @returns {AsyncGenerator<{ text: string; isDone: boolean; auditTrail: string[] }>} A stream containing the refined draft and an immutable audit trail of domain transformations.
   */
  executeStreamedImprovement(
    previousState: BillData, 
    instructions: DraftingInput, 
    modelIdentifier: string, 
    agentRole: string
  ): AsyncGenerator<{
    text: string;
    isDone: boolean;
    auditTrail: string[];
  }>;
}
