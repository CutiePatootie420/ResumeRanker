import sys
import os
import json
import math
import xxhash
from dotenv import load_dotenv

# Resolve paths relative to this script's location (worker/), not the terminal cwd
WORKER_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(WORKER_DIR)
RESUME_FOLDER = os.path.join(WORKER_DIR, "resume_folder")
DATA_FILE = os.path.join(WORKER_DIR, "resumes.json")

# Ensure worker-local modules can be imported regardless of cwd
sys.path.insert(0, WORKER_DIR)

# Load .env from project root
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

from api import API_CALL
from DataHandling import DataHandler
from tf_idf import JOB, TF_IDF

prompt="""You are a resume information extractor.

Extract structured data from the resume and return ONLY valid JSON following this schema.

Rules:
- Output JSON only. No explanations.
- Use concise technical keywords, not sentences.
- Remove duplicate skills.
- Normalize experience duration to total months.
- Use null for missing fields.
- Prefer technical tools, frameworks, languages, and measurable impacts.

Schema:

{
"name": "",
"email": "",
"phone": "",
"skills": [],
"experience": [
{
"company": "",
"role_keywords": [],
"skills": [],
"duration_months": 0,
"impact_keywords": []
}
],
"projects": [
{
"skills": [],
"domain_keywords": [],
"skill_intensity_score": 0
}
]
}

Field notes:
- skills: distinct technical tools, languages, frameworks, databases, cloud platforms.
- role_keywords: short roles (backend, frontend, fullstack, ml, data-engineering, mobile, devops, cloud).
- impact_keywords: measurable/technical outcomes (e.g. 50k_users, low_latency, automation, scaling).
- projects.domain_keywords: domains like mobile_app, ai, cloud, iot, web_platform.
- projects.skill_intensity_score: integer 0–100 estimating how heavily listed skills were used.

If extraction fails, return the schema with null values without modifying the structure."""


class Pipeline:
    def __init__(self, key, pdf_dir_path, model, data_file_name):
        self.api = API_CALL(key, pdf_dir_path, model)
        self.data_handler = DataHandler(data_file_name)
        self.vectorizer = TF_IDF()
        self.job = None

    def initialise_job(self, job_requirements):
        job_requirements = {"requirements": self.vectorizer.extract_words_from_file(job_requirements)}
        temp = self.data_handler.load_json()
        self.job = JOB(len(temp), job_requirements, temp)

    def give_prompt(self, prompt: str):
        self.api.prompt = prompt

    def get_response(self):
        self.api.generate_response()
        for k, v in self.api.response_text_dict.items():
            self.data_handler.add_resume(k, v)

    def make_maps_for_json(self):
        self.job.file_contents = self.data_handler.load_json()
        self.job.total_resumes = len(self.job.file_contents)
        
        for k, v in self.job.file_contents.items():
            self.data_handler.full_map[k] = self.vectorizer.word_frequency_map_for_file(v)
        for file in self.data_handler.full_map.keys():
            for key in self.data_handler.full_map[file].keys():
                self.data_handler.full_df[key] = self.data_handler.full_df.get(key, 0) + 1
        self.data_handler.full_idf = {
            k: (math.log((1 + self.job.total_resumes) / (1 + v)) + 1)
            for k, v in self.data_handler.full_df.items()
        }
        self.data_handler.full_tf_idf = {
            k: self.vectorizer.file_tfidf(
                self.job.file_contents[k], self.job.total_resumes, self.data_handler.full_map
            )
            for k in self.data_handler.full_map.keys()
        }
        
        # Crucial missing step from original script: Calculate TF-IDF for the Job Requirements itself
        self.job.job_tf_idf = self.vectorizer.file_tfidf(
            self.job.requirements, self.job.total_resumes, self.data_handler.full_map
        )
        
        self.job.cosine_similarity = {}
        for file in self.data_handler.full_tf_idf:
            numerator = sum(self.job.job_tf_idf.get(k, 0) * self.data_handler.full_tf_idf[file].get(k, 0) for k in self.job.job_tf_idf)
            den1 = sum(v * v for v in self.data_handler.full_tf_idf[file].values())
            den2 = sum(v * v for v in self.job.job_tf_idf.values())
            
            if den1 == 0 or den2 == 0:
                self.job.cosine_similarity[file] = 0.0
            else:
                self.job.cosine_similarity[file] = numerator / (math.sqrt(den1) * math.sqrt(den2))

    def set_rate_limits(self, limit):
        self.api.rpm_limit = limit

    def run_pipeline(self, job_requirements, prompt):
        self.initialise_job(job_requirements)
        self.give_prompt(prompt)
        self.set_rate_limits(14)
        self.get_response()
        self.make_maps_for_json()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 pipeline_worker.py \"keyword1 keyword2 ...\"", file=sys.stderr)
        sys.exit(1)

    keywords = sys.argv[1]
    requirements = [keywords]

    # Absolute path to output file
    data_file = DATA_FILE

    # Reset resumes.json for a fresh run
    with open(data_file, "w") as f:
        json.dump({}, f)

    pipeline = Pipeline(
        os.getenv("gemapikey"),
        WORKER_DIR,
        "gemini-3.1-flash-lite-preview",
        data_file,
    )
    pipeline.run_pipeline(requirements, prompt)

    # Build ranked results from cosine similarity scores
    results = []
    job_req_keys = set(pipeline.job.job_tf_idf.keys())
    
    # Reverse hash map for job requirements
    hash_to_word = {
        xxhash.xxh64(w).intdigest(): w 
        for w in pipeline.job.requirements.get("requirements", [])
    }

    for file_path, score in pipeline.job.cosine_similarity.items():
        fname = os.path.basename(str(file_path))
        
        match_breakdown = {}
        file_tf_idf = pipeline.data_handler.full_tf_idf.get(file_path, {})
        for word_hash in job_req_keys:
            v_score = file_tf_idf.get(word_hash, 0) * pipeline.job.job_tf_idf.get(word_hash, 0)
            if v_score > 0:
                actual_word = hash_to_word.get(word_hash, str(word_hash))
                match_breakdown[actual_word] = round(v_score, 4)
                
        sorted_matches = sorted(match_breakdown.items(), key=lambda x: x[1], reverse=True)
        top_matches = dict(sorted_matches[:5])
        raw_extraction = pipeline.job.file_contents.get(str(file_path), {})

        results.append({
            "file": fname,
            "score": round(score, 4),
            "top_matches": top_matches,
            "vector_breakdown": match_breakdown,
            "raw_extraction": raw_extraction
        })

    # Sort descending by score
    results.sort(key=lambda x: x["score"], reverse=True)

    # Write ranked results to resumes.json
    with open(data_file, "w") as f:
        json.dump(results, f, indent=2)

    print(json.dumps(results, indent=2))
    print("WORKER_COMPLETE")
