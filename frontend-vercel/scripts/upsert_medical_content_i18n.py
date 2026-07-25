#!/usr/bin/env python3
"""Validate and idempotently upsert Medora i18n workbooks into Supabase.

The default mode is a read-only dry run. Production writes require ``--execute``.
Every execution stores the generated payload, pre-write remote rows, write
receipts, and post-write comparison report in the selected audit directory.
"""

from __future__ import annotations

import argparse
import http.client
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Mapping


HEADER_ROW = 3
DATA_START_ROW = 4
LOCALES = ("ru", "ar", "id")
EXPECTED_COUNTS = {
    "department_i18n": 20,
    "disease_i18n": 481,
    "procedure_i18n": 969,
}

TABLES: dict[str, dict[str, Any]] = {
    "department_i18n": {
        "sheet": "Departments",
        "parent_table": "departments",
        "parent_key": "id",
        "id_column": "department_id",
        "fields": {
            "name": "target_name",
            "name_en": "target_name_en",
            "short_desc": "target_short_desc",
            "short_desc_md": "target_short_desc_md",
        },
    },
    "disease_i18n": {
        "sheet": "Diseases",
        "parent_table": "diseases",
        "parent_key": "id",
        "id_column": "disease_id",
        "fields": {
            "name": "target_name",
            "seo_meta_title": "target_seo_meta_title",
            "seo_meta_desc": "target_seo_meta_desc",
        },
    },
    "procedure_i18n": {
        "sheet": "Procedures",
        "parent_table": "procedures",
        "parent_key": "id",
        "id_column": "procedure_id",
        "fields": {
            "name": "target_name",
            "waiting_time": "target_waiting_time",
            "cost_usd": "target_cost_usd",
            "cost_estimate": "target_cost_estimate",
            "cost_as_of": "target_cost_as_of",
            "cost_coverage": "target_cost_coverage",
            "cost_factors": "target_cost_factors",
            "stay_at_hospital": "target_stay_at_hospital",
            "stay_at_hotel": "target_stay_at_hotel",
            "stay_in_china": "target_stay_in_china",
            "surgery_detailed_description": (
                "target_surgery_detailed_description"
            ),
            "when_is_needed": "target_when_is_needed",
            "preparation_before_surgery": (
                "target_preparation_before_surgery"
            ),
            "recovery_process": "target_recovery_process",
            "surgery_options": "target_surgery_options",
            "faqs": "target_faqs_json",
            "surgery_steps": "target_surgery_steps_json",
            "recovery_steps": "target_recovery_steps_json",
        },
        "json_fields": {"faqs", "surgery_steps", "recovery_steps"},
        "boolean_fields": {"cost_estimate"},
    },
}


class UpsertError(RuntimeError):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def json_default(value: Any) -> Any:
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    raise TypeError(f"Cannot JSON encode {type(value).__name__}")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(
            value,
            ensure_ascii=False,
            indent=2,
            default=json_default,
        )
        + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def normalize_cell(value: Any) -> Any:
    if value is None or value == "":
        return None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def parse_boolean(value: Any, location: str) -> bool | None:
    value = normalize_cell(value)
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)) and value in (0, 1):
        return bool(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "yes", "1"}:
            return True
        if normalized in {"false", "no", "0"}:
            return False
    raise UpsertError(f"{location}: invalid boolean value {value!r}")


def parse_json_cell(value: Any, location: str) -> Any:
    value = normalize_cell(value)
    if value is None:
        return None
    if not isinstance(value, str):
        raise UpsertError(f"{location}: expected JSON text")
    try:
        return json.loads(value)
    except json.JSONDecodeError as exc:
        raise UpsertError(f"{location}: invalid JSON: {exc}") from exc


def workbook_path(workbook_dir: Path, locale: str) -> Path:
    path = workbook_dir / f"medora_medical_content_{locale}.xlsx"
    if not path.is_file():
        raise UpsertError(f"Workbook not found: {path}")
    return path


def worksheet_headers(worksheet: Any) -> dict[str, int]:
    headers: dict[str, int] = {}
    for column in range(1, worksheet.max_column + 1):
        value = worksheet.cell(HEADER_ROW, column).value
        if isinstance(value, str) and value.strip():
            headers[value.strip()] = column
    return headers


