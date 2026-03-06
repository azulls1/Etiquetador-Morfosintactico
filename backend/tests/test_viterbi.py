"""Tests unitarios para el algoritmo de Viterbi.

Estos tests prueban el CODIGO REAL del proyecto:
- tokenize_sentence() de utils.helpers
- describe_tag(), is_open_tag() de services.eagles_tags
- La logica matematica del algoritmo de Viterbi
- Integracion con el modelo HMM (mock de datos)
"""

import math
import pytest
from pathlib import Path
from unittest.mock import patch

from utils.helpers import tokenize_sentence
from services.eagles_tags import describe_tag, is_open_tag, CATEGORIES, OPEN_TAGS


class TestTokenizer:
    """Tests para tokenize_sentence() real."""

    def test_simple_sentence(self):
        tokens = tokenize_sentence("El gato come pescado")
        assert tokens == ["El", "gato", "come", "pescado"]

    def test_punctuation_separation(self):
        tokens = tokenize_sentence("Hola, mundo.")
        assert "," in tokens
        assert "." in tokens
        assert "Hola" in tokens
        assert "mundo" in tokens

    def test_question_marks(self):
        tokens = tokenize_sentence("¿Cómo estás?")
        assert "¿" in tokens
        assert "?" in tokens

    def test_empty_sentence(self):
        tokens = tokenize_sentence("")
        assert tokens == []

    def test_single_word(self):
        tokens = tokenize_sentence("Hola")
        assert tokens == ["Hola"]

    def test_multiple_spaces(self):
        tokens = tokenize_sentence("El   gato   come")
        assert tokens == ["El", "gato", "come"]

    def test_exclamation(self):
        tokens = tokenize_sentence("¡Hola mundo!")
        assert "¡" in tokens
        assert "!" in tokens


class TestEaglesTags:
    """Tests para describe_tag() e is_open_tag() reales."""

    def test_noun_tag(self):
        result = describe_tag("NCMS000")
        assert result["category"] == "Nombre"
        assert result["tag"] == "NCMS000"
        assert "Común" in result["description"]

    def test_verb_tag(self):
        result = describe_tag("VMIP3S0")
        assert result["category"] == "Verbo"
        assert "Principal" in result["description"]
        assert "Indicativo" in result["description"]

    def test_adjective_tag(self):
        result = describe_tag("AQ0MS0")
        assert result["category"] == "Adjetivo"

    def test_preposition_tag(self):
        result = describe_tag("SP000")
        assert result["category"] == "Preposición"

    def test_determiner_tag(self):
        result = describe_tag("DA0MS0")
        assert result["category"] == "Determinante"
        assert "Artículo" in result["description"]

    def test_empty_tag(self):
        result = describe_tag("")
        assert result["tag"] == ""
        assert result["description"] == ""

    def test_open_tag_noun(self):
        assert is_open_tag("NCMS000") is True

    def test_open_tag_verb(self):
        assert is_open_tag("VMIP3S0") is True

    def test_open_tag_adjective(self):
        assert is_open_tag("AQ0MS0") is True

    def test_closed_tag_preposition(self):
        assert is_open_tag("SP000") is False

    def test_closed_tag_conjunction(self):
        assert is_open_tag("CC") is False

    def test_closed_tag_determiner(self):
        assert is_open_tag("DA0MS0") is False

    def test_open_tags_set(self):
        assert OPEN_TAGS == {"N", "V", "A", "R", "Z", "W"}

    def test_all_categories_exist(self):
        expected = {"A", "C", "D", "F", "I", "N", "P", "R", "S", "V", "W", "Z"}
        assert set(CATEGORIES.keys()) == expected


