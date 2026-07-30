import React from 'react';
import { handleOpenWaze, handleOpenGoogleMaps } from '../utils/navigation';

export default function NavButtons({ place, userLocation, className = '' }) {
  if (!place) return null;

  return (
    <div className={`nav-buttons-group ${className}`}>
      <button 
        type="button"
        className="nav-app-btn"
        onClick={(e) => handleOpenWaze(e, place, userLocation)}
        title="Navegar com Waze (origem ao destino)"
        aria-label="Navegar com Waze"
      >
        <img src="/waze-icon.png" alt="Waze" className="nav-app-icon" />
      </button>
      <button 
        type="button"
        className="nav-app-btn"
        onClick={(e) => handleOpenGoogleMaps(e, place, userLocation)}
        title="Navegar com Google Maps (origem ao destino)"
        aria-label="Navegar com Google Maps"
      >
        <img src="/googlemaps-icon.png" alt="Google Maps" className="nav-app-icon" />
      </button>
    </div>
  );
}
