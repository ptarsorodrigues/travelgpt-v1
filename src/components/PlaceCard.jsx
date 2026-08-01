import React from 'react';
import { MapPin, Heart, Phone, Mail, Star, Navigation, Info, Sparkles, Ticket } from 'lucide-react';
import ProductTierIcon from './ProductTierIcon';
import NavButtons from './NavButtons';
import { getDistanceKm, formatDistance } from '../utils/geo';
import { getPlaceImageUrl, handlePlaceImageError } from '../utils/mapsImageHelper';

export default function PlaceCard({ place, userLocation, onSelectPlace, onOpenWebView, onSelectCity, isFavorite, toggleFavorite, onOpenPlaceAi }) {
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
    <div className="place-card" onClick={handleSaibaMais} style={{ cursor: 'pointer' }}>
      <div className="place-card-img-wrap" onClick={handleSaibaMais}>
        <img 
          src={getPlaceImageUrl(place)} 
          alt={place.title}
          className="place-card-img"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="place-badge-category">
          {place.category.split('&')[0]}
        </div>

        <div className={`place-badge-tier tier-${place.tier}`} title={`Plano ${place.tier ? place.tier.toUpperCase() : 'BRONZE'}`}>
          {place.tier === 'diamond' ? 'D' : place.tier === 'gold' ? 'G' : place.tier === 'silver' ? 'S' : 'B'}
        </div>
      </div>

      <div className="place-card-body">
        {/* 1. Ícone do Nível do Produto + Nome do Ponto de Interesse */}
        <div className="place-card-header-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <ProductTierIcon tier={place.tier} />
          <h3 className="place-card-title" style={{ margin: 0 }}>{place.title}</h3>
        </div>

        {/* 3. Cidade logo abaixo do nível */}
        <div 
          className="place-card-city interactive-city-tag"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectCity) onSelectCity(place.city);
          }}
          title={`Filtrar apenas atrações em ${place.city}`}
          style={{ marginBottom: '4px' }}
        >
          <MapPin size={14} />
          <span>{place.city}</span>
        </div>

        {/* 3. Endereço abaixo da cidade */}
        <div className="place-item-address" style={{ marginBottom: '8px' }}>
          {place.address}
        </div>

        {/* 4. Classificação, Distância e Ingressos/Serviços */}
        <div className="place-item-meta-row" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className="list-item-category">{place.category}</span>

          {distanceKm !== null && (
            <span className="card-distance-badge" title="Distância estimada até sua localização">
              <Navigation size={12} className="distance-icon" />
              <span>{formatDistance(distanceKm)}</span>
            </span>
          )}

          <span 
            className="card-price-badge" 
            title="Preço dos Ingressos & Serviços (Clique para ver no Guia IA)"
            onClick={(e) => {
              if (onOpenPlaceAi) {
                e.stopPropagation();
                onOpenPlaceAi(place);
              }
            }}
          >
            <Ticket size={12} className="price-icon" />
            <span>{place.ticketInfo || place.price || 'Ingressos no Guia IA ✨'}</span>
          </span>
        </div>

        {/* 5. Ações (Saiba Mais + IA + Waze + Google Maps no lado esquerdo, Coração no final do lado direito) */}
        <div className="place-card-footer">
          <button 
            className="details-btn saiba-mais-btn"
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