def build_payloads(workbook_dir: Path) -> dict[str, dict[str, list[dict[str, Any]]]]:
    try:
        from openpyxl import load_workbook
    except ImportError as exc:
        raise UpsertError("openpyxl is required") from exc

    payloads: dict[str, dict[str, list[dict[str, Any]]]] = {}
    for locale in LOCALES:
        workbook = load_workbook(
            workbook_path(workbook_dir, locale),
            read_only=False,
            data_only=False,
        )
        locale_payload: dict[str, list[dict[str, Any]]] = {}
        for table, config in TABLES.items():
            worksheet = workbook[config["sheet"]]
            headers = worksheet_headers(worksheet)
            required = {
                "entity_id",
                "target_locale",
                "status",
                *config["fields"].values(),
            }
            missing = sorted(required - set(headers))
            if missing:
                raise UpsertError(
                    f"{workbook_path(workbook_dir, locale).name}:"
                    f"{config['sheet']}: missing columns {missing}"
                )

            rows: list[dict[str, Any]] = []
            seen_ids: set[str] = set()
            for row_number in range(DATA_START_ROW, worksheet.max_row + 1):
                status = str(
                    worksheet.cell(row_number, headers["status"]).value or ""
                ).strip()
                if status != "Complete":
                    continue
                target_locale = str(
                    worksheet.cell(
                        row_number,
                        headers["target_locale"],
                    ).value
                    or ""
                ).strip()
                if target_locale != locale:
                    raise UpsertError(
                        f"{config['sheet']}!row {row_number}: target locale "
                        f"{target_locale!r} does not match {locale!r}"
                    )
                entity_id = str(
                    worksheet.cell(
                        row_number,
                        headers["entity_id"],
                    ).value
                    or ""
                ).strip()
                if not entity_id:
                    raise UpsertError(
                        f"{config['sheet']}!row {row_number}: empty entity_id"
                    )
                if entity_id in seen_ids:
                    raise UpsertError(
                        f"{config['sheet']}: duplicate entity_id {entity_id}"
                    )
                seen_ids.add(entity_id)

                record: dict[str, Any] = {
                    config["id_column"]: entity_id,
                    "locale": locale,
                }
                for database_field, workbook_field in config["fields"].items():
                    value = worksheet.cell(
                        row_number,
                        headers[workbook_field],
                    ).value
                    location = (
                        f"{config['sheet']}!row {row_number} {workbook_field}"
                    )
                    if database_field in config.get("json_fields", set()):
                        record[database_field] = parse_json_cell(value, location)
                    elif database_field in config.get("boolean_fields", set()):
                        record[database_field] = parse_boolean(value, location)
                    else:
                        record[database_field] = normalize_cell(value)
                rows.append(record)

            expected = EXPECTED_COUNTS[table]
            if len(rows) != expected:
                raise UpsertError(
                    f"{locale} {table}: expected {expected} Complete rows, "
                    f"found {len(rows)}"
                )
            locale_payload[table] = rows
        workbook.close()
        payloads[locale] = locale_payload
    return payloads


