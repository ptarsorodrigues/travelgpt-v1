import os
import sys
import re
import json
import time
import dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from playwright.sync_api import sync_playwright

# Configurar stdout para UTF-8 sem buffer
sys.stdout.reconfigure(encoding='utf-8')

# 1. Carregar variáveis de ambiente do .env.local e .env
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv.load_dotenv(os.path.join(base_dir, '.env.local'))
dotenv.load_dotenv(os.path.join(base_dir, '.env'))

db_url = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')
if not db_url:
    print("[ERRO] Nenhuma URL de conexao PostgreSQL encontrada em .env.local ou .env", flush=True)
    exit(1)

def run_update():
    print("[+] Conectando ao Banco de Dados PostgreSQL...", flush=True)
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # 2. Buscar todos os registros da tabela 'places'
    cursor.execute("""
        SELECT p.id, p.title, p.original_category, p.google_maps_url, c.name as city_name 
        FROM places p 
        LEFT JOIN cities c ON p.city_id = c.id
        ORDER BY p.id ASC;
    """)
    places = cursor.fetchall()
    total = len(places)
    print(f"[+] {total} locais encontrados no banco de dados para processamento.", flush=True)

    updated_count = 0
    error_count = 0
    updates_map = {}

    print("[+] Iniciando navegador acelerado para consulta no Google Maps...", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            locale='pt-BR',
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        )
        page = context.new_page()

        # Bloquear imagens e fontes pesadas para carregar 5x mais rápido
        page.route("**/*.{png,jpg,jpeg,svg,webp,gif,woff,woff2,ttf,css}", lambda route: route.abort())

        for idx, item in enumerate(places, 1):
            place_id_db = item['id']
            old_title = item['title']
            old_cat = item['original_category']
            google_url = item['google_maps_url'] or ''

            # Extrair query_place_id se existir na URL
            place_id_match = re.search(r'query_place_id=([a-zA-Z0-9_-]+)', google_url)
            if place_id_match:
                target_url = f"https://www.google.com/maps/place/?q=place_id:{place_id_match.group(1)}"
            elif google_url:
                target_url = google_url
            else:
                target_url = f"https://www.google.com/maps/search/?api=1&query={old_title}+{item['city_name'] or ''}"

            try:
                page.goto(target_url, wait_until="domcontentloaded", timeout=15000)
                time.sleep(1.2)

                # Aceitar modal de consentimento se aparecer
                try:
                    consent_btn = page.query_selector('button[aria-label*="Aceitar"], form[action*="consent"] button')
                    if consent_btn:
                        consent_btn.click()
                        time.sleep(0.5)
                except Exception:
                    pass

                # Extrair Titulo oficial do Google
                title_el = page.query_selector('h1')
                google_title = title_el.inner_text().strip() if title_el else None

                # Extrair Categoria especifica do Google Maps
                cat_el = page.query_selector('button[jsaction*="category"], button[data-item-id*="category"], button.Dkfdx, span.Dkfdx')
                google_cat = cat_el.inner_text().strip() if cat_el else None

                if not google_cat:
                    btns = page.query_selector_all('button[jsaction*="pane."]')
                    for btn in btns:
                        txt = btn.inner_text().strip()
                        if txt and len(txt) < 40 and not any(ch in txt for ch in ['★', '⭐', '·', 'R$', 'http', 'Fechar', 'Salvar', 'Compartilhar', 'Enviar']):
                            if not txt.isdigit() and '(' not in txt:
                                google_cat = txt
                                break

                # Definir novos valores
                final_title = google_title if (google_title and len(google_title) > 1 and google_title != "Google Maps") else old_title
                final_cat = google_cat if google_cat else old_cat

                print(f"[{idx}/{total}] ID={place_id_db} | Titulo: '{final_title}' | Categoria Google: '{final_cat}'", flush=True)

                # Atualizar registro no PostgreSQL
                cursor.execute("""
                    UPDATE places 
                    SET title = %s, original_category = %s 
                    WHERE id = %s;
                """, (final_title, final_cat, place_id_db))
                conn.commit()

                updates_map[place_id_db] = {
                    'title': final_title,
                    'originalCategory': final_cat,
                    'category': final_cat
                }

                updated_count += 1

            except Exception as err:
                print(f"[{idx}/{total}] [!] Erro no ID={place_id_db}: {err}", flush=True)
                error_count += 1

        browser.close()

    cursor.close()
    conn.close()
    print("\n[OK] Concluida a atualizacao no Banco de Dados PostgreSQL!", flush=True)

    # 3. Sincronizar tambem o arquivo local src/data/places.json preservando todas as imagens
    json_path = os.path.join(base_dir, 'src', 'data', 'places.json')
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)

            json_updated = 0
            for entry in json_data:
                p_id = entry.get('id')
                if p_id in updates_map:
                    entry['title'] = updates_map[p_id]['title']
                    entry['originalCategory'] = updates_map[p_id]['originalCategory']
                    entry['category'] = updates_map[p_id]['category']
                    json_updated += 1

            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)

            print(f"[+] Arquivo 'src/data/places.json' sincronizado ({json_updated} itens atualizados sem alterar imagens).", flush=True)
        except Exception as e:
            print(f"[!] Erro ao atualizar src/data/places.json: {e}", flush=True)

    print("\n--------------------------------------------------", flush=True)
    print(f"RELATORIO FINAL:", flush=True)
    print(f"   - Total de locais processados: {total}", flush=True)
    print(f"   - Atualizados com sucesso no Banco: {updated_count}", flush=True)
    print(f"   - Falhas de consulta: {error_count}", flush=True)
    print("--------------------------------------------------", flush=True)

if __name__ == "__main__":
    run_update()
