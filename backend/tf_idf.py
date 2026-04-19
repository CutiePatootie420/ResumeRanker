import xxhash
import math
class TF_IDF:
    def __init__(self):
        pass
    def extract_words_from_file(self,file):
        my_list = []
        if file is None:
            return my_list
        if isinstance(file, str):
            return file.lower().split()
        elif isinstance(file, dict):
            for value in file.values():
                my_list.extend(self.extract_words_from_file(value))
            return my_list
        elif isinstance(file, list):
            for value in file:
                my_list.extend(self.extract_words_from_file(value))
            return my_list
        return my_list

    def word_frequency_map_for_file(self,file):
        map = {}
        word_list = self.extract_words_from_file(file)
        for word in word_list:
            temp = xxhash.xxh64(word).intdigest()
            if temp in map.keys():
                map[temp]+=1
            else:
                map[temp]=1
        return map
    def total_words_in_map(self,map: dict):
        return sum(value for value in map.values())

    def word_tf(self,word: str, map: dict):
        temp=xxhash.xxh64(word).intdigest()
        if temp not in map:
            return 0
        return (map[temp]/self.total_words_in_map(map))

    def file_tf(self,sample: dict):
        sample_tf = {}
        sample_map = self.word_frequency_map_for_file(sample)
        sample_words = self.extract_words_from_file(sample)
        for word in sample_words:
            sample_tf[xxhash.xxh64(word).intdigest()]=self.word_tf(word, sample_map)
        return sample_tf

    def file_df(self,sample: dict, all_maps_dict):
        sample_map = self.word_frequency_map_for_file(sample)
        sample_df = {k: 0 for k in sample_map.keys()}
        for file in all_maps_dict:
            for key in all_maps_dict[file]:
                if key in sample_map:
                    sample_df[key] += 1
        return sample_df

    def file_idf(self,sample: dict, total_resumes: int, all_maps_dict: dict):
        sample_df = self.file_df(sample, all_maps_dict)
        sample_idf = {k: (math.log((1 + total_resumes) / (1 + x)) + 1) for k, x in sample_df.items()}
        return sample_idf

    def file_tfidf(self,sample: dict, total_resumes: int, all_maps_dict: dict):
        sample_tf = self.file_tf(sample)
        sample_idf = self.file_idf(sample, total_resumes, all_maps_dict)
        return {k: sample_tf[k] * sample_idf[k] for k in sample_tf.keys()}

class JOB:
    def __init__(self,total_resumes,requirements,file_contents):
        self.total_resumes=total_resumes
        self.requirements=requirements
        self.file_contents=file_contents
        self.job_tf_idf={}
        self.cosine_similarity={}