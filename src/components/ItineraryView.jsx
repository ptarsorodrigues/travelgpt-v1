import React, { useState } from 'react';
import { Calendar, Trash2, MapPin, ExternalLink, Share2, Printer, Plus, Clock, MoveUp, MoveDown, CheckCircle2 } from 'lucide-react';

export default function ItineraryView({ favorites, placesData, onSelectPlace, onSelectCity }) {
  const favoritePlaces = placesData.filter(p => favorites.includes(p.id));

  // State for 3-day itinerary organization
  const [days, setDays] = useState(() => {
    try {
      const saved = localStorage.getItem('travel_itinerary_days');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial distribution
    return [
      { id: 'day-1', title: 'Dia 1 — Chegada & Principais Atrações', places: favoritePlaces.slice(0, 2).map(p => p.id) },
      { id: 'day-2', title: 'Dia 2 — Aventura & Ecoturismo', places: favoritePlaces.slice(2, 4).map(p => p.id) },
      { id: 'day-3', title: 'Dia 3 — Cultura, Gastronomia & Retorno', places: favoritePlaces.slice(4, 6).map(p => p.id) }
    ];
  });

  const saveDays = (newDays) => {
    setDays(newDays);
    localStorage.setItem('travel_itinerary_days', JSON.stringify(newDays));
  };

  const getPlaceById = (id) => placesData.find(p => p.id === id);

  const addPlaceToDay = (dayId, placeId) => {
    const updated = days.map(day => {
      if (day.id === dayId && !day.places.includes(placeId)) {
        return { ...day, places: [...day.places, placeId] };
      }
      return day;
    });
    saveDays(updated);
  };

  const removePlaceFromDay = (dayId, placeId) => {
    const updated = days.map(day => {
      if (day.id === dayId) {
        return { ...day, places: day.places.filter(id => id !== placeId) };
      }
      return day;
    });
    saveDays(updated);
  };

  const movePlaceInDay = (dayId, index, direction) => {
    const dayIndex = days.findIndex(d => d.id === dayId);
    if (dayIndex === -1) return;

    const newPlaces = [...days[dayIndex].places];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newPlaces.length) return;

    const [moved] = newPlaces.splice(index, 1);
    newPlaces.splice(targetIndex, 0, moved);

    const updated = [...days];
    updated[dayIndex] = { ...updated[dayIndex], places: newPlaces };
    saveDays(updated);
  };

  const addNewDay = () => {
    const newDayNum = days.length + 1;
    const newDay = {
      id: `day-${Date.now()}`,
      title: `Dia ${newDayNum} — Roteiro Personalizado`,
      places: []
    };
    saveDays([...days, newDay]);
  };

  const removeDay = (dayId) => {
    if (days.length <= 1) return;
    saveDays(days.filter(d => d.id !== dayId));
  };

  const handleShareWhatsApp = () => {
    let text = "🗺️ *Meu Itinerário de Viagem — Turismo SP*\n\n";
    days.forEach(day => {
      text += `📌 *${day.title}*\n`;
      if (day.places.length === 0) {
        text += `   _(Nenhum local adicionado)_\n`;
      } else {
        day.places.forEach((pid, idx) => {
          const p = getPlaceById(pid);
          if (p) {
            text += `   ${idx + 1}. ${p.title} (${p.city})\n`;
          }
        });
      }
      text += "\n";
    });

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="itinerary-screen">
      <div className="screen-header glass-panel">
        <div>
          <h1 className="screen-title">
            <Calendar size={28} color="var(--primary)" /> Meu Itinerário Personalizado
          </h1>
          <p className="screen-subtitle">
            Organize suas atrações salvas dia a dia, ajuste a sequência do passeio e compartilhe seu roteiro pronto.
          </p>
        </div>

        <div className="screen-header-actions">
          <button className="btn-secondary" onClick={handleShareWhatsApp}>
            <Share2 size={16} /> Compartilhar no WhatsApp
          </button>
          <button className="btn-primary" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir Roteiro
          </button>
        </div>
      </div>

      {favoritePlaces.length === 0 ? (
        <div className="empty-itinerary-card glass-panel">
          <Calendar size={56} color="var(--text-dim)" />
          <h3>Nenhum local salvo no seu roteiro ainda</h3>
          <p>Explore as atrações e clique no ícone ❤️ para adicionar pontos de interesse ao seu roteiro personalizado.</p>
        </div>
      ) : (
        <div className="itinerary-grid">
          {/* Main Days Columns */}
          <div className="itinerary-days-container">
            {days.map((day, dIdx) => (
              <div key={day.id} className="itinerary-day-card glass-panel">
                <div className="day-card-header">
                  <div>
                    <span className="day-badge">Dia {dIdx + 1}</span>
                    <input 
                      type="text" 
                      value={day.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        saveDays(days.map(d => d.id === day.id ? { ...d, title: val } : d));
                      }}
                      className="day-title-input"
                    />
                  </div>
                  {days.length > 1 && (
                    <button className="icon-btn-danger" onClick={() => removeDay(day.id)} title="Excluir este dia">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="day-places-list">
                  {day.places.length === 0 ? (
                    <div className="empty-day-dropzone">
                      <Plus size={24} color="var(--text-dim)" />
                      <span>Arraste ou escolha atrações salvas abaixo</span>
                    </div>
                  ) : (
                    day.places.map((placeId, pIdx) => {
                      const place = getPlaceById(placeId);
                      if (!place) return null;
                      return (
                        <div key={placeId} className="itinerary-place-item">
                          <span className="itinerary-step-number">{pIdx + 1}</span>
                          <img src={place.coverImage} alt={place.title} className="itinerary-item-thumb" onError={(e) => e.target.src = place.backupImage} />
                          <div className="itinerary-item-info">
                            <h4 onClick={() => onSelectPlace(place)} className="itinerary-place-title">
                              {place.title}
                            </h4>
                            <p className="itinerary-place-city" onClick={() => onSelectCity(place.city)}>
                              <MapPin size={12} color="var(--primary)" /> {place.city}
                            </p>
                          </div>
                          
                          <div className="itinerary-item-actions">
                            <button 
                              disabled={pIdx === 0} 
                              onClick={() => movePlaceInDay(day.id, pIdx, -1)}
                              className="order-btn"
                              title="Mover para cima"
                            >
                              <MoveUp size={14} />
                            </button>
                            <button 
                              disabled={pIdx === day.places.length - 1} 
                              onClick={() => movePlaceInDay(day.id, pIdx, 1)}
                              className="order-btn"
                              title="Mover para baixo"
                            >
                              <MoveDown size={14} />
                            </button>
                            <button 
                              onClick={() => removePlaceFromDay(day.id, placeId)}
                              className="remove-btn"
                              title="Remover deste dia"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}

            <button className="add-day-btn" onClick={addNewDay}>
              <Plus size={18} /> Adicionar Mais um Dia de Passeio
            </button>
          </div>

          {/* Sidebar: Available Saved Favorites to Add */}
          <div className="itinerary-sidebar glass-panel">
            <h3 className="sidebar-title">
              <CheckCircle2 size={18} color="var(--primary)" /> Atrações Salvas ({favoritePlaces.length})
            </h3>
            <p className="sidebar-subtitle">Clique no dia desejado para atribuir a atração:</p>

            <div className="available-favorites-list">
              {favoritePlaces.map(place => (
                <div key={place.id} className="sidebar-fav-item">
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={place.coverImage} alt={place.title} className="fav-mini-thumb" onError={(e) => e.target.src = place.backupImage} />
                    <div>
                      <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--text-main)' }}>{place.title}</strong>
                      <small style={{ color: 'var(--text-muted)' }}>📍 {place.city}</small>
                    </div>
                  </div>

                  <div className="add-to-day-dropdown-wrap">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          addPlaceToDay(e.target.value, place.id);
                          e.target.value = '';
                        }
                      }}
                      className="add-to-day-select"
                      defaultValue=""
                    >
                      <option value="" disabled>+ Adicionar ao dia...</option>
                      {days.map((d, i) => (
                        <option key={d.id} value={d.id}>Dia {i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
