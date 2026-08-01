import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Loader2, MapPin, AlertTriangle, Cpu, Ticket } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey, fetchGeminiPlaceGuide } from '../utils/geminiApi';
import { fetchWikivoyageGuide } from '../utils/wikivoyageApi';

export default function PlaceAiModal({ place, onClose, onSelectCity }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [currentKey, setCurrentKey] = useState(getGeminiApiKey());
  const [isLoading, setIsLoading] = useState(false);
  const [guideText, setGuideText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (place) {
      loadAiGuide(currentKey);
    }
  }, [place]);

  const loadAiGuide = async (keyToUse) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch instant guide from Wikivoyage & Wikipedia (PT) + Place Data
      const wikiGuide = await fetchWikivoyageGuide(place);
      if (wikiGuide) {
        setGuideText(wikiGuide);
      } else {
        // Fallback to Gemini if available
        const guide = await fetchGeminiPlaceGuide(place, keyToUse);
        setGuideText(guide);
      }
    } catch (err) {
      try {
        const guide = await fetchGeminiPlaceGuide(place, keyToUse);
        setGuideText(guide);
      } catch (geminiErr) {
        setErrorMsg('Não foi possível carregar as informações do guia no momento.');
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

      // Section Headers (## 1. Visão Geral & Conceito, ## 3. Ingressos, Preços & Valores, etc.)
      if (trimmed.startsWith('#') || /^##?\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        const cleanHeader = trimmed.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '');
        const isTicketHeader = /ingresso|preço|valor|serviço/i.test(cleanHeader);
        return (
          <div key={index} className={`ai-modal-section-header ${isTicketHeader ? 'ticket-section-header' : ''}`}>
            {isTicketHeader ? (
              <Ticket size={20} color="var(--accent-gold)" />
            ) : (
              <Sparkles size={18} color="var(--primary)" />
            )}
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
                Guia Turístico TravelGPT
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Fechar Janela">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="place-ai-modal-body">
          {/* Loading State with Animated Progress Bar */}
          {isLoading && (
            <div className="place-ai-loading-box">
              <Loader2 size={42} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <h4>Carregando Guia Turístico & Curadoria...</h4>
              <div className="ai-progress-bar-wrap">
                <div className="ai-progress-bar-fill" />
              </div>
              <span className="ai-progress-text">Carregando informações do guia...</span>
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
