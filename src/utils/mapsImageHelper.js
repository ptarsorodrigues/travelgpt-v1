/**
 * Utilitário para obter a URL da imagem extraída online do googleMapsUrl para um estabelecimento (Place).
 * Se googleMapsUrl estiver disponível, utiliza a API de extração online.
 * Caso contrário, utiliza coverImage ou backupImage como fallback.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';

  if (place.googleMapsUrl) {
    const params = new URLSearchParams();
    params.set('url', place.googleMapsUrl);
    if (place.lat) params.set('lat', place.lat);
    if (place.lng) params.set('lng', place.lng);
    if (place.id) params.set('place_id', place.id);

    return `/api/extract-maps-photo?${params.toString()}`;
  }

  return place.coverImage || place.backupImage || '';
}

/**
 * Handler de erro para tags <img> que tentam carregar a imagem online do Google Maps.
 * Se a requisição online falhar (404/Network Error), altera o src para o coverImage local ou backupImage.
 */
export function handlePlaceImageError(event, place) {
  const imgElement = event.target;
  
  if (imgElement.dataset.fallbackState === 'failed') {
    return; // Já tentou todos os fallbacks
  }

  if (!imgElement.dataset.fallbackState) {
    imgElement.dataset.fallbackState = 'cover';
    if (place.coverImage && imgElement.src !== place.coverImage) {
      imgElement.src = place.coverImage;
      return;
    }
  }

  if (imgElement.dataset.fallbackState === 'cover') {
    imgElement.dataset.fallbackState = 'failed';
    if (place.backupImage) {
      imgElement.src = place.backupImage;
    }
  }
}
