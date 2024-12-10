import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import StepperProgress from './StepperProgress';
import StepperNavigation from './StepperNavigation';
import MapComponent from './map/MapComponent';
import TripDetails from './TripDetails';

const StepperContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  minHeight: '400px',
  padding: theme.spacing(2),
}));

const TripPlannerStepper = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <TripDetails onNext={handleNext} />;
      case 1:
        return <MapComponent onNext={handleNext} />;
      case 2:
        return <div>סיכום - בקרוב</div>;
      default:
        return null;
    }
  };

  return (
    <StepperContainer>
      <StepperProgress activeStep={activeStep} />
      <ContentContainer>
        {renderStepContent(activeStep)}
      </ContentContainer>
      <StepperNavigation
        activeStep={activeStep}
        handleNext={handleNext}
        handleBack={handleBack}
        isLastStep={activeStep === 2}
      />
    </StepperContainer>
  );
};

export default TripPlannerStepper;
