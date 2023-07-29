//   Bar Chart:  

const worldUrl = 'http://127.0.0.1:8000/sales';


d3.json(worldUrl).then(function(data) {

    // Build total country list and 2022 world info    
        let countries = []
        
        // country list
        for (let j = 0; j < data.length; j++) {
            if (data[j].parameter ==="EV sales" && data[j].powertrain ==="BEV" && data[j].year === 2012) {
                countries.push(data[j].region)
            }
        };
        

        // Build color pallette to match map and reflect totals
        function getColor(d) {
            return d > 500000 ? '#005a32' :
                   d > 100000  ? '#238443' :
                   d > 50000  ? '#41ab5d' :
                   d > 20000  ? '#78c679' :
                   d > 10000   ? '#addd8e' :
                   d > 5000   ? '#d9f0a3' :
                   d > 1000    ? '#f7fcb9' :
                                '#ffffe5';}

        // Build initial display 
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

            // build new plot for each country selected
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






