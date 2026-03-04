"""
NXT AI Development - Configuracion de Tests
Fixtures y configuracion compartida para pytest.
"""

import os
import sys
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Agregar herramientas al path
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR / "herramientas"))


@pytest.fixture
def project_root():
    """Retorna la raiz del proyecto."""
    return ROOT_DIR


@pytest.fixture
def mock_env_vars():
    """Mock de variables de entorno."""
    env_vars = {
        "GEMINI_API_KEY": "AIzaSyTestKeyNotReal12345678901234567",
        "OPENAI_API_KEY": "sk-test-key-not-real-12345678901234567890",
        "GITHUB_TOKEN": "ghp_testtoken1234567890",
    }
    with patch.dict(os.environ, env_vars):
        yield env_vars


@pytest.fixture
def mock_gemini_response():
    """Mock de respuesta de Gemini API."""
    mock_response = MagicMock()
    mock_response.text = "Esta es una respuesta de prueba de Gemini."
    mock_response.candidates = [
        MagicMock(
            grounding_metadata=MagicMock(
                grounding_chunks=[
                    MagicMock(
                        web=MagicMock(
                            uri="https://example.com",
                            title="Example Source"
                        )
                    )
                ]
            )
        )
    ]
    return mock_response


@pytest.fixture
def mock_openai_response():
    """Mock de respuesta de OpenAI API."""
    mock_response = MagicMock()
    mock_response.data = [
        MagicMock(url="https://example.com/image.png")
    ]
    return mock_response


@pytest.fixture
def sample_tasks():
    """Tareas de ejemplo para testing."""
    return {
        "bug_fix": "fix typo in readme",
        "feature": "add logout button to navbar",
        "epic": "refactor authentication system",
        "enterprise": "migrate to microservices architecture",
        "web_search": "buscar tendencias de IA en 2025",
        "image_gen": "crear logo minimalista para startup",
        "code_gen": "implementar funcion de validacion de email",
    }


@pytest.fixture
def temp_state_file(tmp_path):
    """Crea un archivo de estado temporal."""
    state_dir = tmp_path / ".nxt"
    state_dir.mkdir()
    state_file = state_dir / "state.json"
    state_file.write_text('{"current_phase": "init", "completed_tasks": [], "pending_tasks": []}')
    return state_file
