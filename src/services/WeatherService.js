import axios from 'axios';

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// המרת קואורדינטות לעברית
const getHebrewLocationName = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );
    return response.data[0].local_names?.he || response.data[0].name;
  } catch (error) {
    console.error('Error getting Hebrew location name:', error);
    return '';
  }
};

// המרת טמפרטורה מקלווין לצלזיוס
const kelvinToCelsius = (kelvin) => Math.round(kelvin - 273.15);

// המרת כיוון רוח למעלות לטקסט בעברית
const getWindDirection = (degrees) => {
  const windDirections = {
    0: 'צפון',
    45: 'צפון-מזרח',
    90: 'מזרח',
    135: 'דרום-מזרח',
    180: 'דרום',
    225: 'דרום-מערב',
    270: 'מערב',
    315: 'צפון-מערב',
    360: 'צפון'
  };

  const normalizedDegrees = ((degrees + 22.5) % 360);
  const index = Math.floor(normalizedDegrees / 45) * 45;
  return windDirections[index] || 'לא ידוע';
};

// פונקציה לקבלת מזג אוויר נוכחי
export const getCurrentWeather = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'he'
      }
    });

    const locationName = await getHebrewLocationName(lat, lon);

    return {
      locationName: locationName || response.data.name,
      temp: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      wind_speed: Math.round(response.data.wind.speed * 3.6), // המרה ממטר/שניה לקמ"ש
      wind_direction: getWindDirection(response.data.wind.deg)
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

// פונקציה לקבלת תחזית מזג אוויר
export const getForecast = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'he'
      }
    });

    // מארגן את התחזית לפי ימים
    const dailyForecasts = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          temps: [],
          descriptions: [],
          icons: []
        };
      }
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].descriptions.push(item.weather[0].description);
      dailyForecasts[date].icons.push(item.weather[0].icon);
    });

    // ממיר את הנתונים לפורמט הרצוי
    return Object.entries(dailyForecasts).slice(0, 5).map(([date, data]) => ({
      date: new Date(date).toISOString(),
      temp: {
        min: Math.round(Math.min(...data.temps)),
        max: Math.round(Math.max(...data.temps))
      },
      description: data.descriptions[Math.floor(data.descriptions.length / 2)], // לוקח את התיאור מאמצע היום
      icon: data.icons[Math.floor(data.icons.length / 2)] // לוקח את האייקון מאמצע היום
    }));
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

// פונקציה לקבלת התראות מזג אוויר
export const getTevaAlerts = async () => {
  try {
    // כרגע אין לנו גישה להתראות מזג אוויר בישראל
    // נחזיר מערך ריק
    return [];
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    return [];
  }
};

// פונקציה לחיפוש מיקומים
export const searchLocations = async (query) => {
  try {
    // קודם נחפש בישראל
    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: `${query},IL`,
        limit: 5,
        appid: API_KEY
      }
    });

    // אם אין תוצאות מישראל, נחפש בכל העולם
    if (response.data.length === 0) {
      const globalResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: API_KEY
        }
      });
      return globalResponse.data.map(location => ({
        name: location.local_names?.he || location.name,
        lat: location.lat,
        lon: location.lon,
        country: location.country,
        state: location.state,
        displayName: `${location.local_names?.he || location.name}${location.state ? `, ${location.state}` : ''}, ${location.country}`
      }));
    }

    return response.data.map(location => ({
      name: location.local_names?.he || location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country,
      state: location.state,
      displayName: `${location.local_names?.he || location.name}${location.state ? `, ${location.state}` : ''}`
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

export const searchPlaces = async (query) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=il`);
    return response.data.map(place => ({
      id: place.place_id,
      name: place.display_name,
      position: [parseFloat(place.lat), parseFloat(place.lon)]
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

export const fetchNearbyPlaces = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16&addressdetails=1`
    );
    return {
      name: response.data.display_name,
      type: response.data.type,
      details: response.data.address
    };
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return null;
  }
};
