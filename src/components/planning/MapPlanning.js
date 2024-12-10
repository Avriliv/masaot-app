import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, GeoJSON, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Box, 
    Typography, 
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Divider,
    Menu,
    MenuItem,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ButtonGroup,
    FormControl,
    InputLabel,
    Select,
    Container,
    AppBar,
    Toolbar,
    Tooltip,
    Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    DirectionsWalk as DirectionsWalkIcon,
    DirectionsBike as DirectionsBikeIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    Share as ShareIcon,
    Terrain as TerrainIcon,
    Map as MapIcon,
    Satellite as SatelliteIcon,
    Timer as TimerIcon,
    Directions as DirectionsIcon
} from '@mui/icons-material';
import WeatherCard from '../Weather/WeatherCard';

// Fix for default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Israel bounds and center
const israelCenter = [31.7683, 35.2137];  // Jerusalem
const israelBounds = [
    [29.5, 34.2],  // Southwest coordinates
    [33.3, 35.9]   // Northeast coordinates
];

// Custom icons
const createIcon = (color) => L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const markerIcons = {
    start: createIcon('green'),
    waypoint: createIcon('blue'),
    end: createIcon('red')
};

// Map types configuration
const MAP_TYPES = {
    hiking: {
        name: 'שבילים מסומנים',
        icon: <DirectionsWalkIcon />,
        url: 'https://israelhiking.osm.org.il/Hebrew/Tiles/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://israelhiking.osm.org.il">Israel Hiking Map</a>',
        maxZoom: 16,
        minZoom: 7,
        subdomains: ['a', 'b', 'c']
    },
    bike: {
        name: 'שבילי אופניים',
        icon: <DirectionsBikeIcon />,
        url: 'https://israelhiking.osm.org.il/Hebrew/mtbTiles/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://israelhiking.osm.org.il">Israel MTB Map</a>',
        maxZoom: 16,
        minZoom: 7,
        subdomains: ['a', 'b', 'c']
    },
    topo: {
        name: 'טופוגרפי',
        icon: <TerrainIcon />,
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 16,
        minZoom: 7,
        subdomains: ['a', 'b', 'c']
    },
    satellite: {
        name: 'לווין',
        icon: <SatelliteIcon />,
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
        maxZoom: 16,
        minZoom: 7
    }
};

// Styled components
const SearchBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    marginRight: theme.spacing(2)
}));

const SearchResults = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: '100%',
    right: 0,
    left: 0,
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: theme.spacing(1)
}));

const MapToolbar = styled(AppBar)(({ theme }) => ({
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #2196f3 30%, #64b5f6 90%)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    borderRadius: theme.shape.borderRadius,
}));

const StyledPageTitle = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    fontWeight: 600,
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -10,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80px',
        height: '3px',
        backgroundColor: theme.palette.primary.main,
    }
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary
}));

const PageSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2)
}));

const RouteInfoContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.spacing(1),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    direction: 'rtl'
}));

// Map Events Component
const MapEvents = ({ onClick }) => {
    const map = useMapEvents({
        click: onClick
    });
    return null;
};

