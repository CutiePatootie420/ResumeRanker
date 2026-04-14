import json
from pathlib import Path
class DataHandler:
    def __init__(self,file_name):
        self.file_name=file_name
        if not Path(self.file_name).exists():
            with open(self.file_name, "w") as f:
                json.dump({},f)
        self.full_map={}
        self.full_df={}
        self.full_idf={}
        self.full_tf_idf={}

    def clean_file(self,file:dict):
        if "name" in file:
            del file["name"]
        if "email" in file:
            del file["email"]
        if "phone" in file:
            del file["phone"]
        return file
    def add_resume(self,key,value):

        with open(self.file_name) as f:
            data=json.load(f)
        data[key]=self.clean_file(value)
        with open(self.file_name,"w") as f:
            json.dump(data,f,indent=2)
    def load_json(self):
        with open(self.file_name) as f:
            data=json.load(f)
        return data