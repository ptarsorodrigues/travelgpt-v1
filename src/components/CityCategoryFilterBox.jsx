import React, { useState, useMemo } from 'react';
import { MapPin, Filter, Search, Check, X, ChevronDown, ChevronUp, Layers, List, Grid, Map as MapIcon, SlidersHorizontal, Navigation, Loader2 } from 'lucide-react';
import { getDistanceKm, formatDistance, normalizeText, fuzzyPhoneticMatch } from '../utils/geo';

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
  onResetAll,
  isExpanded: isExpandedControlled,
  setIsExpanded: setIsExpandedControlled
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedControlled !== undefined ? isExpandedControlled : internalExpanded;
  const setIsExpanded = setIsExpandedControlled !== undefined ? setIsExpandedControlled : setInternalExpanded;

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

  // Filtered cities in box search (Fuzzy & Phonetic Matching)
  const filteredCitiesInBox = useMemo(() => {
    if (!citySearchText.trim()) return citiesWithStats;
    return citiesWithStats.filter(c => fuzzyPhoneticMatch(c.city, citySearchText));
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

  if (!isExpanded) return null;

  return (
    <section className="filter-system-card expanded-card glass-panel" style={{ marginTop: '0.35rem', marginBottom: '1rem' }}>
      <div className="personalize-expanded-content animate-slide-down">
        {/* Título da Seção + Botão Retrair */}
          {/* Título da Seção + Botão Retrair */}
          <div className="personalize-section-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="personalize-section-title">
              <SlidersHorizontal size={20} color="var(--primary)" />
              <span>SELECIONE AS CATEGORIAS</span>
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
                    const count = placesData.filter(p => {
                      if (selectedCities.length > 0 && !selectedCities.includes(p.city)) return false;
                      return (p.mainCategory || p.category) === cat;
                    }).length;
                    const CATEGORY_DESCRIPTIONS = {
                      "O que Fazer & Experiências": "Pontos turísticos, passeios, praias, trilhas, cultura e vida noturna",
                      "Hotéis & Acomodações": "Hotéis, pousadas, resorts, chalés e aluguel por temporada",
                      "Comer & Beber": "Restaurantes, bares, quiosques, cafeterias e comidas típicas",
                      "Compras & Serviços": "Feirinhas, artesanato, shoppings, farmácias, receptivos e emergências"
                    };
                    const description = CATEGORY_DESCRIPTIONS[cat];
                    return (
                      <label key={cat} className={`checkbox-item-row category-item-row ${isChecked ? 'checked' : ''}`}>
                        <div className="category-item-top">
                          <div className="category-item-title-group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCategory(cat)}
                                className="custom-checkbox"
                              />
                              <span className="checkbox-category-title">{cat}</span>
                            </div>
                            <span className="checkbox-category-count-centered" style={{ margin: '2px auto 0 auto', textAlign: 'center', display: 'block', width: '100%' }}>
                              {count} atrações
                            </span>
                          </div>
                          <span className="meta-badge-count">{count}</span>
                        </div>
                        {description && (
                          <div className="checkbox-category-desc">
                            {description}
                          </div>
                        )}
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
    </section>
  );
}
