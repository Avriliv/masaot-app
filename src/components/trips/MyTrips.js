// src/components/trips/MyTrips.js
import React from 'react';

const MyTrips = ({ trips }) => {
    return (
        <div>
            <h2>הטיולים שלי</h2>
            {trips.length === 0 ? (
                <p>אין טיולים כרגע.</p>
            ) : (
                trips.map((trip, index) => (
                    <div key={index} style={styles.tripCard}>
                        <h3>{trip.tripDetails.tripName}</h3>
                        <p>תאריך: {trip.tripDetails.startDate} - {trip.tripDetails.endDate}</p>
                        <p>יעד: {trip.tripDetails.destination}</p>
                        <p>עלות: {trip.tripDetails.cost} ₪</p>
                        <button style={styles.viewTripButton}>צפה בתיק הטיול</button>
                    </div>
                ))
            )}
        </div>
    );
};

const styles = {
    tripCard: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    viewTripButton: {
        backgroundColor: '#1e90ff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    }
};

export default MyTrips;
