// src/services/tripService.js

// מבנה בסיסי של טיול
const tripTemplate = {
    basicInfo: {
        id: null,
        name: '',
        startDate: null,
        endDate: null,
        type: '', // יומי, לילה, מספר ימים
        organization: '',
        participantsCount: 0,
        ageGroup: '',
        hasSpecialNeeds: false
    },
    route: {
        points: [], // נקודות במסלול
        trails: [], // שבילים מסומנים
        totalDistance: 0,
        elevationGain: 0,
        elevationLoss: 0,
        estimatedDuration: 0,
        stops: [], // נקודות עצירה
        campSites: [] // חניוני לילה
    },
    logistics: {
        equipment: {
            group: [], // ציוד קבוצתי
            personal: [] // ציוד אישי
        },
        water: {
            totalNeeded: 0,
            sources: [] // נקודות מים
        },
        food: {
            meals: [],
            specialDiets: []
        },
        transportation: {
            type: '',
            details: '',
            pickupPoint: null,
            dropoffPoint: null
        }
    },
    safety: {
        requiredStaff: {
            guides: 0,
            medics: 0,
            guards: 0
        },
        permissions: [],
        emergencyContacts: [],
        emergencyRoutes: [],
        weatherAlerts: []
    }
};

const tripService = {
    // יצירת טיול חדש
    createNewTrip: () => {
        return {
            ...tripTemplate,
            basicInfo: {
                ...tripTemplate.basicInfo,
                id: Date.now()
            }
        };
    },

    // חישוב דרישות בטיחות
    calculateSafetyRequirements: (participantsCount, tripType, hasSpecialNeeds) => {
        return {
            guides: Math.ceil(participantsCount / 15),
            medics: Math.ceil(participantsCount / 50),
            guards: Math.ceil(participantsCount / 50)
        };
    },

    // חישוב כמות מים נדרשת
    calculateWaterRequirements: (participantsCount, distance, weather) => {
        const baseWaterPerPerson = 3; // ליטר ליום
        const weatherFactor = weather === 'hot' ? 1.5 : 1;
        const distanceFactor = Math.ceil(distance / 10); // תוספת ליטר לכל 10 ק"מ

        return participantsCount * (baseWaterPerPerson + distanceFactor) * weatherFactor;
    },

    // בדיקת תוקף אישורים
    validatePermissions: (permissions) => {
        const required = [
            'אישור ביטחוני',
            'אישור בטיחותי',
            'אישורי הורים',
            'ביטוח'
        ];

        return required.every(req => permissions.includes(req));
    },

    // שמירת טיול
    saveTrip: async (trip) => {
        try {
            // בהמשך נשמור בשרת
            localStorage.setItem(`trip_${trip.basicInfo.id}`, JSON.stringify(trip));
            return true;
        } catch (error) {
            console.error('שגיאה בשמירת הטיול:', error);
            return false;
        }
    },

    // טעינת טיול
    loadTrip: async (tripId) => {
        try {
            const trip = localStorage.getItem(`trip_${tripId}`);
            return trip ? JSON.parse(trip) : null;
        } catch (error) {
            console.error('שגיאה בטעינת הטיול:', error);
            return null;
        }
    },

    // קבלת רשימת טיולים
    getAllTrips: async () => {
        try {
            const trips = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('trip_')) {
                    const trip = JSON.parse(localStorage.getItem(key));
                    trips.push(trip);
                }
            }
            return trips;
        } catch (error) {
            console.error('שגיאה בטעינת הטיולים:', error);
            return [];
        }
    },

    // חישוב עלויות
    calculateCosts: (trip) => {
        // לוגיקה לחישוב עלויות
        return {
            transportation: 0,
            equipment: 0,
            food: 0,
            staff: 0,
            other: 0,
            total: 0
        };
    },

    // יצוא דוח טיול
    exportTripReport: (trip) => {
        // יצירת דוח מפורט
        return {
            basicInfo: trip.basicInfo,
            route: {
                distance: trip.route.totalDistance,
                duration: trip.route.estimatedDuration,
                stops: trip.route.stops.length
            },
            safety: {
                staff: trip.safety.requiredStaff,
                permissions: trip.safety.permissions
            },
            logistics: {
                water: trip.logistics.water.totalNeeded,
                equipment: trip.logistics.equipment
            }
        };
    }
};

export default tripService;