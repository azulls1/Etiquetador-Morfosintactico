#!/usr/bin/env python3
"""
NXT AI Development - MCP Manager
================================
Gestor dinámico de MCP Servers.

Características:
- Habilitación/deshabilitación dinámica de servers
- Mapeo de skills a MCP servers
- Invocación contextual
- Estado de servidores

Versión: 3.6.0
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional, Set
from pathlib import Path
from dataclasses import dataclass, field

try:
    from utils import get_project_root
except ImportError:
    import sys
    sys.path.insert(0, str(Path(__file__).parent))
    from utils import get_project_root

try:
    from event_bus import EventBus, EventType, emit
except ImportError:
    EventBus = None
    EventType = None
    emit = None


@dataclass
class MCPServerInfo:
    """Información de un servidor MCP."""
    name: str
    command: str
    args: List[str] = field(default_factory=list)
    env: Dict[str, str] = field(default_factory=dict)
    enabled: bool = True
    required_env_vars: List[str] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)
    description: str = ""


class MCPManager:
    """
    Gestor de MCP Servers.

    Permite habilitar/deshabilitar servidores dinámicamente
    basado en las necesidades del workflow.
    """

    def __init__(self):
        """Inicializa el MCP Manager."""
        self.root = get_project_root()
        self.mcp_config_path = self.root / ".claude" / "mcp.json"
        self.skill_mcp_mapping_path = self.root / ".nxt" / "skill-mcp-mapping.yaml"

        self.servers: Dict[str, MCPServerInfo] = {}
        self.original_config: Dict[str, Any] = {}
        self.active_servers: Set[str] = set()

        self._load_config()
        self._load_skill_mapping()

    def _load_config(self):
        """Carga la configuración de MCP servers."""
        if not self.mcp_config_path.exists():
            return

        with open(self.mcp_config_path, 'r', encoding='utf-8') as f:
            self.original_config = json.load(f)

        mcp_servers = self.original_config.get("mcpServers", {})

        for name, config in mcp_servers.items():
            # Determinar si está habilitado
            # Servers con "_disabled" en el nombre o comentados están deshabilitados
            enabled = not name.endswith("_disabled") and not name.startswith("_")

            # Extraer variables de entorno requeridas
            env = config.get("env", {})
            required_vars = []
            for key, value in env.items():
                if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
                    var_name = value[2:-1]
                    required_vars.append(var_name)

            self.servers[name] = MCPServerInfo(
                name=name,
                command=config.get("command", ""),
                args=config.get("args", []),
                env=env,
                enabled=enabled,
                required_env_vars=required_vars
            )

            if enabled:
                self.active_servers.add(name)

    def _load_skill_mapping(self):
        """Carga el mapeo skill→MCP."""
        if not self.skill_mcp_mapping_path.exists():
            return

        try:
            import yaml
            with open(self.skill_mcp_mapping_path, 'r', encoding='utf-8') as f:
                mapping = yaml.safe_load(f)

            if mapping and 'skill_mcp' in mapping:
                for skill_name, servers in mapping['skill_mcp'].items():
                    for server_name in servers:
                        if server_name in self.servers:
                            self.servers[server_name].skills.append(skill_name)
        except ImportError:
            pass  # yaml not available

    def get_server(self, name: str) -> Optional[MCPServerInfo]:
        """Obtiene información de un servidor."""
        return self.servers.get(name)

    def list_servers(self, only_enabled: bool = False) -> List[MCPServerInfo]:
        """
        Lista los servidores.

        Args:
            only_enabled: Si True, solo servidores habilitados

        Returns:
            Lista de servidores
        """
        if only_enabled:
            return [s for s in self.servers.values() if s.enabled]
        return list(self.servers.values())

    def list_active(self) -> List[str]:
        """Lista los servidores activos."""
        return list(self.active_servers)

    def enable_server(self, name: str) -> bool:
        """
        Habilita un servidor MCP.

        Args:
            name: Nombre del servidor

        Returns:
            True si se habilitó exitosamente
        """
        if name not in self.servers:
            return False

        server = self.servers[name]

        # Verificar variables de entorno requeridas
        for var in server.required_env_vars:
            if not os.environ.get(var):
                print(f"Warning: Environment variable {var} not set for {name}")

        server.enabled = True
        self.active_servers.add(name)

        # Emitir evento
        if emit:
            emit(EventType.MCP_SERVER_ENABLED, {
                "server": name,
                "skills": server.skills
            }, "mcp_manager")

        return True

    def disable_server(self, name: str) -> bool:
        """
        Deshabilita un servidor MCP.

        Args:
            name: Nombre del servidor

        Returns:
            True si se deshabilitó exitosamente
        """
        if name not in self.servers:
            return False

        self.servers[name].enabled = False
        self.active_servers.discard(name)

        # Emitir evento
        if emit:
            emit(EventType.MCP_SERVER_DISABLED, {
                "server": name
            }, "mcp_manager")

        return True

    def enable_for_skill(self, skill_name: str) -> List[str]:
        """
        Habilita los servidores necesarios para un skill.

        Args:
            skill_name: Nombre del skill

        Returns:
            Lista de servidores habilitados
        """
        enabled = []
        for server in self.servers.values():
            if skill_name in server.skills and not server.enabled:
                if self.enable_server(server.name):
                    enabled.append(server.name)
        return enabled

    def get_servers_for_skill(self, skill_name: str) -> List[MCPServerInfo]:
        """
        Obtiene los servidores asociados a un skill.

        Args:
            skill_name: Nombre del skill

        Returns:
            Lista de servidores
        """
        return [s for s in self.servers.values() if skill_name in s.skills]

    def check_requirements(self, name: str) -> Dict[str, bool]:
        """
        Verifica los requisitos de un servidor.

        Args:
            name: Nombre del servidor

        Returns:
            Dict con el estado de cada requisito
        """
        if name not in self.servers:
            return {}

        server = self.servers[name]
        result = {}

        for var in server.required_env_vars:
            result[var] = bool(os.environ.get(var))

        return result

    def get_status(self) -> Dict[str, Any]:
        """Obtiene el estado del MCP Manager."""
        total = len(self.servers)
        enabled = len([s for s in self.servers.values() if s.enabled])

        return {
            "total_servers": total,
            "enabled_servers": enabled,
            "disabled_servers": total - enabled,
            "active_servers": list(self.active_servers),
            "servers": {
                name: {
                    "enabled": server.enabled,
                    "command": server.command,
                    "skills": server.skills,
                    "requirements_met": all(
                        os.environ.get(var) for var in server.required_env_vars
                    )
                }
                for name, server in self.servers.items()
            }
        }

    def save_config(self):
        """Guarda la configuración actual al archivo MCP."""
        # Crear nueva configuración
        new_config = {"mcpServers": {}}

        for name, server in self.servers.items():
            if server.enabled:
                new_config["mcpServers"][name] = {
                    "command": server.command,
                    "args": server.args,
                    "env": server.env
                }
            else:
                # Guardar deshabilitados con prefijo
                new_config["mcpServers"][f"_{name}_disabled"] = {
                    "command": server.command,
                    "args": server.args,
                    "env": server.env
                }

        # Escribir archivo
        with open(self.mcp_config_path, 'w', encoding='utf-8') as f:
            json.dump(new_config, f, indent=2, ensure_ascii=False)


# =============================================================================
# SKILL-MCP MAPPING HELPERS
# =============================================================================

DEFAULT_SKILL_MCP_MAPPING = {
    "skill_mcp": {
        # Documentos
        "docx": ["filesystem"],
        "pdf": ["filesystem"],
        "pptx": ["filesystem"],
        "xlsx": ["filesystem"],

        # Desarrollo
        "testing": ["filesystem"],
        "code-review": ["github", "filesystem"],
        "security": ["github"],
        "diagrams": ["filesystem"],

        # Integraciones
        "gemini": [],
        "openai": [],
        "mcp": [],
        "webhooks": ["fetch"],

        # GitHub related
        "github": ["github"],
    }
}


def create_default_mapping(root: Path):
    """Crea el archivo de mapeo por defecto."""
    try:
        import yaml
        mapping_path = root / ".nxt" / "skill-mcp-mapping.yaml"
        mapping_path.parent.mkdir(parents=True, exist_ok=True)

        with open(mapping_path, 'w', encoding='utf-8') as f:
            yaml.dump(DEFAULT_SKILL_MCP_MAPPING, f, default_flow_style=False,
                     allow_unicode=True)
        return True
    except ImportError:
        # Fallback to JSON
        mapping_path = root / ".nxt" / "skill-mcp-mapping.json"
        with open(mapping_path, 'w', encoding='utf-8') as f:
            json.dump(DEFAULT_SKILL_MCP_MAPPING, f, indent=2, ensure_ascii=False)
        return True


# =============================================================================
# CLI
# =============================================================================

def main():
    """CLI del MCP Manager."""
    import argparse

    parser = argparse.ArgumentParser(description="NXT MCP Manager")
    subparsers = parser.add_subparsers(dest="command")

    # status
    subparsers.add_parser("status", help="Ver estado de servidores")

    # list
    list_parser = subparsers.add_parser("list", help="Listar servidores")
    list_parser.add_argument("--enabled", action="store_true")

    # enable
    enable_parser = subparsers.add_parser("enable", help="Habilitar servidor")
    enable_parser.add_argument("server", help="Nombre del servidor")

    # disable
    disable_parser = subparsers.add_parser("disable", help="Deshabilitar servidor")
    disable_parser.add_argument("server", help="Nombre del servidor")

    # check
    check_parser = subparsers.add_parser("check", help="Verificar requisitos")
    check_parser.add_argument("server", help="Nombre del servidor")

    # init-mapping
    subparsers.add_parser("init-mapping", help="Crear mapeo skill→MCP por defecto")

    args = parser.parse_args()

    manager = MCPManager()

    if args.command == "status":
        status = manager.get_status()
        print(json.dumps(status, indent=2, ensure_ascii=False))

    elif args.command == "list":
        servers = manager.list_servers(only_enabled=args.enabled)
        print(f"\nMCP Servers ({len(servers)})\n")
        for server in servers:
            status = "✓" if server.enabled else "✗"
            print(f"  [{status}] {server.name}")
            if server.skills:
                print(f"      Skills: {', '.join(server.skills)}")

    elif args.command == "enable":
        if manager.enable_server(args.server):
            print(f"Server '{args.server}' enabled")
        else:
            print(f"Server '{args.server}' not found")

    elif args.command == "disable":
        if manager.disable_server(args.server):
            print(f"Server '{args.server}' disabled")
        else:
            print(f"Server '{args.server}' not found")

    elif args.command == "check":
        reqs = manager.check_requirements(args.server)
        if reqs:
            print(f"\nRequirements for '{args.server}':\n")
            for var, met in reqs.items():
                status = "✓" if met else "✗"
                print(f"  [{status}] {var}")
        else:
            print(f"Server '{args.server}' not found or has no requirements")

    elif args.command == "init-mapping":
        if create_default_mapping(manager.root):
            print("Default skill→MCP mapping created")
        else:
            print("Failed to create mapping")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
