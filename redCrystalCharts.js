var currentDate = new Date();
  const unixTimeRounded = Math.floor(currentDate.getTime() / 100000) * 100000
  var oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 1);
  const oldUnixTimeRounded = Math.floor(oldDate.getTime() / 100000) * 100000
  var options = {
    chartArea: {
      //width: '80%',
      //height: '70%',
      //top: 60,
      bottom: '10%',
      left: '10%',
      right: '0%',
      top: '10%'
    },
    legend: 'none',
    series: { 
      0: { color: '#f3ba50'}
    },
    // chartArea: {
    backgroundColor: {
      fill: '#161b27',
    },
    lineWidth: 3,
    // }
    hAxis: {
      textStyle: {
        color: '#726990'
      },    
      textPosition: 'none',
    },
    vAxis: {
      textStyle: {
        color: '#726990'
      },
      gridlines: {
        color: '#726990'
      },
      minorGridlines: {
        count: 0,  
      },    
    },
    tooltip: {
      isHtml: true
    }
  };
  var currentDay = currentDate.getDay();
  if (currentDay == 0) {
    currentDay = "Sunday"
  } else if (currentDay == 1) {
    currentDay = "Monday"
  } else if (currentDay == 2) {
    currentDay = "Tuesday"
  } else if (currentDay == 3) {
    currentDay = "Wednesday" 
  } else if (currentDay == 4) {
    currentDay = "Thursday"
  } else if (currentDay == 5) {
    currentDay = "Friday"
  } else if (currentDay == 6) {
    currentDay = "Saturday"
  } else {
    console.log("Error getting the day")
  }
  var todaysDate = currentDate.getDate().toString() + "/" + currentDate.getMonth().toString() + "/" + currentDate.getFullYear().toString()
  document.getElementById("marketcap-date").innerHTML = currentDay + ", " + todaysDate
	var xanoDataResponse = fetch("https://x8ki-letl-twmt.n7.xano.io/api:-TxV7DQs/coinmarketcap")
  	.then(response => response.json())
    .then(data => {
      // toLocaleString adds commas to the numbers
      //console.log(data.cap.toLocaleString())
      document.getElementById("marketcap-number").innerHTML = "$" + data.cap.toLocaleString()
      var marketcapChange = data.cap - data.market_cap_yesterday
      //console.log(typeof(data.percentageChange))
      //console.log(data.percentageChange)
      if (data.percentageChange > 0) {
        document.getElementById("marketcap-change").style.color = "#6ae584"
        document.getElementById("marketcap-change").innerHTML = "+" + marketcapChange.toLocaleString() + " (" + data.percentageChange.toFixed(2).toString() + "%)"
      } else {
        document.getElementById("marketcap-change").style.color = "red"
        document.getElementById("marketcap-change").innerHTML = marketcapChange.toLocaleString() + " (" + data.percentageChange.toFixed(2).toString() + "%)"
      }
     });
	var btcRecent = fetch("https://api.coincap.io/v2/assets/bitcoin")
  .then(btcRecentResponse => btcRecentResponse.json())
  .then(data => {
    btcPrice = Number(data.data.priceUsd)
    btcChangePercent24Hr = Number(data.data.changePercent24Hr)
    document.getElementById("bitcoin-price").innerHTML = "$" + btcPrice.toLocaleString()
    if (data.data.changePercent24Hr > 0) {
      document.getElementById("bitcoin-change").style.color = "#6ae584"
      document.getElementById("bitcoin-change").innerHTML = "+" + Number(btcChangePercent24Hr * btcPrice/100).toLocaleString() + " (" + btcChangePercent24Hr.toFixed(2).toString() + "%)"
    } else {
      document.getElementById("bitcoin-change").style.color = "red"
      document.getElementById("bitcoin-change").innerHTML = Number(btcChangePercent24Hr * btcPrice/100).toLocaleString() + " (" + btcChangePercent24Hr.toFixed(2).toString() + "%)"
    }
  });
  var btcResponse = fetch("https://api.coincap.io/v2/assets/bitcoin/history?interval=h1&start=" + oldUnixTimeRounded + "&end=" + unixTimeRounded)
  .then(btcResponse => btcResponse.json())
  .then(data => {
    // console.log(typeof(data));
    // console.log(data[12])
    data = data.data
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    graphData = [
      ['Time', 'Value($)']
    ]

    for (i = 0; i < data.length; i++) {
      // console.log(data[i])
      var item = data[i]
      var utcDate = item.date
      var myDate = new Date(utcDate)
      myDate = myDate.toLocaleTimeString()
      //console.log(myDate)
      graphData.push([myDate, Number(item.priceUsd)])
    }

    function drawChart() {
      var data = google.visualization.arrayToDataTable(graphData);
      var chart = new google.visualization.LineChart(document.getElementById('btc-chart-container'));
      chart.draw(data, options);
      function resize () {
        var chart = new google.visualization.LineChart(document.getElementById('btc-chart-container'));
        chart.draw(data, options);
      }
      window.onload = resize;
      window.onresize = resize;
    }
  });
