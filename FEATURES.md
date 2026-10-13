# NutriScan Bharat — advanced feature update

## What is included
- Animated responsive hamburger drawer: Home, search history, food regulation guide, app guide, optional health profile, OCR label reader, local community report, terms/limitations, owner catalogue.
- Search history persists in local browser storage.
- Product report now adds rule-based regulatory screening flags, fat-source phrase review, 50+ sugar-related terms, real-portion estimator, optional medical guardrails, allergen and dietary-derivative markers, additive decoder, heuristic NOVA estimate, and colour + benzoate combination flag.
- OCR image reader uses Tesseract.js loaded on demand and returns raw text plus heuristic ingredient/nutrition parsing. Human review is required.
- `src/nutriscan-intelligence.ts`: typed reusable TypeScript helpers.
- `docs/schema.sql`: PostgreSQL starting schema for user profiles, additive lookup, community submissions, product flags, and optional scan history.

## Important regulatory distinction
The FSSAI draft school-food amendment listed thresholds of >4.2 g/100 g added fat for solids or >1.5 g/100 ml for liquids; >3 g/100 g added sugar for solids or >2 g/100 ml for liquids; and >0.625 g/100 g salt for solids or >0.175 g/100 ml for liquids. These are draft/scope-specific references, not presented here as universal currently enforced FSSAI front-of-pack warning thresholds. The web UI labels them as draft references and uses separate NutriScan screening cues for other nutrients. Recheck official FSSAI notifications before publishing a compliance claim.

Official reference pages:
- https://www.fssai.gov.in/food-law/regulations/amendments/labelling-display
- https://www.fssai.gov.in/notifications.php
- Draft 2026 school-food amendment comment page: https://comments.fssai.gov.in/Bestviewwl.aspx?NOTIFICATION_ID=5998

## Prototype limitations
- Static HTML cannot securely authenticate owners or share submissions between users. Community reports are stored locally only. The SQL schema is a backend starter, not a connected production database.
- The medical profile is optional and local-only. Avoid collecting health data on a server until consent, access controls, retention, deletion, and privacy notices are implemented.
- The scoring rules, NOVA heuristic, ingredient dictionaries, synergy markers, OCR extraction and health guardrails are not clinically validated and may produce false positives/negatives.
- The ingredient list rarely reveals quantities. Palm oil, an additive, or a NOVA marker is not automatically evidence that a product is unsafe.
- OCR is approximate; always check the original package, units, decimal points, ingredient list, allergen warning and batch.
- Food safety status remains “not assessed” unless independently verified official alerts or testing are integrated.

## Integration steps for a production app
1. Move `src/nutriscan-intelligence.ts` into your Next.js codebase and unit-test the pure functions.
2. Use `docs/schema.sql` as a starting migration; add a real auth provider and row-level access controls.
3. Add moderation for submissions. Never publish a community flag as an official safety warning without source verification.
4. Add official recall data only through a documented and maintained source adapter; store source URL, publication date and expiry.
5. Version scoring rules and show rule version, data source and data freshness in every report.
6. Ask explicit consent before saving health conditions; allow deletion/export and minimise retention.
