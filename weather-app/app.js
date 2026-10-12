/* ==========================================================================
   AetherCast — Core Logic & Animations Engine (High Performance Mock Data)
   ========================================================================== */

// 1. City Climate Data Profiles
const cityData = {
  mumbai: {
    name: "Mumbai",
    country: "India",
    baseTemp: 29,
    humidity: 88,
    wind: 18,
    uv: 8,
    defaultWeather: "rainy",
    weatherTexts: { sunny: "Humid Sunshine", rainy: "Heavy Monsoon Rain", cold: "Pleasant Cool Evening" }
  },
  london: {
    name: "London",
    country: "UK",
    baseTemp: 14,
    humidity: 78,
    wind: 16,
    uv: 2,
    defaultWeather: "rainy",
    weatherTexts: { sunny: "Pleasant Sun", rainy: "Persistent Drizzle", cold: "Chilly Overcast" }
  },
  newyork: {
    name: "New York",
    country: "USA",
    baseTemp: 22,
    humidity: 55,
    wind: 12,
    uv: 6,
    defaultWeather: "sunny",
    weatherTexts: { sunny: "Bright & Clear", rainy: "Thundershower", cold: "Frosty Morning" }
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    baseTemp: 18,
    humidity: 62,
    wind: 10,
    uv: 4,
    defaultWeather: "sunny",
    weatherTexts: { sunny: "Clear Skies", rainy: "Passing Showers", cold: "Cold Wind" }
  },
  reykjavik: {
    name: "Reykjavik",
    country: "Iceland",
    baseTemp: 1,
    humidity: 85,
    wind: 24,
    uv: 1,
    defaultWeather: "cold",
    weatherTexts: { sunny: "Crisp Sun", rainy: "Sleet", cold: "Heavy Blizzard" }
  },
  cairo: {
    name: "Cairo",
    country: "Egypt",
    baseTemp: 34,
    humidity: 30,
    wind: 14,
    uv: 10,
    defaultWeather: "sunny",
    weatherTexts: { sunny: "Scorching Sun", rainy: "Rare Shower", cold: "Mild Desert Breeze" }
  }
};

// India Weather Hub Cities
const indiaHubCities = [
  { id: "mumbai", name: "Mumbai", temp: 29, weather: "rainy", icon: "🌧️", cond: "Heavy Monsoon" },
  { id: "delhi", name: "New Delhi", temp: 37, weather: "sunny", icon: "☀️", cond: "Sunny & Dry" },
  { id: "bengaluru", name: "Bengaluru", temp: 24, weather: "sunny", icon: "⛅", cond: "Pleasant Clouds" },
  { id: "kolkata", name: "Kolkata", temp: 31, weather: "rainy", icon: "🌦️", cond: "Passing Shower" },
  { id: "chennai", name: "Chennai", temp: 34, weather: "sunny", icon: "☀️", cond: "Humid & Clear" },
  { id: "shimla", name: "Shimla", temp: 6, weather: "cold", icon: "❄️", cond: "Chilly Frost" }
];

// Active State Variables
let currentCity = "london";
let currentWeatherState = "rainy"; // sunny, rainy, cold
let soundEnabled = false;

// Audio controllers (lazily initialized)
const audios = {};

// Canvas variables
const canvas = document.getElementById("weather-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let animationId = null;

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  setupInteractiveGlow();
  setupEventListeners();
  updateClock();
  setInterval(updateClock, 1000);
  
  // Sizing Canvas
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  startParticleEngine();

  // Lazy load audios
  audios.sunny = document.getElementById("audio-birds");
  audios.rainy = document.getElementById("audio-rain");
  audios.cold = document.getElementById("audio-wind");

  // Render India Hub grid cards
  renderIndiaHubGrid();
  
  // Load Default city (London)
  switchCity("london");
});

// 2. Interactive Card Mouse Glow
function setupInteractiveGlow() {
  const cards = document.querySelectorAll(".weather-card");
  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });
  });
}

// 3. Render India Hub Grid
function renderIndiaHubGrid() {
  const container = document.getElementById("india-grid");
  if (!container) return;
  container.innerHTML = "";

  indiaHubCities.forEach(city => {
    const card = document.createElement("div");
    card.className = `india-city-item ${city.id === currentCity ? 'active-city' : ''}`;
    card.id = `india-city-${city.id}`;
    card.innerHTML = `
      <div class="india-city-info">
        <span class="india-city-name">${city.name}</span>
        <span class="india-city-condition">${city.cond}</span>
      </div>
      <div class="india-city-weather">
        <span class="india-city-temp">${city.temp}°</span>
        <span class="india-city-icon">${city.icon}</span>
      </div>
    `;

    // Click handler to load details
    card.addEventListener("click", () => {
      // If city is defaultCity, switch. Otherwise generate mock custom profile.
      if (cityData[city.id]) {
        switchCity(city.id);
      } else {
        // Create custom mock details for non-default cities (like Delhi, Bangalore, etc.)
        loadCustomIndianCity(city);
      }
    });

    container.appendChild(card);
  });
}

