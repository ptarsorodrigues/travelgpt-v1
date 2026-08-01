/**
 * Utilitário para obter a URL da imagem de um estabelecimento (Place).
 * Utiliza prioritariamente coverImage e backupImage como fallback.
 */

const CATEGORY_GALLERY_POOLS = {
  'Áreas de Lazer, Praças & Parques': [
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80'
  ],
  'Cultura, Teatros & Museus': [
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1582650625119-3a31f8418b0d?auto=format&fit=crop&w=1000&q=80'
  ],
  'Turismo Religioso & Templos': [
    'https://images.unsplash.com/photo-1548625361-1851e39a3f25?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1000&q=80'
  ],
  'Gastronomia & Vida Noturna': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80'
  ],
  'Turismo de Compras & Feiras': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80'
  ],
  'Turismo de Aventura & Natureza': [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80'
  ],
  'Turismo Histórico & Arquitetura': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80'
  ]
};

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

  // Adiciona imagens complementares da categoria para garantir um carrossel rico com 3-4 imagens distintas por atração
  const categoryPool = CATEGORY_GALLERY_POOLS[place.category] || CATEGORY_GALLERY_POOLS['Áreas de Lazer, Praças & Parques'];
  if (categoryPool) {
    categoryPool.forEach(img => {
      if (!list.includes(img) && list.length < 4) {
        list.push(img);
      }
    });
  }

  return list;
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
