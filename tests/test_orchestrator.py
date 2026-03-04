"""
Tests para el Multi-Agent Orchestrator.
Verifica clasificacion de tareas, delegacion y planificacion.
"""

import pytest
import json
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

# Agregar herramientas al path
sys.path.insert(0, str(Path(__file__).parent.parent / "herramientas"))

from orchestrator import (
    MultiAgentOrchestrator,
    TaskScale,
    AgentRole,
    TaskType
)


class TestTaskClassification:
    """Tests para clasificacion de escala de tareas."""

    @pytest.fixture
    def orchestrator(self, project_root):
        """Crea instancia del orquestador con mocks."""
        with patch.object(MultiAgentOrchestrator, '_load_state', return_value={
            "current_phase": "init",
            "completed_tasks": [],
            "pending_tasks": [],
            "active_agents": [],
            "decisions_log": [],
            "session_history": []
        }):
            with patch.object(MultiAgentOrchestrator, '_load_agents', return_value={}):
                orch = MultiAgentOrchestrator()
                orch.root = project_root
                return orch

    # =========================================================================
    # Tests de Clasificacion Bug Fix
    # =========================================================================

    def test_classify_fix_typo_as_bug_fix(self, orchestrator):
        """'fix typo' debe clasificar como bug_fix."""
        scale = orchestrator.classify_scale("fix typo in readme", estimated_files=1, estimated_hours=0.5)
        assert scale == TaskScale.BUG_FIX

    def test_classify_hotfix_as_bug_fix(self, orchestrator):
        """'hotfix' debe clasificar como bug_fix."""
        scale = orchestrator.classify_scale("hotfix for login error", estimated_files=2, estimated_hours=0.5)
        assert scale == TaskScale.BUG_FIX

    def test_classify_corregir_as_bug_fix(self, orchestrator):
        """'corregir' debe clasificar como bug_fix."""
        scale = orchestrator.classify_scale("corregir error en formulario", estimated_files=1, estimated_hours=0.3)
        assert scale == TaskScale.BUG_FIX

    # =========================================================================
    # Tests de Clasificacion Feature
    # =========================================================================

    def test_classify_add_feature(self, orchestrator):
        """'add' debe clasificar como feature."""
        scale = orchestrator.classify_scale("add logout button")
        assert scale == TaskScale.FEATURE

    def test_classify_create_feature(self, orchestrator):
        """'create' debe clasificar como feature."""
        scale = orchestrator.classify_scale("create user profile page")
        assert scale == TaskScale.FEATURE

    def test_classify_implement_feature(self, orchestrator):
        """'implement' debe clasificar como feature."""
        scale = orchestrator.classify_scale("implement email validation")
        assert scale == TaskScale.FEATURE

    def test_classify_agregar_feature(self, orchestrator):
        """'agregar' debe clasificar como feature."""
        scale = orchestrator.classify_scale("agregar boton de compartir")
        assert scale == TaskScale.FEATURE

    # =========================================================================
    # Tests de Clasificacion Epic
    # =========================================================================

    def test_classify_refactor_as_epic(self, orchestrator):
        """'refactor' debe clasificar como epic."""
        scale = orchestrator.classify_scale("refactor authentication system")
        assert scale == TaskScale.EPIC

    def test_classify_migrate_as_epic(self, orchestrator):
        """'migrate' debe clasificar como epic."""
        scale = orchestrator.classify_scale("migrate database to PostgreSQL")
        assert scale == TaskScale.EPIC

    def test_classify_redesign_as_epic(self, orchestrator):
        """'redesign' debe clasificar como epic."""
        scale = orchestrator.classify_scale("redesign dashboard UI")
        assert scale == TaskScale.EPIC

    def test_classify_by_hours_epic(self, orchestrator):
        """Tareas de 8-40h deben ser epic."""
        scale = orchestrator.classify_scale("unknown task", estimated_hours=20)
        assert scale == TaskScale.EPIC

    def test_classify_by_files_epic(self, orchestrator):
        """Tareas con 20-50 archivos deben ser epic."""
        scale = orchestrator.classify_scale("unknown task", estimated_files=30)
        assert scale == TaskScale.EPIC

    # =========================================================================
    # Tests de Clasificacion Enterprise
    # =========================================================================

    def test_classify_architecture_as_enterprise(self, orchestrator):
        """'architecture' debe clasificar como enterprise."""
        scale = orchestrator.classify_scale("new microservices architecture")
        assert scale == TaskScale.ENTERPRISE

    def test_classify_platform_as_enterprise(self, orchestrator):
        """'platform' debe clasificar como enterprise."""
        scale = orchestrator.classify_scale("build new platform from scratch")
        assert scale == TaskScale.ENTERPRISE

    def test_classify_microservices_as_enterprise(self, orchestrator):
        """'microservices' debe clasificar como enterprise."""
        scale = orchestrator.classify_scale("migrate to microservices")
        assert scale == TaskScale.ENTERPRISE

    def test_classify_by_hours_enterprise(self, orchestrator):
        """Tareas de 40h+ deben ser enterprise."""
        scale = orchestrator.classify_scale("unknown task", estimated_hours=50)
        assert scale == TaskScale.ENTERPRISE

    def test_classify_by_files_enterprise(self, orchestrator):
        """Tareas con 50+ archivos deben ser enterprise."""
        scale = orchestrator.classify_scale("unknown task", estimated_files=60)
        assert scale == TaskScale.ENTERPRISE


