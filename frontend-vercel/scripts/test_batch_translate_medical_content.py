from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("batch_translate_medical_content.py")
SPEC = importlib.util.spec_from_file_location(
    "batch_translate_medical_content",
    MODULE_PATH,
)
assert SPEC and SPEC.loader
translation = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = translation
SPEC.loader.exec_module(translation)


class BatchTranslateMedicalContentTests(unittest.TestCase):
    def test_supports_chinese_source_and_all_target_locales(self) -> None:
        self.assertEqual(
            translation.normalize_languages(
                ["en,es", "fr", "de", "ru", "ar", "id"],
            ),
            ["en", "es", "fr", "de", "ru", "ar", "id"],
        )
        prompt = translation.build_system_prompt("de", "zh")
        self.assertIn("Simplified Chinese", prompt)
        self.assertIn("German (Deutsch)", prompt)
        self.assertIn("Never return the source language as a fallback", prompt)

    def test_locked_target_fields_are_validated_and_override_model_output(self) -> None:
        self.assertEqual(
            translation.parse_locked_target_fields(
                "name, waiting_time",
                "row 4",
            ),
            {"name", "waiting_time"},
        )
        with self.assertRaisesRegex(
            translation.TranslationError,
            "unsupported fields",
        ):
            translation.parse_locked_target_fields("slug", "row 4")

        merged = translation.merge_locked_targets(
            {"name": "Model name", "waiting_time": "Three days"},
            {"name": "Reviewed canonical name"},
        )
        self.assertEqual(merged["name"], "Reviewed canonical name")
        self.assertEqual(merged["waiting_time"], "Three days")

    def test_chinese_to_english_translation_passes_structural_validation(self) -> None:
        source = {
            "name": "植入式心律转复除颤器（ICD）植入术",
            "waiting_time": "通常需要2至3天",
            "faqs_json": {
                "住院需要多久？": "通常需要2天。",
            },
            "surgery_steps_json": {
                "steps": [
                    {
                        "step": 1,
                        "text": "完成术前检查并确认治疗方案。",
                    },
                ],
            },
            "recovery_steps_json": {
                "steps": [
                    {
                        "step": 1,
                        "text": "术后第1天监测生命体征。",
                    },
                ],
            },
        }
        translated = {
            "name": "Implantable Cardioverter-Defibrillator (ICD) Implantation",
            "waiting_time": "Usually 2 to 3 days",
            "faqs_json": {
                "How long is hospitalization?": "Usually 2 days.",
            },
            "surgery_steps_json": {
                "steps": [
                    {
                        "step": 1,
                        "text": "Complete preoperative tests and confirm the treatment plan.",
                    },
                ],
            },
            "recovery_steps_json": {
                "steps": [
                    {
                        "step": 1,
                        "text": "Monitor vital signs on postoperative day 1.",
                    },
                ],
            },
        }
        errors = translation.validate_translation(
            {
                "source": source,
                "target_locale": "en",
            },
            translated,
        )
        self.assertEqual(errors, [])

    def test_validation_rejects_dropped_numbers(self) -> None:
        errors = translation.validate_translation(
            {
                "source": {
                    "name": "血管重建术",
                    "waiting_time": "通常需要2至3天",
                },
                "target_locale": "en",
            },
            {
                "name": "Vascular Reconstruction",
                "waiting_time": "Usually 2 days",
            },
        )
        self.assertTrue(
            any("numeric tokens were not preserved: 3" in error for error in errors),
        )

    def test_validation_accepts_localized_decimal_separators_and_digits(
        self,
    ) -> None:
        for locale, target in (
            ("fr", "Environ 1,5 semaine"),
            ("ar", "حوالي ١٫٥ أسبوع"),
        ):
            errors = translation.validate_translation(
                {
                    "source": {"stay_in_china": "约 1.5 周"},
                    "target_locale": locale,
                },
                {"stay_in_china": target},
            )
            self.assertEqual(errors, [])

    def test_validation_accepts_one_written_as_a_target_language_word(
        self,
    ) -> None:
        for locale, target in (
            ("fr", "Une nuit d’hospitalisation"),
            ("ar", "الإقامة في المستشفى لمدة ليلة واحدة"),
        ):
            errors = translation.validate_translation(
                {
                    "source": {"stay_at_hospital": "住院 1 晚"},
                    "target_locale": locale,
                },
                {"stay_at_hospital": target},
            )
            self.assertEqual(errors, [])

    def test_locked_reviewed_name_allows_a_localized_acronym(self) -> None:
        errors = translation.validate_translation(
            {
                "source": {"name": "PCI implantation"},
                "target_locale": "ru",
                "locked_targets": {
                    "name": "Имплантация коронарного стента",
                },
            },
            {"name": "Имплантация коронарного стента"},
        )
        self.assertEqual(errors, [])

    def test_normalizes_chinese_estimated_cost_to_language_neutral_cny(
        self,
    ) -> None:
        self.assertEqual(
            translation.normalize_copied_field(
                "cost_usd",
                "约 ¥36,400（估算）",
            ),
            "CNY 36,400",
        )
        self.assertEqual(
            translation.normalize_copied_field("cost_usd", "$12,000"),
            "$12,000",
        )

    def test_rejects_empty_procedure_json_source(self) -> None:
        with self.assertRaisesRegex(
            translation.TranslationError,
            "must not be empty",
        ):
            translation.parse_source_field("faqs_json", "{}", "row 4")


if __name__ == "__main__":
    unittest.main()
