import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Loader2, RefreshCw, MapPin, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey, fetchGeminiPlaceGuide } from '../utils/geminiApi';

export default function PlaceAiModal({ place, onClose, onSelectCity }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [currentKey, setCurrentKey] = useState(getGeminiApiKey());
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
      const guide = await fetchGeminiPlaceGuide(place, keyToUse);
      setGuideText(guide);
    } catch (err) {
      if (err.message === 'MISSING_KEY') {
        setErrorMsg('Por favor, informe sua Chave de API do Google Gemini abaixo para ativar a IA.');
      } else if (err.message === 'INVALID_KEY') {
        setErrorMsg('Chave de API do Google Gemini inválida ou não autorizada. Verifique a chave informada.');
      } else {
        setErrorMsg(`Erro ao consultar o Google Gemini: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    const cleanKey = apiKeyInput.trim();
    saveGeminiApiKey(cleanKey);
    setCurrentKey(cleanKey);
    setApiKeyInput('');
    loadAiGuide(cleanKey);
  };

  if (!place) return null;

  // Rich Markdown Formatter Helper for headers, bold, lists, and line breaks
  const renderFormattedMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} style={{ height: '8px' }} />;

      // Header lines (#, ##, ###, 1. 📍)
      if (trimmed.startsWith('#') || /^\d+\.\s+[^\w]*\*\*/.test(trimmed) || /^[📍🏛️🌟🕒💡🚗🍽️🌿📜🌳🦜]/.test(trimmed)) {
        const cleanHeader = trimmed.replace(/^#+\s*/, '');
        return (
          <h3 
            key={index} 
            style={{ 
              fontSize: '1.12rem', 
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
          <li key={index} style={{ marginLeft: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-main)', lineHeight: '1.65' }}>
            {parseBoldText(content)}
          </li>
        );
      }

      return (
        <p key={index} style={{ marginBottom: '0.65rem', lineHeight: '1.65', color: 'var(--text-main)' }}>
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
        style={{ maxWidth: '720px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.2) 0%, rgba(219, 68, 85, 0.2) 50%, rgba(244, 180, 0, 0.2) 100%)', border: '1px solid rgba(66, 133, 244, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="var(--accent-gold)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--text-main)' }}>
                Guia Turístico — {place.title}
              </h2>
              <small style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Cpu size={13} color="var(--primary)" /> Gerado em tempo real via <strong>Google Gemini IA</strong>
              </small>
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
                <strong style={{ fontSize: '0.98rem' }}>Informe sua Chave de API do Google Gemini</strong>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Para ativarmos a IA do Google Gemini, informe abaixo sua chave de API (formato <code>AIzaSy...</code>). A chave fica salva de forma 100% segura apenas no seu navegador.
              </p>

              <form onSubmit={handleSaveKey} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input 
                  type="password"
                  placeholder="Cole sua API Key do Google Gemini aqui (AIzaSy...)"
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
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Loader2 size={38} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <h4 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Gerando Guia Completo via Google Gemini IA...</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
                Processando informações históricas, dicas e atrações para <strong>{place.title}</strong> em {place.city}.
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
            <div className="ai-guide-rendered-box" style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.5rem' }}>
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
              <RefreshCw size={14} /> Regerar Guia (Google Gemini)
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
