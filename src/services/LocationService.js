// שירות לטיפול במיקומים
const LocationService = {
  // חיפוש מקומות באמצעות Nominatim
  searchPlaces: async (query) => {
    if (!query?.trim()) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&` +
        `viewbox=34.2674,33.4362,35.8950,29.4533&` +
        `bounded=1&limit=5&countrycodes=IL`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      // המרת הנתונים לפורמט שלנו
      return data.map(place => ({
        label: place.display_name.split(',')[0],
        fullAddress: place.display_name,
        coordinates: [place.lat, place.lon],
        type: place.type,
        category: place.class,
        value: place.place_id
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  },

  // המרת מיקום לכתובת
  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${latitude}&lon=${longitude}`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      return {
        label: data.display_name.split(',')[0],
        fullAddress: data.display_name,
        coordinates: [data.lat, data.lon],
        type: data.type,
        category: data.class,
        value: data.place_id
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  },

  // קבלת מיקום מדויק עם ניסיונות חוזרים
  getCurrentLocation: async (onStatusUpdate) => {
    let bestAccuracy = Infinity;
    let bestLocation = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    const TIMEOUT_PER_ATTEMPT = 4000;

    try {
      if (navigator.geolocation) {
        onStatusUpdate?.("מנסה לקבל מיקום מדויק...");

        // ניסיון לקבל כמה מיקומים ולבחור את המדויק ביותר
        while (attempts < MAX_ATTEMPTS) {
          attempts++;
          onStatusUpdate?.(`ניסיון ${attempts} מתוך ${MAX_ATTEMPTS} לקבלת מיקום מדויק`);

          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy: true,
                  timeout: TIMEOUT_PER_ATTEMPT,
                  maximumAge: 0
                }
              );
            });

            // בדיקה אם המיקום הנוכחי מדויק יותר
            if (position.coords.accuracy < bestAccuracy) {
              bestAccuracy = position.coords.accuracy;
              bestLocation = {
                source: 'GPS',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                timestamp: new Date(),
                accuracyText: `דיוק: ${Math.round(position.coords.accuracy)} מטרים`
              };

              onStatusUpdate?.(`נמצא מיקום מדויק יותר (${bestLocation.accuracyText})`);

              // אם הדיוק מספיק טוב, נפסיק את החיפוש
              if (bestAccuracy < 20) { // פחות מ-20 מטר
                onStatusUpdate?.("נמצא מיקום מדויק מאוד!");
                break;
              }
            }

            // המתנה קצרה בין ניסיונות
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.warn(`ניסיון ${attempts} נכשל:`, error);
            onStatusUpdate?.(`ניסיון ${attempts} נכשל, מנסה שוב...`);
          }
        }

        // אם מצאנו מיקום כלשהו, נחזיר אותו
        if (bestLocation) {
          return bestLocation;
        }
      }

      // אם לא הצלחנו לקבל מיקום GPS או שאין תמיכה ב-GPS
      onStatusUpdate?.("לא ניתן לקבל מיקום GPS, משתמש במיקום מבוסס IP...");
      
      const response = await fetch('https://api.ipstack.com/check?access_key=YOUR_API_KEY');
      const data = await response.json();

      const ipLocation = {
        source: 'IP',
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: 5000, // דיוק משוער במטרים
        altitude: null,
        timestamp: new Date(),
        city: data.city,
        country: data.country_name,
        isp: data.connection?.isp,
        accuracyText: "דיוק: ~5 קילומטרים (מבוסס IP)"
      };

      onStatusUpdate?.(`התקבל מיקום מבוסס IP (${ipLocation.accuracyText})`);
      return ipLocation;

    } catch (error) {
      onStatusUpdate?.("שגיאה בקבלת המיקום");
      console.error('Error getting location:', error);
      throw error;
    }
  },

  // מעקב אחר שינויי מיקום עם סינון לפי דיוק
  watchLocation: (callback, errorCallback, onStatusUpdate) => {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported'));
      return;
    }

    let lastAccuracy = Infinity;
    onStatusUpdate?.("מתחיל מעקב אחר מיקום...");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // בדיקה אם המיקום החדש מדויק יותר
        if (position.coords.accuracy < lastAccuracy || 
            position.coords.accuracy < 50) { // נעדכן אם הדיוק טוב מספיק
          
          lastAccuracy = position.coords.accuracy;
          const location = {
            source: 'GPS',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: new Date(),
            accuracyText: `דיוק: ${Math.round(position.coords.accuracy)} מטרים`
          };

          onStatusUpdate?.(`התקבל עדכון מיקום חדש (${location.accuracyText})`);
          callback(location);
        } else {
          onStatusUpdate?.("התקבל מיקום פחות מדויק, ממשיך לחפש...");
        }
      },
      (error) => {
        onStatusUpdate?.("שגיאה במעקב אחר המיקום");
        errorCallback(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      onStatusUpdate?.("הפסקת מעקב אחר מיקום");
      navigator.geolocation.clearWatch(watchId);
    };
  },

  // חישוב מרחק בין שתי נקודות (בקילומטרים)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // רדיוס כדור הארץ בקילומטרים
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};

export default LocationService;
