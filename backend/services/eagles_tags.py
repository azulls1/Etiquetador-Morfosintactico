"""Diccionario completo de etiquetas EAGLES para español (FreeLing)."""

# Categorías principales (posición 1)
CATEGORIES = {
    "A": "Adjetivo",
    "C": "Conjunción",
    "D": "Determinante",
    "F": "Puntuación",
    "I": "Interjección",
    "N": "Nombre",
    "P": "Pronombre",
    "R": "Adverbio",
    "S": "Preposición",
    "V": "Verbo",
    "W": "Fecha",
    "Z": "Cifra",
}

# Subcategorías (posición 2)
SUBCATEGORIES = {
    "A": {"Q": "Calificativo", "O": "Ordinal", "P": "Posesivo"},
    "C": {"C": "Coordinante", "S": "Subordinante"},
    "D": {
        "A": "Artículo", "D": "Demostrativo", "E": "Exclamativo",
        "I": "Indefinido", "N": "Numeral", "P": "Posesivo",
        "T": "Interrogativo",
    },
    "F": {
        "a": "Exclamación (!)", "c": "Coma (,)", "d": "Dos puntos (:)",
        "e": "Comillas (\")", "g": "Guión (-)", "h": "Barra (/)",
        "i": "Interrogación (?)", "l": "Llave ({)", "p": "Punto (.)",
        "r": "Paréntesis cerrado ())", "s": "Puntos suspensivos (...)",
        "t": "Tanto por ciento (%)", "x": "Punto y coma (;)",
        "z": "Paréntesis abierto (()",
    },
    "I": {"0": "Interjección"},
    "N": {"C": "Común", "P": "Propio"},
    "P": {
        "D": "Demostrativo", "E": "Exclamativo", "I": "Indefinido",
        "N": "Numeral", "P": "Personal", "R": "Relativo",
        "T": "Interrogativo", "X": "Posesivo",
    },
    "R": {"G": "General", "N": "Negativo"},
    "S": {"P": "Preposición"},
    "V": {"M": "Principal", "A": "Auxiliar", "S": "Semiauxiliar"},
    "W": {"0": "Fecha"},
    "Z": {"d": "Partitivo", "m": "Moneda", "p": "Porcentaje", "0": "Cardinal"},
}

# Modo verbal (posición 3 para verbos)
VERB_MOOD = {
    "I": "Indicativo",
    "S": "Subjuntivo",
    "M": "Imperativo",
    "C": "Condicional",
    "N": "Infinitivo",
    "G": "Gerundio",
    "P": "Participio",
}

# Tiempo verbal (posición 4 para verbos)
VERB_TENSE = {
    "P": "Presente",
    "I": "Imperfecto",
    "F": "Futuro",
    "S": "Pasado",
    "0": "-",
}

# Género (varias posiciones)
GENDER = {
    "M": "Masculino",
    "F": "Femenino",
    "C": "Común",
    "0": "-",
}

# Número (varias posiciones)
NUMBER = {
    "S": "Singular",
    "P": "Plural",
    "N": "Invariable",
    "0": "-",
}

# Persona (posición 5 para verbos)
PERSON = {
    "1": "1ª persona",
    "2": "2ª persona",
    "3": "3ª persona",
    "0": "-",
}

# Grado (para adjetivos y adverbios)
DEGREE = {
    "S": "Superlativo",
    "0": "-",
}

# Etiquetas abiertas (aceptan palabras desconocidas)
OPEN_TAGS = {"N", "V", "A", "R", "Z", "W"}