class TestDelegation:
    """Tests para delegacion de tareas a agentes."""

    @pytest.fixture
    def orchestrator(self, project_root):
        """Crea instancia del orquestador con mocks."""
        with patch.object(MultiAgentOrchestrator, '_load_state', return_value={}):
            with patch.object(MultiAgentOrchestrator, '_load_agents', return_value={}):
                orch = MultiAgentOrchestrator()
                orch.root = project_root
                return orch

    def test_delegate_research_internal(self, orchestrator):
        """Research interno debe ir a analyst."""
        agent = orchestrator.delegate(TaskType.RESEARCH, is_external=False)
        assert agent == AgentRole.ANALYST

    def test_delegate_research_external(self, orchestrator):
        """Research externo debe ir a search."""
        agent = orchestrator.delegate(TaskType.RESEARCH, is_external=True)
        assert agent == AgentRole.SEARCH

    def test_delegate_design_technical(self, orchestrator):
        """Design tecnico debe ir a architect."""
        agent = orchestrator.delegate(TaskType.DESIGN, is_technical=True)
        assert agent == AgentRole.ARCHITECT

    def test_delegate_design_non_technical(self, orchestrator):
        """Design no tecnico debe ir a UX."""
        agent = orchestrator.delegate(TaskType.DESIGN, is_technical=False)
        assert agent == AgentRole.UX

    def test_delegate_implementation(self, orchestrator):
        """Implementation debe ir a dev."""
        agent = orchestrator.delegate(TaskType.IMPLEMENTATION)
        assert agent == AgentRole.DEV

    def test_delegate_validation(self, orchestrator):
        """Validation debe ir a QA."""
        agent = orchestrator.delegate(TaskType.VALIDATION)
        assert agent == AgentRole.QA

    def test_delegate_documentation(self, orchestrator):
        """Documentation debe ir a tech writer."""
        agent = orchestrator.delegate(TaskType.DOCUMENTATION)
        assert agent == AgentRole.TECH_WRITER

    def test_delegate_multimedia(self, orchestrator):
        """Multimedia debe ir a media."""
        agent = orchestrator.delegate(TaskType.MULTIMEDIA)
        assert agent == AgentRole.MEDIA

    def test_delegate_infrastructure(self, orchestrator):
        """Infrastructure debe ir a devops."""
        agent = orchestrator.delegate(TaskType.INFRASTRUCTURE)
        assert agent == AgentRole.DEVOPS


class TestWorkflowGraphs:
    """Tests para generacion de grafos de workflow."""

    @pytest.fixture
    def orchestrator(self, project_root):
        """Crea instancia del orquestador con mocks."""
        with patch.object(MultiAgentOrchestrator, '_load_state', return_value={}):
            with patch.object(MultiAgentOrchestrator, '_load_agents', return_value={}):
                orch = MultiAgentOrchestrator()
                orch.root = project_root
                return orch

    def test_bug_fix_graph(self, orchestrator):
        """Bug fix debe tener grafo simple: dev -> qa -> end."""
        graph = orchestrator.get_workflow_graph(TaskScale.BUG_FIX)
        assert "dev" in graph
        assert "qa" in graph
        assert graph["dev"] == ["qa"]
        assert graph["qa"] == ["end"]

    def test_feature_graph(self, orchestrator):
        """Feature debe incluir analyst, dev, qa, docs."""
        graph = orchestrator.get_workflow_graph(TaskScale.FEATURE)
        assert "analyst" in graph
        assert "dev" in graph
        assert "qa" in graph
        assert "docs" in graph

    def test_epic_graph_has_parallel(self, orchestrator):
        """Epic debe tener nodos paralelos (architect, ux)."""
        graph = orchestrator.get_workflow_graph(TaskScale.EPIC)
        # PM debe dirigir a multiples nodos
        assert len(graph.get("pm", [])) > 1

    def test_enterprise_graph_has_devops(self, orchestrator):
        """Enterprise debe incluir devops."""
        graph = orchestrator.get_workflow_graph(TaskScale.ENTERPRISE)
        assert "devops" in graph or "devops_deploy" in graph


