# How To: Debug Agent Issues

> **Tipo:** How-To Guide
> **Tiempo:** 10 minutos

## Problema

Un agente no está funcionando como esperas o produce errores.

## Diagnóstico

### 1. Verificar Estado del Sistema

```
/nxt/status
```

Busca:
- ✅ Agentes activos
- ✅ MCP servers conectados
- ✅ Config cargada correctamente

### 2. Problemas Comunes

| Síntoma | Causa Probable | Solución |
|---------|---------------|----------|
| Agente no responde | Archivo .md corrupto | Verificar sintaxis |
| Respuesta genérica | Falta contexto | Agregar más detalles |
| Error de delegación | Orchestrator mal configurado | Revisar config |
| Loop infinito | Dependencia circular | Revisar workflow |

### 3. Verificar Archivo del Agente

```bash
# Ver si el agente existe
ls agentes/nxt-[nombre].md

# Verificar contenido
head -50 agentes/nxt-[nombre].md
```

### 4. Revisar Logs

El orchestrator mantiene un log de decisiones:
- Qué clasificación asignó
- Qué agentes activó
- Qué handoffs realizó

### 5. Reset de Contexto

Si hay estado corrupto:
```
# Reiniciar el orchestrator
/nxt/init

# Activar de nuevo
/nxt/orchestrator
```

## Soluciones Específicas

### Agente no existe
```bash
# Crear el command si falta
touch .claude/commands/nxt/[nombre].md
```

### Agente no sigue instrucciones
1. Verificar que el prompt tiene contexto
2. Agregar ejemplos específicos
3. Usar el formato correcto del agente

### Conflicto entre agentes
1. Activar orchestrator primero
2. Dejar que coordine la delegación
3. No activar agentes manualmente en paralelo

---

*How-To Guide 8 - Debug Agents*
