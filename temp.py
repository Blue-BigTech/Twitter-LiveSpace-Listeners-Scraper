import pandas as pd

def fixJson(path):
  df = open(path, 'r', encoding='utf-8')
  dt = df.read()
  df.close()
  rt = dt.replace('\/', '/')
  df = open(path, 'w', encoding='utf-8')
  df.write(rt)
  df.close()

file_path = 'Data/ryan-carson-followers-25763.json'
data_json = pd.read_json(file_path, encoding='utf-8')

real_data = pd.read_json("Data/real-candidates.json", encoding='utf-8')
live_listeners_file_path = 'Data/ryan-carson-followers-1.json'

for record in real_data.iterrows():
  if record[1]['profile_url'] in data_json.values:
    index = data_json['profile_url'] == record[1]['profile_url']
    data_json = data_json.drop(index)
    print(index)
data_json.to_json(live_listeners_file_path, orient="records")
fixJson(live_listeners_file_path)

