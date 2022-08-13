var login_path = "/oauth/sign-in"
var redirect_uri = "https://www.theshieldcapital.com/home"
var xano_oauth_init_url = "https://x8ki-letl-twmt.n7.xano.io/api:zb9mst4c/oauth/google/init"
var xano_oauth_continue_url = "https://x8ki-letl-twmt.n7.xano.io/api:zb9mst4c/oauth/google/continue"
var formHeaders = [];
var formResponse = [];

var authState = false;


//initialize the authentication API

function initOauth() {
    var fetchURL = new URL(xano_oauth_init_url);
    fetchURL.searchParams.set("redirect_uri", redirect_uri);
    fetchURL = fetchURL.toString();
    console.log(fetchURL);

    fetch(fetchURL, {

            headers: formHeaders,
            method: "GET"

        })

        .then(res => res.json())
        .then(data => loginResponse(data))

        .catch((error) => {
            console.error('Error:', error);
            //responsePanel('error')
        });

}

//after initialization, go to the retrieved url

function loginResponse(res) {
    window.location.href = res.authUrl
}

//button for intializing the authentication api
var authButton = document.querySelector("#authButton");
if (authButton) {
  authButton.addEventListener("click", (event) => {
    initOauth();
  });
}

var logoutButton = document.querySelector("#logout");
if (logoutButton) {
  logoutButton.addEventListener("click", (event) => {
    logout();
  });
}

//on page load, parse the code variable to be able to login/signup

window.onload = function() {
    var curUrl = new URL(document.location.href);
    var code = curUrl.searchParams.get("code");
    if (code) {
      continueOauth(code)
    } else {
      var token = window.localStorage.getItem('auth');
      if (token) {
        token = JSON.parse(token);
        if (token) {
          updateAuthState(token);
        }
      }

      if (!token && ((curUrl.pathname.indexOf('home') !== -1) || (curUrl.pathname.indexOf('companies') !== -1))) {
        document.location.href = login_path;
      }
    }
}

//when code is available attempt to login/signup. make sure to include

function continueOauth(code) {
    console.log("continue auth function run")
    var fetchURL = new URL(xano_oauth_continue_url);
    fetchURL.searchParams.set("redirect_uri", redirect_uri);
    fetchURL.searchParams.set("code", code);
    fetchURL = fetchURL.toString();
    var newUrl = new URL(document.location.href);
    newUrl.searchParams.delete("code");
    newUrl.searchParams.delete("scope");
    newUrl.searchParams.delete("authuser");
    newUrl.searchParams.delete("hd");
    newUrl.searchParams.delete("prompt");
    history.replaceState(null, "", newUrl.toString());

    fetch(fetchURL, {

            headers: formHeaders,
            method: "GET"

        })

        .then(res => res.json())
        .then(data => {
            saveToken(data)
            if (data.first_time == true) {
                document.location.href = "https://www.theshieldcapital.com/sign-in-details"
            }
        })
        .catch((error) => {
            console.error('Error:', error);

        });

}

//save the generated token in the local storage as a cookie
function saveToken(res) {               
    window.localStorage.setItem('auth', JSON.stringify(res));
    updateAuthState(res);
}

function updateAuthState(res) {
  authState = res;
  console.log(res);
  updateElement("#username", res.name);
  updateElement('#greeting', "Hello, " + res.name + " 👋")

  if (res.user.subscription == "none") {
    // redirect the user to another page
    document.location.href = "https://www.theshieldcapital.com"
  } else {
    updateSummaryCard(res)
  }
  
}

function updateElement(id, value) {
  var el = document.querySelector(id);
  if (el) {
    el.innerHTML = value;
  }
}

function updateSummaryCard(res) {
  var amounts = [0, 0, 0, 0, 0]
  var formHeaders = []
  subscriptionData = res.user.subscription
  if (subscriptionData.includes("red")) {
      var fetchRedUrl = new URL("https://x8ki-letl-twmt.n7.xano.io/api:wQY-WEdq/get_red");
      fetchRedUrl.searchParams.set("auth", res.user.google_oauth.id)
      fetchRedUrl = fetchRedUrl.toString();
      fetch(fetchURL, {
        headers: formHeaders,
        method: "GET"
      })
      .then(response => response.json())
      .then(data => {
        amounts[0] = data.investment;
      })
  }
  if (subscriptionData.includes("yellow")) {
    var fetchYellowUrl = new URL("https://x8ki-letl-twmt.n7.xano.io/api:wQY-WEdq/get_yellow");
    fetchYellowUrl.searchParams.set("auth", res.user.google_oauth.id)
    fetchYellowUrl = fetchYellowUrl.toString();
    fetch(fetchURL, {
      headers: formHeaders,
      method: "GET"
    })
    .then(response => response.json())
    .then(data => {
      amounts[1] = data.investment;
    })
  }
  if (subscriptionData.includes("green")) {
    var fetchGreenUrl = new URL("https://x8ki-letl-twmt.n7.xano.io/api:wQY-WEdq/get_green");
    fetchGreenUrl.searchParams.set("auth", res.user.google_oauth.id)
    fetchGreenUrl = fetchGreenUrl.toString();
    fetch(fetchURL, {
      headers: formHeaders,
      method: "GET"
    })
    .then(response => response.json())
    .then(data => {
      amounts[2] = data.investment;
    })
  }
  if (subscriptionData.includes("student")) {
      // import the subscription data and add the amount to the amounts array  (index 3)
  }
  if (subscriptionData.includes("flagship")) {
      // import the subscription data and add the amount to the amounts array  (index 4)
  }
  var totalAmount = amounts[0] + amounts[1] + amounts[2] + amounts[3] + amounts[4]
  document.getElementById("total_invested").innerHTML = totalAmount.toLocaleString();
  var btcVal = fetch("https://api.coincap.io/v2/assets/bitcoin/")
  .then(famousCryptoResponse => famousCryptoResponse.json())
  .then(data => {
      var inBtc = totalAmount / data.data.priceUsd
      document.getElementById("btcVal").innerHTML = inBtc + " BTC";
  })
  // donut chart
  google.charts.load("current", {packages:["corechart"]});
  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
      var data = google.visualization.arrayToDataTable([
      ['Fund', 'Amount'],
      ['Red Crystal', amounts[0]],
      ['Yellow Crystal', amounts[1]],
      ['Green Crystal', amounts[2]],
      ['Student', amounts[3]],
      ['Flagship', amounts[4]]
      ]);

      var options = {
          chartArea: {
              width: '95%',
              height: '95%',
          },
          legend: 'none',
          tooltip: {
              trigger: 'none'
          },
          pieHole: 0.5,
          slices: {
            0: {color: '#EC3F46'},
            1: {color: '#FFD03C'},
            2: {color: '#53EC77'},
            3: {color: '#2663ED'},
            4: {color: '#7A5CE7'}
          },
      };
      document.getElementById("loading_donut").style.display = "none";
      var chart = new google.visualization.PieChart(document.getElementById('donut_container'));
      chart.draw(data, options);
      

  }
  
}

function logout() {
  window.localStorage.removeItem('auth');
  window.location.reload();
}
