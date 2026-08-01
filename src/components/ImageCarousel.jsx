import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPlaceImages } from '../utils/mapsImageHelper';

export default function ImageCarousel({ place, altTitle, className = '', height, onClick }) {
  const rawImages = getPlaceImages(place);
  const [failedImages, setFailedImages] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  // Filtra imagens que falharam no carregamento (ex: links do Drive bloqueados)
  const validImages = rawImages.filter(img => !failedImages.has(img));
  const activeList = validImages.length > 0 ? validImages : [rawImages[0] || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1000&q=80'];

  const safeIndex = currentIndex % activeList.length;
  const currentImage = activeList[safeIndex];

  const handlePrev = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === 0 ? activeList.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === activeList.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleImageError = (imgUrl) => {
    setFailedImages((prev) => {
      const updated = new Set(prev);
      updated.add(imgUrl);
      return updated;
    });
  };

  // Suporte a Gesto de Deslizar (Swipe) no Celular / Touch
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 35) {
      handleNext();
    } else if (diff < -35) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div 
      className={`image-carousel-container ${className}`} 
      onClick={onClick}
      style={height ? { height } : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img 
        src={currentImage} 
        alt={altTitle || place?.title || 'Imagem do ponto turístico'}
        className="carousel-img"
        loading="lazy"
        onError={() => handleImageError(currentImage)}
      />

      {activeList.length > 1 && (
        <>
          <button 
            type="button" 
            className="carousel-arrow carousel-arrow-left" 
            onClick={handlePrev} 
            title="Foto anterior"
          >
            <ChevronLeft size={16} color="#FFF" />
          </button>

          <button 
            type="button" 
            className="carousel-arrow carousel-arrow-right" 
            onClick={handleNext} 
            title="Próxima foto"
          >
            <ChevronRight size={16} color="#FFF" />
          </button>

          <div className="carousel-dots">
            {activeList.map((_, idx) => (
              <span 
                key={idx} 
                className={`carousel-dot ${idx === safeIndex ? 'active' : ''}`}
                onClick={(e) => handleDotClick(e, idx)}
              />
            ))}
          </div>

          <div className="carousel-counter">
            {safeIndex + 1}/{activeList.length}
          </div>
        </>
      )}
    </div>
  );
}
