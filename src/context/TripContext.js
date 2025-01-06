import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { autoSaveService } from '../services/AutoSaveService';

const TripContext = createContext();

const initialState = {
  id: null,
  version: 1,
  basicDetails: {
    tripName: '',
    startDate: null,
    endDate: null,
    participantsCount: 0,
    ageGroup: '',
    organization: '',
    description: '',
    numDays: '',
    numStudents: '',
    numStaff: '',
    organizationType: ''
  },
  route: {
    startPoint: null,
    endPoint: null,
    checkpoints: [],
    selectedTrails: [],
    dailySegments: [], // מקטעים יומיים
  },
  logistics: {
    transportation: '',
    accommodation: '',
    food: '',
    equipment: ''
  },
  points: [],
  timeline: [],
  approvals: {
    parentalConsent: false,
    educationMinistry: false,
    natureReserves: false,
    items: [],
  },
  budget: {
    items: [],
    totalEstimated: 0,
    totalActual: 0,
  },
  status: 'draft',
  lastSaved: null,
  lastModified: null,
  mapDetails: {}
};

function tripReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'INIT_TRIP':
      return {
        ...initialState,
        ...action.payload,
        lastModified: new Date().toISOString()
      };
      
    case 'UPDATE_BASIC_DETAILS':
      newState = {
        ...state,
        basicDetails: {
          ...state.basicDetails,
          ...action.payload
        },
        lastModified: new Date().toISOString(),
        version: state.version + 1
      };
      return newState;

    case 'UPDATE_MAP_DETAILS':
      newState = {
        ...state,
        mapDetails: {
          ...state.mapDetails,
          ...action.payload
        },
        lastModified: new Date().toISOString(),
        version: state.version + 1
      };
      return newState;

    case 'UPDATE_ROUTE':
      newState = {
        ...state,
        route: {
          ...state.route,
          ...action.payload
        },
        lastModified: new Date().toISOString(),
        version: state.version + 1
      };
      return newState;

    case 'UPDATE_POINTS':
      // אם אין שינוי בנקודות, לא נעדכן את המצב
      if (JSON.stringify(state.points) === JSON.stringify(action.payload)) {
        return state;
      }
      newState = {
        ...state,
        points: action.payload,
        lastModified: new Date().toISOString(),
        version: state.version + 1
      };
      return newState;

    case 'UPDATE_TIMELINE':
      newState = {
        ...state,
        timeline: action.payload,
        lastModified: new Date().toISOString(),
        version: state.version + 1
      };
      return newState;

    case 'UPDATE_APPROVALS':
      newState = {
        ...state,
        approvals: {
          ...state.approvals,
          ...action.payload
        },
        lastModified: new Date().toISOString(),
        version: state.version + 1
      };
      return newState;

    case 'UPDATE_BUDGET':
      newState = {
        ...state,
        budget: {
          ...state.budget,
          ...action.payload
        },
        lastModified: new Date().toISOString(),
        version: state.version + 1
      };
      return newState;

    case 'UPDATE_TRIP':
      newState = {
        ...state,
        ...action.payload,
        lastModified: new Date().toISOString(),
        version: state.version + 1
      };
      return newState;

    case 'SAVE_TO_MY_TRIPS':
      // שמירת הטיול ברשימת הטיולים
      const savedTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
      const tripToSave = {
        ...state,
        id: state.id || Date.now().toString(),
        status: 'draft',
        lastModified: new Date().toISOString()
      };
      
      // בדיקה אם הטיול כבר קיים ועדכון אם כן
      const tripIndex = savedTrips.findIndex(t => t.id === tripToSave.id);
      if (tripIndex !== -1) {
        savedTrips[tripIndex] = tripToSave;
      } else {
        savedTrips.push(tripToSave);
      }
      
      localStorage.setItem('myTrips', JSON.stringify(savedTrips));
      return tripToSave;

    default:
      return state;
  }
}

