// Zipcode Zoom on Map
// Define button and input field for zoom
var btn = document.getElementById("btn");
btn.addEventListener("click", function() {
    // Deliver Zip input
    var zipRead = parseInt(document.getElementById('zip').value);
    console.log("Zip Query", zipRead);
    
    // Look at Zip DB to find coordinates for zip input
    const zipUrl = 'http://127.0.0.1:8000/zip';

    const request = d3.json(zipUrl);
    // Search DB for zipcode match/Return coordinates and zoom to position
    d3.json(zipUrl).then(function(zipData) {
        for (let i = 0; i < zipData.length; i++) {
            if (zipData[i].zip === zipRead) {
                myMap.flyTo([zipData[i].lat, zipData[i].lon], 13);
            }
        }
    });
    // Reset map to center
    var reset = document.getElementById("resize");
    reset.addEventListener("click", function() {
        myMap.flyTo([37.8, -96], 4),
        // clear out input field
        document.getElementById('zip').value=null;
    
    });

});

// Building Choropleth Map

// Creating the map object
let myMap = L.map("map", {
    center: [37.8, -96],
    zoom: 4,

});
// Set base tile layer that will always be present so that toggling to "geojson" does not remove street map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

// Second instance for baselayer toggle (not added at initiation)
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

// Look at population DB and deliver POP/Registration and GEOJSON for states
const popUrl = 'http://127.0.0.1:8000/population';

const popPromise = d3.json(popUrl);
// console.log("Data Promise: ", dataPromise);

// define map
let geojson;

d3.json(popUrl).then(function(data) {

// From Colorbrewer2- define color palette for choropleth
    function getColor(d) {
        return d > 100000 ? '#005a32' :
               d > 50000  ? '#238443' :
               d > 20000  ? '#41ab5d' :
               d > 10000  ? '#78c679' :
               d > 5000   ? '#addd8e' :
               d > 1000   ? '#d9f0a3' :
               d > 500    ? '#f7fcb9' :
                            '#ffffe5';
    }

// Set initial colors for choropleth
    function style(feature) {
        return {
            fillColor: getColor(feature.properties.EV_COUNT),
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: .7
        };
    }
// Function for highlight/info display update
    function highlightFeature(e) {
        var layer = e.target;
        info.update(layer.feature.properties);
    
        layer.setStyle({
            weight: 2,
            color: 'white',
            dashArray: '',
            fillOpacity: 0.5
        });
        // Extra code for browser support from leaflet documentation
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
    // Function to reset highlight
    function resetHighlight(e) {
        info.update();
        geojson.resetStyle(e.target);
    }
    // Listener for highlighting/state data display
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight

        });
    }

    // Define info field to display pop/registrations data for each state
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>EV Registration vs. Population per State (2022)</h4>' +  (props ?
            '<b>' + props.NAME + '</b><br />'+ 'EV Registrations: ' + props.EV_COUNT + '</b><br />'
            + 'Population: ' + props.POP + '</b><br />'+ 'EV registrations per capita: ' + (props.EV_COUNT/props.POP * 100).toFixed(4) + '%'
            :'Hover to view');
    };


    // Add info layer
    info.addTo(myMap);
    
    // Main geoJSON layer to plot coordinates for states
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(myMap);

    // Build the legend based on leaflet example
    var myLegend = L.control({position: 'bottomright'});

        myLegend.onAdd = function (map) {
        
            var div = L.DomUtil.create('div', 'info legend'),
                ev_count = [0, 500, 1000, 5000, 10000, 20000, 50000, 100000],
                labels = [];
            
            div.innerHTML = '<h4>EV Registrations</h4>'
                
        
            // loop through our registration scale and generate a label with a colored square for each interval
            for (var i = 0; i < ev_count.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(ev_count[i] + 1) + '"></i> ' +
                    ev_count[i] + (ev_count[i + 1] ? '&ndash;' + ev_count[i + 1] + '<br>' : '+');
            }
            return div;
        };
    // Add legend to map
    myLegend.addTo(myMap);
    
    // Bind legend and info to "Population/Registration" layer so that they are hidden when layer is changed
    myMap.on('baselayerchange', function (eventLayer) {
        // Switch to the Population legend...
        if (eventLayer.name === 'Population/Registration') {
            myLegend.addTo(myMap);
            info.addTo(myMap);
        
        } else { // Or switch to the Population Change legend...
            myMap.removeControl(myLegend);
            myMap.removeControl(info)
            
        }
    });

});

// Charging Station Marker Cluster Layer
const stationUrl = 'http://127.0.0.1:8000/stations';

const stationPromise = d3.json(stationUrl);
// console.log("Data Promise: ", Promise);

