/**
 * Helper utility for determining real ticket prices, free entry, and price tiers for TravelGPT places.
 */
export function getPlacePriceTag(place) {
  if (!place) return 'Gratuito';

  // 1. Explicit ticket/price properties on place object
  if (place.ticketInfo && place.ticketInfo.trim() && !place.ticketInfo.includes('Guia IA')) {
    return place.ticketInfo;
  }
  if (place.price && place.price.trim() && !place.price.includes('Guia IA')) {
    return place.price;
  }

  const title = (place.title || '').toLowerCase();
  const cat = (place.category || '').toLowerCase();
  const orig = (place.originalCategory || '').toLowerCase();
  const desc = (place.description || '').toLowerCase();

  // 2. Specific Known Attractions with Estimated Prices
  if (/sampa sky/.test(title)) return 'A partir de R$ 40';
  if (/roda rico/.test(title)) return 'A partir de R$ 50';
  if (/solazer/.test(title)) return 'A partir de R$ 50';
  if (/hop hari/.test(title)) return 'A partir de R$ 110';
  if (/wet.*wild/.test(title)) return 'A partir de R$ 99';
  if (/aquário de são paulo|aquario de sao paulo/.test(title)) return 'A partir de R$ 60';
  if (/zoo|zoológico/.test(title)) return 'A partir de R$ 35';
  if (/masp/.test(title)) return 'R$ 60 (Grátis terças)';
  if (/catavento/.test(title)) return 'R$ 18 (Grátis terças)';
  if (/pinacoteca/.test(title)) return 'R$ 30 (Grátis sábados)';
  if (/museu do futebol/.test(title)) return 'R$ 20 (Grátis terças)';

  // 3. Paid Categories / Keywords
  if (/aquático|aquatico|thermas|diversões|diversoes|park|kart|escape|resort|zoológico|zoologico|aquário|aquario|cinema|teatro|playcenter|boliche/.test(title + ' ' + cat)) {
    return 'Atração Paga';
  }

  // 4. Free Categories / Keywords (Public Parks, Plazas, Historic Streets, Plazas, Lookouts, Beaches, Waterfalls, Free Public Spaces)
  if (/praça|praca|parque|ladeira|avenida|rua|calçadão|mirante|cachoeira|bosque|horto|orla|prainha|viaduto|ponte|estação|monumento|lazer|praia/.test(title + ' ' + cat + ' ' + orig + ' ' + desc)) {
    return 'Gratuito';
  }

  if (/áreas de lazer, praças & parques|cachoeiras, prainhas & mirantes/.test(cat)) {
    return 'Gratuito';
  }

  // Default fallback for public tourism spots
  return 'Gratuito';
}
