import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  DirectionsBus as TransportIcon,
  Hotel as AccommodationIcon,
  Restaurant as FoodIcon,
  Backpack as EquipmentIcon,
  Save,
  Print,
  Share
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import HikingMap from '../Map/HikingMap';

const TripSummary = () => {
  const navigate = useNavigate();

  const handleSave = () => {
    // TODO: שמירת הטיול במערכת
    navigate('/my-trips');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // TODO: שיתוף הטיול
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h4" gutterBottom>
        סיכום הטיול
      </Typography>

      <Grid container spacing={3}>
        {/* פרטים בסיסיים */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              פרטים בסיסיים
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="שם הטיול" 
                  secondary="טיול שנתי לצפון" 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="תאריכים" 
                  secondary="15-17 במרץ, 2024" 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="מספר משתתפים" 
                  secondary="45 תלמידים, 5 מורים" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* מפת המסלול */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              מפת המסלול
            </Typography>
            <HikingMap readonly={true} />
          </Paper>
        </Grid>

        {/* לוגיסטיקה */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              פרטים לוגיסטיים
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <TransportIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">הסעות</Typography>
                    <Typography variant="body2" color="text.secondary">
                      אוטובוס צמוד למשך כל הטיול
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <AccommodationIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">לינה</Typography>
                    <Typography variant="body2" color="text.secondary">
                      אכסניית אנ"א בטבריה
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <FoodIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">כלכלה</Typography>
                    <Typography variant="body2" color="text.secondary">
                      פנסיון מלא כולל ארוחות שטח
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <EquipmentIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">ציוד</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ציוד הליכה ולינה בסיסי
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* כפתורי פעולה */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
        mt: 3 
      }}>
        <Button
          variant="outlined"
          startIcon={<Share />}
          onClick={handleShare}
        >
          שתף
        </Button>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrint}
        >
          הדפס
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          שמור טיול
        </Button>
      </Box>
    </Box>
  );
};

export default TripSummary;