d3.json(stationUrl).then(function(stationData) {
    // console.log("JSON output", stationData);

    // Add group for each charger type
    let teslaGroup = L.markerClusterGroup({showCoverageOnHover:false});
    let jGroup = L.markerClusterGroup({showCoverageOnHover:false});
    let chademoGroup = L.markerClusterGroup({showCoverageOnHover:false});
    let nemaGroup = L.markerClusterGroup({showCoverageOnHover:false});

    // Loop through the data.
    for (let i = 0; i < stationData.length; i++) {
  
      // Set the data location property to a variable.
      let location = stationData[i];
      let charge = location.ev_connector_array
  
      // Check for the location property.
      if (charge.includes("TESLA")) {
      
        // Add a new marker to the cluster group, and bind a popup.
        teslaGroup.addLayer(L.marker([location.latitude, location.longitude])
          .bindPopup('<strong>' + location.station_name + '</strong>' + '</b><br />'+ location.address + '</b><br />' + 
          location.city + ', ' + location.state + ' '+ location.zip + '</b><br />'+ 'Phone: ' + location.phone + 
          '</b><br />' + "Charger Type: " + charge));  
        }
        else if (charge.includes("J1772")) {
  
        // Add a new marker to the cluster group, and bind a popup.
        jGroup.addLayer(L.marker([location.latitude, location.longitude])
        .bindPopup('<strong>' + location.station_name + '</strong>' + '</b><br />'+ location.address + '</b><br />' + 
          location.city + ', ' + location.state + ' '+ location.zip + '</b><br />'+ 'Phone: ' + location.phone + 
          '</b><br />' + "Charger Type: " + charge));     
        }
        else if (charge.includes("CHADEMO")) {
      
        // Add a new marker to the cluster group, and bind a popup.
        chademoGroup.addLayer(L.marker([location.latitude, location.longitude])
        .bindPopup('<strong>' + location.station_name + '</strong>' + '</b><br />'+ location.address + '</b><br />' + 
          location.city + ', ' + location.state + ' '+ location.zip + '</b><br />'+ 'Phone: ' + location.phone + 
          '</b><br />' + "Charger Type: " + charge));   
        }

        else if (charge.includes("NEMA")) {
        
        // Add a new marker to the cluster group, and bind a popup.
        nemaGroup.addLayer(L.marker([location.latitude, location.longitude])
        .bindPopup('<strong>' + location.station_name + '</strong>' + '</b><br />'+ location.address + '</b><br />' + 
          location.city + ', ' + location.state + ' '+ location.zip + '</b><br />'+ 'Phone: ' + location.phone + 
          '</b><br />' + "Charger Type: " + charge));   
        };
    };

    // Set base layer group for map
    let baseLayers = {
        "Population/Registration": geojson,
        "Street View": street
    };

    // Set overlays (charger types)
    let overlays = {
        "Tesla Chargers": teslaGroup,
        "J1772 Chargers": jGroup,
        "Chademo Chargers": chademoGroup,
        "NEMA Chargers": nemaGroup
    };
    
    // Set up layer control
    L.control.layers(baseLayers,  overlays, {style: {fillOpacity: .7}, position: 'topleft', collapsed: false}).addTo(myMap)


});



// Energy 2 axis line chart

// Look at energy DB for oil/electric data
const energyUrl = 'http://127.0.0.1:8000/energy';
// const dataPromise = d3.json(url);
// console.log("Data Promise: ", dataPromise);

