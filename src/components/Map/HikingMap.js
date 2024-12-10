import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// הגדרת סמלים מותאמים למפה
const startIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const waypointIcon = startIcon;
const endIcon = startIcon;

// פונקציה לחישוב מרחק בין שתי נקודות בקילומטרים
const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;
  
  const R = 6371; // רדיוס כדור הארץ בקילומטרים
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLon = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// פונקציה לקבלת מסלול בין שתי נקודות
const getHikingRoute = async (point1, point2) => {
  try {
    const response = await axios.get(
      `https://routing.openstreetmap.de/routed-foot/route/v1/hiking/` +
      `${point1.lng},${point1.lat};${point2.lng},${point2.lat}` +
      `?overview=full&geometries=geojson`
    );
    
    if (response.data && response.data.routes && response.data.routes[0].geometry) {
      return response.data.routes[0].geometry.coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }));
    }
    return null;
  } catch (error) {
    console.error('Error fetching hiking route:', error);
    return null;
  }
};

// קומפוננטה לתפיסת אירועי מפה
const MapEvents = ({ onMapClick }) => {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });
    }
  });
  return null;
};

const HikingMap = ({ onPointSelect, selectedPoints = [], onPointsUpdate }) => {
  const [routePath, setRoutePath] = useState([]);
  // מרכז המפה בברירת מחדל (מרכז ישראל)
  const defaultCenter = [31.7683, 35.2137];
  const [totalDistance, setTotalDistance] = useState(0);
  const [mapRef, setMapRef] = useState(null);

  // חישוב המרחק הכולל כשמשתנות הנקודות
  useEffect(() => {
    if (selectedPoints.length < 2) {
      setTotalDistance(0);
      return;
    }

    let distance = 0;
    for (let i = 1; i < selectedPoints.length; i++) {
      distance += calculateDistance(selectedPoints[i-1], selectedPoints[i]);
    }
    setTotalDistance(distance);
  }, [selectedPoints]);

  // התאמת תצוגת המפה לנקודות שנבחרו
  useEffect(() => {
    if (mapRef && selectedPoints.length > 0) {
      const bounds = L.latLngBounds(selectedPoints.map(point => [point.lat, point.lng]));
      mapRef.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedPoints, mapRef]);

  // עדכון המסלול כשמשתנות הנקודות
  useEffect(() => {
    const updateRoute = async () => {
      if (selectedPoints.length < 2) {
        setRoutePath([]);
        return;
      }

      let newPath = [];
      for (let i = 1; i < selectedPoints.length; i++) {
        const segmentPath = await getHikingRoute(selectedPoints[i-1], selectedPoints[i]);
        if (segmentPath) {
          newPath = [...newPath, ...segmentPath];
        }
      }
      
      setRoutePath(newPath);
    };

    updateRoute();
  }, [selectedPoints]);

  // הוספת נקודה למסלול
  const handleMapClick = (point) => {
    if (onPointSelect) {
      onPointSelect(point);
    }
  };

  // עדכון מיקום נקודה לאחר גרירה
  const handleMarkerDrag = (index, newPosition) => {
    const updatedPoints = [...selectedPoints];
    updatedPoints[index] = newPosition;
    if (onPointsUpdate) {
      onPointsUpdate(updatedPoints);
    }
  };

  // בחירת הסמל המתאים לפי מיקום הנקודה
  const getMarkerIcon = (index) => {
    if (index === 0) return startIcon;
    if (index === selectedPoints.length - 1) return endIcon;
    return waypointIcon;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: '500px', width: '100%', mb: 2 }}>
        <MapContainer
          center={defaultCenter}
          zoom={8}
          style={{ height: '500px', width: '100%' }}
          ref={setMapRef}
        >
          <MapEvents onMapClick={handleMapClick} />
          
          {/* Base Map Layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Route Path */}
          {routePath.length > 0 && (
            <Polyline
              positions={routePath}
              color="#2196f3"
              weight={4}
              opacity={0.8}
              dashArray="10,5"
            />
          )}
          
          {/* Markers */}
          {selectedPoints.map((point, index) => (
            <Marker 
              key={index} 
              position={[point.lat, point.lng]}
              icon={getMarkerIcon(index)}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  handleMarkerDrag(index, { lat: position.lat, lng: position.lng });
                },
              }}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                    {index === 0 ? 'נקודת התחלה' : 
                     index === selectedPoints.length - 1 ? 'נקודת סיום' : 
                     `נקודת ציון ${index}`}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    גובה: {point.elevation || 'לא ידוע'} מטר
                  </Typography>
                  {index > 0 && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      מרחק מהנקודה הקודמת: {calculateDistance(selectedPoints[index-1], point).toFixed(2)} ק"מ
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Paper>
  );
};

export default HikingMap;
