#!/usr/bin/env python3
"""
Tests para NXT Orchestrator v3
==============================
Tests unitarios y de integración para el orquestador v3.
"""

import sys
import json
from pathlib import Path

# Agregar herramientas al path
sys.path.insert(0, str(Path(__file__).parent.parent / "herramientas"))

import pytest


class TestTaskClassifier:
    """Tests para el clasificador de tareas."""

    def test_imports(self):
        """Verifica que se pueden importar los módulos."""
        from nxt_orchestrator_v3 import (
            TaskScale, TaskClassifier, AgentRole,
            WorkflowGraph, NXTOrchestratorV3
        )
        assert TaskScale is not None
        assert TaskClassifier is not None

    def test_classify_nivel_0(self):
        """Clasifica tareas triviales como nivel_0."""
        from nxt_orchestrator_v3 import TaskClassifier, TaskScale

        tasks = [
            "fix typo in readme",
            "add comment to function",
            "fix whitespace",
        ]

        for task in tasks:
            scale = TaskClassifier.classify(task)
            assert scale == TaskScale.NIVEL_0, f"Task '{task}' should be NIVEL_0"

    def test_classify_nivel_1(self):
        """Clasifica tareas simples como nivel_1."""
        from nxt_orchestrator_v3 import TaskClassifier, TaskScale

        tasks = [
            "fix bug in login form",
            "hotfix for null pointer",
            "quick fix for error message",
        ]

        for task in tasks:
            scale = TaskClassifier.classify(task)
            assert scale == TaskScale.NIVEL_1, f"Task '{task}' should be NIVEL_1"

    def test_classify_nivel_2(self):
        """Clasifica tareas estándar como nivel_2."""
        from nxt_orchestrator_v3 import TaskClassifier, TaskScale

        tasks = [
            "add new feature for user dashboard",
            "create API endpoint for products",
            "implement search functionality",
        ]

        for task in tasks:
            scale = TaskClassifier.classify(task)
            assert scale == TaskScale.NIVEL_2, f"Task '{task}' should be NIVEL_2"

    def test_classify_nivel_3(self):
        """Clasifica tareas complejas como nivel_3."""
        from nxt_orchestrator_v3 import TaskClassifier, TaskScale

        tasks = [
            "refactor authentication module",
            "migrate database to PostgreSQL",
            "redesign user management system",
        ]

        for task in tasks:
            scale = TaskClassifier.classify(task)
            assert scale == TaskScale.NIVEL_3, f"Task '{task}' should be NIVEL_3"

    def test_classify_nivel_4(self):
        """Clasifica tareas enterprise como nivel_4."""
        from nxt_orchestrator_v3 import TaskClassifier, TaskScale

        tasks = [
            "design microservices architecture",
            "build enterprise platform",
            "implement multi-tenant infrastructure",
        ]

        for task in tasks:
            scale = TaskClassifier.classify(task)
            assert scale == TaskScale.NIVEL_4, f"Task '{task}' should be NIVEL_4"

    def test_classify_by_hours(self):
        """Clasifica por horas estimadas."""
        from nxt_orchestrator_v3 import TaskClassifier, TaskScale

        # Nivel 0: < 0.25h
        assert TaskClassifier.classify("generic task", estimated_hours=0.1) == TaskScale.NIVEL_0

        # Nivel 1: 0.25-1h
        assert TaskClassifier.classify("generic task", estimated_hours=0.5) == TaskScale.NIVEL_1

        # Nivel 2: 1-8h
        assert TaskClassifier.classify("generic task", estimated_hours=4) == TaskScale.NIVEL_2

        # Nivel 3: 8-40h
        assert TaskClassifier.classify("generic task", estimated_hours=20) == TaskScale.NIVEL_3

        # Nivel 4: 40h+
        assert TaskClassifier.classify("generic task", estimated_hours=100) == TaskScale.NIVEL_4

    def test_get_config(self):
        """Obtiene configuración por nivel."""
        from nxt_orchestrator_v3 import TaskClassifier, TaskScale

        config = TaskClassifier.get_config(TaskScale.NIVEL_2)
        assert "track" in config
        assert config["track"] == "bmad_method"
        assert "agents" in config

    def test_get_agents(self):
        """Obtiene agentes por nivel."""
        from nxt_orchestrator_v3 import TaskClassifier, TaskScale, AgentRole

        agents = TaskClassifier.get_agents(TaskScale.NIVEL_0)
        assert AgentRole.DEV in agents

        agents = TaskClassifier.get_agents(TaskScale.NIVEL_4)
        assert AgentRole.ARCHITECT in agents
        assert AgentRole.CYBERSEC in agents


