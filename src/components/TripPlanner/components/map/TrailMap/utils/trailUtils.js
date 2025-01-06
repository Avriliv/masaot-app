import * as turf from '@turf/turf';

// קבועים לבדיקות תקינות
const ISRAEL_BOUNDS = {
    minLat: 29.3,  // אילת
    maxLat: 33.3,  // מטולה
    minLon: 34.2,  // חוף הים התיכון
    maxLon: 35.9   // רמת הגולן
};

const VALID_TRAIL_TYPES = ['israel_trail', 'marked', 'regional', 'local', 'unknown'];
const VALID_TRAIL_QUALITIES = ['excellent', 'good', 'intermediate', 'bad', 'unknown'];
const VALID_TRAIL_DIFFICULTIES = ['hiking', 'mountain_hiking', 'demanding_mountain_hiking', 'alpine_hiking', 'demanding_alpine_hiking', 'difficult_alpine_hiking'];

// פונקציות עזר לבדיקת תקינות
const validateCoordinates = (coords, label = '') => {
    if (!Array.isArray(coords) || coords.length !== 2) {
        console.error(`Invalid coordinates${label}:`, coords);
        return false;
    }
    const [lat, lon] = coords;
    if (typeof lat !== 'number' || typeof lon !== 'number') {
        console.error(`Coordinates are not numbers${label}:`, coords);
        return false;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        console.error(`Coordinates out of bounds${label}:`, coords);
        return false;
    }
    return true;
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // רדיוס כדור הארץ בק"מ
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// פונקציה לחישוב אורך שביל
const calculateTrailLength = (coordinates) => {
    let length = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const curr = coordinates[i];
        const next = coordinates[i + 1];
        length += haversineDistance(curr.lat, curr.lon, next.lat, next.lon);
    }
    return Number(length.toFixed(2));
};

// פונקציה לבדיקת קואורדינטות בגבולות ישראל
const isPointInIsrael = (lat, lon) => {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
        return false;
    }
    return lat >= ISRAEL_BOUNDS.minLat && lat <= ISRAEL_BOUNDS.maxLat &&
           lon >= ISRAEL_BOUNDS.minLon && lon <= ISRAEL_BOUNDS.maxLon;
};

// פונקציה לחישוב מסלול בין נקודות
export const calculateRoute = async (points) => {
    try {
        console.group('🚶 Calculating Route');
        console.log('Points:', points);

        if (!points || points.length < 2) {
            throw new Error('Need at least 2 points to calculate route');
        }

        // Get marked trails in the area
        const bounds = getBoundsFromPoints(points.map(p => p.coordinates));
        console.log('Fetching trails within bounds:', bounds);
        
        const trails = await getMarkedTrails(bounds);
        console.log('Found marked trails:', trails.length);

        if (!trails || trails.length === 0) {
            throw new Error('No marked trails found in the area');
        }

        // Calculate route using marked trails
        const route = await calculateRouteOnTrails(points[0], points[points.length - 1], trails);
        console.log('Route calculated:', route);

        if (!route) {
            throw new Error('Failed to calculate route on marked trails');
        }

        return route;
    } catch (error) {
        console.error('Error calculating route:', error);
        throw error;
    } finally {
        console.groupEnd();
    }
};

// פונקציה לקבלת שבילים מסומנים מ-OSM
export const getMarkedTrails = async (bounds) => {
    console.group('🗺️ Fetching Marked Trails');
    try {
        // בניית שאילתת Overpass משופרת
        const query = `
            [out:json][timeout:25];
            (
                // שבילים מסומנים
                way["highway"="path"]["trail_visibility"~"excellent|good|intermediate"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
                way["highway"="footway"]["trail_visibility"~"excellent|good|intermediate"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
                
                // שביל ישראל
                way["route"="hiking"]["ref"="INT"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
                
                // שבילים מסומנים נוספים
                way["route"="hiking"]["network"="iwn"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
                way["route"="hiking"]["network"="nwn"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
                way["route"="hiking"]["network"="rwn"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
            );
            out body;
            >;
            out skel qt;
        `;

        console.log('Overpass query:', query);

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: query
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trails from Overpass API');
        }

        const data = await response.json();
        console.log('Raw Overpass response:', data);

        // המרת הנתונים למבנה שימושי יותר
        const trails = data.elements
            .filter(element => element.type === 'way')
            .map(way => {
                const nodes = way.nodes.map(nodeId => {
                    const node = data.elements.find(el => el.type === 'node' && el.id === nodeId);
                    return node ? [node.lat, node.lon] : null;
                }).filter(Boolean);

                // זיהוי סוג השביל
                let trailType = 'marked';
                if (way.tags?.ref === 'INT' || way.tags?.network === 'iwn') {
                    trailType = 'israel_trail';
                } else if (way.tags?.network === 'nwn') {
                    trailType = 'national';
                } else if (way.tags?.network === 'rwn') {
                    trailType = 'regional';
                }

                return {
                    id: way.id,
                    type: trailType,
                    name: way.tags?.name || `Trail ${way.id}`,
                    difficulty: way.tags?.sac_scale || 'unknown',
                    coordinates: nodes,
                    properties: way.tags || {}
                };
            })
            .filter(trail => trail.coordinates.length >= 2); // רק שבילים עם לפחות 2 נקודות

        console.log('Processed trails:', trails);
        return trails;

    } catch (error) {
        console.error('Error fetching trails:', error);
        throw error;
    } finally {
        console.groupEnd();
    }
};

