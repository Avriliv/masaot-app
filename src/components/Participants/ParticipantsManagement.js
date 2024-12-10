import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const ParticipantsManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // טאבים בדף
  const tabs = [
    { label: 'רשימת משתתפים', value: 0 },
    { label: 'אישורי הורים', value: 1 },
    { label: 'מידע רפואי', value: 2 },
    { label: 'קבוצות', value: 3 }
  ];

  // טיפול בהוספת/עריכת משתתף
  const handleParticipantSubmit = (participant) => {
    if (selectedParticipant) {
      // עריכת משתתף קיים
      setParticipants(prev => prev.map(p => 
        p.id === selectedParticipant.id ? { ...p, ...participant } : p
      ));
    } else {
      // הוספת משתתף חדש
      setParticipants(prev => [...prev, { ...participant, id: Date.now() }]);
    }
    setOpenDialog(false);
    setSelectedParticipant(null);
  };

  // שליחת אישורי הורים במייל
  const sendParentalApproval = (participant) => {
    // TODO: implement email sending
    console.log('Sending parental approval to:', participant.email);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        width: '100%',
        minHeight: '100vh',
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {/* כותרת */}
        <Typography variant="h5" component="h1" gutterBottom>
          ניהול משתתפים
        </Typography>

        {/* טאבים */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                py: 1
              }
            }}
          >
            {tabs.map(tab => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        {/* תוכן הטאב */}
        <Box sx={{ 
          flex: 1,
          width: '100%',
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 2
        }}>
          {activeTab === 0 && (
            <>
              {/* כפתור הוספת משתתף */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ mb: 2 }}
              >
                הוסף משתתף
              </Button>

              {/* טבלת משתתפים */}
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>שם מלא</TableCell>
                      <TableCell>גיל</TableCell>
                      <TableCell>טלפון</TableCell>
                      <TableCell>דוא&quot;ל</TableCell>
                      <TableCell>אישור הורים</TableCell>
                      <TableCell>מידע רפואי</TableCell>
                      <TableCell>פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.fullName}</TableCell>
                        <TableCell>{participant.age}</TableCell>
                        <TableCell>{participant.phone}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell>
                          {participant.parentalApproval ? (
                            <DownloadIcon color="success" />
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => sendParentalApproval(participant)}
                            >
                              <EmailIcon />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          {participant.medicalInfo ? 'יש' : 'אין'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setOpenDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setParticipants(prev => 
                                prev.filter(p => p.id !== participant.id)
                              );
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {activeTab === 1 && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                אישורי הורים
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>שם משתתף</TableCell>
                      <TableCell>סטטוס</TableCell>
                      <TableCell>תאריך שליחה</TableCell>
                      <TableCell>תאריך אישור</TableCell>
                      <TableCell>פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.fullName}</TableCell>
                        <TableCell>
                          {participant.parentalApproval ? 'אושר' : 'ממתין'}
                        </TableCell>
                        <TableCell>
                          {participant.approvalSentDate || 'טרם נשלח'}
                        </TableCell>
                        <TableCell>
                          {participant.approvalDate || '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => sendParentalApproval(participant)}
                          >
                            <EmailIcon />
                          </IconButton>
                          {participant.parentalApproval && (
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                מידע רפואי
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>שם משתתף</TableCell>
                      <TableCell>מצב רפואי</TableCell>
                      <TableCell>תרופות</TableCell>
                      <TableCell>הערות</TableCell>
                      <TableCell>פעולות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.fullName}</TableCell>
                        <TableCell>
                          {participant.medicalCondition || 'תקין'}
                        </TableCell>
                        <TableCell>
                          {participant.medications || 'אין'}
                        </TableCell>
                        <TableCell>
                          {participant.medicalNotes || '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setOpenDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 3 && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                קבוצות
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ 
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="subtitle1" gutterBottom>
                      קבוצה א'
                    </Typography>
                    <List>
                      {participants.slice(0, 5).map((participant) => (
                        <ListItem
                          key={participant.id}
                          secondaryAction={
                            <IconButton edge="end" size="small">
                              <EditIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={participant.fullName}
                            secondary={`גיל: ${participant.age}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ 
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="subtitle1" gutterBottom>
                      קבוצה ב'
                    </Typography>
                    <List>
                      {participants.slice(5, 10).map((participant) => (
                        <ListItem
                          key={participant.id}
                          secondaryAction={
                            <IconButton edge="end" size="small">
                              <EditIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={participant.fullName}
                            secondary={`גיל: ${participant.age}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ 
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="subtitle1" gutterBottom>
                      קבוצה ג'
                    </Typography>
                    <List>
                      {participants.slice(10, 15).map((participant) => (
                        <ListItem
                          key={participant.id}
                          secondaryAction={
                            <IconButton edge="end" size="small">
                              <EditIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={participant.fullName}
                            secondary={`גיל: ${participant.age}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>

      {/* דיאלוג הוספת/עריכת משתתף */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setSelectedParticipant(null);
        }}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            p: 2
          }
        }}
      >
        <DialogTitle>
          {selectedParticipant ? 'עריכת משתתף' : 'הוספת משתתף חדש'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם מלא"
                defaultValue={selectedParticipant?.fullName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="גיל"
                type="number"
                defaultValue={selectedParticipant?.age}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="טלפון"
                defaultValue={selectedParticipant?.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="דוא&quot;ל"
                type="email"
                defaultValue={selectedParticipant?.email}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setSelectedParticipant(null);
          }}>
            ביטול
          </Button>
          <Button 
            variant="contained"
            onClick={() => handleParticipantSubmit({
              fullName: 'שם זמני', // TODO: get actual values from form
              age: 18,
              phone: '050-0000000',
              email: 'temp@email.com'
            })}
          >
            {selectedParticipant ? 'שמור' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParticipantsManagement;
