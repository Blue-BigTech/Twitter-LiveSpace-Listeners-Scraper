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

printTime()
cnt = 0
valid = 0
for person in data_json.iterrows():
  cnt += 1
  position = person[0]
  profile_url = person[1]['profile_url']
  username = person[1]['username']
  print(profile_url)
  html_doc = getHTMLDocumentbyWebDriver(profile_url)
  # writeTxt(html_doc)
  if html_doc.find('daily dose') != -1 or html_doc.find('#dailydose') != -1 or html_doc.find('ryan carson') != -1 or html_doc.find('ryancarson') != -1:
    valid += 1

  print('Checked : ', cnt, ' Valid : ', valid)
  # if cnt == 10:
  #   break
printTime()


# print(os.getenv('test'))
quit()

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# file_path = 'Data/ryan-carson-followers-124494.json'

data_txt = None
data_json = pd.read_json(file_path, encoding='utf-8')

#Set up the webdriver
options = Options()
# options.add_argument("--headless")
options.add_argument("--window-size=1920, 1200")
options.add_experimental_option("excludeSwitches", ['enable-automation'])
# driver = webdriver.Chrome(service_args=['--executable-path=path/to/chromedriver'])
driver = webdriver.Chrome(options=options)

valid_listeners_file_path = 'Data/Valid-listeners-List.json'

cnt = 0
valid = 0
for person in data_json.iterrows():
  cnt += 1
  position = person[0]
  pro_url = person[1]['profile_url']
  username = person[1]['username']
  print(pro_url)
  driver.get(pro_url)
  
  wait = WebDriverWait(driver, 10)
  tweet_elem_xpath = '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[3]/div/div/section/div/div'
  try :
    wait.until(EC.presence_of_element_located((By.XPATH, tweet_elem_xpath)))
    tweet_elem = driver.find_element(By.XPATH, tweet_elem_xpath)
    children_tweet_elem = tweet_elem.find_elements(By.XPATH, "./child::*")
    for elem in children_tweet_elem:
      item_tweet_txt = elem.text.lower()
      if item_tweet_txt.find('daily dose') != -1 or item_tweet_txt.find('#dailydose') != -1 or item_tweet_txt.find('ryan carson') != -1 or item_tweet_txt.find('ryancarson') != -1:
        valid += 1
        valid_listeners_json = pd.read_json(valid_listeners_file_path, encoding='utf-8')
        valid_listeners_json.loc[len(valid_listeners_json), ['profile_url', 'username']] = pro_url, username
        
        valid_listeners_json.to_json(valid_listeners_file_path, orient='records')

        print("Valid Users : ", valid)
        break
  except :
    print("Access Error")
  print("Number of Checked Followers : ", cnt)
  #   break
# hlist = ["profile_url", "profile_name", "username", "joindate", "location", "Tweets", "followers", "following", "verified_blue_badge", "AccountVerified", "favourites_count", "profile_image_url", "profile_banner", "profile_attached_link", "description"]
driver.quit()

