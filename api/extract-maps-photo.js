export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, lat, lng, place_id } = req.query;

  let targetUrl = url;
  let targetPlaceId = place_id;

  if (targetUrl) {
    try {
      const parsedUrl = new URL(targetUrl);
      if (!targetPlaceId) {
        targetPlaceId = parsedUrl.searchParams.get('query_place_id') || parsedUrl.searchParams.get('place_id');
      }
    } catch (e) {
      const match = targetUrl.match(/query_place_id=([a-zA-Z0-9_-]+)/);
      if (match) targetPlaceId = match[1];
    }
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

  // 1. Tentar via Google Places API se houver chave e Place ID
  if (apiKey && targetPlaceId) {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${targetPlaceId}&fields=photos&key=${apiKey}`;
      const response = await fetch(detailsUrl);
      const data = await response.json();
      if (data.result && data.result.photos && data.result.photos.length > 0) {
        const photoRef = data.result.photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`;
        return res.redirect(302, photoUrl);
      }
    } catch (err) {
      console.warn('Erro ao buscar via Google Places API:', err);
    }
  }

  // 2. Tentar via Street View Static API se houver chave e lat/lng
  if (apiKey && lat && lng) {
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&key=${apiKey}`;
    return res.redirect(302, streetViewUrl);
  }

  // 3. Tentar fazer scraping server-side da meta tag og:image da página do Google Maps
  if (targetUrl) {
    try {
      const pageRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      const html = await pageRes.text();

      // Procurar og:image ou imagens do Google Maps/Street View no HTML
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
      
      if (ogMatch && ogMatch[1] && !ogMatch[1].includes('staticmap')) {
        return res.redirect(302, ogMatch[1]);
      }

      // Procurar URLs diretas de foto do Googlelh5 / googleusercontent
      const photoMatch = html.match(/(https:\/\/[a-z0-9-]+\.googleusercontent\.com\/p\/[a-zA-Z0-9_-]+=s\d+)/i) ||
                         html.match(/(https:\/\/lh\d+\.googleusercontent\.com\/proxy\/[a-zA-Z0-9_-]+)/i);

      if (photoMatch && photoMatch[1]) {
        return res.redirect(302, photoMatch[1]);
      }
    } catch (err) {
      console.warn('Erro ao fazer scraping da googleMapsUrl:', err);
    }
  }

  // 4. Se não encontrar nenhuma foto, retorna 404 para disparar o onError do frontend
  return res.status(404).json({ error: 'Image not found for specified googleMapsUrl' });
}
