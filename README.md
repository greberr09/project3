# project3

This is a team data presentation project to explore electric vehicle use in the United States and worldwide.  The user can examine ev and hybrid sales since 2010, sales of different makes and models of EVs, sales in different countries or a set of regions, changes in electricity and oil use since 2010, and the current charging station infrastructure in the United States.

The application uses javascript, plotly, mongodb, flask chart.js, and leaflet.  The flask app connects to a mongodb database and serves routes that are called from a javascript application to display on the user's screen.

# User notes: 

Ten collections were created and stored in the mongodb "ev_db."  The entire database was exported as "EVDB.gz" in the "input" folder.   Individual json and csv files for each of the collections are also stored in separate subfolder "csv_files" and "json_files".   A mongodb instance must be running on port 27017, the datab imported, and then the flask server "flaskapp.py" started listening on port 8000 before the javascript can be run.  The flaskapp and the index.html main starting page are in the primary directory in the repository.   The ports can be changed by modifying the flaskapp file and the mongod config file.  The mondodb should not be started on the command line manually bound to one port.

The index.html file imports all of the scripts from leaflet, chart.js, and plotly so nothing needs to be installed on the user's machine.

The separate javascript application files are stored in the subfolder "static/js," and the css files in the subfolder "css."  The javascript files are:  "leaflet.js," "bubble2.js", "sales.js", "bar.js," and "energyLine.js".  All are imported at the end of the index.html.

# Citations:

Choropleth code taken from:
https://leafletjs.com/examples/choropleth/

Bind legend and info to layer:
https://gis.stackexchange.com/questions/68941/add-remove-legend-with-leaflet-layers-control

Chart.js 2 axis line chart:
https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

Chart.js chartjs-plugin-annotation:  
https://www.chartjs.org/chartjs-plugin-annotation/latest/guide/configuration.html

Color array:
https://colorbrewer2.org/

Chroma.js Color Palette Helper at https://vis4.net

Python http server:
https://docs.python.org/3/library/http.server.html#http.server.SimpleHTTPRequestHandler


#Data Sources

Zipcode data: The zipcode dataset from this github project is being used for the "zoom to zip" feature on the US map. Resource taken from M Bostock zip visualization.
https://gist.github.com/mbostock/5180185#file-zipcodes-tsv

States geojson: This dataset was organized by Eric Celeste using data from the US Census Bureau. It is a public dataset but it is requested that the Census Bureau be referenced as a resource.
https://eric.clst.org/tech/usgeojson/

State populations:
https://www.statsamerica.org/sip/rank_list.aspx?rank_label=pop1&ct=S18

Charging station data (US Dept of Energy- Alternative Fuels Data Center):
https://afdc.energy.gov/stations/

EV US/Global sales and Oil/Electric offset/increase (International Energy Agency):
https://www.iea.org/data-and-statistics/data-tools/global-ev-data-explorer

EV Registration per state (2022) (US Dept of Energy- Alternative Fuels Data Center):
https://afdc.energy.gov/data/10962

US and world sales history for evs, hybrids, oil and gas usage, and sales share precentages are from IEA's Global EV data explorer
https://www.iea.org/data-and-statistics/data-tools/global-ev-data-explorer

Information about tax credits for EVs in the US was collected from the Congressional Office of Management and Budget, and the IRS, and manually entered into the ev_tax_incentives collection.    See, e.g.,

Congressional Research Service for May 14, 2019
US Department of Energy, ALternativeFuels Center:
https://afdc.energy.gov/laws/409  
https://www.irs.gov/credits-deductions/credits-for-new-clean-vehicles-purchased-in-2023-or-after
Congressional Budget Office, September 2012, "Effects of Federal Tax Credits for the Purchase of Electric Vehicles"

