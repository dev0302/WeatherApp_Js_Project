// extracting the elements
let userTab = document.querySelector("[data-yourWeather]");
let searchTab = document.querySelector("[data-searchWeather]");
let formContainer = document.querySelector(".form_container");
let userInfoContainer = document.querySelector(".user_info_container");
let grantLocationContainer = document.querySelector(".grant_location_container");
let loadingContainer = document.querySelector(".loading_container");
let searchForm = document.querySelector("[data-searchForm]");

// intial variables needed
let currentTab = userTab;
const API_KEY = "168771779c71f3d64106d8a88376808a";
currentTab.classList.add("current_tab");
getFromSessionStorage();

//-------------------------------------------------------//
// Creating a function in which when a specific tab is clicked, then a function wi;; call upon containing that specific tab to switch the background effect.
function switchTab(clickedTab){
    if (currentTab != clickedTab) {
        currentTab.classList.remove("current_tab");
        currentTab = clickedTab;
        currentTab.classList.add("current_tab");

        // now, since click to alag tab pe hi hua hoga tbhi if condition satisfied hogi, so active class se visibility bhi change krni hogi.

        // taking scenario that if i m already in "your weather" tab and switching to "search weather tab"
        if (!formContainer.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantLocationContainer.classList.remove("active");
            formContainer.classList.add("active");
            console.log("Tab Switched");
            
        } else {
            //another scenario that if i m already in "search weather" tab and switching to "your weather tab"
            userInfoContainer.classList.remove("active");
            formContainer.classList.remove("active");

            // since now i m in your weather tab, now i hv to show the weather info too....
            //so first i vl go by method that may be the coordinates are there already stored in local storage or not.
            // as if were they, then directly fetch details through API, and if not then get it by grant location access method.

            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click",()=>{
    switchTab(userTab);
})

searchTab.addEventListener("click",()=>{
    switchTab(searchTab);
})

function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user_coordinates") // "user_coordinates" se maanlo humne vo save krvarkhe hai...."

    if(!localCoordinates) {
        //agar nhi mille to....
        grantLocationContainer.classList.add("active");
        console.log("Coordinates not found from the LocalStorage");
        
    } else {
        console.log("Coordinates found from the localStorage");
        
        //agar coordinates millgye to
        //pehle to localCoordinates ko object mei convert krna // compulsory
        const coordinates = JSON.parse(localCoordinates)
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    
    const {lat, long} = coordinates; //lat and long nikaliya pehle to
    // ab jb tk data fetch horha hoga tb tk loading screen ka view chalana
    loadingContainer.classList.add("active");

    // Now Finally API Call
    try {

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_KEY}`);
        
        

        const data = await response.json();
        // console.log(data);
        // console.log(typeof data);

        // Access and modify using dot notation
        const myObject = data;
        const oldTemp = myObject.main.temp;
        const newTemp = (oldTemp - 273.15).toFixed(2);
        myObject.main.temp = newTemp;
        // console.log(data.main); 

        // ab jb data milchuka hai to isse display krna hoga, hn pehle to loacdingcontainer ko vapiss hide krke userinfocontainer ko visible krna hoga.
        grantLocationContainer.classList.remove("active");
        loadingContainer.classList.remove("active");
        userInfoContainer.classList.add("active");
        //finally ab data userinfocontainer pe render krenge
        renderWeatherInfo(data);

    } catch (error) {
        loadingContainer.classList.remove("active");
        //alert throw krna hoga.
    }
}

function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    

    //now fetching values from weatherInfo object and putting it into the UI.
    cityName.innerText = weatherInfo?.name;
    weatherDesc.innerText = weatherInfo?.weather?.[0]?.description;
    temp.innerText = temp.innerText = `${weatherInfo?.main?.temp}°C`;
    windspeed.innerText = weatherInfo?.wind?.speed;
    humidity.innerText = weatherInfo?.main?.humidity;
    cloudiness.innerText = weatherInfo?.clouds?.all;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    console.log(tempinC);

    
}

const grantAccess = document.querySelector("[data-grantAccess]");
grantAccess.addEventListener("click", getLocation);

function getLocation() {
    console.log("trying to fetch location");
    
    loadingContainer.classList.add("active");
    console.log("active added");
    
    if(navigator.geolocation) {
        console.log("inside if");
        navigator.geolocation.getCurrentPosition(showPosition,showError);
        console.log("over");
        
    } else {
        alert("no geo location found");
    }
}

function showPosition(position) {
    console.log("insdie show position");
    
    const userCoordinates = {
        lat: position.coords.latitude,
        long: position.coords.longitude,
    }
    console.log(userCoordinates);
    
    // ab inko localstorage mei save krvadenga and isko string format mei bhejna pdega
    sessionStorage.setItem("user_coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}


const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    console.log("submitted");
    
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") {
        console.log("empty");
        return;
    } else {
        fetchSearchWeatherInfo(cityName);
    }
        
})

async function fetchSearchWeatherInfo(city) {
    loadingContainer.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantLocationContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingContainer.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        //hW
    }
}

function showError(error) {
  console.log("❌ Geolocation error:", error);

  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}


//-------------------------------------------------------//

























// //Remember for good approach let one function do one thing.

// // creating API key constant with specific key
// const API_KEY = "168771779c71f3d64106d8a88376808a";

// //Function that will fetch weather details
// async function FetchWeatherData() {
//     let city = "Delhi";
//     try {
//         //main link that will fetch data
//     //use of await
//     const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

//     //converting that data to json form as conpulsory
//     //use of await
//     const data = await response.json();
//     console.log("Weather -> ", data);

//     //it will fetch data
//     getCustomWeatherDetails();

//     // The function to display weather from data got on the UI
//     renderWeatherInfo(data);

//     } catch (error) {
//         //handle the error here
//     }

// }

// async function getCustomWeatherDetails() {
//     try {
//         let latitude = 28.6667;
//         let longitude = 77.2167;

//         const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);

//         let data  = await result.json();

//         console.log("data ->", data);

 
//     } catch (error) {
//         // console.log("Failed to search");
//         console.log("Failed to Search",error);
        
//     }
// }

// //this function will render temp into UI
// function renderWeatherInfo(data){
//     //creating a para element that will display the temprature
//     let newPara = document.createElement('p');
//     newPara.textContent = `${data?.main?.temp.toFixed(2)} °C`;
//     document.body.appendChild(newPara);
// }

// //Function to get Geo Location
// function geolocation() {
//     if (navigator.geolocation) { //check whether browser supports geoloaction or not
//         navigator.geolocation.getCurrentPosition(showPosition);
//     } else {
//         console.log("No geolocation support!");
        
//     }
// }

// function showPosition(position) {
//     let lat = position.coords.latitude;
//     let long = position.coords.longitude;
//     console.log(lat);
//     console.log(long);
// } 


