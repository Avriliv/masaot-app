import React from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';
import WeatherCard from '../components/Weather/WeatherCard';

const WeatherPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        pt: 4,
        pb: 4,
        position: 'relative'
      }}
    >
      {/* כפתור חזרה לדף הבית */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: '#1e88e5',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          <HomeIcon />
        </IconButton>
      </Box>

      <Container maxWidth="md">
        {/* כותרת */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: '#1976d2',
              fontWeight: 'bold',
              mb: 1
            }}
          >
            מזג האוויר
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            תחזית מזג האוויר ועדכונים חשובים ממוקד טבע
          </Typography>
        </Box>

        {/* קומפוננטת מזג האוויר */}
        <WeatherCard />
      </Container>
    </Box>
  );
};

export default WeatherPage;
