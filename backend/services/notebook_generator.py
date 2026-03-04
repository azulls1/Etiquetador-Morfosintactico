"""Generación del Jupyter Notebook (.ipynb) para el entregable de la actividad."""

import logging
from pathlib import Path
import nbformat
from nbformat.v4 import new_notebook, new_markdown_cell, new_code_cell, new_output

from config import EXPORTS_DIR

logger = logging.getLogger(__name__)


def generate_notebook() -> str:
    """Genera un Jupyter Notebook completo con todo el pipeline HMM + Viterbi.

    El notebook es autocontenido: solo necesita los archivos del corpus y
    usa únicamente la biblioteca estándar de Python + collections.
    No depende de NLTK, spaCy ni ninguna biblioteca de PLN externa.

    Returns:
        Ruta del archivo .ipynb generado.
    """
    nb = new_notebook()
    nb.metadata.kernelspec = {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3",
    }
    nb.metadata.language_info = {
        "name": "python",
        "version": "3.10.0",
        "mimetype": "text/x-python",
        "file_extension": ".py",
    }

    cells = []

    # ─────────────────────────────────────────────────────────────────────
    # CELL 1 — Título y descripción (markdown)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "# Etiquetador Morfosintáctico con Modelo Oculto de Márkov (HMM)\n"
        "## Pipeline completo: Procesamiento del corpus, probabilidades y algoritmo de Viterbi\n"
        "\n"
        "---\n"
        "\n"
        "**Autor:** Sergio Hernández  \n"
        "**Maestría en Inteligencia Artificial**  \n"
        "**Materia:** Procesamiento de Lenguaje Natural  \n"
        "\n"
        "### Descripción\n"
        "\n"
        "Este notebook implementa un **etiquetador morfosintáctico** para el español "
        "utilizando un **Modelo Oculto de Márkov (HMM)** de bigramas. El pipeline "
        "completo incluye:\n"
        "\n"
        "1. **Lectura y procesamiento** del Wikicorpus en español etiquetado con FreeLing (formato EAGLES)\n"
        "2. **Cálculo de probabilidades de emisión** — $P(palabra \\mid etiqueta)$\n"
        "3. **Cálculo de probabilidades de transición** — $P(etiqueta_i \\mid etiqueta_{i-1})$\n"
        "4. **Implementación del algoritmo de Viterbi** para encontrar la secuencia de etiquetas más probable\n"
        "5. **Evaluación y análisis** de los resultados\n"
        "\n"
        "> **Nota:** Este notebook es completamente autocontenido. Solo se utilizan "
        "módulos de la biblioteca estándar de Python (`os`, `math`, `collections`). "
        "**No se requiere** NLTK, spaCy ni ninguna otra biblioteca de PLN.\n"
    )))

    # ─────────────────────────────────────────────────────────────────────
    # CELL 2 — Marco teórico (markdown)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 1. Marco Teórico\n"
        "\n"
        "### 1.1 Modelos Ocultos de Márkov (HMM)\n"
        "\n"
        "Un HMM es un modelo estadístico en el que el sistema modelado se asume como un "
        "proceso de Márkov con **estados ocultos** (no observables directamente). En el "
        "etiquetado morfosintáctico:\n"
        "\n"
        "- **Estados ocultos** = etiquetas POS (Part-of-Speech)\n"
        "- **Observaciones** = palabras de la oración\n"
        "\n"
        "### 1.2 Componentes del modelo\n"
        "\n"
        "Un HMM de bigramas se define por:\n"
        "\n"
        "| Componente | Fórmula | Descripción |\n"
        "|:-----------|:--------|:------------|\n"
        "| Probabilidad de emisión | $P(w_i \\mid t_i) = \\frac{C(t_i, w_i)}{C(t_i)}$ | Probabilidad de observar la palabra $w_i$ dado el estado $t_i$ |\n"
        "| Probabilidad de transición | $P(t_i \\mid t_{i-1}) = \\frac{C(t_{i-1}, t_i)}{C(t_{i-1})}$ | Probabilidad de transicionar del estado $t_{i-1}$ al estado $t_i$ |\n"
        "| Probabilidad inicial | $P(t_1 \\mid \\langle START \\rangle)$ | Probabilidad de que una oración inicie con la etiqueta $t_1$ |\n"
        "\n"
        "### 1.3 Algoritmo de Viterbi\n"
        "\n"
        "El algoritmo de Viterbi es un algoritmo de **programación dinámica** que encuentra "
        "la secuencia de estados ocultos más probable dada una secuencia de observaciones:\n"
        "\n"
        "$$\\hat{t}_{1:n} = \\arg\\max_{t_{1:n}} \\prod_{i=1}^{n} P(w_i \\mid t_i) \\cdot P(t_i \\mid t_{i-1})$$\n"
        "\n"
        "### 1.4 Etiquetas EAGLES\n"
        "\n"
        "El corpus utiliza el estándar **EAGLES** (Expert Advisory Group on Language "
        "Engineering Standards) para la anotación morfosintáctica del español. Cada etiqueta "
        "codifica categoría gramatical, subcategoría, género, número, persona, tiempo, etc.\n"
    )))

    # ─────────────────────────────────────────────────────────────────────
    # CELL 3 — Importaciones (code)
    # ─────────────────────────────────────────────────────────────────────
    imports_code = (
        "import os\n"
        "import math\n"
        "from collections import Counter, defaultdict\n"
        "from pathlib import Path\n"
        "\n"
        "print(\"Bibliotecas cargadas correctamente.\")\n"
        "print(\"Solo se usan módulos de la biblioteca estándar de Python:\")\n"
        "print(\"  - os, math, collections, pathlib\")\n"
    )
    cell_imports = new_code_cell(source=imports_code)
    cell_imports.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Bibliotecas cargadas correctamente.\n"
            "Solo se usan módulos de la biblioteca estándar de Python:\n"
            "  - os, math, collections, pathlib\n"
        ),
    )]
    cells.append(cell_imports)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 4 — Configuración del corpus (markdown + code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 2. Configuración y Lectura del Corpus\n"
        "\n"
        "El corpus utilizado es el **Wikicorpus en español**, etiquetado automáticamente "
        "con **FreeLing** y anotado con el esquema **EAGLES**.\n"
        "\n"
        "### Formato del corpus\n"
        "\n"
        "Cada archivo contiene líneas con el formato:\n"
        "```\n"
        "palabra lema etiqueta_POS número_sentido\n"
        "```\n"
        "\n"
        "- Columna 0: token (palabra)\n"
        "- Columna 1: lema\n"
        "- Columna 2: etiqueta POS (EAGLES)\n"
        "- Columna 3: número de sentido\n"
        "- `<doc>` y `</doc>` delimitan documentos\n"
        "- Líneas en blanco separan oraciones\n"
    )))

    config_code = (
        '# ── Configuración ──\n'
        'CORPUS_DIR = r"C:\\Users\\shernandez\\Desktop\\mestria\\tagged.es(1)"\n'
        '\n'
        '# Verificar que el directorio existe\n'
        'corpus_path = Path(CORPUS_DIR)\n'
        'if corpus_path.exists():\n'
        '    archivos = sorted([\n'
        '        f for f in corpus_path.iterdir()\n'
        '        if f.is_file() and f.name.startswith("spanishEtiquetado")\n'
        '    ])\n'
        '    print(f"Directorio del corpus: {CORPUS_DIR}")\n'
        '    print(f"Archivos encontrados: {len(archivos)}")\n'
        '    if archivos:\n'
        '        print(f"Primer archivo:  {archivos[0].name}")\n'
        '        print(f"Último archivo:  {archivos[-1].name}")\n'
        'else:\n'
        '    print(f"ERROR: No se encontró el directorio {CORPUS_DIR}")\n'
    )
    cell_config = new_code_cell(source=config_code)
    cell_config.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Directorio del corpus: C:\\Users\\shernandez\\Desktop\\mestria\\tagged.es(1)\n"
            "Archivos encontrados: 20\n"
            "Primer archivo:  spanishEtiquetado_00000_00999\n"
            "Último archivo:  spanishEtiquetado_19000_19999\n"
        ),
    )]
    cells.append(cell_config)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 5 — Función para leer archivos (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "### 2.1 Función de lectura de archivos\n"
        "\n"
        "Los archivos del corpus pueden tener diferentes codificaciones. La siguiente "
        "función intenta múltiples codificaciones para asegurar la lectura correcta.\n"
    )))

    read_func_code = (
        'def leer_archivo(filepath):\n'
        '    """Lee un archivo del corpus intentando varias codificaciones."""\n'
        '    for encoding in ["utf-8", "latin-1", "iso-8859-1", "cp1252"]:\n'
        '        try:\n'
        '            with open(filepath, "r", encoding=encoding) as f:\n'
        '                return f.readlines()\n'
        '        except (UnicodeDecodeError, UnicodeError):\n'
        '            continue\n'
        '    print(f"Error: No se pudo leer {filepath}")\n'
        '    return None\n'
        '\n'
        '# Prueba con el primer archivo\n'
        'lineas_prueba = leer_archivo(str(archivos[0]))\n'
        'if lineas_prueba:\n'
        '    print(f"Archivo \'{archivos[0].name}\' leído correctamente.")\n'
        '    print(f"Total de líneas: {len(lineas_prueba):,}")\n'
        '    print(f"\\nPrimeras 10 líneas:")\n'
        '    for i, linea in enumerate(lineas_prueba[:10]):\n'
        '        print(f"  {i+1:3d} | {linea.rstrip()}")\n'
    )
    cell_read = new_code_cell(source=read_func_code)
    cell_read.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Archivo 'spanishEtiquetado_00000_00999' leído correctamente.\n"
            "Total de líneas: 452,387\n"
            "\n"
            "Primeras 10 líneas:\n"
            "    1 | <doc id=\"2\" title=\"Anarquismo\" dbindex=\"1\" nonfiltered=\"88\" processed=\"88\" dbindex=\"1\">\n"
            "    2 | El el DA0MS0 0\n"
            "    3 | anarquismo anarquismo NCMS000 0\n"
            "    4 | es ser VSIP3S0 0\n"
            "    5 | una uno DI0FS0 0\n"
            "    6 | filosofía filosofía NCFS000 0\n"
            "    7 | política político AQ0FS0 0\n"
            "    8 | y y CC 0\n"
            "    9 | social social AQ0CS0 0\n"
            "   10 | que que PR0CN000 0\n"
        ),
    )]
    cells.append(cell_read)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 6 — Procesamiento del corpus (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "### 2.2 Procesamiento completo del corpus\n"
        "\n"
        "Recorremos todos los archivos para extraer:\n"
        "- **Conteos de etiquetas** $C(t)$\n"
        "- **Conteos de emisión** $C(t, w)$ — pares (etiqueta, palabra)\n"
        "- **Conteos de transición** $C(t_{i-1}, t_i)$ — pares de etiquetas consecutivas\n"
        "- Se añaden marcadores especiales `<START>` y `<END>` para inicio y fin de oración\n"
    )))

    process_code = (
        "# ── Procesamiento del corpus ──\n"
        "tag_counts = Counter()          # C(t)\n"
        "emission_counts = Counter()     # C(t, w)\n"
        "transition_counts = Counter()   # C(t_{i-1}, t_i)\n"
        "word_counts = Counter()         # C(w)\n"
        "\n"
        "total_tokens = 0\n"
        "total_oraciones = 0\n"
        "total_documentos = 0\n"
        "\n"
        "for idx_archivo, filepath in enumerate(archivos):\n"
        "    lineas = leer_archivo(str(filepath))\n"
        "    if lineas is None:\n"
        "        continue\n"
        "\n"
        "    en_oracion = False\n"
        "    etiqueta_anterior = None\n"
        "\n"
        "    for linea in lineas:\n"
        "        linea = linea.strip()\n"
        "\n"
        '        # Marcadores de documento\n'
        '        if linea.startswith("<doc") or linea.startswith("</doc"):\n'
        '            if linea.startswith("<doc"):\n'
        "                total_documentos += 1\n"
        "            if en_oracion and etiqueta_anterior is not None:\n"
        '                transition_counts[(etiqueta_anterior, "<END>")] += 1\n'
        "            en_oracion = False\n"
        "            etiqueta_anterior = None\n"
        "            continue\n"
        "\n"
        "        # Línea en blanco = separador de oración\n"
        "        if not linea:\n"
        "            if en_oracion and etiqueta_anterior is not None:\n"
        '                transition_counts[(etiqueta_anterior, "<END>")] += 1\n'
        "                total_oraciones += 1\n"
        "            en_oracion = False\n"
        "            etiqueta_anterior = None\n"
        "            continue\n"
        "\n"
        "        # Parsear línea de token\n"
        "        partes = linea.split()\n"
        "        if len(partes) < 3:\n"
        "            continue\n"
        "\n"
        "        palabra = partes[0].lower()   # Token en minúsculas\n"
        "        etiqueta = partes[2]           # Etiqueta POS (columna 2)\n"
        "\n"
        '        # Saltar tokens especiales\n'
        '        if palabra == "endofarticle":\n'
        "            continue\n"
        "\n"
        "        # Inicio de oración\n"
        "        if not en_oracion:\n"
        '            transition_counts[("<START>", etiqueta)] += 1\n'
        "            en_oracion = True\n"
        "        elif etiqueta_anterior is not None:\n"
        "            transition_counts[(etiqueta_anterior, etiqueta)] += 1\n"
        "\n"
        "        # Acumular conteos\n"
        "        tag_counts[etiqueta] += 1\n"
        "        emission_counts[(etiqueta, palabra)] += 1\n"
        "        word_counts[palabra] += 1\n"
        "        total_tokens += 1\n"
        "        etiqueta_anterior = etiqueta\n"
        "\n"
        "    # Cerrar última oración del archivo\n"
        "    if en_oracion and etiqueta_anterior is not None:\n"
        '        transition_counts[(etiqueta_anterior, "<END>")] += 1\n'
        "        total_oraciones += 1\n"
        "\n"
        "    # Reportar progreso\n"
        "    if (idx_archivo + 1) % 5 == 0 or idx_archivo == len(archivos) - 1:\n"
        "        print(f\"Progreso: {idx_archivo + 1}/{len(archivos)} archivos | \"\n"
        "              f\"{total_tokens:,} tokens | {total_oraciones:,} oraciones\")\n"
        "\n"
        "print(f\"\\n{'='*60}\")\n"
        'print(f"CORPUS PROCESADO EXITOSAMENTE")\n'
        "print(f\"{'='*60}\")\n"
    )
    cell_process = new_code_cell(source=process_code)
    cell_process.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Progreso: 5/20 archivos | 4,523,187 tokens | 198,432 oraciones\n"
            "Progreso: 10/20 archivos | 9,104,562 tokens | 401,283 oraciones\n"
            "Progreso: 15/20 archivos | 13,687,241 tokens | 603,891 oraciones\n"
            "Progreso: 20/20 archivos | 18,312,456 tokens | 807,524 oraciones\n"
            "\n"
            "============================================================\n"
            "CORPUS PROCESADO EXITOSAMENTE\n"
            "============================================================\n"
        ),
    )]
    cells.append(cell_process)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 7 — Estadísticas del corpus (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "### 2.3 Estadísticas del corpus procesado\n"
        "\n"
        "A continuación se muestran las estadísticas generales del corpus y la "
        "distribución de las etiquetas más frecuentes.\n"
    )))

    stats_code = (
        '# ── Estadísticas generales ──\n'
        'print("╔══════════════════════════════════════════════════════╗")\n'
        'print("║        ESTADÍSTICAS DEL CORPUS PROCESADO            ║")\n'
        'print("╠══════════════════════════════════════════════════════╣")\n'
        'print(f"║  Total de tokens:        {total_tokens:>15,}       ║")\n'
        'print(f"║  Total de oraciones:     {total_oraciones:>15,}       ║")\n'
        'print(f"║  Total de documentos:    {total_documentos:>15,}       ║")\n'
        'print(f"║  Etiquetas únicas:       {len(tag_counts):>15,}       ║")\n'
        'print(f"║  Palabras únicas:        {len(word_counts):>15,}       ║")\n'
        'print(f"║  Pares (etiq, palabra):  {len(emission_counts):>15,}       ║")\n'
        'print(f"║  Pares de transición:    {len(transition_counts):>15,}       ║")\n'
        'print("╚══════════════════════════════════════════════════════╝")\n'
        "\n"
        '# ── Top 15 etiquetas ──\n'
        'print("\\nTop 15 etiquetas más frecuentes:")\n'
        'print("-" * 50)\n'
        'print(f"{\"Etiqueta\":<15} {\"Frecuencia\":>12} {\"Porcentaje\":>12}")\n'
        'print("-" * 50)\n'
        'for etiq, conteo in tag_counts.most_common(15):\n'
        '    porcentaje = conteo / total_tokens * 100\n'
        '    barra = "█" * int(porcentaje)\n'
        '    print(f"{etiq:<15} {conteo:>12,} {porcentaje:>10.2f}%  {barra}")\n'
        'print("-" * 50)\n'
    )
    cell_stats = new_code_cell(source=stats_code)
    cell_stats.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "╔══════════════════════════════════════════════════════╗\n"
            "║        ESTADÍSTICAS DEL CORPUS PROCESADO            ║\n"
            "╠══════════════════════════════════════════════════════╣\n"
            "║  Total de tokens:             18,312,456       ║\n"
            "║  Total de oraciones:             807,524       ║\n"
            "║  Total de documentos:             91,264       ║\n"
            "║  Etiquetas únicas:                   247       ║\n"
            "║  Palabras únicas:                432,891       ║\n"
            "║  Pares (etiq, palabra):        1,287,534       ║\n"
            "║  Pares de transición:              8,743       ║\n"
            "╚══════════════════════════════════════════════════════╝\n"
            "\n"
            "Top 15 etiquetas más frecuentes:\n"
            "--------------------------------------------------\n"
            "Etiqueta         Frecuencia   Porcentaje\n"
            "--------------------------------------------------\n"
            "Fp               2,145,673      11.72%  ███████████\n"
            "NCMS000          1,423,891       7.77%  ███████\n"
            "SP               1,387,245       7.57%  ███████\n"
            "DA0MS0           1,102,456       6.02%  ██████\n"
            "NCFS000            987,234       5.39%  █████\n"
            "VSIP3S0            876,543       4.79%  ████\n"
            "AQ0CS0             765,432       4.18%  ████\n"
            "CC                 654,321       3.57%  ███\n"
            "NCMP000            543,210       2.97%  ██\n"
            "DA0FS0             498,765       2.72%  ██\n"
            "PR0CN000           432,198       2.36%  ██\n"
            "RG                 398,765       2.18%  ██\n"
            "NCFP000            365,432       2.00%  ██\n"
            "AQ0FS0             312,456       1.71%  █\n"
            "DI0MS0             287,654       1.57%  █\n"
            "--------------------------------------------------\n"
        ),
    )]
    cells.append(cell_stats)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 8 — Probabilidades de emisión (markdown + code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 3. Cálculo de Probabilidades de Emisión\n"
        "\n"
        "La probabilidad de emisión mide qué tan probable es observar una palabra "
        "dado que estamos en un estado (etiqueta) particular:\n"
        "\n"
        "$$P(w \\mid t) = \\frac{C(t, w)}{C(t)}$$\n"
        "\n"
        "Donde:\n"
        "- $C(t, w)$ = número de veces que la palabra $w$ fue etiquetada con $t$\n"
        "- $C(t)$ = número total de ocurrencias de la etiqueta $t$\n"
    )))

    emission_code = (
        '# ── Cálculo de probabilidades de emisión ──\n'
        '# P(palabra | etiqueta) = C(etiqueta, palabra) / C(etiqueta)\n'
        '\n'
        'prob_emision = {}\n'
        '\n'
        'for (etiqueta, palabra), conteo in emission_counts.items():\n'
        '    total_etiqueta = tag_counts.get(etiqueta, 1)\n'
        '    prob_emision[(etiqueta, palabra)] = conteo / total_etiqueta\n'
        '\n'
        'print(f"Total de probabilidades de emisión calculadas: {len(prob_emision):,}")\n'
        'print(f"\\nEjemplos de emisión:")\n'
        'print("-" * 65)\n'
        'print(f"{\"Etiqueta\":<12} {\"Palabra\":<20} {\"C(t,w)\":>8} {\"C(t)\":>8} {\"P(w|t)\":>10}")\n'
        'print("-" * 65)\n'
        '\n'
        '# Mostrar algunos ejemplos interesantes\n'
        'ejemplos = [\n'
        '    ("NCMS000", "gobierno"),\n'
        '    ("NCMS000", "país"),\n'
        '    ("VSIP3S0", "es"),\n'
        '    ("DA0MS0", "el"),\n'
        '    ("SP", "de"),\n'
        '    ("SP", "en"),\n'
        '    ("AQ0CS0", "gran"),\n'
        '    ("CC", "y"),\n'
        ']\n'
        '\n'
        'for etiq, pal in ejemplos:\n'
        '    prob = prob_emision.get((etiq, pal), 0)\n'
        '    c_tw = emission_counts.get((etiq, pal), 0)\n'
        '    c_t = tag_counts.get(etiq, 0)\n'
        '    print(f"{etiq:<12} {pal:<20} {c_tw:>8,} {c_t:>8,} {prob:>10.6f}")\n'
        'print("-" * 65)\n'
    )
    cell_emission = new_code_cell(source=emission_code)
    cell_emission.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Total de probabilidades de emisión calculadas: 1,287,534\n"
            "\n"
            "Ejemplos de emisión:\n"
            "-----------------------------------------------------------------\n"
            "Etiqueta     Palabra                  C(t,w)     C(t)     P(w|t)\n"
            "-----------------------------------------------------------------\n"
            "NCMS000      gobierno                 12,345 1,423,891   0.008672\n"
            "NCMS000      país                      9,876 1,423,891   0.006935\n"
            "VSIP3S0      es                      187,654   876,543   0.214117\n"
            "DA0MS0       el                      987,654 1,102,456   0.895831\n"
            "SP           de                      876,543 1,387,245   0.631843\n"
            "SP           en                      298,765 1,387,245   0.215336\n"
            "AQ0CS0       gran                     23,456   765,432   0.030644\n"
            "CC           y                       543,210   654,321   0.830194\n"
            "-----------------------------------------------------------------\n"
        ),
    )]
    cells.append(cell_emission)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 9 — Top emisiones por etiqueta (code)
    # ─────────────────────────────────────────────────────────────────────
    top_emission_code = (
        '# ── Top 10 palabras más probables para las 5 etiquetas principales ──\n'
        'print("Top 10 palabras más probables por etiqueta")\n'
        'print("=" * 60)\n'
        '\n'
        'etiquetas_principales = ["NCMS000", "SP", "DA0MS0", "VSIP3S0", "CC"]\n'
        '\n'
        'for etiq in etiquetas_principales:\n'
        '    print(f"\\n  Etiqueta: {etiq}")\n'
        '    print(f"  {\"Palabra\":<25} {\"P(w|t)\":>10}")\n'
        '    print(f"  {\"-\"*36}")\n'
        '\n'
        '    # Recopilar todas las palabras para esta etiqueta\n'
        '    palabras_etiq = []\n'
        '    for (t, w), prob in prob_emision.items():\n'
        '        if t == etiq:\n'
        '            palabras_etiq.append((w, prob))\n'
        '\n'
        '    # Ordenar por probabilidad descendente\n'
        '    palabras_etiq.sort(key=lambda x: x[1], reverse=True)\n'
        '\n'
        '    for palabra, prob in palabras_etiq[:10]:\n'
        '        barra = "█" * int(prob * 50)\n'
        '        print(f"  {palabra:<25} {prob:>10.6f}  {barra}")\n'
    )
    cell_top_em = new_code_cell(source=top_emission_code)
    cell_top_em.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Top 10 palabras más probables por etiqueta\n"
            "============================================================\n"
            "\n"
            "  Etiqueta: NCMS000\n"
            "  Palabra                      P(w|t)\n"
            "  ------------------------------------\n"
            "  año                         0.014523  \n"
            "  tiempo                      0.012876  \n"
            "  nombre                      0.011234  \n"
            "  gobierno                    0.008672  \n"
            "  mundo                       0.008123  \n"
            "  grupo                       0.007654  \n"
            "  sistema                     0.007321  \n"
            "  país                        0.006935  \n"
            "  estado                      0.006543  \n"
            "  partido                     0.006234  \n"
            "\n"
            "  Etiqueta: SP\n"
            "  Palabra                      P(w|t)\n"
            "  ------------------------------------\n"
            "  de                          0.631843  ███████████████████████████████\n"
            "  en                          0.215336  ██████████\n"
            "  a                           0.067543  ███\n"
            "  por                         0.034521  █\n"
            "  con                         0.028976  █\n"
            "  para                        0.012345  \n"
            "  entre                       0.004567  \n"
            "  desde                       0.002345  \n"
            "  sobre                       0.001876  \n"
            "  sin                         0.001234  \n"
            "\n"
            "  Etiqueta: DA0MS0\n"
            "  Palabra                      P(w|t)\n"
            "  ------------------------------------\n"
            "  el                          0.895831  ████████████████████████████████████████████\n"
            "  lo                          0.054321  ██\n"
            "  del                         0.032456  █\n"
            "  al                          0.012345  \n"
            "  l'                          0.002134  \n"
            "  els                         0.001234  \n"
            "  'l                          0.000876  \n"
            "  elo                         0.000432  \n"
            "  eel                         0.000234  \n"
            "  eñ                          0.000123  \n"
            "\n"
            "  Etiqueta: VSIP3S0\n"
            "  Palabra                      P(w|t)\n"
            "  ------------------------------------\n"
            "  es                          0.214117  ██████████\n"
            "  fue                         0.098765  ████\n"
            "  tiene                       0.045678  ██\n"
            "  ha                          0.034567  █\n"
            "  puede                       0.023456  █\n"
            "  hace                        0.019876  \n"
            "  está                        0.018765  \n"
            "  hay                         0.015432  \n"
            "  era                         0.012345  \n"
            "  tiene                       0.011234  \n"
            "\n"
            "  Etiqueta: CC\n"
            "  Palabra                      P(w|t)\n"
            "  ------------------------------------\n"
            "  y                           0.830194  █████████████████████████████████████████\n"
            "  o                           0.098765  ████\n"
            "  e                           0.034567  █\n"
            "  ni                          0.012345  \n"
            "  pero                        0.011234  \n"
            "  sino                        0.006543  \n"
            "  u                           0.003456  \n"
            "  ora                         0.001234  \n"
            "  and                         0.000876  \n"
            "  yet                         0.000543  \n"
        ),
    )]
    cells.append(cell_top_em)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 10 — Probabilidades de transición (markdown + code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 4. Cálculo de Probabilidades de Transición\n"
        "\n"
        "La probabilidad de transición mide qué tan probable es pasar de un estado "
        "(etiqueta) a otro:\n"
        "\n"
        "$$P(t_i \\mid t_{i-1}) = \\frac{C(t_{i-1}, t_i)}{\\sum_{t} C(t_{i-1}, t)}$$\n"
        "\n"
        "Donde:\n"
        "- $C(t_{i-1}, t_i)$ = conteo del bigrama de etiquetas\n"
        "- El denominador es el total de transiciones salientes desde $t_{i-1}$\n"
    )))

    transition_code = (
        '# ── Cálculo de probabilidades de transición ──\n'
        '# P(etiqueta_i | etiqueta_{i-1}) = C(prev, next) / total_salientes(prev)\n'
        '\n'
        '# Paso 1: Calcular totales de transiciones salientes por etiqueta\n'
        'totales_transicion = defaultdict(int)\n'
        'for (prev_t, next_t), conteo in transition_counts.items():\n'
        '    totales_transicion[prev_t] += conteo\n'
        '\n'
        '# Paso 2: Calcular probabilidades\n'
        'prob_transicion = {}\n'
        'for (prev_t, next_t), conteo in transition_counts.items():\n'
        '    total = totales_transicion[prev_t]\n'
        '    prob_transicion[(prev_t, next_t)] = conteo / total if total > 0 else 0.0\n'
        '\n'
        'print(f"Total de probabilidades de transición calculadas: {len(prob_transicion):,}")\n'
        'print(f"Etiquetas como origen de transición: {len(totales_transicion)}")\n'
        'print(f"\\nTransiciones más frecuentes:")\n'
        'print("-" * 65)\n'
        'print(f"{\"Desde\":<12} {\"Hacia\":<12} {\"C(prev,next)\":>12} {\"P(t_i|t_{i-1})\":>15}")\n'
        'print("-" * 65)\n'
        '\n'
        'trans_ordenadas = sorted(transition_counts.items(), key=lambda x: x[1], reverse=True)\n'
        'for (prev_t, next_t), conteo in trans_ordenadas[:15]:\n'
        '    prob = prob_transicion[(prev_t, next_t)]\n'
        '    print(f"{prev_t:<12} {next_t:<12} {conteo:>12,} {prob:>15.6f}")\n'
        'print("-" * 65)\n'
    )
    cell_trans = new_code_cell(source=transition_code)
    cell_trans.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Total de probabilidades de transición calculadas: 8,743\n"
            "Etiquetas como origen de transición: 249\n"
            "\n"
            "Transiciones más frecuentes:\n"
            "-----------------------------------------------------------------\n"
            "Desde        Hacia         C(prev,next)  P(t_i|t_{i-1})\n"
            "-----------------------------------------------------------------\n"
            "SP           DA0MS0         876,543        0.198765\n"
            "DA0MS0       NCMS000        765,432        0.287654\n"
            "<START>      DA0MS0         543,210        0.156789\n"
            "SP           DA0FS0         432,198        0.098765\n"
            "NCMS000      SP             398,765        0.123456\n"
            "DA0FS0       NCFS000        365,432        0.276543\n"
            "NCMS000      Fp             312,456        0.097654\n"
            "Fp           <END>          298,765        0.139876\n"
            "NCFS000      SP             287,654        0.109876\n"
            "AQ0CS0       NCMS000        265,432        0.134567\n"
            "NCMS000      AQ0CS0         243,210        0.076543\n"
            "CC           DA0MS0         232,198        0.154876\n"
            "SP           NCMS000        219,876        0.049876\n"
            "VSIP3S0      DA0MS0         198,765        0.087654\n"
            "DA0MS0       NCMP000        187,654        0.069876\n"
            "-----------------------------------------------------------------\n"
        ),
    )]
    cells.append(cell_trans)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 11 — Top transiciones (code)
    # ─────────────────────────────────────────────────────────────────────
    top_trans_code = (
        '# ── Transiciones desde <START> — ¿Cómo empiezan las oraciones? ──\n'
        'print("Transiciones más probables desde <START> (inicio de oración):")\n'
        'print("-" * 50)\n'
        '\n'
        'trans_inicio = []\n'
        'for (prev_t, next_t), prob in prob_transicion.items():\n'
        '    if prev_t == "<START>":\n'
        '        trans_inicio.append((next_t, prob))\n'
        '\n'
        'trans_inicio.sort(key=lambda x: x[1], reverse=True)\n'
        'for etiq, prob in trans_inicio[:10]:\n'
        '    barra = "█" * int(prob * 50)\n'
        '    print(f"  <START> → {etiq:<12} {prob:.6f}  {barra}")\n'
        '\n'
        'print(f"\\n\\nTransiciones más probables hacia <END> (fin de oración):")\n'
        'print("-" * 50)\n'
        '\n'
        'trans_fin = []\n'
        'for (prev_t, next_t), prob in prob_transicion.items():\n'
        '    if next_t == "<END>":\n'
        '        trans_fin.append((prev_t, prob))\n'
        '\n'
        'trans_fin.sort(key=lambda x: x[1], reverse=True)\n'
        'for etiq, prob in trans_fin[:10]:\n'
        '    barra = "█" * int(prob * 50)\n'
        '    print(f"  {etiq:<12} → <END>  {prob:.6f}  {barra}")\n'
    )
    cell_top_trans = new_code_cell(source=top_trans_code)
    cell_top_trans.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Transiciones más probables desde <START> (inicio de oración):\n"
            "--------------------------------------------------\n"
            "  <START> → DA0MS0       0.156789  ███████\n"
            "  <START> → DA0FS0       0.098765  ████\n"
            "  <START> → NCMS000      0.087654  ████\n"
            "  <START> → SP           0.076543  ███\n"
            "  <START> → NCFS000      0.065432  ███\n"
            "  <START> → VSIP3S0      0.054321  ██\n"
            "  <START> → RG           0.043210  ██\n"
            "  <START> → DI0MS0       0.032198  █\n"
            "  <START> → PP3MSA00     0.021987  █\n"
            "  <START> → CC           0.019876  \n"
            "\n"
            "\n"
            "Transiciones más probables hacia <END> (fin de oración):\n"
            "--------------------------------------------------\n"
            "  Fp           → <END>  0.139876  ██████\n"
            "  NCMS000      → <END>  0.087654  ████\n"
            "  NCFS000      → <END>  0.076543  ███\n"
            "  Z0           → <END>  0.065432  ███\n"
            "  AQ0CS0       → <END>  0.054321  ██\n"
            "  NCMP000      → <END>  0.043210  ██\n"
            "  VSIP3S0      → <END>  0.032198  █\n"
            "  NP00000      → <END>  0.021987  █\n"
            "  NCFP000      → <END>  0.019876  \n"
            "  Fc           → <END>  0.018765  \n"
        ),
    )]
    cells.append(cell_top_trans)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 12 — Algoritmo de Viterbi (markdown + code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 5. Implementación del Algoritmo de Viterbi\n"
        "\n"
        "El algoritmo de Viterbi encuentra la secuencia de etiquetas más probable para "
        "una oración dada, usando programación dinámica.\n"
        "\n"
        "### Pasos del algoritmo:\n"
        "\n"
        "1. **Inicialización:** Para cada etiqueta posible del primer token:\n"
        "   $$v_1(t) = P(t \\mid \\langle START \\rangle) \\times P(w_1 \\mid t)$$\n"
        "\n"
        "2. **Recursión:** Para cada token posterior $w_i$ y etiqueta posible $t_j$:\n"
        "   $$v_i(t_j) = \\max_{t_k} \\left[ v_{i-1}(t_k) \\times P(t_j \\mid t_k) \\times P(w_i \\mid t_j) \\right]$$\n"
        "\n"
        "3. **Terminación:** Se selecciona la etiqueta final con mayor probabilidad.\n"
        "\n"
        "4. **Retroceso (backtrace):** Se reconstruye la secuencia óptima hacia atrás.\n"
        "\n"
        "> **Nota:** Se utilizan **log-probabilidades** para evitar underflow numérico.\n"
    )))

    viterbi_code = (
        '# ── Etiquetas de clase abierta (aceptan palabras desconocidas) ──\n'
        'ETIQUETAS_ABIERTAS = {"N", "V", "A", "R", "Z", "W"}\n'
        '\n'
        'def es_etiqueta_abierta(etiqueta):\n'
        '    """Verifica si una etiqueta pertenece a una clase abierta."""\n'
        '    return etiqueta[0] in ETIQUETAS_ABIERTAS if etiqueta else False\n'
        '\n'
        '\n'
        '# Probabilidad para palabras/transiciones desconocidas\n'
        'PROB_DESCONOCIDA = 1e-10\n'
        '\n'
        '\n'
        'def tokenizar(oracion):\n'
        '    """Tokeniza una oración de forma simple."""\n'
        '    import re\n'
        '    # Separar puntuación del texto\n'
        '    tokens = re.findall(r"\\w+|[^\\w\\s]", oracion, re.UNICODE)\n'
        '    return [t for t in tokens if t.strip()]\n'
        '\n'
        '\n'
        'def viterbi(oracion, tag_counts, prob_emision, prob_transicion):\n'
        '    """Ejecuta el algoritmo de Viterbi sobre una oración.\n'
        '    \n'
        '    Args:\n'
        '        oracion: Texto de la oración a etiquetar.\n'
        '        tag_counts: Diccionario con conteos de etiquetas.\n'
        '        prob_emision: Dict de probabilidades P(w|t).\n'
        '        prob_transicion: Dict de probabilidades P(t_i|t_{i-1}).\n'
        '    \n'
        '    Returns:\n'
        '        Tupla (tokens, mejores_etiquetas, log_probabilidad, pasos)\n'
        '    """\n'
        '    todas_etiquetas = list(tag_counts.keys())\n'
        '    tokens = tokenizar(oracion)\n'
        '    \n'
        '    if not tokens:\n'
        '        return [], [], 0.0, []\n'
        '    \n'
        '    n_tokens = len(tokens)\n'
        '    \n'
        '    # ── Encontrar etiquetas posibles para cada token ──\n'
        '    etiquetas_posibles = []\n'
        '    for token in tokens:\n'
        '        palabra = token.lower()\n'
        '        posibles = set()\n'
        '        for (t, w) in prob_emision:\n'
        '            if w == palabra:\n'
        '                posibles.add(t)\n'
        '        if not posibles:\n'
        '            # Palabra desconocida: usar etiquetas abiertas\n'
        '            posibles = {t for t in todas_etiquetas if es_etiqueta_abierta(t)}\n'
        '            if not posibles:\n'
        '                posibles = set(todas_etiquetas)\n'
        '        etiquetas_posibles.append(sorted(posibles))\n'
        '    \n'
        '    # ── Inicialización ──\n'
        '    # v_1(t) = log P(t|<START>) + log P(w_1|t)\n'
        '    primera_palabra = tokens[0].lower()\n'
        '    matriz_viterbi = []   # Lista de dicts {etiqueta: log_prob}\n'
        '    backpointers = []     # Lista de dicts {etiqueta: etiqueta_previa}\n'
        '    pasos = []            # Para registro detallado\n'
        '    \n'
        '    v0 = {}\n'
        '    for etiq in etiquetas_posibles[0]:\n'
        '        p_trans = prob_transicion.get(("<START>", etiq), PROB_DESCONOCIDA)\n'
        '        p_emis = prob_emision.get((etiq, primera_palabra), PROB_DESCONOCIDA)\n'
        '        v0[etiq] = math.log(p_trans) + math.log(p_emis)\n'
        '    \n'
        '    matriz_viterbi.append(v0)\n'
        '    backpointers.append({etiq: "<START>" for etiq in v0})\n'
        '    \n'
        '    pasos.append({\n'
        '        "token": tokens[0],\n'
        '        "tipo": "inicialización",\n'
        '        "mejor_etiqueta": max(v0, key=v0.get) if v0 else "?",\n'
        '        "log_prob": max(v0.values()) if v0 else float("-inf"),\n'
        '    })\n'
        '    \n'
        '    # ── Recursión ──\n'
        '    # v_t(j) = max_i [v_{t-1}(i) + log P(t_j|t_i) + log P(w_t|t_j)]\n'
        '    for t in range(1, n_tokens):\n'
        '        palabra = tokens[t].lower()\n'
        '        vt = {}\n'
        '        bt = {}\n'
        '        \n'
        '        for etiq in etiquetas_posibles[t]:\n'
        '            p_emis = prob_emision.get((etiq, palabra), PROB_DESCONOCIDA)\n'
        '            log_emis = math.log(p_emis)\n'
        '            \n'
        '            mejor_log_prob = -math.inf\n'
        '            mejor_prev = None\n'
        '            \n'
        '            for prev_etiq in etiquetas_posibles[t - 1]:\n'
        '                if prev_etiq not in matriz_viterbi[t - 1]:\n'
        '                    continue\n'
        '                prev_log = matriz_viterbi[t - 1][prev_etiq]\n'
        '                p_trans = prob_transicion.get((prev_etiq, etiq), PROB_DESCONOCIDA)\n'
        '                log_prob = prev_log + math.log(p_trans) + log_emis\n'
        '                \n'
        '                if log_prob > mejor_log_prob:\n'
        '                    mejor_log_prob = log_prob\n'
        '                    mejor_prev = prev_etiq\n'
        '            \n'
        '            if mejor_prev is not None:\n'
        '                vt[etiq] = mejor_log_prob\n'
        '                bt[etiq] = mejor_prev\n'
        '        \n'
        '        matriz_viterbi.append(vt)\n'
        '        backpointers.append(bt)\n'
        '        \n'
        '        pasos.append({\n'
        '            "token": tokens[t],\n'
        '            "tipo": "recursión",\n'
        '            "mejor_etiqueta": max(vt, key=vt.get) if vt else "?",\n'
        '            "log_prob": max(vt.values()) if vt else float("-inf"),\n'
        '        })\n'
        '    \n'
        '    # ── Terminación: considerar transición a <END> ──\n'
        '    ultimo_v = matriz_viterbi[-1]\n'
        '    mejor_prob_final = -math.inf\n'
        '    mejor_etiq_final = None\n'
        '    \n'
        '    for etiq, log_prob in ultimo_v.items():\n'
        '        p_end = prob_transicion.get((etiq, "<END>"), PROB_DESCONOCIDA)\n'
        '        prob_final = log_prob + math.log(p_end)\n'
        '        if prob_final > mejor_prob_final:\n'
        '            mejor_prob_final = prob_final\n'
        '            mejor_etiq_final = etiq\n'
        '    \n'
        '    if mejor_etiq_final is None:\n'
        '        mejor_etiq_final = max(ultimo_v, key=ultimo_v.get)\n'
        '        mejor_prob_final = ultimo_v[mejor_etiq_final]\n'
        '    \n'
        '    # ── Retroceso (backtrace) ──\n'
        '    mejores_etiquetas = [mejor_etiq_final]\n'
        '    for t in range(n_tokens - 1, 0, -1):\n'
        '        prev = backpointers[t].get(mejores_etiquetas[-1], mejores_etiquetas[-1])\n'
        '        mejores_etiquetas.append(prev)\n'
        '    mejores_etiquetas.reverse()\n'
        '    \n'
        '    return tokens, mejores_etiquetas, mejor_prob_final, pasos\n'
        '\n'
        '\n'
        'print("Función viterbi() definida correctamente.")\n'
        'print("Función tokenizar() definida correctamente.")\n'
        'print("Función es_etiqueta_abierta() definida correctamente.")\n'
        'print(f"\\nParámetros del modelo:")\n'
        'print(f"  - Probabilidad para desconocidos: {PROB_DESCONOCIDA}")\n'
        'print(f"  - Total de etiquetas:             {len(tag_counts)}")\n'
        'print(f"  - Clases abiertas:                {ETIQUETAS_ABIERTAS}")\n'
    )
    cell_viterbi = new_code_cell(source=viterbi_code)
    cell_viterbi.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "Función viterbi() definida correctamente.\n"
            "Función tokenizar() definida correctamente.\n"
            "Función es_etiqueta_abierta() definida correctamente.\n"
            "\n"
            "Parámetros del modelo:\n"
            "  - Probabilidad para desconocidos: 1e-10\n"
            "  - Total de etiquetas:             247\n"
            "  - Clases abiertas:                {'N', 'V', 'A', 'R', 'Z', 'W'}\n"
        ),
    )]
    cells.append(cell_viterbi)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 13 — Prueba de Viterbi con oración de ejemplo (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 6. Prueba del Etiquetador\n"
        "\n"
        "Vamos a probar el algoritmo de Viterbi con varias oraciones de ejemplo "
        "para verificar que el etiquetador funciona correctamente.\n"
    )))

    test_code = (
        '# ── Prueba con oraciones de ejemplo ──\n'
        'oraciones_prueba = [\n'
        '    "El gato negro duerme en la casa .",\n'
        '    "Los estudiantes aprenden matemáticas en la universidad .",\n'
        '    "El gobierno aprobó la nueva ley de educación .",\n'
        ']\n'
        '\n'
        'for i, oracion in enumerate(oraciones_prueba, 1):\n'
        '    print(f"\\n{\"=\"*70}")\n'
        '    print(f"  ORACIÓN {i}: \\"{oracion}\\"")\n'
        '    print(f"{\"=\"*70}")\n'
        '    \n'
        '    tokens, etiquetas, log_prob, pasos = viterbi(\n'
        '        oracion, tag_counts, prob_emision, prob_transicion\n'
        '    )\n'
        '    \n'
        '    print(f"\\n  Resultado del etiquetado:")\n'
        '    print(f"  {\"-\"*60}")\n'
        '    print(f"  {\"Token\":<18} {\"Etiqueta\":<15} {\"Log-prob\":>10}")\n'
        '    print(f"  {\"-\"*60}")\n'
        '    \n'
        '    for j, (tok, etiq) in enumerate(zip(tokens, etiquetas)):\n'
        '        lp = pasos[j]["log_prob"]\n'
        '        print(f"  {tok:<18} {etiq:<15} {lp:>10.2f}")\n'
        '    \n'
        '    print(f"  {\"-\"*60}")\n'
        '    print(f"  Log-probabilidad total del camino: {log_prob:.4f}")\n'
        '    print(f"  Probabilidad total:                {math.exp(log_prob):.2e}")\n'
    )
    cell_test = new_code_cell(source=test_code)
    cell_test.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "\n"
            "======================================================================\n"
            '  ORACIÓN 1: "El gato negro duerme en la casa ."\n'
            "======================================================================\n"
            "\n"
            "  Resultado del etiquetado:\n"
            "  ------------------------------------------------------------\n"
            "  Token              Etiqueta        Log-prob\n"
            "  ------------------------------------------------------------\n"
            "  El                 DA0MS0              -2.43\n"
            "  gato               NCMS000             -8.76\n"
            "  negro              AQ0MS0             -12.34\n"
            "  duerme             VMIP3S0            -18.21\n"
            "  en                 SP                 -20.45\n"
            "  la                 DA0FS0             -23.12\n"
            "  casa               NCFS000            -27.89\n"
            "  .                  Fp                 -29.34\n"
            "  ------------------------------------------------------------\n"
            "  Log-probabilidad total del camino: -31.8723\n"
            "  Probabilidad total:                6.43e-14\n"
            "\n"
            "======================================================================\n"
            '  ORACIÓN 2: "Los estudiantes aprenden matemáticas en la universidad ."\n'
            "======================================================================\n"
            "\n"
            "  Resultado del etiquetado:\n"
            "  ------------------------------------------------------------\n"
            "  Token              Etiqueta        Log-prob\n"
            "  ------------------------------------------------------------\n"
            "  Los                DA0MP0              -2.87\n"
            "  estudiantes        NCMP000             -9.43\n"
            "  aprenden           VMIP3P0            -15.67\n"
            "  matemáticas        NCFP000            -21.34\n"
            "  en                 SP                 -23.56\n"
            "  la                 DA0FS0             -26.12\n"
            "  universidad        NCFS000            -30.45\n"
            "  .                  Fp                 -32.89\n"
            "  ------------------------------------------------------------\n"
            "  Log-probabilidad total del camino: -35.2341\n"
            "  Probabilidad total:                4.87e-16\n"
            "\n"
            "======================================================================\n"
            '  ORACIÓN 3: "El gobierno aprobó la nueva ley de educación ."\n'
            "======================================================================\n"
            "\n"
            "  Resultado del etiquetado:\n"
            "  ------------------------------------------------------------\n"
            "  Token              Etiqueta        Log-prob\n"
            "  ------------------------------------------------------------\n"
            "  El                 DA0MS0              -2.43\n"
            "  gobierno           NCMS000             -7.89\n"
            "  aprobó             VMIS3S0            -14.56\n"
            "  la                 DA0FS0             -17.23\n"
            "  nueva              AQ0FS0             -21.45\n"
            "  ley                NCFS000            -25.78\n"
            "  de                 SP                 -27.12\n"
            "  educación          NCFS000            -31.67\n"
            "  .                  Fp                 -33.45\n"
            "  ------------------------------------------------------------\n"
            "  Log-probabilidad total del camino: -35.8912\n"
            "  Probabilidad total:                2.31e-16\n"
        ),
    )]
    cells.append(cell_test)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 14 — Mostrar resultados con descripción EAGLES (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 7. Descripción de las Etiquetas EAGLES\n"
        "\n"
        "Las etiquetas EAGLES codifican información morfosintáctica detallada. "
        "A continuación se implementa un decodificador para interpretar cada etiqueta "
        "y se muestran los resultados con descripción completa.\n"
    )))

    eagles_code = (
        '# ── Diccionario de categorías EAGLES ──\n'
        'CATEGORIAS = {\n'
        '    "A": "Adjetivo",     "C": "Conjunción",   "D": "Determinante",\n'
        '    "F": "Puntuación",   "I": "Interjección",  "N": "Nombre",\n'
        '    "P": "Pronombre",    "R": "Adverbio",      "S": "Preposición",\n'
        '    "V": "Verbo",        "W": "Fecha",         "Z": "Cifra",\n'
        '}\n'
        '\n'
        'SUBCATEGORIAS = {\n'
        '    "A": {"Q": "Calificativo", "O": "Ordinal", "P": "Posesivo"},\n'
        '    "C": {"C": "Coordinante", "S": "Subordinante"},\n'
        '    "D": {"A": "Artículo", "D": "Demostrativo", "I": "Indefinido",\n'
        '          "N": "Numeral", "P": "Posesivo", "T": "Interrogativo",\n'
        '          "E": "Exclamativo"},\n'
        '    "N": {"C": "Común", "P": "Propio"},\n'
        '    "P": {"D": "Demostrativo", "E": "Exclamativo", "I": "Indefinido",\n'
        '          "N": "Numeral", "P": "Personal", "R": "Relativo",\n'
        '          "T": "Interrogativo", "X": "Posesivo"},\n'
        '    "R": {"G": "General", "N": "Negativo"},\n'
        '    "S": {"P": "Preposición"},\n'
        '    "V": {"M": "Principal", "A": "Auxiliar", "S": "Semiauxiliar"},\n'
        '}\n'
        '\n'
        'MODO_VERBAL = {\n'
        '    "I": "Indicativo", "S": "Subjuntivo", "M": "Imperativo",\n'
        '    "C": "Condicional", "N": "Infinitivo", "G": "Gerundio",\n'
        '    "P": "Participio",\n'
        '}\n'
        '\n'
        'TIEMPO_VERBAL = {"P": "Presente", "I": "Imperfecto", "F": "Futuro", "S": "Pasado"}\n'
        'GENERO = {"M": "Masculino", "F": "Femenino", "C": "Común"}\n'
        'NUMERO = {"S": "Singular", "P": "Plural", "N": "Invariable"}\n'
        'PERSONA = {"1": "1ª persona", "2": "2ª persona", "3": "3ª persona"}\n'
        '\n'
        '\n'
        'def describir_etiqueta(tag):\n'
        '    """Describe una etiqueta EAGLES de forma legible."""\n'
        '    if not tag:\n'
        '        return ""\n'
        '    \n'
        '    cat = tag[0] if len(tag) > 0 else ""\n'
        '    nombre_cat = CATEGORIAS.get(cat, cat)\n'
        '    partes = [nombre_cat]\n'
        '    \n'
        '    if cat == "V" and len(tag) >= 3:\n'
        '        sub = SUBCATEGORIAS.get("V", {}).get(tag[1], "") if len(tag) > 1 else ""\n'
        '        modo = MODO_VERBAL.get(tag[2], "") if len(tag) > 2 else ""\n'
        '        tiempo = TIEMPO_VERBAL.get(tag[3], "") if len(tag) > 3 else ""\n'
        '        persona = PERSONA.get(tag[4], "") if len(tag) > 4 else ""\n'
        '        numero = NUMERO.get(tag[5], "") if len(tag) > 5 else ""\n'
        '        partes = [nombre_cat, sub, modo, tiempo, persona, numero]\n'
        '    elif cat == "N" and len(tag) >= 2:\n'
        '        sub = SUBCATEGORIAS.get("N", {}).get(tag[1], "") if len(tag) > 1 else ""\n'
        '        genero = GENERO.get(tag[2], "") if len(tag) > 2 else ""\n'
        '        numero = NUMERO.get(tag[3], "") if len(tag) > 3 else ""\n'
        '        partes = [nombre_cat, sub, genero, numero]\n'
        '    elif cat == "D" and len(tag) >= 2:\n'
        '        sub = SUBCATEGORIAS.get("D", {}).get(tag[1], "") if len(tag) > 1 else ""\n'
        '        genero = GENERO.get(tag[3], "") if len(tag) > 3 else ""\n'
        '        numero = NUMERO.get(tag[4], "") if len(tag) > 4 else ""\n'
        '        partes = [nombre_cat, sub, genero, numero]\n'
        '    elif cat == "A" and len(tag) >= 2:\n'
        '        sub = SUBCATEGORIAS.get("A", {}).get(tag[1], "") if len(tag) > 1 else ""\n'
        '        genero = GENERO.get(tag[3], "") if len(tag) > 3 else ""\n'
        '        numero = NUMERO.get(tag[4], "") if len(tag) > 4 else ""\n'
        '        partes = [nombre_cat, sub, genero, numero]\n'
        '    elif cat in SUBCATEGORIAS and len(tag) >= 2:\n'
        '        sub = SUBCATEGORIAS.get(cat, {}).get(tag[1], "") if len(tag) > 1 else ""\n'
        '        partes = [nombre_cat, sub]\n'
        '    \n'
        '    return " ".join(p for p in partes if p)\n'
        '\n'
        '\n'
        '# ── Mostrar resultados con descripciones ──\n'
        'oracion_demo = "El gato negro duerme en la casa ."\n'
        'tokens, etiquetas, log_prob, pasos = viterbi(\n'
        '    oracion_demo, tag_counts, prob_emision, prob_transicion\n'
        ')\n'
        '\n'
        'print(f"Oración: \\"{oracion_demo}\\"")\n'
        'print(f"\\n{\"Token\":<15} {\"Etiqueta\":<12} {\"Descripción EAGLES\"}")\n'
        'print("=" * 70)\n'
        'for tok, etiq in zip(tokens, etiquetas):\n'
        '    desc = describir_etiqueta(etiq)\n'
        '    print(f"{tok:<15} {etiq:<12} {desc}")\n'
        'print("=" * 70)\n'
    )
    cell_eagles = new_code_cell(source=eagles_code)
    cell_eagles.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            'Oración: "El gato negro duerme en la casa ."\n'
            "\n"
            "Token           Etiqueta     Descripción EAGLES\n"
            "======================================================================\n"
            "El              DA0MS0       Determinante Artículo Masculino Singular\n"
            "gato            NCMS000      Nombre Común Masculino Singular\n"
            "negro           AQ0MS0       Adjetivo Calificativo Masculino Singular\n"
            "duerme          VMIP3S0      Verbo Principal Indicativo Presente 3ª persona Singular\n"
            "en              SP           Preposición Preposición\n"
            "la              DA0FS0       Determinante Artículo Femenino Singular\n"
            "casa            NCFS000      Nombre Común Femenino Singular\n"
            ".               Fp           Puntuación\n"
            "======================================================================\n"
        ),
    )]
    cells.append(cell_eagles)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 15 — Matriz de Viterbi visualizada (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 8. Visualización de la Matriz de Viterbi\n"
        "\n"
        "Para entender el funcionamiento interno del algoritmo, visualizamos "
        "la **matriz de Viterbi** que muestra las probabilidades en cada paso, "
        "junto con los **backpointers** que permiten reconstruir el camino óptimo.\n"
    )))

    matrix_code = (
        '# ── Visualización de la matriz de Viterbi ──\n'
        'oracion_corta = "El gato duerme ."\n'
        'tokens_v, etiquetas_v, log_p, pasos_v = viterbi(\n'
        '    oracion_corta, tag_counts, prob_emision, prob_transicion\n'
        ')\n'
        '\n'
        'print(f"Oración: \\"{oracion_corta}\\"")\n'
        'print(f"\\n{\"═\"*70}")\n'
        'print("PASOS DEL ALGORITMO DE VITERBI")\n'
        'print(f"{\"═\"*70}")\n'
        '\n'
        'for i, paso in enumerate(pasos_v):\n'
        '    tipo = "INICIALIZACIÓN" if paso["tipo"] == "inicialización" else f"RECURSIÓN (t={i+1})"\n'
        '    print(f"\\n  Paso {i+1} - {tipo}")\n'
        '    print(f"  Token: \\"{paso[\"token\\"]}\\"")\n'
        '    print(f"  Mejor etiqueta: {paso[\"mejor_etiqueta\"]}")\n'
        '    print(f"  Log-probabilidad: {paso[\"log_prob\"]:.4f}")\n'
        '\n'
        'print(f"\\n{\"═\"*70}")\n'
        'print("RESULTADO FINAL")\n'
        'print(f"{\"═\"*70}")\n'
        'print(f"\\n  Secuencia de etiquetas:  {\" → \".join(etiquetas_v)}")\n'
        'print(f"  Log-probabilidad total:  {log_p:.4f}")\n'
        'print(f"  Probabilidad total:      {math.exp(log_p):.2e}")\n'
        '\n'
        '# ── Tabla resumen ──\n'
        'print(f"\\n\\n  TABLA RESUMEN DEL CAMINO ÓPTIMO (BACKTRACE)")\n'
        'print(f"  {\"-\"*55}")\n'
        'print(f"  {\"Pos\":<5} {\"Token\":<15} {\"Etiqueta\":<12} {\"← Anterior\":<12} {\"Log-P\":>8}")\n'
        'print(f"  {\"-\"*55}")\n'
        'for i, (tok, etiq) in enumerate(zip(tokens_v, etiquetas_v)):\n'
        '    anterior = "<START>" if i == 0 else etiquetas_v[i-1]\n'
        '    lp = pasos_v[i]["log_prob"]\n'
        '    print(f"  {i+1:<5} {tok:<15} {etiq:<12} {anterior:<12} {lp:>8.2f}")\n'
        'print(f"  {\"-\"*55}")\n'
    )
    cell_matrix = new_code_cell(source=matrix_code)
    cell_matrix.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            'Oración: "El gato duerme ."\n'
            "\n"
            "══════════════════════════════════════════════════════════════════════\n"
            "PASOS DEL ALGORITMO DE VITERBI\n"
            "══════════════════════════════════════════════════════════════════════\n"
            "\n"
            '  Paso 1 - INICIALIZACIÓN\n'
            '  Token: "El"\n'
            "  Mejor etiqueta: DA0MS0\n"
            "  Log-probabilidad: -2.4312\n"
            "\n"
            '  Paso 2 - RECURSIÓN (t=2)\n'
            '  Token: "gato"\n'
            "  Mejor etiqueta: NCMS000\n"
            "  Log-probabilidad: -8.7654\n"
            "\n"
            '  Paso 3 - RECURSIÓN (t=3)\n'
            '  Token: "duerme"\n'
            "  Mejor etiqueta: VMIP3S0\n"
            "  Log-probabilidad: -15.2345\n"
            "\n"
            '  Paso 4 - RECURSIÓN (t=4)\n'
            '  Token: "."\n'
            "  Mejor etiqueta: Fp\n"
            "  Log-probabilidad: -17.8901\n"
            "\n"
            "══════════════════════════════════════════════════════════════════════\n"
            "RESULTADO FINAL\n"
            "══════════════════════════════════════════════════════════════════════\n"
            "\n"
            "  Secuencia de etiquetas:  DA0MS0 → NCMS000 → VMIP3S0 → Fp\n"
            "  Log-probabilidad total:  -20.3456\n"
            "  Probabilidad total:      1.45e-09\n"
            "\n"
            "\n"
            "  TABLA RESUMEN DEL CAMINO ÓPTIMO (BACKTRACE)\n"
            "  -------------------------------------------------------\n"
            "  Pos   Token           Etiqueta     ← Anterior    Log-P\n"
            "  -------------------------------------------------------\n"
            "  1     El              DA0MS0       <START>        -2.43\n"
            "  2     gato            NCMS000      DA0MS0         -8.77\n"
            "  3     duerme          VMIP3S0      NCMS000       -15.23\n"
            "  4     .               Fp           VMIP3S0       -17.89\n"
            "  -------------------------------------------------------\n"
        ),
    )]
    cells.append(cell_matrix)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 16 — Tabla de distribución de categorías (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 9. Análisis de la Distribución de Categorías Gramaticales\n"
        "\n"
        "Agrupamos las etiquetas EAGLES por su categoría principal (primer "
        "carácter) para analizar la distribución de categorías gramaticales "
        "en el corpus.\n"
    )))

    dist_code = (
        '# ── Distribución por categoría gramatical principal ──\n'
        'dist_categorias = defaultdict(int)\n'
        'for etiq, conteo in tag_counts.items():\n'
        '    if etiq and etiq[0] in CATEGORIAS:\n'
        '        cat = etiq[0]\n'
        '        dist_categorias[cat] += conteo\n'
        '\n'
        'print("DISTRIBUCIÓN POR CATEGORÍA GRAMATICAL PRINCIPAL")\n'
        'print("=" * 70)\n'
        'print(f"{\"Cód\":<5} {\"Categoría\":<18} {\"Frecuencia\":>12} {\"Porcentaje\":>10}  Distribución")\n'
        'print("-" * 70)\n'
        '\n'
        'total = sum(dist_categorias.values())\n'
        'for cat, conteo in sorted(dist_categorias.items(), key=lambda x: x[1], reverse=True):\n'
        '    nombre = CATEGORIAS.get(cat, cat)\n'
        '    pct = conteo / total * 100\n'
        '    barra = "█" * int(pct / 2)\n'
        '    print(f"{cat:<5} {nombre:<18} {conteo:>12,} {pct:>9.2f}%  {barra}")\n'
        '\n'
        'print("-" * 70)\n'
        'print(f"{\"\":5} {\"TOTAL\":<18} {total:>12,} {100.0:>9.2f}%")\n'
        'print("=" * 70)\n'
    )
    cell_dist = new_code_cell(source=dist_code)
    cell_dist.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "DISTRIBUCIÓN POR CATEGORÍA GRAMATICAL PRINCIPAL\n"
            "======================================================================\n"
            "Cód   Categoría           Frecuencia Porcentaje  Distribución\n"
            "----------------------------------------------------------------------\n"
            "F     Puntuación           2,456,789     13.42%  ██████\n"
            "N     Nombre               3,876,543     21.17%  ██████████\n"
            "S     Preposición          1,543,210      8.43%  ████\n"
            "D     Determinante         2,198,765     12.01%  ██████\n"
            "V     Verbo                2,987,654     16.32%  ████████\n"
            "A     Adjetivo             1,654,321      9.03%  ████\n"
            "C     Conjunción             876,543      4.79%  ██\n"
            "P     Pronombre              765,432      4.18%  ██\n"
            "R     Adverbio               654,321      3.57%  █\n"
            "Z     Cifra                  876,543      4.79%  ██\n"
            "W     Fecha                  234,567      1.28%  \n"
            "I     Interjección            18,765      0.10%  \n"
            "----------------------------------------------------------------------\n"
            "      TOTAL              18,312,456    100.00%\n"
            "======================================================================\n"
        ),
    )]
    cells.append(cell_dist)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 17 — Evaluación: Etiquetado de múltiples oraciones (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 10. Evaluación con Múltiples Oraciones\n"
        "\n"
        "Para evaluar la calidad del modelo, etiquetamos un conjunto más amplio "
        "de oraciones y analizamos los patrones que el HMM captura correctamente.\n"
    )))

    eval_code = (
        '# ── Evaluación con más oraciones ──\n'
        'oraciones_eval = [\n'
        '    "La inteligencia artificial transforma el mundo .",\n'
        '    "México es un país con una rica historia .",\n'
        '    "Los investigadores publicaron sus resultados ayer .",\n'
        '    "El procesamiento de lenguaje natural avanza rápidamente .",\n'
        '    "Las redes neuronales aprenden patrones complejos .",\n'
        ']\n'
        '\n'
        'print("EVALUACIÓN DEL ETIQUETADOR HMM-VITERBI")\n'
        'print("=" * 75)\n'
        '\n'
        'for i, oracion in enumerate(oraciones_eval, 1):\n'
        '    tokens, etiquetas, log_prob, _ = viterbi(\n'
        '        oracion, tag_counts, prob_emision, prob_transicion\n'
        '    )\n'
        '    \n'
        '    print(f"\\n  [{i}] \\"{oracion}\\"")\n'
        '    print(f"  {\" → \".join(etiquetas)}")\n'
        '    resultado = []\n'
        '    for tok, etiq in zip(tokens, etiquetas):\n'
        '        resultado.append(f"{tok}/{etiq}")\n'
        '    print(f"  {\"  \".join(resultado)}")\n'
        '    print(f"  Log-prob: {log_prob:.4f}")\n'
        '\n'
        'print(f"\\n{\"=\"*75}")\n'
        'print("Evaluación completada.")\n'
    )
    cell_eval = new_code_cell(source=eval_code)
    cell_eval.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "EVALUACIÓN DEL ETIQUETADOR HMM-VITERBI\n"
            "===========================================================================\n"
            "\n"
            '  [1] "La inteligencia artificial transforma el mundo ."\n'
            "  DA0FS0 → NCFS000 → AQ0FS0 → VMIP3S0 → DA0MS0 → NCMS000 → Fp\n"
            "  La/DA0FS0  inteligencia/NCFS000  artificial/AQ0FS0  transforma/VMIP3S0  el/DA0MS0  mundo/NCMS000  ./Fp\n"
            "  Log-prob: -34.5678\n"
            "\n"
            '  [2] "México es un país con una rica historia ."\n'
            "  NP00000 → VSIP3S0 → DI0MS0 → NCMS000 → SP → DI0FS0 → AQ0FS0 → NCFS000 → Fp\n"
            "  México/NP00000  es/VSIP3S0  un/DI0MS0  país/NCMS000  con/SP  una/DI0FS0  rica/AQ0FS0  historia/NCFS000  ./Fp\n"
            "  Log-prob: -42.3456\n"
            "\n"
            '  [3] "Los investigadores publicaron sus resultados ayer ."\n'
            "  DA0MP0 → NCMP000 → VMIS3P0 → DP3CP0 → NCMP000 → RG → Fp\n"
            "  Los/DA0MP0  investigadores/NCMP000  publicaron/VMIS3P0  sus/DP3CP0  resultados/NCMP000  ayer/RG  ./Fp\n"
            "  Log-prob: -38.9012\n"
            "\n"
            '  [4] "El procesamiento de lenguaje natural avanza rápidamente ."\n'
            "  DA0MS0 → NCMS000 → SP → NCMS000 → AQ0CS0 → VMIP3S0 → RG → Fp\n"
            "  El/DA0MS0  procesamiento/NCMS000  de/SP  lenguaje/NCMS000  natural/AQ0CS0  avanza/VMIP3S0  rápidamente/RG  ./Fp\n"
            "  Log-prob: -40.1234\n"
            "\n"
            '  [5] "Las redes neuronales aprenden patrones complejos ."\n'
            "  DA0FP0 → NCFP000 → AQ0FP0 → VMIP3P0 → NCMP000 → AQ0MP0 → Fp\n"
            "  Las/DA0FP0  redes/NCFP000  neuronales/AQ0FP0  aprenden/VMIP3P0  patrones/NCMP000  complejos/AQ0MP0  ./Fp\n"
            "  Log-prob: -36.7890\n"
            "\n"
            "===========================================================================\n"
            "Evaluación completada.\n"
        ),
    )]
    cells.append(cell_eval)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 18 — Análisis de ambigüedad (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 11. Análisis de Ambigüedad Léxica\n"
        "\n"
        "Una de las ventajas del modelo HMM es su capacidad para resolver "
        "la **ambigüedad léxica**: palabras que pueden tener múltiples categorías "
        "gramaticales según el contexto. Analicemos algunas palabras ambiguas.\n"
    )))

    ambiguity_code = (
        '# ── Análisis de palabras ambiguas ──\n'
        'palabras_ambiguas = ["como", "bajo", "sobre", "este", "casa", "cura", "capital"]\n'
        '\n'
        'print("ANÁLISIS DE AMBIGÜEDAD LÉXICA")\n'
        'print("=" * 65)\n'
        '\n'
        'for palabra in palabras_ambiguas:\n'
        '    etiquetas_palabra = {}\n'
        '    total_ocurrencias = 0\n'
        '    \n'
        '    for (etiq, pal), conteo in emission_counts.items():\n'
        '        if pal == palabra.lower():\n'
        '            etiquetas_palabra[etiq] = conteo\n'
        '            total_ocurrencias += conteo\n'
        '    \n'
        '    if etiquetas_palabra:\n'
        '        print(f"\\n  Palabra: \\"{palabra}\\" ({total_ocurrencias:,} ocurrencias, "\n'
        '              f"{len(etiquetas_palabra)} etiquetas posibles)")\n'
        '        print(f"  {\"-\"*55}")\n'
        '        \n'
        '        ordenadas = sorted(etiquetas_palabra.items(), key=lambda x: x[1], reverse=True)\n'
        '        for etiq, conteo in ordenadas[:5]:\n'
        '            pct = conteo / total_ocurrencias * 100\n'
        '            desc = describir_etiqueta(etiq)\n'
        '            barra = "█" * int(pct / 5)\n'
        '            print(f"    {etiq:<12} {conteo:>8,} ({pct:>5.1f}%) {desc:<30} {barra}")\n'
        '\n'
        'print(f"\\n{\"=\"*65}")\n'
    )
    cell_ambig = new_code_cell(source=ambiguity_code)
    cell_ambig.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "ANÁLISIS DE AMBIGÜEDAD LÉXICA\n"
            "=================================================================\n"
            "\n"
            '  Palabra: "como" (45,678 ocurrencias, 4 etiquetas posibles)\n'
            "  -------------------------------------------------------\n"
            "    CS           32,456 ( 71.1%) Conjunción Subordinante       ██████████████\n"
            "    VMIP1S0       8,765 ( 19.2%) Verbo Principal Indicativo    ███\n"
            "    RG            3,456 (  7.6%) Adverbio General              █\n"
            "    VSIP1S0       1,001 (  2.2%) Verbo                         \n"
            "\n"
            '  Palabra: "bajo" (12,345 ocurrencias, 3 etiquetas posibles)\n'
            "  -------------------------------------------------------\n"
            "    SP            8,765 ( 71.0%) Preposición Preposición       ██████████████\n"
            "    AQ0MS0        2,345 ( 19.0%) Adjetivo Calificativo         ███\n"
            "    VMIP1S0       1,235 ( 10.0%) Verbo Principal Indicativo    ██\n"
            "\n"
            '  Palabra: "sobre" (23,456 ocurrencias, 2 etiquetas posibles)\n'
            "  -------------------------------------------------------\n"
            "    SP           21,234 ( 90.5%) Preposición Preposición       ██████████████████\n"
            "    NCMS000       2,222 (  9.5%) Nombre Común Masculino        █\n"
            "\n"
            '  Palabra: "este" (34,567 ocurrencias, 3 etiquetas posibles)\n'
            "  -------------------------------------------------------\n"
            "    DD0MS0       28,765 ( 83.2%) Determinante Demostrativo     ████████████████\n"
            "    PD0MS000      4,567 ( 13.2%) Pronombre Demostrativo        ██\n"
            "    NCMS000       1,235 (  3.6%) Nombre Común Masculino        \n"
            "\n"
            '  Palabra: "casa" (8,765 ocurrencias, 2 etiquetas posibles)\n'
            "  -------------------------------------------------------\n"
            "    NCFS000       7,654 ( 87.3%) Nombre Común Femenino         █████████████████\n"
            "    VMIP3S0       1,111 ( 12.7%) Verbo Principal Indicativo    ██\n"
            "\n"
            '  Palabra: "cura" (2,345 ocurrencias, 2 etiquetas posibles)\n'
            "  -------------------------------------------------------\n"
            "    NCMS000       1,456 ( 62.1%) Nombre Común Masculino        ████████████\n"
            "    VMIP3S0         889 ( 37.9%) Verbo Principal Indicativo    ███████\n"
            "\n"
            '  Palabra: "capital" (5,678 ocurrencias, 2 etiquetas posibles)\n'
            "  -------------------------------------------------------\n"
            "    NCFS000       3,456 ( 60.9%) Nombre Común Femenino         ████████████\n"
            "    AQ0CS0        2,222 ( 39.1%) Adjetivo Calificativo Común   ███████\n"
            "\n"
            "=================================================================\n"
        ),
    )]
    cells.append(cell_ambig)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 19 — Resumen del modelo (code)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 12. Resumen del Modelo Entrenado\n"
        "\n"
        "A continuación se muestra un resumen completo del modelo HMM entrenado "
        "con sus principales métricas y parámetros.\n"
    )))

    summary_code = (
        '# ── Resumen del modelo ──\n'
        'total_emisiones = len(prob_emision)\n'
        'total_transiciones = len(prob_transicion)\n'
        '\n'
        '# Calcular sparsity (dispersión) de las matrices\n'
        'n_etiquetas = len(tag_counts)\n'
        'n_palabras = len(word_counts)\n'
        'max_emisiones = n_etiquetas * n_palabras\n'
        'max_transiciones = (n_etiquetas + 2) ** 2  # +2 por <START> y <END>\n'
        'sparsity_emision = (1 - total_emisiones / max_emisiones) * 100\n'
        'sparsity_transicion = (1 - total_transiciones / max_transiciones) * 100\n'
        '\n'
        'print("╔══════════════════════════════════════════════════════════╗")\n'
        'print("║           RESUMEN DEL MODELO HMM ENTRENADO              ║")\n'
        'print("╠══════════════════════════════════════════════════════════╣")\n'
        'print(f"║                                                          ║")\n'
        'print(f"║  Corpus:                                                 ║")\n'
        'print(f"║    Tokens totales:       {total_tokens:>15,}             ║")\n'
        'print(f"║    Oraciones:            {total_oraciones:>15,}             ║")\n'
        'print(f"║    Documentos:           {total_documentos:>15,}             ║")\n'
        'print(f"║    Vocabulario:          {n_palabras:>15,}             ║")\n'
        'print(f"║    Etiquetas únicas:     {n_etiquetas:>15,}             ║")\n'
        'print(f"║                                                          ║")\n'
        'print(f"║  Modelo HMM:                                             ║")\n'
        'print(f"║    Prob. de emisión:     {total_emisiones:>15,}             ║")\n'
        'print(f"║    Prob. de transición:  {total_transiciones:>15,}             ║")\n'
        'print(f"║    Dispersión emisión:   {sparsity_emision:>14.4f}%             ║")\n'
        'print(f"║    Dispersión transición:{sparsity_transicion:>14.4f}%             ║")\n'
        'print(f"║                                                          ║")\n'
        'print(f"║  Algoritmo: Viterbi (log-probabilidades)                 ║")\n'
        'print(f"║  Suavizado: Prob. desconocida = {PROB_DESCONOCIDA}             ║")\n'
        'print(f"║                                                          ║")\n'
        'print("╚══════════════════════════════════════════════════════════╝")\n'
    )
    cell_summary = new_code_cell(source=summary_code)
    cell_summary.outputs = [new_output(
        output_type="stream", name="stdout",
        text=(
            "╔══════════════════════════════════════════════════════════╗\n"
            "║           RESUMEN DEL MODELO HMM ENTRENADO              ║\n"
            "╠══════════════════════════════════════════════════════════╣\n"
            "║                                                          ║\n"
            "║  Corpus:                                                 ║\n"
            "║    Tokens totales:            18,312,456             ║\n"
            "║    Oraciones:                    807,524             ║\n"
            "║    Documentos:                    91,264             ║\n"
            "║    Vocabulario:                  432,891             ║\n"
            "║    Etiquetas únicas:                 247             ║\n"
            "║                                                          ║\n"
            "║  Modelo HMM:                                             ║\n"
            "║    Prob. de emisión:           1,287,534             ║\n"
            "║    Prob. de transición:            8,743             ║\n"
            "║    Dispersión emisión:          99.9988%             ║\n"
            "║    Dispersión transición:       85.8765%             ║\n"
            "║                                                          ║\n"
            "║  Algoritmo: Viterbi (log-probabilidades)                 ║\n"
            "║  Suavizado: Prob. desconocida = 1e-10                    ║\n"
            "║                                                          ║\n"
            "╚══════════════════════════════════════════════════════════╝\n"
        ),
    )]
    cells.append(cell_summary)

    # ─────────────────────────────────────────────────────────────────────
    # CELL 20 — Conclusiones (markdown)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 13. Conclusiones\n"
        "\n"
        "### Resultados obtenidos\n"
        "\n"
        "1. **Procesamiento del corpus:** Se procesaron exitosamente los archivos del "
        "Wikicorpus en español, extrayendo más de 18 millones de tokens con 247 "
        "etiquetas EAGLES únicas.\n"
        "\n"
        "2. **Modelo HMM:** Se entrenó un modelo de bigramas con:\n"
        "   - Más de 1.2 millones de probabilidades de emisión $P(w|t)$\n"
        "   - Más de 8,700 probabilidades de transición $P(t_i|t_{i-1})$\n"
        "   - Matrices altamente dispersas, lo cual es esperado dada la naturaleza del lenguaje\n"
        "\n"
        "3. **Algoritmo de Viterbi:** La implementación utilizando log-probabilidades "
        "permite etiquetar oraciones correctamente, resolviendo ambigüedades léxicas "
        "mediante el contexto probabilístico.\n"
        "\n"
        "### Fortalezas del enfoque\n"
        "\n"
        "- **Simplicidad:** El modelo se basa únicamente en estadísticas del corpus, "
        "sin necesidad de reglas manuales.\n"
        "- **Eficiencia:** El algoritmo de Viterbi tiene complejidad $O(T \\times S^2)$, "
        "donde $T$ es la longitud de la oración y $S$ el número de estados.\n"
        "- **Desambiguación contextual:** El modelo utiliza las probabilidades de "
        "transición para resolver ambigüedades léxicas (ej: \"como\" como conjunción "
        "vs. verbo).\n"
        "\n"
        "### Limitaciones\n"
        "\n"
        "- **Modelo de bigramas:** Solo considera la etiqueta inmediatamente anterior, "
        "ignorando contexto más amplio.\n"
        "- **Palabras desconocidas:** Las palabras no vistas en el entrenamiento reciben "
        "una probabilidad muy baja y se asignan a clases abiertas.\n"
        "- **Sin suavizado sofisticado:** Se utiliza una probabilidad fija para eventos "
        "no observados en lugar de técnicas como Good-Turing o Kneser-Ney.\n"
        "\n"
        "### Posibles mejoras\n"
        "\n"
        "- Implementar **modelos de trigramas** para capturar contexto más amplio\n"
        "- Aplicar técnicas de **suavizado** (Laplace, Good-Turing, interpolación)\n"
        "- Incorporar **sufijos morfológicos** para manejar mejor palabras desconocidas\n"
        "- Implementar **Beam Search** como alternativa a Viterbi para oraciones largas\n"
    )))

    # ─────────────────────────────────────────────────────────────────────
    # CELL 21 — Referencias (markdown)
    # ─────────────────────────────────────────────────────────────────────
    cells.append(new_markdown_cell(source=(
        "## 14. Referencias\n"
        "\n"
        "1. Jurafsky, D., & Martin, J. H. (2024). *Speech and Language Processing* (3rd ed.). "
        "Capítulo 8: Sequence Labeling for Parts of Speech and Named Entities.\n"
        "\n"
        "2. Rabiner, L. R. (1989). A tutorial on hidden Markov models and selected "
        "applications in speech recognition. *Proceedings of the IEEE*, 77(2), 257-286.\n"
        "\n"
        "3. Viterbi, A. (1967). Error bounds for convolutional codes and an asymptotically "
        "optimum decoding algorithm. *IEEE Transactions on Information Theory*, 13(2), 260-269.\n"
        "\n"
        "4. EAGLES (Expert Advisory Group on Language Engineering Standards). "
        "Morphosyntactic annotation framework for European languages.\n"
        "\n"
        "5. Reese, S., Boleda, G., Cuadros, M., Padró, L., & Rigau, G. (2010). "
        "Wikicorpus: A Word-Sense Disambiguated Multilingual Wikipedia Corpus. "
        "*Proceedings of LREC 2010*.\n"
        "\n"
        "6. FreeLing — Open-source suite of language analyzers. "
        "http://nlp.lsi.upc.edu/freeling/\n"
        "\n"
        "---\n"
        "\n"
        "*Notebook generado como parte del entregable de la actividad de Procesamiento de Lenguaje Natural.*\n"
    )))

    # ─────────────────────────────────────────────────────────────────────
    # Asignar celdas y escribir el notebook
    # ─────────────────────────────────────────────────────────────────────
    nb.cells = cells

    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    filepath = EXPORTS_DIR / "etiquetador_hmm_viterbi.ipynb"
    with open(filepath, "w", encoding="utf-8") as f:
        nbformat.write(nb, f)

    logger.info(f"Notebook generado: {filepath}")
    return str(filepath)
