import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
} from '@mui/material';
import BasicInfo from './BasicInfo';
import MapPlanning from './MapPlanning';
import TripSummary from './TripSummary';
import { useTrip } from '../../context/TripContext';

const steps = [
    {
        label: 'פרטי הטיול',
        description: 'הגדרת פרטי הטיול הבסיסיים',
        component: BasicInfo,
        validation: (tripData) => tripData.basicDetails && tripData.basicDetails.tripName
    },
    {
        label: 'תכנון מסלול',
        description: 'תכנון מסלול הטיול על המפה',
        component: MapPlanning,
        validation: (tripData) => tripData.mapDetails && tripData.mapDetails.markers && tripData.mapDetails.markers.length >= 2
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
    const { tripData } = useTrip();

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

    const CurrentStepComponent = steps[activeStep].component;
    const isLastStep = activeStep === steps.length - 1;
    const canProceed = steps[activeStep].validation(tripData);

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((step) => (
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

            <CurrentStepComponent 
                onSubmit={handleNext} 
                onBack={handleBack}
                initialData={tripData} 
            />
        </Box>
    );
};

export default TripPlanningSteps;