const MapPlanning = ({ data, onUpdate, onBack, onNext }) => {
    const [activeBaseMap, setActiveBaseMap] = useState('hiking');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [markers, setMarkers] = useState(data?.points || []);
    const [routeInfo, setRouteInfo] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [elevationData, setElevationData] = useState(null);
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [map, setMap] = useState(null);
    const mapRef = useRef(null);

    // Israel bounds and center
    const israelBounds = [
        [29.5, 34.2], // Southwest coordinates
        [33.3, 35.9]  // Northeast coordinates
    ];
    const israelCenter = [31.7683, 35.2137]; // Jerusalem

    // Search places using Nominatim
    const searchPlaces = async (query) => {
        if (!query.trim()) return;
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&q=${encodeURIComponent(query)}&` +
                `viewbox=34.2674,33.4362,35.8950,29.4533&` +
                `bounded=1&limit=5&countrycodes=IL`
            );
            
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching places:', error);
            setSearchResults([]);
        }
    };

    // Handle search result selection
    const handleSearchResultClick = (result) => {
        const [lat, lon] = [parseFloat(result.lat), parseFloat(result.lon)];
        addMarker({ lat, lng: lon, name: result.display_name });
        setSearchQuery('');
        setSearchResults([]);
        if (mapRef.current) {
            mapRef.current.setView([lat, lon], 15);
        }
    };

    // Add marker
    const addMarker = (markerData) => {
        const newMarker = {
            lat: markerData.lat,
            lng: markerData.lng,
            name: markerData.name || `נקודה ${markers.length + 1}`
        };
        
        const newMarkers = [...markers, newMarker];
        setMarkers(newMarkers);
        updateRoute(newMarkers);
    };

    // Handle map click
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        
        // Check if the point is within Israel bounds
        if (lat < israelBounds[0][0] || lat > israelBounds[1][0] ||
            lng < israelBounds[0][1] || lng > israelBounds[1][1]) {
            setError('נא לבחור נקודה בתוך גבולות ישראל');
            return;
        }

        console.log('Adding new point:', { lat, lng });

        const newPoint = {
            lat: lat,
            lng: lng,
            type: markers.length === 0 ? 'start' : 
                  markers.length === 1 ? 'end' : 'waypoint',
            name: markers.length === 0 ? 'נקודת התחלה' : 
                  markers.length === 1 ? 'נקודת סיום' : `נקודת ביניים ${markers.length - 1}`
        };
        
        const newMarkers = [...markers, newPoint];
        console.log('Updated markers:', newMarkers);
        setMarkers(newMarkers);
        
        if (newMarkers.length >= 2) {
            console.log('Calculating route for markers:', newMarkers);
            calculateRoute(newMarkers);
        }
    };

    // Handle marker drag
    const handleMarkerDrag = useCallback(async (index, e) => {
        const { lat, lng } = e.target.getLatLng();
        const updatedMarkers = markers.map((marker, i) => 
            i === index ? { ...marker, lat, lng } : marker
        );
        setMarkers(updatedMarkers);
        
        if (updatedMarkers.length >= 2) {
            calculateRoute(updatedMarkers);
        }
    }, [markers]);

    // מצבים חדשים לעריכת נקודה
    const [editingMarker, setEditingMarker] = useState(null);
    const [markerName, setMarkerName] = useState('');

    // פונקציה לפתיחת חלונית עריכת נקודה
    const handleEditMarker = (marker) => {
        setEditingMarker(marker);
        setMarkerName(marker.name || '');
    };

    // פונקציה לשמירת עריכת נקודה
    const saveMarkerEdit = () => {
        if (editingMarker) {
            const updatedMarkers = markers.map(marker => 
                marker.lat === editingMarker.lat && marker.lng === editingMarker.lng
                    ? { ...marker, name: markerName } 
                    : marker
            );
            setMarkers(updatedMarkers);
            setEditingMarker(null);
            setMarkerName('');
        }
    };

    // פונקציה למחיקת נקודה
    const deleteMarker = (markerToDelete) => {
        const updatedMarkers = markers.filter(marker => marker !== markerToDelete);
        setMarkers(updatedMarkers);
        
        // אם מספר הנקודות פחת מ-2, נבטל את חישוב המסלול
        if (updatedMarkers.length < 2) {
            setRoute(null);
            setRouteInfo(null);
            setElevationData([]);
        } else {
            // חישוב מסלול מחדש
            calculateRoute(updatedMarkers);
        }
    };

    // Update route info and notify parent
    const updateRoute = (newMarkers) => {
        if (newMarkers.length >= 2) {
            // Calculate total distance
            let totalDistance = 0;
            for (let i = 0; i <newMarkers.length - 1; i++) {
                const p1 = L.latLng(newMarkers[i].lat, newMarkers[i].lng);
                const p2 = L.latLng(newMarkers[i + 1].lat, newMarkers[i + 1].lng);
                totalDistance += p1.distanceTo(p2);
            }
            
            setRouteInfo({ distance: totalDistance });
        } else {
            setRouteInfo(null);
        }

        onUpdate?.({ points: newMarkers });
    };

    // Get marker icon based on position
    const getMarkerIcon = (index, total) => {
        if (index === 0) return markerIcons.start;
        if (index === total - 1) return markerIcons.end;
        return markerIcons.waypoint;
    };

    // Debounce search
    const handleSearchQueryChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value) searchPlaces(e.target.value);
    };

    const handleSaveRoute = async () => {
        if (markers.length < 2) return;
        
        try {
            const snapshot = await getMapSnapshot();
            onUpdate({
                route: {
                    waypoints: markers,
                    totalDistance: calculateTotalDistance(),
                    mapSnapshot: snapshot
                }
            });
            setError(null);
        } catch (error) {
            console.error('Error saving route:', error);
            setError('שגיאה בשמירת המסלול');
        }
    };

    const handleShareRoute = () => {
        if (markers.length < 2) return;
        
        const routeData = {
            points: markers.map(m => ({ lat: m.lat, lng: m.lng, name: m.name })),
            distance: routeInfo?.distance || 0
        };

        // Create a shareable link
        const shareUrl = `${window.location.origin}${window.location.pathname}?route=${encodeURIComponent(JSON.stringify(routeData))}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('קישור למסלול הועתק ללוח');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('לא הצלחנו להעתיק את הקישור');
        });
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleBaseMapChange = (mapType) => {
        setActiveBaseMap(mapType);
    };

    // Handle right click
    const handleContextMenu = useCallback((event) => {
        const { containerPoint, originalEvent } = event;
        originalEvent.preventDefault();
        
        setContextMenu({
            mouseX: containerPoint.x,
            mouseY: containerPoint.y,
            latlng: event.latlng
        });
    }, []);

    // Select point type
    const handlePointTypeSelect = (type) => {
        if (contextMenu?.latlng) {
            const newPoint = {
                lat: contextMenu.latlng.lat,
                lng: contextMenu.latlng.lng,
                type: type,
                name: type === 'start' ? 'נקודת התחלה' : 
                      type === 'end' ? 'נקודת סיום' : 'נקודת ביניים',
                description: '',
                time: ''
            };
            
            const newMarkers = [...markers, newPoint];
            setMarkers(newMarkers);
            
            if (newMarkers.length >= 2) {
                calculateRoute(newMarkers);
            }
        }
        setContextMenu(null);
    };

    // Fetch elevation data from Open-Elevation API
    const fetchElevationData = async (coordinates) => {
        try {
            const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    locations: coordinates.map(coord => ({
                        latitude: coord[1],
                        longitude: coord[0]
                    }))
                })
            });

            if (!response.ok) {
                console.error('Elevation API request failed');
                return null;
            }

            const data = await response.json();
            return data.results.map(result => result.elevation);
        } catch (error) {
            console.error('Error fetching elevation:', error);
            return null;
        }
    };

    // Extract precise elevation data from route coordinates
    const extractElevationFromRoute = (route) => {
        try {
            // Ensure route and route.geometry exist
            if (!route || !route.geometry || !route.geometry.coordinates) {
                console.error('Invalid route data');
                return null;
            }

            const coordinates = route.geometry.coordinates;
            
            // Fetch elevation for each coordinate
            const elevations = coordinates.map(coord => {
                // Assuming third element is elevation, if not present, use 0
                return coord[2] || 0;
            });

            console.log('Extracted Elevation Data:', {
                elevations: elevations,
                coordinates: coordinates
            });

            return {
                elevations: elevations,
                coordinates: coordinates
            };
        } catch (error) {
            console.error('Error extracting elevation:', error);
            return null;
        }
    };

    const calculateRoute = async (points) => {
        if (points.length < 2) return;

        try {
            setLoading(true);
            setError(null);
            
            const coordinates = points.map(p => {
                const point = p.latlng || p;
                return `${point.lng},${point.lat}`;
            }).join(';');
            
            // שימוש בשרת הניתוב הרגיל של OSRM עם פרופיל הליכה
            const url = `https://routing.openstreetmap.de/routed-foot/route/v1/hiking/${coordinates}?overview=full&geometries=geojson&steps=true`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`שגיאה בחישוב המסלול: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.routes || data.routes.length === 0) {
                throw new Error('לא נמצא מסלול בין הנקודות שנבחרו');
            }
            
            const route = data.routes[0];
            
            setRoute(route);
            
            const routeInfo = {
                distance: route.distance / 1000,
                ascent: route.ascent || 0,
                descent: route.descent || 0
            };
            
            setRouteInfo(routeInfo);
            setLoading(false);
            
        } catch (error) {
            console.error('Error calculating route:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const RouteInfo = ({ routeInfo }) => {
        if (!routeInfo) return null;

        return (
            <Paper
                elevation={3}
                sx={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    padding: '10px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    direction: 'rtl'
                }}
            >
                <Stack direction="row" spacing={3} alignItems="center">
                    <Box>
                        <Typography variant="body2" color="text.secondary">מרחק</Typography>
                        <Typography variant="body1">{routeInfo.distance.toFixed(1)} ק"מ</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">עלייה</Typography>
                        <Typography variant="body1">{routeInfo.ascent}מ'</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">ירידה</Typography>
                        <Typography variant="body1">{routeInfo.descent}מ'</Typography>
                    </Box>
                </Stack>
            </Paper>
        );
    };

    const renderMap = () => {
        return (
            <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
                <MapContainer
                    center={israelCenter}
                    zoom={8}
                    style={{ height: '100%', width: '100%' }}
                    maxBounds={israelBounds}
                    ref={mapRef}
                >
                    <TileLayer
                        url={MAP_TYPES[activeBaseMap].url}
                        attribution={MAP_TYPES[activeBaseMap].attribution}
                        maxZoom={MAP_TYPES[activeBaseMap].maxZoom}
                        minZoom={MAP_TYPES[activeBaseMap].minZoom}
                        subdomains={MAP_TYPES[activeBaseMap].subdomains}
                    />

                    <MapEvents onClick={handleMapClick} />

                    {markers.map((marker, index) => (
                        <Marker
                            key={`${marker.lat}-${marker.lng}`}
                            position={[marker.lat, marker.lng]}
                            icon={getMarkerIcon(index, markers.length)}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => handleMarkerDrag(index, e)
                            }}
                        >
                            <Popup>
                                <div style={{ direction: 'rtl', textAlign: 'right' }}>
                                    <Typography variant="subtitle2">{marker.name}</Typography>
                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditMarker(marker)}
                                        >
                                            ערוך
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => deleteMarker(marker)}
                                            color="error"
                                        >
                                            מחק
                                        </Button>
                                    </Box>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {route && route.geometry && (
                        <Polyline
                            positions={route.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                            pathOptions={{
                                color: '#3388ff',
                                weight: 4,
                                opacity: 0.7,
                                lineCap: 'round',
                                lineJoin: 'round'
                            }}
                        />
                    )}
                </MapContainer>
                <RouteInfo routeInfo={routeInfo} />
            </Box>
        );
    };

    const renderEditMarkerDialog = () => {
        return (
            <Dialog 
                open={!!editingMarker} 
                onClose={() => {
                    setEditingMarker(null);
                    setMarkerName('');
                }}
            >
                <DialogTitle>עריכת נקודה</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="שם הנקודה"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={markerName}
                            onChange={(e) => setMarkerName(e.target.value)}
                        />
                        {editingMarker && (
                            <Box>
                                <Typography variant="body2">
                                    קואורדינטות: {editingMarker.lat.toFixed(4)}, {editingMarker.lng.toFixed(4)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setEditingMarker(null);
                            setMarkerName('');
                        }}
                    >
                        ביטול
                    </Button>
                    <Button 
                        onClick={saveMarkerEdit} 
                        variant="contained"
                        disabled={!markerName.trim()}
                    >
                        שמור
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const renderContextMenu = () => {
        return (
            <Menu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={() => handlePointTypeSelect('start')}>נקודת התחלה</MenuItem>
                <MenuItem onClick={() => handlePointTypeSelect('waypoint')}>נקודת ביניים</MenuItem>
                <MenuItem onClick={() => handlePointTypeSelect('end')}>נקודת סיום</MenuItem>
            </Menu>
        );
    };

    const renderRouteInfo = () => {
        if (!routeInfo) return null;

        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    פרטי המסלול
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DirectionsIcon sx={{ mr: 0.5 }} />
                        <Typography>
                            {routeInfo.distance} ק"מ
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TimerIcon sx={{ mr: 0.5 }} />
                        <Typography>
                            {routeInfo.duration} שעות
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TrendingUpIcon sx={{ mr: 0.5 }} />
                        <Typography>
                            {routeInfo.ascent} מ' עלייה
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TrendingDownIcon sx={{ mr: 0.5 }} />
                        <Typography>
                            {routeInfo.descent} מ' ירידה
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* תצוגת מזג אוויר */}
                    {markers.length > 0 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                מזג אוויר במסלול
                            </Typography>
                            <WeatherCard 
                                lat={markers[0].lat}
                                lon={markers[0].lng}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };

    // Calculate total distance
    const calculateTotalDistance = () => {
        if (markers.length < 2) return 0;
        
        let totalDistance = 0;
        for (let i = 0; i < markers.length - 1; i++) {
            const point1 = markers[i];
            const point2 = markers[i + 1];
            totalDistance += calculateDistance(point1, point2);
        }
        
        return totalDistance;
    };

    // Calculate distance between two points
    const calculateDistance = (point1, point2) => {
        const lat1 = point1.lat;
        const lon1 = point1.lng;
        const lat2 = point2.lat;
        const lon2 = point2.lng;
        
        const R = 6371; // Earth's radius in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance;
    };

    const toRad = (value) => {
        return value * Math.PI / 180;
    };

    const getMapSnapshot = async () => {
        if (!mapRef.current) return null;
        
        try {
            const map = mapRef.current;
            
            // Get the map bounds that contain all markers
            if (markers.length > 0) {
                const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
                map.fitBounds(bounds, { padding: [50, 50] });
            }

            // Wait for any tiles to load
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create a temporary canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const mapElement = map.getContainer();
            
            // Set canvas size to map size
            canvas.width = mapElement.offsetWidth;
            canvas.height = mapElement.offsetHeight;
            
            // Draw map to canvas
            context.drawImage(mapElement, 0, 0);

            // Draw route line
            if (markers.length >= 2) {
                const path = markers.map(m => [m.lat, m.lng]);
                const line = L.polyline(path, { color: 'blue', weight: 3 });
                map.addLayer(line);
                
                // Wait for line to render
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Update canvas with line
                context.drawImage(mapElement, 0, 0);
                
                // Remove temporary line
                map.removeLayer(line);
            }
            
            // Convert canvas to base64 image
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error creating map snapshot:', error);
            return null;
        }
    };

    const handleNext = async () => {
        if (markers.length >= 2) {
            await handleSaveRoute();
        }
        if (onNext) onNext();
    };

    // יצירת ערכת נושא מותאמת אישית
    const theme = createTheme({
        palette: {
            primary: {
                main: '#2196f3',      // כחול עדין ומקצועי
                light: '#64b5f6',     // כחול בהיר יותר
                dark: '#1976d2',      // כחול כהה יותר
            },
            background: {
                default: '#f5f5f5',
                paper: '#ffffff'
            }
        },
        typography: {
            fontFamily: 'Roboto, Arial, sans-serif',
            h4: {
                fontWeight: 500,
                color: '#2196f3',
                textAlign: 'center',
                marginBottom: '20px'
            }
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#2196f3',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl" sx={{ py: 3, position: 'relative' }}>
                <MapToolbar>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        width: '100%', 
                        justifyContent: 'space-between' 
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            flexGrow: 1 
                        }}>
                            <SearchBox sx={{ minWidth: '300px' }}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="חפש מקום..."
                                    value={searchQuery}
                                    onChange={handleSearchQueryChange}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                                        sx: { direction: 'rtl' }
                                    }}
                                />
                                {searchResults.length > 0 && (
                                    <SearchResults>
                                        <List dense>
                                            {searchResults.map((result, index) => (
                                                <ListItem
                                                    key={index}
                                                    button
                                                    onClick={() => handleSearchResultClick(result)}
                                                >
                                                    <ListItemText 
                                                        primary={result.display_name} 
                                                        sx={{ textAlign: 'right' }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </SearchResults>
                                )}
                            </SearchBox>

                            <ButtonGroup size="small">
                                {Object.entries(MAP_TYPES).map(([key, type]) => (
                                    <Button
                                        key={key}
                                        startIcon={type.icon}
                                        variant={activeBaseMap === key ? 'contained' : 'outlined'}
                                        onClick={() => setActiveBaseMap(key)}
                                    >
                                        {type.name}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Box>

                        <ButtonGroup size="small" sx={{ mr: -2 }}>
                            <Button 
                                startIcon={<SaveIcon />}
                                onClick={handleSaveRoute}
                                disabled={markers.length < 2}
                            >
                                שמור מסלול
                            </Button>
                            <Button 
                                startIcon={<ShareIcon />}
                                onClick={handleShareRoute}
                                disabled={markers.length < 2}
                            >
                                שתף
                            </Button>
                        </ButtonGroup>
                    </Box>
                </MapToolbar>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                height: '70vh', 
                                position: 'relative', 
                                overflow: 'hidden',
                                borderRadius: 2
                            }}
                        >
                            {renderMap()}
                        </Paper>
                    </Grid>
                </Grid>

                {/* כפתורי ניווט */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, width: '100%' }}>
                    <Button
                        variant="outlined"
                        onClick={onBack}
                        startIcon={<ArrowForwardIcon />}
                    >
                        חזור
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowBackIcon />}
                        disabled={markers.length < 2}
                    >
                        המשך
                    </Button>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default MapPlanning;
