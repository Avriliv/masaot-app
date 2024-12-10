import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { BrowserRouter, Routes, Route, Navigate, UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import RoutePlanning from './components/planning/RoutePlanning';
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
      main: '#2196f3',
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
    fontFamily: 'Assistant, sans-serif',
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
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar pageTitle={pageTitle} pageDescription={pageDescription} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<RoutePlanning />} />
              <Route path="/my-trips" element={<MyTrips />} />
              <Route path="/new-trip" element={<TripPlanningSteps />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/participants" element={<ParticipantsManagement />} />
              <Route path="/security" element={<SecurityManagement />} />
              <Route path="/logistics" element={<LogisticsManagement />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/trip-bag" element={<TripBagView />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;
