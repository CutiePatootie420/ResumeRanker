from google import genai
from google.genai import types
from google.genai.errors import ClientError,ServerError
import time
from pathlib import Path
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
        self.input_tokens=0
        self.output_tokens=0
        self.rpm_limit=None
    def give_prompt(self,temp:str):
        self.prompt=temp
    def generate_response(self,print_status=True):
        if isinstance(self.rpm_limit,int):
            rpm_delay=60/self.rpm_limit
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
                        self.input_tokens+=temp_response.usage_metadata.prompt_token_count
                        self.output_tokens+=temp_response.usage_metadata.candidates_token_count
                        self.response_dict[file]=temp_response
                        self.response_text_dict[file]=temp_response.text
                        end=time.perf_counter()
                        if isinstance(self.rpm_limit,int) and ((end-start)<rpm_delay):
                            time.sleep(rpm_delay-(end-start))
                        elapsed=time.perf_counter()-start
                        if(print_status):
                            print(f"{elapsed}s for {file}")
                        break
                except (ClientError, ServerError) as error:
                    print(f"Rate ceiling hit. Delaying by {delay} s for {file}.pdf...")
                    time.sleep(delay)
                    delay *= 2




