#!/usr/bin/env python3
"""Deploy MedicalTourismChina platform components from one entrypoint.

Examples:
  python3 scripts/deploy_platform.py --targets frontend
  python3 scripts/deploy_platform.py --targets frontend,content-worker
  python3 scripts/deploy_platform.py --targets crm-api --crm-ssh-key ~/Downloads/LightsailDefaultKey-us-west-2.pem
  python3 scripts/deploy_platform.py --targets all --content-api-env-file ./content-api/.env.prod --content-api-host 1.2.3.4 --crm-ssh-key ~/Downloads/LightsailDefaultKey-us-west-2.pem
"""

from __future__ import annotations

import argparse
import os
import shlex
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = REPO_ROOT / "frontend-vercel"
CONTENT_WORKER_DIR = REPO_ROOT / "content-worker"
CONTENT_API_DIR = REPO_ROOT / "content-api"
DEFAULT_CRM_REPO = REPO_ROOT.parent / "medical-crm-v2"
DEFAULT_CRM_BRANCH = "feature/phase-2bc"
DEFAULT_VERCEL_SCOPE = "medora-beautys-projects"


class DeployError(RuntimeError):
    pass


@dataclass(frozen=True)
class CommandResult:
    stdout: str
    stderr: str


def print_header(title: str) -> None:
    print(f"\n==> {title}", flush=True)


def command_to_text(command: list[str]) -> str:
    return " ".join(shlex.quote(part) for part in command)


def run(
    command: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    dry_run: bool = False,
    capture: bool = False,
) -> CommandResult:
    display_cwd = f" (cwd: {cwd})" if cwd else ""
    print(f"$ {command_to_text(command)}{display_cwd}", flush=True)
    if dry_run:
        return CommandResult(stdout="", stderr="")

    completed = subprocess.run(
        command,
        cwd=str(cwd) if cwd else None,
        env=env,
        text=True,
        capture_output=capture,
        check=False,
    )
    if capture:
        if completed.stdout:
            print(completed.stdout, end="")
        if completed.stderr:
            print(completed.stderr, end="", file=sys.stderr)
    if completed.returncode != 0:
        raise DeployError(f"Command failed with exit {completed.returncode}: {command_to_text(command)}")
    return CommandResult(stdout=completed.stdout or "", stderr=completed.stderr or "")


def require_command(name: str, *, dry_run: bool = False) -> None:
    if dry_run:
        return
    result = subprocess.run(["/usr/bin/env", "bash", "-lc", f"command -v {shlex.quote(name)}"], capture_output=True)
    if result.returncode != 0:
        raise DeployError(f"Required command is missing: {name}")


def parse_targets(raw: str) -> list[str]:
    aliases = {
        "all": ["frontend", "content-worker", "content-api", "crm-api"],
        "worker": ["content-worker"],
        "crm": ["crm-api"],
        "api": ["content-api"],
    }
    valid = {"frontend", "content-worker", "content-api", "crm-api"}
    targets: list[str] = []
    for item in [part.strip() for part in raw.split(",") if part.strip()]:
        expanded = aliases.get(item, [item])
        for target in expanded:
            if target not in valid:
                raise DeployError(f"Unknown target {target!r}. Valid targets: {', '.join(sorted(valid | set(aliases)))}")
            if target not in targets:
                targets.append(target)
    if not targets:
        raise DeployError("No deploy targets selected.")
    return targets


def ensure_clean_repo(repo: Path, *, allow_dirty: bool, dry_run: bool) -> None:
    if allow_dirty:
        return
    result = run(["git", "status", "--short"], cwd=repo, dry_run=dry_run, capture=True)
    if result.stdout.strip():
        raise DeployError(
            f"Refusing to deploy from a dirty worktree: {repo}\n"
            "Use --allow-dirty if this is intentional."
        )


def deploy_frontend(args: argparse.Namespace) -> None:
    require_command("vercel", dry_run=args.dry_run)
    print_header("Deploying frontend to Vercel")
    command = [
        "vercel",
        "deploy",
        "--prod",
        "--yes",
        "--archive=tgz",
        "--scope",
        args.vercel_scope,
    ]
    run(command, cwd=FRONTEND_DIR, dry_run=args.dry_run)


