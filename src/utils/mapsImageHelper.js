/**
 * Utilitário para obter a imagem da atração diretamente do Google Meu Negócio / Google Maps
 * utilizando a URL (googleMapsUrl) cadastrada no Banco de Dados Postgres.
 * NÃO utiliza nenhuma imagem em cache local ou Google Drive.
 */

export function getPlaceImageUrl(place) {
  if (!place) return '';

  // 1. Se a atração possuir googleMapsUrl do Banco de Dados, busca a imagem do Google Meu Negócio
  if (place.googleMapsUrl) {
    let params = `url=${encodeURIComponent(place.googleMapsUrl)}`;
    if (place.lat && place.lng) {
      params += `&lat=${place.lat}&lng=${place.lng}`;
    }
    return `/api/extract-maps-photo?${params}`;
  }

  // 2. Se a capa vinda do Banco de Dados não for do Google Drive nem cache
  if (place.coverImage && typeof place.coverImage === 'string' && !place.coverImage.includes('googleusercontent.com') && !place.coverImage.includes('drive.google.com')) {
    return place.coverImage;
  }

  return '';
}

/**
 * Handler de erro para tags <img>.
 * Se a imagem falhar, reconecta ao endpoint do Google Meu Negócio com o link do Banco de Dados.
 */
export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;

  if (imgElement.dataset.fallbackState === 'failed') {
    return;
  }

  imgElement.dataset.fallbackState = 'failed';

  if (place.googleMapsUrl) {
    imgElement.src = `/api/extract-maps-photo?url=${encodeURIComponent(place.googleMapsUrl)}`;
  }
}
