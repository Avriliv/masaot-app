import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Map from './components/Map/Map';
import Navbar from './components/Navbar';
import HomePage from './components/LandingPage';
import MyTrips from './components/myTrips/MyTrips';
import TripPlanningSteps from './components/Trip/TripPlanningSteps';
import WeatherPage from './components/Weather/WeatherPage';
import ParticipantsManagement from './components/Participants/ParticipantsManagement';
import SecurityManagement from './components/Security/SecurityManagement';
import LogisticsManagement from './components/Logistics/LogisticsManagement';
import DashboardPage from './components/Trip/DashboardPage';
import TripBagView from './components/tripBag/TripBagView';
import TripDetails from './components/Trip/TripDetails';
import ParentalApprovalForm from './components/approvals/ParentalApprovalForm';
import LearningCenter from './components/Learning/LearningCenter';
import LiveTrackingView from './components/LiveTracking/LiveTrackingView';
import { TripProvider } from './context/TripContext';
import { TripsProvider } from './context/TripsContext';

// Create rtl cache
const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create theme
const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
  },
  typography: {
    fontFamily: [
      'Rubik',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

const App = () => {
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');

  useEffect(() => {
    const handleTitleUpdate = (event) => {
      setPageTitle(event.detail.title);
      setPageDescription(event.detail.description);
    };

    document.addEventListener('updatePageTitle', handleTitleUpdate);
    return () => {
      document.removeEventListener('updatePageTitle', handleTitleUpdate);
    };
  }, []);

  return (
    <TripsProvider>
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <TripProvider>
            <Router>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar pageTitle={pageTitle} pageDescription={pageDescription} />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/my-trips" element={<MyTrips />} />
                  <Route path="/new-trip" element={<TripPlanningSteps />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route path="/learning-center" element={<LearningCenter />} />
                  <Route path="/participants" element={<ParticipantsManagement />} />
                  <Route path="/security" element={<SecurityManagement />} />
                  <Route path="/logistics" element={<LogisticsManagement />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/trip-bag" element={<TripBagView />} />
                  <Route path="/trip/:tripId" element={<TripDetails />} />
                  <Route path="/approval/:tripId/:participantId" element={<ParentalApprovalForm />} />
                  <Route path="/live-tracking" element={<LiveTrackingView />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Box>
            </Router>
          </TripProvider>
        </ThemeProvider>
      </CacheProvider>
    </TripsProvider>
  );
};

export default App;
