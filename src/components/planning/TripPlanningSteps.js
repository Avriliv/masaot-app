import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Grid,
} from '@mui/material';
import MapPlanning from './MapPlanning';
import TripDetails from './TripDetails';
import TripSummary from './TripSummary';

const steps = [
    {
        label: 'פרטי הטיול',
        description: 'הגדרת פרטי הטיול הבסיסיים',
        component: TripDetails,
        validation: (data) => data.details && Object.keys(data.details).length > 0
    },
    {
        label: 'תכנון מסלול',
        description: 'תכנון מסלול הטיול על המפה',
        component: MapPlanning,
        validation: (data) => data.route && data.route.points && data.route.points.length >= 2
    },
    {
        label: 'סיכום',
        description: 'סיכום פרטי הטיול',
        component: TripSummary,
        validation: () => true
    }
];

const TripPlanningSteps = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [tripData, setTripData] = useState({});

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep((prevStep) => prevStep - 1);
        }
    };

    const handleStepDataUpdate = (data) => {
        setTripData((prevData) => ({
            ...prevData,
            ...data
        }));
    };

    const CurrentStepComponent = steps[activeStep].component;
    const isLastStep = activeStep === steps.length - 1;
    const canProceed = steps[activeStep].validation(tripData);

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.slice(0, 3).map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel>
                            <Typography>{step.label}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
            
            <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    {steps[activeStep].label}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                    {steps[activeStep].description}
                </Typography>
            </Box>

            <CurrentStepComponent data={tripData} onUpdate={handleStepDataUpdate} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                >
                    חזור
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!canProceed}
                >
                    {isLastStep ? 'סיים' : 'המשך'}
                </Button>
            </Box>
        </Box>
    );
};

export default TripPlanningSteps;