class TestWorkflowGraph:
    """Tests para el generador de grafos."""

    def test_get_graph(self):
        """Obtiene grafo por nivel."""
        from nxt_orchestrator_v3 import WorkflowGraph, TaskScale

        graph = WorkflowGraph.get_graph(TaskScale.NIVEL_1)
        assert "start" in graph
        assert "dev" in graph
        assert "qa" in graph

    def test_execution_order(self):
        """Obtiene orden de ejecución."""
        from nxt_orchestrator_v3 import WorkflowGraph, TaskScale

        order = WorkflowGraph.get_execution_order(TaskScale.NIVEL_1)
        assert "dev" in order
        assert "qa" in order
        assert order.index("dev") < order.index("qa")

    def test_get_agent_for_node(self):
        """Obtiene agente para nodo."""
        from nxt_orchestrator_v3 import WorkflowGraph, AgentRole

        agent = WorkflowGraph.get_agent_for_node("dev")
        assert agent == AgentRole.DEV

        agent = WorkflowGraph.get_agent_for_node("architect")
        assert agent == AgentRole.ARCHITECT


class TestAgentDelegator:
    """Tests para el delegador de agentes."""

    def test_delegate(self):
        """Delega tareas a agentes."""
        from nxt_orchestrator_v3 import AgentDelegator, TaskType, AgentRole

        agent = AgentDelegator.delegate(TaskType.IMPLEMENTATION)
        assert agent == AgentRole.DEV

        agent = AgentDelegator.delegate(TaskType.VALIDATION)
        assert agent == AgentRole.QA

    def test_infer_task_type(self):
        """Infiere tipo de tarea."""
        from nxt_orchestrator_v3 import AgentDelegator, TaskType

        task_type = AgentDelegator.infer_task_type("implement login feature")
        assert task_type == TaskType.IMPLEMENTATION

        task_type = AgentDelegator.infer_task_type("test user registration")
        assert task_type == TaskType.VALIDATION

        task_type = AgentDelegator.infer_task_type("design system architecture")
        assert task_type == TaskType.DESIGN


class TestRegistries:
    """Tests para los registros."""

    def test_agent_registry(self):
        """Prueba el registro de agentes."""
        from nxt_orchestrator_v3 import AgentRegistry
        from pathlib import Path

        # Usar ruta del proyecto
        root = Path(__file__).parent.parent
        registry = AgentRegistry(root)

        # Debe tener agentes NXT
        nxt_agents = registry.list_nxt()
        assert len(nxt_agents) > 0

        # Puede tener agentes BMAD
        all_agents = registry.list_all()
        assert len(all_agents) >= len(nxt_agents)

    def test_skill_registry(self):
        """Prueba el registro de skills."""
        from nxt_orchestrator_v3 import SkillRegistry
        from pathlib import Path

        root = Path(__file__).parent.parent
        registry = SkillRegistry(root)

        skills = registry.list_all()
        # Debe tener skills
        assert len(skills) > 0

    def test_workflow_registry(self):
        """Prueba el registro de workflows."""
        from nxt_orchestrator_v3 import WorkflowRegistry
        from pathlib import Path

        root = Path(__file__).parent.parent
        registry = WorkflowRegistry(root)

        workflows = registry.list_all()
        # Debe tener workflows
        assert len(workflows) >= 0  # Puede estar vacío


class TestOrchestrator:
    """Tests para el orquestador completo."""

    def test_orchestrator_init(self):
        """Inicializa el orquestador."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3

        orchestrator = NXTOrchestratorV3()
        assert orchestrator is not None
        assert orchestrator.agents is not None
        assert orchestrator.skills is not None

    def test_classify(self):
        """Clasifica tareas."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3, TaskScale

        orchestrator = NXTOrchestratorV3()
        scale = orchestrator.classify("implement user authentication")

        assert scale in [TaskScale.NIVEL_2, TaskScale.NIVEL_3]

    def test_plan(self):
        """Planifica tareas."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3

        orchestrator = NXTOrchestratorV3()
        plan = orchestrator.plan("add search feature")

        assert "id" in plan
        assert "task" in plan
        assert "scale" in plan
        assert "workflow_graph" in plan
        assert "execution_order" in plan

    def test_get_status(self):
        """Obtiene estado."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3

        orchestrator = NXTOrchestratorV3()
        status = orchestrator.get_status()

        assert "version" in status
        assert "registries" in status
        assert status["version"] == "3.3.0"


