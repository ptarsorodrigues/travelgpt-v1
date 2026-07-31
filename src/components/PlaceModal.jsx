import React from 'react';
import { X, MapPin, ExternalLink, Phone, Mail, Heart, Star, Compass, Navigation, Sparkles } from 'lucide-react';
import ProductTierIcon from './ProductTierIcon';
import NavButtons from './NavButtons';
import { getDistanceKm, formatDistance } from '../utils/geo';

export default function PlaceModal({ place, userLocation, onClose, onOpenWebView, onSelectCity, isFavorite, toggleFavorite, onOpenPlaceAi }) {
  if (!place) return null;

  const handleImageError = (e) => {
    e.target.src = place.backupImage;
  };

  const distanceKm = userLocation && place.lat && place.lng
    ? getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Fechar">
          <X size={20} />
        </button>

        {/* Modal Header / Banner Image */}
        <div className="modal-hero-img-wrap">
          <img 
            src={place.coverImage} 
            alt={place.title}
            className="modal-hero-img"
            onError={handleImageError}
          />
          <div className="modal-hero-overlay" />
          
          {/* Tier Badge Overlay */}
          {place.tier && (
            <div className="tier-badge-overlay top-left" style={{ top: '1.25rem', left: '1.25rem' }}>
              <ProductTierIcon tier={place.tier} isFeatured={place.isFeatured} />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <h2 className="modal-title">{place.title}</h2>

          <div className="modal-meta-row">
            <div 
              className="interactive-city-tag"
              onClick={() => {
                onClose();
                if (onSelectCity) onSelectCity(place.city);
              }}
              title={`Filtrar apenas atrações de ${place.city}`}
            >
              <MapPin size={16} />
              <span>{place.city}</span>
            </div>

            <span className="list-item-category">{place.category}</span>

            {distanceKm !== null && (
              <span className="card-distance-badge" title="Distância estimada até sua localização">
                <Navigation size={12} className="distance-icon" />
                <span>{formatDistance(distanceKm)}</span>
              </span>
            )}
          </div>

          <p className="modal-description">{place.description}</p>

          <div className="modal-info-grid">
            <div className="modal-info-item">
              <MapPin size={18} color="var(--primary)" />
              <div>
                <small style={{ color: 'var(--text-dim)', display: 'block' }}>Endereço Completo</small>
                <strong>{place.address}</strong>
              </div>
            </div>

            <div className="modal-info-item">
              <Star size={18} color="var(--accent-gold)" />
              <div>
                <small style={{ color: 'var(--text-dim)', display: 'block' }}>Avaliação Geral</small>
                <strong>{place.rating} / 5.0 ★</strong>
              </div>
            </div>

            <div className="modal-info-item">
              <Navigation size={18} color="var(--accent-blue)" />
              <div>
                <small style={{ color: 'var(--text-dim)', display: 'block' }}>Distância da Sua Posição</small>
                <strong>{distanceKm !== null ? formatDistance(distanceKm) : 'Calculando GPS...'}</strong>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              onClick={() => {
                const listingUrl = place.listingUrl || place.websiteUrl || place.googleMapsUrl || `https://www.google.com/search?q=${encodeURIComponent(place.title + ' ' + place.city)}`;
                window.open(listingUrl, '_blank', 'noopener,noreferrer');
              }}
              className="btn-primary"
              title="Abrir informação completa em nova aba"
            >
              <ExternalLink size={18} />
              <span>Ver Informação Completa ↗</span>
            </button>

            {onOpenPlaceAi && (
              <button
                type="button"
                className="ia-icon-btn hero-ia-btn"
                onClick={() => {
                  onClose();
                  onOpenPlaceAi(place);
                }}
                title="Guia TravelGPT by Gemini IA"
              >
                <Sparkles size={18} color="var(--accent-gold)" />
              </button>
            )}

            <NavButtons place={place} userLocation={userLocation} />

            {place.phone && (
              <a 
                href={`tel:${place.phone}`}
                className="btn-secondary"
              >
                <Phone size={18} color="var(--primary)" />
                <span>Ligar ({place.phone})</span>
              </a>
            )}

            <button 
              className={`fav-btn-icon ${isFavorite(place.id) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(place.id);
              }}
              title={isFavorite(place.id) ? "Remover dos salvos" : "Salvar no roteiro"}
              style={{ marginLeft: 'auto' }}
            >
              <Heart size={18} fill={isFavorite(place.id) ? "#FFF" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
