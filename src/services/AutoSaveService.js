import debounce from 'lodash/debounce';

class AutoSaveService {
  constructor() {
    this.saveToLocalStorage = debounce(this._saveToLocalStorage, 1000);
    this.saveToServer = debounce(this._saveToServer, 3000);
  }

  // שמירה מקומית
  _saveToLocalStorage(tripId, data) {
    try {
      localStorage.setItem(`trip_${tripId}`, JSON.stringify({
        data,
        lastSaved: new Date().toISOString(),
        version: data.version || 1
      }));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // שמירה בשרת
  async _saveToServer(tripId, data) {
    try {
      // כאן יהיה הקוד לשמירה בשרת
      // const response = await api.saveTrip(tripId, data);
      return true;
    } catch (error) {
      console.error('Error saving to server:', error);
      return false;
    }
  }

  // טעינת נתונים מקומית
  loadFromLocalStorage(tripId) {
    try {
      const savedData = localStorage.getItem(`trip_${tripId}`);
      if (savedData) {
        return JSON.parse(savedData);
      }
      return null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  // טעינת נתונים מהשרת
  async loadFromServer(tripId) {
    try {
      // כאן יהיה הקוד לטעינה מהשרת
      // const response = await api.loadTrip(tripId);
      // return response.data;
      return null;
    } catch (error) {
      console.error('Error loading from server:', error);
      return null;
    }
  }

  // בדיקת קונפליקטים
  checkForConflicts(localData, serverData) {
    if (!localData || !serverData) return false;
    return localData.version !== serverData.version;
  }

  // שמירת שינויים
  saveChanges(tripId, data) {
    // שמירה מקומית
    this.saveToLocalStorage(tripId, data);
    // שמירה בשרת
    this.saveToServer(tripId, data);
  }
}

export const autoSaveService = new AutoSaveService();
