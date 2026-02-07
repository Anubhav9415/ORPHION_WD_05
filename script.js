// OpenWeatherMap API Configuration
const API_KEY = ''; // Add your API key here from https://openweathermap.org/api
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Demo mode - set to true to use sample data without API key
const DEMO_MODE = true;

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const weatherContent = document.getElementById('weatherContent');

// Weather Data Elements
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const cloudiness = document.getElementById('cloudiness');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');

// Sample weather data for demo mode
const demoWeatherData = {
    'delhi': {
        name: 'Delhi',
        sys: { country: 'IN', sunrise: 1707275400, sunset: 1707316800, timezone: 19800 },
        main: { temp: 25, feels_like: 24, humidity: 45, pressure: 1013 },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind: { speed: 3.5 },
        visibility: 10000,
        clouds: { all: 10 },
        timezone: 19800
    },
    'london': {
        name: 'London',
        sys: { country: 'GB', sunrise: 1707290400, sunset: 1707324000, timezone: 0 },
        main: { temp: 12, feels_like: 10, humidity: 75, pressure: 1015 },
        weather: [{ main: 'Clouds', description: 'overcast clouds', icon: '04d' }],
        wind: { speed: 5.2 },
        visibility: 8000,
        clouds: { all: 85 },
        timezone: 0
    },
    'new york': {
        name: 'New York',
        sys: { country: 'US', sunrise: 1707307200, sunset: 1707343200, timezone: -18000 },
        main: { temp: 8, feels_like: 5, humidity: 65, pressure: 1012 },
        weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
        wind: { speed: 4.8 },
        visibility: 9000,
        clouds: { all: 70 },
        timezone: -18000
    },
    'tokyo': {
        name: 'Tokyo',
        sys: { country: 'JP', sunrise: 1707253200, sunset: 1707291600, timezone: 32400 },
        main: { temp: 15, feels_like: 14, humidity: 55, pressure: 1018 },
        weather: [{ main: 'Clear', description: 'few clouds', icon: '02d' }],
        wind: { speed: 3.2 },
        visibility: 10000,
        clouds: { all: 20 },
        timezone: 32400
    },
    'paris': {
        name: 'Paris',
        sys: { country: 'FR', sunrise: 1707289800, sunset: 1707324600, timezone: 3600 },
        main: { temp: 14, feels_like: 13, humidity: 70, pressure: 1014 },
        weather: [{ main: 'Clouds', description: 'broken clouds', icon: '04d' }],
        wind: { speed: 4.5 },
        visibility: 8500,
        clouds: { all: 60 },
        timezone: 3600
    },
    'sydney': {
        name: 'Sydney',
        sys: { country: 'AU', sunrise: 1707249000, sunset: 1707295800, timezone: 39600 },
        main: { temp: 28, feels_like: 29, humidity: 60, pressure: 1016 },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind: { speed: 6.2 },
        visibility: 10000,
        clouds: { all: 15 },
        timezone: 39600
    },
    'dubai': {
        name: 'Dubai',
        sys: { country: 'AE', sunrise: 1707273600, sunset: 1707313200, timezone: 14400 },
        main: { temp: 32, feels_like: 31, humidity: 35, pressure: 1011 },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind: { speed: 4.0 },
        visibility: 10000,
        clouds: { all: 5 },
        timezone: 14400
    },
    'moscow': {
        name: 'Moscow',
        sys: { country: 'RU', sunrise: 1707285000, sunset: 1707318000, timezone: 10800 },
        main: { temp: -5, feels_like: -8, humidity: 80, pressure: 1020 },
        weather: [{ main: 'Snow', description: 'light snow', icon: '13d' }],
        wind: { speed: 5.5 },
        visibility: 5000,
        clouds: { all: 90 },
        timezone: 10800
    }
};

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    } else {
        showError('Please enter a city name.');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        } else {
            showError('Please enter a city name.');
        }
    }
});

