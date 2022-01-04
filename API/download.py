import json
import os
from urllib.request import Request, urlopen, HTTPError, URLError
from os.path import basename, exists
import shutil
from http.client import IncompleteRead

f = open('download.json')

"""
   First, I will download images in separate folders inside downloads folder
"""

# load the urls
data = json.load(f)
# cwd = os.getcwd()
# check if downloads folder already exists
if(os.path.isdir("./downloads")):
    shutil.rmtree('./downloads')
    os.mkdir("downloads")
else:
    # create a new directory in current working directory
    os.mkdir("downloads")

# traverse the urls
for query in data["links"]:
    # needed for file names
    i = 0
    # create folder with query names
    os.mkdir(f'./downloads/{query}')
    for link in data["links"][query]:
        print(link)
        try:
            # choose extensions
            imageName = ""
            if ".png" in link.lower():
                imageName += str(i+1) + ".png"
            elif ".jpg" in link.lower():
                imageName += str(i+1) + ".jpg"
            elif ".gif" in link.lower():
                imageName += str(i+1) + ".gif"
            elif ".svg" in link.lower():
                imageName += str(i+1) + ".svg"
            elif ".webp" in link.lower():
                imageName += str(i+1) + ".svg"
            else:
                imageName += str(i+1) + ".jpeg"
            fs = open(f"./downloads/{query}/{imageName}", 'wb')
            req = Request(link, headers={'User-Agent': 'Mozilla/5.0'})
            fs.write(urlopen(req, timeout=7).read())
            fs.close()
        except ValueError as e:
            print(link + ": " + str(e))
            continue
        except HTTPError as e:
            print(link + ": " + str(e))
            continue
        except URLError as e:
            print(link + ": " + str(e))
            continue
        except Exception as e:
            print(link + ": " + str(e))
            continue
        except IncompleteRead as e:
            print(link + ":" + str(e))
            continue
        i+=1

def removeFile(filename, dir):
    os.remove()

# if old zip file exists, delete it first
if exists("./downloads.zip"):
    os.remove("./downloads.zip")


# zip downloads folder
shutil.make_archive("downloads", 'zip', "./downloads")
shutil.rmtree('./downloads')  

f.close()
