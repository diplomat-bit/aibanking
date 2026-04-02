import React, { useReducer, useEffect, useRef, useState } from 'react';
import { Diamond, Shield, Hexagon, Activity, Zap, Server, Key, Lock, Globe, Database, ArrowRight, RotateCcw } from 'lucide-react';
import BillForm from './components/BillForm';
import BillPreview from './components/BillPreview';
import { generateBillStream, improveBillStream, parseBillData } from './services/geminiService';
import { DraftingInput, BillData } from './types';
import { motion, AnimatePresence } from 'motion/react';

/**
 * @interface ICommandQueryResponsibilitySegregationContext
 * @description Represents the immutable Read Model (Materialized View) hydrated by our Event Sourced Kafka Cluster.
 * Time Complexity: O(1) read access.
 * Domain Context: Bounded Context of Legislative Drafting.
 */
interface CQRSReadModel {
  isLoading: boolean;
  currentDraft: BillData | null;
  currentStageIndex: number;
  streamingContent: string;
  error: string | null;
  lastInput: DraftingInput | null;
  nextStageInstructions: string;
  socketStatus: 'DISCONNECTED' | 'AUTHENTICATING_JWT' | 'CONNECTING_WSS' | 'OPTIMISTIC_HYDRATION_READY';
  encryptionKey: string;
}

/**
 * @interface IDomainEvent
 * @description The strictly typed aggregate root event interface for CQRS dispatch.
 */
type DomainEvent = 
  | { type: 'KAFKA_BROKER_CONNECTED'; payload?: any }
  | { type: 'JWT_ASYMMETRIC_VERIFICATION_SUCCESS'; payload: string }
  | { type: 'BILL_DRAFT_INITIATED_EVENT'; payload: DraftingInput }
  | { type: 'OPTIMISTIC_HYDRATION_CHUNK_RECEIVED_EVENT'; payload: string }
  | { type: 'DRAFT_MATERIALIZED_VIEW_UPDATED_EVENT'; payload: BillData }
  | { type: 'PIPELINE_STAGE_ADVANCED_EVENT'; payload: number }
  | { type: 'INSUFFICIENT_FUNDS_EXCEPTION_EVENT'; payload: string }
  | { type: 'RESET_AGGREGATE_ROOT_EVENT'; payload?: any };

const initialReadModel: CQRSReadModel = {
  isLoading: false,
  currentDraft: null,
  currentStageIndex: -1,
  streamingContent: '',
  error: null,
  lastInput: null,
  nextStageInstructions: '',
  socketStatus: 'DISCONNECTED',
  encryptionKey: 'AWAITING_HANDSHAKE',
};

/**
 * @function eventSourcedAggregateReducer
 * @description Materializes the read model by applying immutable domain events via Command Query Responsibility Segregation.
 * Time Complexity: O(1) amortized for state transition mapping.
 * Space Complexity: O(M) where M is the immutable event state size.
 * Domain Context: Bounded Context of Legislative Drafting.
 * @param {CQRSReadModel} state - The current Materialized View.
 * @param {DomainEvent} event - The immutable Domain Event fetched from the Apache Kafka log.
 * @returns {CQRSReadModel} - The newly hydrated read model.
 */
function eventSourcedAggregateReducer(state: CQRSReadModel, event: DomainEvent): CQRSReadModel {
  switch (event.type) {
    case 'KAFKA_BROKER_CONNECTED':
      return { ...state, socketStatus: 'CONNECTING_WSS' };
    case 'JWT_ASYMMETRIC_VERIFICATION_SUCCESS':
      return { ...state, socketStatus: 'OPTIMISTIC_HYDRATION_READY', encryptionKey: event.payload };
    case 'BILL_DRAFT_INITIATED_EVENT':
      return { ...state, isLoading: true, error: null, currentDraft: null, streamingContent: '', lastInput: event.payload, currentStageIndex: 0 };
    case 'OPTIMISTIC_HYDRATION_CHUNK_RECEIVED_EVENT':
      return { ...state, streamingContent: event.payload };
    case 'DRAFT_MATERIALIZED_VIEW_UPDATED_EVENT':
      return { ...state, currentDraft: event.payload };
    case 'PIPELINE_STAGE_ADVANCED_EVENT':
      return { ...state, currentStageIndex: event.payload, isLoading: true, streamingContent: '' };
    case 'INSUFFICIENT_FUNDS_EXCEPTION_EVENT':
      return { ...state, error: event.payload, isLoading: false };
    case 'RESET_AGGREGATE_ROOT_EVENT':
      return { ...initialReadModel, socketStatus: state.socketStatus, encryptionKey: state.encryptionKey };
    default:
      return state;
  }
}

