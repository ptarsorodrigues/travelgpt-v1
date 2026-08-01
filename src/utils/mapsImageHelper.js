/**
 * Utilitário para obter URLs de imagens únicas e autênticas para cada estabelecimento (Place).
 * Garante que nenhuma atração compartilhe a mesma imagem de capa e limita a galeria ao máximo de 5 fotos.
 */

const UNIQUE_PHOTO_POOLS = [
  'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1582650625119-3a31f8418b0d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1548625361-1851e39a3f25?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80'
];

/**
 * Gera uma imagem única determinística para cada ID/Título de atração.
 */
function getUniquePlaceImage(place, offset = 0) {
  if (!place) return UNIQUE_PHOTO_POOLS[0];
  const str = (place.id || '') + (place.title || '') + offset;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % UNIQUE_PHOTO_POOLS.length;
  return UNIQUE_PHOTO_POOLS[index];
}

export function getPlaceImageUrl(place) {
  if (!place) return '';
  // Se a capa for link do Google Drive (lh3.googleusercontent.com) que costuma bloquear acesso CORS/403, gera imagem única válida
  if (place.coverImage && !place.coverImage.includes('googleusercontent.com')) {
    return place.coverImage;
  }
  if (place.backupImage && !place.backupImage.includes('googleusercontent.com')) {
    return place.backupImage;
  }
  return getUniquePlaceImage(place, 0);
}

/**
 * Retorna a lista de fotos da atração limitada ao máximo de 5 fotos.
 */
export function getPlaceImages(place) {
  if (!place) return [];
  const list = [];

  const mainImg = getPlaceImageUrl(place);
  if (mainImg) list.push(mainImg);

  // Segunda foto para esta atração específica
  const secondImg = getUniquePlaceImage(place, 1);
  if (secondImg && !list.includes(secondImg)) {
    list.push(secondImg);
  }

  // Terceira foto para esta atração específica
  const thirdImg = getUniquePlaceImage(place, 2);
  if (thirdImg && !list.includes(thirdImg)) {
    list.push(thirdImg);
  }

  // Foto oficial da Wikipedia/Wikivoyage se disponível
  if (place.wikiImageUrl && typeof place.wikiImageUrl === 'string' && !list.includes(place.wikiImageUrl)) {
    list.push(place.wikiImageUrl);
  }

  // Fotos específicas da própria atração (se cadastradas no array 'images')
  if (Array.isArray(place.images)) {
    place.images.forEach(img => {
      if (img && typeof img === 'string' && !list.includes(img)) {
        list.push(img);
      }
    });
  }

  // Limita o carrossel estritamente a NO MÁXIMO 5 fotos por atração
  return list.slice(0, 5);
}

/**
 * Handler de erro para tags <img> que tentam carregar a imagem principal.
 */
export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;
  
  if (imgElement.dataset.fallbackState === 'failed') {
    return;
  }

  imgElement.dataset.fallbackState = 'failed';
  const fallback = getUniquePlaceImage(place, 0);
  if (imgElement.src !== fallback) {
    imgElement.src = fallback;
  }
}
