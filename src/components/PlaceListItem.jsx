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
      {/* ========================================================
          DESKTOP VIEW (Visível apenas na versão Desktop >= 769px)
          Formato idêntico à imagem de referência
          ======================================================== */}
      <div className="list-item-desktop-view">
        {/* 1. Imagem Miniatura (Esquerda) */}
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

        {/* 2. Coluna Central (Título, Cidade, Badges em 1 linha, Botões de Ação) */}
        <div className="list-item-center-info">
          {/* Título */}
          <h3 className="place-item-title">{place.title}</h3>

          {/* Cidade com ícone MapPin */}
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

          {/* Linha Única de Badges: Nível (GOLD/etc) + Distância (km) + Ingressos/Preço + Status */}
          <div className="list-item-badges-row-desktop">
            <ProductTierIcon tier={place.tier} />
            
            {distanceKm !== null && (
              <div className="card-distance-badge" title="Distância estimada">
                <Navigation size={12} className="distance-icon" />
                <span>{formatDistance(distanceKm, false)}</span>
              </div>
            )}

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

          {/* Linha de Ações: Saiba Mais + IA + Waze + Google Maps + Favorito (Coração) + Divisor */}
          <div className="list-item-actions-row-desktop">
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
            >
              <Heart size={16} fill={isFavorite(place.id) ? "#FFF" : "none"} />
            </button>

            <div className="desktop-card-divider" />
          </div>
        </div>

        {/* 3. Coluna Direita (Categoria no Topo + Endereço Completo na Base) */}
        <div className="list-item-right-section">
          <div className="list-item-category-wrap">
            <span className="list-item-category">{place.category}</span>
          </div>

          <div className="place-item-address-full" title={place.address}>
            {place.address}
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE VIEW (Visível apenas na versão Mobile <= 768px)
          ======================================================== */}
      <div className="list-item-mobile-view">
        <div className="list-item-top-row">
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

          <div className="list-item-right-info">
            <h3 className="place-item-title">{place.title}</h3>

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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <ProductTierIcon tier={place.tier} />
              {distanceKm !== null && (
                <div className="card-distance-badge" title="Distância estimada">
                  <Navigation size={12} className="distance-icon" />
                  <span>{formatDistance(distanceKm, false)}</span>
                </div>
              )}
            </div>

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

            <div className="list-item-category-wrap">
              <span className="list-item-category">{place.category}</span>
            </div>
          </div>
        </div>

        <div className="list-item-bottom-block">
          <div className="place-item-address-full" title={place.address}>
            {place.address}
          </div>

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
    </div>
  );
}