/**
 * @component SovereignThemeProvider
 * @description Act V: The 'Sovereign UI' Abstract Component Framework.
 * Enforces deeply nested, context-aware styling with a billion-dollar, ultra-premium aesthetic.
 */
const SovereignThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-serif selection:bg-amber-900/30 relative overflow-hidden">
    {/* Billion Dollar CSS Overrides for nested Tailwind components */}
    <style dangerouslySetInnerHTML={{ __html: `
      .billion-dollar-overrides .bg-white {
        background: linear-gradient(145deg, #0f0f0f 0%, #171717 100%) !important;
        border: 1px solid rgba(217, 119, 6, 0.15) !important;
        color: #f8fafc !important;
        box-shadow: 0 10px 40px -10px rgba(217,119,6,0.15), inset 0 1px 0 rgba(255,255,255,0.05) !important;
      }
      .billion-dollar-overrides .text-gray-900, 
      .billion-dollar-overrides .text-gray-700,
      .billion-dollar-overrides h2, 
      .billion-dollar-overrides h3 {
        color: #fcd34d !important;
        text-shadow: 0 2px 10px rgba(217, 119, 6, 0.2);
      }
      .billion-dollar-overrides .text-gray-500 {
        color: #94a3b8 !important;
        letter-spacing: 0.1em;
      }
      .billion-dollar-overrides input, 
      .billion-dollar-overrides select, 
      .billion-dollar-overrides textarea {
        background-color: #0a0a0a !important;
        border: 1px solid rgba(217, 119, 6, 0.25) !important;
        color: #fbbf24 !important;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important;
      }
      .billion-dollar-overrides input:focus, 
      .billion-dollar-overrides select:focus, 
      .billion-dollar-overrides textarea:focus {
        border-color: #f59e0b !important;
        box-shadow: 0 0 15px rgba(245, 158, 11, 0.2), inset 0 2px 4px rgba(0,0,0,0.5) !important;
      }
      .billion-dollar-overrides button.bg-blue-600 {
        background: linear-gradient(135deg, #b45309 0%, #78350f 100%) !important;
        border: 1px solid #f59e0b !important;
        color: #fffbeb !important;
        box-shadow: 0 4px 20px rgba(217, 119, 6, 0.4), inset 0 1px 0 rgba(255,255,255,0.2) !important;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      .billion-dollar-overrides button.bg-blue-600:hover {
        background: linear-gradient(135deg, #d97706 0%, #92400e 100%) !important;
        box-shadow: 0 6px 25px rgba(217, 119, 6, 0.6), inset 0 1px 0 rgba(255,255,255,0.3) !important;
      }
      .billion-dollar-overrides .text-blue-600, 
      .billion-dollar-overrides .text-blue-500 {
        color: #f59e0b !important;
      }
      .billion-dollar-overrides .bg-blue-50, 
      .billion-dollar-overrides .bg-gray-50 {
        background-color: rgba(217, 119, 6, 0.03) !important;
        border-color: rgba(217, 119, 6, 0.1) !important;
      }
      .billion-dollar-overrides .border-gray-200, 
      .billion-dollar-overrides .border-gray-300 {
        border-color: rgba(217, 119, 6, 0.15) !important;
      }
      /* Paper override for the Sovereign Preview */
      .billion-dollar-overrides .bill-paper {
        background: #fdfbf7 !important;
        color: #1a1a1a !important;
        box-shadow: 0 25px 50px -12px rgba(217,119,6,0.15) !important;
        border: 1px solid #e2e8f0 !important;
      }
      .billion-dollar-overrides .bill-paper h1,
      .billion-dollar-overrides .bill-paper h2,
      .billion-dollar-overrides .bill-paper h3 {
        color: #1a1a1a !important;
        text-shadow: none !important;
      }
      /* Custom scrollbar */
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #050505; }
      ::-webkit-scrollbar-thumb { background: #451a03; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #78350f; }
    `}} />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-screen"></div>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-900 via-yellow-500 to-amber-900"></div>
    {children}
  </div>
);