// 4. Load Custom Indian City details (Delhi, Bangalore, etc.)
function loadCustomIndianCity(city) {
  // Construct temporary cityData profile
  const mockProfile = {
    name: city.name,
    country: "India",
    baseTemp: city.temp,
    humidity: city.weather === "rainy" ? 85 : (city.weather === "cold" ? 65 : 45),
    wind: city.weather === "cold" ? 22 : 12,
    uv: city.weather === "sunny" ? 9 : 3,
    defaultWeather: city.weather,
    weatherTexts: {
      sunny: city.cond,
      rainy: "Monsoon Showers",
      cold: "Frosty Mountain Wind"
    }
  };

  // Register temporarily in defaultCities so switchCity resolves it
  cityData[city.id] = mockProfile;
  switchCity(city.id);
}

// Highlight active India city item card
function updateIndiaGridHighlight(activeCityId) {
  const cards = document.querySelectorAll(".india-city-item");
  cards.forEach(card => {
    if (card.id === `india-city-${activeCityId}`) {
      card.classList.add("active-city");
    } else {
      card.classList.remove("active-city");
    }
  });
}

// 5. Switching active display city
function switchCity(cityKey) {
  currentCity = cityKey;
  const data = cityData[cityKey];
  if (!data) return;

  // Sync Select Dropdown
  const select = document.getElementById("city-select");
  if (select && select.querySelector(`option[value="${cityKey}"]`)) {
    select.value = cityKey;
  }

  // Update Main Dashboard Labels
  document.getElementById("current-location").innerText = `${data.name}, ${data.country}`;

  // Switch weather layout representation
  const defaultWeather = data.defaultWeather;
  setWeatherState(defaultWeather);

  // Set highlights in India grid
  updateIndiaGridHighlight(cityKey);
}

// 6. Setting visual states
function setWeatherState(state) {
  currentWeatherState = state;
  
  // Body tags
  document.body.classList.remove("weather-state-sunny", "weather-state-rainy", "weather-state-cold");
  document.body.classList.add(`weather-state-${state}`);
  
  const cityInfo = cityData[currentCity];
  let tempModifier = 0;
  let conditionText = "";
  let icon = "";
  
  if (state === "sunny") {
    tempModifier = 3;
    conditionText = cityInfo.weatherTexts.sunny;
    icon = "☀️";
  } else if (state === "rainy") {
    tempModifier = -2;
    conditionText = cityInfo.weatherTexts.rainy;
    icon = "🌧️";
  } else if (state === "cold") {
    tempModifier = -9;
    conditionText = cityInfo.weatherTexts.cold;
    icon = "❄️";
  }

  const finalTemp = Math.round(cityInfo.baseTemp + tempModifier);
  document.getElementById("current-temp").innerText = finalTemp;
  document.getElementById("current-condition").innerText = conditionText;
  document.getElementById("condition-icon").innerText = icon;

  // Update secondary metrics
  document.getElementById("humidity-value").innerText = `${cityInfo.humidity}%`;
  document.getElementById("humidity-bar").style.width = `${cityInfo.humidity}%`;

  document.getElementById("wind-value").innerText = `${cityInfo.wind} km/h`;
  document.getElementById("wind-bar").style.width = `${Math.min(cityInfo.wind * 3, 100)}%`;

  document.getElementById("uv-value").innerText = `${cityInfo.uv}`;
  document.getElementById("uv-bar").style.width = `${cityInfo.uv * 10}%`;

  document.getElementById("feels-like-value").innerText = `${finalTemp - 1}°C`;
  document.getElementById("feels-bar").style.width = `${Math.min(Math.max((finalTemp + 10) * 2, 5), 100)}%`;

  // Regenerate hourly & monthly forecasts to match the active temperature scale
  generateHourlyForecast(cityInfo);
  generateMonthlyForecast(cityInfo);
  
  // Reinitialize particles
  initParticles();

  // Play audio
  if (soundEnabled) {
    playActiveSound();
  }
}