class SupabaseRest:
    def __init__(self) -> None:
        self.base_url = os.getenv("CHINA_MEDICAL_SUPABASE_URL", "").rstrip("/")
        self.service_key = os.getenv("CHINA_MEDICAL_SUPABASE_SERVICE_KEY", "")
        if not self.base_url or not self.service_key:
            raise UpsertError(
                "CHINA_MEDICAL_SUPABASE_URL and "
                "CHINA_MEDICAL_SUPABASE_SERVICE_KEY must be set"
            )

    def request(
        self,
        method: str,
        table: str,
        query: Mapping[str, str],
        body: Any = None,
        prefer: str | None = None,
    ) -> tuple[Any, Mapping[str, str]]:
        encoded_query = urllib.parse.urlencode(query, safe="(),.*")
        url = f"{self.base_url}/rest/v1/{table}?{encoded_query}"
        headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Accept": "application/json",
        }
        data = None
        if body is not None:
            data = json.dumps(
                body,
                ensure_ascii=False,
                default=json_default,
            ).encode("utf-8")
            headers["Content-Type"] = "application/json"
        if prefer:
            headers["Prefer"] = prefer
        request = urllib.request.Request(
            url,
            data=data,
            headers=headers,
            method=method,
        )
        # Supabase writes are idempotent because every POST uses the composite
        # primary key as ``on_conflict``. A short transport-only retry therefore
        # safely handles TLS EOFs without duplicating rows or altering content.
        for attempt in range(1, 4):
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    raw = response.read()
                    parsed = json.loads(raw) if raw else None
                    return parsed, dict(response.headers.items())
            except urllib.error.HTTPError as exc:
                details = exc.read().decode("utf-8", errors="replace")
                transient = exc.code in {408, 425, 429, 500, 502, 503, 504}
                if transient and attempt < 3:
                    time.sleep(2 ** (attempt - 1))
                    continue
                raise UpsertError(
                    f"{method} {table} failed with HTTP {exc.code}: {details}"
                ) from exc
            except (
                urllib.error.URLError,
                http.client.IncompleteRead,
                http.client.RemoteDisconnected,
                ConnectionResetError,
                TimeoutError,
            ) as exc:
                if attempt < 3:
                    time.sleep(2 ** (attempt - 1))
                    continue
                raise UpsertError(
                    f"{method} {table} failed after 3 transport attempts: {exc}"
                ) from exc
        raise AssertionError("unreachable")

    def select_locale(
        self,
        table: str,
        locale: str,
        fields: Iterable[str],
    ) -> list[dict[str, Any]]:
        selected_fields = list(fields)
        page_size = 100
        all_rows: list[dict[str, Any]] = []
        offset = 0
        while True:
            rows, _ = self.request(
                "GET",
                table,
                {
                    "select": ",".join(selected_fields),
                    "locale": f"eq.{locale}",
                    "order": f"{selected_fields[0]}.asc",
                    "limit": str(page_size),
                    "offset": str(offset),
                },
            )
            if not isinstance(rows, list):
                raise UpsertError(f"{table}: expected an array response")
            all_rows.extend(rows)
            if len(rows) < page_size:
                return all_rows
            offset += page_size

    def select_parent_ids(
        self,
        table: str,
        key: str,
    ) -> set[str]:
        rows, _ = self.request(
            "GET",
            table,
            {"select": key, "limit": "5000"},
        )
        if not isinstance(rows, list):
            raise UpsertError(f"{table}: expected an array response")
        return {str(row[key]) for row in rows}

    def upsert(
        self,
        table: str,
        id_column: str,
        rows: list[dict[str, Any]],
    ) -> None:
        self.request(
            "POST",
            table,
            {"on_conflict": f"{id_column},locale"},
            body=rows,
            prefer="resolution=merge-duplicates,return=minimal",
        )


def normalized_record(record: Mapping[str, Any]) -> dict[str, Any]:
    return json.loads(
        json.dumps(
            record,
            ensure_ascii=False,
            sort_keys=True,
            default=json_default,
        )
    )


def index_rows(rows: Iterable[Mapping[str, Any]], id_column: str) -> dict[str, dict[str, Any]]:
    indexed: dict[str, dict[str, Any]] = {}
    for row in rows:
        key = f"{row[id_column]}|{row['locale']}"
        if key in indexed:
            raise UpsertError(f"Duplicate remote row {key}")
        indexed[key] = normalized_record(row)
    return indexed


def compare_rows(
    expected: list[dict[str, Any]],
    actual: list[dict[str, Any]],
    id_column: str,
) -> dict[str, Any]:
    expected_index = index_rows(expected, id_column)
    actual_index = index_rows(actual, id_column)
    missing = sorted(set(expected_index) - set(actual_index))
    extra = sorted(set(actual_index) - set(expected_index))
    mismatched: list[dict[str, Any]] = []
    for key in sorted(set(expected_index) & set(actual_index)):
        if expected_index[key] != actual_index[key]:
            mismatched.append(
                {
                    "key": key,
                    "expected": expected_index[key],
                    "actual": actual_index[key],
                }
            )
    return {
        "expected_count": len(expected_index),
        "actual_count": len(actual_index),
        "missing_keys": missing,
        "extra_keys": extra,
        "mismatched": mismatched,
        "matches": not missing and not extra and not mismatched,
    }


def rows_requiring_upsert(
    expected: list[dict[str, Any]],
    actual: list[dict[str, Any]],
    id_column: str,
) -> list[dict[str, Any]]:
    """Return only absent or non-identical rows for safe resumable execution."""
    actual_index = index_rows(actual, id_column)
    required: list[dict[str, Any]] = []
    for row in expected:
        key = f"{row[id_column]}|{row['locale']}"
        if actual_index.get(key) != normalized_record(row):
            required.append(row)
    return required


