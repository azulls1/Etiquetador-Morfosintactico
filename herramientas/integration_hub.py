#!/usr/bin/env python3
"""
NXT AI Development - Integration Hub
=====================================
Centro de comunicación e integración para todos los componentes del framework.

El Integration Hub es el punto central que:
- Conecta orquestador, agentes, skills, MCP servers
- Gestiona comunicación bidireccional
- Coordina ejecuciones paralelas
- Mantiene estado global sincronizado
- Emite eventos para todos los suscriptores

Versión: 3.6.0
"""

import os
import sys
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable, Set
from pathlib import Path
from enum import Enum
from dataclasses import dataclass, field
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import queue

# Imports del framework
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

try:
    from nxt_orchestrator_v3 import NXTOrchestratorV3, AgentRole, TaskType
except ImportError:
    NXTOrchestratorV3 = None

try:
    from agent_executor import AgentExecutor, ParallelExecutor, ParallelTask
except ImportError:
    AgentExecutor = None
    ParallelExecutor = None


# =============================================================================
# MESSAGE TYPES
# =============================================================================

class MessageType(Enum):
    """Tipos de mensajes del hub."""
    REQUEST = "request"
    RESPONSE = "response"
    BROADCAST = "broadcast"
    NOTIFICATION = "notification"
    COMMAND = "command"
    QUERY = "query"
    ERROR = "error"


@dataclass
class HubMessage:
    """Mensaje del Integration Hub."""
    id: str
    type: MessageType
    source: str
    target: str  # "*" para broadcast
    payload: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    correlation_id: Optional[str] = None  # Para request/response

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type.value,
            "source": self.source,
            "target": self.target,
            "payload": self.payload,
            "timestamp": self.timestamp,
            "correlation_id": self.correlation_id
        }


# =============================================================================
# INTEGRATION HUB
# =============================================================================

