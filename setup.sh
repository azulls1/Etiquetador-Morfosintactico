#!/bin/bash
# ============================================================================
# NXT AI Dev - Script de Instalacion (Linux/Mac)
# ============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                        NXT AI Dev - INSTALACION                            ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# ============================================================================
# CONFIGURACION DEL DESARROLLADOR
# ============================================================================
echo -e "${YELLOW}Configurando desarrollador...${NC}"

# Intentar obtener nombre de git config
GIT_NAME=$(git config user.name 2>/dev/null || echo "")

# Si no hay git name, usar nombre de usuario del sistema
if [ -z "$GIT_NAME" ]; then
    GIT_NAME="$USER"
fi

# Preguntar confirmacion
echo ""
echo -e "  ${WHITE}Nombre detectado: ${CYAN}$GIT_NAME${NC}"
read -p "  ¿Es correcto? (S/n): " CONFIRM

if [ "$CONFIRM" = "n" ] || [ "$CONFIRM" = "N" ]; then
    read -p "  Ingresa tu nombre: " DEV_NAME
else
    DEV_NAME="$GIT_NAME"
fi

# Actualizar nxt.config.yaml con el nombre
CONFIG_PATH=".nxt/nxt.config.yaml"
if [ -f "$CONFIG_PATH" ]; then
    sed -i.bak "s/\[TU_NOMBRE\]/$DEV_NAME/g" "$CONFIG_PATH"
    rm -f "${CONFIG_PATH}.bak"
    echo -e "${GREEN}OK${NC} - Configuracion actualizada con: $DEV_NAME"
fi

echo ""

# ============================================================================
# VERIFICAR PYTHON
# ============================================================================
echo -e "${YELLOW}Verificando Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}OK${NC} - $PYTHON_VERSION"
else
    echo -e "${RED}ERROR${NC} - Python 3 no encontrado"
    echo "Por favor instala Python 3.10 o superior"
    exit 1
fi

# Verificar pip
echo -e "${YELLOW}Verificando pip...${NC}"
if command -v pip3 &> /dev/null; then
    echo -e "${GREEN}OK${NC} - pip disponible"
else
    echo -e "${RED}ERROR${NC} - pip no encontrado"
    exit 1
fi

# Instalar dependencias Python
echo ""
echo -e "${YELLOW}Instalando dependencias Python...${NC}"
pip3 install --upgrade openai google-genai pyyaml requests aiohttp

# Crear .env si no existe
echo ""
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creando archivo .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}OK${NC} - .env creado"
    echo -e "${YELLOW}IMPORTANTE:${NC} Edita .env con tus API keys"
else
    echo -e "${GREEN}OK${NC} - .env ya existe"
fi

# Crear directorios necesarios
echo ""
echo -e "${YELLOW}Creando directorios...${NC}"
mkdir -p docs/1-analysis docs/2-planning docs/3-solutioning docs/4-implementation docs/diagrams
echo -e "${GREEN}OK${NC} - Directorios creados"

# Hacer ejecutables los scripts Python
echo ""
echo -e "${YELLOW}Configurando permisos...${NC}"
chmod +x herramientas/*.py 2>/dev/null || true
echo -e "${GREEN}OK${NC} - Permisos configurados"

# Verificar instalacion
echo ""
echo -e "${YELLOW}Verificando instalacion...${NC}"
python3 -c "import yaml; print('  - pyyaml: OK')"
python3 -c "
try:
    from openai import OpenAI
    print('  - openai: OK')
except ImportError:
    print('  - openai: ADVERTENCIA - no instalado')
"
python3 -c "
try:
    from google import genai
    print('  - google-genai: OK')
except ImportError:
    print('  - google-genai: ADVERTENCIA - no instalado')
"

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                      INSTALACION COMPLETADA                               ║"
echo "╠═══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                           ║"
echo "║  Bienvenido $DEV_NAME"
echo "║                                                                           ║"
echo "║  Siguientes pasos:                                                        ║"
echo "║                                                                           ║"
echo "║  1. Edita .env con tus API keys:                                          ║"
echo "║     - ANTHROPIC_API_KEY                                                   ║"
echo "║     - GEMINI_API_KEY                                                      ║"
echo "║     - OPENAI_API_KEY                                                      ║"
echo "║                                                                           ║"
echo "║  2. Abre el proyecto en Claude Code o Cursor                              ║"
echo "║                                                                           ║"
echo "║  3. Escribe: /nxt/init  o  /nxt/orchestrator                              ║"
echo "║                                                                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
