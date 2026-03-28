import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DRAFTING_RULES } from "../constants";
import { DraftingInput, BillData } from "../types";

export async function* generateBillStream(input: DraftingInput, modelName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const tools: any[] = [];
  if (input.useGoogleSearch) {
    tools.push({ googleSearch: {} });
  }

  const promptParts: any[] = [
    {
      text: `
        Draft a ${input.type} based on the following instructions:
        Purpose: ${input.purpose}
        Key Policy Points:
        ${input.policyPoints.map(p => `- ${p}`).join('\n')}
        ${input.amendments && input.amendments.length > 0 ? `Proposed Amendments:\n${input.amendments.map(a => `- ${a}`).join('\n')}` : ""}
        ${input.financials && input.financials.length > 0 ? `Financial Provisions:\n${input.financials.map(f => `- ${f}`).join('\n')}` : ""}
        Is Amendatory: ${input.isAmendatory}
        ${input.targetStatutes.length > 0 ? `Target Statutes/Citations Provided:\n${input.targetStatutes.map(s => `- ${s}`).join('\n')}` : ""}

        ${input.pdfs.length > 0 ? "I have attached multiple PDF documents (including potentially SEC Form 8-K filings or news reports). Please read them thoroughly. Identify any legal issues, existing laws, or specific statutes mentioned or implied in these documents." : ""}
        ${input.knowledgeBaseText ? `I have provided the following text as a knowledge base. CRITICAL: You MUST use the ENTIRE knowledge base provided. It contains critical details (e.g. 135 deals, specific classifications like 'KIC'). Please separate the key legal concepts, facts, and statutory references from this text and use them to inform the drafting: \n\n${input.knowledgeBaseText}` : ""}
        ${input.useGoogleSearch ? "CRITICAL: Use Google Search to find the official statutory citations (e.g., U.S. Code sections) for any laws or regulations mentioned in the attached PDFs that do not have full citations. Ensure the drafted bill uses these correct, researched citations." : ""}

        Format the output as a JSON object with the following structure:
        {
          "longTitle": "The official long title starting with 'To...'",
          "shortTitle": "The short title if applicable (e.g. THE SAVE AMERICA ACT)",
          "preamble": "A powerful preamble starting with 'We the People of the United States...'",
          "sections": [
            {
              "heading": "SECTION HEADING",
              "content": "The full text of the section including subsections, paragraphs, etc., following HOLC numbering and indentation."
            }
          ],
          "policyPoints": ["List of key policy objectives derived from input"],
          "amendments": ["List of specific amendments derived from input"],
          "financials": ["List of financial provisions derived from input"],
          "searchSources": ["List of URLs used if Google Search was used"]
        }
      `
    }
  ];

  input.pdfs.forEach(pdf => {
    promptParts.push({
      inlineData: {
        data: pdf.data,
        mimeType: pdf.mimeType
      }
    });
  });

  const responseStream = await ai.models.generateContentStream({
    model: modelName,
    contents: [{ role: 'user', parts: promptParts }],
    config: {
      systemInstruction: DRAFTING_RULES,
      tools: tools.length > 0 ? tools : undefined,
      responseMimeType: "application/json"
    }
  });

  let fullContent = "";
  for await (const chunk of responseStream) {
    const text = chunk.text;
    fullContent += text;
    yield {
      text: fullContent,
      isDone: false
    };
  }

  yield {
    text: fullContent,
    isDone: true
  };
}

export async function* improveBillStream(previousBill: BillData, input: DraftingInput, modelName: string, agentRole: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const tools: any[] = [];
  if (input.useGoogleSearch) {
    tools.push({ googleSearch: {} });
  }

  const promptParts: any[] = [
    {
      text: `
        You are the ${agentRole}. Your task is to IMPROVE and EXPAND the following legislative draft.
        
        CURRENT DRAFT:
        ${JSON.stringify(previousBill, null, 2)}

        ORIGINAL INSTRUCTIONS:
        Purpose: ${input.purpose}
        Key Policy Points:
        ${input.policyPoints.map(p => `- ${p}`).join('\n')}
        ${input.amendments && input.amendments.length > 0 ? `Proposed Amendments:\n${input.amendments.map(a => `- ${a}`).join('\n')}` : ""}
        ${input.financials && input.financials.length > 0 ? `Financial Provisions:\n${input.financials.map(f => `- ${f}`).join('\n')}` : ""}

        ${input.knowledgeBaseText ? `KNOWLEDGE BASE (CRITICAL: USE THE ENTIRE KB): \n\n${input.knowledgeBaseText}` : ""}
        
        YOUR GOAL:
        1. Review the current draft for legal accuracy, constitutional alignment, and policy depth.
        2. Use the KNOWLEDGE BASE to add specific details that might be missing (e.g. 135 deals, KIC classification).
        3. Use Google Search to find the latest news, SEC filings, or statutory citations related to this policy to make it more current and robust.
        4. Refine the language to be more formal and authoritative.
        5. Ensure the preamble is powerful and "We the People" is prominent.

        Format the output as a JSON object with the same structure as the current draft.
      `
    }
  ];

  input.pdfs.forEach(pdf => {
    promptParts.push({
      inlineData: {
        data: pdf.data,
        mimeType: pdf.mimeType
      }
    });
  });

  const responseStream = await ai.models.generateContentStream({
    model: modelName,
    contents: [{ role: 'user', parts: promptParts }],
    config: {
      systemInstruction: DRAFTING_RULES,
      tools: tools.length > 0 ? tools : undefined,
      responseMimeType: "application/json"
    }
  });

  let fullContent = "";
  for await (const chunk of responseStream) {
    const text = chunk.text;
    fullContent += text;
    yield {
      text: fullContent,
      isDone: false
    };
  }

  yield {
    text: fullContent,
    isDone: true
  };
}

export function parseBillData(text: string): BillData | null {
  try {
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (e) {
    return null;
  }
}
