"""Conexión y operaciones con Supabase via SQL directo."""

import json
import logging
from typing import Optional

import requests

from config import SUPABASE_URL, SUPABASE_KEY, TABLE_PREFIX

logger = logging.getLogger(__name__)

# Nombres de tablas con prefijo
T_CORPUS_STATS = f"{TABLE_PREFIX}corpus_stats"
T_TAG_COUNTS = f"{TABLE_PREFIX}tag_counts"
T_TRANSITION_PROBS = f"{TABLE_PREFIX}transition_probs"
T_EMISSION_PROBS = f"{TABLE_PREFIX}emission_probs"
T_TAGGING_RESULTS = f"{TABLE_PREFIX}tagging_results"
T_QUICK_SENTENCES = f"{TABLE_PREFIX}quick_sentences"
T_ANALYSIS_QUESTIONS = f"{TABLE_PREFIX}analysis_questions"
T_EAGLES_EXAMPLES = f"{TABLE_PREFIX}eagles_examples"
T_EAGLES_POSITIONS = f"{TABLE_PREFIX}eagles_positions"
T_EXPORT_CHECKLIST = f"{TABLE_PREFIX}export_checklist"


def _sql(query: str, params: dict | None = None) -> list[dict] | None:
    """Ejecuta SQL contra Supabase via /pg/query y devuelve filas."""
    if not SUPABASE_KEY:
        return None
    try:
        resp = requests.post(
            f"{SUPABASE_URL}/pg/query",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
            },
            json={"query": query},
            timeout=30,
        )
        if resp.status_code == 200:
            return resp.json()
        logger.error("SQL error %d: %s", resp.status_code, resp.text[:200])
        return None
    except Exception as e:
        logger.error("SQL request failed: %s", e)
        return None


def _escape(value: str) -> str:
    """Escapa comillas simples para SQL."""
    return value.replace("'", "''")


# ── Corpus Stats ────────────────────────────────────────


def save_corpus_stats(stats: dict) -> bool:
    """Guarda las estadísticas del corpus en Supabase."""
    _sql(f"DELETE FROM {T_CORPUS_STATS}")
    cols = ["total_tokens", "total_sentences", "unique_words", "unique_tags", "total_files"]
    vals = [str(stats.get(c, 0)) for c in cols]
    result = _sql(
        f"INSERT INTO {T_CORPUS_STATS} ({', '.join(cols)}) "
        f"VALUES ({', '.join(vals)}) RETURNING id"
    )
    if result:
        logger.info("Corpus stats guardados en Supabase")
        return True
    return False


def load_corpus_stats() -> Optional[dict]:
    """Carga las estadísticas del corpus desde Supabase."""
    result = _sql(f"SELECT * FROM {T_CORPUS_STATS} ORDER BY id DESC LIMIT 1")
    if result:
        return result[0]
    return None


# ── Tag Counts ──────────────────────────────────────────


def save_tag_counts(tag_counts: dict) -> bool:
    """Guarda los conteos de etiquetas en Supabase."""
    _sql(f"DELETE FROM {T_TAG_COUNTS}")
    if not tag_counts:
        return True
    rows = []
    for tag, count in tag_counts.items():
        rows.append(f"('{_escape(tag)}', {count})")
    # Insert in batches of 500
    for i in range(0, len(rows), 500):
        batch = rows[i:i + 500]
        result = _sql(
            f"INSERT INTO {T_TAG_COUNTS} (tag, count) VALUES {', '.join(batch)}"
        )
        if result is None:
            return False
    logger.info("Tag counts guardados: %d etiquetas", len(tag_counts))
    return True


def load_tag_counts() -> Optional[dict]:
    """Carga los conteos de etiquetas desde Supabase."""
    result = _sql(f"SELECT tag, count FROM {T_TAG_COUNTS}")
    if result:
        return {row["tag"]: row["count"] for row in result}
    return None


# ── Transition Probs ────────────────────────────────────


def save_transition_probs(transition_counts: dict, transition_probs: dict) -> bool:
    """Guarda las probabilidades de transición en Supabase."""
    _sql(f"DELETE FROM {T_TRANSITION_PROBS}")
    if not transition_probs:
        return True
    rows = []
    for (tag_prev, tag_next), prob in transition_probs.items():
        count = transition_counts.get((tag_prev, tag_next), 0)
        rows.append(
            f"('{_escape(tag_prev)}', '{_escape(tag_next)}', {prob}, {count})"
        )
    for i in range(0, len(rows), 500):
        batch = rows[i:i + 500]
        result = _sql(
            f"INSERT INTO {T_TRANSITION_PROBS} (tag_prev, tag_next, probability, count) "
            f"VALUES {', '.join(batch)}"
        )
        if result is None:
            return False
    logger.info("Transition probs guardadas: %d filas", len(rows))
    return True


