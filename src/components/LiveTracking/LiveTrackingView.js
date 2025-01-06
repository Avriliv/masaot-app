import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import TrackingMap from './TrackingMap';
import SOSButton from './SOSButton';
import ActiveTrips from './ActiveTrips';
import AlertsPanel from './AlertsPanel';
import { useTrips } from '../../context/TripsContext';

// הגדרה גלובלית למשתנה timeoutId
let timeoutId;

const LiveTrackingView = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sosLocations, setSosLocations] = useState([]);
  const { activeTrips, updateTripLocation } = useTrips();
  const [locationAttempts, setLocationAttempts] = useState(0);
  const [isGettingAccurateLocation, setIsGettingAccurateLocation] = useState(false);

  const getAccurateLocation = () => {
    setIsGettingAccurateLocation(true);
    
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsGettingAccurateLocation(false);
        reject(new Error('Geolocation is not supported'));
        return;
      }

      timeoutId = setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        setIsGettingAccurateLocation(false);
        reject(new Error('Timeout getting accurate location'));
      }, 30000);

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (position.coords.accuracy <= 50) {
            clearTimeout(timeoutId);
            navigator.geolocation.clearWatch(watchId);
            setIsGettingAccurateLocation(false);
            resolve(position);
          } else {
            setLocationAttempts((prev) => prev + 1);
            if (locationAttempts === 1) {
              setAlerts((prev) => [
                ...prev.filter((a) => a.type !== 'warning'),
                {
                  id: Date.now(),
                  type: 'warning',
                  message: 'מנסה לקבל מיקום מדויק יותר... אנא המתן',
                  timestamp: new Date(),
                },
              ]);
            }
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          navigator.geolocation.clearWatch(watchId);
          setIsGettingAccurateLocation(false);
          reject(error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    });
  };

  useEffect(() => {
    let isMounted = true;

    const startLocationTracking = async () => {
      try {
        const accuratePosition = await getAccurateLocation();
        if (isMounted && accuratePosition) {
          setCurrentLocation({
            latitude: accuratePosition.coords.latitude,
            longitude: accuratePosition.coords.longitude,
            accuracy: accuratePosition.coords.accuracy,
            timestamp: accuratePosition.timestamp,
          });
          setAlerts((prev) =>
            prev.filter((alert) => alert.type !== 'warning')
          );
        }
      } catch (error) {
        console.error('Error getting accurate location:', error);
      }
    };

    startLocationTracking();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 64px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', position: 'relative' }}>
            <TrackingMap
              currentLocation={currentLocation}
              activeTrips={activeTrips}
              sosLocations={sosLocations}
            />
            <AlertsPanel
              alerts={alerts}
              onDismiss={(id) =>
                setAlerts((prev) => prev.filter((alert) => alert.id !== id))
              }
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 1000,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                {currentLocation ? (
                  <>
                    דיוק: {Math.round(currentLocation.accuracy)} מטרים
                    <br />
                    עדכון אחרון: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </>
                ) : (
                  'מחפש מיקום...'
                )}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000,
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: 3,
              }}
            >
              <SOSButton onSOS={() => {}} currentLocation={currentLocation} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <ActiveTrips trips={activeTrips} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveTrackingView;