def describe_tag(tag: str) -> dict:
    """Describe una etiqueta EAGLES completa.

    Args:
        tag: Etiqueta EAGLES (ej: "VMIP3S0", "NCMS000", "Fp")

    Returns:
        dict con category, description y full_description
    """
    if not tag:
        return {"tag": tag, "category": "", "description": "", "full_description": ""}

    parts = []
    cat_char = tag[0] if len(tag) > 0 else ""
    category = CATEGORIES.get(cat_char, cat_char)
    parts.append(category)

    if cat_char == "V" and len(tag) >= 2:
        # Verbo: V + tipo + modo + tiempo + persona + número + género
        sub = SUBCATEGORIES.get("V", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        mood = VERB_MOOD.get(tag[2], tag[2]) if len(tag) > 2 else ""
        tense = VERB_TENSE.get(tag[3], tag[3]) if len(tag) > 3 else ""
        person = PERSON.get(tag[4], tag[4]) if len(tag) > 4 else ""
        number = NUMBER.get(tag[5], tag[5]) if len(tag) > 5 else ""
        gender = GENDER.get(tag[6], tag[6]) if len(tag) > 6 else ""
        parts = [category, sub, mood, tense, person, number, gender]

    elif cat_char == "N" and len(tag) >= 2:
        # Nombre: N + tipo + género + número + clasificación semántica + grado
        sub = SUBCATEGORIES.get("N", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        gender = GENDER.get(tag[2], tag[2]) if len(tag) > 2 else ""
        number = NUMBER.get(tag[3], tag[3]) if len(tag) > 3 else ""
        parts = [category, sub, gender, number]

    elif cat_char == "A" and len(tag) >= 2:
        # Adjetivo: A + tipo + grado + género + número
        sub = SUBCATEGORIES.get("A", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        degree = tag[2] if len(tag) > 2 else ""
        gender = GENDER.get(tag[3], tag[3]) if len(tag) > 3 else ""
        number = NUMBER.get(tag[4], tag[4]) if len(tag) > 4 else ""
        parts = [category, sub, degree, gender, number]

    elif cat_char == "D" and len(tag) >= 2:
        # Determinante
        sub = SUBCATEGORIES.get("D", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        person = PERSON.get(tag[2], tag[2]) if len(tag) > 2 else ""
        gender = GENDER.get(tag[3], tag[3]) if len(tag) > 3 else ""
        number = NUMBER.get(tag[4], tag[4]) if len(tag) > 4 else ""
        parts = [category, sub, person, gender, number]

    elif cat_char == "P" and len(tag) >= 2:
        # Pronombre
        sub = SUBCATEGORIES.get("P", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        person = PERSON.get(tag[2], tag[2]) if len(tag) > 2 else ""
        gender = GENDER.get(tag[3], tag[3]) if len(tag) > 3 else ""
        number = NUMBER.get(tag[4], tag[4]) if len(tag) > 4 else ""
        parts = [category, sub, person, gender, number]

    elif cat_char == "C" and len(tag) >= 2:
        sub = SUBCATEGORIES.get("C", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        parts = [category, sub]

    elif cat_char == "S" and len(tag) >= 2:
        sub = SUBCATEGORIES.get("S", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        parts = [category, sub]

    elif cat_char == "R" and len(tag) >= 2:
        sub = SUBCATEGORIES.get("R", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        parts = [category, sub]

    elif cat_char == "F" and len(tag) >= 2:
        sub = SUBCATEGORIES.get("F", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        parts = [category, sub]

    elif cat_char == "Z" and len(tag) >= 2:
        sub = SUBCATEGORIES.get("Z", {}).get(tag[1], tag[1]) if len(tag) > 1 else ""
        parts = [category, sub]

    # Filtrar partes vacías y "-"
    clean_parts = [p for p in parts if p and p != "-" and p != "0"]
    description = " ".join(clean_parts)

    return {
        "tag": tag,
        "category": category,
        "description": description,
        "full_description": description,
    }


def get_all_categories() -> list[dict]:
    """Retorna todas las categorías EAGLES principales."""
    result = []
    for code, name in CATEGORIES.items():
        subs = SUBCATEGORIES.get(code, {})
        sub_list = [{"code": f"{code}{sc}", "name": sn} for sc, sn in subs.items()]
        result.append({
            "code": code,
            "name": name,
            "subcategories": sub_list,
        })
    return result


def is_open_tag(tag: str) -> bool:
    """Verifica si una etiqueta es de clase abierta."""
    return tag[0] in OPEN_TAGS if tag else False
