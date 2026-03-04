"""Implementación del algoritmo de Viterbi para etiquetado morfosintáctico."""

import math
import logging
from typing import Optional

from services.hmm_trainer import get_emission_probs, get_transition_probs, get_word_to_tags
from services.corpus_parser import get_corpus_data
from services.eagles_tags import describe_tag, is_open_tag
from utils.helpers import tokenize_sentence

logger = logging.getLogger(__name__)

# Probabilidad para palabras desconocidas
UNKNOWN_PROB = 1e-10


def viterbi(sentence: str) -> dict:
    """Ejecuta el algoritmo de Viterbi sobre una oración.

    Args:
        sentence: Oración a etiquetar.

    Returns:
        dict con tokens, tags, descriptions, steps, viterbi_matrix,
        backpointers y best_path_prob.
    """
    emission_probs = get_emission_probs()
    transition_probs = get_transition_probs()
    corpus_data = get_corpus_data()
    word_to_tags = get_word_to_tags()

    if not emission_probs or not transition_probs or not corpus_data:
        raise RuntimeError(
            "El modelo HMM no está entrenado. "
            "Ejecute primero /api/corpus/upload y /api/probabilities/train"
        )

    tag_counts = corpus_data["tag_counts"]
    all_tags = list(tag_counts.keys())

    # Tokenizar
    tokens = tokenize_sentence(sentence)
    if not tokens:
        raise ValueError("La oración no contiene tokens válidos.")

    n_tokens = len(tokens)
    n_tags = len(all_tags)

    # ── Encontrar etiquetas posibles para cada token ──
    # Usa índice invertido word_to_tags O(1) en vez de scan lineal O(E)
    possible_tags_per_token = []
    for token in tokens:
        word = token.lower()
        if word_to_tags and word in word_to_tags:
            possible = set(word_to_tags[word])
        else:
            # Palabra desconocida: usar etiquetas abiertas
            possible = {t for t in all_tags if is_open_tag(t)}
            if not possible:
                possible = set(all_tags)
        possible_tags_per_token.append(sorted(possible))

    # ── Inicialización: v_1(j) = P(t_j|<START>) * P(w_1|t_j) ──
    # Usamos log-probabilidades para evitar underflow
    viterbi_matrix = []  # lista de dicts {tag: log_prob}
    backpointers = []    # lista de dicts {tag: prev_tag}

    first_word = tokens[0].lower()
    v0 = {}
    for tag in possible_tags_per_token[0]:
        trans_p = transition_probs.get(("<START>", tag), UNKNOWN_PROB)
        emit_p = emission_probs.get((tag, first_word), UNKNOWN_PROB)
        v0[tag] = math.log(trans_p) + math.log(emit_p)

    viterbi_matrix.append(v0)
    backpointers.append({tag: "<START>" for tag in v0})

    # ── Recursión: v_t(j) = max_i [v_{t-1}(i) * P(t_j|t_i) * P(w_t|t_j)] ──
    for t in range(1, n_tokens):
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

    # ── Terminación: considerar transición al final ──
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
        # Fallback: tomar el tag con mayor probabilidad sin considerar END
        best_final_tag = max(last_v, key=last_v.get)
        best_final_prob = last_v[best_final_tag]

    # ── Backtrace ──
    best_tags = [best_final_tag]
    for t in range(n_tokens - 1, 0, -1):
        prev_tag = backpointers[t].get(best_tags[-1], best_tags[-1])
        best_tags.append(prev_tag)
    best_tags.reverse()

    # ── Construir resultado ──
    descriptions = [describe_tag(tag)["description"] for tag in best_tags]

    steps = []
    for i, (token, tag) in enumerate(zip(tokens, best_tags)):
        prob = math.exp(viterbi_matrix[i].get(tag, -100))
        steps.append({
            "token": token,
            "tag": tag,
            "probability": prob,
            "description": descriptions[i],
        })

    # Convertir matrices para serialización JSON
    matrix_serializable = []
    for t, vt in enumerate(viterbi_matrix):
        row = {"token": tokens[t]}
        # Solo incluir top 10 tags por token para no saturar
        sorted_tags = sorted(vt.items(), key=lambda x: x[1], reverse=True)[:10]
        for tag, log_prob in sorted_tags:
            row[tag] = round(math.exp(log_prob), 15)
        matrix_serializable.append(row)

    bp_serializable = []
    for t, bt in enumerate(backpointers):
        row = {"token": tokens[t]}
        for tag in best_tags:
            if tag in bt:
                row[tag] = bt[tag]
        bp_serializable.append(row)

    return {
        "sentence": sentence,
        "tokens": tokens,
        "tags": best_tags,
        "descriptions": descriptions,
        "steps": steps,
        "viterbi_matrix": matrix_serializable,
        "backpointers": bp_serializable,
        "best_path_prob": math.exp(best_final_prob) if best_final_prob > -math.inf else 0.0,
    }
