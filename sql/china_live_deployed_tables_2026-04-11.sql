-- China medical site live deployed tables snapshot
-- Generated on: 2026-04-11T12:20:00
-- Live source: https://jjlrlwopsdmxkqyjshuc.supabase.co/rest/v1/ OpenAPI via service-role introspection
-- Purpose: share the actually deployed public relations with teammates.
-- Notes:
-- 1) The table/view/rpc inventory below is confirmed from the live Supabase OpenAPI schema cache.
-- 2) Repo-backed DDL sources are listed below and should be treated as the canonical full schema for those objects.
-- 3) For live-only tables not found in this repo, approximate CREATE TABLE statements are generated from live OpenAPI column metadata.
-- 4) Those generated CREATE TABLE statements do NOT include every FK/default/index/trigger/constraint; they are for communication and inventory, not production replay.

-- Confirmed live tables
--   backup_department_diseases_20250827
--   backup_diseases_20250827
--   booking_requests
--   case_documents
--   case_intake_attachments
--   case_intakes
--   case_media
--   case_progress_history
--   cases
--   center_departments
--   center_i18n
--   centers
--   consultation_requests
--   department_capabilities
--   department_capability_i18n
--   department_diseases
--   department_i18n
--   departments
--   disease_count_1
--   disease_count_2
--   disease_i18n
--   diseases
--   featured_items
--   featured_treatment_translations
--   featured_treatments
--   hospital_i18n
--   hospital_nearby_attractions
--   hospitals
--   i18n_messages
--   journey_stages
--   media_assets
--   medical_journeys
--   page_blocks
--   procedure_cases
--   procedure_diseases
--   procedure_i18n
--   procedures
--   quote_requests
--   sales_tokens
--   support_tickets
--   surgeons
--   user_roles
--   users

-- Confirmed live views / materialized views
--   featured_treatments_mv
--   featured_treatments_view
--   hospital_summary_view
--   v_center_summary
--   v_department_capability
--   v_department_list
--   v_diseases_by_department
--   v_hospital_details
--   v_hospital_summary
--   v_procedure_detail
--   v_procedure_list
--   v_procedures_by_disease
--   v_sales_case_summary
--   v_user_dashboard_summary
--   v_user_dashboard_summary_with_case_intake

-- Confirmed live RPCs
--   rpc/add_department_disease_relationship
--   rpc/add_procedure_disease_relationship
--   rpc/assign_case_to_sales
--   rpc/deactivate_sales_token
--   rpc/generate_case_number
--   rpc/generate_sales_token
--   rpc/get_disease_departments
--   rpc/get_procedure_diseases
--   rpc/get_sales_case_intakes
--   rpc/get_sales_tokens
--   rpc/get_unassigned_case_intakes
--   rpc/get_user_case_intake_stats
--   rpc/get_user_current_case_intake
--   rpc/refresh_featured_treatments_mv
--   rpc/use_sales_token
--   rpc/validate_sales_token

-- Repo-backed DDL sources for most core tables/views
--   database/schema/db_schema_complete_v2.sql
--   database/migrations/add_case_intake_system.sql
--   database/migrations/add_sales_to_case_intakes.sql
--   database/migrations/create_booking_requests.sql
--   database/migrations/20260226_create_surgeons_and_cases.sql
--   database/migrations/20260226_extend_hospitals_table.sql
--   database/migrations/20260226_update_v_hospital_details_view.sql
--   database/migrations/20260227_add_procedure_name_to_cases.sql
--   database/migrations/20260227_add_surgeons_and_cases_to_hospital_view.sql
--   database/migrations/20260228_add_translations_to_procedure_cases.sql
--   database/migrations/20260228_create_translation_tasks.sql
--   database/migrations/20260228_extend_hospital_i18n_for_translation.sql
--   database/migrations/20260304_add_status_to_v_hospital_summary.sql
--   database/migrations/20260305_update_v_hospital_details_i18n_equipment_and_reviews.sql
--   database/migrations/add_cascade_views_v2.sql

