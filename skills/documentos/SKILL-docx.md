# SKILL: Documentos Word (.docx)

## Proposito
Generar documentos Word profesionales con formato consistente para todos
los entregables del framework NXT.

## Cuando se Activa
- Crear PRD
- Crear documento de arquitectura
- Crear project brief
- Crear QA report
- Cualquier documento formal .docx

## Instrucciones

### 1. Formato Estandar NXT

#### Tipografia
- **Cuerpo**: Calibri 11pt
- **Titulo principal**: Calibri Bold 24pt
- **Titulos H1**: Calibri Bold 18pt
- **Titulos H2**: Calibri Bold 14pt
- **Titulos H3**: Calibri Bold 12pt

#### Margenes
- Superior: 2.5 cm
- Inferior: 2.5 cm
- Izquierdo: 2.5 cm
- Derecho: 2.5 cm

#### Otros elementos
- Numeracion de paginas: inferior derecha
- Header: Nombre del proyecto + Fecha
- Footer: Numero de pagina + "NXT AI Development"

### 2. Estructura de Documentos

#### PRD (Product Requirements Document)
1. Portada con metadata
2. Tabla de contenidos
3. Secciones numeradas (1, 1.1, 1.2...)
4. Tablas para requisitos
5. Firma/aprobacion al final

#### Architecture Document
1. Portada
2. Diagramas embebidos (como imagenes)
3. Tablas de tech stack
4. Secciones tecnicas
5. ADRs como anexos

#### QA Report
1. Resumen ejecutivo
2. Metricas visuales
3. Tablas de bugs
4. Veredicto destacado

#### Project Brief
1. Portada
2. Resumen ejecutivo
3. Problema/Solucion
4. Usuarios objetivo
5. Alcance

### 3. Estilos de Tablas

```
+------------------+------------------+------------------+
| Header 1         | Header 2         | Header 3         |
+------------------+------------------+------------------+
| Celda            | Celda            | Celda            |
| Celda            | Celda            | Celda            |
+------------------+------------------+------------------+
```

Colores:
- Header: Fondo #3B82F6 (azul), texto blanco
- Filas alternas: #F3F4F6 (gris claro)
- Bordes: #E5E7EB

### 4. Proceso de Generacion

1. Recopilar contenido del documento fuente (markdown)
2. Aplicar template correspondiente
3. Insertar diagramas como imagenes
4. Generar .docx con estructura apropiada
5. Guardar en directorio correspondiente:
   - Analysis: `docs/1-analysis/`
   - Planning: `docs/2-planning/`
   - Solutioning: `docs/3-solutioning/`
   - Implementation: `docs/4-implementation/`

### 5. Metadatos del Documento

Cada documento generado debe incluir en propiedades:
- Titulo del proyecto
- Version del documento
- Fecha de creacion
- Autor: "NXT AI Development - [Agente]"
- Estado: Draft/Review/Approved
- Empresa: [TU_EMPRESA]

## Comandos de Ejemplo

```
"Crea el PRD en formato Word"
"Genera el documento de arquitectura como .docx"
"Crea el QA report del sprint 1"
"Exporta el project brief a Word"
"Convierte este markdown a Word profesional"
```

## Plantilla Base Word

```markdown
---
title: "[TITULO DEL DOCUMENTO]"
author: "NXT AI Development"
date: "[FECHA]"
version: "1.0"
status: "Draft"
---

# [TITULO]

## Metadata
| Campo | Valor |
|-------|-------|
| Version | 1.0 |
| Fecha | [FECHA] |
| Autor | NXT [AGENTE] |
| Estado | Draft |

---

## 1. Seccion Principal

### 1.1 Subseccion

[Contenido]

### 1.2 Subseccion

[Contenido]

---

## 2. Siguiente Seccion

[Contenido]

---

## Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| | | | |

---

*Documento generado por NXT AI Development*
```

## Integracion Python

Para generar documentos programaticamente, usar python-docx:

```python
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

def crear_documento_nxt(titulo, contenido, output_path):
    doc = Document()

    # Configurar estilos
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    # Titulo
    titulo_p = doc.add_heading(titulo, 0)
    titulo_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Contenido
    for seccion in contenido:
        doc.add_heading(seccion['titulo'], level=seccion['nivel'])
        doc.add_paragraph(seccion['texto'])

    doc.save(output_path)
```
