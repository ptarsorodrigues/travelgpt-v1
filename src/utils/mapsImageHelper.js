/**
 * Utilitário para obter e exibir a imagem oficial da atração diretamente dos campos
 * de imagem (coverImage ou backupImage) cadastrados no Banco de Dados/CSV.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';

  // 1. Prioriza a imagem de capa (coverImage) cadastrada no Banco de Dados/CSV (lh3.googleusercontent.com)
  if (place.coverImage && typeof place.coverImage === 'string' && place.coverImage.trim() !== '') {
    return place.coverImage.trim();
  }

  // 2. Fallback para a imagem secundária (backupImage)
  if (place.backupImage && typeof place.backupImage === 'string' && place.backupImage.trim() !== '') {
    return place.backupImage.trim();
  }

  // 3. Fallback para a propriedade genérica 'image'
  if (place.image && typeof place.image === 'string' && place.image.trim() !== '') {
    return place.image.trim();
  }

  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
}

/**
 * Handler de erro para tags <img>.
 * Se a imagem de capa falhar ao carregar, realiza fallback gracioso para backupImage.
 */
export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;

  if (imgElement.dataset.fallbackState === 'failed') {
    return;
  }

  const defaultFallback = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
  const backup = (place && place.backupImage && typeof place.backupImage === 'string' && place.backupImage.trim() !== '')
    ? place.backupImage.trim()
    : defaultFallback;

  if (imgElement.src !== backup) {
    imgElement.dataset.fallbackState = 'trying_backup';
    imgElement.src = backup;
  } else {
    imgElement.dataset.fallbackState = 'failed';
    imgElement.src = defaultFallback;
  }
}
