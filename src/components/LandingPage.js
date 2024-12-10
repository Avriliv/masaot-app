import React from 'react';
import { Box, Card, CardContent, Typography, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Hiking as NewTripIcon,
  Terrain as MapIcon,
  WbSunny as WeatherIcon,
  Backpack as MyTripsIcon,
} from '@mui/icons-material';
import logoImage from '../assets/images/masa.logo.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'תכנון טיול חדש',
      icon: <NewTripIcon sx={{ fontSize: 45, color: '#2E7D32' }} />,
      path: '/new-trip'
    },
    {
      title: 'מפה',
      icon: <MapIcon sx={{ fontSize: 45, color: '#1565C0' }} />,
      path: '/map'
    },
    {
      title: 'מזג אוויר',
      icon: <WeatherIcon sx={{ fontSize: 45, color: '#EF6C00' }} />,
      path: '/weather'
    },
    {
      title: 'הטיולים שלי',
      icon: <MyTripsIcon sx={{ fontSize: 45, color: '#6A1B9A' }} />,
      path: '/my-trips'
    }
  ];

  return (
    <Box 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Box 
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              pt: 2,
              height: '100vh',
            }}
          >
            {/* Logo */}
            <Box
              component="img"
              src={logoImage}
              alt="Masa Logo"
              sx={{
                height: 'auto',
                width: '500px',
                maxWidth: '90%',
                mb: 0,
                filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            />

            {/* Cards */}
            <Box sx={{ 
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: -15  
            }}>
              <Grid 
                container 
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{ maxWidth: '1200px' }}
              >
                {features.map((feature) => (
                  <Grid item key={feature.title}>
                    <Card 
                      onClick={() => navigate(feature.path)}
                      sx={{
                        width: 220,
                        height: 180,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 2.5,
                        p: '24px !important'
                      }}>
                        {React.cloneElement(feature.icon, { 
                          sx: { fontSize: 60, color: feature.icon.props.sx.color }
                        })}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontSize: '1.4rem',
                            fontWeight: 500,
                            textAlign: 'center',
                            lineHeight: 1.2
                          }}
                        >
                          {feature.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{
          width: '100%',
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
          mt: 'auto'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                letterSpacing: 0.5,
                '& span': {
                  mx: 1.5,
                  opacity: 0.6
                }
              }}
            >
              AVRI <span>|</span> 2024
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;