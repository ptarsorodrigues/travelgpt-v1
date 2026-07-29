import React, { useState, useMemo } from 'react';
import { MapPin, Filter, Search, Check, X, ChevronDown, ChevronUp, Layers, List, Grid, Map as MapIcon, SlidersHorizontal, Navigation, Loader2 } from 'lucide-react';
import { getDistanceKm, formatDistance } from '../utils/geo';

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

  // Filtered cities in box search
  const filteredCitiesInBox = useMemo(() => {
    if (!citySearchText.trim()) return citiesWithStats;
    const q = citySearchText.toLowerCase();
    return citiesWithStats.filter(c => c.city.toLowerCase().includes(q));
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

  return (
    <section className="filter-system-card glass-panel">
      {/* Título da Nova Seção */}
      <div className="personalize-section-title-wrap">
        <h2 className="personalize-section-title">
          <SlidersHorizontal size={20} color="var(--primary)" />
          <span>PERSONALIZE O SEU TRAVELGPT</span>
        </h2>
      </div>

      {/* Busca e Botão de Controle de GPS */}
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

        {/* Botão de Controle de GPS do Smartphone (VERDE ATIVO / VERMELHO INATIVO) */}
        <button 
          className={`gps-toggle-btn-custom ${userLocation?.isGps ? 'active-green' : 'inactive-red'}`}
          onClick={onGeolocateUser}
          disabled={isGeolocating}
          title={userLocation?.isGps ? "GPS Conectado e Ativo (Sua Posição). Clique para desativar." : "GPS Inativo (Sua Posição). Clique para ativar a localização."}
        >
          {isGeolocating ? (
            <Loader2 size={16} className="animate-spin" color="#FFF" />
          ) : (
            <Navigation size={16} color="#FFF" />
          )}
          <span>{userLocation?.isGps ? '📍 GPS Ativo (Sua Posição)' : '📍 GPS Inativo (Sua Posição)'}</span>
        </button>
      </div>

      {/* 1. TIPO DE EXIBIÇÃO (Rótulo à Esquerda + Botões de Exibição) */}
      <div className="view-mode-section-block">
        <span className="radius-label align-left-label">
          <Layers size={14} color="var(--primary)" /> TIPO DE EXIBIÇÃO:
        </span>
        <div className="view-mode-toggle">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Modo Lista (Padrão)"
          >
            <List size={16} /> Lista
          </button>

          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Modo Cards em Grid"
          >
            <Grid size={16} /> Grid
          </button>

          <button 
            className={`view-btn ${viewMode === 'city' ? 'active' : ''}`}
            onClick={() => setViewMode('city')}
            title="Agrupado por Cidade"
          >
            <MapPin size={16} /> Por Cidade
          </button>

          <button 
            className={`view-btn ${viewMode === 'category' ? 'active' : ''}`}
            onClick={() => setViewMode('category')}
            title="Agrupado por Categoria"
          >
            <Layers size={16} /> Categorias
          </button>
        </div>
      </div>

      {/* 2. RAIO DE BUSCA INICIAL (Rótulo à Esquerda) */}
      <div className="distance-radius-row">
        <span className="radius-label align-left-label">
          <Navigation size={14} color="var(--primary)" /> RAIO DE BUSCA INICIAL:
        </span>
        <div className="radius-buttons-scroll">
          <button 
            className={`radius-pill ${maxDistanceKm === 10 ? 'active' : ''}`}
            onClick={() => setMaxDistanceKm(10)}
            title="Exibir apenas locais a menos de 10 km (Opção inicial padrão)"
          >
            🎯 Até 10 km (Inicial)
          </button>

          <button 
            className={`radius-pill ${maxDistanceKm === 25 ? 'active' : ''}`}
            onClick={() => setMaxDistanceKm(25)}
            title="Exibir locais a menos de 25 km"
          >
            🚗 Até 25 km
          </button>

          <button 
            className={`radius-pill ${maxDistanceKm === 50 ? 'active' : ''}`}
            onClick={() => setMaxDistanceKm(50)}
            title="Exibir locais a menos de 50 km"
          >
            🛣️ Até 50 km
          </button>

          <button 
            className={`radius-pill ${maxDistanceKm === 100 ? 'active' : ''}`}
            onClick={() => setMaxDistanceKm(100)}
            title="Exibir locais a menos de 100 km"
          >
            🗺️ Até 100 km
          </button>

          <button 
            className={`radius-pill ${maxDistanceKm === null ? 'active' : ''}`}
            onClick={() => setMaxDistanceKm(null)}
            title="Exibir todos os locais do Estado"
          >
            🌐 Todas as Distâncias
          </button>
        </div>
      </div>

      {/* 2. ESCOLHA A CIDADE DESEJADA */}
      <div className="filter-box-section-block">
        <div className="filter-box-section-header">
          <span className="radius-label">
            <MapPin size={14} color="var(--primary)" /> ESCOLHA A CIDADE DESEJADA:
          </span>
          {!isAllCitiesSelected && (
            <button 
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
            className={`chip-btn ${isAllCitiesSelected ? 'active' : ''}`}
            onClick={selectAllCities}
          >
            Todas ({placesData.length})
          </button>
          {selectedCities.map(city => (
            <span key={city} className="chip-badge active">
              📍 {city}
              <button onClick={() => toggleCity(city)} className="chip-remove">✕</button>
            </span>
          ))}
          <button 
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
                className={`sort-tab ${citySortBy === 'proximity' ? 'active' : ''}`}
                onClick={() => setCitySortBy('proximity')}
              >
                Proximidade (Capital)
              </button>
              <button 
                className={`sort-tab ${citySortBy === 'count' ? 'active' : ''}`}
                onClick={() => setCitySortBy('count')}
              >
                Mais Atrações
              </button>
              <button 
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

      {/* 3. CATEGORIAS */}
      <div className="filter-box-section-block" style={{ marginTop: '0.75rem' }}>
        <div className="filter-box-section-header">
          <span className="radius-label">
            <Filter size={14} color="var(--accent-gold)" /> CATEGORIAS:
          </span>
          {!selectedCategories.includes('Todas') && (
            <button 
              className="mini-clear-btn" 
              onClick={() => setSelectedCategories(['Todas'])}
            >
              Resetar
            </button>
          )}
        </div>

        <div className="categories-multi-chips">
          {categoriesList.map(cat => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                className={`category-multi-chip ${isSelected ? 'active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat === 'Todas' ? 'Todas as Categorias' : cat}
                {isSelected && <Check size={14} style={{ marginLeft: '4px' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTÃO FINAL: INICIAR A PESQUISA */}
      <button 
        className="btn-iniciar-pesquisa"
        onClick={() => {
          const element = document.getElementById('search-results-anchor');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        title="Iniciar a Pesquisa com os Filtros Selecionados"
      >
        <Search size={18} />
        <span>INICIAR A PESQUISA</span>
      </button>
    </section>
  );
}
