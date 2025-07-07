const apiKey = "9b6880457fc988c735e02359a2adbfc5";

let isDarkMode = true;

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  isDarkMode = !isDarkMode;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("mainContainer").classList.add("hidden");
  document.getElementById("chartContainer").classList.add("hidden");
  document.getElementById("weatherInfo").classList.add("hidden");
});

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");

  const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  document.getElementById("mainContainer").classList.remove("hidden");
  document.getElementById("weatherInfo").classList.remove("hidden");
  document.getElementById("chartContainer").classList.add("hidden");

  fetch(currentURL)
    .then(res => res.json())
    .then(data => {
      document.getElementById("cityName").innerText = data.name;
      document.getElementById("description").innerText = data.weather[0].description;
      document.getElementById("temp").innerText = data.main.temp;
      document.getElementById("humidity").innerText = data.main.humidity;
      document.getElementById("wind").innerText = data.wind.speed;

      const main = data.weather[0].main.toLowerCase();
      const emoji = main.includes("cloud") ? "☁️" :
                    main.includes("rain") ? "🌧️" :
                    main.includes("clear") ? "☀️" :
                    main.includes("snow") ? "❄️" :
                    main.includes("storm") || main.includes("thunder") ? "⛈️" :
                    main.includes("mist") || main.includes("fog") ? "🌫️" : "🌈";
      document.getElementById("emoji").innerText = emoji;
    });

  fetch(forecastURL)
    .then(res => res.json())
    .then(data => {
      const labels = [];
      const temps = [];
      const hums = [];
      const winds = [];

      data.list.slice(0, 12).forEach(entry => {
        const date = new Date(entry.dt_txt);
        const timeLabel = date.toLocaleString("en-IN", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit"
        });
        labels.push(timeLabel);
        temps.push({ x: timeLabel, y: entry.main.temp });
        hums.push({ x: timeLabel, y: entry.main.humidity });
        winds.push({ x: timeLabel, y: entry.wind.speed });
      });

      renderChart("tempChart", "Temperature (°C)", labels, temps, "#ff6ec7");
      renderChart("humidityChart", "Humidity (%)", labels, hums, "#42eefd");
      renderChart("windChart", "Wind Speed (m/s)", labels, winds, "#ffdf00");

      document.getElementById("chartContainer").classList.remove("hidden");
    });
}

function renderChart(canvasId, label, labels, data, lineColor) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  if (window[canvasId + "Instance"]) {
    window[canvasId + "Instance"].destroy();
  }
  window[canvasId + "Instance"] = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: lineColor,
        backgroundColor: lineColor + "33",
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 10,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#ffffff',
            font: { size: 18 }
          }
        },
        tooltip: {
          backgroundColor: "#111",
          titleColor: "#fff",
          bodyColor: "#fff",
          titleFont: { size: 18, weight: "bold" },
          bodyFont: { size: 16 },
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#fff", font: { size: 14 } },
          grid: { color: "rgba(255,255,255,0.1)" }
        },
        y: {
          ticks: { color: "#fff", font: { size: 14 } },
          grid: { color: "rgba(255,255,255,0.1)" },
          beginAtZero: true
        }
      }
    }
  });
}
