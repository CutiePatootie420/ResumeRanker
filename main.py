from dotenv import load_dotenv
from api import API_CALL
import os
from pathlib import Path
from DataHandling import DataHandler
from tf_idf import JOB, TF_IDF
import math
load_dotenv()
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
    def __init__(self,key,pdf_dir_path,model,data_file_name):
        self.api=API_CALL(key,pdf_dir_path,model)
        self.data_handler=DataHandler(data_file_name)
        self.vectorizer=TF_IDF()
        self.job=None
    def initialise_job(self,job_requirements):
        job_requirements = {"requirements": self.vectorizer.extract_words_from_file(job_requirements)}
        temp = self.data_handler.load_json()
        self.job = JOB(len(temp), job_requirements, temp)
    def give_prompt(self,prompt:str):
        self.api.prompt=prompt
    def get_response(self):
        self.api.generate_response()
        for k,v in self.api.response_text_dict.items():
            self.data_handler.add_resume(k,v)
    def make_maps_for_json(self):
        for k,v in self.job.file_contents.items():
            self.data_handler.full_map[k]=self.vectorizer.word_frequency_map_for_file(v)
        for file in self.data_handler.full_map.keys():
            for key in self.data_handler.full_map[file].keys():
                self.data_handler.full_df[key] = self.data_handler.full_df.get(key, 0) + 1
        self.data_handler.full_idf = {k: (math.log((1 + self.job.total_resumes) / (1 + v)) + 1) for k, v in self.data_handler.full_df.items()}
        self.data_handler.full_tf_idf = {k: self.vectorizer.file_tfidf(self.job.file_contents[k], self.job.total_resumes, self.data_handler.full_map) for k in self.data_handler.full_map.keys()}
        self.job.cosine_similarity={file: sum(self.job.job_tf_idf[k]*self.data_handler.full_tf_idf[file].get(k, 0) for k in self.job.job_tf_idf) / ((math.sqrt(sum(v * v for v in self.data_handler.full_tf_idf[file].values()))) * (math.sqrt(sum(v * v for v in self.job.job_tf_idf.values())))) for file in self.data_handler.full_tf_idf}
    def set_rate_limits(self,limit):
        self.api.rpm_limit=limit
    def run_pipeline(self,job_requirements,prompt):
        self.initialise_job(job_requirements)
        self.give_prompt(prompt)
        self.set_rate_limits(14)
        self.get_response()
        self.make_maps_for_json()
swe_pipeline=Pipeline(os.getenv("gemapikey"),Path.cwd(),"gemini-3.1-flash-lite-preview","resumes.json")
swe_requirements=["python java c++ javascript data structures algorithms backend development rest apis microservices sql postgresql mysql redis mongodb aws azure gcp docker kubernetes terraform ci cd github git system design distributed systems testing unit integration scalability performance optimization"]
swe_pipeline.run_pipeline(swe_requirements,prompt)


