import React from 'react';
import { MapPin, Heart, Navigation, Info } from 'lucide-react';
import ProductTierIcon from './ProductTierIcon';
import { getDistanceKm, formatDistance } from '../utils/geo';
import { getPlaceImageUrl, handlePlaceImageError } from '../utils/mapsImageHelper';

export default function PlaceListItem({ place, userLocation, onSelectPlace, onOpenWebView, onSelectCity, isFavorite, toggleFavorite }) {
  const handleImageError = (e) => {
    handlePlaceImageError(e, place);
  };

  const distanceKm = userLocation && place.lat && place.lng
    ? getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  // Listing URL da página completa do ponto de interesse
  const listingUrl = place.listingUrl || place.websiteUrl || place.googleMapsUrl;

  const handleSaibaMais = (e) => {
    if (e) e.stopPropagation();
    window.open(listingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="list-item-card"
      onClick={handleSaibaMais}
      title={`Clique para abrir ${place.title}`}
    >
      {/* Bloco Superior (Lado a Lado): Coluna 1 (Imagem 105px) | Coluna 2 (Direita) */}
      <div className="list-item-top-row">
        {/* Coluna 1 (Esquerda): Imagem miniatura (105px, align-self: stretch) */}
        <div 
          className="list-item-thumb-wrapper"
          onClick={handleSaibaMais}
          title={`Clique para abrir ${place.title}`}
        >
          <img 
            src={getPlaceImageUrl(place)} 
            alt={place.title}
            className="list-item-thumb"
            onError={handleImageError}
            loading="lazy"
          />
        </div>

        {/* Coluna 2 (Direita da Imagem) */}
        <div className="list-item-right-info">
          {/* Linha 1: Título do Ponto de Interesse */}
          <h3 className="place-item-title">{place.title}</h3>

          {/* Linha 2: Badge de Nível + Cidade */}
          <div className="list-item-tier-city-row">
            <ProductTierIcon tier={place.tier} />
            <div 
              className="place-item-city interactive-city-tag-inline"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectCity) onSelectCity(place.city);
              }}
              title={`Filtrar por ${place.city}`}
            >
              <MapPin size={14} className="city-icon" />
              <span>{place.city}</span>
            </div>
          </div>

          {/* Linha 3: Distância (ex: "4.7 km", sem 'de você') */}
          {distanceKm !== null && (
            <div className="card-distance-badge" title="Distância estimada">
              <Navigation size={12} className="distance-icon" />
              <span>{formatDistance(distanceKm, false)}</span>
            </div>
          )}

          {/* Linha 4: Categoria */}
          <div className="list-item-category-wrap">
            <span className="list-item-category">{place.category}</span>
          </div>
        </div>
      </div>

      {/* Bloco Inferior apenas 1 coluna (Largura Total 100%) */}
      <div className="list-item-bottom-block">
        {/* 1. Endereço completo ocupando 100% da largura */}
        <div className="place-item-address-full" title={place.address}>
          {place.address}
        </div>

        {/* 2. Botões "Saiba Mais" e "Favorito (Coração)" alinhados no CANTO INFERIOR ESQUERDO */}
        <div className="list-item-actions-row-left">
          <button 
            className="details-btn saiba-mais-framed-btn"
            onClick={handleSaibaMais}
            title={`Abrir Listing URL (${listingUrl})`}
          >
            <Info size={14} />
            <span>Saiba Mais</span>
          </button>

          <button 
            className={`fav-btn-icon ${isFavorite(place.id) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(place.id);
            }}
            title={isFavorite(place.id) ? "Remover dos salvos" : "Salvar no roteiro"}
          >
            <Heart size={16} fill={isFavorite(place.id) ? "#FFF" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}











