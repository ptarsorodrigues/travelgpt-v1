import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/places.json');
const places = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Curated high-resolution Unsplash image pools for topics
const IMAGE_POOLS = {
  waterpark: [
    'https://images.unsplash.com/photo-1582650625119-3a31f8418b0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
  ],
  park: [
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511497584788-876761c119ef?auto=format&fit=crop&w=1200&q=80'
  ],
  zoo: [
    'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564349683136-77e08dba1ef9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574063413132-355dbfd83e44?auto=format&fit=crop&w=1200&q=80'
  ],
  waterfall: [
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80'
  ],
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=1200&q=80'
  ],
  train: [
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515165562839-978bbcf1b267?auto=format&fit=crop&w=1200&q=80'
  ],
  museum: [
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80'
  ],
  viewpoint: [
    'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
  ],
  fun: [
    'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
  ],
  ice: [
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'
  ],
  aquarium: [
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1200&q=80'
  ],
  butterfly: [
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=1200&q=80'
  ],
  observatory: [
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  ],
  cablecar: [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80'
  ]
};

function getImagesForPlace(place, idx) {
  const t = (place.title || '').toLowerCase();
  const c = (place.category || '').toLowerCase();

  let categoryKey = 'park';

  if (t.includes('thermas') || t.includes('piscina') || t.includes('toboagua') || t.includes('tomboágua') || t.includes('kamikaze') || t.includes('saci') || t.includes('splash') || t.includes('aquática') || t.includes('solazer')) {
    categoryKey = 'waterpark';
  } else if (t.includes('zoo') || t.includes('fazendinha') || t.includes('zoobotânico')) {
    categoryKey = 'zoo';
  } else if (t.includes('cachoeira') || t.includes('corredeira')) {
    categoryKey = 'waterfall';
  } else if (t.includes('prainha') || t.includes('praia') || t.includes('balneário')) {
    categoryKey = 'beach';
  } else if (t.includes('trem') || t.includes('trenzinho') || t.includes('estação') || t.includes('maria fumaça') || t.includes('ferroviário')) {
    categoryKey = 'train';
  } else if (t.includes('museu') || t.includes('marp') || t.includes('pateo') || t.includes('caixa cultural') || c.includes('museu')) {
    categoryKey = 'museum';
  } else if (t.includes('mirante') || t.includes('cristo') || t.includes('sky') || t.includes('pico')) {
    categoryKey = 'viewpoint';
  } else if (t.includes('ice bar')) {
    categoryKey = 'ice';
  } else if (t.includes('aquário')) {
    categoryKey = 'aquarium';
  } else if (t.includes('borboletário')) {
    categoryKey = 'butterfly';
  } else if (t.includes('observatório')) {
    categoryKey = 'observatory';
  } else if (t.includes('teleférico')) {
    categoryKey = 'cablecar';
  } else if (t.includes('brinquedos') || t.includes('park') || t.includes('arena') || t.includes('fantasia') || t.includes('recreação')) {
    categoryKey = 'fun';
  }

  const pool = IMAGE_POOLS[categoryKey] || IMAGE_POOLS.park;
  const cover = pool[idx % pool.length];
  const backup = pool[(idx + 1) % pool.length];

  return { cover, backup };
}

let countUpdated = 0;
const updatedPlaces = places.map((place, idx) => {
  if (!place.coverImage || place.coverImage.includes('googleusercontent.com/d/')) {
    const { cover, backup } = getImagesForPlace(place, idx);
    countUpdated++;
    return {
      ...place,
      coverImage: cover,
      backupImage: backup
    };
  }
  return place;
});

fs.writeFileSync(jsonPath, JSON.stringify(updatedPlaces, null, 2), 'utf8');
console.log(`✅ Atualizados ${countUpdated} lugares em places.json com fotos reais e funcionais do Unsplash!`);
