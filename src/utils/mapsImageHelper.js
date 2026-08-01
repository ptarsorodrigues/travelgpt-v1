/**
 * Utilitário para obter a URL da imagem de um estabelecimento (Place).
 * Utiliza prioritariamente coverImage e backupImage como fallback.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';
  return place.coverImage || place.backupImage || '';
}

/**
 * Retorna ESTRITAMENTE as imagens cadastradas para esta atração específica.
 * Nenhuma imagem genérica ou do Google Drive é utilizada.
 */
export function getPlaceImages(place) {
  if (!place) return [];
  const list = [];

  // 1. Foto de capa da atração
  if (place.coverImage && typeof place.coverImage === 'string') {
    list.push(place.coverImage);
  }

  // 2. Foto de backup da própria atração (se diferente da capa)
  if (place.backupImage && typeof place.backupImage === 'string' && !list.includes(place.backupImage)) {
    list.push(place.backupImage);
  }

  // 3. Foto oficial extraída do Wikipedia/Wikivoyage para este local específico
  if (place.wikiImageUrl && typeof place.wikiImageUrl === 'string' && !list.includes(place.wikiImageUrl)) {
    list.push(place.wikiImageUrl);
  }

  // 4. Galeria de fotos específica cadastrada no próprio objeto da atração (se houver)
  if (Array.isArray(place.images)) {
    place.images.forEach(img => {
      if (img && typeof img === 'string' && !list.includes(img)) {
        list.push(img);
      }
    });
  }

  // Limita estritamente ao máximo de 5 fotos por atração
  return list.slice(0, 5);
}

/**
 * Handler de erro para tags <img>.
 * Se a capa falhar, altera o src para backupImage.
 */
export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;
  
  if (imgElement.dataset.fallbackState === 'failed') {
    return;
  }

  imgElement.dataset.fallbackState = 'failed';
  if (place.backupImage && imgElement.src !== place.backupImage) {
    imgElement.src = place.backupImage;
  }
}
