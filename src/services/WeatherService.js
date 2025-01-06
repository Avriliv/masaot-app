import axios from 'axios';

const WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// המרת קואורדינטות לעברית
async function getHebrewLocationName(lat, lon) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&lat=${lat}&lon=${lon}&accept-language=he`
    );
    return response.data.address.city || response.data.address.town || response.data.address.village;
  } catch (error) {
    console.error('Error getting Hebrew location name:', error);
    return null;
  }
}

// המרת טמפרטורה מקלווין לצלזיוס
function kelvinToCelsius(kelvin) {
  return Math.round(kelvin - 273.15);
}

// המרת כיוון רוח למעלות לטקסט בעברית
function getWindDirection(degrees) {
  const directions = ['צפון', 'צפון-מזרח', 'מזרח', 'דרום-מזרח', 'דרום', 'דרום-מערב', 'מערב', 'צפון-מערב'];
  return directions[Math.round(degrees / 45) % 8];
}

// פונקציה לחיפוש מיקומים
async function searchLocations(query) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${WEATHER_API_KEY}`
    );
    return response.data.map(location => ({
      lat: location.lat,
      lon: location.lon,
      name: location.local_names?.he || location.name,
      country: location.country
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

// פונקציה לקבלת מזג אוויר נוכחי
async function getCurrentWeather(lat, lon) {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=he`
    );
    
    const data = response.data;
    return {
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      wind_direction: getWindDirection(data.wind.deg),
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

// פונקציה לקבלת תחזית שבועית
async function getForecast(lat, lon) {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=he`
    );
    
    const dailyForecasts = {};
    const data = response.data.list;
    
    // מארגן את התחזית לפי ימים עם הבחנה בין יום ולילה
    data.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();
      
      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          date: date,
          day: { temp: -Infinity, description: '', icon: '' },
          night: { temp: Infinity, description: '', icon: '' },
          min_temp: Infinity,
          max_temp: -Infinity,
          humidity: []
        };
      }

      // עדכון טמפרטורות מינימום ומקסימום
      dailyForecasts[dateKey].min_temp = Math.min(dailyForecasts[dateKey].min_temp, forecast.main.temp);
      dailyForecasts[dateKey].max_temp = Math.max(dailyForecasts[dateKey].max_temp, forecast.main.temp);
      
      // הבחנה בין שעות יום ולילה
      if (hour >= 6 && hour <= 18) {
        // שעות יום
        if (forecast.main.temp > dailyForecasts[dateKey].day.temp) {
          dailyForecasts[dateKey].day = {
            temp: Math.round(forecast.main.temp),
            description: forecast.weather[0].description,
            icon: forecast.weather[0].icon
          };
        }
      } else {
        // שעות לילה
        if (forecast.main.temp < dailyForecasts[dateKey].night.temp) {
          dailyForecasts[dateKey].night = {
            temp: Math.round(forecast.main.temp),
            description: forecast.weather[0].description,
            icon: forecast.weather[0].icon
          };
        }
      }
      
      dailyForecasts[dateKey].humidity.push(forecast.main.humidity);
    });
    
    // המרה למערך ומיצוע של הלחות
    return Object.values(dailyForecasts).map(day => ({
      date: day.date,
      day_temp: day.day.temp !== -Infinity ? day.day.temp : Math.round(day.max_temp),
      day_description: day.day.description || 'לא זמין',
      day_icon: day.day.icon || '01d',
      night_temp: day.night.temp !== Infinity ? day.night.temp : Math.round(day.min_temp),
      night_description: day.night.description || 'לא זמין',
      night_icon: day.night.icon || '01n',
      min_temp: Math.round(day.min_temp),
      max_temp: Math.round(day.max_temp),
      humidity: Math.round(day.humidity.reduce((acc, val) => acc + val, 0) / day.humidity.length)
    })).slice(0, 5); // מחזיר 5 ימים
    
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

export {
  getCurrentWeather,
  getForecast,
  searchLocations,
  getHebrewLocationName
};
