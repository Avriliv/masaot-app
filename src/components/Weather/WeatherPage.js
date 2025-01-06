import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { 
  WbSunny as SunIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  WaterDrop as WaterDropIcon,
  Air as WindIcon,
  Cloud as CloudIcon,
  Thunderstorm as StormIcon,
  AcUnit as SnowIcon,
  WbCloudy as CloudyIcon,
  Opacity as RainIcon
} from '@mui/icons-material';
import { getCurrentWeather, getForecast, searchLocations, getHebrewLocationName } from '../../services/WeatherService';

const WeatherPage = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setCurrentLocation(location);
          const name = await getHebrewLocationName(location.lat, location.lon);
          setSearchQuery(name || '');
          await fetchWeatherData(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('לא הצלחנו לאתר את המיקום שלך. אנא הזן מיקום ידנית.');
          setLoading(false);
        }
      );
    }
  }, []);

  const fetchWeatherData = async (location) => {
    try {
      setLoading(true);
      setError(null);
      const [current, forecastData] = await Promise.all([
        getCurrentWeather(location.lat, location.lon),
        getForecast(location.lat, location.lon)
      ]);
      setWeatherData(current);
      setForecast(forecastData);
    } catch (error) {
      console.error(error);
      setError('אירעה שגיאה בטעינת נתוני מזג האוויר');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const locations = await searchLocations(searchQuery);
      if (locations.length > 0) {
        const location = locations[0];
        setCurrentLocation({ lat: location.lat, lon: location.lon });
        await fetchWeatherData({ lat: location.lat, lon: location.lon });
      } else {
        setError('לא נמצאו תוצאות עבור החיפוש');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setError('אירעה שגיאה בחיפוש המיקום');
    }
  };

  const getWeatherIcon = (iconCode) => {
    // מיפוי קודי האייקונים של OpenWeather לאייקונים של Material-UI
    const iconMap = {
      // יום בהיר
      '01d': <SunIcon sx={{ fontSize: 40, color: '#FFB300' }} />,
      // לילה בהיר
      '01n': <SunIcon sx={{ fontSize: 40, color: '#FDD835' }} />,
      // מעונן חלקית ביום
      '02d': <CloudyIcon sx={{ fontSize: 40, color: '#90CAF9' }} />,
      // מעונן חלקית בלילה
      '02n': <CloudyIcon sx={{ fontSize: 40, color: '#64B5F6' }} />,
      // מעונן
      '03d': <CloudIcon sx={{ fontSize: 40, color: '#64B5F6' }} />,
      '03n': <CloudIcon sx={{ fontSize: 40, color: '#42A5F5' }} />,
      // מעונן כבד
      '04d': <CloudIcon sx={{ fontSize: 40, color: '#42A5F5' }} />,
      '04n': <CloudIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
      // גשם קל
      '09d': <RainIcon sx={{ fontSize: 40, color: '#1976D2' }} />,
      '09n': <RainIcon sx={{ fontSize: 40, color: '#1565C0' }} />,
      // גשם
      '10d': <RainIcon sx={{ fontSize: 40, color: '#1565C0' }} />,
      '10n': <RainIcon sx={{ fontSize: 40, color: '#0D47A1' }} />,
      // סופת רעמים
      '11d': <StormIcon sx={{ fontSize: 40, color: '#5C6BC0' }} />,
      '11n': <StormIcon sx={{ fontSize: 40, color: '#3F51B5' }} />,
      // שלג
      '13d': <SnowIcon sx={{ fontSize: 40, color: '#90CAF9' }} />,
      '13n': <SnowIcon sx={{ fontSize: 40, color: '#64B5F6' }} />,
    };
    
    return iconMap[iconCode] || <SunIcon sx={{ fontSize: 40, color: '#FFB300' }} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            mb: 3,
            fontFamily: 'Assistant, sans-serif',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              borderRadius: '2px'
            }
          }}
        >
          מזג אוויר למטיילים
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש מיקום..."
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}

        {weatherData && (
          <Card sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, #64B5F6 0%, #90CAF9 100%)', 
            boxShadow: 3 
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="div" sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#1a237e',
                  fontWeight: 500,
                  textShadow: '1px 1px 0px rgba(255,255,255,0.5)'
                }}>
                  <LocationIcon sx={{ mr: 1, color: '#1a237e' }} />
                  {searchQuery}
                </Typography>
                {getWeatherIcon(weatherData.icon)}
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.15) 0%, rgba(225, 245, 254, 0.25) 100%)',
                    backdropFilter: 'blur(10px)',
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h2" component="div" gutterBottom sx={{ 
                      color: '#1a237e', 
                      fontWeight: 'bold',
                      textShadow: '1px 1px 0px rgba(255,255,255,0.5)'
                    }}>
                      {weatherData.temperature}°C
                    </Typography>
                    <Typography variant="subtitle1" sx={{ 
                      color: '#283593', 
                      fontWeight: 500 
                    }}>
                      {weatherData.description}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={8}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 4, 
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}>
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.15) 0%, rgba(225, 245, 254, 0.25) 100%)',
                      backdropFilter: 'blur(10px)',
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      flex: 1,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#1a237e',
                        fontWeight: 500,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <WaterDropIcon sx={{ mr: 1, color: '#1a237e' }} />
                        לחות
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        color: '#283593',
                        fontWeight: 'bold' 
                      }}>
                        {weatherData.humidity}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.15) 0%, rgba(225, 245, 254, 0.25) 100%)',
                      backdropFilter: 'blur(10px)',
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      flex: 1,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#1a237e',
                        fontWeight: 500,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <WindIcon sx={{ mr: 1, color: '#1a237e' }} />
                        רוח
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        color: '#283593',
                        fontWeight: 'bold' 
                      }}>
                        {weatherData.wind_speed} קמ"ש
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#283593',
                        fontWeight: 500 
                      }}>
                        {weatherData.wind_direction}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {forecast.length > 0 && (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                color: 'primary.dark',
                fontWeight: 600,
                mb: 3,
                fontFamily: 'Assistant, sans-serif',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  display: 'inline-block',
                  width: '4px',
                  height: '24px',
                  backgroundColor: 'primary.main',
                  marginLeft: '10px',
                  borderRadius: '2px'
                }
              }}
            >
              תחזית ל-5 ימים הקרובים
            </Typography>
            <Grid container spacing={2}>
              {forecast.map((day, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: '#1a237e',
                          textAlign: 'center',
                          fontWeight: 500,
                          mb: 2
                        }} 
                        gutterBottom
                      >
                        {new Date(day.date).toLocaleDateString('he-IL', { weekday: 'long' })}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        {/* מזג אוויר ביום */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          bgcolor: 'primary.light',
                          p: 1,
                          borderRadius: 1,
                          width: '100%'
                        }}>
                          <Typography variant="caption" sx={{ color: '#1a237e' }}>יום</Typography>
                          {getWeatherIcon(day.day_icon)}
                          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                            {day.day_temp}°C
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#283593', textAlign: 'center' }}>
                            {day.day_description}
                          </Typography>
                        </Box>

                        {/* מזג אוויר בלילה */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          bgcolor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          width: '100%'
                        }}>
                          <Typography variant="caption" sx={{ color: '#1a237e' }}>לילה</Typography>
                          {getWeatherIcon(day.night_icon)}
                          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                            {day.night_temp}°C
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#283593', textAlign: 'center' }}>
                            {day.night_description}
                          </Typography>
                        </Box>

                        {/* לחות */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <WaterDropIcon sx={{ fontSize: 16, mr: 0.5, color: '#1a237e' }} />
                          <Typography variant="body2" sx={{ color: '#283593' }}>
                            {day.humidity}% לחות
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default WeatherPage;
