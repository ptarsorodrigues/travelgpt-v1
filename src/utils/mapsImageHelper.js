/**
 * Utilitário para formatar e obter URLs de imagens reais e autênticas de um estabelecimento (Place).
 * Trata URLs do Google Drive transformando-as em thumbnails públicos funcionais (https://drive.google.com/thumbnail?id=...&sz=w1000).
 * NENHUMA imagem genérica ou inventada é adicionada.
 */

export function formatPlaceImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Formata links do Google Drive para a API oficial de thumbnails públicos do Google
  if (trimmed.includes('googleusercontent.com/d/') || trimmed.includes('drive.google.com/file/d/')) {
    const match = trimmed.match(/\/(?:d|file\/d)\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }
  if (trimmed.includes('drive.google.com/open?id=') || trimmed.includes('drive.google.com/uc?id=')) {
    const match = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }
  return trimmed;
}

export function getPlaceImageUrl(place) {
  if (!place) return '';
  const formattedCover = formatPlaceImageUrl(place.coverImage);
  if (formattedCover) return formattedCover;

  const formattedBackup = formatPlaceImageUrl(place.backupImage);
  if (formattedBackup) return formattedBackup;

  return '';
}

/**
 * Retorna ESTRITAMENTE as imagens autênticas pertencentes a esta atração específica.
 * Não inventa fotos, não adiciona imagens genéricas de categoria e limita ao máximo de 5 fotos.
 */
export function getPlaceImages(place) {
  if (!place) return [];
  const list = [];

  // 1. Foto principal da atração
  const mainImg = formatPlaceImageUrl(place.coverImage);
  if (mainImg) {
    list.push(mainImg);
  }

  // 2. Foto secundária da própria atração (se for diferente da principal)
  const backupImg = formatPlaceImageUrl(place.backupImage);
  if (backupImg && !list.includes(backupImg)) {
    list.push(backupImg);
  }

  // 3. Foto oficial extraída do Wikipedia/Wikivoyage para este local específico
  const wikiImg = formatPlaceImageUrl(place.wikiImageUrl);
  if (wikiImg && !list.includes(wikiImg)) {
    list.push(wikiImg);
  }

  // 4. Galeria de fotos específica cadastrada no próprio objeto da atração (se houver)
  if (Array.isArray(place.images)) {
    place.images.forEach(img => {
      const formatted = formatPlaceImageUrl(img);
      if (formatted && !list.includes(formatted)) {
        list.push(formatted);
      }
    });
  }

  // Limita estritamente ao máximo de 5 fotos autênticas por atração
  return list.slice(0, 5);
}

/**
 * Handler de erro para tags <img>.
 * Se a capa falhar, tenta o backupImage autêntico da própria atração.
 */
export function handlePlaceImageError(event, place) {
  if (!place) return;
  const imgElement = event.target;
  
  if (imgElement.dataset.fallbackState === 'failed') {
    return;
  }

  imgElement.dataset.fallbackState = 'failed';
  const backup = formatPlaceImageUrl(place.backupImage);
  if (backup && imgElement.src !== backup) {
    imgElement.src = backup;
  }
}
