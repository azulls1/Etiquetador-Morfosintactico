"""Tests unitarios para el parser del corpus.

Estos tests prueban el CODIGO REAL del proyecto:
- _try_read_file() de services.corpus_parser
- parse_corpus() con corpus temporal
- search_word() con datos reales
- get_stats() con datos reales
"""

import pytest
import tempfile
from pathlib import Path
from unittest.mock import patch

from services.corpus_parser import _try_read_file, parse_corpus, search_word, get_stats


# Corpus Wikicorpus minimo para testing
SAMPLE_CORPUS = """<doc id="1" title="Test">
El el DA0MS0
gato gato NCMS000
come comer VMIP3S0
pescado pescado NCMS000
. . Fp

La la DA0FS0
casa casa NCFS000
es ser VSIP3S0
grande grande AQ0CS0
. . Fp
</doc>
"""


class TestFileReading:
    """Tests para _try_read_file() real."""

    def test_read_utf8_file(self, tmp_path):
        f = tmp_path / "test_utf8.txt"
        f.write_text("línea con acentos: ñ, ü, é", encoding="utf-8")
        lines = _try_read_file(str(f))
        assert lines is not None
        assert "ñ" in lines[0]

    def test_read_latin1_file(self, tmp_path):
        f = tmp_path / "test_latin1.txt"
        f.write_bytes("línea con ñ".encode("latin-1"))
        lines = _try_read_file(str(f))
        assert lines is not None


class TestCorpusParsing:
    """Tests para parse_corpus() REAL con corpus temporal."""

    @pytest.fixture
    def corpus_dir(self, tmp_path):
        """Crea un directorio de corpus temporal con datos de prueba."""
        filepath = tmp_path / "spanishEtiquetado_test"
        filepath.write_text(SAMPLE_CORPUS, encoding="utf-8")
        return str(tmp_path)

    def test_parse_corpus_returns_correct_structure(self, corpus_dir):
        """parse_corpus() retorna dict con las claves esperadas."""
        with patch("services.corpus_parser.save_cache"):
            result = parse_corpus(corpus_dir=corpus_dir)

        assert "tag_counts" in result
        assert "emission_counts" in result
        assert "transition_counts" in result
        assert "word_counts" in result
        assert "stats" in result

    def test_parse_corpus_tag_counts(self, corpus_dir):
        """parse_corpus() cuenta etiquetas correctamente."""
        with patch("services.corpus_parser.save_cache"):
            result = parse_corpus(corpus_dir=corpus_dir)

        tag_counts = result["tag_counts"]
        assert tag_counts["DA0MS0"] == 1   # "El"
        assert tag_counts["NCMS000"] == 2  # "gato", "pescado"
        assert tag_counts["VMIP3S0"] == 1  # "come"
        assert tag_counts["Fp"] == 2       # "." x2
        assert tag_counts["DA0FS0"] == 1   # "La"
        assert tag_counts["NCFS000"] == 1  # "casa"

    def test_parse_corpus_emission_counts(self, corpus_dir):
        """parse_corpus() cuenta emisiones (tag, word) correctamente."""
        with patch("services.corpus_parser.save_cache"):
            result = parse_corpus(corpus_dir=corpus_dir)

        ec = result["emission_counts"]
        assert ec[("DA0MS0", "el")] == 1
        assert ec[("NCMS000", "gato")] == 1
        assert ec[("NCMS000", "pescado")] == 1
        assert ec[("Fp", ".")] == 2

    def test_parse_corpus_transition_counts(self, corpus_dir):
        """parse_corpus() cuenta transiciones correctamente."""
        with patch("services.corpus_parser.save_cache"):
            result = parse_corpus(corpus_dir=corpus_dir)

        tc = result["transition_counts"]
        # Primera oracion: <START> -> DA0MS0 -> NCMS000 -> VMIP3S0 -> NCMS000 -> Fp -> <END>
        assert tc[("<START>", "DA0MS0")] == 1
        assert tc[("DA0MS0", "NCMS000")] == 1
        assert tc[("NCMS000", "VMIP3S0")] == 1
        assert tc[("Fp", "<END>")] == 2  # Ambas oraciones terminan con Fp

    def test_parse_corpus_stats(self, corpus_dir):
        """parse_corpus() calcula estadisticas correctas."""
        with patch("services.corpus_parser.save_cache"):
            result = parse_corpus(corpus_dir=corpus_dir)

        stats = result["stats"]
        assert stats["total_tokens"] == 10    # 5 + 5 tokens
        assert stats["total_sentences"] == 2
        assert stats["total_documents"] == 1
        assert stats["processed_files"] == 1

    def test_parse_corpus_word_lowercasing(self, corpus_dir):
        """parse_corpus() normaliza palabras a minusculas."""
        with patch("services.corpus_parser.save_cache"):
            result = parse_corpus(corpus_dir=corpus_dir)

        wc = result["word_counts"]
        assert "el" in wc
        assert "El" not in wc

    def test_parse_corpus_start_end_transitions(self, corpus_dir):
        """parse_corpus() registra transiciones <START> y <END>."""
        with patch("services.corpus_parser.save_cache"):
            result = parse_corpus(corpus_dir=corpus_dir)

        tc = result["transition_counts"]
        start_transitions = {k: v for k, v in tc.items() if k[0] == "<START>"}
        end_transitions = {k: v for k, v in tc.items() if k[1] == "<END>"}

        assert len(start_transitions) >= 1  # Al menos 1 tipo de inicio
        assert len(end_transitions) >= 1    # Al menos 1 tipo de final
        assert sum(start_transitions.values()) == 2  # 2 oraciones inician
        assert sum(end_transitions.values()) == 2    # 2 oraciones terminan

    def test_parse_corpus_nonexistent_dir_raises(self):
        """parse_corpus() lanza FileNotFoundError con directorio inexistente."""
        with pytest.raises(FileNotFoundError):
            parse_corpus(corpus_dir="/nonexistent/path")

    def test_parse_corpus_max_files(self, corpus_dir):
        """parse_corpus() respeta max_files."""
        with patch("services.corpus_parser.save_cache"):
            result = parse_corpus(corpus_dir=corpus_dir, max_files=1)
        assert result["stats"]["processed_files"] == 1