def deploy_content_worker(args: argparse.Namespace) -> None:
    require_command("npm", dry_run=args.dry_run)
    print_header("Checking content-worker syntax")
    run(["npm", "run", "check"], cwd=CONTENT_WORKER_DIR, dry_run=args.dry_run)

    print_header("Deploying content-worker to Cloudflare")
    run(["npm", "run", "deploy"], cwd=CONTENT_WORKER_DIR, dry_run=args.dry_run)


def deploy_content_api(args: argparse.Namespace) -> None:
    if not args.content_api_host:
        raise DeployError("--content-api-host is required for target content-api.")
    if not args.content_api_env_file:
        raise DeployError("--content-api-env-file is required for target content-api.")

    env_file = Path(args.content_api_env_file).expanduser().resolve()
    if not args.dry_run and not env_file.exists():
        raise DeployError(f"Content API env file does not exist: {env_file}")

    require_command("bash", dry_run=args.dry_run)
    print_header("Deploying content-api to Lightsail")
    env = os.environ.copy()
    env["LIGHTSAIL_HOST"] = args.content_api_host
    env["LIGHTSAIL_USER"] = args.content_api_user
    env["LIGHTSAIL_REMOTE_DIR"] = args.content_api_remote_dir
    env["LIGHTSAIL_ENV_FILE"] = str(env_file)
    if args.content_api_ssh_key:
        env["SSH_KEY"] = str(Path(args.content_api_ssh_key).expanduser())
    run(["bash", "scripts/deploy-lightsail.sh"], cwd=CONTENT_API_DIR, env=env, dry_run=args.dry_run)


def deploy_crm_api(args: argparse.Namespace) -> None:
    crm_repo = Path(args.crm_repo).expanduser().resolve()
    if not args.dry_run and not crm_repo.exists():
        raise DeployError(f"CRM repo does not exist: {crm_repo}")
    if not args.crm_ssh_key:
        raise DeployError("--crm-ssh-key is required for target crm-api.")

    require_command("python3", dry_run=args.dry_run)
    print_header("Deploying CRM API")
    command = [
        "python3",
        "scripts/deploy_v2.py",
        "--targets",
        "api",
        "--branch",
        args.crm_branch,
        "--ssh-key",
        str(Path(args.crm_ssh_key).expanduser()),
    ]
    if args.crm_allow_dirty:
        command.append("--allow-dirty")
    run(command, cwd=crm_repo, dry_run=args.dry_run)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Deploy MedicalTourismChina platform components.")
    parser.add_argument(
        "--targets",
        default="frontend",
        help="Comma-separated targets: frontend,content-worker,content-api,crm-api,all. Default: frontend.",
    )
    parser.add_argument("--allow-dirty", action="store_true", help="Allow deploying this platform repo while dirty.")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without executing them.")

    parser.add_argument("--vercel-scope", default=DEFAULT_VERCEL_SCOPE)

    parser.add_argument("--content-api-host", help="Lightsail host/IP for content-api.")
    parser.add_argument("--content-api-user", default="ubuntu")
    parser.add_argument("--content-api-remote-dir", default="/opt/medicaltourismchina-content-api")
    parser.add_argument("--content-api-env-file", help="Local env file copied to content-api remote as .env.")
    parser.add_argument("--content-api-ssh-key", help="SSH key for content-api host.")

    parser.add_argument("--crm-repo", default=str(DEFAULT_CRM_REPO), help="Path to medical-crm-v2 repo.")
    parser.add_argument("--crm-branch", default=DEFAULT_CRM_BRANCH)
    parser.add_argument("--crm-ssh-key", help="SSH key for CRM API Lightsail deploy.")
    parser.add_argument("--crm-allow-dirty", action="store_true", help="Pass --allow-dirty to CRM deploy script.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
      targets = parse_targets(args.targets)
      require_command("git", dry_run=args.dry_run)
      ensure_clean_repo(REPO_ROOT, allow_dirty=args.allow_dirty, dry_run=args.dry_run)

      print_header("Deployment plan")
      print(f"Repo: {REPO_ROOT}")
      print(f"Targets: {', '.join(targets)}")

      for target in targets:
          if target == "frontend":
              deploy_frontend(args)
          elif target == "content-worker":
              deploy_content_worker(args)
          elif target == "content-api":
              deploy_content_api(args)
          elif target == "crm-api":
              deploy_crm_api(args)

      print_header("Deployment complete")
      return 0
    except DeployError as error:
      print(f"ERROR: {error}", file=sys.stderr)
      return 1


if __name__ == "__main__":
    raise SystemExit(main())