export function TripProvider({ children }) {
  const [tripState, dispatch] = useReducer(tripReducer, initialState);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        // נטען את כל הטיולים מהלוקל סטורג'
        const trips = JSON.parse(localStorage.getItem('trips') || '[]');
        
        // נבדוק אם יש ID בכתובת ה-URL
        const urlParams = new URLSearchParams(window.location.search);
        const tripId = window.location.pathname.split('/trip/')[1];
        
        if (tripId) {
          // אם יש ID בכתובת, נחפש את הטיול המתאים
          const savedTrip = trips.find(t => t.id === tripId);
          if (savedTrip) {
            dispatch({ type: 'INIT_TRIP', payload: savedTrip });
            return;
          }
        }
        
        // אם אין ID או לא מצאנו את הטיול, ננסה לטעון מה-AutoSave
        const savedTrip = await autoSaveService.loadTrip();
        if (savedTrip) {
          dispatch({ type: 'INIT_TRIP', payload: savedTrip });
        } else {
          // אם אין טיול שמור, ניצור טיול חדש
          const newTrip = {
            ...initialState,
            id: Date.now().toString(),
            lastModified: new Date().toISOString()
          };
          dispatch({ type: 'INIT_TRIP', payload: newTrip });
        }
      } catch (error) {
        console.error('Failed to load trip:', error);
        // במקרה של שגיאה, ניצור טיול חדש
        const newTrip = {
          ...initialState,
          id: Date.now().toString(),
          lastModified: new Date().toISOString()
        };
        dispatch({ type: 'INIT_TRIP', payload: newTrip });
      }
    };
    loadTrip();
  }, []);

  useEffect(() => {
    if (tripState.lastModified && tripState.id) {
      autoSaveService.saveTrip(tripState);
    }
  }, [tripState.version]);

  const updateBasicDetails = (details) => {
    dispatch({ type: 'UPDATE_BASIC_DETAILS', payload: details });
  };

  const updateMapDetails = (details) => {
    dispatch({ type: 'UPDATE_MAP_DETAILS', payload: details });
  };

  const updateRoute = (routeData) => {
    // שמירת נתוני המסלול בלוקל סטורג'
    const updatedRoute = {
      ...tripState.route,
      ...routeData,
      lastModified: new Date().toISOString()
    };
    
    dispatch({ 
      type: 'UPDATE_ROUTE',
      payload: updatedRoute
    });

    // שמירת הטיול המעודכן בלוקל סטורג'
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const tripIndex = trips.findIndex(t => t.id === tripState.id);
    
    if (tripIndex !== -1) {
      trips[tripIndex] = {
        ...trips[tripIndex],
        route: updatedRoute
      };
    } else {
      trips.push({
        ...tripState,
        route: updatedRoute
      });
    }
    
    localStorage.setItem('trips', JSON.stringify(trips));
  };

  const updatePoints = (points) => {
    dispatch({ type: 'UPDATE_POINTS', payload: points });
  };

  const updateTimeline = (timeline) => {
    dispatch({ type: 'UPDATE_TIMELINE', payload: timeline });
  };

  const updateApprovals = (approvals) => {
    dispatch({ type: 'UPDATE_APPROVALS', payload: approvals });
  };

  const updateBudget = (budget) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  };

  const updateTrip = (trip) => {
    dispatch({ type: 'UPDATE_TRIP', payload: trip });
  };

  const saveToMyTrips = () => {
    // יצירת אובייקט טיול מעודכן עם סטטוס טיוטה ותאריך עדכון אחרון
    const updatedTrip = {
      ...tripState,
      status: 'draft',
      lastModified: new Date().toISOString()
    };

    // קבלת רשימת הטיולים הקיימת מה-localStorage
    const existingTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    
    // הוספת הטיול החדש לרשימה
    const newTrips = [...existingTrips, updatedTrip];
    
    // שמירת הרשימה המעודכנת ב-localStorage
    localStorage.setItem('trips', JSON.stringify(newTrips));
    
    // עדכון מצב הטיול בקונטקסט
    updateTrip(updatedTrip);
  };

  const saveTripToMyTrips = (tripData) => {
    const myTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
    const updatedTrip = {
      ...tripData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    myTrips.push(updatedTrip);
    localStorage.setItem('myTrips', JSON.stringify(myTrips));
  };

  const value = {
    tripState,
    updateBasicDetails,
    updateMapDetails,
    updateRoute,
    updatePoints,
    updateTimeline,
    updateApprovals,
    updateBudget,
    updateTrip,
    saveToMyTrips,
    saveTripToMyTrips
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
