/**
 * Utilitário para obter a URL da imagem de um estabelecimento (Place).
 * Utiliza prioritariamente coverImage e backupImage como fallback.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';
  return place.coverImage || place.backupImage || '';
}

/**
 * Handler de erro para tags <img> que tentam carregar a imagem principal.
 * Se a capa falhar, altera o src para backupImage.
 */
export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;
  
  if (imgElement.dataset.fallbackState === 'failed') {
    return; // Já tentou todos os fallbacks
  }

  imgElement.dataset.fallbackState = 'failed';
  if (place.backupImage && imgElement.src !== place.backupImage) {
    imgElement.src = place.backupImage;
  }
}
