/**
 * Utilitário para obter a URL da imagem de um ponto turístico / atração (Place)
 * diretamente a partir da página do Google Maps (googleMapsUrl) associada no Banco de Dados.
 * NÃO armazena a imagem fisicamente, apenas a exibe dinamicamente.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';

  // 1. Prioridade Absoluta: URL da página do Google Maps vinda do Banco de Dados
  const mapUrl = place.googleMapsUrl || place.google_maps_url || place.map_url;
  if (mapUrl && typeof mapUrl === 'string' && mapUrl.trim() !== '') {
    let params = `url=${encodeURIComponent(mapUrl.trim())}`;
    if (place.lat && place.lng) {
      params += `&lat=${place.lat}&lng=${place.lng}`;
    }
    if (place.id) {
      params += `&place_id=${encodeURIComponent(place.id)}`;
    }
    return `/api/extract-maps-photo?${params}`;
  }

  // 2. Fallbacks secundários caso o local não possua googleMapsUrl no Banco de Dados
  if (place.coverImage && typeof place.coverImage === 'string' && place.coverImage.trim() !== '') {
    return place.coverImage.trim();
  }

  if (place.backupImage && typeof place.backupImage === 'string' && place.backupImage.trim() !== '') {
    return place.backupImage.trim();
  }

  if (place.image && typeof place.image === 'string' && place.image.trim() !== '') {
    return place.image.trim();
  }

  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
}

/**
 * Retorna as imagens pertencentes a esta atração específica.
 */
export function getPlaceImages(place) {
  if (!place) return [];
  const list = [];

  const mainUrl = getPlaceImageUrl(place);
  if (mainUrl) {
    list.push(mainUrl);
  }

  if (place.coverImage && typeof place.coverImage === 'string' && place.coverImage.trim() !== '' && !list.includes(place.coverImage.trim())) {
    list.push(place.coverImage.trim());
  }

  if (place.backupImage && typeof place.backupImage === 'string' && place.backupImage.trim() !== '' && !list.includes(place.backupImage.trim())) {
    list.push(place.backupImage.trim());
  }

  return list.slice(0, 5);
}

/**
 * Handler de erro para tags <img>.
 * Se a imagem dinâmica da página do Google Maps falhar ao carregar, realiza fallback gracioso.
 */
export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;

  if (imgElement.dataset.fallbackState === 'failed') {
    return;
  }

  imgElement.dataset.fallbackState = 'failed';
  const defaultFallback = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
  const backup = (place.backupImage && typeof place.backupImage === 'string' && place.backupImage.trim() !== '')
    ? place.backupImage.trim()
    : (place.coverImage && typeof place.coverImage === 'string' && place.coverImage.trim() !== '')
      ? place.coverImage.trim()
      : defaultFallback;

  if (imgElement.src !== backup) {
    imgElement.src = backup;
  } else {
    imgElement.src = defaultFallback;
  }
}


