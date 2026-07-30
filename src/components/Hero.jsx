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
    setCurrentIndex((prev) => (prev === 0 ? featuredPlaces.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === featuredPlaces.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <section 
      className="hero"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image Carousel with Fade Transition */}
      {featuredPlaces.map((place, index) => (
        <div 
          key={place.id || index}
          className={`hero-bg ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${place.coverImage})` }}
        />
      ))}

      <div className="hero-overlay"></div>
      
      {/* Container Principal */}
      <div className="hero-content container">

        {/* Setas Laterais de Navegação (Desktop & Mobile Touch) */}
        {featuredPlaces.length > 1 && (
          <>
            <button 
              className="hero-arrow hero-arrow-left"
              onClick={handlePrev}
              title="Anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="hero-arrow hero-arrow-right"
              onClick={handleNext}
              title="Próximo"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Card do Hero */}
        <div className="hero-card glass-panel">
          <div className="hero-card-img-wrap">
            <img 
              src={currentPlace.coverImage} 
              alt={currentPlace.title}
              className="hero-card-img"
              onError={handleImageError}
            />
            <div className="badge-featured-gold">Destaque da Região</div>
          </div>

          <div className="hero-card-info">
            {/* Dots Indicadores do Carrossel */}
            {featuredPlaces.length > 1 && (
              <div className="hero-dots">
                {featuredPlaces.map((_, index) => (
                  <span 
                    key={index}
                    className={`hero-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                  />
                ))}
              </div>
            )}

            <div className="hero-badge-row">
              <span className="badge-featured">
                <Star size={12} fill="currentColor" /> {currentPlace.rating} ★
              </span>
              {distanceKm !== null && (
                <span className="badge-distance-hero">
                  <Navigation size={13} color="var(--primary)" /> {formatDistance(distanceKm)}
                </span>
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

              <NavButtons place={currentPlace} userLocation={userLocation} iconSize={18} />

              <button 
                onClick={() => toggleFavorite(currentPlace.id)}
                className="btn-secondary"
                style={{ background: isFavorite(currentPlace.id) ? 'rgba(239, 68, 68, 0.25)' : undefined, borderColor: isFavorite(currentPlace.id) ? '#EF4444' : undefined }}
              >
                <Heart size={18} fill={isFavorite(currentPlace.id) ? '#EF4444' : 'none'} color={isFavorite(currentPlace.id) ? '#EF4444' : '#FFF'} />
                <span>{isFavorite(currentPlace.id) ? 'Salvo no Roteiro' : 'Salvar no Roteiro'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
