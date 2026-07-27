import React from 'react';
import { Sun, Moon, Heart, Map, Calendar, Sparkles, User, Home } from 'lucide-react';

export default function Header({ 
  theme, 
  toggleTheme, 
  favoriteCount, 
  activeTab, 
  setActiveTab 
}) {
  return (
    <header className="app-header glass-panel">
      <div className="container header-content">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('explore'); }}>
          <img src="/logo.png" alt="TravelGPT Logo" className="header-logo-img" />
        </a>

        {/* Primary Screen Tabs */}
        <nav className="header-nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Home size={16} /> <span>Explorar</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
            onClick={() => setActiveTab('itinerary')}
          >
            <Calendar size={16} /> 
            <span>Itinerário</span>
            {favoriteCount > 0 && <span className="tab-badge">{favoriteCount}</span>}
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Sparkles size={16} color="var(--accent-gold)" /> <span>TravelGPT IA</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> <span>Perfil & Reservas</span>
          </button>
        </nav>

        <div className="header-actions">
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {theme === 'dark' ? <Sun size={18} color="#FFB800" /> : <Moon size={18} color="#8B5CF6" />}
          </button>
        </div>
      </div>
    </header>
  );
}