def load_transition_probs() -> Optional[tuple[dict, dict]]:
    """Carga probabilidades de transición desde Supabase."""
    result = _sql(f"SELECT tag_prev, tag_next, probability, count FROM {T_TRANSITION_PROBS}")
    if result:
        counts = {}
        probs = {}
        for row in result:
            key = (row["tag_prev"], row["tag_next"])
            counts[key] = row["count"]
            probs[key] = row["probability"]
        return counts, probs
    return None


# ── Emission Probs ──────────────────────────────────────


def save_emission_probs(emission_counts: dict, emission_probs: dict) -> bool:
    """Guarda las probabilidades de emisión agrupadas por etiqueta."""
    _sql(f"DELETE FROM {T_EMISSION_PROBS}")
    if not emission_probs:
        return True
    by_tag: dict[str, dict] = {}
    for (tag, word), prob in emission_probs.items():
        if tag not in by_tag:
            by_tag[tag] = {}
        by_tag[tag][word] = {
            "p": round(prob, 10),
            "c": emission_counts.get((tag, word), 0),
        }
    # Limit to top 500 words per tag (by count) to avoid oversized payloads
    MAX_WORDS_PER_TAG = 500
    for tag in by_tag:
        words_data = by_tag[tag]
        if len(words_data) > MAX_WORDS_PER_TAG:
            top = sorted(words_data.items(), key=lambda x: x[1]["c"], reverse=True)[:MAX_WORDS_PER_TAG]
            by_tag[tag] = dict(top)
    rows = []
    for tag, words_data in by_tag.items():
        json_str = _escape(json.dumps(words_data, ensure_ascii=False))
        rows.append(f"('{_escape(tag)}', '{json_str}'::jsonb)")
    for i in range(0, len(rows), 10):
        batch = rows[i:i + 10]
        result = _sql(
            f"INSERT INTO {T_EMISSION_PROBS} (tag, probabilities) "
            f"VALUES {', '.join(batch)}"
        )
        if result is None:
            logger.warning("Failed to insert emissions batch %d", i // 10 + 1)
            return False
    logger.info("Emission probs guardadas: %d etiquetas", len(by_tag))
    return True


def load_emission_probs() -> Optional[tuple[dict, dict]]:
    """Carga probabilidades de emisión desde Supabase."""
    result = _sql(f"SELECT tag, probabilities FROM {T_EMISSION_PROBS}")
    if result:
        counts = {}
        probs = {}
        for row in result:
            tag = row["tag"]
            words_data = row["probabilities"]
            if isinstance(words_data, str):
                words_data = json.loads(words_data)
            for word, data in words_data.items():
                counts[(tag, word)] = data["c"]
                probs[(tag, word)] = data["p"]
        return counts, probs
    return None


# ── Tagging Results ─────────────────────────────────────


def save_tagging_result(sentence: str, tokens: list, tags: list) -> bool:
    """Guarda un resultado de etiquetado."""
    tokens_json = _escape(json.dumps(tokens, ensure_ascii=False))
    tags_json = _escape(json.dumps(tags, ensure_ascii=False))
    result = _sql(
        f"INSERT INTO {T_TAGGING_RESULTS} (sentence, tokens, tags) "
        f"VALUES ('{_escape(sentence)}', '{tokens_json}'::jsonb, '{tags_json}'::jsonb) "
        f"RETURNING id"
    )
    return result is not None and len(result) > 0


def load_tagging_results(limit: int = 50) -> list:
    """Carga los últimos resultados de etiquetado."""
    result = _sql(
        f"SELECT * FROM {T_TAGGING_RESULTS} "
        f"ORDER BY created_at DESC LIMIT {limit}"
    )
    return result or []


# ── Quick Sentences ────────────────────────────────────


def load_quick_sentences() -> list[dict]:
    """Carga las oraciones rápidas desde Supabase."""
    result = _sql(
        f"SELECT id, sentence, sort_order FROM {T_QUICK_SENTENCES} "
        f"ORDER BY sort_order ASC, id ASC"
    )
    return result or []


def save_quick_sentence(sentence: str, sort_order: int = 0) -> dict | None:
    """Guarda una nueva oración rápida."""
    result = _sql(
        f"INSERT INTO {T_QUICK_SENTENCES} (sentence, sort_order) "
        f"VALUES ('{_escape(sentence)}', {sort_order}) "
        f"RETURNING id, sentence, sort_order"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def delete_quick_sentence(sentence_id: int) -> bool:
    """Elimina una oración rápida por ID."""
    result = _sql(
        f"DELETE FROM {T_QUICK_SENTENCES} WHERE id = {sentence_id} RETURNING id"
    )
    return result is not None and len(result) > 0


# ── Analysis Questions ────────────────────────────────


def load_analysis_questions() -> list[dict]:
    """Carga las preguntas de análisis desde Supabase."""
    result = _sql(
        f"SELECT id, sort_order, question, answer_html FROM {T_ANALYSIS_QUESTIONS} "
        f"ORDER BY sort_order ASC, id ASC"
    )
    return result or []


def save_analysis_question(sort_order: int, question: str, answer_html: str) -> dict | None:
    """Guarda una nueva pregunta de análisis."""
    result = _sql(
        f"INSERT INTO {T_ANALYSIS_QUESTIONS} (sort_order, question, answer_html) "
        f"VALUES ({sort_order}, '{_escape(question)}', '{_escape(answer_html)}') "
        f"RETURNING id, sort_order, question, answer_html"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def update_analysis_question(question_id: int, sort_order: int | None = None,
                             question: str | None = None, answer_html: str | None = None) -> dict | None:
    """Actualiza una pregunta de análisis existente."""
    sets = []
    if sort_order is not None:
        sets.append(f"sort_order = {sort_order}")
    if question is not None:
        sets.append(f"question = '{_escape(question)}'")
    if answer_html is not None:
        sets.append(f"answer_html = '{_escape(answer_html)}'")
    if not sets:
        return None
    sets.append("updated_at = NOW()")
    result = _sql(
        f"UPDATE {T_ANALYSIS_QUESTIONS} SET {', '.join(sets)} "
        f"WHERE id = {question_id} "
        f"RETURNING id, sort_order, question, answer_html"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def delete_analysis_question(question_id: int) -> bool:
    """Elimina una pregunta de análisis por ID."""
    result = _sql(
        f"DELETE FROM {T_ANALYSIS_QUESTIONS} WHERE id = {question_id} RETURNING id"
    )
    return result is not None and len(result) > 0


def update_quick_sentence(sentence_id: int, sentence: str | None = None,
                          sort_order: int | None = None) -> dict | None:
    """Actualiza una oración rápida existente."""
    sets = []
    if sentence is not None:
        sets.append(f"sentence = '{_escape(sentence)}'")
    if sort_order is not None:
        sets.append(f"sort_order = {sort_order}")
    if not sets:
        return None
    result = _sql(
        f"UPDATE {T_QUICK_SENTENCES} SET {', '.join(sets)} "
        f"WHERE id = {sentence_id} "
        f"RETURNING id, sentence, sort_order"
    )
    if result and len(result) > 0:
        return result[0]
    return None


# ── EAGLES Examples ───────────────────────────────────


def load_eagles_examples() -> list[dict]:
    """Carga los ejemplos de etiquetas EAGLES desde Supabase."""
    result = _sql(
        f"SELECT id, tag, category, description, sort_order FROM {T_EAGLES_EXAMPLES} "
        f"ORDER BY sort_order ASC, id ASC"
    )
    return result or []


def save_eagles_example(tag: str, category: str, description: str, sort_order: int = 0) -> dict | None:
    result = _sql(
        f"INSERT INTO {T_EAGLES_EXAMPLES} (tag, category, description, sort_order) "
        f"VALUES ('{_escape(tag)}', '{_escape(category)}', '{_escape(description)}', {sort_order}) "
        f"RETURNING id, tag, category, description, sort_order"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def update_eagles_example(example_id: int, tag: str | None = None, category: str | None = None,
                          description: str | None = None, sort_order: int | None = None) -> dict | None:
    sets = []
    if tag is not None:
        sets.append(f"tag = '{_escape(tag)}'")
    if category is not None:
        sets.append(f"category = '{_escape(category)}'")
    if description is not None:
        sets.append(f"description = '{_escape(description)}'")
    if sort_order is not None:
        sets.append(f"sort_order = {sort_order}")
    if not sets:
        return None
    result = _sql(
        f"UPDATE {T_EAGLES_EXAMPLES} SET {', '.join(sets)} "
        f"WHERE id = {example_id} "
        f"RETURNING id, tag, category, description, sort_order"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def delete_eagles_example(example_id: int) -> bool:
    result = _sql(f"DELETE FROM {T_EAGLES_EXAMPLES} WHERE id = {example_id} RETURNING id")
    return result is not None and len(result) > 0


# ── EAGLES Positions ──────────────────────────────────


def load_eagles_positions() -> list[dict]:
    """Carga las posiciones de estructura EAGLES desde Supabase."""
    result = _sql(
        f"SELECT id, position, attribute, possible_values, example_char, color_class, sort_order "
        f"FROM {T_EAGLES_POSITIONS} ORDER BY sort_order ASC, id ASC"
    )
    return result or []


def save_eagles_position(position: str, attribute: str, possible_values: str,
                         example_char: str = '', color_class: str = '', sort_order: int = 0) -> dict | None:
    result = _sql(
        f"INSERT INTO {T_EAGLES_POSITIONS} (position, attribute, possible_values, example_char, color_class, sort_order) "
        f"VALUES ('{_escape(position)}', '{_escape(attribute)}', '{_escape(possible_values)}', "
        f"'{_escape(example_char)}', '{_escape(color_class)}', {sort_order}) "
        f"RETURNING id, position, attribute, possible_values, example_char, color_class, sort_order"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def update_eagles_position(pos_id: int, position: str | None = None, attribute: str | None = None,
                           possible_values: str | None = None, example_char: str | None = None,
                           color_class: str | None = None, sort_order: int | None = None) -> dict | None:
    sets = []
    if position is not None:
        sets.append(f"position = '{_escape(position)}'")
    if attribute is not None:
        sets.append(f"attribute = '{_escape(attribute)}'")
    if possible_values is not None:
        sets.append(f"possible_values = '{_escape(possible_values)}'")
    if example_char is not None:
        sets.append(f"example_char = '{_escape(example_char)}'")
    if color_class is not None:
        sets.append(f"color_class = '{_escape(color_class)}'")
    if sort_order is not None:
        sets.append(f"sort_order = {sort_order}")
    if not sets:
        return None
    result = _sql(
        f"UPDATE {T_EAGLES_POSITIONS} SET {', '.join(sets)} "
        f"WHERE id = {pos_id} "
        f"RETURNING id, position, attribute, possible_values, example_char, color_class, sort_order"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def delete_eagles_position(pos_id: int) -> bool:
    result = _sql(f"DELETE FROM {T_EAGLES_POSITIONS} WHERE id = {pos_id} RETURNING id")
    return result is not None and len(result) > 0


# ── Export Checklist ─────────────────────────────────


def load_export_checklist() -> list[dict]:
    """Carga los items del checklist de exportacion desde Supabase."""
    result = _sql(
        f"SELECT id, label, sort_order FROM {T_EXPORT_CHECKLIST} "
        f"ORDER BY sort_order ASC, id ASC"
    )
    return result or []


def save_export_checklist_item(label: str, sort_order: int = 0) -> dict | None:
    """Crea un nuevo item en el checklist de exportacion."""
    result = _sql(
        f"INSERT INTO {T_EXPORT_CHECKLIST} (label, sort_order) "
        f"VALUES ('{_escape(label)}', {sort_order}) "
        f"RETURNING id, label, sort_order"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def update_export_checklist_item(item_id: int, label: str | None = None,
                                  sort_order: int | None = None) -> dict | None:
    """Actualiza un item del checklist de exportacion."""
    sets = []
    if label is not None:
        sets.append(f"label = '{_escape(label)}'")
    if sort_order is not None:
        sets.append(f"sort_order = {sort_order}")
    if not sets:
        return None
    result = _sql(
        f"UPDATE {T_EXPORT_CHECKLIST} SET {', '.join(sets)} "
        f"WHERE id = {item_id} "
        f"RETURNING id, label, sort_order"
    )
    if result and len(result) > 0:
        return result[0]
    return None


def delete_export_checklist_item(item_id: int) -> bool:
    """Elimina un item del checklist de exportacion por ID."""
    result = _sql(
        f"DELETE FROM {T_EXPORT_CHECKLIST} WHERE id = {item_id} RETURNING id"
    )
    return result is not None and len(result) > 0


def _seed_export_checklist() -> None:
    """Inserta los 9 items predeterminados del checklist de entregables."""
    items = [
        (1, 'Codigo Python completo y comentado en espanol'),
        (2, 'Tablas de probabilidades de emision (Excel)'),
        (3, 'Tablas de probabilidades de transicion (Excel)'),
        (4, 'Etiquetado de "Habla con el enfermo grave de trasplantes."'),
        (5, 'Matriz de Viterbi (Excel)'),
        (6, 'Etiquetado de "El enfermo grave habla de trasplantes."'),
        (7, 'Comparacion de ambos etiquetados'),
        (8, 'Respuestas a las 4 preguntas'),
        (9, 'Jupyter Notebook completo'),
    ]
    rows = []
    for sort_order, label in items:
        rows.append(f"('{_escape(label)}', {sort_order})")
    _sql(
        f"INSERT INTO {T_EXPORT_CHECKLIST} (label, sort_order) VALUES "
        + ", ".join(rows)
    )


# ── Database Init / Migration ────────────────────────


def ensure_tables() -> None:
    """Crea las tablas necesarias si no existen y siembra datos iniciales."""
    if not SUPABASE_KEY:
        logger.warning("SUPABASE_KEY not set — skipping table creation")
        return

    # Create quick_sentences table
    _sql(f"""
        CREATE TABLE IF NOT EXISTS {T_QUICK_SENTENCES} (
            id BIGSERIAL PRIMARY KEY,
            sentence TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    # Create analysis_questions table
    _sql(f"""
        CREATE TABLE IF NOT EXISTS {T_ANALYSIS_QUESTIONS} (
            id BIGSERIAL PRIMARY KEY,
            sort_order INTEGER NOT NULL DEFAULT 0,
            question TEXT NOT NULL,
            answer_html TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    # Create eagles_examples table
    _sql(f"""
        CREATE TABLE IF NOT EXISTS {T_EAGLES_EXAMPLES} (
            id BIGSERIAL PRIMARY KEY,
            tag VARCHAR(20) NOT NULL,
            category VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    # Create eagles_positions table
    _sql(f"""
        CREATE TABLE IF NOT EXISTS {T_EAGLES_POSITIONS} (
            id BIGSERIAL PRIMARY KEY,
            position VARCHAR(5) NOT NULL,
            attribute VARCHAR(50) NOT NULL,
            possible_values TEXT NOT NULL,
            example_char VARCHAR(5) DEFAULT '',
            color_class TEXT DEFAULT '',
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    # Create export_checklist table
    _sql(f"""
        CREATE TABLE IF NOT EXISTS {T_EXPORT_CHECKLIST} (
            id BIGSERIAL PRIMARY KEY,
            label TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)

    # Create indexes
    _sql(f"CREATE INDEX IF NOT EXISTS idx_export_checklist_sort ON {T_EXPORT_CHECKLIST}(sort_order)")
    _sql(f"CREATE INDEX IF NOT EXISTS idx_quick_sentences_sort ON {T_QUICK_SENTENCES}(sort_order)")
    _sql(f"CREATE INDEX IF NOT EXISTS idx_analysis_questions_sort ON {T_ANALYSIS_QUESTIONS}(sort_order)")
    _sql(f"CREATE INDEX IF NOT EXISTS idx_eagles_examples_sort ON {T_EAGLES_EXAMPLES}(sort_order)")
    _sql(f"CREATE INDEX IF NOT EXISTS idx_eagles_positions_sort ON {T_EAGLES_POSITIONS}(sort_order)")

    # Enable RLS with permissive policies
    for table in [T_EXPORT_CHECKLIST, T_QUICK_SENTENCES, T_ANALYSIS_QUESTIONS, T_EAGLES_EXAMPLES, T_EAGLES_POSITIONS]:
        _sql(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        # DROP + CREATE since CREATE POLICY IF NOT EXISTS is not supported
        _sql(f"DROP POLICY IF EXISTS \"allow_all_{table}\" ON {table}")
        _sql(
            f"CREATE POLICY \"allow_all_{table}\" ON {table} "
            f"FOR ALL USING (true) WITH CHECK (true)"
        )

    # Seed export_checklist if empty
    existing = _sql(f"SELECT COUNT(*) as cnt FROM {T_EXPORT_CHECKLIST}")
    if existing and existing[0].get("cnt", 0) == 0:
        logger.info("Seeding export_checklist with default data...")
        _seed_export_checklist()

    # Seed quick_sentences if empty
    existing = _sql(f"SELECT COUNT(*) as cnt FROM {T_QUICK_SENTENCES}")
    if existing and existing[0].get("cnt", 0) == 0:
        logger.info("Seeding quick_sentences with default data...")
        _sql(
            f"INSERT INTO {T_QUICK_SENTENCES} (sentence, sort_order) VALUES "
            f"('Habla con el enfermo grave de trasplantes.', 1), "
            f"('El enfermo grave habla de trasplantes.', 2)"
        )

    # Seed analysis_questions if empty
    existing = _sql(f"SELECT COUNT(*) as cnt FROM {T_ANALYSIS_QUESTIONS}")
    if existing and existing[0].get("cnt", 0) == 0:
        logger.info("Seeding analysis_questions with default data...")
        _seed_analysis_questions()

    # Seed eagles_examples if empty
    existing = _sql(f"SELECT COUNT(*) as cnt FROM {T_EAGLES_EXAMPLES}")
    if existing and existing[0].get("cnt", 0) == 0:
        logger.info("Seeding eagles_examples with default data...")
        _seed_eagles_examples()

    # Seed eagles_positions if empty
    existing = _sql(f"SELECT COUNT(*) as cnt FROM {T_EAGLES_POSITIONS}")
    if existing and existing[0].get("cnt", 0) == 0:
        logger.info("Seeding eagles_positions with default data...")
        _seed_eagles_positions()

    logger.info("Database tables verified/created successfully")


def _seed_analysis_questions() -> None:
    """Inserta las 4 preguntas predeterminadas de la actividad."""
    questions = [
        (1, 'Es correcto el etiquetado de "Habla con el enfermo grave de trasplantes."?',
         '<p>El etiquetado producido por el modelo HMM con algoritmo de Viterbi para esta oracion es, en general, <strong>correcto</strong>, aunque presenta ciertos casos de ambiguedad que merecen analisis detallado:</p>'
         '<ul class="list-disc pl-5 space-y-2">'
         '<li><strong>&laquo;Habla&raquo;</strong>: Es una palabra ambigua. Puede ser un <em>verbo</em> (VMIP3S0 - verbo principal, indicativo, presente, 3ra persona singular) o un <em>sustantivo femenino</em> (NCFS000). En esta oracion, al estar en posicion inicial y seguida de la preposicion &laquo;con&raquo;, el modelo HMM tiende a asignar la etiqueta verbal (VMIP3S0), lo cual es correcto dado que &laquo;Habla&raquo; actua como verbo principal de la oracion.</li>'
         '<li><strong>&laquo;con&raquo;</strong>: Preposicion (SPS00). Etiquetado correcto sin ambiguedad significativa.</li>'
         '<li><strong>&laquo;el&raquo;</strong>: Articulo determinado masculino singular (DA0MS0). Correcto.</li>'
         '<li><strong>&laquo;enfermo&raquo;</strong>: Palabra ambigua. Puede ser <em>adjetivo</em> (AQ0MS0) o <em>sustantivo</em> (NCMS000). Tras el articulo &laquo;el&raquo;, el modelo probablemente lo etiqueta como sustantivo (NCMS000), lo cual es correcto en este contexto ya que &laquo;el enfermo&raquo; funciona como sintagma nominal.</li>'
         '<li><strong>&laquo;grave&raquo;</strong>: Adjetivo calificativo (AQ0CS0). Correcto. Modifica al sustantivo &laquo;enfermo&raquo;.</li>'
         '<li><strong>&laquo;de&raquo;</strong>: Preposicion (SPS00). Correcto.</li>'
         '<li><strong>&laquo;trasplantes&raquo;</strong>: Sustantivo comun masculino plural (NCMP000). Correcto.</li>'
         '<li><strong>&laquo;.&raquo;</strong>: Signo de puntuacion (Fp). Correcto.</li>'
         '</ul>'
         '<p><strong>Conclusion:</strong> El modelo HMM asigna correctamente las etiquetas gracias a que las probabilidades de transicion de bigramas capturan patrones sintacticos como &laquo;preposicion &rarr; articulo&raquo;, &laquo;articulo &rarr; sustantivo&raquo; y &laquo;sustantivo &rarr; adjetivo&raquo;, resolviendo adecuadamente las ambiguedades contextuales.</p>'),

        (2, 'Etiqueta "El enfermo grave habla de trasplantes." y evalua si es correcto',
         '<p>Esta oracion contiene las <strong>mismas palabras</strong> que la anterior pero en un <strong>orden diferente</strong>. El cambio de orden sintactico altera las probabilidades de transicion del modelo HMM:</p>'
         '<ul class="list-disc pl-5 space-y-2">'
         '<li><strong>&laquo;El&raquo;</strong>: Articulo determinado masculino singular (DA0MS0). Correcto.</li>'
         '<li><strong>&laquo;enfermo&raquo;</strong>: Tras el articulo &laquo;El&raquo;, la transicion &laquo;DA0MS0 &rarr; NCMS000&raquo; tiene alta probabilidad. El modelo deberia asignar NCMS000 (sustantivo), lo cual es correcto: &laquo;el enfermo&raquo; es el sujeto de la oracion.</li>'
         '<li><strong>&laquo;grave&raquo;</strong>: Adjetivo calificativo (AQ0CS0). La transicion &laquo;NCMS000 &rarr; AQ0CS0&raquo; (sustantivo &rarr; adjetivo) es natural. Correcto.</li>'
         '<li><strong>&laquo;habla&raquo;</strong>: En esta posicion, despues de un adjetivo, la transicion &laquo;AQ0CS0 &rarr; VMIP3S0&raquo; (adjetivo &rarr; verbo) favorece la etiqueta verbal. &laquo;habla&raquo; funciona aqui como el verbo principal de la oracion. El modelo deberia asignar VMIP3S0, lo cual es correcto.</li>'
         '<li><strong>&laquo;de&raquo;</strong>: Preposicion (SPS00). Correcto.</li>'
         '<li><strong>&laquo;trasplantes&raquo;</strong>: Sustantivo comun masculino plural (NCMP000). Correcto.</li>'
         '<li><strong>&laquo;.&raquo;</strong>: Signo de puntuacion (Fp). Correcto.</li>'
         '</ul>'
         '<p><strong>Comparacion clave:</strong> Aunque ambas oraciones comparten las mismas palabras, el cambio de orden puede afectar la etiqueta de &laquo;Habla/habla&raquo; y &laquo;enfermo&raquo;. Las probabilidades de transicion de bigramas cambian segun el contexto inmediato, demostrando la dependencia del modelo HMM respecto al orden de las palabras.</p>'),

        (3, 'Cuales son las limitaciones del etiquetador?',
         '<p>El etiquetador basado en HMM con algoritmo de Viterbi presenta las siguientes <strong>limitaciones</strong>:</p>'
         '<ul class="list-disc pl-5 space-y-2">'
         '<li><strong>Contexto limitado a bigramas:</strong> El modelo de Markov de primer orden solo considera la etiqueta inmediatamente anterior. Esto impide capturar dependencias a larga distancia (ej. concordancia sujeto-verbo con subordinadas intercaladas).</li>'
         '<li><strong>Dependencia del corpus de entrenamiento:</strong> La calidad del etiquetado depende del tamano, dominio y calidad de las anotaciones del corpus EAGLES utilizado.</li>'
         '<li><strong>Manejo deficiente de palabras desconocidas:</strong> Las palabras OOV (out-of-vocabulary) no tienen probabilidades de emision calculadas. El modelo debe recurrir a heuristicas simples, lo que degrada la precision.</li>'
         '<li><strong>Ausencia de analisis morfologico:</strong> No analiza la estructura interna de las palabras (prefijos, sufijos, flexiones). No puede inferir que &laquo;-mente&raquo; indica adverbio o que &laquo;-cion&raquo; indica sustantivo.</li>'
         '<li><strong>Sensibilidad a mayusculas/minusculas:</strong> &laquo;Habla&raquo; y &laquo;habla&raquo; tienen diferentes probabilidades de emision, especialmente relevante al inicio de oracion.</li>'
         '<li><strong>Sin comprension semantica:</strong> No entiende significados. No puede resolver ambiguedades que requieren conocimiento del mundo.</li>'
         '<li><strong>Dispersion de datos (data sparsity):</strong> Muchas combinaciones de bigramas pueden no aparecer en el corpus, generando probabilidades nulas que bloquean caminos correctos en Viterbi.</li>'
         '<li><strong>Suposicion de independencia de emisiones:</strong> Asume que la probabilidad de observar una palabra depende unicamente de su etiqueta, no de las palabras circundantes.</li>'
         '</ul>'),

        (4, 'Que mejoras se podrian aplicar?',
         '<p>Para superar las limitaciones, se podrian aplicar las siguientes <strong>mejoras</strong>:</p>'
         '<ul class="list-disc pl-5 space-y-2">'
         '<li><strong>Modelos de trigramas o n-gramas superiores:</strong> Extender el modelo de Markov a segundo o tercer orden para considerar mas contexto en las probabilidades de transicion.</li>'
         '<li><strong>Tecnicas de suavizado (smoothing):</strong>'
         '<ul class="list-disc pl-5 mt-1 space-y-1">'
         '<li><em>Suavizado de Laplace (add-one):</em> Pseudocuenta para evitar probabilidades nulas.</li>'
         '<li><em>Good-Turing:</em> Redistribuir masa de probabilidad hacia eventos no observados.</li>'
         '<li><em>Interpolacion de Jelinek-Mercer:</em> Combinar modelos de diferente orden con pesos optimizados.</li>'
         '<li><em>Backoff de Katz:</em> Usar modelos de orden inferior cuando las estimaciones de orden superior no son confiables.</li>'
         '</ul></li>'
         '<li><strong>Manejo de palabras desconocidas basado en sufijos:</strong> Clasificador morfologico que analice sufijos para estimar la categoria gramatical de palabras OOV.</li>'
         '<li><strong>Corpus mas grande y/o especifico del dominio:</strong> Entrenar con corpus mas extensos (AnCora, periodisticos) para mayor cobertura lexica.</li>'
         '<li><strong>Modelos CRF (Campos Aleatorios Condicionales):</strong> Incorporar multiples features: prefijos, sufijos, capitalizacion, posicion, palabras vecinas. Sin suposicion de independencia de emisiones.</li>'
         '<li><strong>Modelos basados en redes neuronales:</strong>'
         '<ul class="list-disc pl-5 mt-1 space-y-1">'
         '<li><em>BiLSTM-CRF:</em> Redes recurrentes bidireccionales con capa CRF.</li>'
         '<li><em>Transformers:</em> BERT o RoBERTa preentrenados en espanol con representaciones contextualizadas.</li>'
         '</ul></li>'
         '<li><strong>Metodos de ensamble (ensemble):</strong> Combinar predicciones de multiples modelos mediante votacion o apilamiento.</li>'
         '<li><strong>Normalizacion de texto:</strong> Preprocesar para normalizar mayusculas, acentos y signos de puntuacion.</li>'
         '</ul>'),
    ]

    for sort_order, question, answer_html in questions:
        _sql(
            f"INSERT INTO {T_ANALYSIS_QUESTIONS} (sort_order, question, answer_html) "
            f"VALUES ({sort_order}, '{_escape(question)}', '{_escape(answer_html)}')"
        )


def _seed_eagles_examples() -> None:
    """Inserta los 14 ejemplos de etiquetas EAGLES comunes."""
    examples = [
        (1, 'VMIP3S0', 'Verbo', 'Verbo principal, indicativo, presente, 3a persona, singular'),
        (2, 'NCMS000', 'Nombre', 'Nombre comun, masculino, singular'),
        (3, 'DA0MS0', 'Determinante', 'Determinante, articulo, masculino, singular'),
        (4, 'SPS00', 'Preposicion', 'Preposicion simple'),
        (5, 'AQ0CS0', 'Adjetivo', 'Adjetivo calificativo, comun, singular'),
        (6, 'PP3MSA00', 'Pronombre', 'Pronombre personal, 3a persona, masculino, singular, acusativo'),
        (7, 'RG', 'Adverbio', 'Adverbio general'),
        (8, 'CC', 'Conjuncion', 'Conjuncion coordinante'),
        (9, 'CS', 'Conjuncion', 'Conjuncion subordinante'),
        (10, 'Fp', 'Puntuacion', 'Signo de puntuacion: punto'),
        (11, 'Fc', 'Puntuacion', 'Signo de puntuacion: coma'),
        (12, 'Z', 'Numeral', 'Numeral (cifra)'),
        (13, 'W', 'Fecha', 'Fecha u hora'),
        (14, 'I', 'Interjeccion', 'Interjeccion'),
    ]
    rows = []
    for sort_order, tag, category, description in examples:
        rows.append(
            f"({sort_order}, '{_escape(tag)}', '{_escape(category)}', '{_escape(description)}')"
        )
    _sql(
        f"INSERT INTO {T_EAGLES_EXAMPLES} (sort_order, tag, category, description) VALUES "
        + ", ".join(rows)
    )


def _seed_eagles_positions() -> None:
    """Inserta las 7 posiciones de la estructura EAGLES."""
    positions = [
        (1, '1', 'Categoria',
         'A (Adjetivo), C (Conjuncion), D (Determinante), F (Puntuacion), I (Interjeccion), N (Nombre), P (Pronombre), R (Adverbio), S (Preposicion), V (Verbo), W (Fecha), Z (Numeral)',
         'V', 'border-[#04202C] bg-[#04202C]/10 text-[#04202C]'),
        (2, '2', 'Subcategoria',
         'Depende de la categoria. Ej: M (principal), A (auxiliar), Q (calificativo), C (comun), P (propio)...',
         'M', 'border-violet-400 bg-violet-50 text-violet-600'),
        (3, '3', 'Modo / Tipo',
         'I (indicativo), S (subjuntivo), M (imperativo), N (infinitivo), G (gerundio), P (participio)...',
         'I', 'border-emerald-400 bg-emerald-50 text-emerald-600'),
        (4, '4', 'Tiempo',
         'P (presente), I (imperfecto), F (futuro), C (condicional), S (pasado)...',
         'P', 'border-sky-400 bg-sky-50 text-sky-600'),
        (5, '5', 'Persona',
         '1 (primera), 2 (segunda), 3 (tercera), 0 (no aplica)',
         '3', 'border-rose-400 bg-rose-50 text-rose-600'),
        (6, '6', 'Numero',
         'S (singular), P (plural), N (invariable), 0 (no aplica)',
         'S', 'border-violet-400 bg-violet-50 text-violet-600'),
        (7, '7', 'Genero',
         'M (masculino), F (femenino), C (comun), 0 (no aplica)',
         '0', 'border-gray-400 bg-gray-50 text-gray-800'),
    ]
    for sort_order, position, attribute, possible_values, example_char, color_class in positions:
        _sql(
            f"INSERT INTO {T_EAGLES_POSITIONS} (sort_order, position, attribute, possible_values, example_char, color_class) "
            f"VALUES ({sort_order}, '{_escape(position)}', '{_escape(attribute)}', "
            f"'{_escape(possible_values)}', '{_escape(example_char)}', '{_escape(color_class)}')"
        )
