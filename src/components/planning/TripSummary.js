import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { Map as MapIcon, Check as CheckIcon } from '@mui/icons-material';

const TripSummary = ({ data, onUpdate }) => {
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    };

    const handleSave = () => {
        // כאן תהיה הלוגיקה של שמירת הטיול
        onUpdate({ saved: true });
    };

    return (
        <Grid container spacing={3}>
            {/* פרטי הטיול */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <MapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            פרטי הטיול
                        </Typography>
                        <List dense>
                            {data.details && Object.entries(data.details).map(([key, value]) => (
                                <ListItem key={key}>
                                    <ListItemText 
                                        primary={key}
                                        secondary={value}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* מסלול */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <MapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            פרטי המסלול
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    primary="נקודות במסלול"
                                    secondary={data.route?.points?.length || 0}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="אורך המסלול"
                                    secondary={`${data.route?.distance?.toFixed(1) || 0} ק"מ`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="זמן משוער"
                                    secondary={`${Math.floor(data.route?.estimatedTime / 60) || 0} שעות ${Math.round(data.route?.estimatedTime % 60) || 0} דקות`}
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* כפתור שמירה */}
            <Grid item xs={12}>
                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={handleSave}
                    fullWidth
                >
                    שמור טיול
                </Button>
            </Grid>
        </Grid>
    );
};

export default TripSummary;
