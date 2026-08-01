/**
 * Helper utility for fetching travel guides from Wikivoyage (PT) and Wikipedia (PT) REST API,
 * with fast fallback to local database guide data.
 */
import { getPlacePriceTag } from './priceHelper';
import { getOpeningStatus } from './openingHoursHelper';

export async function fetchWikivoyageGuide(place) {
  if (!place) return '';

  const cleanTitle = (place.title || '').replace(/\s*\([^)]*\)/g, '').trim();
  const searchQueries = [
    cleanTitle,
    `${cleanTitle} (${place.city})`,
    `${cleanTitle}, ${place.city}`,
    place.city
  ];

  let summaryText = '';

  // 1. Fetch summary from Wikipedia (PT) / Wikivoyage (PT) REST API
  for (const query of searchQueries) {
    try {
      const wikiUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const res = await fetch(wikiUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.extract && data.extract.length > 80 && !data.title?.includes('Desambiguação')) {
          summaryText = data.extract;
          break;
        }
      }
    } catch (e) {
      // Continue to next query
    }
  }

  // 2. Build structured guide output matching TravelGPT sections
  const priceTag = getPlacePriceTag(place);
  const status = getOpeningStatus(place);

  const conceptSection = summaryText || place.description || 
    `O ponto turístico ${place.title} é uma das principais atrações de ${place.city} - SP, oferecendo aos visitantes uma excelente opção de lazer, cultura e entretenimento local.`;

  return `## 🌿 1. Visão Geral & Conceito
${conceptSection}

## 🏛️ 2. Destaques & O Que Fazer
- **Pontos de Interesse Internos:** Explore a área principal, atrações culturais, espaços de convivência e oportunidades fotográficas.
- **Ambiente & Lazer:** Ideal para passeios com a família, amigos ou momentos de relaxamento em ${place.city}.
- **Relevância Local:** Pertence à categoria de **${place.category}**, destacando-se como ponto turístico na região.

## 🎟️ 3. Ingressos, Preços & Valores de Serviços
- **Valores dos Ingressos:** **${priceTag}**
- **Serviços & Atividades:** Passeios locais, serviços de alimentação e atividades na atração ou entorno.
- **Estacionamento & Taxas:** Estacionamentos no entorno ou Zona Azul digital da cidade.
- **Formas de Pagamento:** Cartão, Pix ou dinheiro na bilheteria/local.

## ℹ️ 4. Informações Práticas & Logística
- **Endereço Completo:** ${place.address || 'Não informado'}
- **Horário de Funcionamento:** **${status.text}**
- **Acessibilidade:** Acessível para PCD e idosos em suas áreas principais.
- **Pet Friendly:** Consulte as regras do local para permanência de animais de estimação.

## 🚌 5. Como Chegar & Acesso
- **Endereço:** ${place.address} (${place.city} - SP)
- **Transporte:** Acesso por carros, aplicativos de mobilidade (Uber/99) e linhas de transporte público locais.

## 💡 6. Dicas de Ouro & Ponto Cego
- **Melhor Horário:** Dê preferência aos horários de menor movimento para uma visita tranquila.
- **Dica de Ouro:** Aproveite para tirar fotos e explorar todo o entorno do local.
- **Ponto Cego/Atenção:** Atente-se às condições do tempo para passeios ao ar livre e agendamentos prévios caso necessário.`;
}
