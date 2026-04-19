from os.path import split
from pathlib import Path
BASE_DIR=Path.cwd()
PDF_DIR=BASE_DIR/"resume_folder"


import fitz
sample_2=fitz.open(PDF_DIR/"2.pdf")

for page in sample_2:
    blocks=page.get_text("blocks")
    for block in blocks:
        print(block)
        print("")

import  re
def extract_blocks(pdf_path):
    blocks=[]
    doc=fitz.open(pdf_path)
    for page in doc:
        temp=page.get_text("blocks")
        temp.sort(key=lambda x: (x[1],x[0]))
        blocks.extend(temp)
    return blocks

def clean_text(text):
    text=" ".join(text.split())
    text = re.sub(r"[^\w\s#+.]", " ", text)
    return text.lower()

def split_columns(blocks,threshold=300):
    left=[]
    right=[]
    for b in blocks:
        if b[0]<threshold:
            left.append(b)
        else:
            right.append(b)
    left.sort(key=lambda x: x[1])
    right.sort(key=lambda x: x[1])
    return left+right

def extract_sections(blocks):
    sections={"skills":[],"experience":[],"education":[],"projects":[]}
    current=None
    for b in blocks:
        text=clean_text(b[4])
        if not text:
            continue
        if "skill" in text:
            current="skills"
            continue
        elif "education" in text:
            current="education"
            continue
        elif "experience" in text:
            current="experience"
            continue
        elif "project" in text:
            current="projects"
            continue
        if current:
            sections[current].append(text)
    return sections

def extract_skills(text):
    text=" ".join(text)
    tokens = re.split(r"[,\n/]", text)
    skills = []
    for t in tokens:
        t = t.strip()
        if len(t) > 1:
            skills.append(t)
    return list(set(skills))

def parse_resume(path):
    blocks=extract_blocks(path)
    blocks=split_columns(blocks)
    sections=extract_sections(blocks)
    return {
        "skills": extract_skills(sections["skills"]),
        "experience": " ".join(sections["experience"]),
        "education": " ".join(sections["education"]),
        "projects": " ".join(sections["projects"]),
    }

sample_2=parse_resume(PDF_DIR/"2.pdf")
sample_2

