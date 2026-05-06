/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Briefcase, 
  Database, 
  Zap, 
  Layout, 
  ClipboardCheck, 
  ArrowRight,
  Loader2,
  RefreshCcw,
  Monitor,
  ListChecks,
  Lightbulb,
  ShieldAlert,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface StrategyOutput {
  pitch: string;
  breakdown: string;
  solution: string;
  steps: string;
  ui: string;
  advantage: string;
  red_team: string;
  archetypes: string;
  metrics: {
    practicality: number;
    uniqueness_score: number;
    risk: string;
    speed: string;
    alignment: number;
  };
}

export default function App() {
  const [problem, setProblem] = useState('');
  const [userData, setUserData] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [output, setOutput] = useState<StrategyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const solveProblem = useCallback(async () => {
    if (!problem.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setOutput(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert AI Product Builder and Pitch Consultant. Solve the following problem.
        
        STRICT STRATEGIC CONSTRAINTS:
        1. UNIQUENESS: Avoid generic "AI Chatbots" or "Data Dashboards". Think about agentic workflows, obscure API integrations, or novel UX paradigms.
        2. PRACTICALITY: The MVP must be buildable by 1 developer in < 2 weeks. High ROI, minimal infrastructure.
        3. DEMO-READY: Output must be punchy, persuasive, and optimized for a 2-minute verbal pitch.
        
        PROBLEM:
        ${problem}
        
        CONTEXT:
        ${userData}
        
        Generate a cohesive strategy in eight parts:
        
        1. PITCH: A 30-second "Elevator Pitch" that captures the essence and the "Wow" factor.
        2. BREAKDOWN: Root cause analysis in 3 bullet points.
        3. SOLUTION: The "Magic" AI-powered core of the product.
        4. STEPS: 5 clear steps to build the MVP.
        5. UI: High-level visual identity and main user interactions.
        6. ADVANTAGE: The "Unfair Advantage" of using AI for this.
        7. RED_TEAM: A skeptical "Red Team Audit" identifying 2 critical vulnerabilities/failure points of this specific solution.
        8. ARCHETYPES: A "Persona Playbook" describing how these 3 archetypes would solve it differently: 
           - THE MINIMALIST (Indie dev, <$500 budget)
           - THE MONOPOLIST (Amazon-style, scale & logistic focus)
           - THE DESIGNER (Apple-style, premium hardware & ecosystem integration)
        9. METRICS JSON: A raw JSON object with keys: "practicality" (0-100), "uniqueness_score" (0-100), "risk" (Low/Med/High), "speed" (Fast-Track/Normal/Long-Term), "alignment" (0-100).
        
        Format the response with exactly these section markers:
        ---SECTION--- PITCH
        ---SECTION--- BREAKDOWN
        ---SECTION--- SOLUTION
        ---SECTION--- STEPS
        ---SECTION--- UI
        ---SECTION--- ADVANTAGE
        ---SECTION--- RED_TEAM
        ---SECTION--- ARCHETYPES
        ---SECTION--- METRICS`,
        config: {
          temperature: 0.3,
        }
      });

      const text = response.text || '';
      const sections = text.split('---SECTION---');
      
      const metricsText = sections.find(s => s.trim().startsWith('METRICS'))?.replace('METRICS', '').trim() || '{}';
      let parsedMetrics = { practicality: 85, uniqueness_score: 90, risk: 'Low', speed: 'Fast-Track', alignment: 95 };
      
      try {
        const jsonMatch = metricsText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedMetrics = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn("Failed to parse metrics", e);
      }

      setOutput({
        pitch: sections.find(s => s.trim().startsWith('PITCH'))?.replace('PITCH', '').trim() || 'No pitch generated.',
        breakdown: sections.find(s => s.trim().startsWith('BREAKDOWN'))?.replace('BREAKDOWN', '').trim() || 'No breakdown generated.',
        solution: sections.find(s => s.trim().startsWith('SOLUTION'))?.replace('SOLUTION', '').trim() || 'No solution generated.',
        steps: sections.find(s => s.trim().startsWith('STEPS'))?.replace('STEPS', '').trim() || 'No steps generated.',
        ui: sections.find(s => s.trim().startsWith('UI'))?.replace('UI', '').trim() || 'No UI concept generated.',
        advantage: sections.find(s => s.trim().startsWith('ADVANTAGE'))?.replace('ADVANTAGE', '').trim() || 'No advantage generated.',
        red_team: sections.find(s => s.trim().startsWith('RED_TEAM'))?.replace('RED_TEAM', '').trim() || 'No red team audit generated.',
        archetypes: sections.find(s => s.trim().startsWith('ARCHETYPES'))?.replace('ARCHETYPES', '').trim() || 'No archetypes generated.',
        metrics: parsedMetrics
      });
    } catch (err) {
      console.error(err);
      setError('Strategic synthesis failed. Please try a more specific problem statement.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [problem, userData]);

  const reset = () => {
    setProblem('');
    setUserData('');
    setOutput(null);
    setError(null);
  };

  return (
    <div className="h-screen w-full bg-[#0A0B0D] text-slate-200 font-sans flex flex-col overflow-hidden">
      {/* Header Navigation */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0F1115] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-semibold tracking-tight text-lg text-slate-100 flex items-center gap-2">
            StratOS <span className="text-slate-500 font-normal text-sm border-l border-slate-700 pl-2 uppercase tracking-tighter">AI Product Builder</span>
          </span>
        </div>
        <div className="flex items-center gap-8 text-[11px] text-slate-400 uppercase tracking-[0.2em] font-medium transition-all">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
            Processing Core Active
          </span>
          <button 
            onClick={reset}
            className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Clear Workspace
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Input Pane (Left) */}
        <section className="w-[400px] xl:w-[450px] border-r border-slate-800 p-8 flex flex-col gap-6 bg-[#0D0F12] overflow-y-auto mission-grid shrink-0">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 block mb-3 flex items-center gap-2">
              <Briefcase className="w-3 h-3 text-indigo-500" />
              Problem to Solve
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g., Small retail stores struggle with inventory theft and tracking without expensive security guards."
              className="w-full h-32 p-5 rounded-xl bg-[#16181D] border border-slate-800 text-slate-300 leading-relaxed text-sm focus:outline-none focus:ring-1 focus:ring-indigo-600/50 focus:border-indigo-600/50 transition-all resize-none placeholder:text-slate-700"
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 block mb-3 flex items-center gap-2">
              <Database className="w-3 h-3 text-indigo-500" />
              Market Context / Constraints
            </label>
            <textarea
              value={userData}
              onChange={(e) => setUserData(e.target.value)}
              placeholder="// Persona: Store Owners, Tech level: Low, Budget: MVP only..."
              className="flex-1 p-5 rounded-xl bg-[#0A0B0D] border border-slate-800 font-mono text-xs text-indigo-400 placeholder:text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600/50 transition-all resize-none"
            />
          </div>

          <button 
            onClick={solveProblem}
            disabled={isAnalyzing || !problem.trim()}
            className="w-full shrink-0 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/10 active:scale-[0.98]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing Solution
              </>
            ) : (
              <>
                Build AI Strategy
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-900/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-wider font-bold">
              {error}
            </div>
          )}
        </section>

        {/* Output Pane (Right) */}
        <section className="flex-1 p-8 bg-[#0A0B0D] flex flex-col gap-6 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {!output && !isAnalyzing ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center opacity-30"
              >
                <div className="w-16 h-16 rounded-3xl border border-slate-700 flex items-center justify-center mb-6">
                  <Layout className="w-8 h-8" />
                </div>
                <p className="text-xs uppercase tracking-[0.3em] font-mono">Neural Interface Ready</p>
                <p className="text-[10px] text-slate-600 mt-2 font-mono italic">Waiting for problem payload...</p>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 border border-slate-800 rounded-full animate-[spin_3s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-bold">Architecting AI Product</p>
                  <p className="text-xs text-slate-600 font-mono italic">Breaking down root causes...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="output"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col gap-6 pb-20"
              >
                {/* Demo Pitch Card */}
                <div className="bg-indigo-600 p-8 rounded-3xl border border-indigo-500 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-2.5 py-1 bg-white/20 text-white text-[9px] font-bold rounded-lg uppercase tracking-widest backdrop-blur-md">
                        2-Minute Pitch
                      </div>
                    </div>
                    <div className="markdown-body !text-white text-lg font-light leading-snug">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.pitch}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Breakdown & Solution */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 bg-[#16181D] p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Problem Breakdown</h3>
                    </div>
                    <div className="markdown-body prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.breakdown}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-gradient-to-br from-[#1A1C21] to-[#0F1115] p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-indigo-900/40 text-indigo-400 text-[9px] font-bold rounded-lg border border-indigo-500/20 uppercase tracking-widest">
                        AI-Powered Solution
                      </span>
                    </div>
                    <div className="markdown-body text-slate-200">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.solution}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Red Team Audit */}
                  <div className="p-8 bg-red-950/10 rounded-3xl border border-red-500/10 flex flex-col shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <ShieldAlert className="w-4 h-4 text-red-500/50" />
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-red-400">Red Team Audit</h3>
                    </div>
                    <div className="markdown-body text-sm text-slate-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.red_team}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Archetypes */}
                  <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="w-4 h-4 text-slate-500" />
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Strategic Archetypes</h3>
                    </div>
                    <div className="markdown-body text-sm text-slate-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.archetypes}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Working / Steps */}
                  <div className="p-8 bg-[#16181D] rounded-3xl border border-slate-800 flex flex-col shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <ListChecks className="w-4 h-4 text-emerald-500/50" />
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Step-by-Step Working</h3>
                    </div>
                    <div className="markdown-body text-sm text-slate-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.steps}</ReactMarkdown>
                    </div>
                  </div>

                  {/* UI Concept */}
                  <div className="p-8 bg-[#16181D] rounded-3xl border border-slate-800 flex flex-col shadow-xl relative">
                    <div className="flex items-center gap-3 mb-6">
                      <Monitor className="w-4 h-4 text-indigo-500/50" />
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Simple UI Idea</h3>
                    </div>
                    <div className="markdown-body text-sm text-slate-400 mb-6">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.ui}</ReactMarkdown>
                    </div>
                    <div className="mt-auto border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-3 bg-[#0A0B0D]/50">
                       <div className="flex justify-between items-center">
                         <div className="h-3 w-20 bg-slate-800 rounded"></div>
                         <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                       </div>
                       <div className="h-10 bg-indigo-900/10 border border-indigo-500/10 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-indigo-800 opacity-30" />
                       </div>
                       <div className="h-1.5 w-full bg-slate-800/80 rounded"></div>
                    </div>
                  </div>

                  {/* Why Better */}
                  <div className="p-8 bg-indigo-950/20 rounded-3xl border border-indigo-500/10 flex flex-col shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Zap className="w-4 h-4 text-amber-500/50" />
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400">Competitive Advantage</h3>
                    </div>
                    <div className="markdown-body text-sm text-slate-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.advantage}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-8 flex items-center justify-between pt-8 border-t border-slate-800 shrink-0">
                  <div className="flex gap-10">
                    <div>
                      <div className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-1">Practicality Score</div>
                      <div className="text-xl font-mono text-emerald-500">{output.metrics.practicality}/100</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-1">Uniqueness Index</div>
                      <div className="text-xl font-mono text-indigo-400">{output.metrics.uniqueness_score}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-bold mb-1">Risk Profile</div>
                      <div className="text-xl font-mono text-amber-500">{output.metrics.risk}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        const dossier = {
                          problem,
                          context: userData,
                          ...output
                        };
                        navigator.clipboard.writeText(JSON.stringify(dossier, null, 2));
                      }}
                      className="h-11 px-6 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-center gap-3 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-bold uppercase tracking-widest group"
                    >
                      <Database className="w-4 h-4 group-active:scale-90 transition-transform" />
                      Export JSON Dossier
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Meta */}
      <footer className="h-8 px-8 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-600 uppercase tracking-widest bg-[#0F1115] shrink-0">
        <div className="flex gap-8">
          <span>Engine: v3-Flash-Preview</span>
          <span>Latency: &lt;2.8s</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
            System Ready
          </span>
          <span>© 2026 STRAT_OS // AI_PRODUCT_LAB</span>
        </div>
      </footer>
    </div>
  );
}

