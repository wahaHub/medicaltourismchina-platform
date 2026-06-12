#!/usr/bin/env python3
"""Ops helper for the standalone MedicalTourismChina platform.

This script wraps read-only checks, logs, and deploy commands for:

- frontend-vercel: Vercel
- content-worker: Cloudflare Workers
- content-api: optional Lightsail Docker service
- crm-api: sibling CRM v2 Lightsail API
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = ROOT / "frontend-vercel"
WORKER_DIR = ROOT / "content-worker"
DEFAULT_VERCEL_SCOPE = "medora-beautys-projects"
DEFAULT_VERCEL_PROJECT = "frontend-vercel"
DEFAULT_CF_ACCOUNT_ID = "82cdbf36c265c0d9e4b4e1c6100c26d7"
DEFAULT_CF_WORKER = "medicaltourismchina-content-worker"


def load_dotenv() -> None:
    for env_path in (ROOT / ".env", ROOT / ".env.local"):
        if not env_path.exists():
            continue
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def env(*names: str, default: str | None = None) -> str | None:
    for name in names:
        value = os.environ.get(name)
        if value:
            return value
    return default


def require_env(*names: str) -> str:
    value = env(*names)
    if value:
        return value
    raise SystemExit(f"Missing required environment variable: {' or '.join(names)}")


def printable_cmd(cmd: list[str]) -> str:
    redacted: list[str] = []
    hide_next = False
    for part in cmd:
        if hide_next:
            redacted.append("***")
            hide_next = False
            continue
        redacted.append(part)
        if part in {"--token", "--cf-token", "--vercel-token"}:
            hide_next = True
    return " ".join(redacted)


def command_env(args: argparse.Namespace) -> dict[str, str]:
    merged = os.environ.copy()
    if args.vercel_token:
        merged["VERCEL_TOKEN"] = args.vercel_token
    if args.cf_token:
        merged["CLOUDFLARE_API_TOKEN"] = args.cf_token
    return merged


def run(
    cmd: list[str],
    *,
    cwd: Path = ROOT,
    args: argparse.Namespace,
    capture: bool = False,
) -> str:
    print(f"$ {printable_cmd(cmd)}", flush=True)
    result = subprocess.run(
        cmd,
        cwd=cwd,
        env=command_env(args),
        text=True,
        capture_output=capture,
        check=False,
    )
    if capture:
        if result.stdout:
            print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, end="", file=sys.stderr)
    if result.returncode != 0:
        raise SystemExit(result.returncode)
    return result.stdout or ""


def vercel_token(args: argparse.Namespace) -> str:
    return args.vercel_token or require_env("VERCEL_TOKEN")


def vercel_base(args: argparse.Namespace) -> list[str]:
    cmd = ["npx", "vercel", "--token", vercel_token(args)]
    scope = args.vercel_scope or env("VERCEL_SCOPE", default=DEFAULT_VERCEL_SCOPE)
    if scope:
        cmd += ["--scope", scope]
    return cmd


def cmd_vercel_whoami(args: argparse.Namespace) -> None:
    run(vercel_base(args) + ["whoami"], cwd=FRONTEND_DIR, args=args)


def cmd_vercel_list(args: argparse.Namespace) -> None:
    project = args.project or env("VERCEL_PROJECT", default=DEFAULT_VERCEL_PROJECT)
    cmd = vercel_base(args) + ["ls", project]
    if args.environment:
        cmd += ["--environment", args.environment]
    if args.status:
        cmd += ["--status", args.status]
    run(cmd, cwd=FRONTEND_DIR, args=args)


def cmd_vercel_deploy(args: argparse.Namespace) -> None:
    if not args.skip_build:
        run(["npm", "run", "build"], cwd=FRONTEND_DIR, args=args)
    run(
        vercel_base(args) + ["deploy", "--prod", "--yes", "--archive=tgz"],
        cwd=FRONTEND_DIR,
        args=args,
    )


def cmd_vercel_logs(args: argparse.Namespace) -> None:
    cmd = vercel_base(args) + ["logs", args.deployment]
    if args.json:
        cmd.append("--json")
    run(cmd, cwd=FRONTEND_DIR, args=args)


def cf_token(args: argparse.Namespace) -> str:
    return args.cf_token or require_env("CLOUDFLARE_API_TOKEN", "CF_API_TOKEN")


def cf_account_id(args: argparse.Namespace) -> str:
    return args.cf_account_id or env("CLOUDFLARE_ACCOUNT_ID", "CF_ACCOUNT_ID", default=DEFAULT_CF_ACCOUNT_ID)


def cf_request(
    method: str,
    path: str,
    *,
    args: argparse.Namespace,
    body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4" + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {cf_token(args)}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        payload = error.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Cloudflare API error {error.code}: {payload}") from error


def cmd_cf_token_verify(args: argparse.Namespace) -> None:
    data = cf_request("GET", "/user/tokens/verify", args=args)
    result = data.get("result") or {}
    print(f"Cloudflare token verified: status={result.get('status')} id={result.get('id')}")


def cmd_worker_deploy(args: argparse.Namespace) -> None:
    run(["npm", "run", "check"], cwd=WORKER_DIR, args=args)
    run(["npx", "wrangler", "deploy"], cwd=WORKER_DIR, args=args)


def cmd_worker_deployments(args: argparse.Namespace) -> None:
    account_id = cf_account_id(args)
    worker = args.worker_name or DEFAULT_CF_WORKER
    data = cf_request("GET", f"/accounts/{account_id}/workers/scripts/{worker}/deployments", args=args)
    for deployment in data.get("result", []):
        versions = deployment.get("versions") or []
        version_ids = ",".join(str(version.get("version_id")) for version in versions if version.get("version_id"))
        print(
            f"{deployment.get('created_on')} id={deployment.get('id')} "
            f"source={deployment.get('source')} versions={version_ids}"
        )


def cmd_worker_tail(args: argparse.Namespace) -> None:
    cmd = ["npx", "wrangler", "tail", args.worker_name or DEFAULT_CF_WORKER]
    if args.format:
        cmd += ["--format", args.format]
    if args.sampling_rate:
        cmd += ["--sampling-rate", str(args.sampling_rate)]
    run(cmd, cwd=WORKER_DIR, args=args)


def cmd_content_smoke(args: argparse.Namespace) -> None:
    base = args.base_url or env("CONTENT_API_BASE_URL", default="https://content.medicaltourismchina.health")
    env_vars = command_env(args)
    env_vars["CONTENT_API_BASE_URL"] = base
    print(f"$ CONTENT_API_BASE_URL={base} bash scripts/smoke-content-api.sh", flush=True)
    result = subprocess.run(
        ["bash", "scripts/smoke-content-api.sh"],
        cwd=ROOT,
        env=env_vars,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def ssh_command(user: str, host: str, ssh_key: str | None, remote_command: str) -> list[str]:
    cmd = ["ssh", "-o", "StrictHostKeyChecking=no"]
    if ssh_key:
        cmd += ["-i", str(Path(ssh_key).expanduser())]
    cmd += [f"{user}@{host}", remote_command]
    return cmd


def cmd_content_api_logs(args: argparse.Namespace) -> None:
    if not args.content_api_host:
        raise SystemExit("--content-api-host is required.")
    remote = f"docker logs {args.container}"
    if args.since:
        remote += f" --since {args.since}"
    if args.lines is not None:
        remote += f" --tail {args.lines}"
    if args.follow:
        remote += " --follow"
    run(
        ssh_command(args.content_api_user, args.content_api_host, args.content_api_ssh_key, remote),
        cwd=ROOT,
        args=args,
    )


def cmd_crm_logs(args: argparse.Namespace) -> None:
    crm_repo = Path(args.crm_repo).expanduser().resolve()
    if not args.crm_ssh_key:
        raise SystemExit("--crm-ssh-key is required.")
    cmd = ["python3", "scripts/tail_journalctl.py", "--ssh-key", args.crm_ssh_key]
    if args.since:
        cmd += ["--since", args.since]
    if args.lines is not None:
        cmd += ["--lines", str(args.lines)]
    if args.grep:
        cmd += ["--grep", args.grep]
    if args.priority:
        cmd += ["--priority", args.priority]
    if args.follow:
        cmd.append("--follow")
    run(cmd, cwd=crm_repo, args=args)


def cmd_deploy_platform(args: argparse.Namespace) -> None:
    cmd = ["python3", "scripts/deploy_platform.py", "--targets", args.targets]
    if args.allow_dirty:
        cmd.append("--allow-dirty")
    if args.dry_run:
        cmd.append("--dry-run")
    if args.content_api_host:
        cmd += ["--content-api-host", args.content_api_host]
    if args.content_api_env_file:
        cmd += ["--content-api-env-file", args.content_api_env_file]
    if args.content_api_ssh_key:
        cmd += ["--content-api-ssh-key", args.content_api_ssh_key]
    if args.crm_ssh_key:
        cmd += ["--crm-ssh-key", args.crm_ssh_key]
    if args.crm_allow_dirty:
        cmd.append("--crm-allow-dirty")
    run(cmd, cwd=ROOT, args=args)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="MedicalTourismChina platform ops helper")
    parser.add_argument("--vercel-token", help="Defaults to VERCEL_TOKEN")
    parser.add_argument("--vercel-scope", default=DEFAULT_VERCEL_SCOPE)
    parser.add_argument("--cf-token", help="Defaults to CLOUDFLARE_API_TOKEN or CF_API_TOKEN")
    parser.add_argument("--cf-account-id", default=DEFAULT_CF_ACCOUNT_ID)

    sub = parser.add_subparsers(dest="command", required=True)

    whoami = sub.add_parser("vercel-whoami", help="Verify Vercel token")
    whoami.set_defaults(func=cmd_vercel_whoami)

    vlist = sub.add_parser("vercel-list", help="List Vercel deployments")
    vlist.add_argument("--project", default=DEFAULT_VERCEL_PROJECT)
    vlist.add_argument("--environment", choices=["production", "preview", "development"])
    vlist.add_argument("--status")
    vlist.set_defaults(func=cmd_vercel_list)

    vdeploy = sub.add_parser("vercel-deploy", help="Build and deploy frontend-vercel to Vercel")
    vdeploy.add_argument("--skip-build", action="store_true")
    vdeploy.set_defaults(func=cmd_vercel_deploy)

    vlogs = sub.add_parser("vercel-logs", help="Read Vercel runtime logs for a deployment")
    vlogs.add_argument("deployment")
    vlogs.add_argument("--json", action="store_true")
    vlogs.set_defaults(func=cmd_vercel_logs)

    cfverify = sub.add_parser("cf-token-verify", help="Verify Cloudflare token")
    cfverify.set_defaults(func=cmd_cf_token_verify)

    wdeploy = sub.add_parser("worker-deploy", help="Check and deploy Cloudflare Worker")
    wdeploy.set_defaults(func=cmd_worker_deploy)

    wdeployments = sub.add_parser("worker-deployments", help="List Cloudflare Worker deployments")
    wdeployments.add_argument("--worker-name", default=DEFAULT_CF_WORKER)
    wdeployments.set_defaults(func=cmd_worker_deployments)

    wtail = sub.add_parser("worker-tail", help="Tail Cloudflare Worker logs via wrangler")
    wtail.add_argument("--worker-name", default=DEFAULT_CF_WORKER)
    wtail.add_argument("--format", choices=["json", "pretty"])
    wtail.add_argument("--sampling-rate", type=float)
    wtail.set_defaults(func=cmd_worker_tail)

    smoke = sub.add_parser("content-smoke", help="Smoke-test the content API/Worker")
    smoke.add_argument("--base-url")
    smoke.set_defaults(func=cmd_content_smoke)

    api_logs = sub.add_parser("content-api-logs", help="Read optional content-api Docker logs over SSH")
    api_logs.add_argument("--content-api-host", required=True)
    api_logs.add_argument("--content-api-user", default="ubuntu")
    api_logs.add_argument("--content-api-ssh-key")
    api_logs.add_argument("--container", default="medicaltourismchina-content-api")
    api_logs.add_argument("--since", help='Docker --since value, for example "30m" or "2026-06-07T00:00:00"')
    api_logs.add_argument("--lines", type=int, default=200)
    api_logs.add_argument("--follow", action="store_true")
    api_logs.set_defaults(func=cmd_content_api_logs)

    crm_logs = sub.add_parser("crm-logs", help="Read sibling CRM API journalctl logs")
    crm_logs.add_argument("--crm-repo", default=str(ROOT.parent / "medical-crm-v2"))
    crm_logs.add_argument("--crm-ssh-key", required=True)
    crm_logs.add_argument("--since", default="30")
    crm_logs.add_argument("--lines", type=int, default=200)
    crm_logs.add_argument("--grep")
    crm_logs.add_argument("--priority")
    crm_logs.add_argument("--follow", action="store_true")
    crm_logs.set_defaults(func=cmd_crm_logs)

    platform = sub.add_parser("deploy-platform", help="Delegate to scripts/deploy_platform.py")
    platform.add_argument("--targets", default="frontend")
    platform.add_argument("--allow-dirty", action="store_true")
    platform.add_argument("--dry-run", action="store_true")
    platform.add_argument("--content-api-host")
    platform.add_argument("--content-api-env-file")
    platform.add_argument("--content-api-ssh-key")
    platform.add_argument("--crm-ssh-key")
    platform.add_argument("--crm-allow-dirty", action="store_true")
    platform.set_defaults(func=cmd_deploy_platform)

    return parser


def main() -> None:
    load_dotenv()
    args = build_parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
