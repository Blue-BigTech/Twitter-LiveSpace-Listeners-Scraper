from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import requests
import re
from dotenv import load_dotenv
import pandas as pd
import os
from datetime import datetime

#Set up the webdriver
options = Options()
options.add_argument("--headless")
options.add_argument("--window-size=1920, 1200")
options.add_experimental_option("excludeSwitches", ['enable-automation'])
browser = webdriver.Chrome(options=options)
wait = WebDriverWait(browser, 10)

def getHTMLdocument(url):
  response = requests.get(url)
  return response.text.lower()

def getHTMLDocumentbyWebDriver(url):
  browser.get(url)
  tweet_3rd_elem_xpath = '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/section/div/div/div[1]'
  try:
    wait.until(EC.presence_of_element_located((By.XPATH, tweet_3rd_elem_xpath)))
  except:
    print ("No Element")
  return browser.page_source

def fixJson(path):
  df = open(path, 'r', encoding='utf-8')
  dt = df.read()
  df.close()
  rt = dt.replace('\/', '/')
  df = open(path, 'w', encoding='utf-8')
  df.write(rt)
  df.close()

def writeTxt(content):
  df = open('Data/debug.txt', 'w', encoding='utf-8')
  df.write(content)
  df.close()

def printTime():
  now = datetime.now()
  current_time = now.strftime("%H:%M:%S")
  print("Current Time = ", current_time)

load_dotenv()

print("Loading Ryan Carson Followers----")
file_path = 'Data/real-candidates.json'
# file_path = 'Data/ryan-carson-followers-1.json'
data_txt = None
data_json = pd.read_json(file_path, encoding='utf-8')
print("Loading Done")

listener_json = pd.read_json("Data/grabbed-live-listeners-List.json", encoding='utf-8')

printTime()
cnt = 0
valid = 0
content = ""
for person in data_json.iterrows():
  cnt += 1
  position = person[0]
  profile_url = person[1]['profile_url']
  username = person[1]['username']
  # print(profile_url)
  html_doc = getHTMLDocumentbyWebDriver(profile_url)
  # writeTxt(html_doc)
  if html_doc.find('daily dose') != -1 or html_doc.find('#dailydose') != -1 or html_doc.find('ryan carson') != -1 or html_doc.find('ryancarson') != -1:
    if valid < 516:
      valid += 1
      index = data_json['profile_url'] == profile_url
      listener_json.loc[len(listener_json)] = ["Ryan Carson", profile_url, ""]
      print(profile_url)

  print('Valid : ', valid)
  # if cnt == 10:
  #   break
printTime()
browser.quit()

file_path = "Data/final-listeners.json"
listener_json.to_json(file_path, orient="records")
fixJson(file_path)

