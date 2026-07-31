import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PlaceCard from './components/PlaceCard';
import PlaceListItem from './components/PlaceListItem';
import MapView from './components/MapView';
import PlaceModal from './components/PlaceModal';
import PlaceAiModal from './components/PlaceAiModal';
import ItineraryView from './components/ItineraryView';
import AiAssistant from './components/AiAssistant';
import ProfileView from './components/ProfileView';
import CityCategoryFilterBox from './components/CityCategoryFilterBox';
import ExploreCityFilterSection from './components/ExploreCityFilterSection';
import InAppWebViewer from './components/InAppWebViewer';
import { getDistanceKm, formatDistance, normalizeText, fuzzyPhoneticMatch } from './utils/geo';
import { Search, MapPin, Grid, List, Layers, Map as MapIcon, Filter, Heart, Sparkles, Compass, X, Navigation, Database, Loader2 } from 'lucide-react';

const CATEGORIES = [
  "Todas",
  "Parques de Diversão & Aquáticos",
  "Áreas de Lazer, Praças & Parques",
  "Atrações Turísticas, Museus & Cultura",
  "Cachoeiras, Prainhas & Mirantes",
  "Zoológicos, Bosques & Natureza"
];

// Default Location: São Paulo Capital Center (-23.5505, -46.6333)
const DEFAULT_LOCATION = { lat: -23.5505, lng: -46.6333, isGps: false };

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'map', 'itinerary', 'ai', 'profile'
  
  // Dynamic places state fetched exclusively from Vercel Postgres DB (/api/places)
  const [places, setPlaces] = useState([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState(null);

  const normalizeCategory = (cat) => {
    if (!cat) return "Atrações Turísticas, Museus & Cultura";
    if (cat === "Atrações Turísticas & Lazer") return "Atrações Turísticas, Museus & Cultura";
    return cat;
  };

  useEffect(() => {
    setIsLoadingDb(true);
    fetch('/api/places')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erro na API do Banco de Dados (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map(p => ({
            ...p,
            category: normalizeCategory(p.category || p.originalCategory)
          }));
          setPlaces(normalized);
          setDbError(null);
          setIsLoadingDb(false);
        } else {
          throw new Error('Formato de resposta inválido do Banco de Dados.');
        }
      })
      .catch(err => {
        console.warn('Servidor de banco de dados offline ou desenvolvimento local sem API. Utilizando fallback local places.json:', err.message);
        import('./data/places.json')
          .then(fallbackModule => {
            const fallbackData = fallbackModule.default || fallbackModule;
            const normalized = fallbackData.map(p => ({
              ...p,
              category: normalizeCategory(p.category || p.originalCategory)
            }));
            setPlaces(normalized);
            setDbError(null);
          })
          .catch(importErr => {
            console.error('Erro ao carregar fallback de places.json:', importErr);
            setDbError(err.message);
          })
          .finally(() => {
            setIsLoadingDb(false);
          });
      });
  }, []);

  // User GPS Location State
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [gpsLocationName, setGpsLocationName] = useState(null);

  // Distance Radius Filter state: default 10 km (Requirement 2: "apresentar inicialmente apenas as opções a menos de 10km")
  const [maxDistanceKm, setMaxDistanceKm] = useState(10);

  // Multi-selection state for cities ([] means all cities)
  const [selectedCities, setSelectedCities] = useState([]);
  
  // Multi-selection state for categories (['Todas'] means all categories)
  const [selectedCategories, setSelectedCategories] = useState(['Todas']);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for expanding/collapsing Category Filter Box
  const [isCategoryBoxExpanded, setIsCategoryBoxExpanded] = useState(false);
  
  // Default view mode is LIST (Requirement 3: "sendo a opção lista a default")
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'city', 'category', 'map'
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [webViewerPlace, setWebViewerPlace] = useState(null); // In-App Web View Place state
  const [selectedPlaceAi, setSelectedPlaceAi] = useState(null); // Groq AI Place Guide Modal state
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Favorites in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('travel_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reverse Geocoding Effect when GPS is active
  useEffect(() => {
    if (userLocation?.isGps && userLocation.lat && userLocation.lng) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLocation.lat}&lon=${userLocation.lng}&format=json`)
        .then(res => {
          if (!res.ok) throw new Error('Falha na resposta da geocodificação');
          return res.json();
        })
        .then(data => {
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.municipality || addr.suburb || addr.village || addr.county;
          const state = addr.state;
          if (city) {
            setGpsLocationName(state ? `${city}, ${state}` : city);
          } else {
            setGpsLocationName(`${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
          }
        })
        .catch(err => {
          console.warn('Geocodificação reversa offline ou indisponível:', err);
          setGpsLocationName(`${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
        });
    } else {
      setGpsLocationName(null);
    }
  }, [userLocation]);

  // Automatically request GPS position on mount
  useEffect(() => {
    handleGeolocateUser();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('travel_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Regra do Usuário: sempre que o usuário ativar o GPS nenhuma cidade pode retomar como selecionada
  useEffect(() => {
    if (userLocation?.isGps) {
      setSelectedCities([]);
    }
  }, [userLocation?.isGps]);

  const handleGeolocateUser = () => {
    // Se o GPS já estiver ATIVO, ao clicar ele DESATIVA (desconecta e volta para a Capital padrão)
    if (userLocation?.isGps) {
      setUserLocation(DEFAULT_LOCATION);
      return;
    }

    // Regra do Usuário: sempre que o usuário ativar o GPS nenhuma cidade pode retomar como selecionada
    setSelectedCities([]);

    // Se o GPS estiver INATIVO, ao clicar ele ATIVA (solicita as coordenadas GPS ao navegador)
    if ('geolocation' in navigator) {
      setIsGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            isGps: true
          });
          setIsGeolocating(false);
        },
        (error) => {
          console.warn("GPS Geolocation error or permission denied:", error);
          setIsGeolocating(false);
          setUserLocation(DEFAULT_LOCATION);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id) => favorites.includes(id);

  // Precompute center (marco zero) for each city in the dataset
  const cityCenters = useMemo(() => {
    const map = {};
    places.forEach(p => {
      if (p.city && p.lat && p.lng) {
        if (!map[p.city]) {
          map[p.city] = { lats: [], lngs: [] };
        }
        map[p.city].lats.push(p.lat);
        map[p.city].lngs.push(p.lng);
      }
    });
    const centers = {};
    Object.keys(map).forEach(city => {
      const lats = map[city].lats;
      const lngs = map[city].lngs;
      centers[city] = {
        lat: lats.reduce((a, b) => a + b, 0) / lats.length,
        lng: lngs.reduce((a, b) => a + b, 0) / lngs.length
      };
    });
    return centers;
  }, [places]);

  // Effective location used for computing distances & map center
  const activeUserLocation = useMemo(() => {
    // 1. Se o usuário selecionou uma cidade específica, essa cidade É a referência para o cálculo de distâncias!
    if (selectedCities && selectedCities.length > 0) {
      const primaryCity = selectedCities[0];
      if (cityCenters[primaryCity]) {
        return {
          lat: cityCenters[primaryCity].lat,
          lng: cityCenters[primaryCity].lng,
          isGps: false,
          cityName: primaryCity
        };
      }
    }
    // 2. Se nenhuma cidade foi especificamente selecionada E o GPS está ativo, usa as coordenadas exatas do GPS
    if (userLocation?.isGps) {
      return userLocation;
    }
    // 3. Padrão: São Paulo Capital (Centro - Praça da Sé)
    return DEFAULT_LOCATION;
  }, [userLocation, selectedCities, cityCenters]);

  // Multi-filtering logic with initial < 10 km distance constraint
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Calculate distance to active user reference / GPS location
      const distance = (activeUserLocation && place.lat && place.lng)
        ? getDistanceKm(activeUserLocation.lat, activeUserLocation.lng, place.lat, place.lng)
        : 9999;

      // Initial < 10 km distance restriction applies ONLY when no category, no city, and no search query is active
      if (maxDistanceKm !== null && !searchQuery.trim() && selectedCities.length === 0 && selectedCategories.includes('Todas')) {
        if (distance > maxDistanceKm) {
          return false;
        }
      }

      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(place.id)) {
        return false;
      }
      
      // Multi-cities filter
      if (selectedCities.length > 0 && !selectedCities.includes(place.city)) {
        return false;
      }

      // Multi-categories filter
      if (!selectedCategories.includes('Todas') && !selectedCategories.includes(place.category)) {
        return false;
      }

      // Search query filter (Fuzzy & Phonetic Matching for PT-BR)
      if (searchQuery.trim()) {
        const q = searchQuery;
        const matchTitle = fuzzyPhoneticMatch(place.title, q);
        const matchCity = fuzzyPhoneticMatch(place.city, q);
        const matchCat = fuzzyPhoneticMatch(place.category, q);
        const matchAddr = fuzzyPhoneticMatch(place.address, q);
        const matchDesc = fuzzyPhoneticMatch(place.description, q);
        return matchTitle || matchCity || matchCat || matchAddr || matchDesc;
      }

      return true;
    });
  }, [places, selectedCities, selectedCategories, searchQuery, showFavoritesOnly, favorites, activeUserLocation, maxDistanceKm]);

  // Sort filtered places by ASCENDING DISTANCE to user (menor até a maior distância)
  const sortedFilteredPlaces = useMemo(() => {
    return [...filteredPlaces].map(place => {
      const distance = (place.lat && place.lng)
        ? getDistanceKm(activeUserLocation.lat, activeUserLocation.lng, place.lat, place.lng)
        : 9999;
      return { ...place, distanceKm: distance };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filteredPlaces, activeUserLocation]);

  // Group sorted places by city for the "city" view mode
  const placesByCity = useMemo(() => {
    const map = {};
    sortedFilteredPlaces.forEach(p => {
      if (!map[p.city]) map[p.city] = [];
      map[p.city].push(p);
    });
    return map;
  }, [sortedFilteredPlaces]);

  // Featured places for Hero Banner (only POIs classified as 'gold' in Product column, sorted by closest to user)
  const featuredPlaces = useMemo(() => {
    const featured = places.filter(p => p.tier && (p.tier.toLowerCase() === 'gold' || p.tier.toLowerCase() === 'diamond'));
    return featured.map(p => ({
      ...p,
      distanceKm: getDistanceKm(activeUserLocation.lat, activeUserLocation.lng, p.lat, p.lng)
    })).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [places, activeUserLocation]);

  // Calculated Detected City / Location when GPS is Active
  const detectedCityName = useMemo(() => {
    if (!userLocation?.isGps || !userLocation.lat || !userLocation.lng) return null;
    if (gpsLocationName && !gpsLocationName.includes('NaN')) return gpsLocationName;
    
    // Find closest city in dataset as instant offline fallback
    if (places && places.length > 0) {
      let minDistance = Infinity;
      let closestCity = null;
      for (const p of places) {
        if (p.lat && p.lng) {
          const dist = getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = p.city;
          }
        }
      }
      if (closestCity) {
        return `${closestCity}, SP`;
      }
    }
    return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
  }, [userLocation, gpsLocationName, places]);

  // Reference Location text when GPS is Inactive (apenas a localização)
  const referenceLocationName = useMemo(() => {
    if (selectedCities.length === 1) {
      return `📍 ${selectedCities[0]} (Marco Zero / Centro)`;
    } else if (selectedCities.length > 1) {
      return `📍 ${selectedCities.join(', ')} (Centros Urbanos)`;
    }
    return '📍 São Paulo Capital (Centro - Praça da Sé)';
  }, [selectedCities]);

  // Active Location text when GPS is Active (apenas a localização)
  const activeLocationName = useMemo(() => {
    const cityStr = detectedCityName || 'Sua Posição Atual';
    return `📍 ${cityStr}`;
  }, [detectedCityName]);

  // Single city select shortcut
  const handleSelectSingleCity = (city) => {
    setSelectedCities([city]);
    setShowFavoritesOnly(false);
    if (activeTab !== 'explore' && activeTab !== 'map') {
      setActiveTab('explore');
    }
  };

  const handleResetSearchAndCategories = () => {
    // Limpa a busca textual, categorias e travas de raio, MANTENDO as cidades que o usuário escolheu!
    setSelectedCategories(['Todas']);
    setSearchQuery('');
    setShowFavoritesOnly(false);
    setMaxDistanceKm(null);
  };

  const handleResetAllFilters = () => {
    setSelectedCities([]);
    setSelectedCategories(['Todas']);
    setSearchQuery('');
    setShowFavoritesOnly(false);
    setMaxDistanceKm(10); // Reset back to default 10km initial radius
  };

  return (
    <div className="app-root">
      <Header 
        theme={theme}
        toggleTheme={toggleTheme}
        favoriteCount={favorites.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userLocation={userLocation}
        handleGeolocateUser={handleGeolocateUser}
        isGeolocating={isGeolocating}
      />

      {/* Banner Destaque Solicitado pelo Usuário */}
      <div className="app-subbanner-phrase container">
        <img 
          src="/banner_sua_viagem.png" 
          alt="Sua viagem nunca mais será a mesma!" 
          className="app-subbanner-img"
        />
      </div>

      {/* Seção do Controle de GPS e Exibição do Local (Cor idêntica ao estado do GPS: Verde Ativo / Vermelho Inativo) */}
      <div className="gps-control-banner-container container">
        <div className="gps-control-row">
          {/* Botão 1: Controle do GPS (Verde Ativo / Vermelho Inativo) */}
          <button 
            type="button"
            className={`gps-toggle-btn-custom ${userLocation?.isGps ? 'active-green' : 'inactive-red'}`}
            onClick={handleGeolocateUser}
            disabled={isGeolocating}
            title={userLocation?.isGps ? "GPS Ativo. Clique para desativar." : "GPS Inativo. Clique para ativar a localização."}
          >
            {isGeolocating ? (
              <Loader2 size={16} className="animate-spin" color="#FFF" />
            ) : (
              <Navigation size={16} color="#FFF" />
            )}
            <span>{userLocation?.isGps ? 'GPS Ativo' : 'GPS Inativo'}</span>
          </button>

          {/* Botão 2: Pílula da Localização com cor idêntica ao GPS Ativo/Inativo e Letras Brancas */}
          <div className={`gps-location-pill ${userLocation?.isGps ? 'active-green' : 'inactive-red'}`}>
            {isLoadingDb || isGeolocating ? (
              <span className="gps-location-pill-text">
                <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} color="#FFF" />
                Obtendo localização...
              </span>
            ) : (
              <span className="gps-location-pill-text">
                {userLocation?.isGps ? activeLocationName : referenceLocationName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Seção Retrátil: EXPLORAR OUTRA CIDADE? */}
      <ExploreCityFilterSection 
        placesData={places}
        userLocation={activeUserLocation}
        setUserLocation={setUserLocation}
        DEFAULT_LOCATION={DEFAULT_LOCATION}
        selectedCities={selectedCities}
        setSelectedCities={setSelectedCities}
      />


      {/* RENDER BY SCREEN TAB */}
      {activeTab === 'itinerary' ? (
        <main className="container" style={{ minHeight: '80vh', paddingTop: '2rem' }}>
          <ItineraryView 
            favorites={favorites}
            placesData={places}
            userLocation={activeUserLocation}
            onSelectPlace={setSelectedPlace}
            onSelectCity={handleSelectSingleCity}
          />
        </main>
      ) : activeTab === 'ai' ? (
        <main className="container" style={{ minHeight: '80vh', paddingTop: '2rem' }}>
          <AiAssistant 
            placesData={places}
            userLocation={activeUserLocation}
            onSelectPlace={setSelectedPlace}
            onSelectCity={handleSelectSingleCity}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        </main>
      ) : activeTab === 'profile' ? (
        <main className="container" style={{ minHeight: '80vh', paddingTop: '2rem' }}>
          <ProfileView 
            favorites={favorites}
            placesData={places}
            userLocation={activeUserLocation}
            theme={theme}
            toggleTheme={toggleTheme}
            onSelectPlace={setSelectedPlace}
          />
        </main>
      ) : activeTab === 'map' ? (
        <main className="container" style={{ minHeight: '80vh', paddingTop: '2rem' }}>
          <div className="screen-header glass-panel" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h1 className="screen-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapIcon size={28} color="var(--primary)" /> Mapa Turístico Interativo do Estado de SP
              </h1>
              <p className="screen-subtitle">
                {activeUserLocation.isGps ? '📍 Exibindo sua posição GPS atual e os pontos turísticos ordenados.' : `📍 Exibindo atrações turísticas em relação a ${activeUserLocation.cityName || 'São Paulo'}.`}
              </p>
            </div>
          </div>
          <div style={{ height: '70vh', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
            <MapView 
              places={sortedFilteredPlaces}
              userLocation={activeUserLocation}
              onSelectPlace={setSelectedPlace}
              onSelectCity={handleSelectSingleCity}
            />
          </div>
        </main>
      ) : (
        /* EXPLORE HOME SCREEN */
        <>
          {/* Hero Section featuring top places */}
          {!showFavoritesOnly && (
            <Hero 
              featuredPlaces={featuredPlaces}
              userLocation={activeUserLocation}
              onSelectPlace={setSelectedPlace}
              onOpenWebView={setWebViewerPlace}
              onOpenPlaceAi={setSelectedPlaceAi}
              onSelectCity={handleSelectSingleCity}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              viewMode={viewMode}
              setViewMode={setViewMode}
              maxDistanceKm={maxDistanceKm}
              setMaxDistanceKm={setMaxDistanceKm}
              isCategoryBoxExpanded={isCategoryBoxExpanded}
              setIsCategoryBoxExpanded={setIsCategoryBoxExpanded}
            />
          )}

          {/* DEDICATED CITY & CATEGORY MULTI-SELECTION FILTER SYSTEM */}
          <CityCategoryFilterBox 
            placesData={places}
            userLocation={activeUserLocation}
            onGeolocateUser={handleGeolocateUser}
            isGeolocating={isGeolocating}
            selectedCities={selectedCities}
            setSelectedCities={setSelectedCities}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            categoriesList={CATEGORIES}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onResetAll={handleResetAllFilters}
            isExpanded={isCategoryBoxExpanded}
            setIsExpanded={setIsCategoryBoxExpanded}
          />

          {/* Status & Active Filter Summary Bar na seção de cima, abaixo de SELECIONE AS CATEGORIAS */}
          <div className="container" style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            <div className="active-filters-summary-bar">
              <div>
                Exibindo <strong style={{ color: 'var(--primary)' }}>{sortedFilteredPlaces.length}</strong> atrações ordenadas da <strong>menor para a maior distância</strong>
                <span className="location-indicator-tag">
                  {userLocation.isGps 
                    ? (selectedCities.length > 0 ? `📍 Filtrando por: ${selectedCities[0]}` : '📍 GPS Ativo (Sua localização exata)')
                    : (selectedCities.length > 0 ? `📍 Referência: Marco Zero de ${selectedCities[0]}` : '📍 Referência: São Paulo Capital')}
                </span>
                {selectedCities.length > 0 && (
                  <span className="summary-tag">
                    📍 {selectedCities.length} {selectedCities.length === 1 ? 'cidade' : 'cidades'}: ({selectedCities.join(', ')})
                  </span>
                )}
                {!selectedCategories.includes('Todas') && (
                  <span className="summary-tag">
                    🎯 Categorias: ({selectedCategories.join(', ')})
                  </span>
                )}
              </div>
              {(selectedCities.length > 0 || !selectedCategories.includes('Todas') || searchQuery || showFavoritesOnly) && (
                <button className="clear-all-btn" onClick={handleResetAllFilters}>
                  Limpar todos os filtros ✕
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <main className="container" id="search-results-anchor" style={{ minHeight: '60vh', paddingTop: '0.5rem' }}>
            {showFavoritesOnly && (
              <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444' }}>
                <Heart size={24} fill="#EF4444" />
                <h2 style={{ fontFamily: 'var(--font-heading)' }}>Seus Locais Salvos no Roteiro ({sortedFilteredPlaces.length})</h2>
              </div>
            )}

            {sortedFilteredPlaces.length === 0 ? (
              <div style={{ textBaseline: 'center', textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <Filter size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3>Nenhum ponto de interesse encontrado com os filtros selecionados</h3>
                <p style={{ marginTop: '0.5rem' }}>
                  {selectedCities.length > 0 
                    ? `Nenhuma atração encontrada para as categorias selecionadas em ${selectedCities.join(', ')}.`
                    : 'Tente remover algumas cidades ou categorias para expandir sua busca.'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={handleResetSearchAndCategories}>
                    Ver atrações de {selectedCities.length > 0 ? selectedCities[0] : 'SP'}
                  </button>
                  {selectedCities.length > 0 && (
                    <button className="btn-secondary" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.5rem 1rem', borderRadius: '10px' }} onClick={handleResetAllFilters}>
                      Limpar todas as cidades
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'list' ? (
              /* DEFAULT VIEW MODE: LIST SORTED BY ASCENDING DISTANCE */
              <div className="places-list-container">
                {sortedFilteredPlaces.map(place => (
                  <PlaceListItem 
                    key={place.id}
                    place={place}
                    userLocation={userLocation}
                    onSelectPlace={setSelectedPlace}
                    onOpenWebView={setWebViewerPlace}
                    onOpenPlaceAi={setSelectedPlaceAi}
                    onSelectCity={handleSelectSingleCity}
                    isFavorite={isFavorite}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="places-grid">
                {sortedFilteredPlaces.map(place => (
                  <PlaceCard 
                    key={place.id}
                    place={place}
                    userLocation={userLocation}
                    onSelectPlace={setSelectedPlace}
                    onOpenWebView={setWebViewerPlace}
                    onOpenPlaceAi={setSelectedPlaceAi}
                    onSelectCity={handleSelectSingleCity}
                    isFavorite={isFavorite}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : viewMode === 'city' ? (
              <div className="city-grouped-container">
                {Object.keys(placesByCity).map(cityName => (
                  <div key={cityName} className="city-section">
                    <div className="city-section-header">
                      <h2 className="city-section-title">
                        <MapPin size={22} className="city-icon" color="var(--primary)" />
                        <span>{cityName}</span>
                        <span className="city-count-badge">
                          {placesByCity[cityName].length} {placesByCity[cityName].length === 1 ? 'ponto de interesse' : 'pontos de interesse'}
                        </span>
                      </h2>
                      {!selectedCities.includes(cityName) && (
                        <button 
                          className="city-filter-only-btn" 
                          onClick={() => handleSelectSingleCity(cityName)}
                          title={`Filtrar apenas por ${cityName}`}
                        >
                          Filtrar apenas {cityName}
                        </button>
                      )}
                    </div>

                    <div className="places-grid">
                      {placesByCity[cityName].map(place => (
                        <PlaceCard 
                          key={place.id}
                          place={place}
                          userLocation={userLocation}
                          onSelectPlace={setSelectedPlace}
                          onOpenWebView={setWebViewerPlace}
                          onOpenPlaceAi={setSelectedPlaceAi}
                          onSelectCity={handleSelectSingleCity}
                          isFavorite={isFavorite}
                          toggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'category' ? (
              <div>
                {CATEGORIES.slice(1).map(catName => {
                  const catPlaces = sortedFilteredPlaces.filter(p => p.category === catName);
                  if (catPlaces.length === 0) return null;
                  return (
                    <div key={catName} className="category-section">
                      <div className="category-section-header">
                        <h2 className="category-section-title">
                          {catName}
                          <span className="category-count-badge">{catPlaces.length}</span>
                        </h2>
                      </div>

                      <div className="places-grid">
                        {catPlaces.map(place => (
                          <PlaceCard 
                            key={place.id}
                            place={place}
                            userLocation={userLocation}
                            onSelectPlace={setSelectedPlace}
                            onOpenWebView={setWebViewerPlace}
                            onOpenPlaceAi={setSelectedPlaceAi}
                            onSelectCity={handleSelectSingleCity}
                            isFavorite={isFavorite}
                            toggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </main>
        </>
      )}

      {/* Place Detail Modal */}
      <PlaceModal 
        place={selectedPlace}
        userLocation={userLocation}
        onClose={() => setSelectedPlace(null)}
        onOpenWebView={setWebViewerPlace}
        onSelectCity={handleSelectSingleCity}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        onOpenPlaceAi={setSelectedPlaceAi}
      />

      {/* In-App Web View Modal */}
      <InAppWebViewer 
        place={webViewerPlace}
        userLocation={userLocation}
        onClose={() => setWebViewerPlace(null)}
      />

      {/* Groq AI Place Guide Modal */}
      <PlaceAiModal 
        place={selectedPlaceAi}
        onClose={() => setSelectedPlaceAi(null)}
        onSelectCity={handleSelectSingleCity}
      />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '2.5rem 0', background: 'var(--bg-card)', marginTop: '4rem', color: 'var(--text-muted)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <img 
              src="/logo.png" 
              alt="TravelGPT Logo" 
              style={{ 
                height: '40px', 
                background: '#FFFFFF', 
                padding: '5px 12px', 
                borderRadius: '10px', 
                marginBottom: '0.5rem', 
                display: 'block',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
              }} 
            />
            <p style={{ fontSize: '0.85rem' }}>Guia inteligente com 100+ pontos de interesse, parques aquáticos, cachoeiras e ecoturismo.</p>
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} TravelGPT. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
