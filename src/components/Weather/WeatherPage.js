import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, AlertTitle, Paper } from '@mui/material';
import WeatherCard from './WeatherCard';

const WeatherPage = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // נסה להשיג את המיקום הנוכחי
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Error getting location:', error);
          // נקודת ברירת מחדל - ירושלים
          setLocation({
            lat: 31.7683,
            lon: 35.2137
          });
        }
      );
    } else {
      setError('הדפדפן שלך לא תומך באיתור מיקום');
      // נקודת ברירת מחדל - ירושלים
      setLocation({
        lat: 31.7683,
        lon: 35.2137
      });
    }
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(-20px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          מזג אוויר
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          קבל תחזית מזג אוויר מדויקת לכל מקום בישראל, כולל טמפרטורות, תנאי מזג אוויר והתראות מיוחדות למטיילים
        </Typography>
      </Box>

      {error ? (
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            mb: 4,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <AlertTitle>שגיאה</AlertTitle>
          {error}
        </Alert>
      ) : null}

      {location && (
        <Paper 
          elevation={3}
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}
        >
          <WeatherCard 
            lat={location.lat} 
            lon={location.lon}
            showSearch={true}
          />
        </Paper>
      )}

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          * הנתונים מתעדכנים כל 10 דקות
        </Typography>
        <Typography variant="body2" color="text.secondary">
          * התחזית מבוססת על נתוני OpenWeatherMap
        </Typography>
      </Box>
    </Container>
  );
};

export default WeatherPage;
