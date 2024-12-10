import React, { useState } from 'react';
import { Box, Paper, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const steps = [
  'פרטי הטיול',
  'תכנון מסלול',
  'סיכום'
];

const StepperContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  direction: 'rtl',
  '& .MuiStepper-root': {
    direction: 'rtl'
  },
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.divider
  },
  '& .MuiStepLabel-root': {
    flexDirection: 'row-reverse'
  },
  '& .MuiStepLabel-labelContainer': {
    textAlign: 'right'
  }
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  minHeight: '400px',
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  direction: 'rtl'
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  direction: 'rtl'
}));

const TripPlannerStepper = ({ children }) => {
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
        return <BasicInfo />;
      case 1:
        return <MapPlanning />;
      case 2:
        return <Summary />;
      default:
        return null;
    }
  };

  return (
    <StepperContainer>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <Typography variant="body1" style={{ textAlign: 'right' }}>
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <ContentContainer>
        {renderStepContent(activeStep)}
      </ContentContainer>

      <NavigationContainer>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={activeStep === steps.length - 1}
          endIcon={<NavigateNextIcon />}
          sx={{ marginLeft: 1 }}
        >
          המשך
        </Button>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<NavigateBeforeIcon />}
        >
          חזור
        </Button>
      </NavigationContainer>
    </StepperContainer>
  );
};

export default TripPlannerStepper;
