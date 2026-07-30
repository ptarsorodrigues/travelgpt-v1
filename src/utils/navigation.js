/**
 * Utility functions for Waze and Google Maps navigation deep links.
 */

export function getWazeUrl(place, userLocation) {
  if (!place) return 'https://waze.com';
  
  if (place.lat && place.lng) {
    let url = `https://waze.com/ul?ll=${place.lat},${place.lng}&navigate=yes`;
    if (userLocation && userLocation.lat && userLocation.lng) {
      url += `&from=${userLocation.lat},${userLocation.lng}`;
    }
    return url;
  }
  
  const query = encodeURIComponent(`${place.title} ${place.address || place.city || ''}`.trim());
  return `https://waze.com/ul?q=${query}&navigate=yes`;
}

export function getGoogleMapsUrl(place, userLocation) {
  if (!place) return 'https://maps.google.com';
  
  const dest = (place.lat && place.lng)
    ? `${place.lat},${place.lng}`
    : encodeURIComponent(`${place.title} ${place.address || place.city || ''}`.trim());
    
  if (userLocation && userLocation.lat && userLocation.lng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${dest}&travelmode=driving`;
  }
  
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

export function handleOpenWaze(e, place, userLocation) {
  if (e) e.stopPropagation();
  const url = getWazeUrl(place, userLocation);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function handleOpenGoogleMaps(e, place, userLocation) {
  if (e) e.stopPropagation();
  const url = getGoogleMapsUrl(place, userLocation);
  window.open(url, '_blank', 'noopener,noreferrer');
}
