/**
 * Utilitário para obter a URL das imagens autênticas de um estabelecimento (Place).
 * Apenas imagens pertencentes à própria atração são utilizadas.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';
  return place.coverImage || place.backupImage || '';
}

/**
 * Retorna exclusivamente as imagens pertencentes a esta atração específica.
 * Nenhuma imagem genérica de categoria é adicionada.
 */
export function getPlaceImages(place) {
  if (!place) return [];
  const list = [];
  
  // 1. Imagem de capa principal da atração
  if (place.coverImage && typeof place.coverImage === 'string') {
    list.push(place.coverImage);
  }
  
  // 2. Imagem secundária / backup da própria atração (se for diferente da capa)
  if (place.backupImage && typeof place.backupImage === 'string' && !list.includes(place.backupImage)) {
    list.push(place.backupImage);
  }

  // 3. Imagem oficial extraída do Wikipedia / Wikivoyage específica deste local
  if (place.wikiImageUrl && typeof place.wikiImageUrl === 'string' && !list.includes(place.wikiImageUrl)) {
    list.push(place.wikiImageUrl);
  }

  // 4. Galeria de fotos específica cadastrada no objeto da atração (se houver)
  if (Array.isArray(place.images)) {
    place.images.forEach(img => {
      if (img && typeof img === 'string' && !list.includes(img)) {
        list.push(img);
      }
    });
  }

  return list.length > 0 ? list : [getPlaceImageUrl(place)];
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
