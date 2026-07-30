import React, { useState, useMemo } from 'react';
import { MapPin, Filter, Search, Check, X, ChevronDown, ChevronUp, Layers, List, Grid, Map as MapIcon, SlidersHorizontal, Navigation, Loader2 } from 'lucide-react';
import { getDistanceKm, formatDistance, normalizeText } from '../utils/geo';

// Default Reference point: São Paulo Capital Center (-23.5505, -46.6333)
const REF_LAT = -23.5505;
const REF_LNG = -46.6333;
export default function CityCategoryFilterBox({
  placesData,
  userLocation,
  onGeolocateUser,
  isGeolocating,
  maxDistanceKm,
  setMaxDistanceKm,
  selectedCities,
  setSelectedCities,
  selectedCategories,
  setSelectedCategories,
  categoriesList,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onResetAll
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCityBoxOpen, setIsCityBoxOpen] = useState(false);
  const [isCategoryBoxOpen, setIsCategoryBoxOpen] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  const [citySortBy, setCitySortBy] = useState('proximity'); // 'proximity', 'count', 'name'

  // Coordinates used as reference (User GPS or Capital)
  const baseLat = userLocation ? userLocation.lat : REF_LAT;
  const baseLng = userLocation ? userLocation.lng : REF_LNG;

  // Precompute cities with stats, average coordinates, and proximity distance from User Location
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

    // Sort cities based on criteria
    return list.sort((a, b) => {
      if (citySortBy === 'proximity') {
        return a.distance - b.distance; // closest first
      } else if (citySortBy === 'count') {
        return b.count - a.count; // most places first
      } else {
        return a.city.localeCompare(b.city);
      }
    });
  }, [placesData, citySortBy, baseLat, baseLng]);

  // Filtered cities in box search (Accent & Case Insensitive)
  const filteredCitiesInBox = useMemo(() => {
    if (!citySearchText.trim()) return citiesWithStats;
    const q = normalizeText(citySearchText);
    return citiesWithStats.filter(c => normalizeText(c.city).includes(q));
  }, [citiesWithStats, citySearchText]);

  // Toggle individual city selection
  const toggleCity = (cityName) => {
    if (selectedCities.includes(cityName)) {
      const next = selectedCities.filter(c => c !== cityName);
      setSelectedCities(next);
    } else {
      setSelectedCities([...selectedCities, cityName]);
    }
  };

  const selectAllCities = () => {
    setSelectedCities([]); // empty means all cities
  };

  const clearAllCities = () => {
    setSelectedCities([]);
  };

  // Toggle category selection
  const toggleCategory = (catName) => {
    if (catName === 'Todas') {
      setSelectedCategories(['Todas']);
      return;
    }

    let next;
    if (selectedCategories.includes('Todas')) {
      next = [catName];
    } else if (selectedCategories.includes(catName)) {
      next = selectedCategories.filter(c => c !== catName);
    } else {
      next = [...selectedCategories, catName];
    }

    if (next.length === 0 || next.length === categoriesList.length - 1) {
      setSelectedCategories(['Todas']);
    } else {
      setSelectedCategories(next);
    }
  };

  const isAllCitiesSelected = selectedCities.length === 0;

  const handleIniciarPesquisa = () => {
    setIsExpanded(false); // Retrai a seção ao iniciar a pesquisa
    const element = document.getElementById('search-results-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={`filter-system-card ${isExpanded ? 'expanded-card glass-panel' : 'collapsed-card'}`}>
      {!isExpanded ? (
        /* 1. BOTÃO CENTRALIZADO (ESTADO RETRAÍDO) */
        <div className="personalize-toggle-wrapper">
          <button 
            type="button"
            className="btn-personalize-toggle"
            onClick={() => setIsExpanded(true)}
            title="Clique para abrir e personalizar suas preferências de busca"
          >
            <SlidersHorizontal size={22} color="#FFFFFF" />
            <span>PERSONALIZE O SEU TRAVELGPT</span>
            <ChevronDown size={22} color="#FFFFFF" className="toggle-arrow" />
          </button>
        </div>
      ) : (
        /* 2. CONTEÚDO EXPANDIDO COM TODAS AS OPÇÕES */
        <div className="personalize-expanded-content animate-slide-down">
          {/* Título da Seção + Botão Retrair */}
          <div className="personalize-section-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="personalize-section-title">
              <SlidersHorizontal size={20} color="var(--primary)" />
              <span>PERSONALIZE O SEU TRAVELGPT</span>
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

          {/* Busca */}
          <div className="filter-header-row">
            <div className="search-input-wrap">
              <Search className="search-icon" size={18} />
              <input 
                type="text"
                placeholder="Buscar atração, cidade, parque ou palavra-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 1. TIPO DE EXIBIÇÃO (Mesmo estilo de RAIO DE BUSCA INICIAL) */}
          <div className="distance-radius-row">
            <span className="radius-label align-left-label">
              <Layers size={14} color="var(--primary)" /> TIPO DE EXIBIÇÃO:
            </span>
            <div className="radius-buttons-scroll">
              <button 
                type="button"
                className={`radius-pill ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Modo Lista (Padrão)"
              >
                <List size={14} /> Lista
              </button>

              <button 
                type="button"
                className={`radius-pill ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Modo Cards em Grid"
              >
                <Grid size={14} /> Grid
              </button>

              <button 
                type="button"
                className={`radius-pill ${viewMode === 'city' ? 'active' : ''}`}
                onClick={() => setViewMode('city')}
                title="Agrupado por Cidade"
              >
                <MapPin size={14} /> Por Cidade
              </button>

              <button 
                type="button"
                className={`radius-pill ${viewMode === 'category' ? 'active' : ''}`}
                onClick={() => setViewMode('category')}
                title="Agrupado por Categoria"
              >
                <Layers size={14} /> Categorias
              </button>
            </div>
          </div>

          {/* 2. RAIO DE BUSCA INICIAL */}
          <div className="distance-radius-row">
            <span className="radius-label align-left-label">
              <Navigation size={14} color="var(--primary)" /> RAIO DE BUSCA INICIAL:
            </span>
            <div className="radius-buttons-scroll">
              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === 10 ? 'active' : ''}`}
                onClick={() => setMaxDistanceKm(10)}
                title="Exibir apenas locais a menos de 10 km (Opção inicial padrão)"
              >
                🎯 Até 10 km (Inicial)
              </button>

              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === 25 ? 'active' : ''}`}
                onClick={() => setMaxDistanceKm(25)}
                title="Exibir locais a menos de 25 km"
              >
                🚗 Até 25 km
              </button>

              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === 50 ? 'active' : ''}`}
                onClick={() => setMaxDistanceKm(50)}
                title="Exibir locais a menos de 50 km"
              >
                🛣️ Até 50 km
              </button>

              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === 100 ? 'active' : ''}`}
                onClick={() => setMaxDistanceKm(100)}
                title="Exibir locais a menos de 100 km"
              >
                🗺️ Até 100 km
              </button>

              <button 
                type="button"
                className={`radius-pill ${maxDistanceKm === null ? 'active' : ''}`}
                onClick={() => setMaxDistanceKm(null)}
                title="Exibir todos os locais do Estado"
              >
                🌐 Todas as Distâncias
              </button>
            </div>
          </div>

          {/* 3. ESCOLHA A CIDADE DESEJADA */}
          <div className="filter-box-section-block">
            <div className="filter-box-section-header">
              <span className="radius-label">
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

            {/* Dropdown Painel de Cidades */}
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
                          <span className="meta-badge-count">{c.count} {c.count === 1 ? 'local' : 'locais'}</span>
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

          {/* 4. ESCOLHA A CATEGORIA DESEJADA (Mesmo estilo da Cidade Desejada) */}
          <div className="filter-box-section-block">
            <div className="filter-box-section-header">
              <span className="radius-label">
                <Filter size={14} color="var(--primary)" /> ESCOLHA A CATEGORIA DESEJADA:
              </span>
              {!selectedCategories.includes('Todas') && (
                <button 
                  type="button"
                  className="mini-clear-btn" 
                  onClick={() => setSelectedCategories(['Todas'])}
                  title="Limpar seleção de categorias"
                >
                  Limpar ({selectedCategories.length})
                </button>
              )}
            </div>

            <div className="selected-chips-row">
              <button 
                type="button"
                className={`chip-btn ${selectedCategories.includes('Todas') ? 'active' : ''}`}
                onClick={() => setSelectedCategories(['Todas'])}
              >
                Todas ({categoriesList.length - 1})
              </button>
              {!selectedCategories.includes('Todas') && selectedCategories.map(cat => (
                <span key={cat} className="chip-badge active">
                  🎯 {cat}
                  <button type="button" onClick={() => toggleCategory(cat)} className="chip-remove">✕</button>
                </span>
              ))}
              <button 
                type="button"
                className="chip-btn"
                onClick={() => setIsCategoryBoxOpen(!isCategoryBoxOpen)}
                style={{ borderStyle: 'dashed' }}
              >
                {isCategoryBoxOpen ? '▲ Fechar Lista' : '▼ Ver Lista de Categorias'}
              </button>
            </div>

            {/* Dropdown Painel de Categorias */}
            {isCategoryBoxOpen && (
              <div className="box-dropdown-panel animate-slide-down">
                <div className="box-items-scroll">
                  {categoriesList.slice(1).map(cat => {
                    const isChecked = selectedCategories.includes(cat);
                    const count = placesData.filter(p => p.category === cat).length;
                    return (
                      <label key={cat} className={`checkbox-item-row ${isChecked ? 'checked' : ''}`}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat)}
                          className="custom-checkbox"
                        />
                        <span className="checkbox-city-name">{cat}</span>
                        <div className="city-meta-tags">
                          <span className="meta-badge-count">{count} {count === 1 ? 'local' : 'locais'}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* BOTÃO FINAL: INICIAR A PESQUISA (RETRAI O CONTEÚDO) */}
          <button 
            type="button"
            className="btn-iniciar-pesquisa"
            onClick={handleIniciarPesquisa}
            title="Iniciar a Pesquisa com os Filtros Selecionados"
          >
            <Search size={18} />
            <span>INICIAR A PESQUISA</span>
          </button>
        </div>
      )}
    </section>
  );
}