locationBtn.addEventListener('click', () => {
    if (DEMO_MODE) {
        // In demo mode, show Delhi as default location
        getWeatherByCity('Delhi');
        return;
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                showError('Unable to get your location. Please enter a city name.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
});

// Fetch Weather by City Name
async function getWeatherByCity(city) {
    showLoading();
    
    // Demo mode - use sample data
    if (DEMO_MODE) {
        setTimeout(() => {
            const cityLower = city.toLowerCase();
            const demoData = demoWeatherData[cityLower];
            
            if (demoData) {
                displayWeather(demoData);
            } else {
                // Show available cities in demo mode
                const availableCities = Object.keys(demoWeatherData).map(c => 
                    c.charAt(0).toUpperCase() + c.slice(1)
                ).join(', ');
                showError(`Demo mode: "${city}" not available. Try: ${availableCities}`);
            }
        }, 500); // Simulate API delay
        return;
    }
    
    // Check if API key is set
    if (!API_KEY || API_KEY === '') {
        showError('API key not configured. Please add your OpenWeatherMap API key in script.js or enable DEMO_MODE.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found');
            } else if (response.status === 401) {
                throw new Error('Invalid API key');
            } else {
                throw new Error('Unable to fetch weather data');
            }
        }
        const data = await response.json();
        displayWeather(data);
    } catch (err) {
        showError(err.message || 'An error occurred. Please try again.');
    }
}

// Fetch Weather by Coordinates
async function getWeatherByCoords(lat, lon) {
    showLoading();
    
    // Check if API key is set
    if (!API_KEY || API_KEY === '') {
        showError('API key not configured. Please add your OpenWeatherMap API key in script.js.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('Unable to fetch weather data');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (err) {
        showError('Unable to fetch weather data. Please try again.');
    }
}

// Display Weather Data
function displayWeather(data) {
    hideLoading();
    hideError();
    
    // Update City and Date
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update Weather Icon
    const iconCode = data.weather[0].icon;
    weatherIcon.innerHTML = getWeatherIcon(data.weather[0].main, iconCode);

    // Update Temperature
    temperature.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;

    // Update Weather Details
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    cloudiness.textContent = `${data.clouds.all}%`;

    // Update Sunrise and Sunset
    sunrise.textContent = formatTime(data.sys.sunrise, data.timezone);
    sunset.textContent = formatTime(data.sys.sunset, data.timezone);

    // Show Weather Content
    weatherContent.classList.add('show');
}

// Get Weather Icon
function getWeatherIcon(weather, iconCode) {
    const iconMap = {
        'Clear': '<i class="fas fa-sun"></i>',
        'Clouds': '<i class="fas fa-cloud"></i>',
        'Rain': '<i class="fas fa-cloud-rain"></i>',
        'Drizzle': '<i class="fas fa-cloud-rain"></i>',
        'Thunderstorm': '<i class="fas fa-cloud-bolt"></i>',
        'Snow': '<i class="fas fa-snowflake"></i>',
        'Mist': '<i class="fas fa-smog"></i>',
        'Smoke': '<i class="fas fa-smog"></i>',
        'Haze': '<i class="fas fa-smog"></i>',
        'Dust': '<i class="fas fa-smog"></i>',
        'Fog': '<i class="fas fa-smog"></i>',
        'Sand': '<i class="fas fa-smog"></i>',
        'Ash': '<i class="fas fa-smog"></i>',
        'Squall': '<i class="fas fa-wind"></i>',
        'Tornado': '<i class="fas fa-tornado"></i>'
    };

    return iconMap[weather] || '<i class="fas fa-cloud"></i>';
}

// Format Time
function formatTime(timestamp, timezone) {
    const date = new Date((timestamp + timezone) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
}

// Show Loading
function showLoading() {
    loading.classList.add('show');
    weatherContent.classList.remove('show');
    error.classList.remove('show');
}

// Hide Loading
function hideLoading() {
    loading.classList.remove('show');
}

// Show Error
function showError(message) {
    hideLoading();
    weatherContent.classList.remove('show');
    errorMessage.textContent = message;
    error.classList.add('show');
}

// Hide Error
function hideError() {
    error.classList.remove('show');
}

// Initialize - Load default city
window.addEventListener('load', () => {
    if (DEMO_MODE) {
        // Show a demo message
        console.log('🌤️ Weather Dashboard running in DEMO MODE');
        console.log('Available cities: Delhi, London, New York, Tokyo, Paris, Sydney, Dubai, Moscow');
        console.log('To use real data, get a free API key from https://openweathermap.org/api');
    }
});