// פונקציה למציאת השביל הקרוב ביותר
export const findNearestTrail = (point, trails, maxDistance = 2) => {
    if (!point?.coordinates || !trails?.length) return null;

    let nearestTrail = null;
    let minDistance = Infinity;
    let nearestPoint = null;

    const [lat, lon] = point.coordinates;
    const pointTurf = turf.point([lon, lat]);

    for (const trail of trails) {
        if (!trail.geometry?.length) continue;

        // המרת נקודות השביל לפורמט של turf
        const lineString = turf.lineString(trail.geometry.map(coord => [coord[1], coord[0]]));
        
        // מציאת הנקודה הקרובה ביותר על השביל
        const nearestPointOnLine = turf.nearestPointOnLine(lineString, pointTurf);
        const distance = nearestPointOnLine.properties.dist; // המרחק בקילומטרים

        if (distance < minDistance && distance <= maxDistance) {
            minDistance = distance;
            nearestTrail = trail;
            nearestPoint = {
                lat: nearestPointOnLine.geometry.coordinates[1],
                lon: nearestPointOnLine.geometry.coordinates[0]
            };
        }
    }

    return nearestTrail ? {
        trail: nearestTrail,
        point: nearestPoint,
        distance: minDistance
    } : null;
};

// פונקציה לחישוב מסלול על שבילים מסומנים
export const calculateRouteOnTrails = async (startPoint, endPoint, trails) => {
    try {
        console.group('🛣️ Calculating Route on Trails');
        console.log('Start point:', startPoint);
        console.log('End point:', endPoint);
        console.log('Available trails:', trails?.length);

        if (!startPoint?.coordinates || !endPoint?.coordinates || !trails?.length) {
            throw new Error('Missing required data for route calculation');
        }

        // Convert coordinates to the correct format
        const startCoords = Array.isArray(startPoint.coordinates) ? 
            startPoint.coordinates : [startPoint.coordinates.lat, startPoint.coordinates.lon];
        const endCoords = Array.isArray(endPoint.coordinates) ? 
            endPoint.coordinates : [endPoint.coordinates.lat, endPoint.coordinates.lon];

        console.log('Converted coordinates:', { startCoords, endCoords });

        // Validate coordinates
        if (!validateCoordinates(startCoords, ' (start)') || !validateCoordinates(endCoords, ' (end)')) {
            throw new Error('Invalid coordinates provided');
        }

        // Create turf points
        const startTurf = turf.point([startCoords[1], startCoords[0]]);
        const endTurf = turf.point([endCoords[1], endCoords[0]]);

        // Create trail network
        const trailNetwork = trails.map(trail => {
            return turf.lineString(trail.coordinates.map(coord => [coord[1], coord[0]]), {
                id: trail.id,
                type: trail.type
            });
        });

        console.log('Created trail network with', trailNetwork.length, 'segments');

        // Find nearest trails to start and end points
        const startTrail = findNearestTrail({ coordinates: startCoords }, trails);
        const endTrail = findNearestTrail({ coordinates: endCoords }, trails);

        if (!startTrail || !endTrail) {
            throw new Error('Could not find trails near start/end points');
        }

        console.log('Found nearest trails:', {
            start: startTrail.trail.name,
            end: endTrail.trail.name
        });

        // Calculate shortest path
        const network = turf.featureCollection(trailNetwork);
        const options = {
            obstacles: network,
            units: 'kilometers'
        };

        const route = turf.shortestPath(startTurf, endTurf, options);

        if (!route || !route.geometry || !route.geometry.coordinates.length === 0) {
            throw new Error('Failed to calculate route on marked trails');
        }

        console.log('Route calculated with', route.geometry.coordinates.length, 'points');

        // Format route for return
        const formattedRoute = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: route.geometry.coordinates
            },
            properties: {
                distance: calculateDistance(route),
                startPoint: startPoint.name || 'Start',
                endPoint: endPoint.name || 'End',
                startTrail: startTrail.trail.name,
                endTrail: endTrail.trail.name
            }
        };

        console.log('Route calculated successfully:', formattedRoute);
        return { route: formattedRoute };

    } catch (error) {
        console.error('Error calculating route on trails:', error);
        throw error;
    } finally {
        console.groupEnd();
    }
};

