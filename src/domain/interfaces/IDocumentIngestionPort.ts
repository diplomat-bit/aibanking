import { PDFFile } from '../../types';

/**
 * @interface IDocumentIngestionPort
 * @version 1.0.0-Sovereign
 * @description 
 * Defines the high-fidelity, industrial-grade entry point for document processing within the 
 * Sovereign Architecture's Hexagonal Domain Core. This port facilitates the transition of 
 * unstructured binary data—such as SEC Form 8-K filings and legislative PDFs—into a state-managed,
 * immutable domain representation suitable for downstream Kafka event sourcing. 
 * 
 * In the billion-dollar BFF (Backend-For-Frontend) paradigm, this port serves as the abstract
 * anchor point for hyper-parallelized ingestion strategies, ensuring that the primary domain
 * logic remains decoupled from the specific underlying LLM or OCR orchestration provider.
 * 
 * Any concrete adapter implementing this interface must adhere to the Deterministic Execution
 * standards required for enterprise-tier subscription processing ($100/month tiering).
 */
export interface IDocumentIngestionPort {
  /**
   * @async
   * @function ingestDocument
   * @description 
   * Performs a multi-stage ingestion of raw document fragments into the Sovereign State Fabric.
   * This method triggers the initial 'PdfIngestionCompletedEvent' within the CQRS pipeline,
   * facilitating the extraction of statutory citations and semantic metadata using
   * deterministic parsing protocols.
   * 
   * @domain_context 
   * Part of the 'Act III: Hexagonal DDD' directive. This function bridges the Infrastructure
   * layer (where raw bytes reside) to the Domain layer (where Legislative Entities are birthed).
   * 
   * @time_complexity 
   * O(N * log(M)) where N is the total byte size of the document and M is the density of
   * unique statutory citations discovered during the tokenization phase. Extraction overhead
   * is mitigated via optimized background worker orchestration.
   * 
   * @throws {SovereignIngestionException} 
   * Thrown if the binary buffer fails the integrity checksum or if the MIME type is non-compliant.
   * @throws {RateLimitExceededException} 
   * Thrown if the subscription tier quota is exhausted per the $100/mo billing gate.
   * @throws {mTLSHandshakeException} 
   * Thrown if the security handshake with the remote ingestion cluster fails.
   * 
   * @param {PDFFile} document - The raw, base64-encoded PDF or binary-packed buffer payload.
   * @returns {Promise<string>} - Returns an AcceptanceToken for optimistic client-side hydration.
   */
  ingestDocument(document: PDFFile): Promise<string>;

  /**
   * @async
   * @function extractStatutoryContext
   * @description 
   * Specialized domain operation that leverages a High-Frequency Legislative Parser to 
   * isolate legal citations (e.g., U.S.C. references) from ingested document buffers.
   * 
   * @domain_context 
   * Vital for 'Act II: Event-Sourced CQRS State Fabric'. Extracted context is published to
   * the Redis Pub/Sub channel for immediate optimistic hydration of the Sovereign UI.
   * 
   * @time_complexity 
   * O(P * K) where P is the number of identified paragraphs and K is the average tokens
   * per paragraph being processed by the legislative strategy engine.
   * 
   * @throws {MalformedCitationException} 
   * Thrown if a citation cannot be resolved against the official HOLC citation registry.
   * @throws {AuthorizationException} 
   * Thrown if the user lacks the 'Advanced Researcher' permission required for extraction.
   * 
   * @param {string} acceptanceToken - The token received from initial ingestion to track context.
   * @returns {Promise<string[]>} - A collection of validated statutory citations found within.
   */
  extractStatutoryContext(acceptanceToken: string): Promise<string[]>;
}
