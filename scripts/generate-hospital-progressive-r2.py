#!/usr/bin/env python3
"""
Generate missing progressive hospital image variants in Cloudflare R2.

This script intentionally uses the AWS CLI for R2 access and macOS `sips` for
image resizing, so it can run without installing boto3 or Pillow. WebP output
also requires `cwebp`.
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
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DEFAULT_ENDPOINT_URL = "https://82cdbf36c265c0d9e4b4e1c6100c26d7.r2.cloudflarestorage.com"
DEFAULT_BUCKET = "medicaltourismchina"
DEFAULT_PREFIX = "low/hospitals/"
DEFAULT_WORKDIR = Path("/tmp/medchina-hospital-progressive")
DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable"

VARIANT_SETTINGS = {
    "png": {
        "x1": {"max_dimension": 360},
        "x2": {"max_dimension": 1200},
    },
    "webp": {
        "x1": {"max_dimension": 320, "quality": 45},
        "x2": {"max_dimension": 1000, "quality": 72},
    },
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
    env["AWS_MAX_ATTEMPTS"] = env.get("AWS_MAX_ATTEMPTS", "8")
    env["AWS_RETRY_MODE"] = env.get("AWS_RETRY_MODE", "standard")
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


def variant_key_for(source_key: str, variant: str, output_format: str) -> str:
    path = Path(source_key)
    return f"{path.with_suffix('').as_posix()}_{variant}.{output_format}"


def build_jobs(keys: list[str], output_format: str) -> list[VariantJob]:
    existing = set(keys)
    originals = [key for key in keys if is_hospital_image(key) and not is_variant(key)]
    jobs: list[VariantJob] = []
    for source_key in originals:
        for variant in ("x1", "x2"):
            key = variant_key_for(source_key, variant, output_format)
            if key not in existing:
                jobs.append(VariantJob(source_key=source_key, variant_key=key, variant=variant))
    return jobs


def local_path_for(workdir: Path, key: str) -> Path:
    return workdir / "objects" / key


def key_for_local_path(workdir: Path, path: Path) -> str:
    return path.relative_to(workdir / "objects").as_posix()


def list_local_source_keys(workdir: Path) -> list[str]:
    objects_dir = workdir / "objects"
    if not objects_dir.is_dir():
        raise RuntimeError(f"Local cache objects directory does not exist: {objects_dir}")

    return sorted(
        key_for_local_path(workdir, path)
        for path in objects_dir.rglob("*")
        if path.is_file() and is_hospital_image(key_for_local_path(workdir, path)) and not is_variant(key_for_local_path(workdir, path))
    )


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


def generate_png_variant(source_path: Path, output_path: Path, max_dimension: int, env: dict[str, str]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    run(["sips", "-Z", str(max_dimension), str(source_path), "--out", str(output_path)], env=env, capture=True)


def generate_webp_variant(
    source_path: Path,
    output_path: Path,
    max_dimension: int,
    quality: int,
    env: dict[str, str],
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    resized_path = output_path.with_suffix(".resized.png")
    try:
        run(["sips", "-Z", str(max_dimension), str(source_path), "--out", str(resized_path)], env=env, capture=True)
        run(
            [
                "cwebp",
                "-quiet",
                "-q",
                str(quality),
                str(resized_path),
                "-o",
                str(output_path),
            ],
            env=env,
            capture=True,
        )
    finally:
        resized_path.unlink(missing_ok=True)


def generate_variant(
    source_path: Path,
    output_path: Path,
    variant: str,
    output_format: str,
    env: dict[str, str],
) -> None:
    settings = VARIANT_SETTINGS[output_format][variant]
    if output_format == "webp":
        generate_webp_variant(
            source_path,
            output_path,
            max_dimension=settings["max_dimension"],
            quality=settings["quality"],
            env=env,
        )
        return

    generate_png_variant(source_path, output_path, max_dimension=settings["max_dimension"], env=env)


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
    command = [
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
    ]

    for attempt in range(1, 7):
        try:
            run(command, env=env)
            return
        except subprocess.CalledProcessError:
            if attempt == 6:
                raise
            sleep_seconds = min(2 ** attempt, 30)
            print(
                f"Retrying upload for {variant_key} after {sleep_seconds}s "
                f"(attempt {attempt + 1}/6)",
                file=sys.stderr,
                flush=True,
            )
            time.sleep(sleep_seconds)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate and upload missing R2 hospital progressive image variants.")
    parser.add_argument("--endpoint-url", default=DEFAULT_ENDPOINT_URL)
    parser.add_argument("--bucket", default=DEFAULT_BUCKET)
    parser.add_argument("--prefix", default=DEFAULT_PREFIX)
    parser.add_argument("--workdir", default=str(DEFAULT_WORKDIR))
    parser.add_argument("--cache-control", default=DEFAULT_CACHE_CONTROL)
    parser.add_argument("--format", choices=("png", "webp"), default="webp")
    parser.add_argument(
        "--from-local-cache",
        action="store_true",
        help="Skip R2 listing and generate variants for original hospital images already present in --workdir/objects.",
    )
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if shutil.which("aws") is None:
        print("Missing required command: aws", file=sys.stderr)
        return 2
    if shutil.which("sips") is None:
        print("Missing required command: sips", file=sys.stderr)
        return 2
    if args.format == "webp" and shutil.which("cwebp") is None:
        print("Missing required command for WebP output: cwebp", file=sys.stderr)
        return 2

    env = command_env()
    workdir = Path(args.workdir).expanduser().resolve()
    if args.from_local_cache:
        source_keys = list_local_source_keys(workdir)
        jobs = [
            VariantJob(
                source_key=source_key,
                variant_key=variant_key_for(source_key, variant, args.format),
                variant=variant,
            )
            for source_key in source_keys
            for variant in ("x1", "x2")
        ]
        keys_count = "skipped"
    else:
        keys = list_keys(args.endpoint_url, args.bucket, args.prefix, env)
        jobs = build_jobs(keys, args.format)
        source_keys = sorted({job.source_key for job in jobs})
        keys_count = str(len(keys))

    print(f"Objects under {args.prefix}: {keys_count}")
    print(f"Output format: {args.format}")
    print(f"Sources needing variants: {len(source_keys)}")
    print(f"Missing variant jobs: {len(jobs)}")
    if args.dry_run:
        print(json.dumps([job.__dict__ for job in jobs[:20]], ensure_ascii=False, indent=2))
        return 0

    manifest: dict[str, Any] = {
        "endpoint_url": args.endpoint_url,
        "bucket": args.bucket,
        "prefix": args.prefix,
        "format": args.format,
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
            generate_variant(source_path, output_path, job.variant, args.format, env)
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
