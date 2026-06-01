#!/usr/bin/env python3
"""
Upload the generated low-resolution asset backup to Cloudflare R2.

Default source:
  /Users/haowang/Desktop/medora-health-beauty/medical-china-comb/generated/s3_images_backup/low

Default target:
  https://82cdbf36c265c0d9e4b4e1c6100c26d7.r2.cloudflarestorage.com/medicaltourismchina

Required environment variables:
  R2_ACCESS_KEY_ID or AWS_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY or AWS_SECRET_ACCESS_KEY

Install dependency if needed:
  python3 -m pip install boto3
"""

from __future__ import annotations

import argparse
import concurrent.futures
import mimetypes
import os
import sys
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse

ClientError: Any = None


DEFAULT_TARGET_URL = "https://82cdbf36c265c0d9e4b4e1c6100c26d7.r2.cloudflarestorage.com/medicaltourismchina"
DEFAULT_SOURCE_DIR = (
    Path("/Users/haowang/Desktop/medora-health-beauty/medical-china-comb")
    / "generated"
    / "s3_images_backup"
    / "low"
)

DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable"


@dataclass(frozen=True)
class R2Target:
    endpoint_url: str
    bucket: str


@dataclass(frozen=True)
class UploadItem:
    local_path: Path
    object_key: str
    size: int


class Progress:
    def __init__(self, total_files: int, total_bytes: int) -> None:
        self.total_files = total_files
        self.total_bytes = total_bytes
        self.done_files = 0
        self.done_bytes = 0
        self.skipped_files = 0
        self.failed_files = 0
        self.started_at = time.time()
        self._lock = threading.Lock()

    def mark_done(self, item: UploadItem, status: str) -> None:
        with self._lock:
            self.done_files += 1
            if status == "uploaded":
                self.done_bytes += item.size
            elif status == "skipped":
                self.skipped_files += 1
            elif status == "failed":
                self.failed_files += 1

            if self.done_files == 1 or self.done_files % 100 == 0 or self.done_files == self.total_files:
                elapsed = max(time.time() - self.started_at, 0.001)
                mib = self.done_bytes / (1024 * 1024)
                rate = mib / elapsed
                print(
                    f"[{self.done_files}/{self.total_files}] "
                    f"uploaded={mib:.1f} MiB skipped={self.skipped_files} "
                    f"failed={self.failed_files} rate={rate:.1f} MiB/s",
                    flush=True,
                )