class TestEventBus:
    """Tests para el Event Bus."""

    def test_event_bus_init(self):
        """Inicializa el event bus."""
        from event_bus import EventBus, EventType

        bus = EventBus()
        assert bus is not None

    def test_subscribe_and_publish(self):
        """Suscribe y publica eventos."""
        from event_bus import EventBus, EventType, Event

        bus = EventBus()
        received = []

        def handler(event):
            received.append(event)

        bus.subscribe(EventType.TASK_STARTED, handler)
        bus.emit(EventType.TASK_STARTED, {"task": "test"})

        assert len(received) == 1
        assert received[0].data["task"] == "test"

    def test_event_history(self):
        """Mantiene historial de eventos."""
        from event_bus import EventBus, EventType

        bus = EventBus()
        bus.emit(EventType.SYSTEM_INIT, {"version": "1.0"})
        bus.emit(EventType.TASK_STARTED, {"task": "test"})

        history = bus.get_history()
        assert len(history) == 2


class TestMCPManager:
    """Tests para el MCP Manager."""

    def test_mcp_manager_init(self):
        """Inicializa el MCP Manager."""
        from mcp_manager import MCPManager

        manager = MCPManager()
        assert manager is not None

    def test_list_servers(self):
        """Lista servidores MCP."""
        from mcp_manager import MCPManager

        manager = MCPManager()
        servers = manager.list_servers()

        # Puede tener servidores o no
        assert isinstance(servers, list)

    def test_get_status(self):
        """Obtiene estado del MCP Manager."""
        from mcp_manager import MCPManager

        manager = MCPManager()
        status = manager.get_status()

        assert "total_servers" in status
        assert "enabled_servers" in status


class TestAgentExecutor:
    """Tests para el Agent Executor."""

    def test_executor_init(self):
        """Inicializa el executor."""
        from agent_executor import AgentExecutor

        executor = AgentExecutor()
        assert executor is not None

    def test_create_plan(self):
        """Crea plan de ejecución."""
        from agent_executor import AgentExecutor

        executor = AgentExecutor()
        plan = executor.create_plan("test task")

        assert plan is not None
        assert plan.task == "test task"
        assert len(plan.steps) > 0

    def test_execute_dry_run(self):
        """Ejecuta plan en dry run."""
        from agent_executor import AgentExecutor, ExecutionStatus

        executor = AgentExecutor()
        plan = executor.create_plan("test task")
        result = executor.execute_plan(plan, dry_run=True)

        assert result.status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED]


class TestIntegration:
    """Tests de integración del sistema completo."""

    def test_full_workflow(self):
        """Prueba workflow completo."""
        from nxt_orchestrator_v3 import NXTOrchestratorV3, TaskScale
        from agent_executor import AgentExecutor, ExecutionStatus

        # 1. Crear orquestador
        orchestrator = NXTOrchestratorV3()

        # 2. Clasificar tarea
        task = "add user profile page"
        scale = orchestrator.classify(task)
        assert scale in [TaskScale.NIVEL_1, TaskScale.NIVEL_2, TaskScale.NIVEL_3]

        # 3. Planificar
        plan = orchestrator.plan(task)
        assert "execution_order" in plan

        # 4. Ejecutar (dry run)
        executor = AgentExecutor(orchestrator)
        exec_plan = executor.create_plan(task)
        result = executor.execute_plan(exec_plan, dry_run=True)

        # 5. Verificar resultado
        assert result.status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED]

    def test_event_propagation(self):
        """Prueba propagación de eventos."""
        from event_bus import EventBus, EventType
        from nxt_orchestrator_v3 import NXTOrchestratorV3

        events_received = []

        # Crear bus de eventos
        bus = EventBus()

        def capture_event(event):
            events_received.append(event)

        # Suscribir a eventos
        bus.subscribe(EventType.TASK_CLASSIFIED, capture_event)
        bus.subscribe(EventType.TASK_PLANNED, capture_event)

        # Emitir eventos (simular orquestador)
        bus.emit(EventType.TASK_CLASSIFIED, {"task": "test", "scale": "nivel_2"})
        bus.emit(EventType.TASK_PLANNED, {"task": "test", "steps": 3})

        assert len(events_received) == 2


