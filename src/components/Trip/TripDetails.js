import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Timer as DurationIcon
} from '@mui/icons-material';

const TripDetails = ({ trip }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // נתונים לדוגמה - יוחלפו בנתונים אמיתיים
  const tripData = {
    title: 'טיול שנתי לצפון',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    participants: 120,
    location: 'רמת הגולן',
    duration: '3 ימים',
    status: 'בתכנון',
    description: 'טיול שנתי לתלמידי שכבה י׳ הכולל מסלולי הליכה, פעילויות גיבוש ולינת שטח',
    ...trip
  };

  const InfoItem = ({ icon: Icon, text }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: { xs: 2, sm: 1 },
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left',
        gap: 1
      }}
    >
      <Icon sx={{ color: 'primary.main', fontSize: isMobile ? '2rem' : '1.5rem' }} />
      <Typography variant={isMobile ? "body2" : "body1"}>
        {text}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        justifyContent: 'space-between',
        mb: 3,
        gap: 2
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          gutterBottom 
          fontWeight="bold" 
          color="primary"
          textAlign={isMobile ? "center" : "left"}
        >
          {tripData.title}
        </Typography>
        
        <Chip 
          label={tripData.status}
          color={tripData.status === 'בתכנון' ? 'primary' : 'success'}
          size={isMobile ? "small" : "medium"}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 2, sm: 3 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              gutterBottom
              textAlign={isMobile ? "center" : "left"}
            >
              פרטים כלליים
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InfoItem 
                  icon={CalendarIcon} 
                  text={`${new Date(tripData.startDate).toLocaleDateString('he-IL')} - ${new Date(tripData.endDate).toLocaleDateString('he-IL')}`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <InfoItem 
                  icon={PeopleIcon} 
                  text={`${tripData.participants} משתתפים`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <InfoItem 
                  icon={LocationIcon} 
                  text={tripData.location}
                />
              </Grid>
              
              <Grid item xs={12}>
                <InfoItem 
                  icon={DurationIcon} 
                  text={tripData.duration}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 2, sm: 3 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              gutterBottom
              textAlign={isMobile ? "center" : "left"}
            >
              תיאור הטיול
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography 
              variant={isMobile ? "body2" : "body1"}
              textAlign={isMobile ? "center" : "right"}
            >
              {tripData.description}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TripDetails;
