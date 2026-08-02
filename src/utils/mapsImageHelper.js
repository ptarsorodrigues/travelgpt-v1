const CATEGORY_FALLBACKS = {
  'waterpark': 'https://images.unsplash.com/photo-1582650625119-3a31f8418b0d?auto=format&fit=crop&w=1000&q=80',
  'park': 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80',
  'zoo': 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1000&q=80',
  'waterfall': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80',
  'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  'museum': 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1000&q=80',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80'
};

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.includes('googleusercontent.com/d/') || trimmed.includes('drive.google.com')) {
    return false;
  }
  return true;
}

export function getCategoryFallback(place) {
  if (!place) return CATEGORY_FALLBACKS.default;
  const cat = (place.category || place.mainCategory || '').toLowerCase();
  const title = (place.title || '').toLowerCase();

  if (title.includes('piscina') || title.includes('thermas') || title.includes('toboagua') || title.includes('aquátic')) return CATEGORY_FALLBACKS.waterpark;
  if (title.includes('zoo') || title.includes('fazendin') || cat.includes('zoológico')) return CATEGORY_FALLBACKS.zoo;
  if (title.includes('cachoeira') || title.includes('corredeira')) return CATEGORY_FALLBACKS.waterfall;
  if (title.includes('praia') || title.includes('prainha') || title.includes('balneário')) return CATEGORY_FALLBACKS.beach;
  if (title.includes('museu') || cat.includes('museu')) return CATEGORY_FALLBACKS.museum;

  return CATEGORY_FALLBACKS.park;
}

export function getPlaceImageUrl(place) {
  if (!place) return CATEGORY_FALLBACKS.default;

  if (isValidImageUrl(place.coverImage)) {
    return place.coverImage.trim();
  }

  if (isValidImageUrl(place.backupImage)) {
    return place.backupImage.trim();
  }

  if (isValidImageUrl(place.image)) {
    return place.image.trim();
  }

  return getCategoryFallback(place);
}

export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;

  if (imgElement.dataset.fallbackState === 'failed') {
    return;
  }

  const fallback = getCategoryFallback(place);
  const backup = isValidImageUrl(place.backupImage) ? place.backupImage.trim() : fallback;

  if (imgElement.src !== backup) {
    imgElement.dataset.fallbackState = 'trying_backup';
    imgElement.src = backup;
  } else {
    imgElement.dataset.fallbackState = 'failed';
    imgElement.src = fallback;
  }
}

