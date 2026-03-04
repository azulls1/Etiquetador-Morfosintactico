#!/usr/bin/env python3
"""
Tests de Integración para NXT v3
================================
Tests end-to-end para verificar la integración completa del sistema.
"""

import sys
import json
import os
from pathlib import Path

# Agregar herramientas al path
sys.path.insert(0, str(Path(__file__).parent.parent / "herramientas"))

import pytest


class TestBMADIntegration:
    """Tests de integración BMAD ↔ NXT."""

    def test_bmad_mapping_exists(self):
        """Verifica que existe el mapeo BMAD→NXT."""
        root = Path(__file__).parent.parent
        mapping_file = root / ".nxt" / "bmad-nxt-mapping.yaml"
        assert mapping_file.exists(), "BMAD-NXT mapping file should exist"

    def test_bmad_mapping_valid(self):
        """Verifica que el mapeo es válido."""
        import yaml
        root = Path(__file__).parent.parent
        mapping_file = root / ".nxt" / "bmad-nxt-mapping.yaml"

        with open(mapping_file, 'r', encoding='utf-8') as f:
            mapping = yaml.safe_load(f)

        assert "agent_mapping" in mapping
        assert "nxt_to_bmad" in mapping
        assert len(mapping["agent_mapping"]) > 0

    def test_bmad_agents_loaded(self):
        """Verifica que los agentes BMAD se cargan."""
        from nxt_orchestrator_v3 import AgentRegistry

        root = Path(__file__).parent.parent
        registry = AgentRegistry(root)

        bmad_agents = registry.list_bmad()
        # Puede haber agentes BMAD si el directorio existe
        assert isinstance(bmad_agents, list)


class TestSkillMCPIntegration:
    """Tests de integración Skill ↔ MCP."""

    def test_skill_mcp_mapping_exists(self):
        """Verifica que existe el mapeo Skill→MCP."""
        root = Path(__file__).parent.parent
        mapping_file = root / ".nxt" / "skill-mcp-mapping.yaml"
        assert mapping_file.exists(), "Skill-MCP mapping file should exist"

    def test_skill_mcp_mapping_valid(self):
        """Verifica que el mapeo es válido."""
        import yaml
        root = Path(__file__).parent.parent
        mapping_file = root / ".nxt" / "skill-mcp-mapping.yaml"

        with open(mapping_file, 'r', encoding='utf-8') as f:
            mapping = yaml.safe_load(f)

        assert "skill_mcp" in mapping
        assert len(mapping["skill_mcp"]) > 0


class TestCapabilitiesMapping:
    """Tests para el mapeo de capacidades."""

    def test_capabilities_exists(self):
        """Verifica que existe el archivo de capacidades."""
        root = Path(__file__).parent.parent
        cap_file = root / ".nxt" / "capabilities.yaml"
        assert cap_file.exists(), "Capabilities file should exist"

    def test_capabilities_valid(self):
        """Verifica que las capacidades son válidas."""
        import yaml
        root = Path(__file__).parent.parent
        cap_file = root / ".nxt" / "capabilities.yaml"

        with open(cap_file, 'r', encoding='utf-8') as f:
            caps = yaml.safe_load(f)

        assert "agents" in caps
        assert "delegation_graph" in caps
        assert len(caps["agents"]) > 0


class TestHooksIntegration:
    """Tests de integración de hooks."""

    def test_hooks_directory_exists(self):
        """Verifica que existe el directorio de hooks."""
        root = Path(__file__).parent.parent
        hooks_dir = root / "plugins" / "nxt-core" / "hooks"
        assert hooks_dir.exists(), "Hooks directory should exist"

    def test_required_hooks_exist(self):
        """Verifica que existen los hooks requeridos."""
        root = Path(__file__).parent.parent
        hooks_dir = root / "plugins" / "nxt-core" / "hooks"

        required_hooks = [
            "on-init.py",
            "on-agent-switch.py",
            "on-step-complete.py",
            "on-workflow-complete.py"
        ]

        for hook in required_hooks:
            hook_file = hooks_dir / hook
            assert hook_file.exists(), f"Hook {hook} should exist"


