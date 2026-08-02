/**
 * Utilitário para obter e exibir a imagem principal de cada atração obtida diretamente
 * da página do Google (googleMapsUrl) cadastrada no Banco de Dados Postgres Vercel.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';

  // 1. Prioridade máxima: Extrai a imagem da página do Google (googleMapsUrl cadastrada no banco de dados)
  if (place.googleMapsUrl && typeof place.googleMapsUrl === 'string' && place.googleMapsUrl.trim() !== '') {
    let params = `url=${encodeURIComponent(place.googleMapsUrl.trim())}`;
    if (place.lat && place.lng) {
      params += `&lat=${place.lat}&lng=${place.lng}`;
    }
    return `/api/extract-maps-photo?${params}`;
  }

  // 2. Fallback gracioso para a imagem de capa ou backup se válidas
  if (place.coverImage && typeof place.coverImage === 'string' && !place.coverImage.includes('googleusercontent.com/d/') && !place.coverImage.includes('drive.google.com')) {
    return place.coverImage.trim();
  }

  if (place.backupImage && typeof place.backupImage === 'string' && !place.backupImage.includes('googleusercontent.com/d/') && !place.backupImage.includes('drive.google.com')) {
    return place.backupImage.trim();
  }

  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
}

/**
 * Handler de erro para elementos <img>.
 * Se houver falha, conecta via /api/extract-maps-photo com a googleMapsUrl do banco.
 */
export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;

  if (imgElement.dataset.fallbackState === 'failed') {
    return;
  }

  imgElement.dataset.fallbackState = 'failed';

  if (place && place.googleMapsUrl) {
    imgElement.src = `/api/extract-maps-photo?url=${encodeURIComponent(place.googleMapsUrl)}`;
  } else {
    imgElement.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';
  }
}