// 7. Hourly weather data generation (according to time)
function generateHourlyForecast(cityInfo) {
  const container = document.getElementById("hourly-timeline");
  if (!container) return;
  container.innerHTML = "";

  const now = new Date();
  const currentHour = now.getHours();

  for (let i = 0; i < 24; i += 2) {
    const targetHourNum = (currentHour + i) % 24;
    
    // Formatting time label
    let hourLabel = "";
    if (targetHourNum === 0) hourLabel = "12 AM";
    else if (targetHourNum === 12) hourLabel = "12 PM";
    else if (targetHourNum > 12) hourLabel = `${targetHourNum - 12} PM`;
    else hourLabel = `${targetHourNum} AM`;

    // Temperature curve based on time of day (colder at night, warmer in afternoon)
    const timeFactor = Math.sin(((targetHourNum - 6) / 24) * 2 * Math.PI);
    let weatherStateModifier = 0;
    
    if (currentWeatherState === "sunny") weatherStateModifier = 3;
    else if (currentWeatherState === "rainy") weatherStateModifier = -2;
    else if (currentWeatherState === "cold") weatherStateModifier = -9;

    const hourlyTemp = Math.round(cityInfo.baseTemp + weatherStateModifier + (timeFactor * 4));

    // Icon Selector based on hour and state
    let hourIcon = "☀️";
    if (currentWeatherState === "rainy") {
      hourIcon = Math.random() > 0.5 ? "🌧️" : "🌦️";
    } else if (currentWeatherState === "cold") {
      hourIcon = "❄️";
    } else {
      if (targetHourNum < 6 || targetHourNum > 18) {
        hourIcon = "🌙";
      } else {
        hourIcon = "☀️";
      }
    }

    const hourlyItem = document.createElement("div");
    hourlyItem.className = `hourly-item ${i === 0 ? 'active-hour' : ''}`;
    hourlyItem.innerHTML = `
      <span class="hourly-time">${hourLabel}</span>
      <span class="hourly-icon">${hourIcon}</span>
      <span class="hourly-temp">${hourlyTemp}°C</span>
    `;
    
    container.appendChild(hourlyItem);
  }
}

// 8. Monthly Forecast (30 Days Daily Forecast)
function generateMonthlyForecast(cityInfo) {
  const grid = document.getElementById("monthly-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();

  const sunnyConditions = ["Sunny", "Mostly Sunny", "Clear", "Partly Cloudy", "Passing Clouds"];
  const rainyConditions = ["Rain", "Heavy Rain", "Showers", "Drizzle", "Monsoon Thunder"];
  const coldConditions = ["Snow", "Blizzard", "Freezing Rain", "Icy Frost", "Light Snow"];

  for (let i = 0; i < 30; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);

    const dayName = daysOfWeek[targetDate.getDay()];
    const dateFormatted = targetDate.getDate();
    const monthFormatted = targetDate.toLocaleString('default', { month: 'short' });

    let cond = "";
    let icon = "☀️";
    
    if (currentWeatherState === "sunny") {
      cond = sunnyConditions[Math.floor(Math.random() * sunnyConditions.length)];
      icon = cond.includes("Cloudy") ? "⛅" : "☀️";
    } else if (currentWeatherState === "rainy") {
      cond = rainyConditions[Math.floor(Math.random() * rainyConditions.length)];
      icon = cond.includes("Thunder") ? "⛈️" : "🌧️";
    } else {
      cond = coldConditions[Math.floor(Math.random() * coldConditions.length)];
      icon = cond.includes("Frost") ? "❄️" : "🌨️";
    }

    let weatherStateModifier = 0;
    if (currentWeatherState === "sunny") weatherStateModifier = 3;
    else if (currentWeatherState === "rainy") weatherStateModifier = -2;
    else if (currentWeatherState === "cold") weatherStateModifier = -9;

    const baseDayTemp = cityInfo.baseTemp + weatherStateModifier + Math.sin(i / 3) * 2.5; 
    const maxTemp = Math.round(baseDayTemp + 2 + Math.random() * 1.5);
    const minTemp = Math.round(baseDayTemp - 3 - Math.random() * 1.5);

    const item = document.createElement("div");
    item.className = "monthly-item";
    item.innerHTML = `
      <span class="monthly-date">${dateFormatted} ${monthFormatted}</span>
      <span class="monthly-day">${dayName}</span>
      <span class="monthly-icon">${icon}</span>
      <div class="monthly-temp-range">
        <span class="monthly-temp-max">${maxTemp}°</span>
        <span class="monthly-temp-min">${minTemp}°</span>
      </div>
      <span class="monthly-condition" title="${cond}">${cond}</span>
    `;

    grid.appendChild(item);
  }
}

