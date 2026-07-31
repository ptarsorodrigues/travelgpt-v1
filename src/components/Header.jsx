import React from 'react';
import { Sun, Moon, Heart, Map, Calendar, Sparkles, User, Home, Loader2 } from 'lucide-react';

export default function Header({ 
  theme, 
  toggleTheme, 
  favoriteCount, 
  activeTab, 
  setActiveTab,
  userLocation,
  handleGeolocateUser,
  isGeolocating
}) {
  return (
    <header className="app-header glass-panel">
      <div className="container header-container-responsive">
        {/* Lado Esquerdo: Logo */}
        <div className="header-left-group">
          <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('explore'); }}>
            <img src="/logo.png" alt="TravelGPT Logo" className="header-logo-img" />
          </a>
        </div>

        {/* Lado Direito: Toolbar Unificado com Todos os Botões 100% Alinhados à DIREITA */}
        <nav className="header-nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
            title="Explorar"
          >
            <Home size={18} />
            <span className="nav-tab-text">Explorar</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
            onClick={() => setActiveTab('itinerary')}
            title="Itinerário"
          >
            <Calendar size={18} /> 
            {favoriteCount > 0 && <span className="tab-badge">{favoriteCount}</span>}
            <span className="nav-tab-text">Itinerário</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
            title="TravelGPT IA"
          >
            <Sparkles size={18} color="var(--accent-gold)" />
            <span className="nav-tab-text">TravelGPT IA</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            title="Perfil & Reservas"
          >
            <User size={18} />
            <span className="nav-tab-text">Perfil</span>
          </button>

          <button 
            className="nav-tab-btn theme-toggle-nav-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {theme === 'dark' ? <Sun size={18} color="#FFB800" /> : <Moon size={18} color="#8B5CF6" />}
            <span className="nav-tab-text">{theme === 'dark' ? "Claro" : "Escuro"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