class TestAgentsForScale:
    """Tests para seleccion de agentes segun escala."""

    @pytest.fixture
    def orchestrator(self, project_root):
        """Crea instancia del orquestador con mocks."""
        with patch.object(MultiAgentOrchestrator, '_load_state', return_value={}):
            with patch.object(MultiAgentOrchestrator, '_load_agents', return_value={}):
                orch = MultiAgentOrchestrator()
                orch.root = project_root
                return orch

    def test_bug_fix_agents_minimal(self, orchestrator):
        """Bug fix debe tener pocos agentes."""
        agents = orchestrator.get_agents_for_scale(TaskScale.BUG_FIX)
        assert len(agents) == 2
        assert AgentRole.DEV in agents
        assert AgentRole.QA in agents

    def test_feature_agents(self, orchestrator):
        """Feature debe tener equipo basico."""
        agents = orchestrator.get_agents_for_scale(TaskScale.FEATURE)
        assert len(agents) >= 3
        assert AgentRole.DEV in agents
        assert AgentRole.QA in agents

    def test_epic_agents_full_team(self, orchestrator):
        """Epic debe tener equipo completo."""
        agents = orchestrator.get_agents_for_scale(TaskScale.EPIC)
        assert len(agents) >= 5
        assert AgentRole.ARCHITECT in agents
        assert AgentRole.PM in agents

    def test_enterprise_agents_extended(self, orchestrator):
        """Enterprise debe tener equipo extendido."""
        agents = orchestrator.get_agents_for_scale(TaskScale.ENTERPRISE)
        assert len(agents) >= 7
        assert AgentRole.DEVOPS in agents
        assert AgentRole.SCRUM_MASTER in agents


class TestPlanExecution:
    """Tests para planificacion de ejecucion."""

    @pytest.fixture
    def orchestrator(self, project_root, tmp_path):
        """Crea instancia del orquestador con estado temporal."""
        state_dir = tmp_path / ".nxt"
        state_dir.mkdir()

        with patch.object(MultiAgentOrchestrator, '_load_agents', return_value={}):
            orch = MultiAgentOrchestrator.__new__(MultiAgentOrchestrator)
            orch.root = tmp_path
            orch.config = {}
            orch.state = {
                "current_phase": "init",
                "completed_tasks": [],
                "pending_tasks": [],
                "active_agents": [],
                "decisions_log": [],
                "session_history": []
            }
            orch.agents = {}
            return orch

    def test_plan_creates_plan(self, orchestrator):
        """plan_execution debe crear un plan valido."""
        plan = orchestrator.plan_execution("add new feature")
        assert "task" in plan
        assert "scale" in plan
        assert "agents" in plan
        assert "workflow_graph" in plan

    def test_plan_saves_to_state(self, orchestrator):
        """Plan debe guardarse en pending_tasks."""
        orchestrator.plan_execution("add new feature")
        assert len(orchestrator.state["pending_tasks"]) == 1

    def test_plan_has_timestamp(self, orchestrator):
        """Plan debe tener timestamp."""
        plan = orchestrator.plan_execution("add new feature")
        assert "created_at" in plan

    def test_format_plan_output(self, orchestrator):
        """format_plan_output debe retornar string legible."""
        plan = orchestrator.plan_execution("add new feature")
        output = orchestrator.format_plan_output(plan)
        assert isinstance(output, str)
        assert "Plan de Ejecucion" in output
        assert "add new feature" in output


class TestStatus:
    """Tests para obtencion de estado."""

    @pytest.fixture
    def orchestrator(self, project_root):
        """Crea instancia del orquestador con mocks."""
        with patch.object(MultiAgentOrchestrator, '_load_state', return_value={
            "current_phase": "building",
            "completed_tasks": ["task1", "task2"],
            "pending_tasks": ["task3"],
            "active_agents": ["nxt-dev"],
            "decisions_log": [],
            "session_history": []
        }):
            with patch.object(MultiAgentOrchestrator, '_load_agents', return_value={
                "nxt-dev": {}, "nxt-qa": {}
            }):
                orch = MultiAgentOrchestrator()
                orch.root = project_root
                return orch

    def test_status_returns_dict(self, orchestrator):
        """get_status debe retornar diccionario."""
        status = orchestrator.get_status()
        assert isinstance(status, dict)

    def test_status_has_phase(self, orchestrator):
        """Status debe incluir fase actual."""
        status = orchestrator.get_status()
        assert "current_phase" in status
        assert status["current_phase"] == "building"

    def test_status_has_counts(self, orchestrator):
        """Status debe incluir conteos."""
        status = orchestrator.get_status()
        assert status["completed_tasks"] == 2
        assert status["pending_tasks"] == 1

    def test_status_has_available_agents(self, orchestrator):
        """Status debe listar agentes disponibles."""
        status = orchestrator.get_status()
        assert "available_agents" in status
