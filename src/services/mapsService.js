// ==========================================================================
// MODERN VILLAGE - GOOGLE MAPS & LIVE GEOLOCATION SERVICE
// Live GPS Tracking, Reverse Geocoding & Interactive Map Links
// ==========================================================================

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/**
 * Retrieves the current live GPS position of the user via high-accuracy Geolocation.
 * Returns { latitude, longitude, accuracy, timestamp }
 */
export function getLiveGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 10), // accuracy in meters
          timestamp: new Date(position.timestamp || Date.now()).toISOString()
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location coordinates.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied by user. Please allow location access in your browser settings to tag problem location.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable on this device.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Reverse geocodes latitude & longitude into a readable Indian address / landmark.
 * Prefers Google Maps Geocoding API if key configured, with fallback to OpenStreetMap Nominatim.
 */
export async function reverseGeocodeLocation(latitude, longitude) {
  // 1. Google Maps Geocoding API
  if (GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY.trim() !== '') {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results?.[0]) {
        const result = data.results[0];
        return {
          formattedAddress: result.formatted_address,
          source: 'Google Maps Geocoding',
          placeId: result.place_id,
          components: result.address_components
        };
      }
    } catch (err) {
      console.warn('[MapsService] Google Maps Geocoding failed, trying fallback:', err);
    }
  }

  // 2. OpenStreetMap / Nominatim Fallback (Free & Open)
  try {
    const fallbackUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(fallbackUrl, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'ModernVillagePanchayatApp/1.0'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        // Clean up concise address
        const addr = data.address || {};
        const village = addr.village || addr.suburb || addr.town || addr.county || 'Kandavara';
        const road = addr.road || addr.lane || 'Main Road';
        const concise = `${road}, ${village} (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

        return {
          formattedAddress: concise,
          source: 'OpenStreetMap Reverse Geocode',
          fullDisplayName: data.display_name
        };
      }
    }
  } catch (err) {
    console.warn('[MapsService] Fallback reverse geocode failed:', err);
  }

  // 3. Coordinate Fallback
  return {
    formattedAddress: `GPS Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
    source: 'GPS Coordinates'
  };
}

/**
 * Constructs direct Google Maps navigational URL.
 */
export function getGoogleMapsUrl(latitude, longitude) {
  if (!latitude || !longitude) return '#';
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Constructs Google Maps Embed URL for interactive iframe preview.
 */
export function getGoogleMapsEmbedUrl(latitude, longitude) {
  if (!latitude || !longitude) return null;
  if (GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY.trim() !== '') {
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${latitude},${longitude}&zoom=16`;
  }
  // Free OpenStreetMap Embed Fallback
  const delta = 0.005;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
}
