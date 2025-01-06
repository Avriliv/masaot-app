import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Autocomplete,
    CircularProgress
} from '@mui/material';
import debounce from 'lodash/debounce';

const gradeOptions = [
    'כיתה א׳',
    'כיתה ב׳',
    'כיתה ג׳',
    'כיתה ד׳',
    'כיתה ה׳',
    'כיתה ו׳',
    'כיתה ז׳',
    'כיתה ח׳',
    'כיתה ט׳',
    'כיתה י׳',
    'כיתה י״א',
    'כיתה י״ב',
    'אחר'
];

const organizationTypes = [
    'בית ספר',
    'תנועת נוער',
    'מכינה קדם צבאית',
    'צבא',
    'מועצה מקומית',
    'אחר'
];

// Cache object for storing search results
const searchCache = new Map();

const searchLocations = async (searchText) => {
    if (!searchText || searchText.length < 2) return [];

    // אם יש תוצאות במטמון, נחזיר אותן
    const cacheKey = searchText.toLowerCase();
    if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey);
    }

    try {
        // חיפוש מקומות
        const viewbox = '34.2654333839,29.5013261988,35.8363969256,33.2774264593'; // גבולות ישראל
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` + 
            new URLSearchParams({
                q: searchText,
                format: 'json',
                limit: '15',
                countrycodes: 'il',
                'accept-language': 'he',
                addressdetails: '1',
                viewbox: viewbox,
                bounded: '1'
            })
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        const results = data.map(item => {
            // מיצוי שם קצר ומדויק יותר
            let label = item.name || item.display_name.split(',')[0];
            
            // הוספת סוג המקום אם קיים
            if (item.type) {
                const typeMap = {
                    'national_park': 'פארק לאומי',
                    'nature_reserve': 'שמורת טבע',
                    'protected_area': 'שטח מוגן',
                    'peak': 'פסגה',
                    'hill': 'גבעה',
                    'mountain': 'הר',
                    'valley': 'עמק',
                    'water': 'מקור מים',
                    'stream': 'נחל',
                    'spring': 'מעיין',
                    'cave': 'מערה',
                    'viewpoint': 'תצפית',
                    'archaeological_site': 'אתר ארכיאולוגי',
                    'ruins': 'חורבות',
                    'camp_site': 'אתר מחנאות',
                    'hiking_trail': 'מסלול הליכה'
                };
                
                const hebrewType = typeMap[item.type] || item.type;
                label = `${label} (${hebrewType})`;
            }

            // בניית כתובת מקוצרת יותר
            const addressParts = [];
            if (item.address) {
                if (item.address.city) addressParts.push(item.address.city);
                if (item.address.town) addressParts.push(item.address.town);
                if (item.address.village) addressParts.push(item.address.village);
                if (item.address.suburb) addressParts.push(item.address.suburb);
                if (item.address.region) addressParts.push(item.address.region);
            }

            return {
                label: label,
                fullAddress: addressParts.join(', '),
                value: item.place_id,
                coordinates: [item.lat, item.lon],
                type: item.type,
                category: item.class,
                importance: item.importance
            };
        });

        // מיון לפי חשיבות ורלוונטיות
        results.sort((a, b) => b.importance - a.importance);

        // שמירת התוצאות במטמון
        searchCache.set(cacheKey, results);
        
        return results;
    } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
};

const BasicInfo = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        tripName: '',
        description: '',
        startDate: '',
        endDate: '',
        numDays: '',
        numParticipants: '',
        numChaperones: '',
        gradeFrom: '',
        gradeTo: '',
        organizationType: '',
        dailyLocations: []
    });

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const debouncedSearch = useCallback(
        debounce(async (searchText, callback) => {
            if (!searchText || searchText.length < 2) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const results = await searchLocations(searchText);
                callback(results);
            } catch (err) {
                setError('שגיאה בחיפוש מיקומים');
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (formData.numDays > 0) {
            setFormData(prev => ({
                ...prev,
                dailyLocations: Array(parseInt(formData.numDays)).fill().map(() => ({
                    start: null,
                    end: null
                }))
            }));
        }
    }, [formData.numDays]);

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            if (field === 'startDate' || field === 'endDate') {
                if (newData.startDate && newData.endDate) {
                    const start = new Date(newData.startDate);
                    const end = new Date(newData.endDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    newData.numDays = diffDays;
                }
            }
            
            return newData;
        });
    };

    const handleLocationChange = (dayIndex, type) => (event, newValue) => {
        setFormData(prev => {
            const newLocations = [...prev.dailyLocations];
            newLocations[dayIndex] = {
                ...newLocations[dayIndex],
                [type]: newValue
            };
            return {
                ...prev,
                dailyLocations: newLocations
            };
        });
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                    פרטי הטיול
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="שם הטיול"
                            name="tripName"
                            value={formData.tripName}
                            onChange={handleInputChange('tripName')}
                            placeholder="הכנס שם לטיול"
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="תיאור הטיול"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange('description')}
                            multiline
                            rows={4}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="תאריך התחלה"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleInputChange('startDate')}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="תאריך סיום"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleInputChange('endDate')}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="מספר ימים"
                            name="numDays"
                            type="number"
                            value={formData.numDays}
                            onChange={handleInputChange('numDays')}
                            InputProps={{ inputProps: { min: 1 } }}
                            size="small"
                        />
                    </Grid>

                    {formData.numDays > 0 && formData.dailyLocations.map((dayLocation, index) => (
                        <Grid item xs={12} key={index} container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    יום {index + 1}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    fullWidth
                                    options={locations}
                                    value={dayLocation.start}
                                    onChange={handleLocationChange(index, 'start')}
                                    onInputChange={(event, value) => {
                                        debouncedSearch(value, (results) => {
                                            setLocations(results);
                                        });
                                    }}
                                    loading={loading}
                                    loadingText="טוען..."
                                    noOptionsText={error || "לא נמצאו תוצאות"}
                                    getOptionLabel={(option) => option.label || ''}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={`מיקום התחלה - יום ${index + 1}`}
                                            size="small"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Box>
                                                <Typography>{option.label}</Typography>
                                                {option.fullAddress && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                        {option.fullAddress}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </li>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    fullWidth
                                    options={locations}
                                    value={dayLocation.end}
                                    onChange={handleLocationChange(index, 'end')}
                                    onInputChange={(event, value) => {
                                        debouncedSearch(value, (results) => {
                                            setLocations(results);
                                        });
                                    }}
                                    loading={loading}
                                    loadingText="טוען..."
                                    noOptionsText={error || "לא נמצאו תוצאות"}
                                    getOptionLabel={(option) => option.label || ''}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={`מיקום סיום - יום ${index + 1}`}
                                            size="small"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Box>
                                                <Typography>{option.label}</Typography>
                                                {option.fullAddress && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                        {option.fullAddress}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </li>
                                    )}
                                />
                            </Grid>
                        </Grid>
                    ))}

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="מספר חניכים"
                            name="numParticipants"
                            type="number"
                            value={formData.numParticipants}
                            onChange={handleInputChange('numParticipants')}
                            InputProps={{ inputProps: { min: 0 } }}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="מספר אנשי צוות"
                            name="numChaperones"
                            type="number"
                            value={formData.numChaperones}
                            onChange={handleInputChange('numChaperones')}
                            InputProps={{ inputProps: { min: 0 } }}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>מכיתה</InputLabel>
                            <Select
                                value={formData.gradeFrom}
                                onChange={handleInputChange('gradeFrom')}
                                label="מכיתה"
                            >
                                {gradeOptions.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {grade}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>עד כיתה</InputLabel>
                            <Select
                                value={formData.gradeTo}
                                onChange={handleInputChange('gradeTo')}
                                label="עד כיתה"
                            >
                                {gradeOptions.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {grade}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                            <InputLabel>סוג ארגון</InputLabel>
                            <Select
                                value={formData.organizationType}
                                onChange={handleInputChange('organizationType')}
                                label="סוג ארגון"
                            >
                                {organizationTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default BasicInfo;
