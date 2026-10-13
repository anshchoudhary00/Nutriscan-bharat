-- PostgreSQL starter schema for a future authenticated/server-backed deployment.
-- Do not store medical profiles without explicit consent, access controls and a retention policy.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject TEXT UNIQUE NOT NULL,
  display_name TEXT,
  locale TEXT NOT NULL DEFAULT 'en-IN',
  health_conditions TEXT[] NOT NULL DEFAULT '{}',
  allergen_avoidances TEXT[] NOT NULL DEFAULT '{}',
  dietary_preferences TEXT[] NOT NULL DEFAULT '{}',
  consent_health_profile BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (consent_health_profile OR cardinality(health_conditions)=0)
);

CREATE TABLE additives_lookup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ins_number TEXT NOT NULL UNIQUE,
  common_name TEXT NOT NULL,
  function_en TEXT,
  explanation_hi TEXT,
  jurisdiction_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_context TEXT,
  official_source_url TEXT,
  source_checked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE community_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT,
  product_name TEXT NOT NULL,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('nutrition_error','ingredient_error','barcode_mismatch','batch_update','image_error','other')),
  description TEXT NOT NULL,
  corrected_nutrition JSONB,
  corrected_ingredients TEXT,
  batch_code TEXT,
  best_before DATE,
  evidence_image_url TEXT,
  submitted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','accepted','rejected','duplicate')),
  moderator_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX community_submissions_status_created_idx ON community_submissions(status, created_at DESC);
CREATE INDEX community_submissions_product_code_idx ON community_submissions(product_code);

CREATE TABLE product_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL,
  flag_code TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info','watch','critical')),
  source_type TEXT NOT NULL CHECK (source_type IN ('rule_engine','community','official_alert','moderator')),
  source_reference TEXT,
  message TEXT NOT NULL,
  batch_code TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX product_flags_code_valid_idx ON product_flags(product_code, valid_from DESC, valid_until);

-- Product scan history is user data; optional server-side version.
CREATE TABLE product_scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_code TEXT,
  product_name TEXT NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  score_snapshot SMALLINT CHECK (score_snapshot BETWEEN 0 AND 100)
);
CREATE INDEX product_scan_history_user_time_idx ON product_scan_history(user_id, scanned_at DESC);
