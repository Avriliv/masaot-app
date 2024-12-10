import React, { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import BasicInfo from '../planning/BasicInfo';
import MapPlanning from '../planning/MapPlanning';
import Summary from '../planning/Summary';

const useStyles = makeStyles((theme) => ({
    paper: {
        width: '100%',
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1),
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        overflowX: 'hidden',
        '& .MuiTextField-root': {
            marginBottom: theme.spacing(1.5)
        }
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        width: '100%',
        gap: theme.spacing(2),
        '& .MuiButton-root': {
            minWidth: '120px'
        }
    },
    stepperContainer: {
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh'
    },
    contentContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
}));

const TripPlanningSteps = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [tripData, setTripData] = useState({});
    const classes = useStyles();

    const steps = [
        { 
            label: 'פרטי הטיול', 
            component: BasicInfo,
            dataKey: 'basicInfo',
            description: 'הזן את פרטי הטיול הבסיסיים'
        },
        { 
            label: 'תכנון מסלול', 
            component: MapPlanning,
            dataKey: 'route',
            description: 'תכנן את מסלול הטיול על המפה'
        },
        { 
            label: 'סיכום', 
            component: Summary,
            dataKey: 'summary',
            description: 'סיכום פרטי הטיול'
        }
    ];

    const CurrentStep = steps[activeStep].component;

    return (
        <Box className={classes.stepperContainer}>
            <Box className={classes.contentContainer}>
                <Paper className={classes.paper}>
                    <CurrentStep 
                        data={tripData}
                        onUpdate={(newData) => setTripData(prev => ({ ...prev, ...newData }))}
                        onNext={() => setActiveStep(prev => Math.min(prev + 1, steps.length - 1))}
                        onBack={() => setActiveStep(prev => Math.max(prev - 1, 0))}
                    />
                </Paper>
            </Box>
        </Box>
    );
};

export default TripPlanningSteps;