def parse_target_url(target_url: str, bucket_arg: str | None) -> R2Target:
    parsed = urlparse(target_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError(f"Invalid R2 target URL: {target_url}")

    path_parts = [part for part in parsed.path.split("/") if part]
    bucket = bucket_arg or (path_parts[0] if path_parts else "")
    if not bucket:
        raise ValueError("Bucket is required. Pass --bucket or include it in the target URL path.")

    return R2Target(endpoint_url=f"{parsed.scheme}://{parsed.netloc}", bucket=bucket)


def iter_upload_items(source_dir: Path, prefix: str) -> Iterable[UploadItem]:
    normalized_prefix = prefix.strip("/")
    for local_path in sorted(source_dir.rglob("*")):
        if not local_path.is_file() or local_path.name == ".DS_Store":
            continue

        relative_key = local_path.relative_to(source_dir).as_posix()
        object_key = f"{normalized_prefix}/{relative_key}" if normalized_prefix else relative_key
        yield UploadItem(local_path=local_path, object_key=object_key, size=local_path.stat().st_size)


def content_type_for(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(path.name)
    return guessed or "application/octet-stream"


def create_s3_client(endpoint_url: str):
    global ClientError
    try:
        import boto3
        from botocore.config import Config
        from botocore.exceptions import ClientError as BotocoreClientError
    except ImportError as error:
        raise RuntimeError("Missing dependency: boto3. Install it with: python3 -m pip install boto3") from error

    ClientError = BotocoreClientError

    access_key = os.environ.get("R2_ACCESS_KEY_ID") or os.environ.get("AWS_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY") or os.environ.get("AWS_SECRET_ACCESS_KEY")
    if not access_key or not secret_key:
        raise RuntimeError(
            "R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY or "
            "AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY must be set for R2 upload."
        )

    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4", retries={"max_attempts": 8, "mode": "standard"}),
    )


def remote_matches(s3, bucket: str, item: UploadItem) -> bool:
    try:
        response = s3.head_object(Bucket=bucket, Key=item.object_key)
    except ClientError as error:
        code = str(error.response.get("Error", {}).get("Code", ""))
        status = int(error.response.get("ResponseMetadata", {}).get("HTTPStatusCode", 0) or 0)
        if code in {"404", "NoSuchKey", "NotFound"} or status == 404:
            return False
        raise

    return int(response.get("ContentLength", -1)) == item.size


def upload_one(
    s3,
    bucket: str,
    item: UploadItem,
    *,
    cache_control: str,
    dry_run: bool,
    skip_existing: bool,
) -> tuple[str, UploadItem, str | None]:
    try:
        if skip_existing and remote_matches(s3, bucket, item):
            return "skipped", item, None

        if dry_run:
            return "uploaded", item, None

        s3.upload_file(
            str(item.local_path),
            bucket,
            item.object_key,
            ExtraArgs={
                "ContentType": content_type_for(item.local_path),
                "CacheControl": cache_control,
            },
        )
        return "uploaded", item, None
    except Exception as error:
        return "failed", item, str(error)


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload generated low-resolution assets to Cloudflare R2.")
    parser.add_argument("--source", default=str(DEFAULT_SOURCE_DIR), help="Local low asset directory.")
    parser.add_argument("--target-url", default=DEFAULT_TARGET_URL, help="R2 endpoint URL, optionally including bucket path.")
    parser.add_argument("--bucket", default=None, help="R2 bucket name. Overrides bucket parsed from --target-url.")
    parser.add_argument("--prefix", default="low", help="Object key prefix in the bucket. Use empty string for bucket root.")
    parser.add_argument("--workers", type=int, default=12, help="Parallel upload workers.")
    parser.add_argument("--cache-control", default=DEFAULT_CACHE_CONTROL, help="Cache-Control header for uploaded objects.")
    parser.add_argument("--no-skip-existing", action="store_true", help="Upload even if remote object with same size exists.")
    parser.add_argument("--dry-run", action="store_true", help="List planned upload count without writing to R2.")
    args = parser.parse_args()

    source_dir = Path(args.source).expanduser().resolve()
    if not source_dir.is_dir():
        print(f"Source directory does not exist: {source_dir}", file=sys.stderr)
        return 2

    target = parse_target_url(args.target_url, args.bucket)
    items = list(iter_upload_items(source_dir, args.prefix))
    total_bytes = sum(item.size for item in items)

    print(f"Source:   {source_dir}")
    print(f"Endpoint: {target.endpoint_url}")
    print(f"Bucket:   {target.bucket}")
    print(f"Prefix:   {args.prefix!r}")
    print(f"Files:    {len(items)}")
    print(f"Size:     {total_bytes / (1024 * 1024 * 1024):.2f} GiB")

    if args.dry_run:
        for item in items[:20]:
            print(f"DRY {item.local_path} -> s3://{target.bucket}/{item.object_key}")
        if len(items) > 20:
            print(f"... {len(items) - 20} more")
        return 0

    s3 = create_s3_client(target.endpoint_url)
    progress = Progress(total_files=len(items), total_bytes=total_bytes)
    failures: list[tuple[UploadItem, str]] = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(args.workers, 1)) as executor:
        futures = [
            executor.submit(
                upload_one,
                s3,
                target.bucket,
                item,
                cache_control=args.cache_control,
                dry_run=False,
                skip_existing=not args.no_skip_existing,
            )
            for item in items
        ]

        for future in concurrent.futures.as_completed(futures):
            status, item, error = future.result()
            progress.mark_done(item, status)
            if error:
                failures.append((item, error))
                print(f"FAILED {item.object_key}: {error}", file=sys.stderr)

    if failures:
        print(f"Upload finished with {len(failures)} failures.", file=sys.stderr)
        return 1

    print("Upload finished successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
