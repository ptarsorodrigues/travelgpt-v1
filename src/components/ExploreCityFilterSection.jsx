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
  const [isCityBoxOpen, setIsCityBoxOpen] = useState(true); // padrão aberto para fácil acesso ao expandir
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

  const isAllCitiesSelected = selectedCities.length === 0;

  const handleIniciarPesquisa = () => {
    setIsExpanded(false); // Retrai a seção (mesmo efeito do botão RETRAIR)
    setTimeout(() => {
      const element = document.getElementById('first-place-anchor') || document.getElementById('search-results-anchor');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 320, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {!isExpanded ? (
        <div className="personalize-toggle-wrapper container" style={{ marginTop: '0.6rem', marginBottom: '0.8rem' }}>
          <button 
            type="button"
            className="explore-city-toggle-btn"
            onClick={() => setIsExpanded(true)}
            title="Clique para abrir e escolher a cidade desejada"
          >
            <MapPin size={22} color="#FFFFFF" />
            <span>EXPLORAR OUTRA CIDADE?</span>
            <ChevronDown size={22} color="#FFFFFF" className="toggle-arrow" />
          </button>
        </div>
      ) : (
        <section className="container filter-system-card expanded-card glass-panel" style={{ marginTop: '0.6rem', marginBottom: '1.25rem' }}>
          <div className="personalize-expanded-content animate-slide-down">
            {/* Título da Seção + Botão Retrair */}
            <div className="personalize-section-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="personalize-section-title">
                <MapPin size={20} color="var(--primary)" />
                <span>EXPLORAR OUTRA CIDADE?</span>
              </h2>
              <button 
                type="button"
                className="mini-clear-btn" 
                onClick={() => setIsExpanded(false)}
                title="Retrair painel"
                style={{ fontSize: '0.85rem' }}
              >
                ▲ Retrair
              </button>
            </div>

            {/* ESCOLHA A CIDADE DESEJADA - REPLICA EXATA DO PERSONALIZE O SEU TRAVELGPT */}
            <div className="filter-box-section-block" style={{ marginTop: '0.75rem' }}>
              <div className="filter-box-section-header">
                <span className="radius-label align-left-label">
                  <MapPin size={14} color="var(--primary)" /> ESCOLHA A CIDADE DESEJADA:
                </span>
                {!isAllCitiesSelected && (
                  <button 
                    type="button"
                    className="mini-clear-btn" 
                    onClick={clearAllCities}
                    title="Limpar seleção de cidades"
                  >
                    Limpar ({selectedCities.length})
                  </button>
                )}
              </div>

              {/* Chips de Cidades Selecionadas */}
              <div className="selected-chips-row">
                <button 
                  type="button"
                  className={`chip-btn ${isAllCitiesSelected ? 'active' : ''}`}
                  onClick={selectAllCities}
                >
                  Todas ({placesData.length})
                </button>
                {selectedCities.map(city => (
                  <span key={city} className="chip-badge active">
                    📍 {city}
                    <button type="button" onClick={() => toggleCity(city)} className="chip-remove">✕</button>
                  </span>
                ))}
                <button 
                  type="button"
                  className="chip-btn"
                  onClick={() => setIsCityBoxOpen(!isCityBoxOpen)}
                  style={{ borderStyle: 'dashed' }}
                >
                  {isCityBoxOpen ? '▲ Fechar Lista' : '▼ Ver Lista de Cidades'}
                </button>
              </div>

              {/* Painel Dropdown de Cidades com Lista de Checkboxes (idêntica ao Personallize) */}
              {isCityBoxOpen && (
                <div className="box-dropdown-panel animate-slide-down">
                  <div className="box-search-bar">
                    <Search size={14} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar cidade..."
                      value={citySearchText}
                      onChange={(e) => setCitySearchText(e.target.value)}
                      className="box-search-input"
                    />
                  </div>

                  <div className="city-sort-bar">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ordenar lista por:</span>
                    <button 
                      type="button"
                      className={`sort-tab ${citySortBy === 'proximity' ? 'active' : ''}`}
                      onClick={() => setCitySortBy('proximity')}
                    >
                      Proximidade (Capital)
                    </button>
                    <button 
                      type="button"
                      className={`sort-tab ${citySortBy === 'count' ? 'active' : ''}`}
                      onClick={() => setCitySortBy('count')}
                    >
                      Mais Atrações
                    </button>
                    <button 
                      type="button"
                      className={`sort-tab ${citySortBy === 'name' ? 'active' : ''}`}
                      onClick={() => setCitySortBy('name')}
                    >
                      Nome (A-Z)
                    </button>
                  </div>

                  <div className="box-items-scroll">
                    {filteredCitiesInBox.map(c => {
                      const isChecked = selectedCities.includes(c.city);
                      return (
                        <label key={c.city} className={`checkbox-item-row ${isChecked ? 'checked' : ''}`}>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCity(c.city)}
                            className="custom-checkbox"
                          />
                          <span className="checkbox-city-name">{c.city}</span>
                          <div className="city-meta-tags">
                            <span className="meta-badge-count">{c.count}</span>
                            <span className="meta-badge-dist">
                              {c.distance === 0 ? 'Capital' : `~${c.distance} km`}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Botão Final Solicitado: INICIE A PESQUISA (com o mesmo efeito de RETRAIR) */}
            <button 
              type="button"
              className="btn-iniciar-pesquisa"
              onClick={handleIniciarPesquisa}
              title="Iniciar a pesquisa e retrair o painel"
            >
              <span>INICIE A PESQUISA</span>
              <ChevronUp size={18} color="#FFFFFF" />
            </button>
          </div>
        </section>
      )}
    </>
  );
}
