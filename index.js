function ToggleMode() {
  const html = document.documentElement
  /*if(html.classList.contains('light')){
    html.classList.remove('light')
  } else {
html.classList.add('light')
  }*/
  html.classList.toggle("light")

  //pegar a tag img
  const img = document.querySelector("#profile img")
  //substituir a imagem
  if (html.classList.contains("light")) {
    //se tiver light mode, adicionar a imagem light
    img.setAttribute("src", "./DIA.png")
  } else {
    //se tiver sem light mode, manter a imagem normal
    img.setAttribute("src", "./noite.png")
  }
}

function getWeatherDescription(code) {
  const descriptions = {
    0: { icon: "☀️", text: "Ensolarado" },
    1: { icon: "🌤️", text: "Parcialmente Nublado" },
    2: { icon: "☁️", text: "Nublado" },
    3: { icon: "☁️", text: "Muito Nublado" },
    45: { icon: "🌫️", text: "Nevoeiro" },
    48: { icon: "🌫️", text: "Nevoeiro com Geada" },
    51: { icon: "🌧️", text: "Chuvisco Leve" },
    61: { icon: "🌧️", text: "Chuva Moderada" },
    63: { icon: "🌧️", text: "Chuva Forte" },
    80: { icon: "🌧️", text: "Chuva em Pancadas" },
    81: { icon: "⛈️", text: "Chuva Forte em Pancadas" },
    82: { icon: "⛈️", text: "Chuva Violenta" },
    85: { icon: "🌨️", text: "Neve em Pancadas" },
    95: { icon: "⛈️", text: "Tempestade com Raios" },
  }

  return descriptions[code] || { icon: "🌤️", text: "Desconhecido" }
}

async function getWeather() {
  let lat, lon

  // 🌍 Geolocalização
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
        })
      })
      lat = position.coords.latitude
      lon = position.coords.longitude
    } catch (err) {
      console.warn("GPS falhou, tentando IP")
    }
  }

  // 🌐 Fallback por IP
  if (!lat || !lon) {
    try {
      const ipResponse = await fetch("https://ipapi.co/json/")
      const ipData = await ipResponse.json()
      lat = ipData.latitude
      lon = ipData.longitude
    } catch (err) {
      console.error("Erro ao obter localização por IP")
      return
    }
  }

  try {
    // ☁️ Clima
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,precipitation_probability&timezone=auto`
    )
    const weatherData = await weatherResponse.json()

    const temp = Math.round(weatherData.current.temperature_2m)
    const weatherCode = weatherData.current.weather_code
    const rainChance = weatherData.current?.precipitation_probability ?? 0

    const { icon, text } = getWeatherDescription(weatherCode)

    // 📍 Reverse Geocoding
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`
    )
    const geoData = await geoResponse.json()
    const address = geoData.address || {}

    const municipality =
      address.municipality || address.county || address.state_district

    const city =
      address.city || address.town || address.village || address.hamlet

    const state = address.state
    const country = address.country

    const locationName = [municipality, city, state, country]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", ")

    // 🧱 Card
    const card = document.createElement("div")
    card.className = "weather-card"
    card.innerHTML = `
      <div class="weather-main">
        <div class="weather-icon">${icon}</div>
        <div class="weather-temp">${temp}°C</div>
      </div>
      <div class="weather-details">
        <div class="weather-description">${text}</div>
        <p>📍 ${locationName}</p>
        <p>🌧️ Chuva: ${rainChance}%</p>
      </div>
    `

    const container = document.getElementById("weather-container")
    container.innerHTML = ""
    container.appendChild(card)
  } catch (error) {
    console.error("Erro ao buscar clima:", error)
  }
}

getWeather()
