import React from 'react';
import { X, MapPin, ExternalLink, Phone, Mail, Heart, Star, Compass, Navigation } from 'lucide-react';
import ProductTierIcon from './ProductTierIcon';
import NavButtons from './NavButtons';
import { getDistanceKm, formatDistance } from '../utils/geo';

export default function PlaceModal({ place, userLocation, onClose, onOpenWebView, onSelectCity, isFavorite, toggleFavorite }) {
  if (!place) return null;

  const handleImageError = (e) => {
    e.target.src = place.backupImage;
  };

  const distanceKm = userLocation && place.lat && place.lng
    ? getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Fechar">
          <X size={20} />
        </button>

        <div className="modal-hero-img-wrap">
          <img 
            src={place.coverImage} 
            alt={place.title}
            className="modal-hero-img"
            onError={handleImageError}
          />
          <div className="hero-overlay"></div>
          
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '2rem', right: '2rem', zIndex: 2 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge-featured" style={{ margin: 0 }}>
                {place.category}
              </span>
              {distanceKm !== null && (
                <span className="badge-distance-hero" style={{ margin: 0 }}>
                  <Navigation size={13} color="var(--primary)" /> {formatDistance(distanceKm)}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <ProductTierIcon tier={place.tier} />
              <h2 className="modal-title" style={{ margin: 0 }}>{place.title}</h2>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {place.description}
          </p>

          <div className="modal-info-grid">
            <div 
              className="modal-info-item interactive-modal-city"
              onClick={() => {
                if (onSelectCity) onSelectCity(place.city);
                onClose();
              }}
              title={`Filtrar todas as atrações em ${place.city}`}
            >
              <MapPin size={18} color="var(--primary)" />
              <div>
                <small style={{ color: 'var(--text-dim)', display: 'block' }}>Cidade / Região (Clique p/ filtrar)</small>
                <strong style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{place.city}</strong>
              </div>
            </div>

            <div className="modal-info-item">
              <Compass size={18} color="var(--primary)" />
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
                if (onOpenWebView) onOpenWebView(place);
              }}
              className="btn-primary"
              title="Abrir informação completa em janela dentro do app"
            >
              <ExternalLink size={18} />
              <span>Ver Informação Completa (No App)</span>
            </button>

            <NavButtons place={place} userLocation={userLocation} iconSize={18} />

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
              onClick={() => toggleFavorite(place.id)}
              className="btn-secondary"
              style={{ background: isFavorite(place.id) ? 'rgba(239, 68, 68, 0.25)' : undefined }}
            >
              <Heart size={18} fill={isFavorite(place.id) ? "#EF4444" : "none"} color={isFavorite(place.id) ? "#EF4444" : "currentColor"} />
              <span>{isFavorite(place.id) ? 'Salvo no Roteiro' : 'Salvar no Roteiro'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