class TestSearchWord:
    """Tests para search_word() con datos reales."""

    def test_search_existing_word(self):
        """search_word() encuentra palabras del corpus."""
        mock_data = {
            "emission_counts": {
                ("NCMS000", "gato"): 15,
                ("VMIP3S0", "gato"): 2,
            },
            "tag_counts": {},
        }
        with patch("services.corpus_parser.get_corpus_data", return_value=mock_data):
            result = search_word("gato")

        assert result is not None
        assert result["word"] == "gato"
        assert "NCMS000" in result["tags"]
        assert result["total_occurrences"] == 17

    def test_search_nonexistent_word(self):
        """search_word() retorna None para palabras que no existen."""
        mock_data = {"emission_counts": {}, "tag_counts": {}}
        with patch("services.corpus_parser.get_corpus_data", return_value=mock_data):
            result = search_word("xyznotfound")
        assert result is None

    def test_search_case_insensitive(self):
        """search_word() busca en minusculas."""
        mock_data = {
            "emission_counts": {("NCMS000", "gato"): 10},
            "tag_counts": {},
        }
        with patch("services.corpus_parser.get_corpus_data", return_value=mock_data):
            result = search_word("Gato")
        assert result is not None
        assert result["word"] == "gato"


class TestGetStats:
    """Tests para get_stats() con datos reales."""

    def test_stats_with_loaded_corpus(self):
        """get_stats() retorna estadisticas cuando el corpus esta cargado."""
        mock_data = {
            "stats": {
                "total_tokens": 1000,
                "total_sentences": 50,
                "total_documents": 5,
                "unique_tags": 85,
                "unique_words": 500,
                "processed_files": 3,
            }
        }
        with patch("services.corpus_parser.get_corpus_data", return_value=mock_data):
            stats = get_stats()

        assert stats["is_loaded"] is True
        assert stats["total_tokens"] == 1000
        assert stats["unique_tags"] == 85

    def test_stats_without_corpus(self):
        """get_stats() retorna valores vacios sin corpus."""
        with patch("services.corpus_parser.get_corpus_data", return_value=None):
            stats = get_stats()

        assert stats["is_loaded"] is False
        assert stats["total_tokens"] == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
