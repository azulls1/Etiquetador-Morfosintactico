"""Modulo de evaluacion cuantitativa del etiquetador HMM.

Implementa train/test split, calculo de metricas (accuracy, precision,
recall, F1-score) y confusion matrix para la defensa de tesis.
"""

import logging
import math
import random
from collections import Counter, defaultdict
from typing import Optional

from services.corpus_parser import get_corpus_data, _try_read_file
from services.hmm_trainer import get_emission_probs, get_transition_probs, get_word_to_tags
from services.eagles_tags import is_open_tag, describe_tag
from config import CORPUS_DIR
from pathlib import Path

logger = logging.getLogger(__name__)

UNKNOWN_PROB = 1e-10


def _extract_sentences_from_corpus(corpus_dir: Optional[str] = None, max_files: Optional[int] = None) -> list[list[tuple[str, str]]]:
    """Extrae oraciones como listas de (word, tag) del corpus.

    Returns:
        Lista de oraciones, cada oracion es lista de tuplas (word, tag).
    """
    corpus_path = Path(corpus_dir or CORPUS_DIR)
    if not corpus_path.exists():
        raise FileNotFoundError(f"Directorio del corpus no encontrado: {corpus_path}")

    files = sorted([
        f for f in corpus_path.iterdir()
        if f.is_file() and f.name.startswith("spanishEtiquetado")
    ])
    if not files:
        raise FileNotFoundError(f"No se encontraron archivos spanishEtiquetado en: {corpus_path}")

    if max_files:
        files = files[:max_files]

    sentences = []
    current_sentence: list[tuple[str, str]] = []

    for filepath in files:
        lines = _try_read_file(str(filepath))
        if lines is None:
            continue

        for line in lines:
            line = line.strip()

            if line.startswith("<doc") or line.startswith("</doc"):
                if current_sentence:
                    sentences.append(current_sentence)
                    current_sentence = []
                continue

            if not line:
                if current_sentence:
                    sentences.append(current_sentence)
                    current_sentence = []
                continue

            parts = line.split()
            if len(parts) < 3:
                continue

            word = parts[0].lower()
            tag = parts[2]

            if word == "endofarticle":
                continue

            current_sentence.append((word, tag))

        if current_sentence:
            sentences.append(current_sentence)
            current_sentence = []

    return sentences


def _train_from_sentences(sentences: list[list[tuple[str, str]]], smoothing: float = 1.0) -> dict:
    """Entrena un modelo HMM desde una lista de oraciones.

    Returns:
        dict con emission_probs, transition_probs, word_to_tags, tag_counts.
    """
    tag_counts: Counter = Counter()
    emission_counts: Counter = Counter()
    transition_counts: Counter = Counter()
    word_counts: Counter = Counter()

    for sentence in sentences:
        prev_tag = None
        for i, (word, tag) in enumerate(sentence):
            tag_counts[tag] += 1
            emission_counts[(tag, word)] += 1
            word_counts[word] += 1

            if i == 0:
                transition_counts[("<START>", tag)] += 1
            elif prev_tag is not None:
                transition_counts[(prev_tag, tag)] += 1

            prev_tag = tag

        if prev_tag is not None:
            transition_counts[(prev_tag, "<END>")] += 1

    alpha = smoothing
    vocab_size = len(word_counts) if word_counts else 1
    n_tags = len(tag_counts)

    emission_probs = {}
    word_to_tags: dict[str, set] = {}

    for (tag, word), count in emission_counts.items():
        tag_total = tag_counts.get(tag, 1)
        emission_probs[(tag, word)] = (count + alpha) / (tag_total + alpha * vocab_size)
        if word not in word_to_tags:
            word_to_tags[word] = set()
        word_to_tags[word].add(tag)

    word_to_tags_serializable = {w: list(tags) for w, tags in word_to_tags.items()}

    transition_totals = {}
    for (prev_tag, next_tag), count in transition_counts.items():
        transition_totals[prev_tag] = transition_totals.get(prev_tag, 0) + count

    transition_probs = {}
    for (prev_tag, next_tag), count in transition_counts.items():
        total = transition_totals.get(prev_tag, 1)
        transition_probs[(prev_tag, next_tag)] = (count + alpha) / (total + alpha * n_tags)

    return {
        "emission_probs": emission_probs,
        "transition_probs": transition_probs,
        "word_to_tags": word_to_tags_serializable,
        "tag_counts": dict(tag_counts),
    }


