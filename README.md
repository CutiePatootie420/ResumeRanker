# RESUME RANKER // NEURAL ANALYTICS ENGINE [v1.0]

**A full-stack analytical platform utilizing custom mathematical vectorization and semantic metadata extraction to rank candidate documents.**

---

### I. CORE METHODOLOGY :: CUSTOM VECTORIZATION

The system utilizes a proprietary mathematical core developed and verified through iterative prototyping in Jupyter environments. 

* **TF-IDF ALGORITHM // FROM SCRATCH** Manual implementation of Term Frequency (TF) and Inverse Document Frequency (IDF) calculations. This approach bypasses high-level machine learning libraries to ensure granular control over feature weighting and normalization.
  
* **LINEAR ALGEBRA LAYER** Execution of Cosine Similarity via manual dot-product calculation. The engine measures the angular distance between high-dimensional document vectors to determine mathematical proximity between candidate profiles and job requirements.

* **SEMANTIC TOKENIZATION** Google Gemini Flash is utilized as a pre-processor to enforce JSON schema extraction, converting unstructured PDF data into a structured keyword matrix for processing by the custom vectorizer.

---

### II. INTERFACE ARCHITECTURE :: THE COCKPIT

The UI is engineered for high-density data visualization and surgical feedback loops.

* **SCANNING BEAM:** A minimalist 1px sweeping interface providing real-time telemetry during the vector computation phase.
* **LIQUID STATE TRANSITIONS:** Framer Motion logic utilizing Gaussian blur-to-focus handovers between processing and diagnostic states.
* **HIGH-DENSITY DOSSIER:** A 40%-width slide-out diagnostic panel providing a 1:1 audit trail of extraction metadata and vector scores.

---

### III. TECHNICAL SPECIFICATIONS

| Component | Tech Stack |
| :--- | :--- |
| **Engine (Logic)** | Python 3.x / Scikit-free Custom Implementation |
| **Gateway (API)** | Node.js / Express |
| **Cockpit (UI)** | React 19 / Tailwind CSS / Framer Motion |
| **Intelligence** | Google Gemini Pro API |

---

### IV. SYSTEM CONSTRAINTS + v1.0 STATUS

As an initial engineering release, the system carries the following constraints:

* **STATELESS EXECUTION:** The system is inherently stateless; data is processed in a transient pipeline and is not persistent across sessions.
* **IN-MEMORY DATA HANDLING:** No database integration is present in v1.0. All candidate objects are managed in volatile memory during the execution lifecycle.
* **API LIMITATIONS:** Scalability is currently bound to personal API quota distributions.

**Note: This is an active project. Further technical iterations will follow.**

---

### V. INITIALIZATION COMMANDS

**01 // [BACKEND]**
```bash
cd backend && npm install
export gemapikey="YOUR_KEY_HERE"
python3 main.py & node server.js
```

**02 // [FRONTEND]**
```bash
cd frontend && npm install
npm run dev
```
---

**AUTHOR // @CutiePatootie420** **CLASSIFICATION // OPEN SOURCE // v1.0**

