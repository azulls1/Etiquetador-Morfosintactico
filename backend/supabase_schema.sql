-- ============================================================
-- Schema SQL para Supabase: Etiquetador Morfosintáctico HMM
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Estadísticas del corpus
CREATE TABLE IF NOT EXISTS corpus_stats (
    id BIGSERIAL PRIMARY KEY,
    total_tokens BIGINT DEFAULT 0,
    total_sentences BIGINT DEFAULT 0,
    total_documents BIGINT DEFAULT 0,
    unique_tags INTEGER DEFAULT 0,
    unique_words INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conteos de etiquetas
CREATE TABLE IF NOT EXISTS tag_counts (
    id BIGSERIAL PRIMARY KEY,
    tag VARCHAR(20) NOT NULL,
    count BIGINT DEFAULT 0,
    UNIQUE(tag)
);

-- Probabilidades de emisión agrupadas por etiqueta
CREATE TABLE IF NOT EXISTS emission_probs (
    id BIGSERIAL PRIMARY KEY,
    tag VARCHAR(20) NOT NULL,
    probabilities JSONB NOT NULL DEFAULT '{}',
    UNIQUE(tag)
);

-- Probabilidades de transición
CREATE TABLE IF NOT EXISTS transition_probs (
    id BIGSERIAL PRIMARY KEY,
    tag_prev VARCHAR(20) NOT NULL,
    tag_next VARCHAR(20) NOT NULL,
    probability DOUBLE PRECISION DEFAULT 0,
    count BIGINT DEFAULT 0,
    UNIQUE(tag_prev, tag_next)
);

-- Resultados de etiquetado (historial)
CREATE TABLE IF NOT EXISTS tagging_results (
    id BIGSERIAL PRIMARY KEY,
    sentence TEXT NOT NULL,
    tokens JSONB NOT NULL DEFAULT '[]',
    tags JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tag_counts_tag ON tag_counts(tag);
CREATE INDEX IF NOT EXISTS idx_emission_probs_tag ON emission_probs(tag);
CREATE INDEX IF NOT EXISTS idx_transition_probs_prev ON transition_probs(tag_prev);
CREATE INDEX IF NOT EXISTS idx_transition_probs_next ON transition_probs(tag_next);
CREATE INDEX IF NOT EXISTS idx_tagging_results_created ON tagging_results(created_at DESC);

-- Habilitar RLS (Row Level Security) - ajustar según necesidades
ALTER TABLE corpus_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_probs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_probs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagging_results ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (ajustar para producción)
CREATE POLICY "Allow all on corpus_stats" ON corpus_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tag_counts" ON tag_counts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on emission_probs" ON emission_probs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transition_probs" ON transition_probs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tagging_results" ON tagging_results FOR ALL USING (true) WITH CHECK (true);
