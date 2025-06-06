# Weather App

A modern, responsive Progressive Web App (PWA) that provides real-time weather and 5-day forecasts for any city worldwide. Built with vanilla JavaScript, HTML5, and CSS3, it features localization, accessibility, offline support, and installability.

## Features

- 🌤️ **Current Weather:** Real-time weather data for any city.
- 📅 **5-Day Forecast:** Detailed daily and hourly forecasts.
- 📊 **Visualizations:** Temperature chart, humidity/wind/pressure gauges.
- 🌐 **Localization:** Multi-language support.
- 🌓 **Theme Toggle:** Light and dark mode.
- 📍 **Geolocation:** Weather for your current location.
- ⭐ **Favorites & Recent Searches:** Quick access to your favorite cities.
- 📱 **PWA:** Installable, offline support, and mobile-friendly.
- ♿ **Accessibility:** Keyboard navigation and ARIA labels.

## Demo

> _Add your live demo link here if deployed (e.g., GitHub Pages, Vercel, Netlify)._

## Getting Started

### Prerequisites

- Node.js (for local development, optional)
- A modern web browser

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/weather-app.git
   cd weather-app
   ```

2. **Add your OpenWeatherMap API key:**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/) and get an API key.
   - In `js/api.js`, replace `YOUR_API_KEY` with your actual API key.

3. **Run locally:**
   - Open `index.html` directly in your browser, or
   - Use a local server (recommended for PWA features):
     ```bash
     npx serve .
     ```
     or use the Live Server extension in VS Code.

### Deployment

You can deploy this app to [GitHub Pages](https://pages.github.com/), [Vercel](https://vercel.com/), [Netlify](https://netlify.com/), or any static hosting provider.

## Folder Structure

```
Weather App/
├── css/
│   └── style.css
├── icons/
│   ├── icon-32.png
│   ├── icon-48.png
│   ├── icon-96.png
│   ├── icon-180.png
│   ├── icon-192.png
│   └── icon-512.png
├── js/
│   ├── api.js
│   ├── dom.js
│   └── main.js
├── manifest.json
├── service-worker.js
├── index.html
└── README.md
```

## License

This project is licensed under the [MIT License](LICENSE).

---

**Credits:**  
- Weather data by [OpenWeatherMap](https://openweathermap.org/)
- Weather icons by [Weather Icons](https://erikflowers.github.io/weather-icons/)

---
