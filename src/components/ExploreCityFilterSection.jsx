import React, { useState, useMemo } from 'react';
import { MapPin, Search, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getDistanceKm, fuzzyPhoneticMatch } from '../utils/geo';

const REF_LAT = -23.5505;
const REF_LNG = -46.6333;

export default function ExploreCityFilterSection({
  placesData,
  userLocation,
  setUserLocation,
  DEFAULT_LOCATION,
  selectedCities,
  setSelectedCities
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  const [citySortBy, setCitySortBy] = useState('proximity'); // 'proximity', 'count', 'name'

  const baseLat = userLocation ? userLocation.lat : REF_LAT;
  const baseLng = userLocation ? userLocation.lng : REF_LNG;

  const citiesWithStats = useMemo(() => {
    const map = {};
    placesData.forEach(p => {
      if (!map[p.city]) {
        map[p.city] = { city: p.city, count: 0, lats: [], lngs: [] };
      }
      map[p.city].count += 1;
      if (p.lat && p.lng) {
        map[p.city].lats.push(p.lat);
        map[p.city].lngs.push(p.lng);
      }
    });

    const list = Object.values(map).map(item => {
      const avgLat = item.lats.length > 0 ? item.lats.reduce((a, b) => a + b, 0) / item.lats.length : baseLat;
      const avgLng = item.lngs.length > 0 ? item.lngs.reduce((a, b) => a + b, 0) / item.lngs.length : baseLng;
      const distance = getDistanceKm(baseLat, baseLng, avgLat, avgLng);
      return {
        city: item.city,
        count: item.count,
        distance: distance
      };
    });

    return list.sort((a, b) => {
      if (citySortBy === 'proximity') {
        return a.distance - b.distance;
      } else if (citySortBy === 'count') {
        return b.count - a.count;
      } else {
        return a.city.localeCompare(b.city);
      }
    });
  }, [placesData, citySortBy, baseLat, baseLng]);

  const filteredCitiesInBox = useMemo(() => {
    if (!citySearchText.trim()) return citiesWithStats;
    return citiesWithStats.filter(c => fuzzyPhoneticMatch(c.city, citySearchText));
  }, [citiesWithStats, citySearchText]);

  const toggleCity = (cityName) => {
    // Regra do Usuário: caso faça uma seleção de uma cidade diferente, inative o GPS
    if (userLocation?.isGps) {
      setUserLocation(DEFAULT_LOCATION);
    }

    if (selectedCities.includes(cityName)) {
      const next = selectedCities.filter(c => c !== cityName);
      setSelectedCities(next);
    } else {
      setSelectedCities([...selectedCities, cityName]);
    }
  };

  const selectAllCities = () => {
    if (userLocation?.isGps) {
      setUserLocation(DEFAULT_LOCATION);
    }
    setSelectedCities([]); // vazio significa todas as cidades
  };

  const clearAllCities = () => {
    setSelectedCities([]);
  };

  return (
    <div className="explore-city-section-card container">
      {!isExpanded ? (
        <div className="personalize-toggle-wrapper">
          <button 
            type="button"
            className="btn-personalize-toggle explore-city-toggle-btn"
            onClick={() => setIsExpanded(true)}
            title="Clique para abrir e escolher as cidades desejadas"
          >
            <MapPin size={20} color="#FFFFFF" />
            <span>DESEJA EXPLORAR OUTRA CIDADE ?</span>
            <ChevronDown size={20} color="#FFFFFF" className="toggle-arrow" />
          </button>
        </div>
      ) : (
        <div className="personalize-expanded-content animate-slide-down glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div className="personalize-section-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={22} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                DESEJA EXPLORAR OUTRA CIDADE ?
              </h3>
            </div>
            <button 
              type="button"
              className="btn-retract-section"
              onClick={() => setIsExpanded(false)}
            >
              <span>Retrair</span>
              <ChevronUp size={18} />
            </button>
          </div>

          <div className="filter-box-section-block" style={{ marginTop: '1rem' }}>
            <div className="filter-box-section-header">
              <span className="section-label">📍 ESCOLHA A CIDADE DESEJADA:</span>
              <span className="section-badge-counter">
                {selectedCities.length === 0 
                  ? `Todas as ${citiesWithStats.length} cidades ativas` 
                  : `${selectedCities.length} de ${citiesWithStats.length} selecionadas`}
              </span>
            </div>

            {/* Sub-toolbar de Busca e Ordenação de Cidades */}
            <div className="city-search-sort-toolbar">
              <div className="city-search-input-wrap">
                <Search size={16} color="var(--text-dim)" />
                <input 
                  type="text"
                  placeholder="Buscar cidade pelo nome..."
                  value={citySearchText}
                  onChange={(e) => setCitySearchText(e.target.value)}
                  className="city-search-input"
                />
                {citySearchText && (
                  <button type="button" onClick={() => setCitySearchText('')} className="clear-city-search-btn">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="city-sort-buttons-wrap">
                <span className="sort-label-text">Ordenar por:</span>
                <button 
                  type="button"
                  className={`sort-pill-btn ${citySortBy === 'proximity' ? 'active' : ''}`}
                  onClick={() => setCitySortBy('proximity')}
                >
                  Proximidade
                </button>
                <button 
                  type="button"
                  className={`sort-pill-btn ${citySortBy === 'count' ? 'active' : ''}`}
                  onClick={() => setCitySortBy('count')}
                >
                  Qtd Atrações
                </button>
                <button 
                  type="button"
                  className={`sort-pill-btn ${citySortBy === 'name' ? 'active' : ''}`}
                  onClick={() => setCitySortBy('name')}
                >
                  A-Z
                </button>
              </div>
            </div>

            {/* Ações de Seleção de Cidades */}
            <div className="city-selection-actions-bar">
              <button 
                type="button"
                className={`action-chip-btn ${selectedCities.length === 0 ? 'active' : ''}`}
                onClick={selectAllCities}
              >
                <Check size={14} /> Todas as Cidades
              </button>
              {selectedCities.length > 0 && (
                <button 
                  type="button"
                  className="action-chip-btn clear"
                  onClick={clearAllCities}
                >
                  <X size={14} /> Limpar Seleção ({selectedCities.length})
                </button>
              )}
            </div>

            {/* Grid de Cidades Selecionáveis */}
            <div className="cities-checkbox-grid">
              {filteredCitiesInBox.map(c => {
                const isSelected = selectedCities.includes(c.city);
                return (
                  <button
                    key={c.city}
                    type="button"
                    className={`city-item-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCity(c.city)}
                  >
                    <div className="city-chip-checkbox">
                      {isSelected && <Check size={12} color="#FFF" />}
                    </div>
                    <span className="city-chip-name">{c.city}</span>
                    <span className="city-chip-badge">{c.count}</span>
                    {c.distance < 999 && (
                      <span className="city-chip-dist">{c.distance}km</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