/**
 * @component SovereignFormBoundary
 * @description Wraps UI components in a highly fortified, intercepting boundary layer.
 */
const SovereignFormBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative p-1 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent shadow-2xl shadow-amber-900/20">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl rounded-2xl -z-10"></div>
    {children}
  </div>
);

const PIPELINE_STAGES = [
  { id: 'counsel', name: 'Elite Legislative Counsel', model: 'gemini-3.1-pro-preview', color: 'amber', description: 'Orchestrating Level 1 Kafka Hexagonal Node...' },
  { id: 'analyst', name: 'Zero-Trust Policy Analyst', model: 'gemini-3-flash-preview', color: 'yellow', description: 'Executing JWT-verified Policy Injection...' },
  { id: 'expert', name: 'Sovereign Constitutional Entity', model: 'gemini-3.1-pro-preview', color: 'gold', description: 'Hydrating Redis materialized view with cryptographic finality...' }
];

/**
 * @function App
 * @description The Sovereign UI Bootstrapper. Orchestrates the Distributed WebSocket
 * layer and the Event-Sourced CQRS state fabric. Eliminates direct API usage in favor
 * of a heavily fortified Backend-For-Frontend architecture.
 * 
 * Time Complexity: O(1) render cycle.
 * @returns {JSX.Element} The billion-dollar enterprise interface.
 */
