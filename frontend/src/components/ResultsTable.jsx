import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SlideOutPanel({ resume, onClose }) {
  const [tab, setTab] = useState("extraction");
  const [copied, setCopied] = useState(false);

  const copySummary = () => {
    navigator.clipboard.writeText(JSON.stringify(resume.raw_extraction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.45, 0, 0.55, 1] }}
        className="fixed inset-y-0 right-0 w-[40%] min-w-[500px] border-l border-white/10 z-[100] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-slate-950 backdrop-blur-xl"
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/50">
          <div>
            <h3 className="text-xl font-bold text-white font-mono uppercase tracking-widest">{resume.file}</h3>
            <p className="text-2xl text-[#2dd4bf] mt-2 font-mono uppercase tracking-wider font-black">Vector Match: {(resume.score * 100).toFixed(1)}%</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex border-b border-white/10 bg-black/30">
          <button 
            onClick={() => setTab("extraction")}
            className={`flex-1 py-4 text-sm font-mono uppercase tracking-widest border-b-2 transition-colors ${tab === "extraction" ? "border-[#2dd4bf] text-[#2dd4bf]" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Gemini Extraction
          </button>
          <button 
            onClick={() => setTab("vectors")}
            className={`flex-1 py-4 text-sm font-mono uppercase tracking-widest border-b-2 transition-colors ${tab === "vectors" ? "border-[#2dd4bf] text-[#2dd4bf]" : "border-transparent text-white/50 hover:text-white"}`}
          >
            Vector Breakdown
          </button>
        </div>

        <div className="p-8 pb-32 h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
          {tab === "extraction" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={copySummary} className="px-4 py-2 text-xs font-mono uppercase font-bold tracking-widest bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-sm transition-all active:scale-95 flex items-center gap-2">
                  {copied ? (
                    <><span className="w-1.5 h-1.5 rounded-sm bg-[#2dd4bf] block" /> Copied</>
                  ) : "Copy Summary"}
                </button>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm w-full min-h-[80vh]">
                <pre className="text-base text-slate-200 font-mono whitespace-pre-wrap leading-relaxed outline-none focus:outline-none">
                  {JSON.stringify(resume.raw_extraction, null, 2)}
                </pre>
              </div>
            </div>
          )}
          {tab === "vectors" && (
            <div className="space-y-1">
              {Object.keys(resume.vector_breakdown || {}).length === 0 ? (
                <p className="text-slate-400 font-mono text-sm uppercase tracking-wider text-center py-10">No strict vector parameters matched.</p>
              ) : (
                Object.entries(resume.vector_breakdown || {})
                  .sort((a,b) => b[1] - a[1])
                  .map(([kw, sc]) => (
                  <div key={kw} className="flex items-center justify-between py-1 px-3 border-b border-white/[0.02] hover:bg-white/[0.02] w-full gap-4 transition-colors">
                    <span className="text-sm text-slate-200 font-mono uppercase tracking-wider leading-tight truncate" title={kw}>{kw}</span>
                    <span className="text-sm font-mono text-[#2dd4bf] font-bold shrink-0 text-right w-24 tabular-nums">{sc.toFixed(4)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default function ResultsTable({ results }) {
  const [activeReview, setActiveReview] = useState(null);

  if (!results || results.length === 0) return null;

  const maxScore = Math.max(...results.map((r) => r.score));

  const getRankStyle = (index) => {
    if (index === 0) return { badge: "🥇", color: "var(--color-amber-400)" };
    if (index === 1) return { badge: "🥈", color: "var(--color-slate-300)" };
    if (index === 2) return { badge: "🥉", color: "#cd7f32" };
    return { badge: `#${index + 1}`, color: "var(--color-slate-400)" };
  };

  return (
    <>
      <div
        className="glass-card overflow-hidden mt-8"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-300 tracking-widest font-mono uppercase">
                Ranking Results
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {results.length} resume{results.length > 1 ? "s" : ""} analyzed
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-sm bg-[#2dd4bf]/10 border border-[#2dd4bf]/30">
              <span className="text-[#2dd4bf] text-sm font-semibold uppercase tracking-widest font-mono">
                System Complete
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">
                  Rank
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Candidate Engine Profile
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-48">
                  Vector Proximity
                </th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const rank = getRankStyle(i);
                const pct = maxScore > 0 ? (r.score / maxScore) * 100 : 0;
                return (
                  <tr
                    key={r.file}
                    className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors"
                  >
                    {/* Rank */}
                    <td className="px-8 py-4">
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                        style={{
                          background:
                            i < 3
                              ? `${rank.color}15`
                              : "rgba(255,255,255,0.04)",
                          color: rank.color,
                          border:
                            i < 3
                              ? `1px solid ${rank.color}30`
                              : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {rank.badge}
                      </span>
                    </td>

                    {/* Candidate Data & Heatmap */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white shrink-0"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-white font-bold font-mono tracking-wide text-sm uppercase">
                            {r.file}
                          </span>
                        </div>
                        
                        {/* The Skill Heatmap */}
                        {r.top_matches && Object.keys(r.top_matches).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-0.5">
                            {Object.entries(r.top_matches).map(([word, score], idx) => {
                              const isHigh = idx < 2; // high-impact keys get glow
                              return (
                                <span 
                                  key={word} 
                                  className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm border truncate max-w-[120px] inline-block align-bottom ${isHigh ? 'border-teal-500/30 bg-[#2dd4bf]/10 text-[#2dd4bf] shadow-[0_0_10px_rgba(45,212,191,0.2)]' : 'border-white/10 bg-white/5 text-slate-400'}`}
                                  title={word}
                                >
                                  {word}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Score Bar */}
                    <td className="px-4 py-4">
                      <div className="score-bar-track">
                        <div
                          className="score-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>

                    {/* Score Value & Review Engine */}
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-5">
                        <span
                          className="font-mono font-bold text-sm tracking-widest"
                          style={{
                            color:
                              i === 0
                                ? "var(--color-amber-400)"
                                : "white",
                          }}
                        >
                          {(r.score * 100).toFixed(1)}%
                        </span>
                        
                        <button 
                          onClick={() => setActiveReview(r)} 
                          className="p-2 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all cursor-pointer rounded-sm text-white/50 hover:text-[#2dd4bf] hover:shadow-[0_0_15px_rgba(45,212,191,0.2)]" 
                          title="Deep Scan Review"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {activeReview && (
          <SlideOutPanel resume={activeReview} onClose={() => setActiveReview(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
