import os
import sys
import json
import dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

sys.stdout.reconfigure(encoding='utf-8')

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv.load_dotenv(os.path.join(base_dir, '.env.local'))
dotenv.load_dotenv(os.path.join(base_dir, '.env'))

db_url = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')
if not db_url:
    print("[ERRO] Nenhuma URL PostgreSQL configurada.")
    exit(1)

MAIN_CATEGORIES_INFO = {
    "O que Fazer & Experiências": "Pontos turísticos, passeios, praias, trilhas, cultura e vida noturna",
    "Hotéis & Acomodações": "Hotéis, pousadas, resorts, chalés e aluguel por temporada",
    "Comer & Beber": "Restaurantes, bares, quiosques, cafeterias e comidas típicas",
    "Compras & Serviços": "Feirinhas, artesanato, shoppings, farmácias, receptivos e emergências"
}

def determine_main_category(title, original_cat):
    title_lower = (title or '').lower()
    cat_lower = (original_cat or '').lower()

    # 1. Hotéis & Acomodações
    if any(k in cat_lower for k in ['hotel', 'pousada', 'resort', 'chalé', 'chale', 'hospedagem', 'hostel', 'aluguel por temporada']):
        if 'museu' not in cat_lower and 'museu' not in title_lower:
            return "Hotéis & Acomodações"

    # 2. Comer & Beber
    if any(k in cat_lower for k in ['restaurante', 'churrascaria', 'bar', 'quiosque', 'padaria', 'cafeteria', 'buffet', 'lanchonete', 'bistrô', 'bistro', 'pizzaria', 'chopp']):
        return "Comer & Beber"
    if any(k in title_lower for k in ['churrascaria', 'restaurante', 'padaria', 'coffee lab', 'quiosque']):
        return "Comer & Beber"

    # 3. Compras & Serviços
    if any(k in cat_lower for k in [
        'shopping', 'centro comercial', 'feira', 'mercado', 'farmácia', 'farmacia', 
        'drogaria', 'hospital', 'pronto socorro', 'agência de passeios', 'agencia de passeios',
        'receptivo', 'departamento municipal de turismo', 'loja', 'artesanato'
    ]):
        return "Compras & Serviços"
    if any(k in title_lower for k in ['shopping', 'drogaria', 'hospital', 'pronto socorro', 'feirinha', 'rua 25 de março', 'rua 25 de marco']):
        return "Compras & Serviços"

    # 4. O que Fazer & Experiências (Padrão para pontos turísticos, parques, museus, etc.)
    return "O que Fazer & Experiências"

def run_reclassification():
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Obter IDs das categorias na tabela 'categories'
    cursor.execute("SELECT id, name FROM categories;")
    cat_rows = cursor.fetchall()
    cat_id_map = {row['name']: row['id'] for row in cat_rows}

    # Garantir que todas as 4 categorias existem no banco
    for name, desc in MAIN_CATEGORIES_INFO.items():
        if name not in cat_id_map:
            cursor.execute(
                "INSERT INTO categories (name, description) VALUES (%s, %s) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id;",
                (name, desc)
            )
            res = cursor.fetchone()
            cat_id_map[name] = res['id']
            conn.commit()

    # Buscar todos os locais
    cursor.execute("""
        SELECT p.id, p.title, p.original_category, p.category_id, c.name as current_main_category
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id ASC;
    """)
    places = cursor.fetchall()
    total = len(places)

    reclassified_count = 0
    updates_map = {}

    print(f"[+] Analisando {total} locais no banco de dados...", flush=True)

    for p in places:
        pid = p['id']
        title = p['title']
        orig_cat = p['original_category']
        current_main = p['current_main_category']

        correct_main = determine_main_category(title, orig_cat)
        correct_cat_id = cat_id_map[correct_main]

        if current_main != correct_main or p['category_id'] != correct_cat_id:
            reclassified_count += 1
            print(f"  [RECLASSIFICADO] ID={pid} | Titulo='{title}' | Cat.Especifica='{orig_cat}'", flush=True)
            print(f"      De: '{current_main}'  -->  Para: '{correct_main}'", flush=True)

            cursor.execute("UPDATE places SET category_id = %s WHERE id = %s;", (correct_cat_id, pid))
            conn.commit()

        updates_map[pid] = {
            'mainCategory': correct_main,
            'categoryDescription': MAIN_CATEGORIES_INFO[correct_main]
        }

    cursor.close()
    conn.close()

    print(f"\n[OK] Reclassificação concluída no Banco PostgreSQL! Total reclassificados: {reclassified_count}/{total}", flush=True)

    # Sincronizar places.json
    json_path = os.path.join(base_dir, 'src', 'data', 'places.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)

        json_updated = 0
        for entry in json_data:
            p_id = entry.get('id')
            if p_id in updates_map:
                entry['mainCategory'] = updates_map[p_id]['mainCategory']
                entry['categoryDescription'] = updates_map[p_id]['categoryDescription']
                json_updated += 1

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)

        print(f"[+] Arquivo 'src/data/places.json' sincronizado ({json_updated} itens).", flush=True)

if __name__ == "__main__":
    run_reclassification()
