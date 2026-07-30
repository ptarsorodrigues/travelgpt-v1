// Haversine formula to compute distance in km between two geo coordinates
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 9999;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 9999;
  
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const dist = R * c;
  
  // 1 decimal place if < 10 km, else rounded integer
  return dist < 10 ? Math.round(dist * 10) / 10 : Math.round(dist);
}

export function formatDistance(distKm, includeSuffix = false) {
  if (distKm === undefined || distKm === null || isNaN(distKm)) return '';
  const formatted = distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm} km`;
  return includeSuffix ? `${formatted} de você` : formatted;
}
