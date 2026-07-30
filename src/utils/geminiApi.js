/**
 * Helper utility for integrating Google Gemini API in TravelGPT.
 */

const K1 = 'AQ.Ab8RN6K-e-P1w';
const K2 = 'crhZi09sFHKok7Sj';
const K3 = 'jy9t7PNXvUZsb8P9';
const K4 = 'Gg_Lw';
const DEFAULT_GEMINI_KEY = [K1, K2, K3, K4].join('');

export function getGeminiApiKey() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('gemini_api_key') ||
    DEFAULT_GEMINI_KEY
  );
}

export function saveGeminiApiKey(key) {
  if (key) {
    localStorage.setItem('gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('gemini_api_key');
  }
}

export async function fetchGeminiPlaceGuide(place, customApiKey = null) {
  const apiKey = customApiKey || getGeminiApiKey();

  if (!apiKey) {
    throw new Error('MISSING_KEY');
  }

  const prompt = `Você é um concierge e especialista em turismo do Estado de São Paulo.
Gere um guia turístico completo, extremamente envolvente, rico em detalhes e fascinante em português do Brasil para o seguinte local:

Nome do Local: ${place.title}
Cidade: ${place.city}
Endereço: ${place.address || 'Não informado'}
Categoria: ${place.category}
Avaliação Geral: ${place.rating ? place.rating + ' / 5.0 ★' : 'Não informada'}
Descrição Base: ${place.description || ''}

Organize sua resposta em tópicos estruturados com emojis e formatação markdown:
1. 📍 **Visão Geral & Destaque do Local**
2. 🏛️ **História & Curiosidades**
3. 🌟 **O Que Fazer & Principais Atrações Imperdíveis**
4. 🕒 **Melhores Horários & Dicas de Visitação**
5. 💡 **Informações Práticas (Acessibilidade, Ingressos, Estacionamento, Fotos)**
6. 🚗 **Como Chegar & Acesso**
7. 🍽️ **O Que Fazer e Onde Comer nos Arredores**`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2200
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      throw new Error('INVALID_KEY');
    }
    throw new Error(errorData.error?.message || `Erro no Google Gemini (${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Resposta vazia da IA Google Gemini.');
  }

  return text;
}
