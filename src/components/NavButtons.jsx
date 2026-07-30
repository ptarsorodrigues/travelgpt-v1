import React from 'react';
import { handleOpenWaze, handleOpenGoogleMaps } from '../utils/navigation';

export default function NavButtons({ place, userLocation, className = '' }) {
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
      <img 
        src="/waze-icon.png" 
        alt="Navegar via Waze" 
        title="Navegar via Waze (origem ao destino)"
        className="nav-icon-img nav-waze-img" 
        onClick={onWazeClick}
      />
      <img 
        src="/googlemaps-icon.png" 
        alt="Navegar via Google Maps" 
        title="Navegar via Google Maps (origem ao destino)"
        className="nav-icon-img nav-gmaps-img" 
        onClick={onGmapsClick}
      />
    </div>
  );
}
