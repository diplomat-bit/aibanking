import React, { useState, useEffect } from 'react';
import { Gavel, Info, BookOpen, Scale, LayoutGrid, Users, Download, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import BillForm from './components/BillForm';
import BillPreview from './components/BillPreview';
import { generateBillStream, improveBillStream, parseBillData } from './services/geminiService';
import { DraftingInput, BillData } from './types';
import { motion, AnimatePresence } from 'motion/react';

const PIPELINE_STAGES = [
  { id: 'counsel', name: 'Legislative Counsel', model: 'gemini-3.1-pro-preview', color: 'blue', description: 'Drafting initial statutory framework...' },
  { id: 'analyst', name: 'Policy Analyst', model: 'gemini-3-flash-preview', color: 'emerald', description: 'Analyzing policy depth and adding specific mandates...' },
  { id: 'expert', name: 'Constitutional Expert', model: 'gemini-3.1-pro-preview', color: 'purple', description: 'Ensuring constitutional alignment and final legal polish...' }
];

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<BillData | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<DraftingInput | null>(null);
  const [nextStageInstructions, setNextStageInstructions] = useState('');

  const startPipeline = async (input: DraftingInput) => {
    setIsLoading(true);
    setError(null);
    setCurrentDraft(null);
    setStreamingContent('');
    setLastInput(input);
    setCurrentStageIndex(0);
    setNextStageInstructions('');

    try {
      const stage = PIPELINE_STAGES[0];
      const stream = generateBillStream(input, stage.model);
      
      for await (const chunk of stream) {
        setStreamingContent(chunk.text);
        const parsed = parseBillData(chunk.text);
        if (parsed) setCurrentDraft(parsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Initial drafting failed');
    } finally {
      setIsLoading(false);
    }
  };

  const improveDraft = async () => {
    if (!currentDraft || !lastInput || currentStageIndex >= PIPELINE_STAGES.length - 1) return;

    const nextStageIndex = currentStageIndex + 1;
    setCurrentStageIndex(nextStageIndex);
    setIsLoading(true);
    setStreamingContent('');

    // Merge nextStageInstructions into the prompt if provided
    const inputWithFeedback = { ...lastInput };
    if (nextStageInstructions.trim()) {
      inputWithFeedback.purpose = `${inputWithFeedback.purpose}\n\nADDITIONAL INSTRUCTIONS FOR THIS STAGE: ${nextStageInstructions}`;
    }

    try {
      const stage = PIPELINE_STAGES[nextStageIndex];
      const stream = improveBillStream(currentDraft, inputWithFeedback, stage.model, stage.name);
      
      for await (const chunk of stream) {
        setStreamingContent(chunk.text);
        const parsed = parseBillData(chunk.text);
        if (parsed) setCurrentDraft(parsed);
      }
      setNextStageInstructions(''); // Clear instructions after use
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Improvement stage failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDraft = () => {
    setCurrentDraft(null);
    setCurrentStageIndex(-1);
    setStreamingContent('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm no-print">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
            <Gavel size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Legislative Pipeline Drafter</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Sequential AI Improvement System</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {currentDraft && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
              <Sparkles size={14} />
              <span>Stage {currentStageIndex + 1}: {PIPELINE_STAGES[currentStageIndex].name}</span>
            </div>
          )}
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1">
            <BookOpen size={16} />
            <span>HOLC Manual</span>
          </a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col lg:row overflow-hidden">
        {/* Left Sidebar: Form */}
        <div className="w-full lg:w-[400px] border-r border-gray-200 bg-white p-6 overflow-y-auto shadow-xl z-10 no-print">
          <AnimatePresence mode="wait">
            {currentStageIndex === -1 ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Draft Parameters</h2>
                  <p className="text-xs text-gray-500">Initiate the sequential drafting pipeline. Your draft will be improved across multiple AI stages.</p>
                </div>
                <BillForm onGenerate={startPipeline} isLoading={isLoading} />
              </motion.div>
            ) : (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Pipeline Progress</h2>
                  <button 
                    onClick={resetDraft}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 flex items-center space-x-1"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {PIPELINE_STAGES.map((stage, idx) => (
                    <div 
                      key={stage.id}
                      className={`p-4 rounded-xl border transition-all ${
                        idx === currentStageIndex 
                          ? 'bg-blue-50 border-blue-200 shadow-md scale-[1.02]' 
                          : idx < currentStageIndex 
                            ? 'bg-gray-50 border-gray-100 opacity-60' 
                            : 'bg-white border-gray-100 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          idx === currentStageIndex ? 'text-blue-600' : 'text-gray-500'
                        }`}>{stage.name}</span>
                        {idx < currentStageIndex && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        {idx === currentStageIndex && isLoading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                      </div>
                      <p className="text-xs font-medium text-gray-700">{stage.description}</p>
                    </div>
                  ))}
                </div>

                {currentStageIndex < PIPELINE_STAGES.length - 1 && !isLoading && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Instructions for Next Stage (Optional)
                      </label>
                      <textarea 
                        value={nextStageInstructions}
                        onChange={(e) => setNextStageInstructions(e.target.value)}
                        placeholder="e.g., 'Add a section on environmental impact' or 'Use the knowledge base to refine Section 3'..."
                        className="w-full p-3 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                      />
                    </div>
                    <button
                      onClick={improveDraft}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 group"
                    >
                      <span>Continue to Improve</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {currentStageIndex === PIPELINE_STAGES.length - 1 && !isLoading && (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs font-bold flex items-center space-x-2">
                    <Sparkles size={16} />
                    <span>Pipeline Complete. Final draft ready for review.</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Right Content: Single Editable Preview */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100 print:bg-white print:p-0">
          {!currentDraft && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <LayoutGrid size={48} strokeWidth={1} />
              <p className="text-sm font-medium">Initiate drafting to see the sequential pipeline in action</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 min-h-full flex flex-col print:shadow-none print:border-none">
              <div className="flex-1 p-12 bg-[#fcfcfc] print:p-0">
                <BillPreview 
                  bill={currentDraft} 
                  isStreaming={isLoading} 
                  onUpdate={setCurrentDraft}
                />
                
                {isLoading && !currentDraft && (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                    <div className="w-full max-w-[300px] h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 font-mono animate-pulse">
                      {PIPELINE_STAGES[currentStageIndex].description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

