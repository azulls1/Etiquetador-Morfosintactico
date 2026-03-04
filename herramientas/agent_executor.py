#!/usr/bin/env python3
"""
NXT AI Development - Agent Executor
===================================
Ejecutor autónomo de agentes con:
- Ejecución secuencial y PARALELA
- Retry automático
- Feedback loop
- Checkpoints y recovery
- Logging detallado
- ThreadPoolExecutor para concurrencia
- Dependency graph para orden de ejecución

Versión: 3.6.0
"""

import os
import sys
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable, Tuple
from pathlib import Path
from enum import Enum
from dataclasses import dataclass, field
import threading
import queue
from concurrent.futures import ThreadPoolExecutor, as_completed, Future
from typing import Set

try:
    from utils import get_project_root, load_config
except ImportError:
    sys.path.insert(0, str(Path(__file__).parent))
    from utils import get_project_root, load_config

try:
    from event_bus import EventBus, EventType, Event, get_event_bus, emit
except ImportError:
    EventBus = None
    EventType = None
    Event = None
    get_event_bus = None
    emit = None

try:
    from nxt_orchestrator_v3 import (
        NXTOrchestratorV3, TaskScale, AgentRole, WorkflowPhase,
        WorkflowGraph, ExecutionContext
    )
except ImportError:
    NXTOrchestratorV3 = None

# Importar cliente Claude CLI para ejecución REAL
try:
    from claude_cli_client import (
        ClaudeCLIClient, ClaudeCLIAgentRunner, ClaudeResponse,
        InvocationStatus, AgentConfig
    )
    CLAUDE_CLI_AVAILABLE = True
except ImportError:
    ClaudeCLIClient = None
    ClaudeCLIAgentRunner = None
    ClaudeResponse = None
    InvocationStatus = None
    AgentConfig = None
    CLAUDE_CLI_AVAILABLE = False


# =============================================================================
# SELF-HEALING SYSTEM
# =============================================================================

class HealthStatus(Enum):
    """Estado de salud del sistema."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    RECOVERING = "recovering"


@dataclass
class HealthMetrics:
    """Métricas de salud del sistema."""
    success_rate: float = 1.0
    avg_execution_time: float = 0.0
    total_executions: int = 0
    failed_executions: int = 0
    recovered_executions: int = 0
    last_check: str = field(default_factory=lambda: datetime.now().isoformat())

    def update(self, success: bool, execution_time: float):
        """Actualiza métricas."""
        self.total_executions += 1
        if not success:
            self.failed_executions += 1

        # Actualizar tasa de éxito
        if self.total_executions > 0:
            self.success_rate = (self.total_executions - self.failed_executions) / self.total_executions

        # Actualizar tiempo promedio
        n = self.total_executions
        self.avg_execution_time = ((n - 1) * self.avg_execution_time + execution_time) / n
        self.last_check = datetime.now().isoformat()


class SelfHealingManager:
    """
    Gestiona la auto-recuperación del sistema.

    Características:
    - Detección de fallos
    - Estrategias de recuperación
    - Circuit breaker pattern
    - Health monitoring
    """

    def __init__(self):
        self.metrics = HealthMetrics()
        self.circuit_open = False
        self.circuit_failures = 0
        self.circuit_threshold = 5
        self.recovery_strategies: Dict[str, Callable] = {}
        self._register_default_strategies()

    def _register_default_strategies(self):
        """Registra estrategias de recuperación por defecto."""
        self.recovery_strategies["retry"] = self._strategy_retry
        self.recovery_strategies["skip"] = self._strategy_skip
        self.recovery_strategies["fallback"] = self._strategy_fallback
        self.recovery_strategies["reset"] = self._strategy_reset

    def _strategy_retry(self, context: Dict) -> Dict:
        """Estrategia: reintentar."""
        return {"action": "retry", "delay": 1.0}

    def _strategy_skip(self, context: Dict) -> Dict:
        """Estrategia: saltar paso."""
        return {"action": "skip", "reason": "step_skipped_due_to_failure"}

    def _strategy_fallback(self, context: Dict) -> Dict:
        """Estrategia: usar fallback."""
        return {"action": "fallback", "agent": "nxt-dev"}

    def _strategy_reset(self, context: Dict) -> Dict:
        """Estrategia: reiniciar."""
        return {"action": "reset", "from_checkpoint": True}

    def get_health_status(self) -> HealthStatus:
        """Obtiene el estado de salud actual."""
        if self.circuit_open:
            return HealthStatus.RECOVERING
        if self.metrics.success_rate >= 0.95:
            return HealthStatus.HEALTHY
        if self.metrics.success_rate >= 0.7:
            return HealthStatus.DEGRADED
        return HealthStatus.UNHEALTHY

    def record_execution(self, success: bool, execution_time: float):
        """Registra una ejecución."""
        self.metrics.update(success, execution_time)

        if not success:
            self.circuit_failures += 1
            if self.circuit_failures >= self.circuit_threshold:
                self.circuit_open = True
        else:
            self.circuit_failures = 0
            if self.circuit_open:
                self.circuit_open = False
                self.metrics.recovered_executions += 1

    def suggest_recovery(self, error_type: str, context: Dict) -> Dict:
        """Sugiere estrategia de recuperación."""
        # Seleccionar estrategia basada en tipo de error
        if error_type in ["timeout", "network"]:
            return self.recovery_strategies["retry"](context)
        elif error_type in ["validation", "lint"]:
            return self.recovery_strategies["skip"](context)
        elif error_type in ["agent_not_found"]:
            return self.recovery_strategies["fallback"](context)
        else:
            return self.recovery_strategies["reset"](context)

    def can_execute(self) -> bool:
        """Verifica si se puede ejecutar (circuit breaker)."""
        return not self.circuit_open

    def get_metrics(self) -> Dict[str, Any]:
        """Obtiene métricas actuales."""
        return {
            "health_status": self.get_health_status().value,
            "success_rate": round(self.metrics.success_rate * 100, 2),
            "total_executions": self.metrics.total_executions,
            "failed_executions": self.metrics.failed_executions,
            "recovered_executions": self.metrics.recovered_executions,
            "avg_execution_time": round(self.metrics.avg_execution_time, 2),
            "circuit_open": self.circuit_open,
            "last_check": self.metrics.last_check
        }


# Instancia global de self-healing
_self_healing_manager: Optional[SelfHealingManager] = None


def get_self_healing_manager() -> SelfHealingManager:
    """Obtiene la instancia global del self-healing manager."""
    global _self_healing_manager
    if _self_healing_manager is None:
        _self_healing_manager = SelfHealingManager()
    return _self_healing_manager


class ExecutionStatus(Enum):
    """Estado de ejecución."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    CANCELLED = "cancelled"


