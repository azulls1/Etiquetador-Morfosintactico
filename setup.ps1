# ============================================================================
# NXT AI Dev - Script de Instalacion (Windows PowerShell)
# ============================================================================

Write-Host "╔═══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                        NXT AI Dev - INSTALACION                            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# CONFIGURACION DEL DESARROLLADOR
# ============================================================================
Write-Host "Configurando desarrollador..." -ForegroundColor Yellow

# Intentar obtener nombre de git config
$gitName = $null
try {
    $gitName = git config user.name 2>$null
} catch {
    $gitName = $null
}

# Si no hay git name, usar nombre de usuario del sistema
if ([string]::IsNullOrWhiteSpace($gitName)) {
    $gitName = $env:USERNAME
}

# Preguntar confirmacion
Write-Host ""
Write-Host "  Nombre detectado: " -NoNewline -ForegroundColor White
Write-Host "$gitName" -ForegroundColor Cyan
$confirm = Read-Host "  ¿Es correcto? (S/n)"

if ($confirm -eq 'n' -or $confirm -eq 'N') {
    $devName = Read-Host "  Ingresa tu nombre"
} else {
    $devName = $gitName
}

# Actualizar nxt.config.yaml con el nombre
$configPath = ".nxt/nxt.config.yaml"
if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw
    $content = $content -replace '\[TU_NOMBRE\]', $devName
    Set-Content $configPath $content -NoNewline
    Write-Host "OK - Configuracion actualizada con: $devName" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# VERIFICAR PYTHON
# ============================================================================
Write-Host "Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "OK - $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR - Python no encontrado" -ForegroundColor Red
    Write-Host "Por favor instala Python 3.10 o superior desde https://www.python.org/"
    exit 1
}

# Verificar pip
Write-Host "Verificando pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "OK - pip disponible" -ForegroundColor Green
} catch {
    Write-Host "ERROR - pip no encontrado" -ForegroundColor Red
    exit 1
}

# Instalar dependencias Python
Write-Host ""
Write-Host "Instalando dependencias Python..." -ForegroundColor Yellow
pip install --upgrade openai google-genai pyyaml requests aiohttp

# Crear .env si no existe
Write-Host ""
if (-not (Test-Path ".env")) {
    Write-Host "Creando archivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "OK - .env creado" -ForegroundColor Green
    Write-Host "IMPORTANTE: Edita .env con tus API keys" -ForegroundColor Yellow
} else {
    Write-Host "OK - .env ya existe" -ForegroundColor Green
}

# Crear directorios necesarios
Write-Host ""
Write-Host "Creando directorios..." -ForegroundColor Yellow
$directories = @(
    "docs/1-analysis",
    "docs/2-planning",
    "docs/3-solutioning",
    "docs/4-implementation",
    "docs/diagrams"
)
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "OK - Directorios creados" -ForegroundColor Green

# Verificar instalacion
Write-Host ""
Write-Host "Verificando instalacion..." -ForegroundColor Yellow
python -c "import yaml; print('  - pyyaml: OK')"
python -c @"
try:
    from openai import OpenAI
    print('  - openai: OK')
except ImportError:
    print('  - openai: ADVERTENCIA - no instalado')
"@
python -c @"
try:
    from google import genai
    print('  - google-genai: OK')
except ImportError:
    print('  - google-genai: ADVERTENCIA - no instalado')
"@

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                      INSTALACION COMPLETADA                               ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                                           ║" -ForegroundColor Green
Write-Host "║  Bienvenido $($devName.PadRight(50))      ║" -ForegroundColor Green
Write-Host "║                                                                           ║" -ForegroundColor Green
Write-Host "║  Siguientes pasos:                                                        ║" -ForegroundColor Green
Write-Host "║                                                                           ║" -ForegroundColor Green
Write-Host "║  1. Edita .env con tus API keys:                                          ║" -ForegroundColor Green
Write-Host "║     - ANTHROPIC_API_KEY                                                   ║" -ForegroundColor Green
Write-Host "║     - GEMINI_API_KEY                                                      ║" -ForegroundColor Green
Write-Host "║     - OPENAI_API_KEY                                                      ║" -ForegroundColor Green
Write-Host "║                                                                           ║" -ForegroundColor Green
Write-Host "║  2. Abre el proyecto en Claude Code o Cursor                              ║" -ForegroundColor Green
Write-Host "║                                                                           ║" -ForegroundColor Green
Write-Host "║  3. Escribe: /nxt/init  o  /nxt/orchestrator                              ║" -ForegroundColor Green
Write-Host "║                                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
