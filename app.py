from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'lendingclub'
COLLECTION_NAME = 'loans'
FIELDS = {'issue_d':True,'loan_amnt': True, 'int_rate': True, 'grade': True, 'loan_status': True, 'addr_state': True, '_id': False}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/lendingclub/loans")
def lendingclub_projects():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS, limit=40000)
    #projects = collection.find(projection=FIELDS)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
