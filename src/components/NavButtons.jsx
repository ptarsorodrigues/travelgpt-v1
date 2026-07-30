import React from 'react';
import { handleOpenWaze, handleOpenGoogleMaps } from '../utils/navigation';

export default function NavButtons({ place, userLocation, iconSize = 14, className = '' }) {
  if (!place) return null;

  const onWazeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    handleOpenWaze(e, place, userLocation);
  };

  const onGmapsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    handleOpenGoogleMaps(e, place, userLocation);
  };

  return (
    <div 
      className={`nav-buttons-group ${className}`} 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button 
        type="button"
        className="nav-app-btn"
        onClick={onWazeClick}
        title="Navegar via Waze (origem ao destino)"
        aria-label="Navegar via Waze"
      >
        <img 
          src="/waze-icon.png" 
          alt="Waze" 
          className="nav-app-icon" 
          style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
        />
      </button>
      <button 
        type="button"
        className="nav-app-btn"
        onClick={onGmapsClick}
        title="Navegar via Google Maps (origem ao destino)"
        aria-label="Navegar via Google Maps"
      >
        <img 
          src="/googlemaps-icon.png" 
          alt="Google Maps" 
          className="nav-app-icon" 
          style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
        />
      </button>
    </div>
  );
}