d3.json(energyUrl).then(function(data) {
    //  console.log("JSON output", data);

    let years = [];
    let oil = [];
    let elect = [];

    // From each JSON, pull data for x and y and add to lists
     for (let i = 0; i < data.length; i++) {
        let oneYear = data[i].year;
        // Change to negative to reflect decreased usage, change per day to per year
        let oneOil = -(data[i].oil_displacement_mbd)* 365;
        let oneElect = data[i].electricity_demand_gwh;
        years.push(oneYear);
        oil.push(oneOil);
        elect.push(oneElect);
     }

    // Build 2 axis line chart with plotly




//   Bar Chart:  

const worldUrl = 'http://127.0.0.1:8000/sales';


d3.json(worldUrl).then(function(data) {
    // console.log("World info", data);
        
        let countries = []

        for (let j = 0; j < data.length; j++) {
            if (data[j].parameter ==="EV sales" && data[j].powertrain ==="BEV" && data[j].year === 2012) {
                countries.push(data[j].region)
            }
        };

        function getColor(d) {
            return d > 500000 ? '#005a32' :
                   d > 100000  ? '#238443' :
                   d > 50000  ? '#41ab5d' :
                   d > 20000  ? '#78c679' :
                   d > 10000   ? '#addd8e' :
                   d > 5000   ? '#d9f0a3' :
                   d > 1000    ? '#f7fcb9' :
                                '#ffffe5';}

            
        console.log("Counties", countries)
        function init() {
            // Supply first value to render initial charts
            let evSales = [];
            let evYear = [];
            let name = "Australia"
            let newCountry = data.filter(a => a.region === name);
            for (let i = 0; i < newCountry.length; i++) {
                if (newCountry[i].parameter === "EV sales" && newCountry[i].powertrain === "BEV") {
                    evSales.push(newCountry[i].value);
                    evYear.push(newCountry[i].year)
                }
            }
            // var worldSales = []
            // var worldYear = []
            // var worldData = "World"
            // let worldSearch = data.filter(a => a.region === "World");
            // for (let k = 0; k < worldSearch.length; k++) {
            //     if (worldSearch[k].parameter === "EV sales" && worldSearch[k].powertrain === "BEV") {
            //         worldSales.push(worldSearch[k].value);
            //         worldYear.push(worldSearch[k].year)
            //     }
            // }


            console.log("County", newCountry);
            console.log("Sales", evSales);
            console.log("Year", evYear);


     


        
            let trace1 = {
                x: evYear,
                y: evSales,
                text: "Ev Sales",
                type: "bar",
                marker: {
                    color: getColor(evSales[evSales.length-1]),
                    opacity: 1,
                    line: {
                      color: "black",
                      width: .5
                    }
                }
              };

           
          
              let traceData = [trace1];

              var layout = {
                title: {
                    text: 'Annual EV Sales by Country',
                    size: 24
                }

              }
          
              Plotly.newPlot("bar", traceData, layout);
            
              
            
        }
        




// // DOM functions to pull dropdown and update charts
 let selector = d3.select("#selDataset");
         
 countries.forEach((sample) => {
     selector
         .append("option")
         .text(sample)
         .property("value", sample);
 });    


d3.selectAll("#selDataset").on("change", updatePlotly);

// This function is called when a dropdown menu item is selected
function updatePlotly() {
  // Use D3 to select the dropdown menu
  let dropdownMenu = d3.select("#selDataset");
  // Assign the value of the dropdown menu option to a variable
  let name = dropdownMenu.property("value");


  // Find new sample by id in JSON
  let evSales = [];
  let evYear = [];
  let newCountry = data.filter(a => a.region === name);
            for (let i = 0; i < newCountry.length; i++) {
                if (newCountry[i].parameter === "EV sales" && newCountry[i].powertrain === "BEV") {
                    evSales.push(newCountry[i].value);
                    evYear.push(newCountry[i].year)
                }
            }
            console.log("County", newCountry);
            console.log("Sales", evSales);
            console.log("Year", evYear);

            let trace1 = {
                x: evYear,
                y: evSales,
                text: "Ev Sales",
                type: "bar",
                marker: {
                    color: getColor(evSales[evSales.length-1]),
                    opacity: 1,
                    line: {
                      color: "black",
                      width: .5
                    }
                }
                
              };

              let traceData = [trace1];
          
              var layout = {
                title: {
                    text: 'Annual EV Sales by Country',
                    size: 24
                }

              }
          
              Plotly.newPlot("bar", traceData, layout);

        }



init();
});





});



const url = 'http://127.0.0.1:8000/energy';
const dataPromise = d3.json(url);
console.log("Data Promise: ", dataPromise);

d3.json(url).then(function(data) {
     console.log("JSON output", data);

    let years = [];
    let oil = [];
    let elect = [];

     for (let i = 0; i < data.length; i++) {
        let oneYear = data[i].year;
        let oneOil = -(data[i].oil_displacement_mbd)*365;
        let oneElect = data[i].electricity_demand_gwh;
        years.push(oneYear);
        oil.push(oneOil);
        elect.push(oneElect);
     }


console.log(years)
console.log(oil)
console.log(elect)

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2
    var canvas = document.getElementById('myChart');
    new Chart(canvas, {
    type: 'line',
    data: {
        labels: years,
        datasets: [{
        backgroundColor: '#6baed6',
        borderColor: '#4292c6',  
        label: 'Oil Displacement Millions of Barrels',
        yAxisID: 'A',
        data: oil
        }, {
        backgroundColor: '#41ab5d',
        borderColor: '#41ab5d',
        label: 'Electricity Usage increase (gwH)',
        yAxisID: 'B',
        data: elect
        }]
    },
    options: {
        plugins: {
        title: {
            display: true,
            text: 'US Oil Displacement vs. Increased Electricity Demand',
            },
        },
        animation: {
            duration: 10000,
        },
        scales: {
        A: {
            id: 'A',
            type: 'linear',
            position: 'left',
            ticks: {
                max: 0,
                min: -.15
            }
        }, 
        B: {
            id: 'B',
            type: 'linear',
            position: 'right',
            ticks: {
            max: 16000,
            min: 0
            }
        }
        }
    }
    });

});