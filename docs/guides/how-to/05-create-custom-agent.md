# How To: Create a Custom Agent

> **Tipo:** How-To Guide
> **Tiempo:** 15 minutos

## Problema

Necesitas un agente especializado que no existe en el framework NXT.

## Solución

Crear un agente personalizado usando el sistema de templates y sidecars.

## Pasos

### 1. Usar el Template Base

Copia el template de `nxt/builder/templates/agent-template.md`:

```markdown
# NXT [Nombre] - [Rol]

## Mensaje de Bienvenida
```
╔══════════════════════════════════════════════════════════════════╗
║   [EMOJI] NXT [NOMBRE] v1.0 - [Descripción corta]               ║
╚══════════════════════════════════════════════════════════════════╝
```

## Identidad
Soy **NXT [Nombre]**, [descripción del rol].

## Responsabilidades
1. **[Responsabilidad 1]**
   - Tarea
   - Tarea

## Comandos
| Código | Comando | Descripción |
|--------|---------|-------------|
| `xx` | `*comando` | Descripción |

## Activación
`/nxt/[nombre]`
```

### 2. Definir Identidad

```markdown
## Identidad
Soy **NXT GameDev**, especialista en desarrollo de videojuegos.
Mi enfoque es Unity y Unreal Engine con C# y C++.

## Personalidad
"Gamer" - Apasionado, creativo, orientado a la experiencia del jugador.
```

### 3. Crear el Slash Command

Archivo: `.claude/commands/nxt/gamedev.md`

```markdown
# NXT GameDev

Activando NXT GameDev...

## Instrucciones
Lee y sigue `agentes/nxt-gamedev.md`
```

### 4. (Opcional) Usar Sidecar

Si solo necesitas personalizar un agente existente:

```markdown
# Sidecar: NXT Dev - Game Focus

## Extensiones
- Unity patterns
- ECS architecture
- Game loop optimization

## Stack
- Unity 2023 LTS
- C# 11
- DOTs
```

## Verificación

```bash
# Verificar que el agente funciona
/nxt/gamedev

# Debería mostrar el banner de bienvenida
```

## Ejemplo Completo

Ver `agentes/nxt-paige.md` como referencia de un agente bien estructurado.

---

*How-To Guide 5 - Create Custom Agent*
