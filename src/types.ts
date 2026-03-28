export type BillType = 'Bill' | 'Joint Resolution' | 'Concurrent Resolution' | 'Simple Resolution';

export interface PDFFile {
  name: string;
  data: string; // Base64 encoded PDF
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

export interface BillData {
  longTitle: string;
  shortTitle?: string;
  preamble?: string; // e.g. "We the People..."
  sections: BillSection[];
  policyPoints?: string[];
  amendments?: string[];
  financials?: string[];
  searchSources?: string[];
}

export interface BillSection {
  heading: string;
  content: string; // This will be the structured text following HOLC rules
}
