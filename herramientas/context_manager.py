#!/usr/bin/env python3
"""
NXT Context Manager - Gestion de Contexto y Checkpoints
========================================================

Herramienta CLI para gestionar el estado persistente del sistema NXT,
previniendo perdida de contexto en sesiones largas.

Uso:
    python context_manager.py checkpoint [mensaje]
    python context_manager.py list
    python context_manager.py show [checkpoint_id]
    python context_manager.py resume [checkpoint_id]
    python context_manager.py clean [--keep N]
    python context_manager.py status
"""

import json
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Any


# Configuracion
NXT_DIR = Path(__file__).parent.parent / ".nxt"
STATE_DIR = NXT_DIR / "state"
CHECKPOINTS_DIR = STATE_DIR / "checkpoints"
SESSIONS_DIR = STATE_DIR / "sessions"
RECOVERY_DIR = STATE_DIR / "recovery"
CURRENT_STATE_FILE = STATE_DIR / "current.json"
CONFIG_FILE = NXT_DIR / "multicontext.config.yaml"

# Crear directorios si no existen
for dir_path in [STATE_DIR, CHECKPOINTS_DIR, SESSIONS_DIR, RECOVERY_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)


class ContextManager:
    """Gestor de contexto y checkpoints para NXT."""

    def __init__(self):
        self.state_dir = STATE_DIR
        self.checkpoints_dir = CHECKPOINTS_DIR
        self.max_checkpoints = 20

    def create_checkpoint(
        self,
        trigger: str = "manual",
        message: str = None,
        state: Dict = None
    ) -> str:
        """Crea un nuevo checkpoint."""
        timestamp = datetime.now()
        checkpoint_id = f"cp_{timestamp.strftime('%Y%m%d_%H%M%S')}"

        # Si no hay estado proporcionado, cargar el actual
        if state is None:
            state = self._load_current_state()

        checkpoint = {
            "checkpoint_id": checkpoint_id,
            "timestamp": timestamp.isoformat(),
            "trigger": trigger,
            "message": message,
            "state": state,
            "summary": self._create_summary(state)
        }

        # Guardar checkpoint
        checkpoint_file = self.checkpoints_dir / f"{checkpoint_id}.json"
        with open(checkpoint_file, "w", encoding="utf-8") as f:
            json.dump(checkpoint, f, indent=2, ensure_ascii=False)

        # Actualizar last_known_good
        recovery_file = RECOVERY_DIR / "last_known_good.json"
        with open(recovery_file, "w", encoding="utf-8") as f:
            json.dump(checkpoint, f, indent=2, ensure_ascii=False)

        # Limpiar checkpoints antiguos
        self._cleanup_old_checkpoints()

        return checkpoint_id

    def list_checkpoints(self, limit: int = 10) -> List[Dict]:
        """Lista los checkpoints disponibles."""
        checkpoints = []

        for cp_file in sorted(self.checkpoints_dir.glob("cp_*.json"), reverse=True):
            try:
                with open(cp_file, "r", encoding="utf-8") as f:
                    cp = json.load(f)
                    checkpoints.append({
                        "id": cp.get("checkpoint_id"),
                        "timestamp": cp.get("timestamp"),
                        "trigger": cp.get("trigger"),
                        "message": cp.get("message"),
                        "summary": cp.get("summary", {}).get("task", "N/A")
                    })
            except Exception as e:
                print(f"Error leyendo {cp_file}: {e}")

            if len(checkpoints) >= limit:
                break

        return checkpoints

    def load_checkpoint(self, checkpoint_id: str = None) -> Optional[Dict]:
        """Carga un checkpoint especifico o el ultimo."""
        if checkpoint_id:
            cp_file = self.checkpoints_dir / f"{checkpoint_id}.json"
        else:
            # Cargar el ultimo
            cp_files = sorted(self.checkpoints_dir.glob("cp_*.json"), reverse=True)
            if not cp_files:
                return None
            cp_file = cp_files[0]

        if not cp_file.exists():
            return None

        with open(cp_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def show_checkpoint(self, checkpoint_id: str = None) -> str:
        """Muestra un checkpoint en formato legible."""
        cp = self.load_checkpoint(checkpoint_id)
        if not cp:
            return "No se encontro el checkpoint"

        output = []
        output.append("=" * 60)
        output.append(f"CHECKPOINT: {cp.get('checkpoint_id')}")
        output.append("=" * 60)
        output.append(f"Timestamp: {cp.get('timestamp')}")
        output.append(f"Trigger: {cp.get('trigger')}")
        if cp.get("message"):
            output.append(f"Mensaje: {cp.get('message')}")
        output.append("")

        summary = cp.get("summary", {})
        if summary:
            output.append("RESUMEN:")
            output.append("-" * 40)
            output.append(f"  Tarea: {summary.get('task', 'N/A')}")
            output.append(f"  Progreso: {summary.get('progress', 'N/A')}")
            output.append(f"  Agente actual: {summary.get('current_agent', 'N/A')}")
            output.append(f"  Siguiente: {summary.get('next_action', 'N/A')}")

            decisions = summary.get("key_decisions", [])
            if decisions:
                output.append(f"  Decisiones: {', '.join(decisions)}")

            files = summary.get("files_created", [])
            if files:
                output.append(f"  Archivos: {len(files)} creados")

        output.append("")
        output.append("INSTRUCCIONES DE RECOVERY:")
        output.append("-" * 40)
        for instruction in cp.get("state", {}).get("recovery_instructions", []):
            output.append(f"  {instruction}")

        return "\n".join(output)

    def resume_from_checkpoint(self, checkpoint_id: str = None) -> Dict:
        """Prepara el estado para resumir desde un checkpoint."""
        cp = self.load_checkpoint(checkpoint_id)
        if not cp:
            return {"success": False, "error": "Checkpoint no encontrado"}

        # Actualizar estado actual
        state = cp.get("state", {})
        self._save_current_state(state)

        # Generar resumen de recovery
        recovery_summary = self._generate_recovery_summary(cp)

        return {
            "success": True,
            "checkpoint_id": cp.get("checkpoint_id"),
            "timestamp": cp.get("timestamp"),
            "recovery_summary": recovery_summary,
            "state": state
        }

    def get_status(self) -> Dict:
        """Obtiene el estado actual del sistema de contexto."""
        checkpoints = list(self.checkpoints_dir.glob("cp_*.json"))
        current_state = self._load_current_state()

        # Calcular tamano total
        total_size = sum(f.stat().st_size for f in checkpoints)

        return {
            "checkpoints_count": len(checkpoints),
            "total_size_kb": round(total_size / 1024, 2),
            "latest_checkpoint": checkpoints[0].stem if checkpoints else None,
            "current_state": {
                "has_state": bool(current_state),
                "task": current_state.get("orchestrator", {}).get("current_task"),
                "phase": current_state.get("orchestrator", {}).get("progress", {}).get("phase")
            } if current_state else None
        }

    def clean_checkpoints(self, keep: int = 5) -> int:
        """Limpia checkpoints antiguos, manteniendo los ultimos N."""
        checkpoints = sorted(self.checkpoints_dir.glob("cp_*.json"), reverse=True)
        deleted = 0

        for cp_file in checkpoints[keep:]:
            cp_file.unlink()
            deleted += 1

        return deleted

    def _load_current_state(self) -> Dict:
        """Carga el estado actual."""
        if CURRENT_STATE_FILE.exists():
            with open(CURRENT_STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _save_current_state(self, state: Dict):
        """Guarda el estado actual."""
        with open(CURRENT_STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)

    def _create_summary(self, state: Dict) -> Dict:
        """Crea un resumen del estado."""
        orchestrator = state.get("orchestrator", {})
        agents = state.get("agents", {})
        artifacts = state.get("artifacts", {})
        decisions = state.get("decisions", [])

        progress = orchestrator.get("progress", {})
        percentage = "N/A"
        if progress.get("total_steps"):
            percentage = f"{(progress.get('step', 0) / progress.get('total_steps')) * 100:.1f}%"

        return {
            "task": orchestrator.get("current_task", "N/A"),
            "progress": percentage,
            "current_agent": agents.get("current", "N/A"),
            "next_action": artifacts.get("pending_files", ["N/A"])[0] if artifacts.get("pending_files") else "N/A",
            "key_decisions": [d.get("value", d.get("answer", "")) for d in decisions[:5]],
            "files_created": artifacts.get("files_created", [])
        }

    def _generate_recovery_summary(self, checkpoint: Dict) -> str:
        """Genera un resumen para recovery."""
        summary = checkpoint.get("summary", {})
        state = checkpoint.get("state", {})

        lines = []
        lines.append("## SESSION RECOVERY SUMMARY")
        lines.append("")
        lines.append(f"### Tarea Principal")
        lines.append(f"{summary.get('task', 'N/A')}")
        lines.append("")
        lines.append(f"### Progreso")
        lines.append(f"- Progreso: {summary.get('progress', 'N/A')}")
        lines.append(f"- Agente actual: {summary.get('current_agent', 'N/A')}")
        lines.append("")
        lines.append(f"### Decisiones Clave")
        for decision in summary.get("key_decisions", []):
            lines.append(f"- {decision}")
        lines.append("")
        lines.append(f"### Archivos Creados")
        for file in summary.get("files_created", []):
            lines.append(f"- {file}")
        lines.append("")
        lines.append(f"### Siguiente Paso")
        lines.append(f"{summary.get('next_action', 'N/A')}")

        return "\n".join(lines)

    def _cleanup_old_checkpoints(self):
        """Limpia checkpoints que excedan el maximo."""
        checkpoints = sorted(self.checkpoints_dir.glob("cp_*.json"), reverse=True)
        for cp_file in checkpoints[self.max_checkpoints:]:
            cp_file.unlink()


def main():
    parser = argparse.ArgumentParser(
        description="NXT Context Manager - Gestion de contexto y checkpoints"
    )

    subparsers = parser.add_subparsers(dest="command", help="Comando a ejecutar")

    # Checkpoint
    cp_parser = subparsers.add_parser("checkpoint", help="Crear un checkpoint")
    cp_parser.add_argument("message", nargs="?", help="Mensaje descriptivo")

    # List
    list_parser = subparsers.add_parser("list", help="Listar checkpoints")
    list_parser.add_argument("--limit", type=int, default=10, help="Limite de resultados")

    # Show
    show_parser = subparsers.add_parser("show", help="Mostrar un checkpoint")
    show_parser.add_argument("checkpoint_id", nargs="?", help="ID del checkpoint")

    # Resume
    resume_parser = subparsers.add_parser("resume", help="Resumir desde checkpoint")
    resume_parser.add_argument("checkpoint_id", nargs="?", help="ID del checkpoint")

    # Clean
    clean_parser = subparsers.add_parser("clean", help="Limpiar checkpoints antiguos")
    clean_parser.add_argument("--keep", type=int, default=5, help="Checkpoints a mantener")

    # Status
    subparsers.add_parser("status", help="Ver estado del sistema")

    args = parser.parse_args()
    manager = ContextManager()

    if args.command == "checkpoint":
        cp_id = manager.create_checkpoint(
            trigger="manual",
            message=args.message
        )
        print(f"✓ Checkpoint creado: {cp_id}")

    elif args.command == "list":
        checkpoints = manager.list_checkpoints(limit=args.limit)
        if not checkpoints:
            print("No hay checkpoints disponibles")
        else:
            print(f"{'ID':<25} {'Timestamp':<25} {'Trigger':<15} {'Tarea'}")
            print("-" * 80)
            for cp in checkpoints:
                print(f"{cp['id']:<25} {cp['timestamp'][:19]:<25} {cp['trigger']:<15} {cp['summary'][:30]}")

    elif args.command == "show":
        print(manager.show_checkpoint(args.checkpoint_id))

    elif args.command == "resume":
        result = manager.resume_from_checkpoint(args.checkpoint_id)
        if result["success"]:
            print("✓ Estado cargado desde checkpoint")
            print(f"  ID: {result['checkpoint_id']}")
            print(f"  Timestamp: {result['timestamp']}")
            print("")
            print(result["recovery_summary"])
        else:
            print(f"✗ Error: {result['error']}")

    elif args.command == "clean":
        deleted = manager.clean_checkpoints(keep=args.keep)
        print(f"✓ Eliminados {deleted} checkpoints antiguos")

    elif args.command == "status":
        status = manager.get_status()
        print("NXT Context Manager Status")
        print("-" * 40)
        print(f"  Checkpoints: {status['checkpoints_count']}")
        print(f"  Tamano total: {status['total_size_kb']} KB")
        print(f"  Ultimo checkpoint: {status['latest_checkpoint']}")
        if status.get("current_state"):
            cs = status["current_state"]
            print(f"  Tarea actual: {cs.get('task', 'N/A')}")
            print(f"  Fase actual: {cs.get('phase', 'N/A')}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
