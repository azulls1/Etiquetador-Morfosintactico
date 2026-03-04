# SKILL: Documentos PDF

## Proposito
Crear y manipular documentos PDF para reportes finales, exportaciones
y documentacion de entrega.

## Cuando se Activa
- Exportar documentos finales
- Crear reportes ejecutivos
- Generar documentacion de entrega
- Combinar multiples documentos
- Agregar marcas de agua o firmas

## Instrucciones

### 1. Formato Estandar NXT para PDF

#### Pagina
- Tamano: A4 (210 x 297 mm)
- Orientacion: Vertical (o Horizontal para presentaciones)
- Margenes: 2.5 cm todos los lados

#### Tipografia
- Titulo: 24pt Bold
- Subtitulos: 18pt Bold
- Cuerpo: 11pt Regular
- Pie de pagina: 9pt

#### Colores
- Primario: #3B82F6 (azul)
- Secundario: #F97316 (naranja)
- Texto: #1F2937
- Fondo: #FFFFFF

### 2. Estructura de PDF

#### Portada
```
+--------------------------------------------------+
|                                                  |
|                                                  |
|              [LOGO NXT]                          |
|                                                  |
|         TITULO DEL DOCUMENTO                     |
|         ─────────────────────                    |
|                                                  |
|              Subtitulo                           |
|                                                  |
|                                                  |
|                                                  |
|              Version X.X                         |
|              Fecha: DD/MM/YYYY                   |
|                                                  |
|              [EMPRESA]                           |
|                                                  |
+--------------------------------------------------+
```

#### Paginas interiores
- Header: Titulo del documento | Pagina X de Y
- Footer: NXT AI Development | Confidencial
- Numeracion de paginas

### 3. Tipos de PDF

#### Reporte Ejecutivo
- Resumen en primera pagina
- Graficos y metricas
- Conclusiones destacadas
- Maximo 5-10 paginas

#### Documentacion Tecnica
- Tabla de contenidos
- Secciones numeradas
- Diagramas embebidos
- Anexos al final

#### Entregables de Proyecto
- Portada con metadata
- Indice
- Contenido principal
- Aprobaciones/Firmas

### 4. Funcionalidades Especiales

#### Tabla de Contenidos
- Generada automaticamente
- Con hipervinculos internos
- Numeracion de paginas

#### Marcadores (Bookmarks)
- Por cada seccion principal
- Navegacion facil en lectores PDF

#### Marca de Agua
- "DRAFT" para borradores
- "CONFIDENCIAL" para documentos sensibles
- Logo de empresa semitransparente

#### Seguridad
- Password protection (opcional)
- Restriccion de impresion/copia

### 5. Proceso de Generacion

1. Crear contenido en markdown o desde otro skill
2. Aplicar formato PDF estandar
3. Agregar portada y metadata
4. Generar tabla de contenidos
5. Exportar a PDF
6. Guardar en directorio correspondiente

## Comandos de Ejemplo

```
"Exporta el PRD a PDF"
"Crea un reporte ejecutivo en PDF"
"Combina estos documentos en un solo PDF"
"Agrega marca de agua DRAFT al documento"
"Genera PDF para impresion"
```

## Integracion Python

Para generar PDFs programaticamente:

```python
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm

def crear_pdf_nxt(titulo, contenido, output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2.5*cm,
        leftMargin=2.5*cm,
        topMargin=2.5*cm,
        bottomMargin=2.5*cm
    )

    styles = getSampleStyleSheet()
    story = []

    # Titulo
    titulo_style = ParagraphStyle(
        'TituloNXT',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30
    )
    story.append(Paragraph(titulo, titulo_style))
    story.append(Spacer(1, 12))

    # Contenido
    for parrafo in contenido:
        story.append(Paragraph(parrafo, styles['Normal']))
        story.append(Spacer(1, 12))

    doc.build(story)
```

### Conversion desde Markdown

```python
import markdown
from weasyprint import HTML

def markdown_to_pdf(md_path, pdf_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    html_content = markdown.markdown(md_content)

    html_template = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Calibri, sans-serif; font-size: 11pt; }}
            h1 {{ font-size: 24pt; color: #3B82F6; }}
            h2 {{ font-size: 18pt; color: #1F2937; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid #E5E7EB; padding: 8px; }}
            th {{ background-color: #3B82F6; color: white; }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    '''

    HTML(string=html_template).write_pdf(pdf_path)
```

## Herramientas Recomendadas

| Herramienta | Uso |
|-------------|-----|
| ReportLab | Generacion programatica |
| WeasyPrint | HTML/CSS a PDF |
| PyPDF2 | Manipulacion de PDFs |
| pdf2image | Convertir a imagenes |
| pdfrw | Combinar/dividir PDFs |
