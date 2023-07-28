const url = "http://127.0.0.1:8000/model";

const dataPromise = d3.json(url);
console.log("Data Promise: ", dataPromise);

function cleanAndConvertToNumber(str) {
  const cleanConvertedStr =
    str.trim() === "-" ? 0 : parseInt(str.replace(/,/g, "").trim());
  return cleanConvertedStr;
}
function reduceData(data, numCars) {
  data.sort((a, b) => b.Total - a.Total);
  return data.slice(0, numCars);
}

function parseData(data) {
  let years = [];
  for (let year = 1999; year <= 2019; year++) {
    years.push(year);
  }
  let newData = data.map((obj) => {
    return years.map((year) => {
      let y = obj[year];
      if (typeof y === "number") {
        // Do nothing, y is already a number
      } else if (typeof y === "string") {
        y = cleanAndConvertToNumber(y);
      } else {
        y = 0;
      }
      return {
        x: year,
        y: y,
        r: y / 3000,
      };
    });
  });
  return {
    newData,
    labels: data.map((obj) => obj["Vehicle"]),
  };
}

d3.json(url).then(function (data) {
  console.log("JSON output", data);
  // Convert Total fields to numeric value if necessary
    data.forEach((item) => {
        if (typeof item.Total === "string") {
            item.Total = cleanAndConvertToNumber(item.Total);
        }
    });
    let reducedData = reduceData(data, 10);
    console.log("reducedData", reducedData);
    console.log("Parsed data", parseData(reducedData));
    let { newData, labels } = parseData(reducedData);
    console.log("newData", newData);
    let bubbleData = newData.map((vehicle, index) => {
        return {
            label: labels[index],
            data: vehicle,
            backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255
                }, 0.3)`,
        };
    });
    console.log("bubbleData", bubbleData);


  let ctx = document.getElementById("bubbleChart").getContext("2d");
  let myChart = new Chart(ctx, {
        type: "bubble",
        data: {
            datasets: bubbleData,
        },
        options: {
            interaction: {
                mode: "dataset",
            },
            plugins: {
                title: {
                    display: true,
                    text: "Electric Vehicle Sales per Year by Make & Model (Top 10 Vehicles)",
                    font: {
                        size: 25,
                    },
                },
                legend: {
                    labels: {
                        boxWidth: 10,
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(255, 255, 204, .5)",
                    titleColor: "black",
                    bodyColor: "black",
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || "";
                            let xLabel = context.parsed.x;
                            let yLabel = context.parsed.y.toLocaleString();
                            return label + ": " + yLabel + " were sold in " + xLabel;
                        },
                    },
                },
            },
            clip: 0,
            aspectRatio: 1.5,
            elements: {
                point: {
                    hoverBackgroundColor: "rgba(100, 100, 100, .5)",
                    hoverRadius: 20,
                },
            },
            scales: {
                x: {
                    min: 2000,
                    ticks: {
                        callback: function (value, index, values) {
                            return value.toString();
                        },
                        font: {
                            size: 16,
                        },
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Cars Sold",
                        font: {
                            size: 18,
                        },
                    },
                    ticks: {
                        font: {
                            size: 16,
                        },
                    },
                },
            },
         },
  });
});
  
