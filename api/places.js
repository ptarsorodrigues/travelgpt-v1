import pg from 'pg';

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;

let pool;
if (connectionString) {
  const { Pool } = pg;
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!pool) {
    return res.status(500).json({ 
      error: 'Database connection URL not configured.',
      message: 'Defina a variável POSTGRES_URL no painel da Vercel.' 
    });
  }

  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          p.id,
          p.title,
          p.original_category AS category,
          p.original_category AS "originalCategory",
          c.name AS "mainCategory",
          c.description AS "categoryDescription",
          p.category_id AS "categoryId",
          ci.name AS city,
          p.address,
          p.phone,
          p.email,
          p.google_maps_url AS "googleMapsUrl",
          p.latitude::float AS lat,
          p.longitude::float AS lng,
          p.tier,
          p.is_featured AS "isFeatured",
          p.cover_image_url AS "coverImage",
          p.backup_image_url AS "backupImage",
          p.description,
          p.rating::float AS rating
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN cities ci ON p.city_id = ci.id
        ORDER BY p.is_featured DESC, p.title ASC;
      `;

      const result = await client.query(query);
      return res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ error: 'Erro ao consultar o banco de dados Postgres na Vercel.', details: error.message });
  }
}
