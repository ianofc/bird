#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""

import importlib.util
import os
import subprocess
import sys


def _has_django() -> bool:
    return importlib.util.find_spec("django") is not None


def _run_offline_check() -> int:
    """Fallback check for restricted environments without Django installed."""
    print("[offline-check] Django não está instalado; executando validações de sintaxe.")
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

    is_check_command = len(sys.argv) > 1 and sys.argv[1] == "check"
    if is_check_command:
        raise SystemExit(_run_offline_check())

    raise ImportError(
        "Couldn't import Django. Install backend dependencies first. "
        "In restricted environments, only `python backend/manage.py check` "
        "is supported via offline fallback."
    )


if __name__ == "__main__":
    main()
