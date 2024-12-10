import React, { useEffect, useState } from 'react';
import { Box, Paper, IconButton, Tooltip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTrip } from '../../../../context/TripContext';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// Fix for default markers
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// ישראל במרכז המפה
const DEFAULT_CENTER = [31.7683, 35.2137];
const DEFAULT_ZOOM = 8;

function LocationControl() {
  const map = useMap();
  const [watching, setWatching] = useState(false);
  const [locationMarker, setLocationMarker] = useState(null);

  const handleLocationClick = () => {
    if (!watching) {
      map.locate({
        watch: true,
        enableHighAccuracy: true
      });
      setWatching(true);
    } else {
      map.stopLocate();
      if (locationMarker) {
        map.removeLayer(locationMarker);
        setLocationMarker(null);
      }
      setWatching(false);
    }
  };

  useEffect(() => {
    const onLocationFound = (e) => {
      const radius = e.accuracy;
      if (locationMarker) {
        map.removeLayer(locationMarker);
      }
      
      const newMarker = L.marker(e.latlng).addTo(map)
        .bindPopup(`המיקום שלך (דיוק: ${Math.round(radius)} מטרים)`);
      
      L.circle(e.latlng, radius).addTo(map);
      map.flyTo(e.latlng, Math.max(map.getZoom(), 15));
      
      setLocationMarker(newMarker);
    };

    const onLocationError = (e) => {
      console.error(e.message);
      alert('לא הצלחנו לאתר את המיקום שלך. אנא וודא שאישרת גישה למיקום בדפדפן.');
      setWatching(false);
    };

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    return () => {
      map.off('locationfound', onLocationFound);
      map.off('locationerror', onLocationError);
      if (watching) {
        map.stopLocate();
      }
      if (locationMarker) {
        map.removeLayer(locationMarker);
      }
    };
  }, [map, locationMarker, watching]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.65)'
      }}
    >
      <Tooltip title="הצג את המיקום שלי" placement="right">
        <IconButton
          onClick={handleLocationClick}
          color={watching ? 'primary' : 'default'}
          size="large"
        >
          <MyLocationIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent() {
  const { tripState, updateRoute } = useTrip();
  const { route } = tripState;

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    if (!route.startPoint) {
      updateRoute({ startPoint: { lat, lng } });
    } else if (!route.endPoint) {
      updateRoute({ endPoint: { lat, lng } });
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '500px', width: '100%', mb: 2 }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationControl />
        <MapController center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} />
        
        {route.startPoint && (
          <Marker position={[route.startPoint.lat, route.startPoint.lng]}>
            <Popup>נקודת התחלה</Popup>
          </Marker>
        )}
        
        {route.endPoint && (
          <Marker position={[route.endPoint.lat, route.endPoint.lng]}>
            <Popup>נקודת סיום</Popup>
          </Marker>
        )}

        {route.checkpoints.map((checkpoint, index) => (
          <Marker
            key={index}
            position={[checkpoint.lat, checkpoint.lng]}
          >
            <Popup>{checkpoint.name || `נקודת ציון ${index + 1}`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </Paper>
  );
}