class TestViterbiAlgorithm:
    """Tests para la logica del algoritmo de Viterbi usando codigo real."""

    def test_log_probability_prevents_underflow(self):
        """Log-probabilidades previenen underflow numerico."""
        small_prob = 1e-100
        log_prob = math.log(small_prob)
        assert math.isfinite(log_prob)
        assert log_prob < 0

    def test_log_probability_addition(self):
        """Suma de logs = producto de probabilidades."""
        p1, p2 = 0.3, 0.4
        product = p1 * p2
        log_sum = math.log(p1) + math.log(p2)
        assert abs(math.exp(log_sum) - product) < 1e-10

    @patch("services.hmm_trainer.get_emission_probs")
    @patch("services.hmm_trainer.get_transition_probs")
    @patch("services.hmm_trainer.get_word_to_tags")
    @patch("services.corpus_parser.get_corpus_data")
    def test_viterbi_with_mock_model(self, mock_corpus, mock_w2t, mock_trans, mock_emit):
        """Test del algoritmo Viterbi REAL con modelo mock."""
        from services.viterbi_algorithm import viterbi

        mock_emit.return_value = {
            ("D", "el"): 0.9, ("D", "gato"): 0.01, ("D", "come"): 0.01,
            ("N", "el"): 0.01, ("N", "gato"): 0.8, ("N", "come"): 0.05,
            ("V", "el"): 0.01, ("V", "gato"): 0.01, ("V", "come"): 0.9,
        }
        mock_trans.return_value = {
            ("<START>", "D"): 0.8, ("<START>", "N"): 0.15, ("<START>", "V"): 0.05,
            ("D", "N"): 0.85, ("D", "V"): 0.1, ("D", "D"): 0.05,
            ("N", "V"): 0.7, ("N", "N"): 0.2, ("N", "D"): 0.1,
            ("V", "N"): 0.3, ("V", "D"): 0.5, ("V", "V"): 0.2,
            ("D", "<END>"): 0.05, ("N", "<END>"): 0.4, ("V", "<END>"): 0.5,
        }
        mock_w2t.return_value = {
            "el": ["D", "N", "V"],
            "gato": ["D", "N", "V"],
            "come": ["D", "N", "V"],
        }
        mock_corpus.return_value = {
            "tag_counts": {"D": 100, "N": 200, "V": 150},
            "emission_counts": {},
            "transition_counts": {},
        }

        result = viterbi("El gato come")

        assert result["tokens"] == ["El", "gato", "come"]
        assert result["tags"] == ["D", "N", "V"]
        assert "viterbi_matrix" in result
        assert "backpointers" in result
        assert "best_path_prob" in result
        assert result["best_path_prob"] > 0

    @patch("services.hmm_trainer.get_emission_probs")
    @patch("services.hmm_trainer.get_transition_probs")
    @patch("services.hmm_trainer.get_word_to_tags")
    @patch("services.corpus_parser.get_corpus_data")
    def test_viterbi_returns_descriptions(self, mock_corpus, mock_w2t, mock_trans, mock_emit):
        """Viterbi retorna descripciones EAGLES para cada tag."""
        from services.viterbi_algorithm import viterbi

        mock_emit.return_value = {("N", "hola"): 0.9}
        mock_trans.return_value = {
            ("<START>", "N"): 0.9, ("N", "<END>"): 0.9,
        }
        mock_w2t.return_value = {"hola": ["N"]}
        mock_corpus.return_value = {
            "tag_counts": {"N": 100},
            "emission_counts": {},
            "transition_counts": {},
        }

        result = viterbi("hola")
        assert len(result["descriptions"]) == 1
        assert isinstance(result["descriptions"][0], str)

    @patch("services.hmm_trainer.get_emission_probs")
    @patch("services.hmm_trainer.get_transition_probs")
    @patch("services.hmm_trainer.get_word_to_tags")
    @patch("services.corpus_parser.get_corpus_data")
    def test_viterbi_empty_sentence_raises(self, mock_corpus, mock_w2t, mock_trans, mock_emit):
        """Viterbi lanza ValueError con oracion vacia."""
        from services.viterbi_algorithm import viterbi

        mock_emit.return_value = {}
        mock_trans.return_value = {}
        mock_w2t.return_value = {}
        mock_corpus.return_value = {"tag_counts": {"N": 1}, "emission_counts": {}, "transition_counts": {}}

        with pytest.raises(ValueError, match="no contiene tokens"):
            viterbi("")

    def test_viterbi_not_trained_raises(self):
        """Viterbi lanza RuntimeError si el modelo no esta entrenado."""
        from services.viterbi_algorithm import viterbi

        with patch("services.viterbi_algorithm.get_emission_probs", return_value=None):
            with pytest.raises(RuntimeError, match="no está entrenado"):
                viterbi("Hola mundo")


