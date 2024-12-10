import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Container,
  Paper,
  Divider
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  LocalShipping as LogisticsIcon,
  Map as MapIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon
} from '@mui/icons-material';

const MyTrips = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'תיקי טיול',
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      description: 'ניהול תיקי טיול מלאים',
      path: '/trip-folders'
    },
    {
      title: 'תכנון טיולים',
      icon: <MapIcon sx={{ fontSize: 40 }} />,
      description: 'תכנון וניהול מסלולי טיול',
      path: '/new-trip'
    },
    {
      title: 'מפות ומסלולים',
      icon: <MapIcon sx={{ fontSize: 40 }} />,
      description: 'צפייה ותכנון מסלולי טיול',
      path: '/maps'
    },
    {
      title: 'ניהול משתתפים',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      description: 'ניהול משתתפי הטיולים',
      path: '/participants'
    },
    {
      title: 'מסמכים ואישורים',
      icon: <DocumentIcon sx={{ fontSize: 40 }} />,
      description: 'ניהול מסמכי הטיולים',
      path: '/documents'
    },
    {
      title: 'בטיחות',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      description: 'ניהול היבטי בטיחות',
      path: '/safety'
    },
    {
      title: 'לוגיסטיקה',
      icon: <LogisticsIcon sx={{ fontSize: 40 }} />,
      description: 'ניהול לוגיסטי של הטיולים',
      path: '/logistics'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 0.5, sm: 1, md: 1.5 },
      px: { xs: 0.5, sm: 1, md: 2 }
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 0.5, sm: 1, md: 1.5 },
          minHeight: { xs: 'calc(100vh - 60px)', sm: 'calc(100vh - 80px)', md: 'calc(100vh - 100px)' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}
      >
        <Box sx={{ 
          mb: { xs: 0.5, sm: 1, md: 1.5 }, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: { xs: 0.5, sm: 1, md: 1.5 }
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            color="primary" 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}
          >
            הטיולים שלי
          </Typography>
          <IconButton
            color="primary"
            size="small"
            onClick={() => navigate('/new-trip')}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              padding: { xs: '4px', sm: '8px' },
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'scale(1.1)',
                transition: 'transform 0.2s'
              }
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: { xs: 0.5, sm: 1, md: 1.5 } }} />

        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} key={category.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => navigate(category.path)}
              >
                <CardContent sx={{ 
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: { xs: 1, sm: 1.5, md: 2 },
                  '&:last-child': { pb: { xs: 1, sm: 1.5, md: 2 } }
                }}>
                  <Box
                    sx={{
                      mb: { xs: 0.5, sm: 1, md: 1.5 },
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: { xs: 32, sm: 40, md: 48 },
                      height: { xs: 32, sm: 40, md: 48 },
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
                      opacity: 0.9
                    }}
                  >
                    {React.cloneElement(category.icon, { 
                      sx: { fontSize: { xs: 18, sm: 24, md: 28 } }
                    })}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      mb: { xs: 0.25, sm: 0.5, md: 0.75 },
                      fontWeight: 'medium'
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                      lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {category.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default MyTrips;
