
# python -m http.server --bind 127.0.0.1
# pip install flask-pymongo
# pip install flask-cors

# https://pythonbasics.org/webserver/
# https://stackoverflow.com/questions/28461001/python-flask-cors-issue

# Setting up flask in vscode
# https://code.visualstudio.com/docs/python/tutorial-flask


# d3 request syntax:

# const url = 'http://127.0.0.1:8000/model';

# const dataPromise = d3.json(url);
# console.log("Data Promise: ", dataPromise);

# d3.json(url).then(function(data) {
#     console.log("JSON output", data);


from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, support_credentials=True)

app.config["MONGO_DBNAME"] = "ev_db"
app.config["MONGO_URI"] = "mongodb://localhost:27017/ev_db"

mongo = PyMongo(app)

# ev_sales_by_model url = 'http://127.0.0.1:8000/model'
@app.route('/model', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_model():
	salesByModel = mongo.db.ev_sales_by_model
	sales = []
	sale = salesByModel.find()
	for j in sale:
		j.pop('_id')
		sales.append(j)
	return jsonify(sales)


# ev_registration_counts_by_state url = 'http://127.0.0.1:8000/count'
@app.route('/count', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_state():
	countsByState = mongo.db.ev_registration_counts_by_state
	counts = []
	count = countsByState.find()
	for j in count:
		j.pop('_id')
		counts.append(j)
	return jsonify(counts)	

# historical_ev_car_sales url = 'http://127.0.0.1:8000/sales'
@app.route('/sales', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_hsales():
	historicalSales = mongo.db.historical_ev_car_sales
	hsales = []
	histsale = historicalSales.find()
	for j in histsale:
		j.pop('_id')
		hsales.append(j)
	return jsonify(hsales)	

# ev_tax_incentives url = 'http://127.0.0.1:8000/tax'
@app.route('/tax', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_tax():
	taxIncent = mongo.db.ev_tax_incentives
	taxList = []
	tax = taxIncent.find()
	for j in tax:
		j.pop('_id')
		taxList.append(j)
	return jsonify(taxList)	
	

# alt_fuel_stations_update url = 'http://127.0.0.1:8000/stations'
@app.route('/stations', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_stations():
	stations = mongo.db.alt_fuel_stations_update
	stationsList = []
	station = stations.find()
	for j in station:
		j.pop('_id')
		stationsList.append(j)
	return jsonify(stationsList)	



if __name__ == "__main__":
  app.run(port=8000, debug=True)

