import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local or .env
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error("❌ ERRO: Nenhuma variável de conexão encontrada (POSTGRES_URL ou DATABASE_URL).");
  console.error("Por favor, adicione a URL de conexão do PostgreSQL no arquivo .env.local.");
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function seed() {
  console.log("🚀 Iniciando criação das tabelas e migração de dados no Vercel Postgres...");
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Criar Tabela de Cidades
    await client.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        state CHAR(2) NOT NULL DEFAULT 'SP',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Criar Tabela de Categorias
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Garantir inclusão da coluna description caso a tabela já existisse sem ela
    await client.query(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
    `);

    // Definir as 4 Categorias Principais requeridas
    const MAIN_CATEGORIES = [
      {
        name: "O que Fazer & Experiências",
        description: "Pontos turísticos, passeios, praias, trilhas, cultura e vida noturna"
      },
      {
        name: "Hotéis & Acomodações",
        description: "Hotéis, pousadas, resorts, chalés e aluguel por temporada"
      },
      {
        name: "Comer & Beber",
        description: "Restaurantes, bares, quiosques, cafeterias e comidas típicas"
      },
      {
        name: "Compras & Serviços",
        description: "Feirinhas, artesanato, shoppings, farmácias, receptivos e emergências"
      }
    ];

    // Seed das Categorias Principais
    const categoryMap = new Map();
    for (const cat of MAIN_CATEGORIES) {
      const resCat = await client.query(
        `INSERT INTO categories (name, description) 
         VALUES ($1, $2) 
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description 
         RETURNING id, name;`,
        [cat.name, cat.description]
      );
      categoryMap.set(cat.name, resCat.rows[0].id);
    }

    // 3. Criar Tabela de Locais / Pontos Turísticos
    await client.query(`
      CREATE TABLE IF NOT EXISTS places (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
        original_category VARCHAR(100),
        city_id BIGINT REFERENCES cities(id) ON DELETE RESTRICT,
        address VARCHAR(500) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        google_maps_url TEXT,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        tier VARCHAR(20) DEFAULT 'bronze',
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        cover_image_url TEXT,
        backup_image_url TEXT,
        description TEXT,
        rating DECIMAL(3, 1) DEFAULT 4.2,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Carregar dados do places.json
    const jsonPath = path.join(__dirname, '../src/data/places.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const placesData = JSON.parse(rawData);

    console.log(`📦 Carregados ${placesData.length} registros de places.json`);

    // Dicionários para mapear IDs das Cidades
    const cityMap = new Map();

    for (const place of placesData) {
      // Inserir Cidade se não existir
      if (!cityMap.has(place.city)) {
        const resCity = await client.query(
          `INSERT INTO cities (name, state) VALUES ($1, 'SP') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id;`,
          [place.city]
        );
        cityMap.set(place.city, resCity.rows[0].id);
      }

      const cityId = cityMap.get(place.city);
      
      // Determinar a Categoria Principal (padrão: "O que Fazer & Experiências")
      let mainCategoryName = "O que Fazer & Experiências";
      if (place.mainCategory && categoryMap.has(place.mainCategory)) {
        mainCategoryName = place.mainCategory;
      } else if (categoryMap.has(place.category)) {
        mainCategoryName = place.category;
      }
      
      const categoryId = categoryMap.get(mainCategoryName);
      const originalCat = place.originalCategory || place.category;

      // Upsert do Ponto Turístico
      await client.query(`
        INSERT INTO places (
          id, title, category_id, original_category, city_id, address,
          phone, email, google_maps_url, latitude, longitude,
          tier, is_featured, cover_image_url, backup_image_url, description, rating
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category_id = EXCLUDED.category_id,
          original_category = EXCLUDED.original_category,
          city_id = EXCLUDED.city_id,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          google_maps_url = EXCLUDED.google_maps_url,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          tier = EXCLUDED.tier,
          is_featured = EXCLUDED.is_featured,
          cover_image_url = EXCLUDED.cover_image_url,
          backup_image_url = EXCLUDED.backup_image_url,
          description = EXCLUDED.description,
          rating = EXCLUDED.rating;
      `, [
        place.id,
        place.title,
        categoryId,
        originalCat,
        cityId,
        place.address,
        place.phone || '',
        place.email || '',
        place.googleMapsUrl,
        place.lat,
        place.lng,
        place.tier,
        place.isFeatured,
        place.coverImage,
        place.backupImage,
        place.description,
        place.rating
      ]);
    }

    await client.query('COMMIT');
    console.log(`✅ Sucesso! Migração concluída com ${placesData.length} pontos turísticos inseridos/atualizados na base Postgres no Vercel.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Erro durante o processo de seed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
