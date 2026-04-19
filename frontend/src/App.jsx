import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import UploadForm from "./components/UploadForm";
import ResultsTable from "./components/ResultsTable";
import ScanningBeam from "./components/ScanningBeam";
import heroBg from "./assets/hero-core.jpeg";

const API_URL = "http://localhost:3001";

function App() {
  const [rankingResults, setRankingResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef(null);

  const handleSubmit = async (keywords, files) => {
    setLoading(true);
    setError(null);
    setRankingResults(null);

    try {
      const formData = new FormData();
      formData.append("jobDescription", keywords);
      files.forEach((f) => formData.append("resumes", f));

      const res = await fetch(`${API_URL}/rank`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with ${res.status}`);
      }

      const sorted = [...data.results].sort((a, b) => b.score - a.score);
      setRankingResults(sorted);
    } catch (err) {
      console.error("Ranking failed:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRankingResults(null);
    setError(null);
    setLoading(false);
    formRef.current?.reset();
  };

  const scrollToApp = () => {
    document.getElementById("workstation")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen selection:bg-white selection:text-black">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-[12px] border-b border-white/10 py-4 px-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            R
          </div>
          <span className="font-sans font-bold text-lg text-white tracking-[0.2em]">RESUME RANKER</span>
        </div>
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-6 text-sm font-bold text-text-muted font-mono uppercase tracking-[0.1em]">
          <a href="#hero" className="hover:text-white transition-colors">Platform</a>
          <a href="#workstation" className="hover:text-white transition-colors">Engine</a>
          <a href="#features" className="hover:text-white transition-colors">Architecture</a>
        </div>
        <button onClick={scrollToApp} className="px-5 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all duration-100 ease-out hover:scale-[0.98] active:scale-95 font-mono uppercase tracking-widest border border-white/20">
          Launch App
        </button>
      </motion.nav>

      <main>
        {/* HERO SECTION - Monochrome OLED Look */}
        <section 
          id="hero" 
          className="relative pt-40 pb-32 px-6 flex flex-col items-center text-center overflow-hidden min-h-[90vh]"
        >
          {/* Background Image Asset - Depth of Field */}
          <div 
            className="absolute inset-0 z-0 bg-black"
          >
            {/* Sharp Base Layer */}
            <img src={heroBg} alt="Structural Core" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" style={{ filter: "sepia(1) hue-rotate(130deg) saturate(3) brightness(0.7)" }} />
            {/* Blurred Center Over-Layer */}
            <img 
              src={heroBg} 
              alt="Blurred Structural Core" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen" 
              style={{ 
                filter: "sepia(1) hue-rotate(130deg) saturate(3) brightness(0.6) blur(6px)", 
                WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 60%)",
                maskImage: "radial-gradient(circle at center, black 0%, transparent 60%)" 
              }} 
            />
          </div>
          
          {/* Shadow Veil for text legibility */}
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%)" }} />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black to-transparent z-0 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="max-w-4xl relative z-10 mt-16"
          >
            <span className="inline-block py-1 px-3 rounded-sm border border-white/40 bg-black/60 text-slate-300 text-xs font-bold mb-8 font-mono tracking-[0.3em] uppercase backdrop-blur-md">
              AI-Powered Sourcing
            </span>
            <h1 
              className="text-6xl md:text-8xl font-black mb-8 leading-none tracking-[0.05em] font-sans uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-fade-in-up"
            >
              Recruit with <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-500">Precision</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed font-sans font-medium" style={{ textShadow: "0 0 15px rgba(0,0,0,0.9)" }}>
              Drop your job requirements and resumes into the workstation. Our Gemini-powered pipeline mathematically ranks the perfect candidates instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button 
                onClick={scrollToApp} 
                animate={{ boxShadow: ["0 0 10px rgba(45, 212, 191, 0.2)", "0 0 30px rgba(45, 212, 191, 0.6)", "0 0 10px rgba(45, 212, 191, 0.2)"] }}
                transition={{ duration: loading ? 0.8 : 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-sm border border-white text-white font-bold tracking-widest font-mono transition-colors duration-100 ease-out px-10 py-5 text-sm uppercase bg-white/5 backdrop-blur-xl hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.8)]"
                style={{ textShadow: "0 0 10px rgba(45, 212, 191, 0.4)" }}
              >
                Initialize System
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* WORKSTATION / DASHBOARD */}
        <section id="workstation" className="py-24 px-4 bg-bg-secondary relative border-t border-white/5">
          <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-teal-900/10 to-transparent pointer-events-none z-0" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4 font-mono tracking-[0.1em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Command Center</h2>
              <p className="text-white/70 max-w-lg mx-auto font-sans leading-relaxed">Upload candidate resumes in PDF format, specify your absolute keyword requirements, and let the model compute the rest.</p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={{ 
                scale: isDragging ? 1.02 : 1, 
                backdropFilter: isDragging ? "blur(40px)" : "blur(24px)",
                borderColor: isDragging 
                  ? "#2dd4bf" 
                  : loading 
                    ? ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.1)"] 
                    : "rgba(255, 255, 255, 0.2)"
              }}
              transition={{ 
                duration: loading && !isDragging ? 3 : 0.4, 
                repeat: loading && !isDragging ? Infinity : 0, 
                ease: "easeInOut" 
              }}
              viewport={{ once: true, margin: "-100px" }}
              className="glass-card p-6 md:p-10 relative z-20 bg-black/80"
              style={{ overflow: "hidden" }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading-state" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(20px)" }} 
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="py-40 flex flex-col items-center justify-center relative w-full h-[60vh] max-h-[600px] border border-white/5 rounded-sm bg-black/40 overflow-hidden"
                  >
                    <ScanningBeam />
                    <motion.div className="px-6 py-3 rounded-sm bg-white/5 backdrop-blur-md border border-white/10 relative z-[100] w-[60%] flex items-center justify-center">
                      <p className="text-white/80 font-bold text-sm font-mono tracking-[0.3em] uppercase">
                        Extracting Core Data
                      </p>
                    </motion.div>
                  </motion.div>
                ) : rankingResults ? (
                  <motion.div 
                    key="results-table" 
                    initial={{ opacity: 0, filter: "blur(20px)" }} 
                    animate={{ opacity: 1, filter: "blur(0px)" }} 
                    exit={{ opacity: 0, filter: "blur(20px)" }} 
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="w-full"
                  >
                    <ResultsTable results={rankingResults} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="upload-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Header />
                    {error && (
                      <div className="mb-6 p-4 border border-rose-500/50 bg-rose-500/10 rounded-sm text-rose-400 font-mono text-sm tracking-wider text-center">
                        <span className="font-bold uppercase">System Error:</span> {error}
                      </div>
                    )}
                    <UploadForm ref={formRef} onSubmit={handleSubmit} loading={loading} onDragStateChange={(state) => setIsDragging(state)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {rankingResults && rankingResults.length > 0 && !loading && (
                <div className="mt-10 text-center animate-fade-in">
                  <button onClick={handleReset} className="px-8 py-4 rounded-sm text-xs font-bold text-white hover:bg-white hover:text-black border border-white/20 transition-all duration-300 uppercase tracking-[0.2em] font-mono shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Clear Workspace & Reboot
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-32 px-6 max-w-6xl mx-auto border-t border-white/5 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel p-10 rounded-sm flex flex-col gap-5 border border-white/10 hover:border-white/40 border-t-[3px] border-t-white/30 transition-colors bg-black/50">
              <div className="w-12 h-12 rounded-sm bg-white/5 flex items-center justify-center text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white font-mono tracking-widest uppercase">Gemini Vision</h3>
              <p className="text-text-muted text-sm leading-relaxed font-sans">State-of-the-art vision and text extraction from Google Gemini intelligently parses massive unstructured PDFs.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-panel p-10 rounded-sm flex flex-col gap-5 border border-white/10 hover:border-white/40 border-t-[3px] border-t-white/30 transition-colors bg-black/50">
              <div className="w-12 h-12 rounded-sm bg-white/5 flex items-center justify-center text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white font-mono tracking-widest uppercase">TF-IDF Math</h3>
              <p className="text-text-muted text-sm leading-relaxed font-sans">Frequency-inverse document frequency formulas compute precise cosine similarity ranks organically.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-panel p-10 rounded-sm flex flex-col gap-5 border border-white/10 hover:border-white/40 border-t-[3px] border-t-white/30 transition-colors bg-black/50">
              <div className="w-12 h-12 rounded-sm bg-white/5 flex items-center justify-center text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white font-mono tracking-widest uppercase">Zero Retention</h3>
              <p className="text-text-muted text-sm leading-relaxed font-sans">Completely stateless directory execution dynamically wipes local persistence for total privacy.</p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-40 px-6 relative overflow-hidden flex flex-col items-center justify-center border-t border-white/10 bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 font-mono tracking-[0.1em] uppercase">Engine Standby</h2>
          <p className="text-text-muted mb-12 text-center max-w-lg font-sans">Scale your technical sourcing operations perfectly with minimal overhead.</p>
          <button onClick={scrollToApp} className="btn-primary shadow-xl shadow-white/20 z-10 w-full sm:w-auto px-12 py-5 text-sm uppercase tracking-widest font-mono">
            Boot Sequence
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black pt-20 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 md:col-span-1">
              <div className="font-bold tracking-widest text-white text-lg mb-6 font-mono uppercase">Resume Ranker</div>
              <p className="text-text-muted text-sm leading-relaxed pr-4 font-sans">AI-driven resume parsing platform built on Gemini and sophisticated document vectors.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6 font-mono uppercase tracking-[0.2em] text-xs">Platform</h4>
              <ul className="flex flex-col gap-4 text-sm text-text-muted font-sans">
                <li><a href="#" className="hover:text-white transition-colors">Technology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TF-IDF Model</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 font-mono uppercase tracking-[0.2em] text-xs">Developers</h4>
              <ul className="flex flex-col gap-4 text-sm text-text-muted font-sans">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 font-mono uppercase tracking-[0.2em] text-xs">Company</h4>
              <ul className="flex flex-col gap-4 text-sm text-text-muted font-sans">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <p className="text-xs text-text-muted font-mono tracking-widest uppercase">
                [ © {new Date().getFullYear()} RR_SYSTEM ]
              </p>
              <span className="text-white/20 mx-2">|</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-sm bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className="text-white/80 font-mono uppercase tracking-widest text-[10px] font-bold">System Active</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-text-muted">
               <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
               </a>
               <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
               </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