-- Live-only tables not found in current repo SQL sources
--   backup_department_diseases_20250827
--   backup_diseases_20250827
--   case_documents
--   case_progress_history
--   cases
--   center_departments
--   disease_count_1 (likely read model / helper relation)
--   disease_count_2 (likely read model / helper relation)
--   hospital_nearby_attractions
--   i18n_messages
--   media_assets
--   user_roles

CREATE TABLE IF NOT EXISTS public.backup_department_diseases_20250827 (
  id uuid NULL,
  department_id uuid NULL,
  disease_id uuid NULL,
  is_primary boolean NULL,
  created_at timestamptz NULL,
  updated_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS public.backup_diseases_20250827 (
  id uuid NULL,
  dept_id_deprecated uuid NULL,
  slug text NULL,
  wait_time_min_days integer NULL,
  wait_time_max_days integer NULL,
  wait_time_supporting_links text[] NULL,
  seo_meta_title text NULL,
  seo_meta_desc text NULL,
  updated_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS public.case_documents (
  id uuid NOT NULL,
  case_id uuid NOT NULL,
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_path text NOT NULL,
  file_url text NULL,
  file_type varchar NULL,
  file_size bigint NULL,
  file_extension varchar NULL,
  document_type varchar NULL,
  description text NULL,
  tags text[] NULL,
  extracted_text text NULL,
  ocr_language varchar NULL,
  uploaded_by uuid NOT NULL,
  uploaded_by_name text NULL,
  uploaded_at timestamptz NOT NULL,
  is_public boolean NULL,
  is_encrypted boolean NULL,
  deleted_at timestamptz NULL,
  is_deleted boolean NULL
);

CREATE TABLE IF NOT EXISTS public.case_progress_history (
  id uuid NOT NULL,
  case_id uuid NOT NULL,
  progress_type varchar NOT NULL,
  title text NOT NULL,
  description text NULL,
  details jsonb NULL,
  recorded_by uuid NOT NULL,
  recorded_by_name text NULL,
  recorded_at timestamptz NOT NULL,
  related_document_ids uuid[] NULL
);

CREATE TABLE IF NOT EXISTS public.cases (
  id uuid NOT NULL,
  case_number varchar NOT NULL,
  sales_id uuid NOT NULL,
  sales_name text NULL,
  patient_name text NOT NULL,
  patient_id uuid NULL,
  medical_condition jsonb NOT NULL,
  diagnosis text NULL,
  summary_zh text NULL,
  summary_en text NULL,
  summary_generated_at timestamptz NULL,
  summary_model varchar NULL,
  compliance_analysis jsonb NULL,
  compliance_generated_at timestamptz NULL,
  status varchar NULL,
  stage varchar NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  completed_at timestamptz NULL,
  tags text[] NULL,
  deleted_at timestamptz NULL,
  is_deleted boolean NULL
);

CREATE TABLE IF NOT EXISTS public.center_departments (
  id uuid NOT NULL,
  center_id uuid NULL,
  department_id uuid NULL,
  locale text NOT NULL,
  department_name text NOT NULL,
  modalities text[] NULL,
  services_tags text[] NULL,
  intro_md text NULL,
  updated_at timestamptz NOT NULL
);

-- disease_count_1: live relation exists, but it behaves like a read model/helper object. Column sketch from live OpenAPI:
--   count: bigint

-- disease_count_2: live relation exists, but it behaves like a read model/helper object. Column sketch from live OpenAPI:
--   count: bigint

CREATE TABLE IF NOT EXISTS public.hospital_nearby_attractions (
  id uuid NOT NULL,
  hospital_id uuid NOT NULL,
  name text NOT NULL,
  name_zh text NULL,
  distance text NOT NULL,
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.i18n_messages (
  key text NOT NULL,
  values jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid NOT NULL,
  url text NOT NULL,
  kind text NULL,
  alt_i18n jsonb NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  role_name text NOT NULL,
  assigned_at timestamptz NOT NULL,
  assigned_by uuid NULL
);