class IntegrationHub:
    """
    Centro de integración y comunicación del framework NXT.

    Características:
    - Registro de componentes (orquestador, agentes, skills, MCP)
    - Mensajería entre componentes
    - Ejecución paralela coordinada
    - Estado global sincronizado
    - Event bus integrado
    """

    def __init__(self):
        """Inicializa el Integration Hub."""
        self.root = get_project_root()
        self.config = load_config()

        # Componentes registrados
        self._components: Dict[str, Any] = {}
        self._handlers: Dict[str, List[Callable]] = {}
        self._message_queue: queue.Queue = queue.Queue()
        self._response_queues: Dict[str, queue.Queue] = {}

        # Event Bus
        self.event_bus = get_event_bus() if get_event_bus else None

        # Orchestrator
        self.orchestrator = None
        if NXTOrchestratorV3:
            self.orchestrator = NXTOrchestratorV3()

        # Executor
        self.executor = None
        if AgentExecutor:
            self.executor = AgentExecutor(orchestrator=self.orchestrator)

        # Parallel Executor
        self.parallel_executor = None
        if ParallelExecutor:
            self.parallel_executor = ParallelExecutor(executor=self.executor)

        # Estado
        self._running = False
        self._lock = threading.Lock()
        self._message_counter = 0

        # Registrar componentes base
        self._register_base_components()

    def _register_base_components(self):
        """Registra los componentes base del framework."""
        # Orquestador
        if self.orchestrator:
            self.register_component("orchestrator", self.orchestrator)

        # Agentes
        if self.orchestrator:
            for agent_name in self.orchestrator.agents.list_all():
                self.register_component(f"agent:{agent_name}", {
                    "name": agent_name,
                    "type": "agent"
                })

        # Skills
        if self.orchestrator:
            for skill_name in self.orchestrator.skills.list_all():
                self.register_component(f"skill:{skill_name}", {
                    "name": skill_name,
                    "type": "skill"
                })

    def register_component(self, name: str, component: Any):
        """
        Registra un componente en el hub.

        Args:
            name: Nombre único del componente
            component: Instancia del componente
        """
        with self._lock:
            self._components[name] = component
            self._handlers[name] = []

        # Emitir evento
        if self.event_bus and EventType:
            emit(EventType.HUB_MESSAGE, {
                "action": "component_registered",
                "component": name
            }, "integration_hub")

    def unregister_component(self, name: str):
        """Desregistra un componente."""
        with self._lock:
            if name in self._components:
                del self._components[name]
            if name in self._handlers:
                del self._handlers[name]

    def get_component(self, name: str) -> Optional[Any]:
        """Obtiene un componente por nombre."""
        return self._components.get(name)

    def list_components(self) -> List[str]:
        """Lista todos los componentes registrados."""
        return list(self._components.keys())

    # =========================================================================
    # MESSAGING
    # =========================================================================

    def _generate_message_id(self) -> str:
        """Genera un ID único para mensaje."""
        with self._lock:
            self._message_counter += 1
            return f"msg_{datetime.now().strftime('%Y%m%d%H%M%S')}_{self._message_counter}"

    def send(self, target: str, payload: Dict[str, Any],
             msg_type: MessageType = MessageType.REQUEST,
             source: str = "hub") -> HubMessage:
        """
        Envía un mensaje a un componente.

        Args:
            target: Nombre del componente destino
            payload: Contenido del mensaje
            msg_type: Tipo de mensaje
            source: Componente origen

        Returns:
            Mensaje enviado
        """
        message = HubMessage(
            id=self._generate_message_id(),
            type=msg_type,
            source=source,
            target=target,
            payload=payload
        )

        # Poner en cola
        self._message_queue.put(message)

        # Emitir evento
        if self.event_bus and EventType:
            emit(EventType.HUB_MESSAGE, {
                "message_id": message.id,
                "type": msg_type.value,
                "source": source,
                "target": target
            }, "integration_hub")

        return message

    def broadcast(self, payload: Dict[str, Any],
                  source: str = "hub") -> HubMessage:
        """
        Envía un mensaje a todos los componentes.

        Args:
            payload: Contenido del mensaje
            source: Componente origen

        Returns:
            Mensaje enviado
        """
        return self.send("*", payload, MessageType.BROADCAST, source)

    def request(self, target: str, payload: Dict[str, Any],
                timeout: float = 30.0) -> Optional[Dict[str, Any]]:
        """
        Envía una solicitud y espera respuesta.

        Args:
            target: Componente destino
            payload: Contenido de la solicitud
            timeout: Tiempo máximo de espera

        Returns:
            Respuesta o None si timeout
        """
        message = self.send(target, payload, MessageType.REQUEST)

        # Crear cola de respuesta
        response_queue = queue.Queue()
        self._response_queues[message.id] = response_queue

        try:
            # Esperar respuesta
            response = response_queue.get(timeout=timeout)
            return response
        except queue.Empty:
            return None
        finally:
            del self._response_queues[message.id]

    def respond(self, correlation_id: str, payload: Dict[str, Any]):
        """
        Envía una respuesta a una solicitud.

        Args:
            correlation_id: ID del mensaje original
            payload: Contenido de la respuesta
        """
        if correlation_id in self._response_queues:
            self._response_queues[correlation_id].put(payload)

    def on_message(self, component: str, handler: Callable[[HubMessage], None]):
        """
        Registra un handler para mensajes de un componente.

        Args:
            component: Nombre del componente
            handler: Función a llamar cuando llegue un mensaje
        """
        if component not in self._handlers:
            self._handlers[component] = []
        self._handlers[component].append(handler)

    # =========================================================================
    # PARALLEL EXECUTION
    # =========================================================================

    def execute_parallel(self, agents: List[str],
                        task: str,
                        max_workers: int = 5) -> Dict[str, Any]:
        """
        Ejecuta múltiples agentes en paralelo.

        Esta es la función principal para ejecución paralela coordinada.

        Args:
            agents: Lista de agentes a ejecutar
            task: Descripción de la tarea
            max_workers: Workers máximos

        Returns:
            Resultados de ejecución
        """
        if self.orchestrator:
            return self.orchestrator.execute_parallel(agents, task, max_workers=max_workers)

        # Fallback si no hay orquestador
        if self.parallel_executor:
            return self.parallel_executor.execute_agents_parallel(
                agents, {"task": task}
            )

        return {"error": "No executor available"}

    def execute_workflow_parallel(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta un workflow optimizando pasos paralelos.

        Args:
            plan: Plan de ejecución

        Returns:
            Resultados del workflow
        """
        if not self.orchestrator:
            return {"error": "Orchestrator not available"}

        steps = plan.get("execution_order", [])

        # Obtener grupos paralelos
        parallel_groups = self.orchestrator.can_parallelize(steps)

        results = []
        for i, group in enumerate(parallel_groups):
            print(f"\n[Parallel Group {i+1}/{len(parallel_groups)}]")
            print(f"  Steps: {', '.join(group)}")

            # Ejecutar grupo en paralelo
            if len(group) > 1:
                # Múltiples pasos - ejecutar en paralelo
                agents = []
                for step in group:
                    from nxt_orchestrator_v3 import WorkflowGraph
                    agent = WorkflowGraph.get_agent_for_node(step)
                    if agent:
                        agents.append(agent.value)

                group_result = self.execute_parallel(agents, f"Group {i+1}")
                results.append(group_result)
            else:
                # Paso único - ejecutar secuencialmente
                step = group[0]
                from nxt_orchestrator_v3 import WorkflowGraph
                agent = WorkflowGraph.get_agent_for_node(step)
                if agent:
                    self.orchestrator.delegate(step, variant="default")
                    self.orchestrator.complete_step(step)
                results.append({"step": step, "status": "completed"})

        return {
            "plan_id": plan.get("id"),
            "parallel_groups": len(parallel_groups),
            "results": results
        }

    # =========================================================================
    # COORDINATION
    # =========================================================================

    def coordinate(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Coordina la ejecución de múltiples tareas.

        Analiza dependencias y optimiza ejecución paralela.

        Args:
            tasks: Lista de tareas a coordinar

        Returns:
            Resultados de coordinación
        """
        # Clasificar tareas
        independent = []
        dependent = []

        for task in tasks:
            if not task.get("depends_on"):
                independent.append(task)
            else:
                dependent.append(task)

        results = {
            "independent": [],
            "dependent": [],
            "total": len(tasks)
        }

        # Ejecutar independientes en paralelo
        if independent:
            agents = []
            for t in independent:
                if self.orchestrator:
                    agent = self.orchestrator.delegate(t["task"])
                    agents.append(agent.value)

            if agents:
                parallel_result = self.execute_parallel(
                    agents,
                    "Independent tasks",
                    max_workers=min(len(agents), 5)
                )
                results["independent"] = parallel_result

        # Ejecutar dependientes secuencialmente
        for task in dependent:
            # Verificar que dependencias estén completas
            deps = task.get("depends_on", [])
            # ... verificar deps ...

            if self.orchestrator:
                agent = self.orchestrator.delegate(task["task"])
                results["dependent"].append({
                    "task": task["task"],
                    "agent": agent.value
                })

        return results

    # =========================================================================
    # STATUS & MONITORING
    # =========================================================================

    def get_status(self) -> Dict[str, Any]:
        """Obtiene el estado del hub y todos sus componentes."""
        status = {
            "hub": {
                "version": "3.6.0",
                "running": self._running,
                "components_count": len(self._components),
                "message_count": self._message_counter
            },
            "components": {},
            "orchestrator": None,
            "event_bus": None
        }

        # Estado de componentes
        for name, comp in self._components.items():
            if hasattr(comp, "get_status"):
                status["components"][name] = comp.get_status()
            else:
                status["components"][name] = {"registered": True}

        # Estado del orquestador
        if self.orchestrator:
            status["orchestrator"] = self.orchestrator.get_status()

        # Estado del event bus
        if self.event_bus:
            status["event_bus"] = {
                "subscriptions": self.event_bus.get_subscription_count(),
                "history_size": len(self.event_bus.get_history())
            }

        return status

    def get_communication_map(self) -> Dict[str, Any]:
        """
        Genera un mapa de comunicación entre componentes.

        Returns:
            Mapa de conexiones
        """
        connections = []

        # Orquestador -> Agentes
        if self.orchestrator:
            for agent in self.orchestrator.agents.list_all():
                connections.append({
                    "from": "orchestrator",
                    "to": f"agent:{agent}",
                    "type": "can_invoke"
                })

        # Agentes -> Skills
        if self.orchestrator:
            # Cargar capabilities para ver qué skills usa cada agente
            caps_file = self.root / ".nxt" / "capabilities.yaml"
            if caps_file.exists():
                import yaml
                with open(caps_file, 'r', encoding='utf-8') as f:
                    caps = yaml.safe_load(f)

                agents_caps = caps.get("agents", {})
                for agent, config in agents_caps.items():
                    for skill in config.get("skills", []):
                        connections.append({
                            "from": f"agent:{agent}",
                            "to": f"skill:{skill}",
                            "type": "uses"
                        })

        return {
            "components": self.list_components(),
            "connections": connections,
            "hub_role": "central_coordinator"
        }


# =============================================================================
# GLOBAL HUB INSTANCE
# =============================================================================

_global_hub: Optional[IntegrationHub] = None


def get_hub() -> IntegrationHub:
    """Obtiene la instancia global del Integration Hub."""
    global _global_hub
    if _global_hub is None:
        _global_hub = IntegrationHub()
    return _global_hub


# =============================================================================
# CLI
# =============================================================================

def main():
    """CLI del Integration Hub."""
    import argparse

    parser = argparse.ArgumentParser(description="NXT Integration Hub")
    subparsers = parser.add_subparsers(dest="command")

    # status
    subparsers.add_parser("status", help="Ver estado del hub")

    # components
    subparsers.add_parser("components", help="Listar componentes")

    # map
    subparsers.add_parser("map", help="Ver mapa de comunicación")

    # parallel
    parallel_parser = subparsers.add_parser("parallel", help="Ejecutar agentes en paralelo")
    parallel_parser.add_argument("agents", nargs="+", help="Agentes a ejecutar")
    parallel_parser.add_argument("--task", default="Parallel execution", help="Descripción")

    args = parser.parse_args()

    hub = get_hub()

    if args.command == "status":
        status = hub.get_status()
        print(json.dumps(status, indent=2, ensure_ascii=False))

    elif args.command == "components":
        components = hub.list_components()
        print(f"\nComponents ({len(components)}):\n")
        for comp in sorted(components):
            print(f"  • {comp}")

    elif args.command == "map":
        comm_map = hub.get_communication_map()
        print(json.dumps(comm_map, indent=2, ensure_ascii=False))

    elif args.command == "parallel":
        result = hub.execute_parallel(args.agents, args.task)
        print(json.dumps(result, indent=2, ensure_ascii=False))

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
