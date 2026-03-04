# Skill Specification Reference

> **Tipo:** Reference
> **Versión:** 3.6.0

## Estructura de un Skill NXT

```markdown
# SKILL: [Nombre]

## Propósito
[Descripción de qué hace este skill]

## Cuándo se Activa
- [Trigger 1]
- [Trigger 2]

---

## 1. [Sección Principal]

### [Subsección]
[Contenido técnico]

---

## 2. [Otra Sección]

[Contenido]

---

## Relación con Otros Elementos

| Elemento | Relación |
|----------|----------|
| [Plugin] | [Descripción] |
| [Agente] | [Descripción] |

---

*SKILL [Nombre] - [Tagline]*
```

## Campos Requeridos

| Campo | Descripción |
|-------|-------------|
| Nombre | Identificador único (SKILL-xxx) |
| Propósito | Para qué sirve |
| Cuándo se Activa | Triggers de activación |
| Contenido Principal | El conocimiento técnico |

## Tipos de Skills

### Documentos
```
skills/documentos/
├── SKILL-docx.md     # Word
├── SKILL-pdf.md      # PDF
├── SKILL-pptx.md     # PowerPoint
└── SKILL-xlsx.md     # Excel
```

### Desarrollo
```
skills/desarrollo/
├── SKILL-testing.md
├── SKILL-code-review.md
├── SKILL-security.md
└── SKILL-diagrams.md
```

### Integraciones
```
skills/integraciones/
├── SKILL-gemini.md
├── SKILL-openai.md
└── SKILL-mcp.md
```

## Convenciones

- **Archivo:** `SKILL-[nombre].md` (MAYÚSCULAS + kebab-case)
- **Ubicación:** `skills/[categoría]/`
- **Separadores:** Usar `---` entre secciones

## Ejemplo: SKILL-security

```markdown
# SKILL: Security

## Propósito
Identificar y prevenir vulnerabilidades siguiendo OWASP.

## Cuándo se Activa
- Revisar código por vulnerabilidades
- Implementar autenticación
- Configurar APIs seguras

---

## 1. OWASP Top 10

| # | Vulnerabilidad |
|---|----------------|
| A01 | Broken Access Control |
| A02 | Cryptographic Failures |
...

---

## 2. Patrones Peligrosos

### SQL Injection
```javascript
// PELIGROSO
const query = `SELECT * FROM users WHERE id = ${userId}`;

// SEGURO
const query = 'SELECT * FROM users WHERE id = ?';
```

---

*SKILL Security - La seguridad es un proceso*
```

---

*Reference - Skill Specification v3.3.0*
