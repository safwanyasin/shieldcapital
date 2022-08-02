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
    console.log("code: " + code)
    window.localStorage.setItem('authCode', code);
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
        .then(data => saveToken(data))
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
  var verificationCode = window.localStorage.getItem('authCode');
  console.log("Got auth code: " + verificationCode);
  var url = "https://x8ki-letl-twmt.n7.xano.io/api:wQY-WEdq/getusersub"
  var fetchURL = new URL(url);
    fetchURL.searchParams.set("redirect_uri", redirect_uri);
    fetchURL.searchParams.set("code", code);
    fetchURL = fetchURL.toString();
  fetch(fetchURL, {
    headers: formHeaders,
    method: "GET"
  })
      .then(response => response.json())
      .then(data => {
          if (data.subscription == "none") {
              alert("You havent subscribed to a fund yet")
              document.location.href = login_path
          }
      })
  updateElement("#username", res.name);
  updateElement('#greeting', "Hello, " + res.name + " 👋")
  
}

function updateElement(id, value) {
  var el = document.querySelector(id);
  if (el) {
    el.innerHTML = value;
  }
}

function logout() {
  window.localStorage.removeItem('auth');
  window.localStorage.removeItem('authCode');
  window.location.reload();
}