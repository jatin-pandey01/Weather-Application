const userTab = document.querySelector('[data-userWeather]');
// userTab.classList.add('active');
const searchTab = document.querySelector('[data-searchWeather]');
const userContainer = document.querySelector('.weather-container');
const grantAccessContainer = document.querySelector('.grant-location-container');
const searchForm  = document.querySelector('[data-searchForm]');
const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');
const apiKey = '11ab987ba88b2d577551328a5f177837';
const errorContainer = document.querySelector('.error-container');
const messageText = document.querySelector('[data-Access]');

let currentTab = userTab;
currentTab.classList.add('current-tab');

userTab.addEventListener('click',()=>{
    switchTab(userTab);
});

searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
});
getfromSessionStorage();
errorContainer.classList.remove('active');  

function switchTab(clickTab){
    errorContainer.classList.remove('active');  
    if(clickTab != currentTab){
        currentTab.classList.remove('current-tab');
        currentTab = clickTab;
        currentTab.classList.add('current-tab');

        if(!searchForm.classList.contains('active')){
            userInfoContainer.classList.remove('active');
            grantAccessContainer.classList.remove('active');
            searchForm.classList.add('active');
        }
        else{
            searchForm.classList.remove('active');
            userInfoContainer.classList.remove('active');
            getfromSessionStorage();
        }
    }
}

function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem('user-coordinates');
    if(!localCoordinates){
        grantAccessContainer.classList.add('active');
    }
    else{
        const coordinates = JSON.parse(localCoordinates); //Convert string to object
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {latitude,longitude} = coordinates;
    grantAccessContainer.classList.remove('active');
    loadingScreen.classList.add('active');
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch(e){
        loadingScreen.classList.remove('active');
        grantAccessContainer.classList.add('active');
    }
}

function renderWeatherInfo(data){
    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const desc = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-cloudiness]');

    cityName.textContent = data?.name; //? is meant we are not sure whether this object present or not. If yes return else return undefined.
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.textContent = data?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`; 
    temp.textContent = data?.main?.temp + " °C";
    windspeed.textContent = data?.wind?.speed + "m/s";
    humidity.textContent = data?.main?.humidity+"%";
    cloudiness.textContent = data?.clouds?.all+"%";

}

const grantAccessButton = document.querySelector('[data-grantAccess]');

grantAccessButton.addEventListener('click',()=>{
    if(navigator.geolocation){
        // console.log('Hello access');
        navigator.geolocation.getCurrentPosition(showPosition,showError);
    }
    else{
        // console.log("Hi");
        grantAccessBtn.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
    // console.log(p);
});

async function showPosition(position){
    const coordinates = {
        latitude : position.coords.latitude,
        longitude : position.coords.longitude
    }
    // console.log(latitude,longitude);
    sessionStorage.setItem('user-coordinates',JSON.stringify(coordinates));
    fetchUserWeatherInfo(coordinates);
};

function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
}

const searchInput = document.querySelector('[data-searchInput]');

searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "") return;
    else{
        fetchSearchWeatherInfo(cityName);
        searchInput.value="";
    } 
        
});

async function fetchSearchWeatherInfo(city){
    errorContainer.classList.remove('active');
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
          loadingScreen.classList.remove("active");
          userInfoContainer.classList.add("active");
          renderWeatherInfo(data);
    }
    catch(e){
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
        errorContainer.innerText = `${error?.message}`;
        // errorContainer.style.display = "none";
    }
}   