def _viterbi_predict(tokens: list[str], model: dict) -> list[str]:
    """Ejecuta Viterbi con un modelo dado y retorna las etiquetas predichas."""
    emission_probs = model["emission_probs"]
    transition_probs = model["transition_probs"]
    word_to_tags = model["word_to_tags"]
    all_tags = list(model["tag_counts"].keys())

    possible_tags_per_token = []
    for token in tokens:
        word = token.lower()
        if word_to_tags and word in word_to_tags:
            possible = set(word_to_tags[word])
        else:
            possible = {t for t in all_tags if is_open_tag(t)}
            if not possible:
                possible = set(all_tags)
        possible_tags_per_token.append(sorted(possible))

    # Inicializacion
    viterbi_matrix = []
    backpointers = []

    first_word = tokens[0].lower()
    v0 = {}
    for tag in possible_tags_per_token[0]:
        trans_p = transition_probs.get(("<START>", tag), UNKNOWN_PROB)
        emit_p = emission_probs.get((tag, first_word), UNKNOWN_PROB)
        v0[tag] = math.log(trans_p) + math.log(emit_p)
    viterbi_matrix.append(v0)
    backpointers.append({tag: "<START>" for tag in v0})

    # Recursion
    for t in range(1, len(tokens)):
        word = tokens[t].lower()
        vt = {}
        bt = {}
        for tag in possible_tags_per_token[t]:
            emit_p = emission_probs.get((tag, word), UNKNOWN_PROB)
            log_emit = math.log(emit_p)
            best_log_prob = -math.inf
            best_prev_tag = None
            for prev_tag in possible_tags_per_token[t - 1]:
                if prev_tag not in viterbi_matrix[t - 1]:
                    continue
                prev_log_prob = viterbi_matrix[t - 1][prev_tag]
                trans_p = transition_probs.get((prev_tag, tag), UNKNOWN_PROB)
                log_prob = prev_log_prob + math.log(trans_p) + log_emit
                if log_prob > best_log_prob:
                    best_log_prob = log_prob
                    best_prev_tag = prev_tag
            if best_prev_tag is not None:
                vt[tag] = best_log_prob
                bt[tag] = best_prev_tag
        viterbi_matrix.append(vt)
        backpointers.append(bt)

    # Terminacion
    last_v = viterbi_matrix[-1]
    best_final_prob = -math.inf
    best_final_tag = None
    for tag, log_prob in last_v.items():
        end_trans = transition_probs.get((tag, "<END>"), UNKNOWN_PROB)
        final_prob = log_prob + math.log(end_trans)
        if final_prob > best_final_prob:
            best_final_prob = final_prob
            best_final_tag = tag

    if best_final_tag is None:
        best_final_tag = max(last_v, key=last_v.get)

    # Backtrace
    best_tags = [best_final_tag]
    for t in range(len(tokens) - 1, 0, -1):
        prev_tag = backpointers[t].get(best_tags[-1], best_tags[-1])
        best_tags.append(prev_tag)
    best_tags.reverse()

    return best_tags


