import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Loader2, MapPin, AlertTriangle, Cpu } from 'lucide-react';
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

  // Custom High-Contrast Markdown Renderer following App Design System
  const renderFormattedMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} style={{ height: '8px' }} />;

      // Convert raw markdown dividers (---) into subtle clean <hr /> lines
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        return <hr key={index} className="ai-modal-hr" />;
      }

      // Section Headers (## 1. Visão Geral & Conceito, ## 2. Destaques, etc.)
      if (trimmed.startsWith('#') || /^##?\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        const cleanHeader = trimmed.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '');
        return (
          <div key={index} className="ai-modal-section-header">
            <Sparkles size={18} color="var(--primary)" />
            <h3>{cleanHeader.replace(/\*\*/g, '')}</h3>
          </div>
        );
      }

      // Special Callout for "Ponto Cego / Atenção" or "Dica de Ouro"
      if (trimmed.toLowerCase().includes('ponto cego') || trimmed.toLowerCase().includes('atenção')) {
        return (
          <div key={index} className="ai-modal-warning-box">
            <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{parseBoldText(trimmed)}</div>
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <div key={index} className="ai-modal-bullet-row">
            <span className="ai-bullet-dot">•</span>
            <div className="ai-bullet-content">{parseBoldText(content)}</div>
          </div>
        );
      }

      // Regular Paragraphs
      return (
        <p key={index} className="ai-modal-paragraph">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  const parseBoldText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="ai-bold-highlight">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content place-ai-modal-container glass-panel animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Header */}
        <div className="place-ai-modal-header">
          <div className="place-ai-header-left">
            <div className="place-ai-icon-badge">
              <Sparkles size={22} color="#0B0F19" />
            </div>
            <div>
              <h2 className="place-ai-modal-title">
                {place.title}
              </h2>
              <div className="place-ai-city-line">
                <MapPin size={12} color="var(--primary)" />
                <span>{place.city}</span>
              </div>
              <div className="place-ai-tag-line">
                Guia TravelGPT by Gemini IA
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Fechar Janela">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="place-ai-modal-body">
          {/* Missing API Key Warning / Input */}
          {(!currentKey || errorMsg?.includes('Chave')) && (
            <div className="place-ai-key-box">
              <div className="place-ai-key-title">
                <Key size={18} color="var(--accent-gold)" />
                <span>Informe sua Chave de API do Google Gemini</span>
              </div>
              <p className="place-ai-key-desc">
                Para ativarmos a IA do Google Gemini, informe abaixo sua chave de API (formato <code>AIzaSy...</code>). A chave fica salva de forma 100% segura apenas no seu navegador.
              </p>

              <form onSubmit={handleSaveKey} className="place-ai-key-form">
                <input 
                  type="password"
                  placeholder="Cole sua API Key do Google Gemini aqui (AIzaSy...)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="place-ai-key-input"
                />
                <button type="submit" className="btn-primary">
                  Salvar Chave & Gerar
                </button>
              </form>
            </div>
          )}

          {/* Loading State with Animated Progress Bar */}
          {isLoading && (
            <div className="place-ai-loading-box">
              <Loader2 size={42} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <h4>Gerando Análise Completa & Curadoria...</h4>
              <div className="ai-progress-bar-wrap">
                <div className="ai-progress-bar-fill" />
              </div>
              <span className="ai-progress-text">Aguarde cerca de 10 segundos.</span>
            </div>
          )}

          {/* Error Message */}
          {!isLoading && errorMsg && currentKey && (
            <div className="place-ai-error-box">
              <AlertTriangle size={20} />
              <div>
                <strong>Atenção</strong>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Rendered AI Guide Text */}
          {!isLoading && guideText && (
            <div className="ai-guide-rendered-box">
              {renderFormattedMarkdown(guideText)}
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="place-ai-modal-footer">
          <button 
            type="button"
            className="btn-primary place-ai-close-btn"
            onClick={onClose}
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}
