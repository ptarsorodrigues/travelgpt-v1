/**
 * Helper utility for integrating Groq AI API in TravelGPT.
 */

export function getGroqApiKey() {
  return (
    import.meta.env.VITE_GROQ_API_KEY ||
    localStorage.getItem('groq_api_key') ||
    ''
  );
}

export function saveGroqApiKey(key) {
  if (key) {
    localStorage.setItem('groq_api_key', key.trim());
  } else {
    localStorage.removeItem('groq_api_key');
  }
}

export async function fetchGroqPlaceGuide(place, customApiKey = null) {
  const apiKey = customApiKey || getGroqApiKey();
  
  if (!apiKey) {
    throw new Error('MISSING_KEY');
  }

  const prompt = `Gere um guia turístico completo, envolvente e detalhado em português do Brasil para o seguinte ponto de interesse em São Paulo:

Nome do Local: ${place.title}
Cidade: ${place.city}
Endereço: ${place.address || 'Não informado'}
Categoria: ${place.category}
Avaliação Geral: ${place.rating ? place.rating + ' / 5.0 ★' : 'Não informada'}
Descrição Base: ${place.description || ''}

Organize sua resposta em tópicos claros usando emojis e formatação markdown:
1. 🏛️ **Visão Geral & História**: Origem e relevância cultural/turística do local.
2. 🌟 **O que Fazer e Principais Destaques**: Atividades imperdíveis no local.
3. 🕒 **Melhores Horários & Dicas de Visitação**: Dicas para aproveitar melhor o passeio.
4. 💡 **Informações Práticas**: Dicas de vestuário, fotos, acessibilidade e estacionamento.
5. 🍽️ **O que fazer nos Arredores**: Sugestões complementares na região.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um concierge sênior de turismo especialista no Estado de São Paulo. Suas respostas são extremamente ricas, prestativas, bem formatadas e inspiradoras.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('INVALID_KEY');
    }
    throw new Error(errorData.error?.message || `Erro no servidor Groq (${response.status})`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Resposta vazia da IA Groq.');
  }

  return content;
}
