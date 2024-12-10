import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Autocomplete,
  Paper,
  AlertTitle
} from '@mui/material';
import {
  Search as SearchIcon,
  WbSunny as SunIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  WaterDrop as WaterDropIcon,
  Air as AirIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {
  getCurrentWeather,
  getForecast,
  searchLocations,
  getTevaAlerts
} from '../../services/WeatherService';

const WeatherCard = ({ lat, lon, showSearch = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // קבלת מזג אוויר כשיש קואורדינטות
  useEffect(() => {
    if (lat && lon) {
      handleLocationSelect({ lat, lon });
    }
  }, [lat, lon]);

  // קבלת התראות
  useEffect(() => {
    const fetchAlerts = async () => {
      const alertsData = await getTevaAlerts();
      setAlerts(alertsData);
    };
    fetchAlerts();
  }, []);

  // חיפוש מיקומים
  const handleLocationSearch = async (searchText) => {
    if (!searchText) return;
    try {
      const locations = await searchLocations(searchText);
      setLocationOptions(locations);
    } catch (error) {
      console.error('Error searching locations:', error);
      setError('שגיאה בחיפוש מיקומים');
    }
  };

  // בחירת מיקום
  const handleLocationSelect = (event, location) => {
    if (location) {
      setSelectedLocation(location);
      const weather = getCurrentWeather(location.lat, location.lon);
      setCurrentWeather(weather);
      const forecastData = getForecast(location.lat, location.lon);
      setForecast(forecastData);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // רינדור תוכן הכרטיסייה
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // מזג אוויר נוכחי
        return currentWeather ? (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 500, color: 'primary.main' }} gutterBottom>
              {currentWeather.locationName}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
              <img 
                src={`https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`}
                alt={currentWeather.description}
                style={{ width: 100, height: 100 }}
              />
              <Box sx={{ textAlign: 'start', ml: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {currentWeather.temp}°C
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  {currentWeather.description}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 4,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <WaterDropIcon sx={{ color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  לחות
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                  {currentWeather.humidity}%
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <AirIcon sx={{ color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  רוח
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                  {currentWeather.wind_speed} קמ"ש
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {currentWeather.wind_direction}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : null;

      case 1: // תחזית
        return (
          <Box sx={{ mt: 2, px: 2 }}>
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'background.paper',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'primary.main',
                borderRadius: 4,
              },
            }}>
              {forecast.map((day, index) => (
                <Paper
                  key={index}
                  elevation={1}
                  sx={{
                    p: 2,
                    minWidth: 160,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                    {new Date(day.date).toLocaleDateString('he-IL', { weekday: 'long' })}
                  </Typography>
                  <img 
                    src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                    alt={day.description}
                    style={{ width: 50, height: 50 }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {day.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
                    <ArrowUpwardIcon sx={{ color: 'error.main', fontSize: 16 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {day.temp.max}°
                    </Typography>
                    <ArrowDownwardIcon sx={{ color: 'info.main', fontSize: 16, ml: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {day.temp.min}°
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 2: // התראות
        return alerts.length > 0 ? (
          <List sx={{ mt: 2 }}>
            {alerts.map((alert, index) => (
              <ListItem key={index}>
                <Alert 
                  severity={alert.severity}
                  sx={{ 
                    width: '100%', 
                    mb: 1,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: '2rem'
                    }
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {alert.title}
                  </AlertTitle>
                  <Typography variant="body1">
                    {alert.description}
                  </Typography>
                </Alert>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            color: 'text.secondary',
            bgcolor: 'background.paper',
            borderRadius: 2,
            mt: 2
          }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6">
              אין התראות מזג אוויר כרגע
            </Typography>
            <Typography variant="body2">
              מזג האוויר נוח ובטוח לטיול
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  // רינדור תיבת החיפוש
  const renderSearchBox = () => (
    <Autocomplete
      sx={{ mb: 2 }}
      options={locationOptions}
      getOptionLabel={(option) => option.displayName || ''}
      onChange={handleLocationSelect}
      onInputChange={(event, value) => {
        if (value) handleLocationSearch(value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="חפש מיקום"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <LocationIcon color="action" />
                {params.InputProps.startAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="body1">
              {option.name}
            </Typography>
            {option.state && (
              <Typography variant="body2" color="text.secondary">
                {option.state}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      loading={loading}
      loadingText="מחפש מיקומים..."
      noOptionsText="לא נמצאו תוצאות"
    />
  );

  return (
    <Card elevation={showSearch ? 3 : 0} sx={{ bgcolor: showSearch ? 'background.paper' : 'transparent' }}>
      <CardContent>
        {/* הודעת שגיאה */}
        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}

        {/* חיפוש מיקום */}
        {showSearch && (
          <Box sx={{ mb: 3 }}>
            {renderSearchBox()}
          </Box>
        )}

        {/* טאבים */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minWidth: 0,
                flex: 1
              }
            }}
          >
            <Tab label="מזג אוויר נוכחי" />
            <Tab label="תחזית" />
            <Tab label="התראות" />
          </Tabs>
        </Box>

        {/* תוכן */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {renderTabContent()}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
