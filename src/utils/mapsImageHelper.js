/**
 * Utilitário para obter a URL da imagem de um estabelecimento (Place).
 * Utiliza prioritariamente coverImage e backupImage como fallback.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';
  return place.coverImage || place.backupImage || '';
}

/**
 * Retorna uma lista de todas as imagens disponíveis do local para carrossel.
 */
export function getPlaceImages(place) {
  if (!place) return [];
  const list = [];
  
  if (place.coverImage) {
    list.push(place.coverImage);
  }
  
  if (place.backupImage && !list.includes(place.backupImage)) {
    list.push(place.backupImage);
  }

  if (place.wikiImageUrl && !list.includes(place.wikiImageUrl)) {
    list.push(place.wikiImageUrl);
  }

  if (Array.isArray(place.images)) {
    place.images.forEach(img => {
      if (img && typeof img === 'string' && !list.includes(img)) {
        list.push(img);
      }
    });
  }

  return list.length > 0 ? list : ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80'];
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
