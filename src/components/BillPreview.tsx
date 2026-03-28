import React, { useRef } from 'react';
import { BillData } from '../types';
import { motion } from 'motion/react';
import { Copy, Download, Printer, Save } from 'lucide-react';

interface BillPreviewProps {
  bill: BillData | null | undefined;
  isStreaming?: boolean;
  onUpdate?: (updatedBill: BillData) => void;
}

export default function BillPreview({ bill, isStreaming, onUpdate }: BillPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!bill) {
    return (
      <div className="h-full flex items-center justify-center text-gray-300 italic text-sm">
        {isStreaming ? 'Drafting in progress...' : 'No draft generated yet'}
      </div>
    );
  }

  const getFullText = () => {
    let text = `[OFFICIAL LEGISLATIVE DRAFT]\n\n`;
    text += `${bill.longTitle}\n\n`;
    if (bill.shortTitle) text += `SHORT TITLE: ${bill.shortTitle}\n\n`;
    if (bill.preamble) text += `PREAMBLE: ${bill.preamble}\n\n`;
    
    text += `Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,\n\n`;
    
    bill.sections.forEach(s => {
      text += `${s.heading}\n${s.content}\n\n`;
    });

    if (bill.policyPoints?.length) {
      text += `KEY POLICY OBJECTIVES:\n${bill.policyPoints.map(p => `- ${p}`).join('\n')}\n\n`;
    }

    if (bill.amendments?.length) {
      text += `PROPOSED AMENDMENTS:\n${bill.amendments.map(a => `- ${a}`).join('\n')}\n\n`;
    }

    if (bill.financials?.length) {
      text += `FINANCIAL PROVISIONS:\n${bill.financials.map(f => `- ${f}`).join('\n')}\n\n`;
    }

    if (bill.searchSources?.length) {
      text += `RESEARCH SOURCES:\n${bill.searchSources.join('\n')}\n\n`;
    }
    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFullText());
  };

  const downloadAsText = () => {
    const text = getFullText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bill.shortTitle?.replace(/\s+/g, '_') || 'draft-legislation'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFieldUpdate = (field: keyof BillData, value: any) => {
    if (onUpdate) {
      onUpdate({ ...bill, [field]: value });
    }
  };

  const handleSectionUpdate = (idx: number, field: 'heading' | 'content', value: string) => {
    if (onUpdate) {
      const newSections = [...bill.sections];
      newSections[idx] = { ...newSections[idx], [field]: value };
      onUpdate({ ...bill, sections: newSections });
    }
  };

  // Helper to split text into lines and add line numbers
  const renderTextWithLineNumbers = (text: string, startLine: number, sectionIdx: number) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => (
      <div key={idx} className="flex group">
        <div className="w-8 text-[10px] text-gray-300 font-mono text-right pr-3 select-none pt-1">
          {startLine + idx}
        </div>
        <div 
          contentEditable={!isStreaming}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newLines = [...lines];
            newLines[idx] = e.currentTarget.textContent || "";
            handleSectionUpdate(sectionIdx, 'content', newLines.join('\n'));
          }}
          className="flex-1 pl-2 leading-relaxed text-justify text-[13px] outline-none focus:bg-blue-50/50 transition-colors"
        >
          {line}
        </div>
      </div>
    ));
  };

  let currentLine = 1;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-serif text-[#1a1a1a] max-w-none relative group print:m-0 print:p-0"
      ref={printRef}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;700&display=swap');

.bill-paper {
  font-family: 'Libre Baskerville', serif;
  line-height: 2;
  color: #1a1a1a;
  padding: 2rem 4rem;
  background: white;
  position: relative;
}

.bill-header {
  font-family: 'Playfair Display', serif;
  text-align: center;
  margin-bottom: 3rem;
  border-bottom: 2px solid #000;
  padding-bottom: 1rem;
}

.line-number {
  position: absolute;
  left: 1rem;
  width: 2rem;
  text-align: right;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #999;
  user-select: none;
}

.editable-field:hover {
  background-color: rgba(59, 130, 246, 0.05);
  outline: 1px dashed #3b82f6;
}

.editable-field:focus {
  background-color: white;
  outline: 2px solid #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

@media print {
  .no-print { display: none !important; }
  .bill-paper { padding: 0; }
  body { background: white; }
}
</style>
`}} />

      <div className="absolute -top-2 -right-2 flex space-x-1 z-10 no-print">
        <button 
          onClick={handlePrint} 
          title="Print to PDF"
          className="p-1.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Printer size={14} />
        </button>
        <button 
          onClick={copyToClipboard} 
          title="Copy to Clipboard"
          className="p-1.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Copy size={14} />
        </button>
        <button 
          onClick={downloadAsText} 
          title="Download as Text"
          className="p-1.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Download size={14} />
        </button>
      </div>

      <div className="print-area bill-paper">
        {/* Bill Header */}
        <div className="bill-header">
          <div className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-sans font-bold no-print mb-4">
            {isStreaming ? 'Drafting...' : 'Official Legislative Draft (Editable)'}
          </div>
          <h1 
            contentEditable={!isStreaming}
            suppressContentEditableWarning
            onBlur={(e) => handleFieldUpdate('shortTitle', e.currentTarget.textContent)}
            className="text-2xl font-bold uppercase tracking-tight outline-none editable-field p-1"
          >
            {bill.shortTitle || 'Legislative Proposal'}
          </h1>
        </div>

        {/* Long Title */}
        <div 
          contentEditable={!isStreaming}
          suppressContentEditableWarning
          onBlur={(e) => handleFieldUpdate('longTitle', e.currentTarget.textContent)}
          className="mb-10 italic text-base leading-relaxed text-center px-4 outline-none editable-field p-2"
        >
          {bill.longTitle}
        </div>

        {/* Preamble */}
        {bill.preamble && (
          <div 
            contentEditable={!isStreaming}
            suppressContentEditableWarning
            onBlur={(e) => handleFieldUpdate('preamble', e.currentTarget.textContent)}
            className="mb-8 text-center italic text-sm px-8 leading-relaxed text-gray-700 font-medium outline-none editable-field p-2"
          >
            {bill.preamble}
          </div>
        )}

        {/* Enacting Clause */}
        <div className="mb-8 font-bold uppercase tracking-widest text-center text-[11px] border-y border-gray-900 py-3">
          Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {bill.sections.map((section, sIdx) => {
            const lines = section.content.split('\n');
            const sectionContent = lines.map((line, idx) => {
              const lineNum = currentLine++;
              return (
                <div key={idx} className="relative pl-8 min-h-[2rem]">
                  <span className="line-number no-print">{lineNum}</span>
                  <div 
                    contentEditable={!isStreaming}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newLines = [...lines];
                      newLines[idx] = e.currentTarget.textContent || "";
                      handleSectionUpdate(sIdx, 'content', newLines.join('\n'));
                    }}
                    className="outline-none editable-field px-1"
                  >
                    {line || '\u00A0'}
                  </div>
                </div>
              );
            });

            return (
              <div key={sIdx} className="space-y-4">
                <h2 
                  contentEditable={!isStreaming}
                  suppressContentEditableWarning
                  onBlur={(e) => handleSectionUpdate(sIdx, 'heading', e.currentTarget.textContent || "")}
                  className="font-bold uppercase tracking-wide text-center text-xs py-1 outline-none editable-field"
                >
                  {section.heading}
                </h2>
                <div className="space-y-0">
                  {sectionContent}
                </div>
              </div>
            );
          })}
        </div>

        {/* Policy Points, Amendments, Financials */}
        <div className="mt-12 space-y-8 border-t border-gray-100 pt-8 no-print">
          {bill.policyPoints && bill.policyPoints.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-gray-400 text-center">Key Policy Objectives</h3>
              <ul className="list-disc list-inside space-y-1.5 text-[13px] px-4">
                {bill.policyPoints.map((point, idx) => (
                  <li 
                    key={idx} 
                    contentEditable={!isStreaming}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newPoints = [...bill.policyPoints!];
                      newPoints[idx] = e.currentTarget.textContent || "";
                      handleFieldUpdate('policyPoints', newPoints);
                    }}
                    className="leading-relaxed outline-none focus:bg-blue-50/50"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bill.amendments && bill.amendments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-gray-400 text-center">Proposed Amendments</h3>
              <div className="space-y-4">
                {bill.amendments.map((amendment, idx) => (
                  <div 
                    key={idx} 
                    contentEditable={!isStreaming}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newAmendments = [...bill.amendments!];
                      newAmendments[idx] = e.currentTarget.textContent || "";
                      handleFieldUpdate('amendments', newAmendments);
                    }}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-[12px] leading-relaxed italic outline-none focus:bg-blue-50/50"
                  >
                    {amendment}
                  </div>
                ))}
              </div>
            </div>
          )}

          {bill.financials && bill.financials.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-gray-400 text-center">Financial Provisions & Appropriations</h3>
              <div className="grid grid-cols-1 gap-3">
                {bill.financials.map((financial, idx) => (
                  <div 
                    key={idx} 
                    contentEditable={!isStreaming}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newFinancials = [...bill.financials!];
                      newFinancials[idx] = e.currentTarget.textContent || "";
                      handleFieldUpdate('financials', newFinancials);
                    }}
                    className="p-3 border border-blue-100 bg-blue-50/30 rounded-lg text-[12px] font-mono outline-none focus:bg-blue-50/50"
                  >
                    {financial}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sources */}
        {bill.searchSources && bill.searchSources.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-100 font-sans no-print">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">Research Sources</h4>
            <ul className="space-y-1">
              {bill.searchSources.map((source, idx) => (
                <li key={idx} className="text-[9px] text-blue-600 hover:underline truncate">
                  <a href={source} target="_blank" rel="noopener noreferrer">{source}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isStreaming && (
        <div className="mt-6 flex items-center justify-center space-x-1.5 text-blue-500 no-print">
          <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
        </div>
      )}
    </motion.div>
  );
}
