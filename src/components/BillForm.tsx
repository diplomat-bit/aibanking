import React, { useState, useRef } from 'react';
import { Plus, Trash2, FileText, Send, Upload, Globe, X, Info, Database } from 'lucide-react';
import { DraftingInput, BillType, PDFFile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface BillFormProps {
  onGenerate: (input: DraftingInput) => void;
  isLoading: boolean;
}

export default function BillForm({ onGenerate, isLoading }: BillFormProps) {
  const [type, setType] = useState<BillType>('Bill');
  const [purpose, setPurpose] = useState('');
  const [policyPoints, setPolicyPoints] = useState('');
  const [amendments, setAmendments] = useState('');
  const [financials, setFinancials] = useState('');
  const [isAmendatory, setIsAmendatory] = useState(false);
  const [targetStatutes, setTargetStatutes] = useState<string[]>(['']);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [knowledgeBaseText, setKnowledgeBaseText] = useState('');
  const [showKBModal, setShowKBModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPoint = () => setPolicyPoints([...policyPoints, '']);
  const removePoint = (index: number) => {
    const newPoints = policyPoints.filter((_, i) => i !== index);
    setPolicyPoints(newPoints.length ? newPoints : ['']);
  };

  const updatePoint = (index: number, value: string) => {
    const newPoints = [...policyPoints];
    newPoints[index] = value;
    setPolicyPoints(newPoints);
  };

  const addStatute = () => setTargetStatutes([...targetStatutes, '']);
  const removeStatute = (index: number) => {
    const newStatutes = targetStatutes.filter((_, i) => i !== index);
    setTargetStatutes(newStatutes.length ? newStatutes : ['']);
  };

  const updateStatute = (index: number, value: string) => {
    const newStatutes = [...targetStatutes];
    newStatutes[index] = value;
    setTargetStatutes(newStatutes);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file.type === 'application/pdf') {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            setPdfFiles(prev => [...prev, {
              name: file.name,
              data: base64,
              mimeType: file.type
            }]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePdf = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      type,
      purpose,
      policyPoints: policyPoints.split('\n').filter(p => p.trim() !== ''),
      amendments: amendments.split('\n').filter(a => a.trim() !== ''),
      financials: financials.split('\n').filter(f => f.trim() !== ''),
      isAmendatory,
      targetStatutes: isAmendatory ? targetStatutes.filter(s => s.trim() !== '') : [],
      pdfs: pdfFiles,
      knowledgeBaseText: knowledgeBaseText.trim() || undefined,
      useGoogleSearch
    });
  };

  const handleClear = () => {
    setPurpose('');
    setPolicyPoints(['']);
    setTargetStatutes(['']);
    setIsAmendatory(false);
    setUseGoogleSearch(false);
    setPdfFiles([]);
    setKnowledgeBaseText('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Drafting Parameters</h3>
        <button 
          type="button" 
          onClick={handleClear}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      {/* Knowledge Base & Search Grounding Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="col-header block">Knowledge Base</label>
          <button 
            type="button"
            onClick={() => setShowKBModal(true)}
            className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
              knowledgeBaseText.trim() 
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Database size={18} />
            <span className="text-sm font-medium">
              {knowledgeBaseText.trim() ? 'Update Knowledge Base' : 'Open Knowledge Base'}
            </span>
            {knowledgeBaseText.trim() && (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" />
            )}
          </button>
        </div>

        <div className="space-y-2">
          <label className="col-header block">Search Grounding</label>
          <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <input 
              type="checkbox" 
              checked={useGoogleSearch}
              onChange={(e) => setUseGoogleSearch(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Globe size={14} className="text-blue-500" />
              <span>Enable Google Search Grounding</span>
            </span>
          </label>
        </div>
      </div>

      {/* Knowledge Base Modal */}
      <AnimatePresence>
        {showKBModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-bottom border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Database className="text-blue-600" size={20} />
                  <h3 className="font-bold text-gray-900">Legislative Knowledge Base</h3>
                </div>
                <button 
                  onClick={() => setShowKBModal(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Paste raw text, news articles, or legal notes here. The AI will analyze and separate the key legal concepts, facts, and statutory references to use as a knowledge base for your draft.
                  </p>
                </div>
                
                <textarea 
                  value={knowledgeBaseText}
                  onChange={(e) => setKnowledgeBaseText(e.target.value)}
                  placeholder="Paste your knowledge base content here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm resize-none"
                />
              </div>

              <div className="p-4 bg-gray-50 border-top border-gray-100 flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setKnowledgeBaseText('');
                    setShowKBModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear & Close
                </button>
                <button 
                  onClick={() => setShowKBModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Save Knowledge Base
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="col-header block">Legislation Type</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as BillType)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Bill">Bill</option>
            <option value="Joint Resolution">Joint Resolution</option>
            <option value="Concurrent Resolution">Concurrent Resolution</option>
            <option value="Simple Resolution">Simple Resolution</option>
          </select>
        </div>

        <div className="flex flex-col space-y-4 pt-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isAmendatory}
              onChange={(e) => setIsAmendatory(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Amendatory Legislation</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={useGoogleSearch}
              onChange={(e) => setUseGoogleSearch(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Globe size={14} className="text-blue-500" />
              <span>Enable Google Search Grounding</span>
            </span>
          </label>
        </div>
      </div>

      {isAmendatory && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <label className="col-header block">Target Statutes / Citations</label>
          <AnimatePresence mode="popLayout">
            {targetStatutes.map((statute, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex space-x-2"
              >
                <input 
                  type="text"
                  value={statute}
                  onChange={(e) => updateStatute(index, e.target.value)}
                  placeholder="e.g., 47 U.S.C. 151 et seq."
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <button 
                  type="button"
                  onClick={() => removeStatute(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <button 
            type="button"
            onClick={addStatute}
            className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Citation</span>
          </button>
        </motion.div>
      )}

      {/* Source Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="col-header block">Source Documents (PDFs, SEC Form 8-K, News Reports)</label>
          <div className="group relative">
            <Info size={14} className="text-gray-400 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
              Upload SEC Form 8-K filings, news reports, or other source materials. The AI will research any mentioned laws to find correct citations.
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group"
        >
          <Upload className="text-gray-400 group-hover:text-blue-500 mb-2" size={24} />
          <p className="text-sm text-gray-500 group-hover:text-blue-600">Click to upload PDFs or SEC 8-K filings</p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Multiple files supported</p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            multiple
            className="hidden"
          />
        </div>

        <AnimatePresence mode="popLayout">
          {pdfFiles.length > 0 && (
            <div className="space-y-2">
              {pdfFiles.map((file, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <FileText size={16} className="text-blue-600 flex-shrink-0" />
                    <span className="text-xs font-medium truncate">{file.name}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removePdf(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <label className="col-header block">Main Purpose / Long Title Goal</label>
        <textarea 
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="What is the primary goal of this legislation?"
          className="w-full p-2 border border-gray-300 rounded-md h-24 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="col-header block">Key Policy Points (Paste your points here)</label>
          <button type="button" onClick={() => setPolicyPoints('')} className="text-[10px] text-gray-400 hover:text-red-500">Clear</button>
        </div>
        <textarea 
          value={policyPoints}
          onChange={(e) => setPolicyPoints(e.target.value)}
          placeholder="Paste your key policy points here, one per line..."
          className="w-full p-2 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-500 outline-none font-sans text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="col-header block">Proposed Amendments</label>
            <button type="button" onClick={() => setAmendments('')} className="text-[10px] text-gray-400 hover:text-red-500">Clear</button>
          </div>
          <textarea 
            value={amendments}
            onChange={(e) => setAmendments(e.target.value)}
            placeholder="Paste specific amendments to existing law..."
            className="w-full p-2 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-500 outline-none font-sans text-sm"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="col-header block">Financial Provisions</label>
            <button type="button" onClick={() => setFinancials('')} className="text-[10px] text-gray-400 hover:text-red-500">Clear</button>
          </div>
          <textarea 
            value={financials}
            onChange={(e) => setFinancials(e.target.value)}
            placeholder="Paste specific financial or appropriation details..."
            className="w-full p-2 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-500 outline-none font-sans text-sm"
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-blue-400"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Send size={20} />
            <span>Generate Draft</span>
          </>
        )}
      </button>
    </form>
  );
}