@dataclass
class StepResult:
    """Resultado de la ejecución de un paso."""
    step: str
    agent: str
    status: ExecutionStatus
    started_at: str
    completed_at: Optional[str] = None
    duration_seconds: float = 0
    artifacts: Dict[str, Any] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)
    retries: int = 0


@dataclass
class ExecutionPlan:
    """Plan de ejecución con estado."""
    id: str
    task: str
    scale: TaskScale
    steps: List[str]
    current_step_index: int = 0
    status: ExecutionStatus = ExecutionStatus.PENDING
    results: List[StepResult] = field(default_factory=list)
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    total_retries: int = 0


class AgentExecutor:
    """
    Ejecutor autónomo de agentes.

    Ejecuta el plan de workflow de forma autónoma,
    manejando transiciones, errores y reintentos.
    """

    def __init__(self, orchestrator: 'NXTOrchestratorV3' = None,
                 max_retries: int = 3,
                 retry_delay: float = 1.0,
                 use_claude_cli: bool = True):
        """
        Inicializa el ejecutor.

        Args:
            orchestrator: Instancia del orquestador (opcional)
            max_retries: Número máximo de reintentos por paso
            retry_delay: Delay entre reintentos en segundos
            use_claude_cli: Si usar Claude CLI para ejecución REAL
        """
        self.root = get_project_root()
        self.orchestrator = orchestrator or (NXTOrchestratorV3() if NXTOrchestratorV3 else None)
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.use_claude_cli = use_claude_cli and CLAUDE_CLI_AVAILABLE

        self.event_bus = get_event_bus() if get_event_bus else None
        self.current_plan: Optional[ExecutionPlan] = None
        self.checkpoints_dir = self.root / ".nxt" / "checkpoints"
        self.checkpoints_dir.mkdir(parents=True, exist_ok=True)

        # Inicializar cliente Claude CLI si está disponible
        self.claude_runner: Optional['ClaudeCLIAgentRunner'] = None
        if self.use_claude_cli and ClaudeCLIAgentRunner:
            try:
                self.claude_runner = ClaudeCLIAgentRunner(self.root)
                print(f"    Claude CLI Client inicializado")
            except Exception as e:
                print(f"    Advertencia: No se pudo inicializar Claude CLI: {e}")
                self.use_claude_cli = False

        # Self-healing manager
        self.self_healing = get_self_healing_manager()

        # Callbacks
        self._on_step_start: List[Callable] = []
        self._on_step_complete: List[Callable] = []
        self._on_step_fail: List[Callable] = []
        self._on_plan_complete: List[Callable] = []

    def on_step_start(self, callback: Callable[[str, str], None]):
        """Registra callback para inicio de paso."""
        self._on_step_start.append(callback)

    def on_step_complete(self, callback: Callable[[StepResult], None]):
        """Registra callback para paso completado."""
        self._on_step_complete.append(callback)

    def on_step_fail(self, callback: Callable[[StepResult], None]):
        """Registra callback para paso fallido."""
        self._on_step_fail.append(callback)

    def on_plan_complete(self, callback: Callable[[ExecutionPlan], None]):
        """Registra callback para plan completado."""
        self._on_plan_complete.append(callback)

    def create_plan(self, task: str, estimated_files: int = 0,
                    estimated_hours: float = 0) -> ExecutionPlan:
        """
        Crea un plan de ejecución.

        Args:
            task: Descripción de la tarea
            estimated_files: Archivos estimados
            estimated_hours: Horas estimadas

        Returns:
            Plan de ejecución
        """
        if not self.orchestrator:
            raise RuntimeError("Orchestrator not available")

        # Obtener plan del orquestador
        orch_plan = self.orchestrator.plan(task, estimated_files, estimated_hours)

        # Crear plan de ejecución
        plan = ExecutionPlan(
            id=orch_plan["id"],
            task=task,
            scale=TaskScale(orch_plan["scale"]),
            steps=orch_plan["execution_order"]
        )

        self.current_plan = plan
        self._save_checkpoint(plan)

        return plan

    def execute_plan(self, plan: ExecutionPlan = None,
                     dry_run: bool = False) -> ExecutionPlan:
        """
        Ejecuta un plan de forma autónoma.

        Args:
            plan: Plan a ejecutar (usa current_plan si no se proporciona)
            dry_run: Si True, simula la ejecución sin ejecutar realmente

        Returns:
            Plan con resultados
        """
        plan = plan or self.current_plan
        if not plan:
            raise ValueError("No plan available")

        plan.status = ExecutionStatus.RUNNING
        plan.started_at = datetime.now().isoformat()

        # Emitir evento de inicio
        if self.event_bus and emit:
            emit(EventType.WORKFLOW_STARTED, {
                "plan_id": plan.id,
                "task": plan.task,
                "steps": len(plan.steps)
            }, "agent_executor")

        try:
            # Ejecutar cada paso
            for i, step in enumerate(plan.steps):
                plan.current_step_index = i

                # Obtener agente para el paso
                agent = WorkflowGraph.get_agent_for_node(step)
                agent_name = agent.value if agent else step

                # Ejecutar paso
                result = self._execute_step(step, agent_name, dry_run)
                plan.results.append(result)

                # Verificar si falló
                if result.status == ExecutionStatus.FAILED:
                    plan.status = ExecutionStatus.FAILED
                    self._emit_plan_fail(plan)
                    break

                # Guardar checkpoint
                self._save_checkpoint(plan)

            # Si todos los pasos completaron
            if plan.status != ExecutionStatus.FAILED:
                plan.status = ExecutionStatus.COMPLETED
                plan.completed_at = datetime.now().isoformat()
                self._emit_plan_complete(plan)

        except Exception as e:
            plan.status = ExecutionStatus.FAILED
            self._emit_plan_fail(plan, str(e))

        self._save_checkpoint(plan)
        return plan

    def _execute_step(self, step: str, agent_name: str,
                      dry_run: bool = False) -> StepResult:
        """
        Ejecuta un paso individual con reintentos.

        Args:
            step: Nombre del paso
            agent_name: Nombre del agente
            dry_run: Si simular

        Returns:
            Resultado del paso
        """
        result = StepResult(
            step=step,
            agent=agent_name,
            status=ExecutionStatus.RUNNING,
            started_at=datetime.now().isoformat()
        )

        # Notificar callbacks
        for cb in self._on_step_start:
            try:
                cb(step, agent_name)
            except Exception:
                pass

        # Emitir evento
        if self.event_bus and emit:
            emit(EventType.WORKFLOW_STEP_STARTED, {
                "step": step,
                "agent": agent_name
            }, "agent_executor")

        # Intentar ejecutar con reintentos
        for attempt in range(self.max_retries + 1):
            try:
                if dry_run:
                    # Simular ejecución
                    time.sleep(0.1)
                    artifacts = {"simulated": True, "step": step}
                else:
                    # Ejecutar realmente
                    artifacts = self._invoke_agent(agent_name, step)

                # Éxito
                result.status = ExecutionStatus.COMPLETED
                result.artifacts = artifacts
                result.completed_at = datetime.now().isoformat()
                result.duration_seconds = self._calculate_duration(
                    result.started_at, result.completed_at
                )

                # Notificar éxito
                for cb in self._on_step_complete:
                    try:
                        cb(result)
                    except Exception:
                        pass

                # Emitir evento
                if self.event_bus and emit:
                    emit(EventType.WORKFLOW_STEP_COMPLETED, {
                        "step": step,
                        "agent": agent_name,
                        "duration": result.duration_seconds
                    }, "agent_executor")

                # Marcar paso completado en orquestador
                if self.orchestrator:
                    self.orchestrator.complete_step(step, artifacts)

                return result

            except Exception as e:
                result.retries += 1
                result.errors.append(f"Attempt {attempt + 1}: {str(e)}")

                if attempt < self.max_retries:
                    result.status = ExecutionStatus.RETRYING
                    time.sleep(self.retry_delay)
                else:
                    result.status = ExecutionStatus.FAILED
                    result.completed_at = datetime.now().isoformat()

                    # Notificar fallo
                    for cb in self._on_step_fail:
                        try:
                            cb(result)
                        except Exception:
                            pass

        return result

    def _invoke_agent(self, agent_name: str, step: str,
                      task_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Invoca un agente para ejecutar un paso REAL via Claude CLI.

        Args:
            agent_name: Nombre del agente
            step: Paso a ejecutar
            task_context: Contexto adicional de la tarea

        Returns:
            Artefactos producidos
        """
        start_time = datetime.now()

        # Obtener información del agente
        agent_info = None
        if self.orchestrator:
            agent_info = self.orchestrator.agents.get(agent_name)

        if not agent_info:
            # Intentar construir path del agente
            agent_file = self.root / "agentes" / f"{agent_name}.md"
            if not agent_file.exists():
                raise ValueError(f"Agent not found: {agent_name}")

        # === EJECUCIÓN REAL VIA CLAUDE CLI ===
        if self.use_claude_cli and self.claude_runner:
            return self._invoke_agent_via_cli(
                agent_name, step, task_context, agent_info
            )

        # === FALLBACK: Simulación si Claude CLI no disponible ===
        return self._invoke_agent_simulated(agent_name, step, agent_info, start_time)

    def _invoke_agent_via_cli(
        self,
        agent_name: str,
        step: str,
        task_context: Optional[Dict[str, Any]],
        agent_info: Optional[Any]
    ) -> Dict[str, Any]:
        """
        Ejecuta el agente REALMENTE via Claude CLI.

        Args:
            agent_name: Nombre del agente
            step: Paso/tarea a ejecutar
            task_context: Contexto de la tarea
            agent_info: Información del agente

        Returns:
            Artefactos producidos
        """
        start_time = datetime.now()

        # Construir contexto completo
        context = {
            "step": step,
            "current_directory": str(self.root),
            "timestamp": start_time.isoformat()
        }
        if task_context:
            context.update(task_context)

        # Construir prompt de tarea
        if self.current_plan:
            task_prompt = f"""
Ejecuta el paso '{step}' de la tarea: {self.current_plan.task}

Escala: {self.current_plan.scale.value}
Paso actual: {self.current_plan.current_step_index + 1}/{len(self.current_plan.steps)}
Pasos completados: {[r.step for r in self.current_plan.results if r.status == ExecutionStatus.COMPLETED]}

INSTRUCCIONES:
1. Lee las instrucciones del agente {agent_name} en agentes/{agent_name}.md
2. Ejecuta la tarea según tu rol
3. Reporta los cambios realizados
4. Lista los archivos modificados/creados
"""
        else:
            task_prompt = f"Ejecuta el paso: {step}"

        try:
            # Invocar via Claude CLI
            response = self.claude_runner.run_agent(
                agent_name=agent_name,
                task=task_prompt,
                context=context
            )

            execution_time = (datetime.now() - start_time).total_seconds()

            # Registrar en self-healing
            success = response.status == InvocationStatus.SUCCESS
            self.self_healing.record_execution(success, execution_time)

            if success:
                return {
                    "agent": agent_name,
                    "agent_file": agent_info.file_path if agent_info else f"agentes/{agent_name}.md",
                    "step": step,
                    "executed_at": start_time.isoformat(),
                    "completed_at": datetime.now().isoformat(),
                    "execution_time": execution_time,
                    "status": "executed",
                    "mode": "claude_cli",
                    "response_preview": response.response[:500] if response.response else "",
                    "session_id": response.session_id
                }
            else:
                raise RuntimeError(f"Claude CLI error: {response.error}")

        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            self.self_healing.record_execution(False, execution_time)

            # Intentar recuperación
            recovery = self.self_healing.suggest_recovery(
                error_type="execution_error",
                context={"agent": agent_name, "step": step, "error": str(e)}
            )

            if recovery.get("action") == "retry":
                raise  # Dejar que el retry externo maneje
            elif recovery.get("action") == "fallback":
                # Usar simulación como fallback
                return self._invoke_agent_simulated(
                    agent_name, step, agent_info, start_time
                )
            else:
                raise

    def _invoke_agent_simulated(
        self,
        agent_name: str,
        step: str,
        agent_info: Optional[Any],
        start_time: datetime
    ) -> Dict[str, Any]:
        """
        Simulación de ejecución (fallback cuando Claude CLI no disponible).

        Args:
            agent_name: Nombre del agente
            step: Paso a ejecutar
            agent_info: Información del agente
            start_time: Tiempo de inicio

        Returns:
            Artefactos simulados
        """
        time.sleep(0.1)  # Simular algo de trabajo
        execution_time = (datetime.now() - start_time).total_seconds()

        return {
            "agent": agent_name,
            "agent_file": agent_info.file_path if agent_info else f"agentes/{agent_name}.md",
            "step": step,
            "executed_at": start_time.isoformat(),
            "completed_at": datetime.now().isoformat(),
            "execution_time": execution_time,
            "status": "simulated",
            "mode": "simulation",
            "warning": "Claude CLI no disponible - ejecución simulada"
        }

    def _calculate_duration(self, start: str, end: str) -> float:
        """Calcula duración en segundos."""
        start_dt = datetime.fromisoformat(start)
        end_dt = datetime.fromisoformat(end)
        return (end_dt - start_dt).total_seconds()

    def _save_checkpoint(self, plan: ExecutionPlan):
        """Guarda checkpoint del plan."""
        checkpoint_file = self.checkpoints_dir / f"{plan.id}.json"
        checkpoint_data = {
            "id": plan.id,
            "task": plan.task,
            "scale": plan.scale.value,
            "steps": plan.steps,
            "current_step_index": plan.current_step_index,
            "status": plan.status.value,
            "results": [
                {
                    "step": r.step,
                    "agent": r.agent,
                    "status": r.status.value,
                    "started_at": r.started_at,
                    "completed_at": r.completed_at,
                    "duration_seconds": r.duration_seconds,
                    "artifacts": r.artifacts,
                    "errors": r.errors,
                    "retries": r.retries
                }
                for r in plan.results
            ],
            "started_at": plan.started_at,
            "completed_at": plan.completed_at,
            "total_retries": plan.total_retries,
            "checkpoint_at": datetime.now().isoformat()
        }

        with open(checkpoint_file, 'w', encoding='utf-8') as f:
            json.dump(checkpoint_data, f, indent=2, ensure_ascii=False)

    def load_checkpoint(self, plan_id: str) -> Optional[ExecutionPlan]:
        """Carga un checkpoint existente."""
        checkpoint_file = self.checkpoints_dir / f"{plan_id}.json"
        if not checkpoint_file.exists():
            return None

        with open(checkpoint_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        plan = ExecutionPlan(
            id=data["id"],
            task=data["task"],
            scale=TaskScale(data["scale"]),
            steps=data["steps"],
            current_step_index=data["current_step_index"],
            status=ExecutionStatus(data["status"]),
            started_at=data.get("started_at"),
            completed_at=data.get("completed_at"),
            total_retries=data.get("total_retries", 0)
        )

        # Restaurar resultados
        for r_data in data.get("results", []):
            result = StepResult(
                step=r_data["step"],
                agent=r_data["agent"],
                status=ExecutionStatus(r_data["status"]),
                started_at=r_data["started_at"],
                completed_at=r_data.get("completed_at"),
                duration_seconds=r_data.get("duration_seconds", 0),
                artifacts=r_data.get("artifacts", {}),
                errors=r_data.get("errors", []),
                retries=r_data.get("retries", 0)
            )
            plan.results.append(result)

        return plan

    def resume_plan(self, plan_id: str) -> Optional[ExecutionPlan]:
        """
        Resume un plan desde el último checkpoint.

        Args:
            plan_id: ID del plan

        Returns:
            Plan resumido o None si no existe
        """
        plan = self.load_checkpoint(plan_id)
        if not plan:
            return None

        if plan.status in [ExecutionStatus.COMPLETED, ExecutionStatus.CANCELLED]:
            return plan

        # Continuar desde donde se quedó
        remaining_steps = plan.steps[plan.current_step_index:]
        plan.steps = remaining_steps
        plan.current_step_index = 0

        return self.execute_plan(plan)

    def _emit_plan_complete(self, plan: ExecutionPlan):
        """Emite evento de plan completado."""
        if self.event_bus and emit:
            emit(EventType.WORKFLOW_COMPLETED, {
                "plan_id": plan.id,
                "task": plan.task,
                "total_steps": len(plan.steps),
                "duration_seconds": self._calculate_duration(
                    plan.started_at, plan.completed_at
                ) if plan.completed_at else 0
            }, "agent_executor")

        for cb in self._on_plan_complete:
            try:
                cb(plan)
            except Exception:
                pass

    def _emit_plan_fail(self, plan: ExecutionPlan, error: str = None):
        """Emite evento de plan fallido."""
        if self.event_bus and emit:
            emit(EventType.WORKFLOW_FAILED, {
                "plan_id": plan.id,
                "task": plan.task,
                "failed_at_step": plan.current_step_index,
                "error": error
            }, "agent_executor")

    def get_status(self) -> Dict[str, Any]:
        """Obtiene estado del ejecutor."""
        return {
            "current_plan": {
                "id": self.current_plan.id,
                "status": self.current_plan.status.value,
                "progress": f"{self.current_plan.current_step_index}/{len(self.current_plan.steps)}"
            } if self.current_plan else None,
            "max_retries": self.max_retries,
            "checkpoints_dir": str(self.checkpoints_dir),
            "checkpoints_count": len(list(self.checkpoints_dir.glob("*.json")))
        }


# =============================================================================
# PARALLEL EXECUTOR
# =============================================================================

@dataclass
class ParallelTask:
    """Tarea para ejecución paralela."""
    id: str
    agent: str
    step: str
    dependencies: Set[str] = field(default_factory=set)
    status: ExecutionStatus = ExecutionStatus.PENDING
    result: Optional[StepResult] = None


class ParallelExecutor:
    """
    Ejecutor de tareas en paralelo via Claude CLI.

    Permite ejecutar múltiples agentes simultáneamente,
    respetando dependencias entre tareas.

    Características:
    - ThreadPoolExecutor para concurrencia REAL
    - Claude CLI para ejecución de cada agente
    - Dependency graph para orden de ejecución
    - Batch execution por niveles
    - Event emission para tracking
    - Self-healing integrado
    """

    def __init__(self, executor: AgentExecutor = None,
                 max_workers: int = 5,
                 use_claude_cli: bool = True):
        """
        Inicializa el ejecutor paralelo.

        Args:
            executor: Ejecutor base de agentes
            max_workers: Número máximo de workers paralelos
            use_claude_cli: Si usar Claude CLI para ejecución real
        """
        self.executor = executor or AgentExecutor(use_claude_cli=use_claude_cli)
        self.max_workers = max_workers
        self.use_claude_cli = use_claude_cli and CLAUDE_CLI_AVAILABLE
        self.event_bus = get_event_bus() if get_event_bus else None
        self._lock = threading.Lock()
        self._results: Dict[str, StepResult] = {}

        # Cliente Claude CLI directo para ejecución paralela
        self.claude_runner: Optional['ClaudeCLIAgentRunner'] = None
        if self.use_claude_cli and ClaudeCLIAgentRunner:
            try:
                self.claude_runner = ClaudeCLIAgentRunner(self.executor.root)
            except Exception as e:
                print(f"    Advertencia: No se pudo inicializar Claude CLI paralelo: {e}")
                self.use_claude_cli = False

        # Self-healing
        self.self_healing = get_self_healing_manager()

    def execute_parallel(self, tasks: List[ParallelTask],
                        dry_run: bool = False) -> Dict[str, StepResult]:
        """
        Ejecuta múltiples tareas en paralelo respetando dependencias.

        Args:
            tasks: Lista de tareas a ejecutar
            dry_run: Si True, simula la ejecución

        Returns:
            Diccionario de resultados por task_id
        """
        # Organizar tareas por niveles de dependencia
        levels = self._organize_by_dependency_level(tasks)

        print(f"\n{'='*60}")
        print(f"  PARALLEL EXECUTION - {len(tasks)} tasks in {len(levels)} levels")
        print(f"  Max workers: {self.max_workers}")
        print(f"{'='*60}\n")

        # Emitir evento de inicio
        if self.event_bus and emit:
            emit(EventType.WORKFLOW_STARTED, {
                "mode": "parallel",
                "total_tasks": len(tasks),
                "levels": len(levels),
                "max_workers": self.max_workers
            }, "parallel_executor")

        # Ejecutar nivel por nivel
        for level_idx, level_tasks in enumerate(levels):
            print(f"[Level {level_idx + 1}/{len(levels)}] Executing {len(level_tasks)} tasks in parallel...")

            with ThreadPoolExecutor(max_workers=self.max_workers) as pool:
                # Submeter todas las tareas del nivel
                futures: Dict[Future, ParallelTask] = {}

                for task in level_tasks:
                    task.status = ExecutionStatus.RUNNING
                    future = pool.submit(
                        self._execute_single_task,
                        task,
                        dry_run
                    )
                    futures[future] = task

                # Esperar resultados
                for future in as_completed(futures):
                    task = futures[future]
                    try:
                        result = future.result()
                        with self._lock:
                            self._results[task.id] = result
                        task.result = result
                        task.status = result.status

                        status_icon = "✓" if result.status == ExecutionStatus.COMPLETED else "✗"
                        print(f"  {status_icon} {task.agent}: {task.step} ({result.duration_seconds:.2f}s)")

                    except Exception as e:
                        print(f"  ✗ {task.agent}: {task.step} - Error: {e}")
                        task.status = ExecutionStatus.FAILED

            print(f"[Level {level_idx + 1}] Complete\n")

        # Emitir evento de fin
        if self.event_bus and emit:
            completed = sum(1 for r in self._results.values()
                          if r.status == ExecutionStatus.COMPLETED)
            emit(EventType.WORKFLOW_COMPLETED, {
                "mode": "parallel",
                "completed": completed,
                "failed": len(tasks) - completed
            }, "parallel_executor")

        return self._results

    def execute_agents_parallel(self, agents: List[str],
                                task: str,
                                context: Optional[Dict[str, Any]] = None,
                                dry_run: bool = False) -> Dict[str, Any]:
        """
        Ejecuta múltiples agentes en paralelo via Claude CLI.

        Este es el método principal para ejecución paralela REAL.
        Usa el ClaudeCLIAgentRunner directamente para máxima eficiencia.

        Args:
            agents: Lista de nombres de agentes
            task: Tarea común a ejecutar
            context: Contexto compartido
            dry_run: Si simular

        Returns:
            Resultados por agente
        """
        print(f"\n{'='*60}")
        print(f"  PARALLEL EXECUTION - {len(agents)} agents")
        print(f"  Mode: {'Claude CLI' if self.use_claude_cli and not dry_run else 'Simulation'}")
        print(f"  Max workers: {self.max_workers}")
        print(f"{'='*60}\n")

        # === EJECUCIÓN REAL VIA CLAUDE CLI ===
        if self.use_claude_cli and self.claude_runner and not dry_run:
            return self._execute_agents_parallel_cli(agents, task, context)

        # === FALLBACK: Simulación ===
        return self._execute_agents_parallel_simulated(agents, task, context)

    def _execute_agents_parallel_cli(
        self,
        agents: List[str],
        task: str,
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Ejecuta agentes en paralelo REALMENTE via Claude CLI.

        Args:
            agents: Lista de agentes
            task: Tarea a ejecutar
            context: Contexto compartido

        Returns:
            Resultados de ejecución
        """
        start_time = datetime.now()

        # Usar el método run_agents_parallel del ClaudeCLIAgentRunner
        results = self.claude_runner.run_agents_parallel(
            agents=agents,
            task=task,
            context=context,
            max_workers=self.max_workers
        )

        execution_time = (datetime.now() - start_time).total_seconds()

        # Procesar resultados
        processed_results = {}
        completed = 0
        failed = 0

        for agent_name, response in results.items():
            success = response.status == InvocationStatus.SUCCESS
            if success:
                completed += 1
            else:
                failed += 1

            # Registrar en self-healing
            self.self_healing.record_execution(success, response.execution_time)

            processed_results[agent_name] = {
                "status": "completed" if success else "failed",
                "execution_time": response.execution_time,
                "response_preview": response.response[:200] if response.response else "",
                "error": response.error,
                "mode": "claude_cli"
            }

            status_icon = "✓" if success else "✗"
            print(f"  {status_icon} {agent_name}: {response.execution_time:.2f}s")

        print(f"\n  Completed: {completed}/{len(agents)}")
        print(f"  Failed: {failed}/{len(agents)}")
        print(f"  Total time: {execution_time:.2f}s")
        print(f"{'='*60}\n")

        return {
            "task": task,
            "mode": "parallel_claude_cli",
            "total_agents": len(agents),
            "completed": completed,
            "failed": failed,
            "total_execution_time": execution_time,
            "results": processed_results,
            "health_status": self.self_healing.get_health_status().value
        }

    def _execute_agents_parallel_simulated(
        self,
        agents: List[str],
        task: str,
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Simulación de ejecución paralela (fallback).

        Args:
            agents: Lista de agentes
            task: Tarea
            context: Contexto

        Returns:
            Resultados simulados
        """
        tasks = [
            ParallelTask(
                id=f"task_{agent}_{i}",
                agent=agent,
                step=f"execute_{agent}",
                dependencies=set()
            )
            for i, agent in enumerate(agents)
        ]

        step_results = self.execute_parallel(tasks, dry_run=True)

        return {
            "task": task,
            "mode": "simulation",
            "total_agents": len(agents),
            "completed": len([r for r in step_results.values() if r.status == ExecutionStatus.COMPLETED]),
            "failed": len([r for r in step_results.values() if r.status == ExecutionStatus.FAILED]),
            "results": {k: {"status": v.status.value, "duration": v.duration_seconds} for k, v in step_results.items()},
            "warning": "Claude CLI no disponible - ejecución simulada"
        }

    def _execute_single_task(self, task: ParallelTask,
                            dry_run: bool = False) -> StepResult:
        """
        Ejecuta una tarea individual.

        Args:
            task: Tarea a ejecutar
            dry_run: Si simular

        Returns:
            Resultado de la ejecución
        """
        # Usar el executor base para ejecutar el paso
        return self.executor._execute_step(task.step, task.agent, dry_run)

    def _organize_by_dependency_level(self,
                                      tasks: List[ParallelTask]) -> List[List[ParallelTask]]:
        """
        Organiza tareas en niveles basados en dependencias.

        Tareas sin dependencias van en nivel 0.
        Tareas que dependen de nivel 0 van en nivel 1, etc.

        Args:
            tasks: Lista de tareas

        Returns:
            Lista de niveles, cada nivel es una lista de tareas
        """
        task_dict = {t.id: t for t in tasks}
        levels: List[List[ParallelTask]] = []
        assigned: Set[str] = set()

        while len(assigned) < len(tasks):
            # Encontrar tareas cuyas dependencias ya fueron asignadas
            level = []
            for task in tasks:
                if task.id in assigned:
                    continue
                if task.dependencies.issubset(assigned):
                    level.append(task)

            if not level:
                # Ciclo o error - agregar todas las restantes
                level = [t for t in tasks if t.id not in assigned]

            levels.append(level)
            assigned.update(t.id for t in level)

        return levels

    def get_results(self) -> Dict[str, Any]:
        """Obtiene resumen de resultados."""
        with self._lock:
            completed = sum(1 for r in self._results.values()
                          if r.status == ExecutionStatus.COMPLETED)
            failed = sum(1 for r in self._results.values()
                        if r.status == ExecutionStatus.FAILED)

            return {
                "total": len(self._results),
                "completed": completed,
                "failed": failed,
                "success_rate": completed / len(self._results) if self._results else 0,
                "results": {
                    k: {
                        "status": v.status.value,
                        "duration": v.duration_seconds,
                        "agent": v.agent
                    }
                    for k, v in self._results.items()
                }
            }


# =============================================================================
# AUTONOMOUS LOOP
# =============================================================================

class AutonomousLoop:
    """
    Bucle de ejecución autónoma estilo Ralph Loop.

    Ejecuta tareas de forma continua hasta completar
    o alcanzar un límite de iteraciones.
    """

    def __init__(self, executor: AgentExecutor = None,
                 max_iterations: int = 100):
        """
        Inicializa el bucle autónomo.

        Args:
            executor: Ejecutor de agentes
            max_iterations: Máximo de iteraciones
        """
        self.executor = executor or AgentExecutor()
        self.max_iterations = max_iterations
        self.running = False
        self.iteration = 0

    def run(self, task: str, estimated_files: int = 0,
            estimated_hours: float = 0) -> ExecutionPlan:
        """
        Ejecuta una tarea de forma autónoma.

        Args:
            task: Descripción de la tarea
            estimated_files: Archivos estimados
            estimated_hours: Horas estimadas

        Returns:
            Plan ejecutado
        """
        self.running = True
        self.iteration = 0

        # Crear plan
        plan = self.executor.create_plan(task, estimated_files, estimated_hours)

        print(f"\n{'='*60}")
        print(f"  AUTONOMOUS LOOP - Starting")
        print(f"{'='*60}")
        print(f"Task: {task}")
        print(f"Scale: {plan.scale.value}")
        print(f"Steps: {len(plan.steps)}")
        print(f"{'='*60}\n")

        # Ejecutar
        while self.running and self.iteration < self.max_iterations:
            self.iteration += 1
            print(f"[Iteration {self.iteration}] Executing plan...")

            plan = self.executor.execute_plan(plan)

            if plan.status == ExecutionStatus.COMPLETED:
                print(f"\n[SUCCESS] Plan completed in {self.iteration} iteration(s)")
                break
            elif plan.status == ExecutionStatus.FAILED:
                # Intentar recuperar
                failed_step = plan.steps[plan.current_step_index] if plan.current_step_index < len(plan.steps) else "unknown"
                print(f"\n[RETRY] Step '{failed_step}' failed, retrying...")

                # Reset para reintentar
                plan.status = ExecutionStatus.PENDING
                continue

        self.running = False

        print(f"\n{'='*60}")
        print(f"  AUTONOMOUS LOOP - Complete")
        print(f"{'='*60}")
        print(f"Status: {plan.status.value}")
        print(f"Iterations: {self.iteration}")
        print(f"{'='*60}\n")

        return plan

    def stop(self):
        """Detiene el bucle."""
        self.running = False


# =============================================================================
# CLI
# =============================================================================

def main():
    """CLI del Agent Executor."""
    import argparse

    parser = argparse.ArgumentParser(description="NXT Agent Executor")
    subparsers = parser.add_subparsers(dest="command")

    # execute
    exec_parser = subparsers.add_parser("execute", help="Ejecutar tarea")
    exec_parser.add_argument("task", help="Descripción de la tarea")
    exec_parser.add_argument("--files", type=int, default=0)
    exec_parser.add_argument("--hours", type=float, default=0)
    exec_parser.add_argument("--dry-run", action="store_true")

    # resume
    resume_parser = subparsers.add_parser("resume", help="Resumir plan")
    resume_parser.add_argument("plan_id", help="ID del plan")

    # status
    subparsers.add_parser("status", help="Ver estado")

    # list-checkpoints
    subparsers.add_parser("checkpoints", help="Listar checkpoints")

    args = parser.parse_args()

    try:
        executor = AgentExecutor()

        if args.command == "execute":
            # Callbacks de ejemplo
            executor.on_step_start(lambda s, a: print(f"  → Starting: {s} ({a})"))
            executor.on_step_complete(lambda r: print(f"  ✓ Completed: {r.step}"))
            executor.on_step_fail(lambda r: print(f"  ✗ Failed: {r.step} - {r.errors}"))

            plan = executor.create_plan(args.task, args.files, args.hours)
            plan = executor.execute_plan(plan, dry_run=args.dry_run)

            print(f"\nExecution Result:")
            print(f"  Status: {plan.status.value}")
            print(f"  Steps completed: {len([r for r in plan.results if r.status == ExecutionStatus.COMPLETED])}/{len(plan.steps)}")

        elif args.command == "resume":
            plan = executor.resume_plan(args.plan_id)
            if plan:
                print(f"Resumed plan: {plan.id}")
                print(f"Status: {plan.status.value}")
            else:
                print(f"Checkpoint not found: {args.plan_id}")

        elif args.command == "status":
            status = executor.get_status()
            print(json.dumps(status, indent=2, ensure_ascii=False))

        elif args.command == "checkpoints":
            checkpoints_dir = executor.checkpoints_dir
            checkpoints = list(checkpoints_dir.glob("*.json"))
            print(f"\nCheckpoints ({len(checkpoints)}):\n")
            for cp in checkpoints:
                print(f"  • {cp.stem}")

        else:
            parser.print_help()

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
