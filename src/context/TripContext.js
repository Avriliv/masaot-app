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
  },
  route: {
    startPoint: null,
    endPoint: null,
    checkpoints: [],
    selectedTrails: [],
    dailySegments: [], // מקטעים יומיים
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
};

function tripReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'INIT_TRIP':
      return { ...initialState, ...action.payload, id: action.payload.id };
      
    case 'UPDATE_BASIC_DETAILS':
      newState = {
        ...state,
        basicDetails: { ...state.basicDetails, ...action.payload },
        version: state.version + 1,
        lastModified: new Date().toISOString(),
      };
      break;
      
    case 'UPDATE_ROUTE':
      newState = {
        ...state,
        route: { ...state.route, ...action.payload },
        version: state.version + 1,
        lastModified: new Date().toISOString(),
      };
      break;
      
    case 'UPDATE_POINTS':
      newState = {
        ...state,
        points: action.payload,
        version: state.version + 1,
        lastModified: new Date().toISOString(),
      };
      break;
      
    case 'UPDATE_TIMELINE':
      newState = {
        ...state,
        timeline: action.payload,
        version: state.version + 1,
        lastModified: new Date().toISOString(),
      };
      break;
      
    case 'UPDATE_APPROVALS':
      newState = {
        ...state,
        approvals: { ...state.approvals, ...action.payload },
        version: state.version + 1,
        lastModified: new Date().toISOString(),
      };
      break;
      
    case 'UPDATE_BUDGET':
      newState = {
        ...state,
        budget: { ...state.budget, ...action.payload },
        version: state.version + 1,
        lastModified: new Date().toISOString(),
      };
      break;
      
    case 'UPDATE_STATUS':
      newState = {
        ...state,
        status: action.payload,
        version: state.version + 1,
        lastModified: new Date().toISOString(),
      };
      break;
      
    case 'SET_LAST_SAVED':
      newState = {
        ...state,
        lastSaved: action.payload,
      };
      break;
      
    default:
      return state;
  }
  
  return newState;
}

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // שמירה אוטומטית בכל שינוי
  useEffect(() => {
    if (state.id && state.lastModified && (!state.lastSaved || state.lastModified > state.lastSaved)) {
      autoSaveService.saveChanges(state.id, state);
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
    }
  }, [state.lastModified]);

  // טעינת נתונים בהתחלה
  useEffect(() => {
    if (state.id) {
      const loadData = async () => {
        // ניסיון לטעון מהשרת
        const serverData = await autoSaveService.loadFromServer(state.id);
        // טעינה מקומית
        const localData = autoSaveService.loadFromLocalStorage(state.id);
        
        // בחירת הגרסה העדכנית ביותר
        if (serverData && localData) {
          const useServerData = new Date(serverData.lastModified) > new Date(localData.lastModified);
          dispatch({ type: 'INIT_TRIP', payload: useServerData ? serverData : localData });
        } else if (serverData) {
          dispatch({ type: 'INIT_TRIP', payload: serverData });
        } else if (localData) {
          dispatch({ type: 'INIT_TRIP', payload: localData });
        }
      };
      
      loadData();
    }
  }, [state.id]);

  const value = {
    tripState: state,
    updateBasicDetails: (details) =>
      dispatch({ type: 'UPDATE_BASIC_DETAILS', payload: details }),
    updateRoute: (routeDetails) =>
      dispatch({ type: 'UPDATE_ROUTE', payload: routeDetails }),
    updateTripPoints: (points) =>
      dispatch({ type: 'UPDATE_POINTS', payload: points }),
    updateTimeline: (timeline) =>
      dispatch({ type: 'UPDATE_TIMELINE', payload: timeline }),
    updateApprovals: (approvals) =>
      dispatch({ type: 'UPDATE_APPROVALS', payload: approvals }),
    updateBudget: (budget) =>
      dispatch({ type: 'UPDATE_BUDGET', payload: budget }),
    updateStatus: (status) =>
      dispatch({ type: 'UPDATE_STATUS', payload: status }),
    initTrip: (tripData) =>
      dispatch({ type: 'INIT_TRIP', payload: tripData }),
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
