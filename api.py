from google import genai
from google.genai import types
from google.genai.errors import ClientError
import time
from pathlib import Path
import os
from dotenv import load_dotenv
class API_CALL:
    def __init__(self,key,pdf_dir,model=None):
        self.model=model
        self.__key=key
        self.client=genai.Client(api_key=self.__key)
        self.pdf_dir=Path(pdf_dir)/"resume_folder"
        self.response=None
        self.prompt=None
        self.response_dict={}
        self.response_text_dict={}
    def give_prompt(self,temp:str):
        self.prompt=temp
    def generate_response(self,print_status=True):
        if isinstance(self.pdf_dir, str):
            self.pdf_dir=Path(self.pdf_dir)
        for file in self.pdf_dir.glob("*.pdf"):
            delay = 5
            while True:
                try:
                    if file.is_file():
                        start=time.perf_counter()
                        with open(file,"rb") as temp:
                            temp_bytes=temp.read()
                        temp_response=self.client.models.generate_content(model=self.model,contents=[self.prompt,types.Part.from_bytes(data=temp_bytes,mime_type="application/pdf")])
                        self.response_dict[file]=temp_response
                        self.response_text_dict[file]=temp_response.text
                        end=time.perf_counter()
                        if(print_status):
                            print(f"{end - start}s for {file}")
                            break
                except ClientError as error:
                    if "RESOURCE_EXHAUSTED" in str(error):
                        print(f"Rate ceiling hit. Delaying by {delay} s for {file}.pdf...")
                        time.sleep(delay)
                        delay *= 2
                    else:
                        raise
load_dotenv()
test=API_CALL(os.getenv("gemapikey"),Path.cwd(),"gemini-2.5-flash-lite")
prompt="""You are a resume information extractor.

Extract structured information from the provided resume and return ONLY valid JSON following the exact schema below.

IMPORTANT RULES:

1. Output MUST be valid JSON only. No explanations.
2. Use short keywords instead of sentences wherever possible.
3. Skills must be concise technical keywords.
4. Remove duplicate skills.
5. Normalize experience duration to total months.
6. If a field is missing, return null.
7. Do NOT include long descriptions or paragraphs.
8. Prefer technical terms, tools, frameworks, languages, and measurable impacts.

JSON SCHEMA:

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

FIELD DEFINITIONS:

skills:
List of distinct technical keywords such as programming languages, frameworks, databases, cloud platforms, tools.

role_keywords:
Short role descriptors such as backend, frontend, fullstack, ML, data-engineering, mobile, devops, cloud.

impact_keywords:
Short measurable or technical outcomes such as:
["50k_users", "85_percent_efficiency", "low_latency", "automation", "scaling"]

projects.skills:
Technical skills used in the project.

projects.domain_keywords:
Short domain indicators such as:
["mobile_app", "ai", "cloud", "iot", "web_platform"]

projects.skill_intensity_score:
Integer from 0–100 estimating how heavily the listed skills were used in the project.

Return ONLY the JSON object. If output cannot strictly follow the schema, return null values but never modify the schema structure.
"""
test.give_prompt(prompt)
test.generate_response()



