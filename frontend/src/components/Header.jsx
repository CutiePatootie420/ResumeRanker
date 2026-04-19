export default function Header() {
  return (
    <header className="pt-12 pb-8 text-center animate-fade-in-up">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-sm bg-white/5 text-white flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h1 className="text-4xl font-black tracking-[0.2em] uppercase font-sans text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          RESUME RANKER
        </h1>
      </div>
      <p className="text-white/70 text-lg font-medium max-w-md mx-auto font-sans">
        AI-Powered Resume Screening for Recruiters
      </p>
      <div className="mt-6 mx-auto w-24 h-0.5 rounded-sm bg-gradient-to-r from-white/40 to-transparent" />
    </header>
  );
}
