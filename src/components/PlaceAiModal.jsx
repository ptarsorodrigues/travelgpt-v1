import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Loader2, RefreshCw, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { getGroqApiKey, saveGroqApiKey, fetchGroqPlaceGuide } from '../utils/groqApi';

export default function PlaceAiModal({ place, onClose, onSelectCity }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [currentKey, setCurrentKey] = useState(getGroqApiKey());
  const [isLoading, setIsLoading] = useState(false);
  const [guideText, setGuideText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (place && currentKey) {
      loadAiGuide(currentKey);
    }
  }, [place, currentKey]);

  const loadAiGuide = async (keyToUse) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const guide = await fetchGroqPlaceGuide(place, keyToUse);
      setGuideText(guide);
    } catch (err) {
      if (err.message === 'MISSING_KEY') {
        setErrorMsg('Por favor, informe sua Chave de API do Groq abaixo para utilizar a Inteligência Artificial.');
      } else if (err.message === 'INVALID_KEY') {
        setErrorMsg('Chave de API do Groq inválida ou expirada (401 Unauthorized). Verifique a chave informada.');
      } else {
        setErrorMsg(`Erro ao consultar a IA Groq: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    const cleanKey = apiKeyInput.trim();
    saveGroqApiKey(cleanKey);
    setCurrentKey(cleanKey);
    setApiKeyInput('');
    loadAiGuide(cleanKey);
  };

  if (!place) return null;

  // Simple Markdown Formatter Helper for rendering headers, bold text and lists nicely
  const renderFormattedMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} style={{ height: '8px' }} />;

      // Header lines (### or ## or 1. 🌟)
      if (trimmed.startsWith('#') || /^\d+\.\s+[^\w]*\*\*/.test(trimmed) || /^[🏛️🌟🕒💡🍽️]/.test(trimmed)) {
        const cleanHeader = trimmed.replace(/^#+\s*/, '');
        return (
          <h3 
            key={index} 
            style={{ 
              fontSize: '1.1rem', 
              fontFamily: 'var(--font-heading)', 
              color: 'var(--primary)', 
              marginTop: '1.25rem', 
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {cleanHeader.replace(/\*\*/g, '')}
          </h3>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <li key={index} style={{ marginLeft: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
            {parseBoldText(content)}
          </li>
        );
      }

      return (
        <p key={index} style={{ marginBottom: '0.6rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  const parseBoldText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--accent-gold)' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 184, 0, 0.15)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="var(--accent-gold)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--text-main)' }}>
                Guia Inteligente — {place.title}
              </h2>
              <small style={{ color: 'var(--text-muted)' }}>Gerado em tempo real pela IA Groq</small>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '1.25rem 0', overflowY: 'auto', flex: 1 }}>
          {/* Missing API Key Warning / Input */}
          {(!currentKey || errorMsg?.includes('Chave')) && (
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', color: 'var(--accent-gold)' }}>
                <Key size={18} />
                <strong style={{ fontSize: '0.98rem' }}>Informe sua Chave de API do Groq</strong>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Para que a IA gere a descrição completa e personalizada deste local, cole abaixo sua chave de API Groq (formato <code>gsk_...</code>). A chave será salva de forma segura apenas no seu navegador.
              </p>

              <form onSubmit={handleSaveKey} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input 
                  type="password"
                  placeholder="Cole sua API Key do Groq aqui (gsk_...)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-glass, rgba(15, 23, 42, 0.8))',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
                <button 
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px' }}
                >
                  Salvar Chave & Gerar
                </button>
              </form>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Loader2 size={36} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <h4 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Consultando a IA Groq...</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                Elaborando um guia turístico exclusivo sobre <strong>{place.title}</strong> em {place.city}.
              </p>
            </div>
          )}

          {/* Error Message */}
          {!isLoading && errorMsg && currentKey && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #EF4444', borderRadius: '12px', padding: '1.25rem', color: '#EF4444', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} />
                <strong>Atenção</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{errorMsg}</p>
            </div>
          )}

          {/* Rendered AI Guide Text */}
          {!isLoading && guideText && (
            <div className="ai-guide-rendered-box" style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
              {renderFormattedMarkdown(guideText)}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {currentKey && !isLoading && (
            <button 
              type="button"
              className="mini-clear-btn"
              onClick={() => loadAiGuide(currentKey)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} /> Regerar Resposta
            </button>
          )}

          <button 
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{ marginLeft: 'auto', padding: '0.55rem 1.5rem', borderRadius: '8px' }}
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}
