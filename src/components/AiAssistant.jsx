import React, { useState } from 'react';
import { Sparkles, Compass, MapPin, Calendar, Heart, Eye, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export default function AiAssistant({ placesData, onSelectPlace, onSelectCity, toggleFavorite, isFavorite }) {
  const [style, setStyle] = useState('Parques Aquáticos & Família');
  const [duration, setDuration] = useState('2 dias');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);

  const travelStyles = [
    { name: 'Parques Aquáticos & Família', icon: '🏊‍♂️', desc: 'Diversão, piscinas térmicas, resorts e parques de diversão.' },
    { name: 'Ecoturismo & Natureza', icon: '🌿', desc: 'Cachoeiras, trilhas ecológicas, bosques e mirantes panorâmicos.' },
    { name: 'Cultura & Museus', icon: '🏛️', desc: 'Museus históricos, centros culturais e patrimônios arquitetônicos.' },
    { name: 'Aventura & Lazer', icon: '🧗‍♂️', desc: 'Esportes radicais, tirolesas, parques de lazer ao ar livre.' }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedItinerary(null);

    setTimeout(() => {
      // Filter candidates based on criteria
      let pool = placesData.filter(p => {
        if (selectedCity !== 'Todas' && p.city !== selectedCity) return false;
        return true;
      });

      if (pool.length < 3) {
        pool = placesData; // fallback
      }

      // Shuffle and pick 4-6 recommended places
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, duration === '1 dia' ? 3 : duration === '2 dias' ? 5 : 7);

      setGeneratedItinerary({
        title: `Roteiro Inteligente — ${style} em ${selectedCity === 'Todas' ? 'SP' : selectedCity}`,
        duration,
        places: selected,
        tip: "Dica do TravelGPT: Reserve os ingressos com antecedência nos finais de semana e leve protetor solar e calçados confortáveis."
      });

      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="ai-assistant-screen">
      <div className="screen-header glass-panel">
        <div>
          <h1 className="screen-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={28} color="var(--accent-gold)" /> TravelGPT Concierge de Viagem
          </h1>
          <p className="screen-subtitle">
            Gere roteiros sob medida combinando inteligência artificial e o banco de dados oficial de pontos turísticos de SP.
          </p>
        </div>
      </div>

      <div className="ai-planner-card glass-panel">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
          Configure suas preferências de viagem:
        </h3>

        {/* Style selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
            1. Qual é o estilo do seu passeio?
          </label>
          <div className="ai-styles-grid">
            {travelStyles.map(s => (
              <div 
                key={s.name}
                className={`ai-style-box ${style === s.name ? 'active' : ''}`}
                onClick={() => setStyle(s.name)}
              >
                <span style={{ fontSize: '1.75rem', marginBottom: '0.4rem', display: 'block' }}>{s.icon}</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>{s.name}</strong>
                <small style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.desc}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Options Row */}
        <div className="ai-options-row">
          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              2. Duração da Viagem:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['1 dia', '2 dias', '3 dias', '5 dias'].map(d => (
                <button
                  key={d}
                  className={`btn-pill-option ${duration === d ? 'active' : ''}`}
                  onClick={() => setDuration(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              3. Destino / Cidade Preferida:
            </label>
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="city-select"
            >
              <option value="Todas">🏙️ Todas as Cidades de SP</option>
              {Array.from(new Set(placesData.map(p => p.city))).sort().map(c => (
                <option key={c} value={c}>📍 {c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '30px' }}
          >
            <Sparkles size={20} />
            <span>{isGenerating ? 'Criando Roteiro com IA...' : 'Gerar Roteiro Personalizado com IA'}</span>
          </button>
        </div>
      </div>

      {/* Generated Result Output */}
      {generatedItinerary && (
        <div className="generated-itinerary-card glass-panel" style={{ marginTop: '2rem' }}>
          <div className="result-header">
            <div>
              <span className="badge-featured" style={{ margin: 0 }}>
                <Zap size={14} /> Recomendação TravelGPT AI
              </span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginTop: '0.5rem', color: 'var(--text-main)' }}>
                {generatedItinerary.title}
              </h2>
            </div>
            <span style={{ background: 'rgba(0,212,178,0.15)', color: 'var(--primary)', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
              {generatedItinerary.duration} de roteiro
            </span>
          </div>

          <div style={{ background: 'rgba(255, 184, 0, 0.1)', border: '1px solid var(--accent-gold)', borderRadius: 'var(--radius-md)', padding: '1rem', margin: '1.25rem 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>
            💡 <strong>💡 Dica do Assistente:</strong> {generatedItinerary.tip}
          </div>

          <h3 style={{ fontSize: '1.1rem', margin: '1.5rem 0 1rem 0', color: 'var(--text-main)' }}>
            Sequência Recomendada de Paradas ({generatedItinerary.places.length} atrações):
          </h3>

          <div className="places-grid">
            {generatedItinerary.places.map((place, idx) => (
              <div key={place.id} className="ai-place-card glass-panel">
                <div style={{ position: 'relative' }}>
                  <img src={place.coverImage} alt={place.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }} onError={(e) => e.target.src = place.backupImage} />
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--primary)', color: '#000', fontWeight: 800, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    #{idx + 1}
                  </span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: uppercase }}>
                    {place.category}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', margin: '4px 0', color: 'var(--text-main)' }}>{place.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>📍 {place.city}</p>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="details-btn" style={{ flex: 1 }} onClick={() => onSelectPlace(place)}>
                      <Eye size={14} /> Detalhes
                    </button>
                    <button 
                      className={`fav-btn-icon ${isFavorite(place.id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(place.id)}
                      style={{ position: 'static', width: '36px', height: '36px' }}
                    >
                      <Heart size={16} fill={isFavorite(place.id) ? "#FFF" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
