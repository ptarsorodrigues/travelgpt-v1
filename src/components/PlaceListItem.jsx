import React from 'react';
import { MapPin, Heart, Navigation, Info, Sparkles, Ticket } from 'lucide-react';
import ProductTierIcon from './ProductTierIcon';
import NavButtons from './NavButtons';
import { getDistanceKm, formatDistance } from '../utils/geo';
import { getPlaceImageUrl, handlePlaceImageError } from '../utils/mapsImageHelper';
import { getPlacePriceTag } from '../utils/priceHelper';
import { getOpeningStatus } from '../utils/openingHoursHelper';

export default function PlaceListItem({ place, userLocation, onSelectPlace, onOpenWebView, onSelectCity, isFavorite, toggleFavorite, onOpenPlaceAi }) {
  const handleImageError = (e) => {
    handlePlaceImageError(e, place);
  };

  const distanceKm = userLocation && place.lat && place.lng
    ? getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  const status = getOpeningStatus(place);

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
          {/* 1. Título */}
          <h3 className="place-item-title">{place.title}</h3>

          {/* 2. Cidade */}
          <div 
            className="place-item-city interactive-city-tag-inline"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectCity) onSelectCity(place.city);
            }}
            title={`Filtrar por ${place.city}`}
            style={{ marginBottom: '6px' }}
          >
            <MapPin size={14} className="city-icon" />
            <span>{place.city}</span>
          </div>

          {/* 3. Linha de Badges 1: Nível (GOLD/DIAMOND/etc) + Distância em km */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <ProductTierIcon tier={place.tier} />
            {distanceKm !== null && (
              <div className="card-distance-badge" title="Distância estimada">
                <Navigation size={12} className="distance-icon" />
                <span>{formatDistance(distanceKm, false)}</span>
              </div>
            )}
          </div>

          {/* 4. Linha de Badges 2: Preço dos Ingressos (Dourado) + Status de Funcionamento (Verde) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <div 
              className="card-price-badge" 
              title="Preço dos Ingressos & Serviços"
              onClick={(e) => {
                if (onOpenPlaceAi) {
                  e.stopPropagation();
                  onOpenPlaceAi(place);
                }
              }}
            >
              <Ticket size={12} className="price-icon" />
              <span>{getPlacePriceTag(place)}</span>
            </div>

            <div className={`card-status-badge ${status.isOpen ? 'open' : 'closed'}`} title="Status de funcionamento hoje">
              <span>{status.isOpen ? '🟢' : '🔴'}</span>
              <span>{status.text}</span>
            </div>
          </div>

          {/* 5. Categoria */}
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

        {/* 2. Botões "Saiba Mais", Waze & Google Maps e "Favorito (Coração)" alinhados */}
        <div className="list-item-actions-row-left">
          <button 
            className="details-btn saiba-mais-framed-btn"
            onClick={handleSaibaMais}
            title={`Abrir Listing URL (${listingUrl})`}
          >
            <Info size={14} />
            <span>Saiba Mais</span>
          </button>

          {onOpenPlaceAi && (
            <button
              type="button"
              className="ia-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPlaceAi(place);
              }}
              title="Guia TravelGPT by Gemini IA"
            >
              <Sparkles size={15} color="var(--accent-gold)" />
            </button>
          )}

          <NavButtons place={place} userLocation={userLocation} />

          <button 
            className={`fav-btn-icon ${isFavorite(place.id) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(place.id);
            }}
            title={isFavorite(place.id) ? "Remover dos salvos" : "Salvar no roteiro"}
            style={{ marginLeft: 'auto' }}
          >
            <Heart size={16} fill={isFavorite(place.id) ? "#FFF" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}












