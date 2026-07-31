import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Star, Info, Heart, Navigation, ChevronLeft, ChevronRight, Sparkles, Layers, List, Grid } from 'lucide-react';
import NavButtons from './NavButtons';
import { getDistanceKm, formatDistance } from '../utils/geo';

export default function Hero({ 
  featuredPlaces, 
  userLocation, 
  onSelectPlace, 
  onOpenWebView, 
  onSelectCity, 
  isFavorite, 
  toggleFavorite, 
  onOpenPlaceAi,
  viewMode,
  setViewMode,
  maxDistanceKm,
  setMaxDistanceKm
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const [canScrollRow1, setCanScrollRow1] = useState(false);
  const [canScrollRow2, setCanScrollRow2] = useState(false);

  const checkScrollable = useCallback(() => {
    if (row1Ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = row1Ref.current;
      setCanScrollRow1(scrollWidth - clientWidth - scrollLeft > 8);
    }
    if (row2Ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = row2Ref.current;
      setCanScrollRow2(scrollWidth - clientWidth - scrollLeft > 8);
    }
  }, []);

  useEffect(() => {
    checkScrollable();
    const timer = setTimeout(checkScrollable, 200);
    const r1 = row1Ref.current;
    const r2 = row2Ref.current;
    if (r1) r1.addEventListener('scroll', checkScrollable);
    if (r2) r2.addEventListener('scroll', checkScrollable);
    window.addEventListener('resize', checkScrollable);

    return () => {
      clearTimeout(timer);
      if (r1) r1.removeEventListener('scroll', checkScrollable);
      if (r2) r2.removeEventListener('scroll', checkScrollable);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [checkScrollable]);

  const handleScrollRow = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  const currentPlace = featuredPlaces[currentIndex] || featuredPlaces[0];

  if (!currentPlace) return null;

  const handleImageError = (e) => {
    e.target.src = currentPlace.backupImage;
  };

  const distanceKm = userLocation && currentPlace.lat && currentPlace.lng
    ? getDistanceKm(userLocation.lat, userLocation.lng, currentPlace.lat, currentPlace.lng)
    : null;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredPlaces.length) % featuredPlaces.length);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredPlaces.length);
  };

  const handleSaibaMais = (e) => {
    if (e) e.stopPropagation();
    const listingUrl = currentPlace.listingUrl || currentPlace.websiteUrl || currentPlace.googleMapsUrl || `https://www.google.com/search?q=${encodeURIComponent(currentPlace.title + ' ' + currentPlace.city)}`;
    window.open(listingUrl, '_blank', 'noopener,noreferrer');
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
    <section className="hero-section" id="first-place-anchor">
      <div className="container">
        <div 
          className="hero-card"
          onClick={(e) => handleSaibaMais(e)}
          title={`Saiba mais sobre ${currentPlace.title}`}
          style={{ cursor: 'pointer' }}
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
              <span className={`hero-badge-proximo ${userLocation?.isGps ? 'active-green' : 'inactive-red'}`}>
                {userLocation?.isGps ? 'PRÓXIMO A VOCÊ' : 'NÃO DEIXE DE VER'}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCity && onSelectCity(currentPlace.city);
                }}
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

              {onOpenPlaceAi && (
                <button
                  type="button"
                  className="ia-icon-btn hero-ia-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPlaceAi(currentPlace);
                  }}
                  title="Guia TravelGPT by Gemini IA"
                >
                  <Sparkles size={18} color="var(--accent-gold)" />
                </button>
              )}

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

        {/* CONTROLES DE EXIBIÇÃO E RAIO DE BUSCA INICIAL LOGO ABAIXO DO CARROSSEL DE DESTAQUE */}
        <div className="carousel-quick-filter-bar">
          {/* 1. TIPO DE EXIBIÇÃO (LINHA 1 NO CELULAR) */}
          <div className="quick-filter-row-wrapper">
            <div className="quick-filter-pills-scroll" ref={row1Ref}>
              <button 
                type="button"
                className={`radius-pill ${viewMode === 'list' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setViewMode && setViewMode('list'); }}
                title="Modo Lista (Padrão)"
              >
                <List size={14} /> Lista
              </button>

              <button 
                type="button"
                className={`radius-pill ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setViewMode && setViewMode('grid'); }}
                title="Modo Cards em Grid"
              >
                <Grid size={14} /> Grid
              </button>

              <button 
                type="button"
                className={`radius-pill ${viewMode === 'city' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setViewMode && setViewMode('city'); }}
                title="Agrupado por Cidade"
              >
                <MapPin size={14} /> Por Cidade
              </button>

              <button 
                type="button"
                className={`radius-pill ${viewMode === 'category' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setViewMode && setViewMode('category'); }}
                title="Agrupado por Categoria"
              >
                <Layers size={14} /> Categorias
              </button>
            </div>
            {canScrollRow1 && (
              <button 
                type="button"
                className="quick-filter-scroll-arrow-btn"
                onClick={() => handleScrollRow(row1Ref)}
                title="Deslize para ver mais opções"
                aria-label="Ver mais opções"
              >
                <ChevronRight size={15} />
              </button>
            )}
          </div>

          <div className="quick-filter-divider" />

          {/* 2. RAIO DE BUSCA INICIAL (LINHA 2 NO CELULAR) */}
          <div className="quick-filter-row-wrapper">
            <div className="quick-filter-pills-scroll" ref={row2Ref}>
              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === 10 ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setMaxDistanceKm && setMaxDistanceKm(10); }}
                title="Exibir apenas locais a menos de 10 km (Opção inicial padrão)"
              >
                🎯 Até 10 km (Inicial)
              </button>

              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === 25 ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setMaxDistanceKm && setMaxDistanceKm(25); }}
                title="Exibir locais a menos de 25 km"
              >
                🚗 Até 25 km
              </button>

              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === 50 ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setMaxDistanceKm && setMaxDistanceKm(50); }}
                title="Exibir locais a menos de 50 km"
              >
                🛣️ Até 50 km
              </button>

              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === 100 ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setMaxDistanceKm && setMaxDistanceKm(100); }}
                title="Exibir locais a menos de 100 km"
              >
                🗺️ Até 100 km
              </button>

              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === null ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setMaxDistanceKm && setMaxDistanceKm(null); }}
                title="Exibir todos os locais do Estado"
              >
                🌐 Todas
              </button>
            </div>
            {canScrollRow2 && (
              <button 
                type="button"
                className="quick-filter-scroll-arrow-btn"
                onClick={() => handleScrollRow(row2Ref)}
                title="Deslize para ver mais opções"
                aria-label="Ver mais opções"
              >
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
