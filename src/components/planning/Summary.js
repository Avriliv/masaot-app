import React from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid,
    Button,
    List,
    ListItem,
    ListItemText,
    Chip,
    Stack
} from '@mui/material';
import {
    Info as InfoIcon,
    Map as MapIcon,
    DirectionsWalk as WalkIcon,
} from '@mui/icons-material';

const getOrganizationType = (type) => {
    const types = {
        'school': 'בית ספר',
        'youth_movement': 'תנועת נוער',
        'informal_education': 'חינוך בלתי פורמאלי',
        'other': 'אחר'
    };
    return types[type] || type;
};

const getAgeGroup = (group) => {
    const groups = {
        'elementary': 'יסודי',
        'middle_school': 'חטיבת ביניים',
        'high_school': 'חטיבה עליונה',
        'other': 'אחר'
    };
    return groups[group] || group;
};

const Summary = ({ data, onUpdate, onBack }) => {
    const renderBasicInfo = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                פרטי הטיול
            </Typography>
            <List dense>
                <ListItem>
                    <ListItemText
                        primary="שם הטיול"
                        secondary={data.tripName || 'לא הוגדר'}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="תאריכים"
                        secondary={`${data.startDate || 'לא הוגדר'} - ${data.endDate || 'לא הוגדר'}`}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="מספר משתתפים"
                        secondary={`${data.numStudents || '0'} תלמידים, ${data.numStaff || '0'} אנשי צוות`}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="תיאור הטיול"
                        secondary={data.description || 'לא הוגדר'}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="סוג ארגון"
                        secondary={getOrganizationType(data.organizationType) || 'לא הוגדר'}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="שכבת גיל"
                        secondary={getAgeGroup(data.ageGroup) || 'לא הוגדר'}
                    />
                </ListItem>
            </List>
        </Box>
    );

    const renderMapInfo = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                <MapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                מסלול
            </Typography>
            <List dense>
                <ListItem>
                    <ListItemText
                        primary="מרחק כולל"
                        secondary={`${data.route?.totalDistance?.toFixed(2) || '0'} ק"מ`}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="נקודות במסלול"
                        secondary={
                            <Box sx={{ mt: 1 }}>
                                {data.route?.waypoints?.map((point, index) => (
                                    <Chip
                                        key={index}
                                        label={point.name || `נקודה ${index + 1}`}
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                            </Box>
                        }
                    />
                </ListItem>
            </List>
            {data.route?.mapImage && (
                <Box sx={{ mt: 2 }}>
                    <img 
                        src={data.route.mapImage} 
                        alt="מפת המסלול"
                        style={{ 
                            width: '100%', 
                            maxWidth: '600px', 
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} 
                    />
                </Box>
            )}
            {data.route?.mapSnapshot && (
                <Box sx={{ mt: 2 }}>
                    <img 
                        src={data.route.mapSnapshot} 
                        alt="תצלום המסלול"
                        style={{ 
                            width: '100%', 
                            maxWidth: '600px', 
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} 
                    />
                </Box>
            )}
        </Box>
    );

    return (
        <Box>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
                סיכום פרטי טיול
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {renderBasicInfo()}
                    </Grid>
                    <Grid item xs={12}>
                        {renderMapInfo()}
                    </Grid>
                </Grid>
            </Paper>

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                <Button
                    variant="outlined"
                    onClick={onBack}
                >
                    חזור
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onUpdate({ status: 'completed' })}
                >
                    סיים תכנון
                </Button>
            </Stack>
        </Box>
    );
};

export default Summary;
