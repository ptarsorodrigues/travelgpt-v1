import React, { useState } from 'react';
import { X, ExternalLink, MapPin, Globe, ArrowLeft, RefreshCw, ShieldCheck, Navigation } from 'lucide-react';
import { getDistanceKm, formatDistance } from '../utils/geo';

export default function InAppWebViewer({ place, userLocation, onClose }) {
  if (!place) return null;

  // Compute distance if available
  const distanceKm = userLocation && place.lat && place.lng
    ? getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
    : null;

  // 100% Embeddable Google Maps URL
  const embedMapUrl = place.lat && place.lng 
    ? `https://maps.google.com/maps?q=${place.lat},${place.lng}&z=16&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(place.title + ', ' + place.city + ' ' + place.address)}&output=embed`;

  // Exact Listing URL from dataset
  const rawListingUrl = place.listingUrl || place.websiteUrl || place.googleMapsUrl || `https://www.google.com/search?q=${encodeURIComponent((place.title || '') + ' ' + (place.city || ''))}`;
  const isGoogleMaps = rawListingUrl ? rawListingUrl.includes('google.com/maps') : false;
  const listingSrc = isGoogleMaps ? embedMapUrl : rawListingUrl;

  const [activeTab, setActiveTab] = useState('listing'); // 'listing' (Listing URL), 'map' (Mapa Incorporado)
  const [iframeLoading, setIframeLoading] = useState(true);

  const handleOpenDirectUrl = () => {
    window.open(rawListingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="in-app-web-overlay" onClick={onClose}>
      <div className="in-app-web-container glass-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* TOP BAR WITH PROMINENT [ X ] CLOSE BUTTON */}
        <div className="in-app-web-header">
          <div className="in-app-header-left">
            <button className="in-app-back-btn" onClick={onClose} title="Fechar página e voltar ao TravelGPT">
              <ArrowLeft size={18} />
              <span>Voltar ao App</span>
            </button>

            <div className="in-app-title-info">
              <h4>{place.title}</h4>
              <p>
                <MapPin size={12} color="var(--primary)" /> {place.city}
                {distanceKm !== null && (
                  <span style={{ marginLeft: '6px', color: 'var(--accent-gold)' }}>
                    • <Navigation size={10} color="var(--accent-gold)" style={{ display: 'inline' }} /> a {formatDistance(distanceKm)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="in-app-view-tabs">
            <button 
              className={`in-app-tab ${activeTab === 'listing' ? 'active' : ''}`}
              onClick={() => { setActiveTab('listing'); setIframeLoading(true); }}
              title="Ver Listing URL"
            >
              <Globe size={14} /> Listing URL
            </button>

            <button 
              className={`in-app-tab ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => { setActiveTab('map'); setIframeLoading(true); }}
              title="Ver Mapa Incorporado"
            >
              <MapPin size={14} /> Mapa Incorporado
            </button>
          </div>

          {/* RIGHT ACTIONS: OPEN URL & PROMINENT [ X ] CLOSE BUTTON */}
          <div className="in-app-header-right">
            <button 
              onClick={handleOpenDirectUrl}
              className="in-app-back-btn"
              style={{ background: 'rgba(0, 212, 178, 0.15)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
              title="Abrir URL completa no navegador"
            >
              <ExternalLink size={14} />
              <span className="hide-mobile">Abrir no Maps ↗</span>
            </button>

            <button 
              className="in-app-prominent-close-btn" 
              onClick={onClose} 
              title="Fechar janela e retornar ao aplicativo"
            >
              <X size={20} />
              <span>FECHAR X</span>
            </button>
          </div>
        </div>

        {/* URL SUB-HEADER BAR */}
        <div className="in-app-url-subheader">
          <Globe size={14} color="var(--primary)" />
          <span className="url-label">Listing URL:</span>
          <span className="url-value-link" onClick={handleOpenDirectUrl} style={{ cursor: 'pointer' }}>
            {rawListingUrl}
          </span>
          <button onClick={handleOpenDirectUrl} className="open-ext-btn-sm" style={{ border: 'none', cursor: 'pointer' }}>
            Abrir URL Completa ↗
          </button>
        </div>

        {/* BODY AREA */}
        <div className="in-app-web-body">
          {activeTab === 'listing' ? (
            <div className="in-app-iframe-wrapper">
              {iframeLoading && (
                <div className="in-app-loading-state">
                  <RefreshCw size={24} className="animate-spin" color="var(--primary)" />
                  <span>Carregando página de <strong>{place.title}</strong>...</span>
                </div>
              )}
              <iframe 
                src={listingSrc} 
                title={`Listing URL de ${place.title}`}
                className="in-app-iframe"
                onLoad={() => setIframeLoading(false)}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
              />
            </div>
          ) : (
            <div className="in-app-iframe-wrapper">
              {iframeLoading && (
                <div className="in-app-loading-state">
                  <RefreshCw size={24} className="animate-spin" color="var(--primary)" />
                  <span>Carregando mapa incorporado de <strong>{place.title}</strong>...</span>
                </div>
              )}
              <iframe 
                src={embedMapUrl} 
                title={`Mapa de ${place.title}`}
                className="in-app-iframe"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