def chunks(values: list[Any], size: int) -> Iterable[list[Any]]:
    for start in range(0, len(values), size):
        yield values[start : start + size]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--workbook-dir", required=True)
    parser.add_argument("--audit-dir", required=True)
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Perform production upserts; omitted means read-only dry run",
    )
    parser.add_argument("--chunk-size", type=int, default=100)
    args = parser.parse_args()

    if args.chunk_size < 1 or args.chunk_size > 500:
        raise UpsertError("--chunk-size must be between 1 and 500")

    workbook_dir = Path(args.workbook_dir).expanduser().resolve()
    audit_dir = Path(args.audit_dir).expanduser().resolve()
    audit_dir.mkdir(parents=True, exist_ok=True)
    payloads = build_payloads(workbook_dir)
    generated = {
        "version": 1,
        "generated_at": utc_now(),
        "workbook_dir": str(workbook_dir),
        "payloads": payloads,
    }
    write_json(audit_dir / "upsert_payloads.json", generated)

    client = SupabaseRest()
    parent_ids: dict[str, set[str]] = {}
    for table, config in TABLES.items():
        parent_ids[table] = client.select_parent_ids(
            config["parent_table"],
            config["parent_key"],
        )
        wanted = {
            row[config["id_column"]]
            for locale in LOCALES
            for row in payloads[locale][table]
        }
        missing = sorted(wanted - parent_ids[table])
        if missing:
            raise UpsertError(
                f"{table}: {len(missing)} IDs are absent from "
                f"{config['parent_table']}: {missing[:10]}"
            )

    before: dict[str, dict[str, list[dict[str, Any]]]] = {}
    for locale in LOCALES:
        before[locale] = {}
        for table, config in TABLES.items():
            fields = list(payloads[locale][table][0])
            before[locale][table] = client.select_locale(
                table,
                locale,
                fields,
            )
    write_json(
        audit_dir / "remote_before.json",
        {"captured_at": utc_now(), "rows": before},
    )

    plan = {
        "mode": "execute" if args.execute else "dry-run",
        "generated_at": utc_now(),
        "parent_id_counts": {
            table: len(values) for table, values in parent_ids.items()
        },
        "planned_counts": {
            locale: {
                table: len(rows)
                for table, rows in locale_payload.items()
            }
            for locale, locale_payload in payloads.items()
        },
        "remote_before_counts": {
            locale: {
                table: len(rows)
                for table, rows in locale_rows.items()
            }
            for locale, locale_rows in before.items()
        },
    }
    write_json(audit_dir / "plan.json", plan)
    print(json.dumps(plan, ensure_ascii=False, indent=2))
    if not args.execute:
        print("Dry run complete; no database rows were changed.")
        return 0

    receipts: list[dict[str, Any]] = []
    for locale in LOCALES:
        for table, config in TABLES.items():
            table_rows = rows_requiring_upsert(
                payloads[locale][table],
                before[locale][table],
                config["id_column"],
            )
            print(
                f"{locale} {table}: {len(table_rows)} row(s) require upsert; "
                f"{len(payloads[locale][table]) - len(table_rows)} already match"
            )
            for chunk_number, chunk in enumerate(
                chunks(table_rows, args.chunk_size),
                start=1,
            ):
                client.upsert(
                    table,
                    config["id_column"],
                    chunk,
                )
                receipt = {
                    "at": utc_now(),
                    "locale": locale,
                    "table": table,
                    "chunk": chunk_number,
                    "rows": len(chunk),
                }
                receipts.append(receipt)
                write_json(audit_dir / "write_receipts.json", receipts)
                print(
                    f"Upserted {locale} {table} chunk {chunk_number}: "
                    f"{len(chunk)} row(s)"
                )

    comparisons: dict[str, dict[str, Any]] = {}
    remote_after: dict[str, dict[str, list[dict[str, Any]]]] = {}
    for locale in LOCALES:
        comparisons[locale] = {}
        remote_after[locale] = {}
        for table, config in TABLES.items():
            expected = payloads[locale][table]
            fields = list(expected[0])
            actual = client.select_locale(table, locale, fields)
            remote_after[locale][table] = actual
            comparisons[locale][table] = compare_rows(
                expected,
                actual,
                config["id_column"],
            )
    write_json(
        audit_dir / "remote_after.json",
        {"captured_at": utc_now(), "rows": remote_after},
    )
    report = {
        "verified_at": utc_now(),
        "comparisons": comparisons,
        "all_match": all(
            result["matches"]
            for locale_result in comparisons.values()
            for result in locale_result.values()
        ),
    }
    write_json(audit_dir / "verification.json", report)
    if not report["all_match"]:
        raise UpsertError(
            "Post-write verification failed; inspect verification.json"
        )
    print("Production upsert and exact read-back verification succeeded.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except UpsertError as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
