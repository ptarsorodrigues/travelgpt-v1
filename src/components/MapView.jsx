import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getDistanceKm, formatDistance } from '../utils/geo';

export default function MapView({ places, userLocation, onSelectPlace, onSelectCity }) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet Map centered on São Paulo State or User Location
    if (!leafletInstance.current) {
      const initialLat = userLocation ? userLocation.lat : -22.5;
      const initialLng = userLocation ? userLocation.lng : -47.5;
      leafletInstance.current = L.map(mapRef.current).setView([initialLat, initialLng], userLocation ? 9 : 7);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(leafletInstance.current);
    }

    const map = leafletInstance.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds = [];

    // Add User's GPS Location Marker if available
    if (userLocation && userLocation.lat && userLocation.lng) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="
          width: 38px; 
          height: 38px; 
          background: #10B981; 
          border: 3px solid #FFF; 
          border-radius: 50%; 
          box-shadow: 0 4px 15px rgba(16,185,129,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          font-weight: bold;
          font-size: 16px;
          animation: pulse 2s infinite;
        ">🚶‍♂️</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      userMarker.bindPopup(`<strong>📍 Sua Localização Atual</strong><br/><small>${userLocation.isGps ? 'Obtida via GPS' : 'São Paulo Capital'}</small>`);
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    // Create custom pin markers for POIs
    places.forEach((place) => {
      if (place.lat && place.lng) {
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="
            width: 32px; 
            height: 32px; 
            background: linear-gradient(135deg, #00D4B2, #0088FF); 
            border: 2px solid #FFF; 
            border-radius: 50%; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: bold;
            font-size: 14px;
          ">📍</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

        const distKm = userLocation && place.lat && place.lng
          ? getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
          : null;

        const popupContent = document.createElement('div');
        popupContent.style.maxWidth = '220px';
        popupContent.style.fontFamily = 'Inter, sans-serif';
        popupContent.innerHTML = `
          <img src="${place.coverImage}" alt="${place.title}" style="width:100%; height:120px; object-fit:cover; border-radius:8px; margin-bottom:8px;" onerror="this.src='${place.backupImage}'"/>
          <h4 style="margin:0 0 4px 0; font-size:14px; color:#0F172A;">${place.title}</h4>
          <p style="margin:0 0 4px 0; font-size:12px; color:#0088FF; font-weight:600; cursor:pointer;" id="city-btn-${place.id}">📍 ${place.city}</p>
          ${distKm !== null ? `<p style="margin:0 0 8px 0; font-size:11px; color:#10B981; font-weight:700;">🚗 a ${formatDistance(distKm)}</p>` : ''}
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <a href="${place.googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px; color:#00D4B2; font-weight:600; text-decoration:none;">Google Maps ↗</a>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`city-btn-${place.id}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectCity) onSelectCity(place.city);
            };
          }
        });

        bounds.push([place.lat, place.lng]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [places]);

  return (
    <div className="map-view-container">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
