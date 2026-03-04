#!/bin/bash

# ============================================================================
# NXT AI Development Framework - Script de Instalación (Bash)
# ============================================================================

set -e

echo "
================================================================================
           NXT AI Development Framework - Instalación
================================================================================
"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[NXT]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Parse arguments
SKIP_CLONE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-clone)
            SKIP_CLONE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Verificar prerequisitos
print_status "Verificando prerequisitos..."

if ! command -v git &> /dev/null; then
    print_error "Git no está instalado. Por favor instala git primero."
    exit 1
fi
print_success "Git encontrado"

if ! command -v node &> /dev/null; then
    print_warning "Node.js no encontrado. Algunas funciones pueden no estar disponibles."
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js versión $NODE_VERSION detectada. Se recomienda v18+."
    else
        print_success "Node.js v$NODE_VERSION encontrado"
    fi
fi

# Verificar directorio actual
print_status "Directorio actual: $(pwd)"

# Verificar estructura NXT
if [ -d "nxt" ]; then
    print_success "Estructura NXT encontrada"
else
    print_error "No se encontró la carpeta 'nxt'. Asegúrate de estar en el directorio del framework."
    exit 1
fi

# Clonar repositorios de referencia (si no se omite)
if [ "$SKIP_CLONE" = false ]; then
    print_status "Clonando repositorios de referencia..."

    # Crear directorio _reference si no existe
    mkdir -p _reference

    # Clonar BMAD-METHOD
    if [ ! -d "_reference/bmad" ]; then
        print_status "Clonando BMAD-METHOD v6..."
        if git clone --branch v6-alpha --single-branch --depth 1 \
            https://github.com/bmad-code-org/BMAD-METHOD.git _reference/bmad 2>/dev/null; then
            print_success "BMAD-METHOD clonado"
        else
            print_warning "No se pudo clonar BMAD-METHOD. Puedes hacerlo manualmente después."
        fi
    else
        print_warning "BMAD-METHOD ya existe, omitiendo..."
    fi

    # Clonar Anthropic Skills
    if [ ! -d "_reference/skills" ]; then
        print_status "Clonando Anthropic Skills..."
        if git clone --depth 1 \
            https://github.com/anthropics/skills.git _reference/skills 2>/dev/null; then
            print_success "Anthropic Skills clonado"
        else
            print_warning "No se pudo clonar Anthropic Skills. Puedes hacerlo manualmente después."
        fi
    else
        print_warning "Anthropic Skills ya existe, omitiendo..."
    fi

    # Clonar Awesome Claude Skills (recursos de comunidad)
    if [ ! -d "_reference/awesome-skills" ]; then
        print_status "Clonando Awesome Claude Skills..."
        if git clone --depth 1 \
            https://github.com/travisvn/awesome-claude-skills.git _reference/awesome-skills 2>/dev/null; then
            print_success "Awesome Claude Skills clonado"
        else
            print_warning "No se pudo clonar Awesome Claude Skills. Puedes hacerlo manualmente después."
        fi
    else
        print_warning "Awesome Claude Skills ya existe, omitiendo..."
    fi
else
    print_warning "Clonación de repositorios omitida (flag --skip-clone)"
fi

# Verificar archivos críticos
print_status "Verificando archivos críticos..."

CRITICAL_FILES=(
    "nxt/_cfg/nxt.config.yaml"
    "nxt/core/orchestrator.md"
    "nxt/method/agents/analysis/analyst.agent.md"
    "nxt/method/agents/planning/pm.agent.md"
    "nxt/method/agents/solutioning/architect.agent.md"
    "nxt/method/agents/implementation/sm.agent.md"
    "nxt/method/agents/implementation/dev.agent.md"
)

ALL_FILES_EXIST=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        if [ "$VERBOSE" = true ]; then
            print_success "  $file"
        fi
    else
        print_error "  Falta: $file"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
    print_success "Todos los archivos críticos presentes"
else
    print_warning "Algunos archivos faltan. El framework puede no funcionar correctamente."
fi

# Contar archivos creados
AGENT_COUNT=$(find nxt/method/agents -name "*.agent.md" 2>/dev/null | wc -l)
WORKFLOW_COUNT=$(find nxt/method/workflows -name "*.yaml" 2>/dev/null | wc -l)
SKILL_COUNT=$(find nxt/skills -name "SKILL.md" 2>/dev/null | wc -l)
CHECKLIST_COUNT=$(find nxt/method/checklists -name "*.md" 2>/dev/null | wc -l)

# Mensaje final
echo ""
echo -e "${CYAN}=================================================================================${NC}"
print_success "NXT AI Development Framework instalado correctamente"
echo -e "${CYAN}=================================================================================${NC}"
echo ""
echo -e "${YELLOW}Estadísticas:${NC}"
echo "  - Agentes:    $AGENT_COUNT"
echo "  - Workflows:  $WORKFLOW_COUNT"
echo "  - Skills:     $SKILL_COUNT"
echo "  - Checklists: $CHECKLIST_COUNT"
echo ""
echo -e "${YELLOW}Siguiente paso:${NC}"
echo "  Abre tu IDE con AI (Claude Code, Cursor, etc.) y escribe:"
echo ""
echo -e "    ${GREEN}/nxt/init${NC}"
echo ""
echo -e "${YELLOW}Estructura creada:${NC}"
echo "  nxt/"
echo "  ├── core/           # Motor del framework"
echo "  ├── method/         # Agentes y workflows"
echo "  ├── skills/         # Skills de Claude"
echo "  ├── builder/        # Crear custom agents"
echo "  └── _cfg/           # Configuración"
echo ""
echo -e "${YELLOW}Recursos de referencia:${NC}"
echo "  _reference/bmad/           # BMAD-METHOD v6"
echo "  _reference/skills/         # Anthropic Skills"
echo "  _reference/awesome-skills/ # Awesome Claude Skills (comunidad)"
echo ""
echo -e "${CYAN}=================================================================================${NC}"
