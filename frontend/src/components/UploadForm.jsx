import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

const UploadForm = forwardRef(function UploadForm({ onSubmit, loading, onDragStateChange }, ref) {
  const [keywords, setKeywords] = useState("");
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset() {
      setKeywords("");
      setFiles([]);
      setDragOver(false);
      if (inputRef.current) inputRef.current.value = "";
    },
  }));

  useEffect(() => {
    if (onDragStateChange) {
      onDragStateChange(dragOver);
    }
  }, [dragOver, onDragStateChange]);

  const handleFiles = (incoming) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfs.length > 0) {
      setFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const newFiles = pdfs.filter((f) => !existingNames.has(f.name));
        return [...prev, ...newFiles];
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keywords.trim() || files.length === 0) return;
    onSubmit(keywords.trim(), files);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-8 animate-fade-in-up relative overflow-hidden"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Keywords Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
          Job Keywords
        </label>
        <textarea
          id="keywords-input"
          rows={3}
          placeholder="e.g. python java docker kubernetes react sql machine learning..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          disabled={loading}
        />
        <p className="mt-2 text-xs text-slate-400 opacity-60">
          Space-separated skills, technologies, and requirements
        </p>
      </div>

      {/* Drop Zone */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
          Upload Resumes
        </label>
        <div
          id="drop-zone"
          className={`drop-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="mb-3">
            <svg
              className="mx-auto"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "white" }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-slate-300 font-medium">
            Drop PDF files here or{" "}
            <span className="text-white font-bold underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-1 opacity-60">
            PDF files only · Max 10 MB each
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-300 mb-2">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <span
                key={f.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-navy-800 border border-violet-500/20 text-slate-300"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-violet-400 shrink-0"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="truncate max-w-[180px]">{f.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.name);
                  }}
                  className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                  aria-label={`Remove ${f.name}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        id="rank-button"
        type="submit"
        className="btn-primary w-full flex items-center justify-center gap-3"
        disabled={loading || !keywords.trim() || files.length === 0}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        INITIALIZE SYSTEM
      </button>
    </form>
  );
});

export default UploadForm;