// 9. Setup Event Listeners
function setupEventListeners() {
  const select = document.getElementById("city-select");
  if (select) {
    select.addEventListener("change", (e) => {
      switchCity(e.target.value);
    });
  }

  const demoButtons = document.querySelectorAll(".btn-demo");
  demoButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      demoButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const targetState = btn.getAttribute("data-weather");
      setWeatherState(targetState);
    });
  });

  const soundBtn = document.getElementById("sound-toggle");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      const soundOnIcon = soundBtn.querySelector(".sound-on");
      const soundOffIcon = soundBtn.querySelector(".sound-off");
      
      if (soundEnabled) {
        if (soundOnIcon) soundOnIcon.style.display = "block";
        if (soundOffIcon) soundOffIcon.style.display = "none";
        playActiveSound();
      } else {
        if (soundOnIcon) soundOnIcon.style.display = "none";
        if (soundOffIcon) soundOffIcon.style.display = "block";
        stopAllSounds();
      }
    });
  }
}

// 10. Clock Updates & time-of-day gradient setting
function updateClock() {
  const now = new Date();
  
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  const timeString = `${hours}:${minutes} ${ampm}`;
  
  const timeEl = document.getElementById("live-time");
  if (timeEl) timeEl.innerText = timeString;

  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateEl = document.getElementById("current-date");
  if (dateEl) dateEl.innerText = now.toLocaleDateString('en-US', options);

  const systemHour = now.getHours();
  document.body.classList.remove("theme-morning", "theme-day", "theme-sunset", "theme-night");
  
  if (systemHour >= 5 && systemHour < 11) {
    document.body.classList.add("theme-morning");
  } else if (systemHour >= 11 && systemHour < 17) {
    document.body.classList.add("theme-day");
  } else if (systemHour >= 17 && systemHour < 20) {
    document.body.classList.add("theme-sunset");
  } else {
    document.body.classList.add("theme-night");
  }
}

// 11. Audio controller
function playActiveSound() {
  stopAllSounds();
  if (!soundEnabled) return;

  const activeAudio = audios[currentWeatherState];
  if (activeAudio) {
    activeAudio.volume = 0.15;
    activeAudio.play().catch(err => console.log("Audio play blocked by browser policy", err));
  }
}

function stopAllSounds() {
  Object.values(audios).forEach(audio => {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (err) {
        console.warn("Audio pause error:", err);
      }
    }
  });
}

// 12. Particles Canvas Loops
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
}

function initParticles() {
  if (!canvas) return;
  particles = [];
  const maxParticles = currentWeatherState === "rainy" ? 120 : (currentWeatherState === "cold" ? 90 : 25);
  
  for (let i = 0; i < maxParticles; i++) {
    particles.push(createParticle(true));
  }
}

function createParticle(randomY = false) {
  const w = canvas ? canvas.width : window.innerWidth;
  const h = canvas ? canvas.height : window.innerHeight;
  
  if (currentWeatherState === "rainy") {
    return {
      type: "rain",
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      length: Math.random() * 25 + 15,
      speed: Math.random() * 12 + 18,
      opacity: Math.random() * 0.4 + 0.15,
      width: Math.random() * 1.5 + 0.8
    };
  } else if (currentWeatherState === "cold") {
    return {
      type: "snow",
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -10,
      radius: Math.random() * 3.5 + 1,
      speed: Math.random() * 1.5 + 0.8,
      density: Math.random() * 10,
      opacity: Math.random() * 0.7 + 0.2,
      swing: Math.random() * 0.02 + 0.01,
      swingStep: Math.random() * 100
    };
  } else {
    return {
      type: "dust",
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 10,
      radius: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.5 + 0.2),
      speedX: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.3 + 0.1
    };
  }
}

function startParticleEngine() {
  if (!canvas || !ctx) return;
  
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, idx) => {
      if (p.type === "rain") {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(174, 207, 238, ${p.opacity})`;
        ctx.lineWidth = p.width;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + p.length);
        ctx.stroke();
        
        p.y += p.speed;
        p.x -= 2;
        
        if (p.y > canvas.height || p.x < -10) {
          particles[idx] = createParticle(false);
        }
      } else if (p.type === "snow") {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, true);
        ctx.fill();
        
        p.swingStep += p.swing;
        p.y += p.speed;
        p.x += Math.sin(p.swingStep) * 0.5;
        
        if (p.y > canvas.height || p.x > canvas.width || p.x < 0) {
          particles[idx] = createParticle(false);
        }
      } else if (p.type === "dust") {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, true);
        ctx.fill();
        
        p.y += p.speedY;
        p.x += p.speedX;
        
        if (p.y < -5 || p.x < -5 || p.x > canvas.width + 5) {
          particles[idx] = createParticle(false);
          particles[idx].y = canvas.height + 5;
        }
      }
    });
    
    animationId = requestAnimationFrame(loop);
  }
  
  loop();
}
