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

/**
 * Normalizes text by removing diacritics/accents and converting to lowercase.
 * Example: "Santo André" -> "santo andre"
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Portuguese Phonetic Key Generator (Metaphone-like for PT-BR)
 */
export function getPhoneticKey(text) {
  if (!text) return '';
  let str = normalizeText(text);

  str = str
    .replace(/ph/g, 'f')
    .replace(/ch/g, 'x')
    .replace(/sh/g, 'x')
    .replace(/lh/g, 'l')
    .replace(/nh/g, 'n')
    .replace(/ç/g, 's')
    .replace(/c([ei])/g, 's$1')
    .replace(/c([aou])/g, 'k$1')
    .replace(/q/g, 'k')
    .replace(/w/g, 'v')
    .replace(/y/g, 'i')
    .replace(/z/g, 's')
    .replace(/ge/g, 'je')
    .replace(/gi/g, 'ji')
    .replace(/h/g, '')
    .replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1');

  return str;
}

/**
 * Checks if target string matches query using exact normalization AND Portuguese phonetic rules.
 */
export function fuzzyPhoneticMatch(target, query) {
  if (!target || !query) return false;
  
  const normTarget = normalizeText(target);
  const normQuery = normalizeText(query);
  
  // 1. Direct normalized substring match
  if (normTarget.includes(normQuery)) return true;
  
  // 2. Phonetic string match
  const targetPhonetic = getPhoneticKey(target);
  const queryPhonetic = getPhoneticKey(query);
  
  if (targetPhonetic.includes(queryPhonetic)) return true;
  
  // 3. Word token matching
  const targetWords = normTarget.split(/\s+/);
  const queryWords = normQuery.split(/\s+/);
  
  return queryWords.every(qw => {
    const qwPhonetic = getPhoneticKey(qw);
    return targetWords.some(tw => {
      if (tw.includes(qw)) return true;
      const twPhonetic = getPhoneticKey(tw);
      return twPhonetic.includes(qwPhonetic);
    });
  });
}
