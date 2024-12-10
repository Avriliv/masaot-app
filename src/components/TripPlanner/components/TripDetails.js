import React from 'react';
import {
  Box,
  TextField,
  Grid,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Select,
  DatePicker,
  InputAdornment,
  Button,
} from '@mui/material';
import { useTrip } from '../../../context/TripContext';

export default function TripDetails({ onNext }) {
  const { tripState, updateBasicDetails } = useTrip();
  const { basicDetails } = tripState;

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateBasicDetails({ [name]: value });
  };

  const handleNext = () => {
    if (basicDetails.tripName?.trim()) {
      // שמירת המידע לפני המעבר
      updateBasicDetails(basicDetails);
      onNext();
    }
  };

  const tripTypes = [
    { value: 'nature', label: 'טיול טבע' },
    { value: 'city', label: 'טיול עירוני' },
    { value: 'mixed', label: 'טיול משולב' },
    { value: 'overseas', label: 'טיול לחו"ל' },
  ];

  const ageGroups = [
    { value: 'elementary', label: 'בית ספר יסודי' },
    { value: 'middle', label: 'חטיבת ביניים' },
    { value: 'high', label: 'תיכון' },
    { value: 'youth', label: 'תנועת נוער' },
    { value: 'adult', label: 'מבוגרים' },
    { value: 'family', label: 'משפחות' },
  ];

  return (
    <Box 
      sx={{
        width: '100%',
        maxWidth: '500px',
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 1.5 }
      }}
    >
      <Grid 
        container 
        spacing={1}
        alignItems="flex-start"
      >
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="שם הטיול"
            name="tripName"
            value={basicDetails.tripName || ''}
            onChange={handleChange}
            placeholder="הכנס שם לטיול"
            size="small"
            sx={{ 
              '& .MuiInputLabel-root': {
                fontSize: '0.85rem',
                color: '#455a64'
              },
              '& .MuiInputBase-input': {
                fontSize: '0.85rem'
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.85rem', color: '#455a64' }}>סוג טיול</InputLabel>
            <Select
              name="tripType"
              value={basicDetails.tripType || ''}
              onChange={handleChange}
              sx={{ 
                fontSize: '0.85rem',
                '& .MuiSelect-select': {
                  padding: '6px 14px'
                }
              }}
            >
              {tripTypes.map((type) => (
                <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.85rem' }}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.85rem', color: '#455a64' }}>קבוצת גיל</InputLabel>
            <Select
              name="ageGroup"
              value={basicDetails.ageGroup || ''}
              onChange={handleChange}
              sx={{ 
                fontSize: '0.85rem',
                '& .MuiSelect-select': {
                  padding: '6px 14px'
                }
              }}
            >
              {ageGroups.map((group) => (
                <MenuItem key={group.value} value={group.value} sx={{ fontSize: '0.85rem' }}>
                  {group.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="מוסד/ארגון"
            name="organization"
            value={basicDetails.organization || ''}
            onChange={handleChange}
            size="small"
            sx={{ 
              '& .MuiInputLabel-root': {
                fontSize: '0.85rem',
                color: '#455a64'
              },
              '& .MuiInputBase-input': {
                fontSize: '0.85rem'
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="מספר משתתפים"
            name="participantsCount"
            value={basicDetails.participantsCount || ''}
            onChange={handleChange}
            size="small"
            sx={{ 
              '& .MuiInputLabel-root': {
                fontSize: '0.85rem',
                color: '#455a64'
              },
              '& .MuiInputBase-input': {
                fontSize: '0.85rem',
                padding: '6px 14px'
              }
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!basicDetails.tripName?.trim()}
          sx={{
            minWidth: 100,
            fontSize: '0.85rem',
            py: 0.5,
            bgcolor: '#37474f',
            '&:hover': {
              bgcolor: '#263238'
            },
            '&:disabled': {
              bgcolor: '#cfd8dc'
            }
          }}
        >
          המשך
        </Button>
      </Box>
    </Box>
  );
}
