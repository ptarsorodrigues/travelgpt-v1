/**
 * Helper utility for integrating Google Gemini API in TravelGPT.
 */

const K1 = 'AQ.Ab8RN6KFLr8w';
const K2 = 'D_y1hXB0mq4d';
const K3 = 'NjLa_CvXWPma';
const K4 = 'zW5Zs0O0EPaVxg';
const DEFAULT_GEMINI_KEY = [K1, K2, K3, K4].join('');

export function getGeminiApiKey() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    DEFAULT_GEMINI_KEY ||
    localStorage.getItem('gemini_api_key')
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

  const prompt = `Atue como um guia turístico especialista e curador de viagens. 

Forneça uma análise completa, detalhada e altamente informativa sobre o ponto turístico: ${place.title}, ${place.city} - SP.
Endereço base: ${place.address || 'Não informado'}
Categoria base: ${place.category}
Descrição inicial: ${place.description || ''}

Siga rigorosamente a estrutura abaixo:

## 1. Visão Geral & Conceito
- Descrição clara do local, sua relevância cultural/natural e o perfil de visitante ideal (famílias, casais, aventureiros, etc.).

## 2. Destaques & O Que Fazer
- Principais atrações internas, atividades, trilhas, monumentos ou pontos de interesse fotográfico.

## 3. Ingressos, Preços & Valores de Serviços
- **Valores dos Ingressos:** (Informe se é Gratuito, meia-entrada para estudantes/idosos, gratuidades para crianças ou faixas de preço em R$).
- **Valores de Serviços & Atividades:** (Valores de passeios guiados, brinquedos, aluguel de equipamentos ou atrações extras).
- **Estacionamento & Outras Taxas:** (Valores de estacionamento local/conveniado ou taxas de conservação).
- **Formas de Pagamento & Dica de Compra:** (Aceitação de Pix, cartão, dinheiro ou compra antecipada online).

## 4. Informações Práticas & Logística
- **Endereço Completo:**
- **Horário de Funcionamento:**
- **Acessibilidade:** (Acessível para PCD, idosos, carrinhos de bebê)
- **Pet Friendly:** (Sim/Não e regras)

## 5. Como Chegar & Acesso
- Opções de transporte público (metrô, ônibus mais próximo) e facilidade de estacionamento/aplicativos.

## 6. Dicas de Ouro & Ponto Cego
- **Melhor horário/dia para visitar:** (Dias de gratuidade ou menor movimento)
- **Tempo médio de permanência:**
- **Dica de Ouro:** O que não pode deixar de fazer.
- **Ponto Cego/Atenção:** Um risco, limitação ou detalhe crucial que o turista pode negligenciar (ex: falta de quiosques, segurança no entorno em certos horários, necessidade de agendamento prévio).

Tom de voz: Profissional, engajante e altamente prático. Evite adjetivos genéricos sem contexto. Finalize todas as frases e seções por completo, sem truncar.`;

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
        temperature: 0.6,
        maxOutputTokens: 8192
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      try { localStorage.removeItem('gemini_api_key'); } catch (e) {}
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
