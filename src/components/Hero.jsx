import React, { useState } from 'react';
import { MapPin, Star, Info, Heart, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import NavButtons from './NavButtons';
import { getDistanceKm, formatDistance } from '../utils/geo';

export default function Hero({ featuredPlaces, userLocation, onSelectPlace, onOpenWebView, onSelectCity, isFavorite, toggleFavorite }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const currentPlace = featuredPlaces[currentIndex] || featuredPlaces[0];

  if (!currentPlace) return null;

  const handleImageError = (e) => {
    e.target.src = currentPlace.backupImage;
  };

  const distanceKm = userLocation && currentPlace.lat && currentPlace.lng
    ? getDistanceKm(userLocation.lat, userLocation.lng, currentPlace.lat, currentPlace.lng)
    : null;

  const listingUrl = currentPlace.listingUrl || currentPlace.websiteUrl || currentPlace.googleMapsUrl || `https://www.google.com/search?q=${encodeURIComponent(currentPlace.title + ' ' + currentPlace.city)}`;

  const handleSaibaMais = (e) => {
    if (e) e.stopPropagation();
    window.open(listingUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredPlaces.length) % featuredPlaces.length);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredPlaces.length);
  };

  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div 
          className="hero-featured-card"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            src={currentPlace.coverImage} 
            alt={currentPlace.title}
            className="hero-bg-img"
            onError={handleImageError}
          />
          <div className="hero-overlay"></div>

          {featuredPlaces.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="hero-nav-arrow left"
                aria-label="Atração anterior"
                title="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNext}
                className="hero-nav-arrow right"
                aria-label="Próxima atração"
                title="Próxima"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="hero-content">
            <div className="hero-top-badges">
              <span className="hero-badge-proximo">
                PRÓXIMO A VOCÊ
              </span>

              {distanceKm !== null && (
                <div className="badge-distance-hero">
                  <Navigation size={14} color="#FFFFFF" />
                  <span>a <strong>{formatDistance(distanceKm, false)}</strong></span>
                </div>
              )}
            </div>

            <h1 className="hero-title">{currentPlace.title}</h1>
            
            <div className="hero-meta">
              <div 
                className="hero-meta-item interactive-city-tag-hero"
                onClick={() => onSelectCity && onSelectCity(currentPlace.city)}
                title={`Filtrar apenas atrações de ${currentPlace.city}`}
              >
                <MapPin size={16} color="#FFFFFF" />
                <span>{currentPlace.city}</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-category-white-badge">
                  {currentPlace.category}
                </span>
              </div>
            </div>

            <p className="hero-description">{currentPlace.description}</p>

            <div className="hero-actions">
              <button 
                onClick={handleSaibaMais}
                className="btn-primary saiba-mais-btn"
                title="Saiba mais (abrir em página externa)"
              >
                <Info size={18} />
                <span>Saiba mais</span>
              </button>

              <NavButtons place={currentPlace} userLocation={userLocation} />

              <button 
                className={`fav-btn-icon ${isFavorite(currentPlace.id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentPlace.id);
                }}
                title={isFavorite(currentPlace.id) ? "Remover dos salvos" : "Salvar no roteiro"}
                style={{ marginLeft: 'auto' }}
              >
                <Heart size={18} fill={isFavorite(currentPlace.id) ? "#FFF" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
