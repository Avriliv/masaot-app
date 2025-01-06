import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useTrip } from '../../context/TripContext';
import { 
  getMarkedTrails,
  getBoundsFromPoints,
  calculateRouteOnTrails,
  splitRouteByDays,
  getElevationData,
  calculateRoute
} from '../TripPlanner/components/map/TrailMap/utils/trailUtils';
import TrailInfo from '../TripPlanner/components/map/TrailMap/components/TrailInfo';

// Fix for default icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const israelBounds = [
    [29.5, 34.2], // Southwest corner
    [33.3, 35.9]  // Northeast corner
];

// Map layers configuration
const MAP_LAYERS = {
    osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: ' OpenStreetMap contributors',
        name: 'מפת רחובות'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: ' Esri',
        name: 'תצלום לוויין'
    },
    topo: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: ' OpenTopoMap',
        name: 'מפה טופוגרפית'
    },
    hiking: {
        url: 'https://israelhiking.osm.org.il/Hebrew/Tiles/{z}/{x}/{y}.png',
        attribution: ' החברה להגנת הטבע',
        name: 'שבילי הליכה'
    }
};

// Stats Modal Component
const StatsModal = ({ open, onClose, routeStats, dailyStats }) => {
    if (!routeStats || !dailyStats) return null;
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                פרטי המסלול
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>סיכום כללי</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2">סה"כ מרחק</Typography>
                            <Typography>{routeStats.distance.toFixed(1)} ק"מ</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2">סה"כ עלייה מצטברת</Typography>
                            <Typography>{routeStats.ascent.toFixed(0)} מ'</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2">סה"כ ירידה מצטברת</Typography>
                            <Typography>{routeStats.descent.toFixed(0)} מ'</Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Typography variant="h6" gutterBottom>פירוט יומי</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>יום</TableCell>
                                <TableCell>מרחק</TableCell>
                                <TableCell>עלייה מצטברת</TableCell>
                                <TableCell>ירידה מצטברת</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dailyStats.map((day) => (
                                <TableRow key={day.day}>
                                    <TableCell>{day.day}</TableCell>
                                    <TableCell>{day.distance.toFixed(1)} ק"מ</TableCell>
                                    <TableCell>{day.ascent.toFixed(0)} מ'</TableCell>
                                    <TableCell>{day.descent.toFixed(0)} מ'</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>גרף עליות</Typography>
                    {/* כאן נוסיף את הגרף בהמשך */}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

const MapPlanning = ({ onSubmit, onBack }) => {
    const { tripState, updateTrip } = useTrip();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const mapRef = useRef(null);
    const [showStats, setShowStats] = useState(false);

    // פונקציה להצגת הודעות סטטוס
    const updateStatus = (message, isError = false) => {
        console.log(`Status Update [${isError ? 'ERROR' : 'INFO'}]:`, message);
        if (isError) {
            setError(message);
            setStatusMessage('');
        } else {
            setError(null);
            setStatusMessage(message);
        }
    };

    useEffect(() => {
        const initializeRoute = async () => {
            // בדיקת נתונים הכרחיים
            if (!tripState.route?.startPoint || !tripState.route?.endPoint || !tripState.basicDetails?.numberOfDays) {
                console.log('Missing required data:', {
                    startPoint: tripState.route?.startPoint,
                    endPoint: tripState.route?.endPoint,
                    days: tripState.basicDetails?.numberOfDays
                });
                updateStatus('חסרים נתונים הכרחיים למציאת מסלול', true);
                return;
            }

            setLoading(true);
            setError(null);
            setStatusMessage('');

            try {
                updateStatus('מחשב את גבולות האזור...');
                const points = [tripState.route.startPoint, tripState.route.endPoint];
                
                console.log('Input points:', points);

                updateStatus('מחפש שבילים מסומנים באזור...');
                const routeData = await calculateRoute(points);

                if (!routeData || !routeData.route) {
                    throw new Error('לא ניתן לחשב מסלול בין הנקודות שנבחרו');
                }

                console.log('Route data:', routeData);

                updateStatus('מחשב חלוקה לימים...');
                const dailySegments = splitRouteByDays(routeData.route, tripState.basicDetails.numberOfDays);

                updateStatus('מקבל נתוני גובה...');
                const elevationData = await getElevationData(routeData.route.geometry.coordinates);

                const updatedRoute = {
                    ...tripState.route,
                    calculatedRoute: routeData.route,
                    dailySegments,
                    elevation: elevationData
                };

                console.log('Updating trip context:', updatedRoute);
                updateTrip({ route: updatedRoute });

                if (mapRef.current && routeData.route.geometry.coordinates.length > 0) {
                    updateStatus('מתמקד במסלול...');
                    const map = mapRef.current;
                    const routeBounds = L.latLngBounds(
                        routeData.route.geometry.coordinates.map(coord => [coord[1], coord[0]])
                    );
                    map.fitBounds(routeBounds, { padding: [50, 50] });
                }

                setLoading(false);
                updateStatus('המסלול חושב בהצלחה על שבילים מסומנים');
                
            } catch (error) {
                console.error('Error initializing route:', error);
                setLoading(false);
                updateStatus(error.message || 'אירעה שגיאה בחישוב המסלול', true);
            }
        };

        initializeRoute();
    }, [tripState.route.startPoint, tripState.route.endPoint, tripState.basicDetails.numberOfDays]);

    const renderRoute = () => {
        if (!tripState.route?.calculatedRoute) return null;

        return tripState.route.dailySegments.map((segment, index) => (
            <Polyline
                key={index}
                positions={segment}
                color={getColorForDay(index)}
                weight={3}
                opacity={0.8}
            />
        ));
    };

    const getColorForDay = (index) => {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080'];
        return colors[index % colors.length];
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {statusMessage && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {statusMessage}
                </Alert>
            )}

            <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
                {/* מפה */}
                <Box sx={{ flex: 2, minHeight: 400 }}>
                    <MapContainer
                        ref={mapRef}
                        center={[31.7683, 35.2137]}
                        zoom={8}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {renderRoute()}
                        {tripState.route?.startPoint && (
                            <Marker position={[tripState.route.startPoint.lat, tripState.route.startPoint.lng]}>
                                <Popup>נקודת התחלה: {tripState.route.startPoint.name}</Popup>
                            </Marker>
                        )}
                        {tripState.route?.endPoint && (
                            <Marker position={[tripState.route.endPoint.lat, tripState.route.endPoint.lng]}>
                                <Popup>נקודת סיום: {tripState.route.endPoint.name}</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </Box>

                {/* פרטי מסלול */}
                <Box sx={{ flex: 1 }}>
                    <TrailInfo
                        dailyLocations={tripState.route?.dailySegments?.map((segment, index) => ({
                            start: { coordinates: segment[0], label: `יום ${index + 1} - התחלה` },
                            end: { coordinates: segment[segment.length - 1], label: `יום ${index + 1} - סיום` }
                        }))}
                        route={tripState.route?.calculatedRoute}
                        elevationData={tripState.route?.elevation}
                    />
                </Box>
            </Box>

            {loading && (
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <Typography>מחשב מסלול...</Typography>
                </Box>
            )}
        </Box>
    );
};

export default MapPlanning;