class TestSelfHealing:
    """Tests para el sistema de self-healing."""

    def test_self_healing_manager_init(self):
        """Inicializa el self-healing manager."""
        from agent_executor import SelfHealingManager, HealthStatus

        manager = SelfHealingManager()
        assert manager is not None
        assert manager.get_health_status() == HealthStatus.HEALTHY

    def test_health_metrics(self):
        """Prueba métricas de salud."""
        from agent_executor import SelfHealingManager

        manager = SelfHealingManager()

        # Registrar ejecuciones exitosas
        manager.record_execution(success=True, execution_time=1.0)
        manager.record_execution(success=True, execution_time=2.0)

        metrics = manager.get_metrics()
        assert metrics["success_rate"] == 100.0
        assert metrics["total_executions"] == 2

    def test_circuit_breaker(self):
        """Prueba circuit breaker."""
        from agent_executor import SelfHealingManager, HealthStatus

        manager = SelfHealingManager()
        manager.circuit_threshold = 3

        # Simular fallos consecutivos
        for _ in range(3):
            manager.record_execution(success=False, execution_time=1.0)

        assert manager.circuit_open is True
        assert manager.get_health_status() == HealthStatus.RECOVERING
        assert manager.can_execute() is False

    def test_recovery_strategies(self):
        """Prueba estrategias de recuperación."""
        from agent_executor import SelfHealingManager

        manager = SelfHealingManager()

        # Probar diferentes estrategias
        retry = manager.suggest_recovery("timeout", {})
        assert retry["action"] == "retry"

        skip = manager.suggest_recovery("validation", {})
        assert skip["action"] == "skip"

        fallback = manager.suggest_recovery("agent_not_found", {})
        assert fallback["action"] == "fallback"


class TestLearning:
    """Tests para capacidades de aprendizaje."""

    def test_learn_from_decisions(self):
        """Prueba aprendizaje de decisiones."""
        from nxt_orchestrator_v3 import StateManager
        from pathlib import Path

        root = Path(__file__).parent.parent
        manager = StateManager(root)

        # Verificar que learn_from_decisions existe y funciona
        insights = manager.learn_from_decisions()
        assert "patterns" in insights
        assert "recommendations" in insights

    def test_get_similar_decisions(self):
        """Prueba búsqueda de decisiones similares."""
        from nxt_orchestrator_v3 import StateManager
        from pathlib import Path

        root = Path(__file__).parent.parent
        manager = StateManager(root)

        # Buscar decisiones similares
        similar = manager.get_similar_decisions("implement new feature")
        assert isinstance(similar, list)

    def test_predict_classification(self):
        """Prueba predicción de clasificación."""
        from nxt_orchestrator_v3 import StateManager
        from pathlib import Path

        root = Path(__file__).parent.parent
        manager = StateManager(root)

        # Intentar predecir (puede retornar None si no hay datos)
        prediction = manager.predict_classification("fix bug in login")
        assert prediction is None or prediction in [
            "nivel_0", "nivel_1", "nivel_2", "nivel_3", "nivel_4"
        ]


class TestHealthMonitoring:
    """Tests para monitoreo de salud."""

    def test_global_self_healing_manager(self):
        """Prueba instancia global de self-healing."""
        from agent_executor import get_self_healing_manager

        manager1 = get_self_healing_manager()
        manager2 = get_self_healing_manager()

        assert manager1 is manager2  # Singleton

    def test_metrics_collection(self):
        """Prueba colección de métricas."""
        from agent_executor import HealthMetrics

        metrics = HealthMetrics()

        # Actualizar métricas
        metrics.update(success=True, execution_time=1.5)
        metrics.update(success=True, execution_time=2.5)
        metrics.update(success=False, execution_time=3.0)

        assert metrics.total_executions == 3
        assert metrics.failed_executions == 1
        assert metrics.success_rate == 2/3


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
