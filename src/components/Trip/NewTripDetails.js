import React from 'react';
import { Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import NewTrip from './NewTrip'; // שינוי הייבוא לקובץ הקיים

const NewTripDetails = ({ onNext }) => {
  const handleSubmit = (formData) => {
    onNext(formData);
  };

  return (
    <Box>
      <NewTrip 
        onSubmit={handleSubmit}
        submitButtonText="המשך לתכנון המסלול"
        submitButtonIcon={<ArrowBack />}
      />
    </Box>
  );
};

export default NewTripDetails;