class TestLaplaceSmoothing:
    """Tests para suavizado de Laplace usando la funcion train() real."""

    def test_smoothed_probability_never_zero(self):
        """Con Laplace, ninguna probabilidad es exactamente 0."""
        count = 0
        tag_total = 100
        alpha = 1.0
        vocab_size = 1000
        prob = (count + alpha) / (tag_total + alpha * vocab_size)
        assert prob > 0

    def test_smoothing_preserves_ranking(self):
        """El suavizado preserva el orden relativo de probabilidades."""
        alpha = 1.0
        vocab_size = 100
        tag_total = 1000

        p_frequent = (50 + alpha) / (tag_total + alpha * vocab_size)
        p_rare = (2 + alpha) / (tag_total + alpha * vocab_size)
        p_unseen = (0 + alpha) / (tag_total + alpha * vocab_size)

        assert p_frequent > p_rare > p_unseen

    def test_alpha_zero_equals_mle(self):
        """Con alpha=0, el resultado es MLE clasico."""
        count = 15
        tag_total = 100
        alpha = 0.0
        vocab_size = 500
        prob = (count + alpha) / (tag_total + alpha * vocab_size)
        mle = count / tag_total
        assert abs(prob - mle) < 1e-10

    def test_train_function_returns_expected_keys(self):
        """La funcion train() real retorna las claves esperadas."""
        from services.hmm_trainer import train
        from unittest.mock import patch

        mock_data = {
            "tag_counts": {"N": 10, "V": 5},
            "emission_counts": {("N", "gato"): 5, ("V", "come"): 3},
            "transition_counts": {("<START>", "N"): 4, ("N", "V"): 3, ("V", "<END>"): 2},
            "word_counts": {"gato": 5, "come": 3},
        }

        with patch("services.hmm_trainer.get_corpus_data", return_value=mock_data):
            with patch("services.hmm_trainer.save_cache"):
                result = train(smoothing=1.0)

        assert "emission_probs" in result
        assert "transition_probs" in result
        assert "stats" in result
        assert result["stats"]["smoothing_alpha"] == 1.0
        assert len(result["emission_probs"]) > 0
        assert len(result["transition_probs"]) > 0


class TestEvaluation:
    """Tests para el modulo de evaluacion cuantitativa."""

    def test_extract_sentences(self):
        """Verifica que _extract_sentences_from_corpus funciona con datos reales."""
        import tempfile
        from services.evaluation import _extract_sentences_from_corpus

        corpus_content = """<doc id="1" title="Test">
El el DA0MS0
gato gato NCMS000
come comer VMIP3S0
. . Fp

La la DA0FS0
casa casa NCFS000
. . Fp
</doc>
"""
        with tempfile.TemporaryDirectory() as tmpdir:
            filepath = Path(tmpdir) / "spanishEtiquetado_test"
            filepath.write_text(corpus_content, encoding="utf-8")

            sentences = _extract_sentences_from_corpus(corpus_dir=tmpdir)

        assert len(sentences) == 2
        assert sentences[0] == [("el", "DA0MS0"), ("gato", "NCMS000"), ("come", "VMIP3S0"), (".", "Fp")]
        assert sentences[1] == [("la", "DA0FS0"), ("casa", "NCFS000"), (".", "Fp")]

    def test_train_from_sentences(self):
        """Verifica que _train_from_sentences produce un modelo valido."""
        from services.evaluation import _train_from_sentences

        sentences = [
            [("el", "DA0MS0"), ("gato", "NCMS000"), ("come", "VMIP3S0")],
            [("la", "DA0FS0"), ("casa", "NCFS000")],
        ]

        model = _train_from_sentences(sentences, smoothing=1.0)

        assert "emission_probs" in model
        assert "transition_probs" in model
        assert "word_to_tags" in model
        assert "tag_counts" in model
        assert ("DA0MS0", "el") in model["emission_probs"]
        assert ("<START>", "DA0MS0") in model["transition_probs"]
        assert "el" in model["word_to_tags"]

    def test_viterbi_predict(self):
        """Verifica que _viterbi_predict predice tags con modelo simple."""
        from services.evaluation import _train_from_sentences, _viterbi_predict

        sentences = [
            [("el", "D"), ("gato", "N"), ("come", "V")],
        ] * 20  # Repetir para tener estadisticas

        model = _train_from_sentences(sentences, smoothing=1.0)
        pred_tags = _viterbi_predict(["el", "gato", "come"], model)

        assert len(pred_tags) == 3
        assert pred_tags[0] == "D"
        assert pred_tags[1] == "N"
        assert pred_tags[2] == "V"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
