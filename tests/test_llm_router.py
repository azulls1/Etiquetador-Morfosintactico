"""
Tests para el LLM Router.
Verifica el enrutamiento correcto de tareas a diferentes LLMs.
"""

import pytest
import sys
from pathlib import Path

# Agregar herramientas al path
sys.path.insert(0, str(Path(__file__).parent.parent / "herramientas"))

from llm_router import LLMRouter, LLMProvider, TaskType


class TestLLMRouter:
    """Tests para la clase LLMRouter."""

    @pytest.fixture
    def router(self):
        """Crea una instancia del router."""
        return LLMRouter()

    # =========================================================================
    # Tests de Routing a Gemini
    # =========================================================================

    def test_route_web_search_to_gemini(self, router):
        """Busquedas web deben ir a Gemini."""
        result = router.route("buscar tendencias de IA en 2025")
        assert result["provider"] == "gemini"
        assert result["task_type"] == "web_search"

    def test_route_maps_search_to_gemini(self, router):
        """Busquedas de lugares deben ir a Gemini."""
        result = router.route("encontrar restaurantes cerca de mi ubicacion")
        assert result["provider"] == "gemini"
        assert result["task_type"] == "maps_search"

    def test_route_fact_check_to_gemini(self, router):
        """Verificacion de hechos debe ir a Gemini."""
        result = router.route("verificar si Python es el lenguaje mas usado")
        assert result["provider"] == "gemini"
        assert result["task_type"] == "fact_check"

    def test_route_url_analysis_to_gemini(self, router):
        """Analisis de URLs debe ir a Gemini."""
        result = router.route("analizar sitio web de la competencia")
        assert result["provider"] == "gemini"

    def test_route_google_search_to_gemini(self, router):
        """Busquedas de Google explicitas deben ir a Gemini."""
        result = router.route("google las ultimas noticias de tecnologia")
        assert result["provider"] == "gemini"

    # =========================================================================
    # Tests de Routing a OpenAI
    # =========================================================================

    def test_route_logo_to_openai(self, router):
        """Creacion de logos debe ir a OpenAI."""
        result = router.route("crear logo para mi empresa")
        assert result["provider"] == "openai"
        assert result["task_type"] == "image_with_text"

    def test_route_image_to_openai(self, router):
        """Generacion de imagenes debe ir a OpenAI."""
        result = router.route("generar ilustracion de un astronauta")
        assert result["provider"] == "openai"

    def test_route_video_to_openai(self, router):
        """Generacion de videos debe ir a OpenAI."""
        result = router.route("crear video demo del producto")
        assert result["provider"] == "openai"
        assert result["task_type"] == "video_generation"

    def test_route_transcription_to_openai(self, router):
        """Transcripcion de audio debe ir a OpenAI."""
        result = router.route("transcribir la reunion grabada")
        assert result["provider"] == "openai"
        assert result["task_type"] == "audio_transcription"

    def test_route_tts_to_openai(self, router):
        """Text-to-speech debe ir a OpenAI."""
        result = router.route("narrar este texto en voz alta")
        assert result["provider"] == "openai"
        assert result["task_type"] == "text_to_speech"

    def test_route_image_analysis_to_openai(self, router):
        """Analisis de imagenes debe ir a OpenAI."""
        result = router.route("analizar imagen y describir que hay")
        assert result["provider"] == "openai"

    # =========================================================================
    # Tests de Routing a Claude (default)
    # =========================================================================

    def test_route_code_to_claude(self, router):
        """Generacion de codigo debe ir a Claude."""
        result = router.route("implementar funcion de autenticacion")
        assert result["provider"] == "claude"
        assert result["task_type"] == "code_generation"

    def test_route_code_review_to_claude(self, router):
        """Revision de codigo debe ir a Claude."""
        result = router.route("revisar codigo de la API")
        assert result["provider"] == "claude"
        assert result["task_type"] == "code_review"

    def test_route_document_to_claude(self, router):
        """Creacion de documentos debe ir a Claude."""
        result = router.route("crear documento word con especificaciones")
        assert result["provider"] == "claude"

    def test_route_planning_to_claude(self, router):
        """Planificacion debe ir a Claude."""
        result = router.route("diseñar arquitectura del sistema")
        assert result["provider"] == "claude"
        assert result["task_type"] == "planning"

    def test_route_general_to_claude(self, router):
        """Tareas generales deben ir a Claude."""
        result = router.route("explicame como funciona esto")
        assert result["provider"] == "claude"
        assert result["task_type"] == "general"

    def test_route_unknown_to_claude(self, router):
        """Tareas desconocidas deben ir a Claude como default."""
        result = router.route("xyz abc 123")
        assert result["provider"] == "claude"
        assert result["confidence"] == "low"

    # =========================================================================
    # Tests de Confianza
    # =========================================================================

    def test_confidence_high_single_match(self, router):
        """Confianza alta cuando hay un solo match claro."""
        result = router.route("transcribir audio")
        assert result["confidence"] in ["high", "medium"]

    def test_confidence_low_no_match(self, router):
        """Confianza baja cuando no hay match."""
        result = router.route("asdfghjkl")
        assert result["confidence"] == "low"

    # =========================================================================
    # Tests de Comandos Sugeridos
    # =========================================================================

    def test_get_command_for_gemini_search(self, router):
        """Debe generar comando correcto para busqueda Gemini."""
        result = router.route("buscar informacion")
        command = router.get_tool_command(result, "buscar informacion")
        assert command is not None
        assert "gemini_tools.py" in command
        assert "search" in command

    def test_get_command_for_openai_image(self, router):
        """Debe generar comando correcto para imagen OpenAI."""
        result = router.route("crear logo")
        command = router.get_tool_command(result, "crear logo")
        assert command is not None
        assert "openai_tools.py" in command
        assert "image" in command

    def test_get_command_for_claude_returns_none(self, router):
        """Claude no genera comando (es el contexto actual)."""
        result = router.route("escribir codigo")
        command = router.get_tool_command(result, "escribir codigo")
        assert command is None

    # =========================================================================
    # Tests de Explicacion
    # =========================================================================

    def test_explain_routing_returns_string(self, router):
        """explain_routing debe retornar documentacion."""
        explanation = router.explain_routing()
        assert isinstance(explanation, str)
        assert "Gemini" in explanation
        assert "OpenAI" in explanation
        assert "Claude" in explanation


class TestEdgeCases:
    """Tests para casos edge."""

    @pytest.fixture
    def router(self):
        return LLMRouter()

    def test_empty_string(self, router):
        """String vacio debe ir a Claude."""
        result = router.route("")
        assert result["provider"] == "claude"

    def test_mixed_keywords(self, router):
        """Multiples keywords deben elegir por prioridad."""
        # "buscar" (gemini) + "codigo" (claude)
        result = router.route("buscar codigo de ejemplo")
        # buscar tiene mayor prioridad
        assert result["provider"] == "gemini"

    def test_case_insensitive(self, router):
        """Routing debe ser case insensitive."""
        result1 = router.route("BUSCAR tendencias")
        result2 = router.route("buscar tendencias")
        assert result1["provider"] == result2["provider"]

    def test_special_characters(self, router):
        """Debe manejar caracteres especiales."""
        result = router.route("buscar: ¿tendencias? ¡2025!")
        assert result["provider"] == "gemini"
