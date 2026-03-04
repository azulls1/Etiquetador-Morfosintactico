# Getting Started with NXT

> **Tipo:** Tutorial
> **Nivel:** Principiante
> **Tiempo:** 10 minutos

## Objetivos

Al completar este tutorial podrás:
- Entender qué es NXT y para qué sirve
- Inicializar un proyecto NXT
- Activar tu primer agente
- Completar una tarea simple

## Prerrequisitos

- Claude Code instalado
- Terminal o línea de comandos
- 10 minutos de tiempo

## ¿Qué es NXT?

NXT (Next-generation eXtended Team) es un framework que te permite trabajar
con un **equipo completo de desarrollo AI** desde tu terminal.

```
┌─────────────────────────────────────────────────────────────┐
│                      TÚ (Desarrollador)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    NXT ORCHESTRATOR                          │
│              (Coordina todo el equipo)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
     [ANALYST]       [DEVELOPER]      [QA]
     [PM]            [API]            [DOCS]
     [ARCHITECT]     [UIDEV]          [...]
```

## Paso 1: Inicializar NXT

Abre tu terminal en el directorio de tu proyecto y ejecuta:

```
/nxt/init
```

Verás algo como:

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🚀 NXT AI DEVELOPMENT FRAMEWORK v3.3.0                        ║
║                                                                  ║
║   Proyecto inicializado correctamente                           ║
║                                                                  ║
║   Próximos pasos:                                               ║
║   1. /nxt/orchestrator - Activar el orquestador                 ║
║   2. Describe tu tarea                                          ║
║   3. Deja que NXT coordine el equipo                            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Paso 2: Activar el Orquestador

El orquestador es el "director" del equipo. Actívalo con:

```
/nxt/orchestrator
```

El orquestador:
1. Analiza tu solicitud
2. Clasifica la complejidad (Nivel 0-4)
3. Asigna los agentes apropiados
4. Coordina la ejecución

## Paso 3: Tu Primera Tarea

Ahora describe lo que quieres hacer. Por ejemplo:

```
Quiero crear una función que valide emails en JavaScript
```

El orquestador:

1. **Clasifica:** Nivel 1 (Simple) - Solo necesita Dev
2. **Activa:** Agent Developer (`/nxt/dev`)
3. **Ejecuta:** Crea la función con tests
4. **Entrega:** Código listo para usar

## Paso 4: Explorar Agentes

Puedes activar agentes directamente:

| Comando | Agente | Para qué |
|---------|--------|----------|
| `/nxt/dev` | Developer | Escribir código |
| `/nxt/qa` | QA Engineer | Crear tests |
| `/nxt/docs` | Tech Writer | Documentar |
| `/nxt/paige` | Paige | Ayuda y onboarding |

## Ejemplo Completo

```
Usuario: /nxt/orchestrator

Orquestador: ¡Hola! Soy el NXT Orchestrator.
             ¿Qué te gustaría construir hoy?

Usuario: Necesito una API REST para gestionar usuarios

Orquestador: Analizando solicitud...

             📊 Clasificación:
             - Nivel: 2 (Estándar)
             - Tiempo estimado: 2-4 horas
             - Agentes: Architect, API, Database, QA

             ¿Procedemos con el diseño de arquitectura?

Usuario: Sí

Orquestador: Activando NXT Architect...
             [El arquitecto diseña la estructura]

             Pasando a implementación...
             Activando NXT API Developer...
             [El desarrollador crea los endpoints]
```

## Próximos Pasos

1. **[Your First Project](./02-first-project.md)** - Crea un proyecto completo
2. **[Working with Agents](./03-working-with-agents.md)** - Domina los agentes
3. **[/nxt/paige](../../agentes/nxt-paige.md)** - Obtén ayuda cuando la necesites

## Resumen

| Concepto | Descripción |
|----------|-------------|
| NXT | Framework de equipo AI |
| Orquestador | Director que coordina agentes |
| Agentes | Especialistas en diferentes áreas |
| Niveles 0-4 | Sistema de clasificación de complejidad |

---

**¿Necesitas ayuda?** Ejecuta `/nxt/paige` para obtener asistencia.

---

*Tutorial 1 de 4 - Getting Started*