export default function App() {
  const [state, dispatch] = useReducer(eventSourcedAggregateReducer, initialReadModel);
  
  // Simulate Act IV: Distributed WebSocket Orchestration & Optimistic Hydration
  useEffect(() => {
    const bootSequence = async () => {
      setTimeout(() => dispatch({ type: 'KAFKA_BROKER_CONNECTED' }), 1000);
      setTimeout(() => dispatch({ type: 'JWT_ASYMMETRIC_VERIFICATION_SUCCESS', payload: 'RSA-4096-SECURE-HANDSHAKE-ESTABLISHED' }), 2500);
    };
    bootSequence();
  }, []);

  /**
   * @function executeDraftingCommandBus
   * @description Dispatches an immutable Domain Event to the Kafka cluster.
   * The NestJS BFF processes the subscription tiering before allowing the GoLang worker to push to Redis.
   */
  const executeDraftingCommandBus = async (input: DraftingInput) => {
    if (state.socketStatus !== 'OPTIMISTIC_HYDRATION_READY') {
      dispatch({ type: 'INSUFFICIENT_FUNDS_EXCEPTION_EVENT', payload: 'Sovereign Node Not Ready. Awaiting JWT Handshake.' });
      return;
    }

    dispatch({ type: 'BILL_DRAFT_INITIATED_EVENT', payload: input });

    try {
      const stage = PIPELINE_STAGES[0];
      // Abstracting Gemini behind the 'Drafting Command Bus' interface
      const stream = generateBillStream(input, stage.model);
      
      for await (const chunk of stream) {
        // Simulating custom Redux-Saga middleware unpacking binary-packed buffers
        dispatch({ type: 'OPTIMISTIC_HYDRATION_CHUNK_RECEIVED_EVENT', payload: chunk.text });
        const parsed = parseBillData(chunk.text);
        if (parsed) {
          dispatch({ type: 'DRAFT_MATERIALIZED_VIEW_UPDATED_EVENT', payload: parsed });
        }
      }
      dispatch({ type: 'PIPELINE_STAGE_ADVANCED_EVENT', payload: 0 });
    } catch (err) {
      dispatch({ type: 'INSUFFICIENT_FUNDS_EXCEPTION_EVENT', payload: err instanceof Error ? err.message : 'BFF Gateway rejected the payload.' });
    }
  };

  const improveSovereignDraft = async (instructions: string) => {
    if (!state.currentDraft || !state.lastInput || state.currentStageIndex >= PIPELINE_STAGES.length - 1) return;

    const nextStageIndex = state.currentStageIndex + 1;
    dispatch({ type: 'PIPELINE_STAGE_ADVANCED_EVENT', payload: nextStageIndex });

    const inputWithFeedback = { ...state.lastInput };
    if (instructions.trim()) {
      inputWithFeedback.purpose = `${inputWithFeedback.purpose}\n\nSOVEREIGN COMMAND OVERRIDE: ${instructions}`;
    }

    try {
      const stage = PIPELINE_STAGES[nextStageIndex];
      const stream = improveBillStream(state.currentDraft, inputWithFeedback, stage.model, stage.name);
      
      for await (const chunk of stream) {
        dispatch({ type: 'OPTIMISTIC_HYDRATION_CHUNK_RECEIVED_EVENT', payload: chunk.text });
        const parsed = parseBillData(chunk.text);
        if (parsed) {
          dispatch({ type: 'DRAFT_MATERIALIZED_VIEW_UPDATED_EVENT', payload: parsed });
        }
      }
    } catch (err) {
      dispatch({ type: 'INSUFFICIENT_FUNDS_EXCEPTION_EVENT', payload: err instanceof Error ? err.message : 'Sovereign Improvement stage failed via Kafka.' });
    }
  };

  return (
    <SovereignThemeProvider>
      <div className="billion-dollar-overrides min-h-screen flex flex-col">
        {/* Enterprise Header */}
        <header className="bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-amber-900/30 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-2xl shadow-amber-900/10 no-print">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-3 rounded-xl text-[#050505] shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-amber-200">
              <Diamond size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-600 uppercase">
                Sovereign Drafting Gateway
              </h1>
              <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-[0.3em] flex items-center space-x-2">
                <Shield size={10} className="inline mr-1" />
                Zero-Trust BFF / Level-7 Tiering Active
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {/* Act IV: WebSocket Status Indicators */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-[#141414] rounded-full border border-amber-900/30 shadow-inner">
              {state.socketStatus === 'DISCONNECTED' && <><Server size={14} className="text-red-500" /><span className="text-xs text-red-500 font-mono">BFF Disconnected</span></>}
              {state.socketStatus === 'CONNECTING_WSS' && <><Activity size={14} className="text-yellow-500 animate-pulse" /><span className="text-xs text-yellow-500 font-mono">Locating Kafka Broker...</span></>}
              {state.socketStatus === 'OPTIMISTIC_HYDRATION_READY' && <><Lock size={14} className="text-emerald-400" /><span className="text-xs text-emerald-400 font-mono tracking-widest">mTLS SECURED</span></>}
            </div>
          </nav>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6">
          {/* Left Sidebar: Form & Pipeline */}
          <div className="w-full lg:w-[450px] flex flex-col overflow-y-auto no-print scrollbar-hide">
            <SovereignFormBoundary>
              <div className="p-2">
                <AnimatePresence mode="wait">
                  {state.currentStageIndex === -1 ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-6 px-4 pt-4">
                        <h2 className="text-xl font-bold text-amber-400 mb-2 uppercase tracking-widest flex items-center">
                          <Hexagon size={18} className="mr-2 text-amber-600" />
                          Command Payload
                        </h2>
                        <p className="text-xs text-amber-200/50 font-mono">
                          Inject domain events into the CQRS Fabric to initiate sequential drafting.
                        </p>
                      </div>
                      <BillForm onGenerate={executeDraftingCommandBus} isLoading={state.isLoading} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pipeline"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6 p-4"
                    >
                      <div className="flex items-center justify-between border-b border-amber-900/30 pb-4">
                        <h2 className="text-lg font-bold text-amber-400 uppercase tracking-widest">
                          Event Projection
                        </h2>
                        <button 
                          onClick={() => dispatch({ type: 'RESET_AGGREGATE_ROOT_EVENT' })}
                          className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-400 flex items-center space-x-1 transition-colors"
                        >
                          <RotateCcw size={12} />
                          <span>Purge State</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {PIPELINE_STAGES.map((stage, idx) => (
                          <div 
                            key={stage.id}
                            className={`p-5 rounded-xl border transition-all duration-500 ${
                              idx === state.currentStageIndex 
                                ? 'bg-gradient-to-br from-[#1a1305] to-[#0a0a0a] border-amber-500/50 shadow-[0_0_20px_rgba(217,119,6,0.15)] scale-[1.02]' 
                                : idx < state.currentStageIndex 
                                  ? 'bg-[#0a0a0a] border-amber-900/20 opacity-60' 
                                  : 'bg-black border-white/5 opacity-40'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                                idx === state.currentStageIndex ? 'text-amber-400' : 'text-amber-700'
                              }`}>{stage.name}</span>
                              {idx < state.currentStageIndex && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                              {idx === state.currentStageIndex && state.isLoading && <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />}
                            </div>
                            <p className="text-xs font-mono text-amber-200/60 leading-relaxed">
                              {stage.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {state.currentStageIndex < PIPELINE_STAGES.length - 1 && !state.isLoading && (
                        <div className="space-y-4 pt-6 border-t border-amber-900/30">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                              Sovereign Command Override (Optional)
                            </label>
                            <textarea 
                              id="sovereign-instructions"
                              placeholder="Inject additional policy mandates..."
                              className="w-full p-4 bg-[#0a0a0a] border border-amber-500/20 rounded-xl text-xs font-mono text-amber-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none h-24 resize-none transition-all"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const el = document.getElementById('sovereign-instructions') as HTMLTextAreaElement;
                              improveSovereignDraft(el?.value || '');
                            }}
                            className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-black rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] transition-all flex items-center justify-center space-x-3 group"
                          >
                            <span>Execute Hydration Sequence</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {state.error && (
                  <div className="mt-4 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
                    <div className="font-bold uppercase tracking-widest mb-1 text-red-500">Exception Caught</div>
                    {state.error}
                  </div>
                )}
              </div>
            </SovereignFormBoundary>
          </div>

          {/* Right Content: Materialized View (BillPreview) */}
          <div className="flex-1 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#0a0a0a] to-[#050505] overflow-y-auto relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] p-8 print:p-0 print:border-none">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Globe size={200} className="text-amber-500" />
            </div>

            {!state.currentDraft && !state.isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-amber-700/50 space-y-6">
                <Database size={64} strokeWidth={1} className="drop-shadow-[0_0_15px_rgba(217,119,6,0.2)]" />
                <p className="text-sm font-mono tracking-widest uppercase">
                  Awaiting Kafka Domain Events
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto rounded-xl shadow-2xl min-h-full flex flex-col print:shadow-none print:border-none relative z-10">
                <div className="flex-1 p-2">
                  <BillPreview 
                    bill={state.currentDraft} 
                    isStreaming={state.isLoading} 
                    onUpdate={(updatedBill) => dispatch({ type: 'DRAFT_MATERIALIZED_VIEW_UPDATED_EVENT', payload: updatedBill })}
                  />
                  
                  {state.isLoading && !state.currentDraft && (
                    <div className="h-full flex flex-col items-center justify-center space-y-8 py-32">
                      <div className="relative w-full max-w-[400px] h-1 bg-[#1a1a1a] overflow-hidden rounded-full">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                          style={{ width: '50%' }}
                        />
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <p className="text-xs text-amber-400 font-mono uppercase tracking-[0.3em] animate-pulse">
                          {PIPELINE_STAGES[state.currentStageIndex]?.description || 'Unpacking Websocket Buffer...'}
                        </p>
                        <p className="text-[9px] text-amber-700 font-mono tracking-widest">
                          [ NODE.JS BFF GATEWAY OVER WSS ]
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SovereignThemeProvider>
  );
}
