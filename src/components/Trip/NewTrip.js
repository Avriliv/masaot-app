import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Container,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  DatePicker, 
  TimePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Home as HomeIcon, 
  ExpandMore as ExpandMoreIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  DirectionsWalk as DirectionsWalkIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  LocationOn as LocationOnIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import he from 'date-fns/locale/he';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

// יצירת theme עם תמיכה ב-RTL
const theme = createTheme({
  direction: 'rtl',
});

// יצירת cache עם תמיכה ב-RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const NewTrip = ({ onSave, data }) => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [newPointName, setNewPointName] = useState('');
  const [formData, setFormData] = useState(data || {
    tripName: '',
    description: '',
    organizationType: '',
    ageGroup: '',
    studentsCount: '',
    instructorsCount: '',
    medicsCount: '',
    securityCount: '',
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    duration: 1,
    startPoint: '',
    endPoint: '',
    routePoints: [], // מערך לשמירת נקודות הביניים במסלול
    dailyRoutes: []
  });

  // חישוב כמות אנשי צוות נדרשים
  const calculateRequiredStaff = (studentsCount) => {
    const count = parseInt(studentsCount) || 0;
    if (count === 0) return { medics: 0, security: 0, instructors: 0 };

    // חישוב לפי תקן משרד החינוך
    let medics = 1; // חובש אחד מינימום
    if (count > 50) {
      medics = Math.ceil(count / 50); // חובש נוסף לכל 50 תלמידים
    }

    let security = 1; // מאבטח אחד מינימום
    if (count > 100) {
      security = Math.ceil(count / 100); // מאבטח נוסף לכל 100 תלמידים
    }

    let instructors = Math.ceil(count / 20); // מדריך אחד לכל 20 תלמידים

    return { medics, security, instructors };
  };

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? event;
    const updatedFormData = { ...formData, [field]: value };
    
    if (field === 'studentsCount') {
      const staffRequirements = calculateRequiredStaff(value);
      updatedFormData.medicsCount = staffRequirements.medics;
      updatedFormData.securityCount = staffRequirements.security;
      updatedFormData.instructorsCount = staffRequirements.instructors;
    }

    setFormData(updatedFormData);
  };

  const handleSaveTrip = () => {
    // בדיקות תיקוף
    const requiredFields = [
      'tripName', 
      'description', 
      'organizationType', 
      'ageGroup', 
      'studentsCount', 
      'startDate', 
      'endDate',
      'startPoint',
      'endPoint'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert(`אנא מלא את השדות הבאים: ${missingFields.join(', ')}`);
      return;
    }

    onSave(formData);
  };

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Container maxWidth="md">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            mt: 2 
          }}>
            <Typography variant="h5" gutterBottom>
              פרטי הטיול
            </Typography>

            <TextField
              label="שם הטיול"
              value={formData.tripName}
              onChange={handleChange('tripName')}
              fullWidth
              required
            />

            <TextField
              label="תיאור הטיול"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={4}
              fullWidth
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>סוג הארגון</InputLabel>
                  <Select
                    value={formData.organizationType}
                    onChange={handleChange('organizationType')}
                    label="סוג הארגון"
                  >
                    <MenuItem value="school">בית ספר</MenuItem>
                    <MenuItem value="youth">תנועת נוער</MenuItem>
                    <MenuItem value="other">אחר</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>קבוצת גיל</InputLabel>
                  <Select
                    value={formData.ageGroup}
                    onChange={handleChange('ageGroup')}
                    label="קבוצת גיל"
                  >
                    <MenuItem value="elementary">יסודי</MenuItem>
                    <MenuItem value="middle">חטיבת ביניים</MenuItem>
                    <MenuItem value="high">תיכון</MenuItem>
                    <MenuItem value="other">אחר</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="מספר חניכים"
                  type="number"
                  value={formData.studentsCount}
                  onChange={handleChange('studentsCount')}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="מספר מדריכים"
                  type="number"
                  value={formData.instructorsCount}
                  onChange={handleChange('instructorsCount')}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="מספר ימים"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange('duration')}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker
                    label="תאריך התחלה"
                    value={formData.startDate}
                    onChange={handleChange('startDate')}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="תאריך סיום"
                    value={formData.endDate}
                    onChange={handleChange('endDate')}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="נקודת התחלה"
                  value={formData.startPoint}
                  onChange={handleChange('startPoint')}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="נקודת סיום"
                  value={formData.endPoint}
                  onChange={handleChange('endPoint')}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveTrip}
              sx={{ mt: 2 }}
            >
              המשך
            </Button>
          </Box>
        </Container>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default NewTrip;
