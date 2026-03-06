-- ============================================================
-- Schema SQL para Supabase: Etiquetador Morfosintáctico HMM
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Estadísticas del corpus
CREATE TABLE IF NOT EXISTS etqmorf_corpus_stats (
    id BIGSERIAL PRIMARY KEY,
    total_tokens BIGINT DEFAULT 0,
    total_sentences BIGINT DEFAULT 0,
    total_documents BIGINT DEFAULT 0,
    unique_tags INTEGER DEFAULT 0,
    unique_words INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    total_files INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conteos de etiquetas
CREATE TABLE IF NOT EXISTS etqmorf_tag_counts (
    id BIGSERIAL PRIMARY KEY,
    tag VARCHAR(20) NOT NULL,
    count BIGINT DEFAULT 0,
    UNIQUE(tag)
);

-- Probabilidades de emisión agrupadas por etiqueta
CREATE TABLE IF NOT EXISTS etqmorf_emission_probs (
    id BIGSERIAL PRIMARY KEY,
    tag VARCHAR(20) NOT NULL,
    probabilities JSONB NOT NULL DEFAULT '{}',
    UNIQUE(tag)
);

-- Probabilidades de transición
CREATE TABLE IF NOT EXISTS etqmorf_transition_probs (
    id BIGSERIAL PRIMARY KEY,
    tag_prev VARCHAR(20) NOT NULL,
    tag_next VARCHAR(20) NOT NULL,
    probability DOUBLE PRECISION DEFAULT 0,
    count BIGINT DEFAULT 0,
    UNIQUE(tag_prev, tag_next)
);

-- Resultados de etiquetado (historial)
CREATE TABLE IF NOT EXISTS etqmorf_tagging_results (
    id BIGSERIAL PRIMARY KEY,
    sentence TEXT NOT NULL,
    tokens JSONB NOT NULL DEFAULT '[]',
    tags JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Oraciones rápidas (quick sentences) para el componente Viterbi
CREATE TABLE IF NOT EXISTS etqmorf_quick_sentences (
    id BIGSERIAL PRIMARY KEY,
    sentence TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: oraciones requeridas por la actividad
INSERT INTO etqmorf_quick_sentences (sentence, sort_order) VALUES
    ('Habla con el enfermo grave de trasplantes.', 1),
    ('El enfermo grave habla de trasplantes.', 2);

-- Preguntas y respuestas para la página de análisis
CREATE TABLE IF NOT EXISTS etqmorf_analysis_questions (
    id BIGSERIAL PRIMARY KEY,
    sort_order INTEGER NOT NULL DEFAULT 0,
    question TEXT NOT NULL,
    answer_html TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: 4 preguntas del apartado 3 de la actividad
INSERT INTO etqmorf_analysis_questions (sort_order, question, answer_html) VALUES
(1,
 'Es correcto el etiquetado de «Habla con el enfermo grave de trasplantes.»?',
 '<p>El etiquetado producido por el modelo HMM con algoritmo de Viterbi para esta oracion es, en general, <strong>correcto</strong>, aunque presenta ciertos casos de ambiguedad que merecen analisis detallado:</p><ul class="list-disc pl-5 space-y-2"><li><strong>«Habla»</strong>: Es una palabra ambigua. Puede ser un <em>verbo</em> (VMIP3S0 - verbo principal, indicativo, presente, 3ra persona singular) o un <em>sustantivo femenino</em> (NCFS000 - nombre comun, femenino, singular). En esta oracion, al estar en posicion inicial y seguida de la preposicion «con», el modelo HMM tiende a asignar la etiqueta verbal (VMIP3S0), lo cual es correcto dado que «Habla» actua como verbo principal de la oracion (imperativo o indicativo 3ra persona).</li><li><strong>«con»</strong>: Preposicion (SPS00). Etiquetado correcto sin ambiguedad significativa.</li><li><strong>«el»</strong>: Articulo determinado masculino singular (DA0MS0). Correcto.</li><li><strong>«enfermo»</strong>: Palabra ambigua. Puede ser <em>adjetivo</em> (AQ0MS0 - adjetivo calificativo, masculino, singular) o <em>sustantivo</em> (NCMS000 - nombre comun, masculino, singular). Tras el articulo «el», el modelo probablemente lo etiqueta como sustantivo (NCMS000), lo cual es correcto en este contexto ya que «el enfermo» funciona como sintagma nominal (sustantivacion del adjetivo).</li><li><strong>«grave»</strong>: Adjetivo calificativo (AQ0CS0). Correcto. Modifica al sustantivo «enfermo». La posicion postnominal refuerza su funcion adjetival.</li><li><strong>«de»</strong>: Preposicion (SPS00). Correcto.</li><li><strong>«trasplantes»</strong>: Sustantivo comun masculino plural (NCMP000). Correcto. Aunque el verbo «trasplantar» tiene formas que coinciden, en posicion pospreposicional es inequivocamente un sustantivo.</li><li><strong>«.»</strong>: Signo de puntuacion (Fp). Correcto.</li></ul><p><strong>Conclusion:</strong> El modelo HMM asigna correctamente las etiquetas gracias a que las probabilidades de transicion de bigramas capturan patrones sintacticos como «preposicion → articulo», «articulo → sustantivo» y «sustantivo → adjetivo», resolviendo adecuadamente las ambiguedades contextuales.</p>'),
(2,
 'Etiqueta «El enfermo grave habla de trasplantes.» y evalua si es correcto',
 '<p>Esta oracion contiene las <strong>mismas palabras</strong> que la anterior pero en un <strong>orden diferente</strong>. El cambio de orden sintactico altera las probabilidades de transicion del modelo HMM y puede producir etiquetas distintas para los mismos tokens:</p><ul class="list-disc pl-5 space-y-2"><li><strong>«El»</strong>: Articulo determinado masculino singular (DA0MS0). Correcto. Al estar en posicion inicial, la probabilidad de transicion desde el estado inicial favorece fuertemente la etiqueta de articulo.</li><li><strong>«enfermo»</strong>: Tras el articulo «El», la transicion «DA0MS0 → NCMS000» (articulo → sustantivo) tiene alta probabilidad. El modelo deberia asignar NCMS000 (sustantivo), lo cual es correcto: «el enfermo» es el sujeto de la oracion.</li><li><strong>«grave»</strong>: Adjetivo calificativo (AQ0CS0). La transicion «NCMS000 → AQ0CS0» (sustantivo → adjetivo) es natural. Correcto.</li><li><strong>«habla»</strong>: En esta posicion, despues de un adjetivo, la transicion «AQ0CS0 → VMIP3S0» (adjetivo → verbo) favorece la etiqueta verbal. «habla» funciona aqui como el verbo principal de la oracion. El modelo deberia asignar VMIP3S0, lo cual es correcto.</li><li><strong>«de»</strong>: Preposicion (SPS00). Correcto.</li><li><strong>«trasplantes»</strong>: Sustantivo comun masculino plural (NCMP000). Correcto.</li><li><strong>«.»</strong>: Signo de puntuacion (Fp). Correcto.</li></ul><p><strong>Comparacion clave:</strong> Aunque ambas oraciones comparten las mismas palabras, el cambio de orden puede afectar la etiqueta de «Habla/habla» y «enfermo». En la primera oracion, «Habla» en posicion inicial recibe su etiqueta influida por la probabilidad inicial del modelo. En la segunda, «habla» recibe su etiqueta influida por la transicion desde el adjetivo «grave». Las probabilidades de transicion de bigramas cambian segun el contexto inmediato, demostrando la dependencia del modelo HMM respecto al orden de las palabras.</p>'),
(3,
 'Cuales son las limitaciones del etiquetador?',
 '<p>El etiquetador basado en HMM con algoritmo de Viterbi presenta las siguientes <strong>limitaciones</strong>:</p><ul class="list-disc pl-5 space-y-2"><li><strong>Contexto limitado a bigramas:</strong> El modelo de Markov de primer orden solo considera la etiqueta inmediatamente anterior para determinar la etiqueta actual. Esto impide capturar dependencias a larga distancia (por ejemplo, la concordancia sujeto-verbo cuando hay subordinadas intercaladas).</li><li><strong>Dependencia del corpus de entrenamiento:</strong> La calidad del etiquetado depende directamente del tamano, dominio y calidad de las anotaciones del corpus EAGLES utilizado. Un corpus pequeno o sesgado hacia un dominio especifico generara probabilidades poco representativas del idioma general.</li><li><strong>Manejo deficiente de palabras desconocidas:</strong> Las palabras que no aparecen en el corpus de entrenamiento (out-of-vocabulary, OOV) no tienen probabilidades de emision calculadas. El modelo debe recurrir a heuristicas simples (como asignar probabilidad uniforme), lo que degrada significativamente la precision.</li><li><strong>Ausencia de analisis morfologico:</strong> El modelo no analiza la estructura interna de las palabras (prefijos, sufijos, flexiones). No puede inferir, por ejemplo, que una palabra terminada en «-mente» es probablemente un adverbio, o que «-cion» indica un sustantivo.</li><li><strong>Sensibilidad a mayusculas y minusculas:</strong> El modelo diferencia entre «Habla» y «habla», lo que puede causar que la misma palabra tenga diferentes probabilidades de emision segun su capitalizacion, especialmente relevante al inicio de oracion.</li><li><strong>Sin comprension semantica:</strong> El modelo no entiende el significado de las palabras. Dos oraciones con la misma estructura sintactica pero significados muy diferentes recibiran etiquetas identicas. No puede resolver ambiguedades que requieren conocimiento del mundo.</li><li><strong>Dispersion de datos (data sparsity):</strong> Muchas combinaciones de bigramas de etiquetas pueden no aparecer en el corpus de entrenamiento, generando probabilidades de transicion nulas que bloquean caminos potencialmente correctos en el algoritmo de Viterbi.</li><li><strong>Suposicion de independencia de las emisiones:</strong> El modelo HMM asume que la probabilidad de observar una palabra depende unicamente de su etiqueta, no de las palabras circundantes. Esto es una simplificacion que no refleja la realidad del lenguaje.</li></ul>'),
(4,
 'Que mejoras se podrian aplicar?',
 '<p>Para superar las limitaciones identificadas, se podrian aplicar las siguientes <strong>mejoras</strong>:</p><ul class="list-disc pl-5 space-y-2"><li><strong>Modelos de trigramas o n-gramas superiores:</strong> Extender el modelo de Markov a segundo o tercer orden para considerar 2 o 3 etiquetas anteriores en las probabilidades de transicion. Esto permite capturar patrones sintacticos mas complejos como «Det + Adj + Nombre» o «Nombre + Prep + Nombre», mejorando la resolucion de ambiguedades.</li><li><strong>Tecnicas de suavizado (smoothing):</strong><ul class="list-disc pl-5 mt-1 space-y-1"><li><em>Suavizado de Laplace (add-one):</em> Anadir una pseudocuenta a todas las combinaciones para evitar probabilidades nulas.</li><li><em>Good-Turing:</em> Redistribuir la masa de probabilidad de eventos frecuentes hacia eventos no observados.</li><li><em>Interpolacion de Jelinek-Mercer:</em> Combinar modelos de diferente orden (unigramas, bigramas, trigramas) con pesos optimizados.</li><li><em>Backoff de Katz:</em> Usar modelos de orden inferior cuando las estimaciones de orden superior no son confiables.</li></ul></li><li><strong>Manejo de palabras desconocidas basado en sufijos:</strong> Implementar un clasificador morfologico que analice los sufijos de las palabras desconocidas para estimar su categoria gramatical. Por ejemplo, asignar mayor probabilidad de sustantivo a palabras terminadas en «-cion», «-miento», «-dad»; y mayor probabilidad de adverbio a las terminadas en «-mente».</li><li><strong>Corpus mas grande y/o especifico del dominio:</strong> Entrenar con corpus mas extensos (como AnCora o corpus periodisticos) que proporcionen mayor cobertura lexica y mejores estimaciones de probabilidad. Para aplicaciones especializadas, incorporar corpus del dominio especifico (medico, juridico, tecnico).</li><li><strong>Modelos CRF (Campos Aleatorios Condicionales):</strong> Reemplazar el HMM por un CRF que permita incorporar multiples caracteristicas (features) de la palabra y su contexto: prefijos, sufijos, capitalizacion, posicion en la oracion, palabras vecinas, etc. Los CRF no requieren la suposicion de independencia de las emisiones.</li><li><strong>Modelos basados en redes neuronales:</strong> Utilizar arquitecturas modernas como:<ul class="list-disc pl-5 mt-1 space-y-1"><li><em>BiLSTM-CRF:</em> Redes recurrentes bidireccionales con capa CRF, que capturan contexto tanto hacia adelante como hacia atras.</li><li><em>Transformers:</em> Modelos como BERT o RoBERTa preentrenados en espanol que ofrecen representaciones contextualizadas de alta calidad.</li></ul></li><li><strong>Metodos de ensamble (ensemble):</strong> Combinar las predicciones de multiples modelos (HMM, CRF, redes neuronales) mediante votacion o apilamiento para obtener etiquetados mas robustos que los de cualquier modelo individual.</li><li><strong>Normalizacion de texto:</strong> Preprocesar el texto para normalizar mayusculas, acentos y signos de puntuacion antes del etiquetado, reduciendo la variabilidad artificial causada por diferencias superficiales.</li></ul>');

-- Ejemplos de etiquetas EAGLES comunes
CREATE TABLE IF NOT EXISTS etqmorf_eagles_examples (
    id BIGSERIAL PRIMARY KEY,
    tag VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posiciones de la estructura de etiquetas EAGLES
CREATE TABLE IF NOT EXISTS etqmorf_eagles_positions (
    id BIGSERIAL PRIMARY KEY,
    position VARCHAR(5) NOT NULL,
    attribute VARCHAR(50) NOT NULL,
    possible_values TEXT NOT NULL,
    example_char VARCHAR(5) DEFAULT '',
    color_class TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist de verificacion de entregables para la pagina de exports
CREATE TABLE IF NOT EXISTS etqmorf_export_checklist (
    id BIGSERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: 9 items del checklist de entregables
INSERT INTO etqmorf_export_checklist (label, sort_order) VALUES
    ('Codigo Python completo y comentado en espanol', 1),
    ('Tablas de probabilidades de emision (Excel)', 2),
    ('Tablas de probabilidades de transicion (Excel)', 3),
    ('Etiquetado de "Habla con el enfermo grave de trasplantes."', 4),
    ('Matriz de Viterbi (Excel)', 5),
    ('Etiquetado de "El enfermo grave habla de trasplantes."', 6),
    ('Comparacion de ambos etiquetados', 7),
    ('Respuestas a las 4 preguntas', 8),
    ('Jupyter Notebook completo', 9);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tag_counts_tag ON etqmorf_tag_counts(tag);
CREATE INDEX IF NOT EXISTS idx_emission_probs_tag ON etqmorf_emission_probs(tag);
CREATE INDEX IF NOT EXISTS idx_transition_probs_prev ON etqmorf_transition_probs(tag_prev);
CREATE INDEX IF NOT EXISTS idx_transition_probs_next ON etqmorf_transition_probs(tag_next);
CREATE INDEX IF NOT EXISTS idx_tagging_results_created ON etqmorf_tagging_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_export_checklist_sort ON etqmorf_export_checklist(sort_order);
CREATE INDEX IF NOT EXISTS idx_quick_sentences_sort ON etqmorf_quick_sentences(sort_order);
CREATE INDEX IF NOT EXISTS idx_analysis_questions_sort ON etqmorf_analysis_questions(sort_order);
CREATE INDEX IF NOT EXISTS idx_eagles_examples_sort ON etqmorf_eagles_examples(sort_order);
CREATE INDEX IF NOT EXISTS idx_eagles_positions_sort ON etqmorf_eagles_positions(sort_order);

-- Habilitar RLS (Row Level Security) - ajustar según necesidades
ALTER TABLE etqmorf_corpus_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE etqmorf_tag_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE etqmorf_emission_probs ENABLE ROW LEVEL SECURITY;
ALTER TABLE etqmorf_transition_probs ENABLE ROW LEVEL SECURITY;
ALTER TABLE etqmorf_tagging_results ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (ajustar para producción)
CREATE POLICY "Allow all on etqmorf_corpus_stats" ON etqmorf_corpus_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on etqmorf_tag_counts" ON etqmorf_tag_counts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on etqmorf_emission_probs" ON etqmorf_emission_probs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on etqmorf_transition_probs" ON etqmorf_transition_probs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on etqmorf_tagging_results" ON etqmorf_tagging_results FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE etqmorf_export_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on etqmorf_export_checklist" ON etqmorf_export_checklist FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE etqmorf_quick_sentences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on etqmorf_quick_sentences" ON etqmorf_quick_sentences FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE etqmorf_analysis_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on etqmorf_analysis_questions" ON etqmorf_analysis_questions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE etqmorf_eagles_examples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on etqmorf_eagles_examples" ON etqmorf_eagles_examples FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE etqmorf_eagles_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on etqmorf_eagles_positions" ON etqmorf_eagles_positions FOR ALL USING (true) WITH CHECK (true);
