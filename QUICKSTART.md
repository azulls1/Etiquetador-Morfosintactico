# Quick Start - NXT AI Development

> **De cero a productivo en 5 minutos**

---

## Paso 1: Clonar el Repositorio (30 seg)

```bash
# Opcion A: Desde GitLab NXT
git clone ssh://git@gitlab.nxtview.com:10242/infraestructura/ai-automations/nxt-ai-development.git
cd nxt-ai-development

# Opcion B: Copiar a proyecto existente
cp -r nxt-ai-development/{.nxt,.claude,agentes,skills,herramientas,workflows,plantillas} ./mi-proyecto/
```

## Paso 2: Configurar API Keys (1 min)

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus API keys
```

**Edita `.env` con:**
```env
# OBLIGATORIA - Para busquedas web
GEMINI_API_KEY=tu_api_key_de_google_ai_studio

# OPCIONAL - Para imagenes/audio
OPENAI_API_KEY=tu_api_key_de_openai

# OPCIONAL - Para GitHub MCP
GITHUB_TOKEN=tu_token_de_github
```

**Obtener API Keys:**
- Gemini: https://aistudio.google.com/apikey
- OpenAI: https://platform.openai.com/api-keys
- GitHub: https://github.com/settings/tokens

## Paso 3: Verificar Instalacion (30 seg)

```bash
python herramientas/validate_setup.py
```

**Resultado esperado:**
```
╔══════════════════════════════════════════════════════════════╗
║           NXT AI Development - Validacion de Setup           ║
╚══════════════════════════════════════════════════════════════╝

[ESTRUCTURA]
  ✅ .nxt/nxt.config.yaml
  ✅ .claude/commands/nxt/
  ✅ agentes/
  ✅ herramientas/

[API KEYS]
  ✅ GEMINI_API_KEY configurada
  ⚠️  OPENAI_API_KEY no configurada (multimedia no disponible)
  ⚠️  GITHUB_TOKEN no configurado (GitHub MCP no disponible)

[DEPENDENCIAS PYTHON]
  ✅ google-genai
  ⚠️  openai no instalado (pip install openai)

════════════════════════════════════════════════════════════════
RESULTADO: LISTO PARA USAR (con advertencias menores)
════════════════════════════════════════════════════════════════
```

## Paso 4: Iniciar Claude Code (1 min)

```bash
# En tu terminal, en la carpeta del proyecto
claude
```

## Paso 5: Tu Primer Comando (1 min)

En Claude Code, escribe:

```
/nxt/orchestrator
```

El orquestador te saludara y estara listo para coordinar tu equipo de agentes.

## Paso 6: Tu Primera Tarea (1 min)

Prueba con una tarea simple:

```
Quiero agregar un boton de logout a mi aplicacion
```

El orquestador:
1. Clasificara la tarea (feature)
2. Activara los agentes necesarios
3. Te guiara paso a paso

---

## Comandos Esenciales

| Comando | Que hace |
|---------|----------|
| `/nxt/orchestrator` | Activa el director del equipo |
| `/nxt/help` | Ver todos los comandos |
| `/nxt/status` | Ver estado del proyecto |

## Comandos por Agente

| Necesitas... | Usa |
|--------------|-----|
| Investigar/analizar | `/nxt/analyst` |
| Crear PRD/stories | `/nxt/pm` |
| Disenar arquitectura | `/nxt/architect` |
| Disenar UX | `/nxt/ux` |
| Escribir codigo | `/nxt/dev` |
| Hacer testing | `/nxt/qa` |
| Buscar en web | `/nxt/search` |
| Crear imagenes | `/nxt/media` |

## Herramientas CLI

```bash
# Busquedas web con Gemini
python herramientas/gemini_tools.py search "tendencias react 2025"

# Generar imagen con Gemini (Nano Banana Pro)
python herramientas/gemini_tools.py image "logo minimalista" logo.png

# Router inteligente
python herramientas/llm_router.py route "buscar info de mercado"

# Orquestador CLI
python herramientas/orchestrator.py classify "fix bug en login"
```

---

## Troubleshooting

### "GEMINI_API_KEY not found"
```bash
# Verificar que .env existe y tiene la key
cat .env | grep GEMINI

# En Windows
type .env | findstr GEMINI
```

### "Module not found: google.genai"
```bash
pip install google-genai
```

### "Los comandos /nxt/* no funcionan"
Verifica que estas en la carpeta correcta del proyecto:
```bash
ls .claude/commands/nxt/
# Deberia mostrar: init.md, orchestrator.md, help.md, etc.
```

### "Claude Code no reconoce el proyecto"
Verifica que existe `CLAUDE.md` en la raiz:
```bash
ls CLAUDE.md
```

---

## Siguiente Paso

Una vez configurado, te recomendamos:

1. **Leer `CLAUDE.md`** - Resumen del framework
2. **Explorar `/nxt/help`** - Ver todos los comandos
3. **Probar un ejemplo** - Ver carpeta `ejemplos/`

---

## Recursos

| Recurso | Ubicacion |
|---------|-----------|
| Documentacion completa | `README.md` |
| Configuracion | `.nxt/nxt.config.yaml` |
| Plantillas | `plantillas/` |
| Ejemplos | `ejemplos/` |

---

**Tiempo total: ~5 minutos**

*NXT AI Development v3.6.0 - "Construyendo el futuro, un sprint a la vez"*
