# How To: Document Sharding

> **Tipo:** How-To Guide
> **Tiempo:** 8 minutos

## Problema

Tienes un documento muy grande (500+ líneas) que es difícil de manejar.

## Solución

Usar el workflow Shard-Doc para dividirlo en secciones.

## Pasos

### 1. Identificar el Documento

```bash
# Ver tamaño
wc -l docs/mi-prd-grande.md
# Output: 850 líneas
```

### 2. Ejecutar Shard-Doc

```
*shard-doc docs/mi-prd-grande.md
```

### 3. Elegir Estrategia

| Estrategia | Cuándo Usar |
|------------|-------------|
| `by_heading` | Documento con H2 claros |
| `by_size` | Secciones irregulares |
| `by_component` | PRD técnico |
| `by_phase` | Documento de proyecto |

```
*shard-doc docs/mi-prd-grande.md --strategy by_heading
```

### 4. Resultado

```
docs/mi-prd-grande/
├── README.md              # Índice
├── 01-introduction.md     # 50 líneas
├── 02-requirements.md     # 150 líneas
├── 03-architecture.md     # 200 líneas
├── 04-api-spec.md         # 250 líneas
└── 05-testing.md          # 100 líneas
```

### 5. Navegación

Cada archivo incluye:
```markdown
> **Parte de:** [PRD Original](./README.md)
> **Sección:** 2 de 5

---
[Contenido]
---

**Anterior:** [Introduction](./01-introduction.md)
**Siguiente:** [Architecture](./03-architecture.md)
```

## Reconstruir

Para volver a unir:
```
*unshard-doc docs/mi-prd-grande/
```

## Tips

- Mínimo 20 líneas por shard
- Máximo 200 líneas por shard
- Mantener referencias cruzadas actualizadas

---

*How-To Guide 10 - Document Sharding*