def evaluate(
    test_ratio: float = 0.1,
    smoothing: float = 1.0,
    seed: int = 42,
    max_files: Optional[int] = None,
    top_n_tags: int = 20,
) -> dict:
    """Ejecuta evaluacion completa con train/test split.

    Args:
        test_ratio: Porcentaje del corpus para test (0.0-1.0).
        smoothing: Parametro alpha de Laplace.
        seed: Semilla para reproducibilidad.
        max_files: Limite de archivos del corpus.
        top_n_tags: Cantidad de tags para la confusion matrix.

    Returns:
        dict con metricas globales, por tag, y confusion matrix.
    """
    logger.info(f"Iniciando evaluacion (test_ratio={test_ratio}, smoothing={smoothing}, seed={seed})")

    # 1. Extraer oraciones del corpus
    sentences = _extract_sentences_from_corpus(max_files=max_files)
    total_sentences = len(sentences)

    if total_sentences < 10:
        raise RuntimeError(f"Corpus muy pequeno para evaluar ({total_sentences} oraciones). Minimo 10.")

    # 2. Train/test split
    random.seed(seed)
    indices = list(range(total_sentences))
    random.shuffle(indices)

    split_point = int(total_sentences * (1 - test_ratio))
    train_indices = set(indices[:split_point])
    test_indices = set(indices[split_point:])

    train_sentences = [sentences[i] for i in sorted(train_indices)]
    test_sentences = [sentences[i] for i in sorted(test_indices)]

    logger.info(f"Split: {len(train_sentences)} train, {len(test_sentences)} test")

    # 3. Entrenar modelo solo con train
    model = _train_from_sentences(train_sentences, smoothing=smoothing)

    # 4. Evaluar en test
    all_true_tags = []
    all_pred_tags = []
    unknown_word_count = 0
    total_tokens_eval = 0
    correct_tokens = 0

    per_sentence_results = []

    for sentence in test_sentences:
        tokens = [word for word, tag in sentence]
        true_tags = [tag for word, tag in sentence]

        if not tokens:
            continue

        pred_tags = _viterbi_predict(tokens, model)

        # Contar palabras desconocidas
        for token in tokens:
            if token.lower() not in model["word_to_tags"]:
                unknown_word_count += 1

        total_tokens_eval += len(tokens)
        sentence_correct = sum(1 for t, p in zip(true_tags, pred_tags) if t == p)
        correct_tokens += sentence_correct

        all_true_tags.extend(true_tags)
        all_pred_tags.extend(pred_tags)

        per_sentence_results.append({
            "tokens": tokens[:10],  # Solo primeros 10 para no saturar
            "accuracy": sentence_correct / len(tokens) if tokens else 0,
            "length": len(tokens),
        })

    # 5. Calcular metricas globales
    global_accuracy = correct_tokens / total_tokens_eval if total_tokens_eval > 0 else 0

    # 6. Metricas por tag
    all_tags_set = sorted(set(all_true_tags) | set(all_pred_tags))

    # Conteos por tag
    tp = Counter()  # True positives
    fp = Counter()  # False positives
    fn = Counter()  # False negatives

    for true, pred in zip(all_true_tags, all_pred_tags):
        if true == pred:
            tp[true] += 1
        else:
            fp[pred] += 1
            fn[true] += 1

    per_tag_metrics = []
    for tag in all_tags_set:
        tag_tp = tp[tag]
        tag_fp = fp[tag]
        tag_fn = fn[tag]

        precision = tag_tp / (tag_tp + tag_fp) if (tag_tp + tag_fp) > 0 else 0.0
        recall = tag_tp / (tag_tp + tag_fn) if (tag_tp + tag_fn) > 0 else 0.0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
        support = tag_tp + tag_fn  # Total real appearances

        tag_info = describe_tag(tag)

        per_tag_metrics.append({
            "tag": tag,
            "category": tag_info.get("category", tag[0] if tag else ""),
            "description": tag_info.get("description", ""),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "support": support,
            "true_positives": tag_tp,
            "false_positives": tag_fp,
            "false_negatives": tag_fn,
        })

    per_tag_metrics.sort(key=lambda x: x["support"], reverse=True)

    # 7. Metricas macro y weighted
    tags_with_support = [m for m in per_tag_metrics if m["support"] > 0]
    total_support = sum(m["support"] for m in tags_with_support)

    macro_precision = sum(m["precision"] for m in tags_with_support) / len(tags_with_support) if tags_with_support else 0
    macro_recall = sum(m["recall"] for m in tags_with_support) / len(tags_with_support) if tags_with_support else 0
    macro_f1 = sum(m["f1_score"] for m in tags_with_support) / len(tags_with_support) if tags_with_support else 0

    weighted_precision = sum(m["precision"] * m["support"] for m in tags_with_support) / total_support if total_support > 0 else 0
    weighted_recall = sum(m["recall"] * m["support"] for m in tags_with_support) / total_support if total_support > 0 else 0
    weighted_f1 = sum(m["f1_score"] * m["support"] for m in tags_with_support) / total_support if total_support > 0 else 0

    # 8. Confusion matrix (top N tags por frecuencia)
    tag_freq = Counter(all_true_tags)
    top_tags = [tag for tag, _ in tag_freq.most_common(top_n_tags)]

    confusion = {}
    for true_tag in top_tags:
        row = {}
        for pred_tag in top_tags:
            count = sum(1 for t, p in zip(all_true_tags, all_pred_tags) if t == true_tag and p == pred_tag)
            row[pred_tag] = count
        confusion[true_tag] = row

    # 9. Distribucion de accuracy por oracion
    accuracies = [r["accuracy"] for r in per_sentence_results]
    avg_sentence_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
    min_sentence_accuracy = min(accuracies) if accuracies else 0
    max_sentence_accuracy = max(accuracies) if accuracies else 0

    result = {
        "split": {
            "total_sentences": total_sentences,
            "train_sentences": len(train_sentences),
            "test_sentences": len(test_sentences),
            "test_ratio": test_ratio,
            "seed": seed,
        },
        "global_metrics": {
            "accuracy": round(global_accuracy, 4),
            "total_tokens_evaluated": total_tokens_eval,
            "correct_tokens": correct_tokens,
            "unknown_words": unknown_word_count,
            "unknown_word_ratio": round(unknown_word_count / total_tokens_eval, 4) if total_tokens_eval > 0 else 0,
        },
        "macro_avg": {
            "precision": round(macro_precision, 4),
            "recall": round(macro_recall, 4),
            "f1_score": round(macro_f1, 4),
        },
        "weighted_avg": {
            "precision": round(weighted_precision, 4),
            "recall": round(weighted_recall, 4),
            "f1_score": round(weighted_f1, 4),
        },
        "per_tag_metrics": per_tag_metrics,
        "confusion_matrix": {
            "tags": top_tags,
            "matrix": confusion,
        },
        "sentence_accuracy_distribution": {
            "mean": round(avg_sentence_accuracy, 4),
            "min": round(min_sentence_accuracy, 4),
            "max": round(max_sentence_accuracy, 4),
            "total_sentences_evaluated": len(per_sentence_results),
        },
        "model_params": {
            "smoothing_alpha": smoothing,
            "vocabulary_size": len(model["word_to_tags"]),
            "unique_tags": len(model["tag_counts"]),
            "emission_count": len(model["emission_probs"]),
            "transition_count": len(model["transition_probs"]),
        },
    }

    logger.info(
        f"Evaluacion completada: accuracy={global_accuracy:.4f}, "
        f"weighted_f1={weighted_f1:.4f}, "
        f"{total_tokens_eval:,} tokens evaluados"
    )

    return result
