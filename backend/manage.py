#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""

import importlib.util
import os
import subprocess
import sys


def _has_django() -> bool:
    return importlib.util.find_spec("django") is not None


def _run_offline_check() -> int:

    """Syntax-only fallback for restricted environments without Django installed."""
    print("[offline-check] Django não está instalado; executando SOMENTE validações de sintaxe (compileall).")

    return subprocess.call(
        [sys.executable, "-m", "compileall", "-q", "backend/bird", "backend/core"],
        cwd=os.path.dirname(os.path.dirname(__file__)),
    )


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bird.settings")

    if _has_django():
        from django.core.management import execute_from_command_line

        execute_from_command_line(sys.argv)
        return

    command = sys.argv[1] if len(sys.argv) > 1 else ""
    is_offline_check = command in {"check", "offline_check"}
    if is_offline_check:

        raise SystemExit(_run_offline_check())

    raise ImportError(
        "Couldn't import Django. Install backend dependencies first. "
        "In restricted environments, only `python backend/manage.py check` "
        "is supported via offline fallback."
    )


if __name__ == "__main__":
    main()
