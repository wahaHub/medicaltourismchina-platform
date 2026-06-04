#!/usr/bin/env python3
"""
Generate missing progressive hospital image variants in Cloudflare R2.

This script intentionally uses the AWS CLI for R2 access and macOS `sips` for
image resizing, so it can run without installing boto3 or Pillow.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import mimetypes
import os
import shutil
import subprocess
import sys
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DEFAULT_ENDPOINT_URL = "https://82cdbf36c265c0d9e4b4e1c6100c26d7.r2.cloudflarestorage.com"
DEFAULT_BUCKET = "medicaltourismchina"
DEFAULT_PREFIX = "low/hospitals/"
DEFAULT_WORKDIR = Path("/tmp/medchina-hospital-progressive")
DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable"

VARIANT_MAX_DIMENSIONS = {
    "x1": 360,
    "x2": 1200,
}


@dataclass(frozen=True)
class VariantJob:
    source_key: str
    variant_key: str
    variant: str


def command_env() -> dict[str, str]:
    env = os.environ.copy()
    access_key = env.get("R2_ACCESS_KEY_ID") or env.get("AWS_ACCESS_KEY_ID")
    secret_key = env.get("R2_SECRET_ACCESS_KEY") or env.get("AWS_SECRET_ACCESS_KEY")
    if not access_key or not secret_key:
        raise RuntimeError("R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY must be set.")

    env["AWS_ACCESS_KEY_ID"] = access_key
    env["AWS_SECRET_ACCESS_KEY"] = secret_key
    env["AWS_DEFAULT_REGION"] = "auto"
    return env


def run(command: list[str], *, env: dict[str, str], capture: bool = False) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        env=env,
        check=True,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
    )


def list_keys(endpoint_url: str, bucket: str, prefix: str, env: dict[str, str]) -> list[str]:
    output = run(
        [
            "aws",
            "s3api",
            "list-objects-v2",
            "--endpoint-url",
            endpoint_url,
            "--bucket",
            bucket,
            "--prefix",
            prefix,
            "--output",
            "json",
        ],
        env=env,
        capture=True,
    ).stdout
    payload = json.loads(output)
    return sorted(item["Key"] for item in payload.get("Contents", []))


def is_hospital_image(key: str) -> bool:
    return key.startswith(("low/hospitals/public/", "low/hospitals/private/")) and key.lower().endswith(
        (".png", ".jpg", ".jpeg", ".webp")
    )


def is_variant(key: str) -> bool:
    stem = Path(key).stem.lower()
    return stem.endswith(("_x1", "_x2", "_x3"))


def variant_key_for(source_key: str, variant: str) -> str:
    path = Path(source_key)
    return f"{path.with_suffix('').as_posix()}_{variant}{path.suffix}"


def build_jobs(keys: list[str]) -> list[VariantJob]:
    existing = set(keys)
    originals = [key for key in keys if is_hospital_image(key) and not is_variant(key)]
    jobs: list[VariantJob] = []
    for source_key in originals:
        for variant in ("x1", "x2"):
            key = variant_key_for(source_key, variant)
            if key not in existing:
                jobs.append(VariantJob(source_key=source_key, variant_key=key, variant=variant))
    return jobs


def local_path_for(workdir: Path, key: str) -> Path:
    return workdir / "objects" / key


def download_source(endpoint_url: str, bucket: str, source_key: str, path: Path, env: dict[str, str]) -> None:
    if path.exists() and path.stat().st_size > 0:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "aws",
            "s3",
            "cp",
            f"s3://{bucket}/{source_key}",
            str(path),
            "--endpoint-url",
            endpoint_url,
            "--only-show-errors",
        ],
        env=env,
    )


def generate_variant(source_path: Path, output_path: Path, max_dimension: int, env: dict[str, str]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    run(["sips", "-Z", str(max_dimension), str(source_path), "--out", str(output_path)], env=env, capture=True)


def content_type_for(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(path.name)
    return guessed or "application/octet-stream"


def upload_variant(
    endpoint_url: str,
    bucket: str,
    local_path: Path,
    variant_key: str,
    cache_control: str,
    env: dict[str, str],
) -> None:
    run(
        [
            "aws",
            "s3",
            "cp",
            str(local_path),
            f"s3://{bucket}/{variant_key}",
            "--endpoint-url",
            endpoint_url,
            "--only-show-errors",
            "--content-type",
            content_type_for(local_path),
            "--cache-control",
            cache_control,
        ],
        env=env,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate and upload missing R2 hospital progressive image variants.")
    parser.add_argument("--endpoint-url", default=DEFAULT_ENDPOINT_URL)
    parser.add_argument("--bucket", default=DEFAULT_BUCKET)
    parser.add_argument("--prefix", default=DEFAULT_PREFIX)
    parser.add_argument("--workdir", default=str(DEFAULT_WORKDIR))
    parser.add_argument("--cache-control", default=DEFAULT_CACHE_CONTROL)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if shutil.which("aws") is None:
        print("Missing required command: aws", file=sys.stderr)
        return 2
    if shutil.which("sips") is None:
        print("Missing required command: sips", file=sys.stderr)
        return 2

    env = command_env()
    workdir = Path(args.workdir).expanduser().resolve()
    keys = list_keys(args.endpoint_url, args.bucket, args.prefix, env)
    jobs = build_jobs(keys)
    source_keys = sorted({job.source_key for job in jobs})

    print(f"Objects under {args.prefix}: {len(keys)}")
    print(f"Sources needing variants: {len(source_keys)}")
    print(f"Missing variant jobs: {len(jobs)}")
    if args.dry_run:
        print(json.dumps([job.__dict__ for job in jobs[:20]], ensure_ascii=False, indent=2))
        return 0

    manifest: dict[str, Any] = {
        "endpoint_url": args.endpoint_url,
        "bucket": args.bucket,
        "prefix": args.prefix,
        "workdir": str(workdir),
        "jobs": [],
    }
    manifest_lock = threading.Lock()
    progress_lock = threading.Lock()
    completed_sources = 0

    jobs_by_source = {source_key: [job for job in jobs if job.source_key == source_key] for source_key in source_keys}

    def process_source(source_key: str) -> list[dict[str, Any]]:
        source_path = local_path_for(workdir, source_key)
        download_source(args.endpoint_url, args.bucket, source_key, source_path, env)
        completed_jobs: list[dict[str, Any]] = []

        for job in jobs_by_source[source_key]:
            output_path = local_path_for(workdir, job.variant_key)
            generate_variant(source_path, output_path, VARIANT_MAX_DIMENSIONS[job.variant], env)
            upload_variant(args.endpoint_url, args.bucket, output_path, job.variant_key, args.cache_control, env)
            completed_jobs.append(
                {
                    "source_key": source_key,
                    "variant_key": job.variant_key,
                    "variant": job.variant,
                    "bytes": output_path.stat().st_size,
                }
            )
        return completed_jobs

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        future_to_source = {executor.submit(process_source, source_key): source_key for source_key in source_keys}
        for future in concurrent.futures.as_completed(future_to_source):
            source_key = future_to_source[future]
            try:
                completed_jobs = future.result()
            except Exception as error:
                print(f"FAILED {source_key}: {error}", file=sys.stderr, flush=True)
                raise

            with manifest_lock:
                manifest["jobs"].extend(completed_jobs)
                uploaded_count = len(manifest["jobs"])
            with progress_lock:
                completed_sources += 1
                if completed_sources == 1 or completed_sources % 25 == 0 or completed_sources == len(source_keys):
                    print(
                        f"[{completed_sources}/{len(source_keys)}] processed sources, uploaded variants={uploaded_count}",
                        flush=True,
                    )

    manifest_path = workdir / "manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
