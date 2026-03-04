# SKILL: Code Review (DEPRECATED)

> **DEPRECATED:** Este skill ha sido unificado.
> **Usar:** `skills/desarrollo/SKILL-code-quality.md` - Skill unificado Code Review + Refactoring

---

## Proposito (Legacy)
Realizar revisiones de codigo exhaustivas para garantizar calidad,
seguridad y mantenibilidad del codigo.

## Cuando se Activa
- Revisar Pull Request
- Analizar codigo existente
- Buscar vulnerabilidades
- Verificar estandares de codigo
- Sugerir mejoras

## Instrucciones

### 1. Checklist de Code Review

#### Funcionalidad
- [ ] El codigo hace lo que se supone que debe hacer
- [ ] Los edge cases estan manejados
- [ ] Los errores se manejan apropiadamente
- [ ] La logica es correcta

#### Legibilidad
- [ ] Nombres de variables/funciones descriptivos
- [ ] Funciones pequenas y enfocadas
- [ ] Comentarios donde son necesarios
- [ ] Codigo autoexplicativo

#### Seguridad
- [ ] No hay credenciales hardcodeadas
- [ ] Input validation presente
- [ ] Sin vulnerabilidades OWASP Top 10
- [ ] Datos sensibles protegidos

#### Performance
- [ ] Sin queries N+1
- [ ] Algoritmos eficientes
- [ ] Memoria bien gestionada
- [ ] Sin loops innecesarios

#### Testing
- [ ] Tests unitarios presentes
- [ ] Cobertura adecuada
- [ ] Tests son legibles
- [ ] Edge cases testeados

#### Mantenibilidad
- [ ] Principios SOLID seguidos
- [ ] DRY (no repeticion)
- [ ] Acoplamiento bajo
- [ ] Codigo modular

### 2. Formato de Review

```markdown
## Code Review: PR #XXX

### Resumen
[Descripcion breve de los cambios]

### Veredicto
**APROBADO** / **CAMBIOS REQUERIDOS** / **BLOQUEADO**

### Hallazgos

#### Criticos (deben arreglarse)
1. **[Archivo:Linea]** - [Descripcion]
   ```[codigo problemático]```
   **Sugerencia:** [Como arreglarlo]

#### Importantes (deberian arreglarse)
1. **[Archivo:Linea]** - [Descripcion]

#### Menores (nice to have)
1. **[Archivo:Linea]** - [Descripcion]

#### Positivos
- [Que se hizo bien]

### Checklist
- [x] Funcionalidad correcta
- [x] Tests incluidos
- [ ] Documentacion actualizada
- [x] Sin vulnerabilidades de seguridad

### Notas Adicionales
[Comentarios generales, sugerencias de mejora]
```

### 3. Categorias de Hallazgos

| Categoria | Icono | Accion |
|-----------|-------|--------|
| **Critico** | BLOCKER | Bloquea merge |
| **Importante** | WARNING | Debe arreglarse |
| **Menor** | INFO | Sugerencia |
| **Positivo** | GOOD | Reconocimiento |
| **Pregunta** | QUESTION | Clarificacion |

### 4. Patrones a Buscar

#### Seguridad
```javascript
// MAL: SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// BIEN: Parametrizado
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

```javascript
// MAL: XSS
element.innerHTML = userInput;

// BIEN: Escapado
element.textContent = userInput;
```

#### Performance
```javascript
// MAL: N+1 query
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = ?', [user.id]);
}

// BIEN: Single query con JOIN
const usersWithPosts = await db.query(`
  SELECT u.*, p.* FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
`);
```

#### Legibilidad
```javascript
// MAL: Nombre críptico
const d = new Date();
const x = d.getTime() - 86400000;

// BIEN: Nombre descriptivo
const now = new Date();
const oneDayInMs = 24 * 60 * 60 * 1000;
const yesterdayTimestamp = now.getTime() - oneDayInMs;
```

#### Mantenibilidad
```javascript
// MAL: Magic numbers
if (status === 1) { ... }
if (status === 2) { ... }

// BIEN: Constantes con nombre
const STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3
};
if (status === STATUS.PENDING) { ... }
```

### 5. Preguntas de Review

Al revisar, preguntate:

1. **Podria yo mantener este codigo en 6 meses?**
2. **Que pasa si esta funcion recibe null/undefined?**
3. **Hay algun caso donde esto podria fallar?**
4. **Esto escala si tenemos 10x mas usuarios?**
5. **Un atacante podria explotar esto?**

### 6. Comandos de Review

```
"Revisa este PR/codigo"
"Busca vulnerabilidades de seguridad"
"Analiza performance del codigo"
"Verifica estandares de codigo"
"Sugiere mejoras de arquitectura"
```

### 7. Herramientas Automaticas

Complementar review manual con:

| Herramienta | Proposito |
|-------------|-----------|
| ESLint/Prettier | Estilo y formato |
| SonarQube | Calidad de codigo |
| Snyk | Vulnerabilidades |
| CodeClimate | Mantenibilidad |
| Codecov | Cobertura de tests |

### 8. Feedback Constructivo

#### Como DAR feedback
- Se especifico, no vago
- Explica el "por que"
- Ofrece alternativas
- Reconoce lo bueno
- Usa tono colaborativo

#### Ejemplos de buen feedback
```
// BIEN
"Este loop podria ser un .map() para mayor claridad.
Ademas, si la lista es grande, considera usar .filter()
primero para reducir iteraciones."

// MAL
"Este codigo es ineficiente."
```

## Proceso de Code Review

1. Entender el contexto (story, PR description)
2. Ejecutar el codigo localmente si es posible
3. Revisar diff linea por linea
4. Anotar hallazgos por categoria
5. Revisar tests incluidos
6. Verificar documentacion
7. Escribir resumen y veredicto
8. Discutir hallazgos si es necesario
