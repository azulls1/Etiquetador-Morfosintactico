# ============================================================================
# NXT AI Development Framework - Script de Instalación (PowerShell)
# ============================================================================

param(
    [switch]$SkipClone,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host @"

================================================================================
           NXT AI Development Framework - Instalación
================================================================================

"@ -ForegroundColor Cyan

# Función para imprimir con color
function Write-Status($message) {
    Write-Host "[NXT] $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "[✓] $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "[!] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[✗] $message" -ForegroundColor Red
}

# Verificar prerequisitos
Write-Status "Verificando prerequisitos..."

# Verificar Git
try {
    $gitVersion = git --version
    Write-Success "Git encontrado: $gitVersion"
} catch {
    Write-Error "Git no está instalado. Por favor instala git primero."
    exit 1
}

# Verificar Node.js (opcional)
try {
    $nodeVersion = node --version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Warning "Node.js versión $nodeVersion detectada. Se recomienda v18+."
    } else {
        Write-Success "Node.js $nodeVersion encontrado"
    }
} catch {
    Write-Warning "Node.js no encontrado. Algunas funciones pueden no estar disponibles."
}

# Verificar que estamos en el directorio correcto
$currentDir = Get-Location
Write-Status "Directorio actual: $currentDir"

# Verificar estructura NXT
if (Test-Path "nxt") {
    Write-Success "Estructura NXT encontrada"
} else {
    Write-Error "No se encontró la carpeta 'nxt'. Asegúrate de estar en el directorio del framework."
    exit 1
}

# Clonar repositorios de referencia (si no se omite)
if (-not $SkipClone) {
    Write-Status "Clonando repositorios de referencia..."

    # Crear directorio _reference si no existe
    if (-not (Test-Path "_reference")) {
        New-Item -ItemType Directory -Path "_reference" | Out-Null
    }

    # Clonar BMAD-METHOD
    if (-not (Test-Path "_reference\bmad")) {
        Write-Status "Clonando BMAD-METHOD v6..."
        try {
            git clone --branch v6-alpha --single-branch --depth 1 `
                https://github.com/bmad-code-org/BMAD-METHOD.git _reference/bmad 2>&1 | Out-Null
            Write-Success "BMAD-METHOD clonado"
        } catch {
            Write-Warning "No se pudo clonar BMAD-METHOD. Puedes hacerlo manualmente después."
        }
    } else {
        Write-Warning "BMAD-METHOD ya existe, omitiendo..."
    }

    # Clonar Anthropic Skills
    if (-not (Test-Path "_reference\skills")) {
        Write-Status "Clonando Anthropic Skills..."
        try {
            git clone --depth 1 `
                https://github.com/anthropics/skills.git _reference/skills 2>&1 | Out-Null
            Write-Success "Anthropic Skills clonado"
        } catch {
            Write-Warning "No se pudo clonar Anthropic Skills. Puedes hacerlo manualmente después."
        }
    } else {
        Write-Warning "Anthropic Skills ya existe, omitiendo..."
    }

    # Clonar Awesome Claude Skills (recursos de comunidad)
    if (-not (Test-Path "_reference\awesome-skills")) {
        Write-Status "Clonando Awesome Claude Skills..."
        try {
            git clone --depth 1 `
                https://github.com/travisvn/awesome-claude-skills.git _reference/awesome-skills 2>&1 | Out-Null
            Write-Success "Awesome Claude Skills clonado"
        } catch {
            Write-Warning "No se pudo clonar Awesome Claude Skills. Puedes hacerlo manualmente después."
        }
    } else {
        Write-Warning "Awesome Claude Skills ya existe, omitiendo..."
    }
} else {
    Write-Warning "Clonación de repositorios omitida (flag -SkipClone)"
}

# Verificar archivos críticos
Write-Status "Verificando archivos críticos..."

$criticalFiles = @(
    "nxt\_cfg\nxt.config.yaml",
    "nxt\core\orchestrator.md",
    "nxt\method\agents\analysis\analyst.agent.md",
    "nxt\method\agents\planning\pm.agent.md",
    "nxt\method\agents\solutioning\architect.agent.md",
    "nxt\method\agents\implementation\sm.agent.md",
    "nxt\method\agents\implementation\dev.agent.md"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        if ($Verbose) {
            Write-Success "  $file"
        }
    } else {
        Write-Error "  Falta: $file"
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Success "Todos los archivos críticos presentes"
} else {
    Write-Warning "Algunos archivos faltan. El framework puede no funcionar correctamente."
}

# Contar archivos creados
$agentCount = (Get-ChildItem -Path "nxt\method\agents" -Filter "*.agent.md" -Recurse).Count
$workflowCount = (Get-ChildItem -Path "nxt\method\workflows" -Filter "*.yaml" -Recurse).Count
$skillCount = (Get-ChildItem -Path "nxt\skills" -Filter "SKILL.md" -Recurse).Count
$checklistCount = (Get-ChildItem -Path "nxt\method\checklists" -Filter "*.md" -Recurse).Count

Write-Host ""
Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Success "NXT AI Development Framework instalado correctamente"
Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Estadísticas:" -ForegroundColor Yellow
Write-Host "  - Agentes:    $agentCount"
Write-Host "  - Workflows:  $workflowCount"
Write-Host "  - Skills:     $skillCount"
Write-Host "  - Checklists: $checklistCount"
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "  Abre tu IDE con AI (Claude Code, Cursor, etc.) y escribe:" -ForegroundColor White
Write-Host ""
Write-Host "    /nxt/init" -ForegroundColor Green
Write-Host ""
Write-Host "Estructura creada:" -ForegroundColor Yellow
Write-Host "  nxt/"
Write-Host "  ├── core/           # Motor del framework"
Write-Host "  ├── method/         # Agentes y workflows"
Write-Host "  ├── skills/         # Skills de Claude"
Write-Host "  ├── builder/        # Crear custom agents"
Write-Host "  └── _cfg/           # Configuración"
Write-Host ""
Write-Host "Recursos de referencia:" -ForegroundColor Yellow
Write-Host "  _reference/bmad/           # BMAD-METHOD v6"
Write-Host "  _reference/skills/         # Anthropic Skills"
Write-Host "  _reference/awesome-skills/ # Awesome Claude Skills (comunidad)"
Write-Host ""
Write-Host "=================================================================================" -ForegroundColor Cyan
