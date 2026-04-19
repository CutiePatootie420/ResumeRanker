const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const WORKER_DIR = path.resolve(__dirname, "..", "worker");
const RESUME_FOLDER = path.join(WORKER_DIR, "resume_folder");
const RESULTS_FILE = path.join(WORKER_DIR, "resumes.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
    abortOnLimit: true,
  })
);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// POST /rank — accepts jobDescription + PDF files, runs the Python pipeline
app.post("/rank", async (req, res) => {
  try {
    // ── Validate inputs ──────────────────────────────────────────────
    const jobDescription = req.body.jobDescription;
    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ error: "Missing or empty 'jobDescription' field." });
    }

    if (!req.files || !req.files.resumes) {
      return res.status(400).json({ error: "No PDF files uploaded. Attach files under the 'resumes' field." });
    }

    // Normalize to array (single file comes as object, not array)
    let uploads = req.files.resumes;
    if (!Array.isArray(uploads)) uploads = [uploads];

    // Filter to PDFs only
    const pdfFiles = uploads.filter((f) => f.mimetype === "application/pdf");
    if (pdfFiles.length === 0) {
      return res.status(400).json({ error: "No valid PDF files found in upload." });
    }

    // ── Clear resume_folder and save new PDFs ────────────────────────
    if (fs.existsSync(RESUME_FOLDER)) {
      const existing = fs.readdirSync(RESUME_FOLDER);
      for (const file of existing) {
        fs.unlinkSync(path.join(RESUME_FOLDER, file));
      }
    } else {
      fs.mkdirSync(RESUME_FOLDER, { recursive: true });
    }

    for (const pdf of pdfFiles) {
      const savePath = path.join(RESUME_FOLDER, pdf.name);
      await pdf.mv(savePath);
    }

    console.log(`[rank] Received ${pdfFiles.length} PDF(s) with job description: "${jobDescription.trim().substring(0, 80)}..."`);

    // ── Run the Python pipeline via spawn ────────────────────────────
    const pythonScript = path.join(WORKER_DIR, "pipeline_worker.py");
    const child = spawn("python3", [pythonScript, jobDescription.trim()], {
      cwd: WORKER_DIR,
    });

    let stdoutData = "";
    let stderrData = "";
    let responded = false;

    // Set a 5-minute timeout
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        child.kill("SIGKILL");
        return res.status(504).json({ error: "Pipeline timed out after 5 minutes." });
      }
    }, 5 * 60 * 1000);

    child.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();

      // Check for the sentinel that signals completion
      if (stdoutData.includes("WORKER_COMPLETE") && !responded) {
        responded = true;
        clearTimeout(timeout);

        try {
          const raw = fs.readFileSync(RESULTS_FILE, "utf-8");
          const results = JSON.parse(raw);
          console.log(`[rank] Pipeline complete — ${results.length} resumes ranked.`);
          return res.json({ success: true, results });
        } catch (readErr) {
          console.error("[rank] Failed to read results:", readErr.message);
          return res.status(500).json({ error: "Failed to read ranking results." });
        }
      }
    });

    child.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
      console.warn("[rank] Python stderr:", chunk.toString());
    });

    child.on("error", (err) => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        console.error("[rank] Failed to start Python process:", err.message);
        return res.status(500).json({ error: "Failed to start pipeline process." });
      }
    });

    child.on("close", (code) => {
      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        console.error(`[rank] Python exited with code ${code} without WORKER_COMPLETE`);
        return res.status(500).json({
          error: "Pipeline execution failed.",
          details: stderrData || `Process exited with code ${code}`,
        });
      }
    });
  } catch (err) {
    console.error("[rank] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Resume Ranker backend running on http://localhost:${PORT}`);
});
