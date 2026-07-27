import React, { useState } from 'react';
import { User, ShieldCheck, Heart, MapPin, Ticket, Sparkles, Settings, CheckCircle2, ChevronRight, Award, Clock } from 'lucide-react';

export default function ProfileView({ favorites, placesData, theme, toggleTheme, onSelectPlace }) {
  const [activeTab, setActiveTab] = useState('reservas'); // 'reservas', 'stats', 'config'

  // Saved bookings / quote inquiries simulation
  const [bookings, setBookings] = useState([
    {
      id: 'res-1',
      title: 'Passaporte Thermas dos Laranjais (Parque Aquático)',
      city: 'Olímpia',
      date: '15/08/2026',
      status: 'Confirmado',
      tickets: '2 Adultos, 1 Criança',
      price: 'R$ 380,00'
    },
    {
      id: 'res-2',
      title: 'Passeio de Rafting & Ecoturismo nas Cachoeiras',
      city: 'Brotas',
      date: '22/08/2026',
      status: 'Em Processamento',
      tickets: '2 Adultos',
      price: 'R$ 290,00'
    }
  ]);

  const uniqueCitiesCount = new Set(placesData.map(p => p.city)).size;
  const favoritePlaces = placesData.filter(p => favorites.includes(p.id));

  return (
    <div className="profile-screen">
      {/* Profile Banner */}
      <div className="profile-hero-card glass-panel">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            <User size={42} color="#0B0F19" />
          </div>
          <span className="profile-verified-badge" title="Viajante Verificado SP">
            <ShieldCheck size={16} />
          </span>
        </div>

        <div className="profile-main-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', margin: 0, color: 'var(--text-main)' }}>
              Viajante Explorador SP
            </h1>
            <span className="user-tier-badge">
              <Award size={14} /> Membro Voyage Elite
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Membro desde 2026 • Estado de São Paulo
          </p>

          <div className="profile-stats-row">
            <div className="profile-stat-box">
              <strong>{favorites.length}</strong>
              <small>Locais Salvos</small>
            </div>
            <div className="profile-stat-box">
              <strong>{bookings.length}</strong>
              <small>Reservas & Cotações</small>
            </div>
            <div className="profile-stat-box">
              <strong>{uniqueCitiesCount}</strong>
              <small>Cidades SP Mapeadas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="profile-tabs-row">
        <button 
          className={`profile-tab-btn ${activeTab === 'reservas' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservas')}
        >
          <Ticket size={16} /> Minhas Reservas & Ingressos ({bookings.length})
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'favoritos' ? 'active' : ''}`}
          onClick={() => setActiveTab('favoritos')}
        >
          <Heart size={16} /> Favoritos no Roteiro ({favorites.length})
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Settings size={16} /> Preferências do Sistema
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'reservas' && (
        <div className="profile-tab-content glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--text-main)', margin: 0 }}>
                Reservas & Solas de Cotação
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Gerencie seus vouchers de entrada em parques e passeios agendados.
              </p>
            </div>
          </div>

          <div className="bookings-list">
            {bookings.map(b => (
              <div key={b.id} className="booking-card glass-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="booking-icon-box">
                    <Ticket size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-main)' }}>{b.title}</h4>
                    <small style={{ color: 'var(--text-muted)' }}>📍 {b.city} • Data: {b.date}</small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <small style={{ color: 'var(--text-dim)', display: 'block' }}>Quantidade</small>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{b.tickets}</strong>
                  </div>

                  <div>
                    <small style={{ color: 'var(--text-dim)', display: 'block' }}>Valor Estimado</small>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{b.price}</strong>
                  </div>

                  <span className={`booking-status-badge ${b.status === 'Confirmado' ? 'confirmed' : 'pending'}`}>
                    {b.status === 'Confirmado' ? <CheckCircle2 size={14} /> : <Clock size={14} />} {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'favoritos' && (
        <div className="profile-tab-content glass-panel">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
            Atrações que você favoritou:
          </h3>
          {favoritePlaces.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Você ainda não favoritou nenhuma atração.</p>
          ) : (
            <div className="places-grid">
              {favoritePlaces.map(place => (
                <div key={place.id} className="fav-mini-card glass-panel" onClick={() => onSelectPlace(place)}>
                  <img src={place.coverImage} alt={place.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} onError={(e) => e.target.src = place.backupImage} />
                  <div style={{ padding: '0.75rem 0 0 0' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: '0 0 4px 0' }}>{place.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {place.city}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="profile-tab-content glass-panel">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Configurações e Temas Visuais
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '1rem' }}>
                Sistema de Design Ativo: {theme === 'dark' ? 'Horizon Venture (Dark Mode)' : 'Voyage Elite (Light Premium)'}
              </strong>
              <small style={{ color: 'var(--text-muted)' }}>Alternar entre tema visual claro ou escuro.</small>
            </div>
            <button className="btn-primary" onClick={toggleTheme}>
              Alternar Tema Visual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
