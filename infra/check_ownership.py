#!/usr/bin/env python3
"""Reject cross-owned file edits on feature branches.

Usage:
    python scripts/check_ownership.py origin/develop feat/dev1/s2-MVP-004-search
    python scripts/check_ownership.py origin/develop feat/dev2/s2-TEC-04-api-read

For GitHub Actions pass branch name from GITHUB_HEAD_REF; requires fetch-depth: 0.
"""
from __future__ import annotations
import os
import subprocess
import sys


def check(branch: str, files: list[str]) -> list[str]:
    if branch.startswith(("feat/dev1/", "fix/dev1/")):
        return [f for f in files if not (f.startswith("apps/web/") or f.startswith("docs/frontend/"))]
    if branch.startswith(("feat/dev2/", "fix/dev2/", "chore/dev2/")):
        return [f for f in files if f.startswith(("apps/web/", "docs/frontend/"))]
    # Branch names not using conventions are rejected rather than silently bypassing restrictions.
    return [f"Rama fuera de convención: {branch}"]


def main() -> int:
    base = sys.argv[1] if len(sys.argv) > 1 else "origin/develop"
    branch = sys.argv[2] if len(sys.argv) > 2 else os.getenv("GITHUB_HEAD_REF")
    if not branch:
        branch = subprocess.check_output(["git", "branch", "--show-current"], text=True).strip()
    if branch.startswith(("release/", "chore/bootstrap-contract")):
        print(f"Rama de integración especial {branch}: revisión manual de propietarios requerida")
        return 0
    try:
        diff = subprocess.check_output(["git", "diff", "--name-only", f"{base}...HEAD"], text=True)
    except subprocess.CalledProcessError:
        print("No se pudo comparar commits. Asegura fetch-depth: 0 y fetch de develop.", file=sys.stderr)
        return 2
    touched = [p for p in diff.splitlines() if p]
    illegal = check(branch, touched)
    if illegal:
        print("ERROR: edición fuera de propiedad de rama:", file=sys.stderr)
        for path in illegal:
            print(f"  - {path}", file=sys.stderr)
        return 1
    print(f"OK: {len(touched)} rutas pertenecen a {branch}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
