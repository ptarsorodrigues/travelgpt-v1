import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPlaceImages } from '../utils/mapsImageHelper';

export default function ImageCarousel({ place, altTitle, className = '', height, onClick }) {
  const images = getPlaceImages(place);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div 
      className={`image-carousel-container ${className}`} 
      onClick={onClick}
      style={height ? { height } : undefined}
    >
      <img 
        src={currentImage} 
        alt={altTitle || place?.title || 'Imagem do ponto turístico'}
        className="carousel-img"
        loading="lazy"
        onError={(e) => {
          if (place?.backupImage && e.target.src !== place.backupImage) {
            e.target.src = place.backupImage;
          }
        }}
      />

      {images.length > 1 && (
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
            {images.map((_, idx) => (
              <span 
                key={idx} 
                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={(e) => handleDotClick(e, idx)}
              />
            ))}
          </div>

          <div className="carousel-counter">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}
