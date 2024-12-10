import React, { useState, useEffect } from 'react';
import {
    Grid,
    Typography,
    Container,
    Button,
    Box
} from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    formContainer: {
        width: '100%',
        maxWidth: '850px',
        margin: '20px auto',
        padding: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        direction: 'rtl',
        backgroundColor: '#fff',
        borderRadius: theme.shape.borderRadius,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    formLabel: {
        display: 'block',
        marginBottom: theme.spacing(1),
        fontSize: '0.95rem',
        fontWeight: 500,
        color: theme.palette.text.primary,
        textAlign: 'center',
        width: '100%'
    },
    formField: {
        marginBottom: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    input: {
        width: '100%',
        padding: theme.spacing(1.25),
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        fontSize: '0.95rem',
        fontFamily: 'Rubik, Arial, sans-serif',
        direction: 'rtl',
        textAlign: 'right',
        '&::placeholder': {
            textAlign: 'right'
        },
        '&:focus': {
            outline: 'none',
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.light}20`
        }
    },
    select: {
        width: '100%',
        padding: theme.spacing(1.25),
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        fontSize: '0.95rem',
        fontFamily: 'Rubik, Arial, sans-serif',
        direction: 'rtl',
        textAlign: 'right',
        '& option': {
            direction: 'rtl',
            textAlign: 'right'
        },
        '&:focus': {
            outline: 'none',
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.light}20`
        }
    },
    textarea: {
        width: '100%',
        padding: theme.spacing(1.25),
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        fontSize: '0.95rem',
        fontFamily: 'Rubik, Arial, sans-serif',
        direction: 'rtl',
        textAlign: 'right',
        minHeight: '100px',
        resize: 'vertical',
        '&::placeholder': {
            textAlign: 'right'
        },
        '&:focus': {
            outline: 'none',
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.light}20`
        }
    },
    pageTitle: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#1976d2',
        marginBottom: '8px',
        textAlign: 'center',
        fontFamily: 'Rubik, Arial, sans-serif'
    },
    pageSubtitle: {
        fontSize: '1rem',
        color: '#666',
        marginBottom: '24px',
        textAlign: 'center',
        fontFamily: 'Rubik, Arial, sans-serif'
    },
    requiredStaffNote: {
        fontSize: '0.9rem',
        color: theme.palette.info.main,
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        backgroundColor: `${theme.palette.info.light}20`,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.info.light}`,
        direction: 'rtl',
        textAlign: 'right',
        whiteSpace: 'pre-line',
        width: '100%'
    },
    option: {
        direction: 'rtl',
        textAlign: 'right'
    },
    actionButton: {
        marginTop: theme.spacing(3),
        alignSelf: 'flex-end',
        fontFamily: 'Rubik, Arial, sans-serif'
    }
}));

// פונקציה לחישוב צוות נדרש
const calculateRequiredStaff = (numStudents) => {
    if (!numStudents || numStudents <= 0) return null;

    const requiredStaff = {
        medics: Math.ceil(numStudents / 50), // חובש לכל 50 תלמידים
        security: Math.ceil(numStudents / 100) // מאבטח חמוש לכל 100 תלמידים
    };

    let note = `נדרשים לטיול זה: ${requiredStaff.security} מאבטחים חמושים, ${requiredStaff.medics} חובשים`;
    if (numStudents > 150) {
        note += '\nנדרש מוקד טבע';
    }
    
    return note;
};

const BasicInfo = ({
    data,
    onUpdate,
    onNext
}) => {
    const classes = useStyles();
    const [formData, setFormData] = useState({
        tripName: data?.tripName || '',
        description: data?.description || '',
        startDate: data?.startDate || '',
        endDate: data?.endDate || '',
        numDays: data?.numDays || '',
        numStudents: data?.numStudents || '',
        numStaff: data?.numStaff || '',
        organizationType: data?.organizationType || '',
        ageGroup: data?.ageGroup || ''
    });

    const [requiredStaffNote, setRequiredStaffNote] = useState('');

    const organizationTypes = [
        { value: 'school', label: 'בית ספר' },
        { value: 'youth_movement', label: 'תנועת נוער' },
        { value: 'informal_education', label: 'חינוך בלתי פורמאלי' },
        { value: 'other', label: 'אחר' }
    ];

    const ageGroups = [
        { value: 'elementary', label: 'יסודי' },
        { value: 'middle_school', label: 'חטיבת ביניים' },
        { value: 'high_school', label: 'חטיבה עליונה' },
        { value: 'other', label: 'אחר' }
    ];

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        // עדכון הערת צוות נדרש כשמשנים את מספר החניכים
        if (field === 'numStudents') {
            const note = calculateRequiredStaff(Number(value));
            setRequiredStaffNote(note);
        }
    };

    const handleSubmit = () => {
        onUpdate(formData);
        if (onNext) onNext();
    };

    return (
        <Box sx={(theme) => ({ 
            width: '100%',
            minHeight: '100vh',
            padding: theme.spacing(2),
            backgroundColor: '#fafafa'
        })}>
            <div className={classes.formContainer}>
                <Typography className={classes.pageTitle}>
                    פרטי הטיול
                </Typography>
                <Typography className={classes.pageSubtitle}>
                    מלא את הפרטים הבסיסיים של הטיול
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>שם הטיול</label>
                            <input
                                className={classes.input}
                                value={formData.tripName}
                                onChange={handleInputChange('tripName')}
                                placeholder="הכנס את שם הטיול"
                            />
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>תיאור הטיול</label>
                            <textarea
                                className={classes.textarea}
                                value={formData.description}
                                onChange={handleInputChange('description')}
                                placeholder="הכנס תיאור לטיול"
                                rows={4}
                            />
                        </div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>תאריך התחלה</label>
                            <input
                                className={classes.input}
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange('startDate')}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>תאריך סיום</label>
                            <input
                                className={classes.input}
                                type="date"
                                value={formData.endDate}
                                onChange={handleInputChange('endDate')}
                            />
                        </div>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>מספר ימים</label>
                            <input
                                className={classes.input}
                                type="number"
                                value={formData.numDays}
                                onChange={handleInputChange('numDays')}
                                min="1"
                            />
                        </div>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>מספר חניכים</label>
                            <input
                                className={classes.input}
                                type="number"
                                value={formData.numStudents}
                                onChange={handleInputChange('numStudents')}
                                min="0"
                            />
                            {requiredStaffNote && (
                                <Typography className={classes.requiredStaffNote}>
                                    {requiredStaffNote}
                                </Typography>
                            )}
                        </div>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>מספר אנשי צוות</label>
                            <input
                                className={classes.input}
                                type="number"
                                value={formData.numStaff}
                                onChange={handleInputChange('numStaff')}
                                min="0"
                            />
                        </div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>סוג ארגון</label>
                            <select
                                className={classes.select}
                                value={formData.organizationType}
                                onChange={handleInputChange('organizationType')}
                            >
                                <option value="">בחר סוג ארגון</option>
                                {organizationTypes.map((option) => (
                                    <option key={option.value} value={option.value} className={classes.option}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className={classes.formField}>
                            <label className={classes.formLabel}>קבוצת גיל</label>
                            <select
                                className={classes.select}
                                value={formData.ageGroup}
                                onChange={handleInputChange('ageGroup')}
                            >
                                <option value="">בחר קבוצת גיל</option>
                                {ageGroups.map((option) => (
                                    <option key={option.value} value={option.value} className={classes.option}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        המשך
                    </Button>
                </Box>
            </div>
        </Box>
    );
};

export default BasicInfo;