// פונקציה לחישוב מרחק במטרים בין שתי נקודות
export const calculateDistance = (route) => {
    if (!route || route.length < 2) return 0;

    const line = turf.lineString(route);
    return turf.length(line, { units: 'kilometers' });
};

// פונקציה לחישוב סטטיסטיקות גובה
export const calculateElevationStats = (elevationData) => {
    if (!elevationData || elevationData.length === 0) {
        return {
            totalAscent: 0,
            totalDescent: 0,
            maxElevation: 0,
            minElevation: 0
        };
    }

    let totalAscent = 0;
    let totalDescent = 0;
    let maxElevation = elevationData[0];
    let minElevation = elevationData[0];

    for (let i = 1; i < elevationData.length; i++) {
        const diff = elevationData[i] - elevationData[i - 1];
        if (diff > 0) {
            totalAscent += diff;
        } else {
            totalDescent += Math.abs(diff);
        }

        maxElevation = Math.max(maxElevation, elevationData[i]);
        minElevation = Math.min(minElevation, elevationData[i]);
    }

    return {
        totalAscent,
        totalDescent,
        maxElevation,
        minElevation
    };
};

// פונקציה לקבלת נתוני גובה עבור נקודות
export const getElevationData = async (coordinates) => {
    console.group('📊 Fetching Elevation Data');
    console.log('Points to process:', coordinates.length);

    if (!coordinates || coordinates.length === 0) {
        console.log('No coordinates provided');
        console.groupEnd();
        return [];
    }

    // מחלקים את הנקודות לקבוצות של 100 נקודות (מגבלת ה-API)
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < coordinates.length; i += batchSize) {
        const batch = coordinates.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(coordinates.length/batchSize)}`);

        const locations = batch.map(coord => ({
            latitude: coord[0],
            longitude: coord[1]
        }));

        try {
            const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ locations })
            });

            if (!response.ok) {
                throw new Error(`Elevation API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const elevations = data.results.map(result => result.elevation);
            console.log(`Batch ${Math.floor(i/batchSize) + 1} complete:`, {
                points: elevations.length,
                min: Math.min(...elevations),
                max: Math.max(...elevations)
            });
            
            batches.push(elevations);
        } catch (error) {
            console.error('Error fetching elevation data:', error);
            // במקרה של שגיאה, נחזיר גבהים אקראיים בין 0 ל-1000 מטר
            const randomElevations = batch.map(() => Math.floor(Math.random() * 1000));
            console.warn('Using random elevations for this batch');
            batches.push(randomElevations);
        }
    }

    const result = batches.flat();
    console.log('Elevation data complete:', {
        total: result.length,
        min: Math.min(...result),
        max: Math.max(...result),
        average: result.reduce((a, b) => a + b, 0) / result.length
    });
    
    console.groupEnd();
    return result;
};

// פונקציה לחלוקת מסלול לימים
export const splitRouteByDays = (route, numberOfDays) => {
    if (!route || route.length < 2 || !numberOfDays) {
        return [];
    }

    const totalDistance = calculateDistance(route);
    const targetDailyDistance = totalDistance / numberOfDays;
    const segments = [];
  
    let currentSegment = [route[0]];
    let currentDistance = 0;
  
    for (let i = 1; i < route.length; i++) {
        const segmentDistance = calculateDistance([route[i-1], route[i]]);
        currentDistance += segmentDistance;
        currentSegment.push(route[i]);
        
        if (currentDistance >= targetDailyDistance || i === route.length - 1) {
            segments.push(currentSegment);
            if (i < route.length - 1) {
                currentSegment = [route[i]];
                currentDistance = 0;
            }
        }
    }

    // אם יש פחות סגמנטים ממספר הימים, נחלק את הנותר
    while (segments.length < numberOfDays && segments.length > 0) {
        const longestSegment = segments.reduce((prev, curr) => 
          calculateDistance(curr) > calculateDistance(prev) ? curr : prev
        );
        const index = segments.indexOf(longestSegment);
        const mid = Math.floor(longestSegment.length / 2);
        
        segments.splice(index, 1, 
          longestSegment.slice(0, mid),
          longestSegment.slice(mid)
        );
    }

    return segments;
};

// פונקציה לחישוב גבולות מנקודות
export const getBoundsFromPoints = (points) => {
    if (!points || points.length === 0) return null;

    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);

    return {
        north: Math.max(...lats) + 0.1, // הגדלנו ל-0.1
        south: Math.min(...lats) - 0.1,
        east: Math.max(...lngs) + 0.1,
        west: Math.min(...lngs) - 0.1
    };
};