class TestStateIntegration:
    """Tests de integración de estado."""

    def test_state_file_exists(self):
        """Verifica que existe el archivo de estado."""
        root = Path(__file__).parent.parent
        state_file = root / ".nxt" / "state.json"
        assert state_file.exists(), "State file should exist"

    def test_state_file_valid(self):
        """Verifica que el estado es válido."""
        root = Path(__file__).parent.parent
        state_file = root / ".nxt" / "state.json"

        with open(state_file, 'r', encoding='utf-8') as f:
            state = json.load(f)

        assert "framework_version" in state
        assert state["framework_version"] == "3.3.0"
        assert "orchestrator_version" in state
        assert state["orchestrator_version"] == "3.3.0"


class TestEventBusIntegration:
    """Tests de integración del Event Bus."""

    def test_event_bus_with_orchestrator(self):
        """Prueba Event Bus integrado con orquestador."""
        from event_bus import EventBus, EventType, get_event_bus
        from nxt_orchestrator_v3 import NXTOrchestratorV3

        # Verificar que se puede obtener el bus global
        bus = get_event_bus()
        assert bus is not None

        # Crear orquestador
        orchestrator = NXTOrchestratorV3()
        assert orchestrator is not None


class TestMCPManagerIntegration:
    """Tests de integración del MCP Manager."""

    def test_mcp_manager_with_skills(self):
        """Prueba MCP Manager integrado con skills."""
        from mcp_manager import MCPManager
        from nxt_orchestrator_v3 import SkillRegistry

        root = Path(__file__).parent.parent

        manager = MCPManager()
        skill_registry = SkillRegistry(root)

        # Obtener skills
        skills = skill_registry.list_all()

        # Verificar que el manager puede manejar skills
        assert manager is not None
        assert isinstance(skills, list)


class TestFullSystemIntegration:
    """Tests de integración del sistema completo."""

    def test_all_components_load(self):
        """Verifica que todos los componentes cargan correctamente."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3
        from event_bus import EventBus
        from mcp_manager import MCPManager
        from agent_executor import AgentExecutor

        # Cargar todos los componentes
        orchestrator = NXTOrchestratorV3()
        event_bus = EventBus()
        mcp_manager = MCPManager()
        executor = AgentExecutor(orchestrator)

        # Verificar que están disponibles
        assert orchestrator is not None
        assert event_bus is not None
        assert mcp_manager is not None
        assert executor is not None

    def test_orchestrator_status(self):
        """Verifica el estado del orquestador."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3

        orchestrator = NXTOrchestratorV3()
        status = orchestrator.get_status()

        # Verificar estructura del estado
        assert status["version"] == "3.3.0"
        assert "registries" in status
        assert "agents" in status["registries"]
        assert "skills" in status["registries"]

    def test_complete_workflow_execution(self):
        """Ejecuta un workflow completo end-to-end."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3
        from agent_executor import AgentExecutor, ExecutionStatus

        # Setup
        orchestrator = NXTOrchestratorV3()
        executor = AgentExecutor(orchestrator)

        # Plan task
        task = "create user registration form"
        plan = executor.create_plan(task)

        assert plan is not None
        assert plan.task == task
        assert len(plan.steps) > 0

        # Execute (dry run)
        result = executor.execute_plan(plan, dry_run=True)

        # Verify
        assert result.status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED]
        assert len(result.results) > 0

    def test_5_level_classification(self):
        """Verifica clasificación en 5 niveles."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3, TaskScale

        orchestrator = NXTOrchestratorV3()

        test_cases = [
            ("fix typo", TaskScale.NIVEL_0),
            ("fix bug in form", TaskScale.NIVEL_1),
            ("add new feature", TaskScale.NIVEL_2),
            ("refactor authentication module", TaskScale.NIVEL_3),
            ("design microservices architecture", TaskScale.NIVEL_4),
        ]

        for task, expected_scale in test_cases:
            actual_scale = orchestrator.classify(task)
            assert actual_scale == expected_scale, \
                f"Task '{task}' should be {expected_scale.value}, got {actual_scale.value}"


class TestConfigurationIntegration:
    """Tests de integración de configuración."""

    def test_config_file_exists(self):
        """Verifica que existe el archivo de configuración."""
        root = Path(__file__).parent.parent
        config_file = root / ".nxt" / "nxt.config.yaml"
        assert config_file.exists(), "Config file should exist"

    def test_config_loads(self):
        """Verifica que la configuración carga correctamente."""
        from utils import load_config

        config = load_config()
        assert config is not None
        assert "framework" in config or "empresa" in config


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
