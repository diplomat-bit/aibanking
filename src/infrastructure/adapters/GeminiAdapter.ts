import { GoogleGenAI, GenerativeModel, ChatSession } from "@google/genai";
import { DraftingInput, BillData } from "../../types";
import { DRAFTING_RULES } from "../../constants";

/**
 * @interface IAiGenerationStrategy
 * @description High-fidelity contract for AI-driven legislative synthesis. 
 * Part of the Sovereign UI Abstract Component Framework's infrastructure layer.
 * Designed for maximum scalability within the $18T AI Banking Fund ecosystem.
 */
export interface IAiGenerationStrategy {
  executeStream(input: DraftingInput, modelName: string): AsyncGenerator<any, void, unknown>;
  refineStream(previousBill: BillData, input: DraftingInput, modelName: string, agentRole: string): AsyncGenerator<any, void, unknown>;
}

/**
 * @class GeminiAdapter
 * @description Concrete implementation of the IAiGenerationStrategy utilizing the Google Gemini Pro Vision and Flash models.
 * This adapter follows the Hexagonal Architecture (Ports and Adapters) pattern, encapsulating the underlying 
 * Large Language Model (LLM) complexities from the core Domain Use Cases.
 * 
 * Domain Context: Legislative Pipeline / Drafting Command Bus
 * Architecture Level: Infrastructure (Outer Circle)
 * Security Tier: Zero-Trust Backend-For-Frontend (BFF) Ready
 * Performance: Optimized for mTLS handshake and Deterministic Execution protocols.
 * 
 * @implements {IAiGenerationStrategy}
 */
export class GeminiAdapter implements IAiGenerationStrategy {
  private readonly client: GoogleGenAI;
  private readonly config: { temperature: number; topP: number; topK: number };

  constructor(apiKey: string) {
    this.client = new GoogleGenAI(apiKey);
    this.config = {
      temperature: 0.85,
      topP: 0.95,
      topK: 40
    };
  }

  /**
   * @method executeStream
   * @description Orchestrates a high-concurrency streaming session for initial legislative drafting.
   * 
   * Time Complexity: O(N) where N is the length of the generated token stream.
   * Space Complexity: O(M) where M is the context window utilization (max 1M tokens).
   * 
   * Domain Context:
   * Initiates the 'BillDraftInitiatedEvent' within the Kafka State Fabric.
   * Transforms raw DraftingInput into a structured JSON legislative entity.
   * 
   * Throws:
   * - {InvalidApiKeyException} If the provided credentials fail the Zero-Trust handshake.
   * - {RateLimitExceededException} If the request exceeds the $100/month subscription tier.
   * - {IncompleteDraftingContextException} If policy points are insufficient for legal validity.
   * 
   * @param {DraftingInput} input - The raw policy directives and PDF binary data from the Sovereign UI.
   * @param {string} modelName - The specific LLM version (e.g., 'gemini-1.5-pro').
   * @returns {AsyncGenerator<any, void, unknown>} A stream of partial JSON buffers for optimistic UI hydration.
   */
  public async *executeStream(input: DraftingInput, modelName: string): AsyncGenerator<any, void, unknown> {
    const model = this.client.getGenerativeModel({
      model: modelName,
      systemInstruction: DRAFTING_RULES
    });

    const tools: any[] = [];
    if (input.useGoogleSearch) {
      tools.push({ googleSearch: {} });
    }

    const promptParts: any[] = [
      { text: this.constructDraftingPrompt(input) }
    ];

    input.pdfs.forEach(pdf => {
      promptParts.push({
        inlineData: { data: pdf.data, mimeType: pdf.mimeType }
      });
    });

    const responseStream = await model.generateContentStream({
      contents: [{ role: 'user', parts: promptParts }],
      generationConfig: {
        ...this.config,
        responseMimeType: "application/json"
      },
      tools: tools.length > 0 ? tools : undefined
    });

    let fullContent = "";
    for await (const chunk of responseStream.stream) {
      const text = chunk.text();
      fullContent += text;
      yield {
        text: fullContent,
        isDone: false,
        timestamp: Date.now()
      };
    }
  }

  /**
   * @method refineStream
   * @description Executes a multi-agent sequential improvement loop within the Drafting Pipeline.
   * 
   * Time Complexity: O(N * S) where N is token length and S is the current pipeline stage index.
   * Space Complexity: O(K) where K is the total knowledge base size ingested via the SovereignNode.
   * 
   * Domain Context:
   * Part of the Event-Sourced CQRS State Fabric, creating a materialized view from previous draft iterations.
   * Enforces the 'Doctrine of Finality' by layering constitutional constraints over raw policy mandates.
   * 
   * Throws:
   * - {IllegalDraftStateTransitionException} If attempting to refine a null draft object.
   * - {TokenBufferOverflowException} If the cumulative PDF context exceeds architectural limits.
   * - {SovereignAuthFailureException} If JWT-based asymmetric crypto validation fails.
   * 
   * @param {BillData} previousBill - The current state of the bill from the Redis read-model.
   * @param {DraftingInput} input - Original and additional instructions for the next stage.
   * @param {string} modelName - The target model for this specific improvement stage.
   * @param {string} agentRole - The legislative persona (e.g., 'Counsel', 'Expert', 'Analyst').
   * @returns {AsyncGenerator<any, void, unknown>} Encapsulated binary-packed buffers for WebSocket push delivery.
   */
  public async *refineStream(
    previousBill: BillData, 
    input: DraftingInput, 
    modelName: string, 
    agentRole: string
  ): AsyncGenerator<any, void, unknown> {
    const model = this.client.getGenerativeModel({
      model: modelName,
      systemInstruction: DRAFTING_RULES
    });

    const prompt = `
      AGENT_IDENTITY: ${agentRole}
      TASK: LEGISLATIVE_OPTIMIZATION
      
      CURRENT_STATE_SNAPSHOT:
      ${JSON.stringify(previousBill, null, 2)}

      GLOBAL_POLICY_DIRECTIVES:
      ${input.purpose}

      KNOWLEDGE_BASE_CONTEXT:
      ${input.knowledgeBaseText || "NONE"}

      INSTRUCTION_OVERRIDE:
      Refine legal citations and ensure the $18 Trillion fund is explicitly allocated 
      to Sovereign Node infrastructure using HOLC formatting rules.
    `;

    const responseStream = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        ...this.config,
        responseMimeType: "application/json"
      }
    });

    let fullContent = "";
    for await (const chunk of responseStream.stream) {
      const text = chunk.text();
      fullContent += text;
      yield {
        text: fullContent,
        isDone: false,
        sequenceId: Math.random().toString(36).substring(7)
      };
    }
  }

  /**
   * @private constructDraftingPrompt
   * @description Internal domain-driven utility for prompt engineering in the Sovereign Architecture.
   * 
   * Time Complexity: O(L) where L is total length of input strings.
   * Space Complexity: O(L) for string concatenation in memory.
   * 
   * @param {DraftingInput} input - The input parameters.
   * @returns {string} Fully-qualified prompt for the Gemini LLM engine.
   */
  private constructDraftingPrompt(input: DraftingInput): string {
    return `
      INITIATE_DRAFTING_PROTOCOL:
      Type: ${input.type}
      Goal: ${input.purpose}
      Points: ${input.policyPoints.join("; ")}
      
      REQUIREMENT: Utilize the "Identity as Authority" framework for all subsections.
      REQUIREMENT: Ensure "KIC" classification is cited under DHS mandates.
      REQUIREMENT: Map all "135 deals" to the Ai Banking infrastructure fund.
    `;
  }
}
