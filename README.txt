NUTRISCAN BHARAT — UPDATED WEBSITE PROTOTYPE

FILES
- index.html: complete front-end website in one HTML file.
- nutriscan-products.json: published owner catalogue. Starts empty ([]).

HOW TO RUN
1. Extract the ZIP.
2. Open index.html in a browser for basic searching, manual entry, product comparisons and the dashboard.
3. An internet connection is required for live Open Food Facts product information and the barcode-scanning library.
4. Camera scanning normally requires HTTPS or localhost. For a phone demo, publish to a static host such as GitHub Pages or Netlify.

WHAT'S NEW
- Colour palette uses Slate Navy (#0F172A), Midnight Blue borders (#1E293B), Electric Saffron (#FF6B00), and Off-White (#F8FAFC).
- Rating bands use Crimson Red (#DC2626), Deep Amber (#EA580C), Warm Yellow (#D97706), Teal Blue (#0284C7), and Deep Teal (#0D9488).
- Separate ingredient-review score, ingredient flags, and explanatory notes. Presence of an additive is not automatically treated as harmful.
- Fitness & Goal Fit panel with bulking, cutting, high-protein, endurance, lower-carb, and general-fitness views.
- Product search and alternatives try India-listed records first and prioritise common Indian brands where identifiable. The database does not confirm Indian availability for every product, so cards state when market availability is unconfirmed.
- Better alternatives for products scored 50 or lower are filtered to higher-scoring products under the same prototype nutrition rules. For other scores, alternatives may be included where relevant measured nutrient improvements exist.
- Owner / maintainer catalogue panel lets you add products manually, import/export catalogue JSON, and record a verification note.

HOW THE OWNER ADDS A PRODUCT FOR THE PUBLIC
1. Deploy index.html and nutriscan-products.json together on the same static host.
2. Open the website and click “Owner: manage catalogue” in the footer.
3. Enter the product details copied from the package, preferably per 100 g or 100 ml. Do not guess missing values.
4. Click “Add product to this browser's draft catalogue”. Drafts are saved only in that browser's local storage.
5. Click “Export JSON for publishing”. This downloads nutriscan-products.json.
6. Replace the old hosted nutriscan-products.json with the exported file, then redeploy/commit the file. After that, all website visitors can search the published product records.
7. Keep a backup of the previous JSON file. Import a published catalogue before adding more products if you need to merge rather than replace entries.

IMPORTANT STATIC-HOST LIMITATION
A static HTML website cannot securely authenticate an administrator or automatically publish changes to every visitor on its own. The owner panel is not protected by a secure login; do not enter secrets there. Publishing shared changes requires replacing the JSON file on your hosting service. For secure multi-user submissions or direct publishing, connect a backend/database with authentication and moderation (for example, Supabase or Firebase).

SCIENTIFIC LIMITATIONS
- This is a student project prototype, not an official FSSAI rating or a medically validated nutrition or ingredient-safety score.
- The nutrition score uses a simple educational heuristic and may not suit every food category or personal need.
- The ingredient-review score checks only selected explicit label markers. It cannot infer exact amounts, contaminants, exposure, or safety from an ingredient list alone. It is deliberately separate from the nutrition score to avoid false precision.
- Ordinary permitted additives are not automatically penalised. Ingredient functions and risk depend on the substance, amount, food context and applicable regulations.
- Fitness interpretations use per-100-g values and do not replace dietetic advice or a complete meal plan.
- Open Food Facts may contain missing, user-submitted or outdated information. Verify the current package label, especially for allergies.
- Alternative search prioritises India-listed or common Indian-brand records when identifiable, but does not guarantee local store availability.

SOURCES
Open Food Facts: https://world.openfoodfacts.org/
Open Food Facts API docs: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
FSSAI food standards: https://fssai.gov.in/standards/product-standards?pr=1
WHO trans fat fact sheet: https://www.who.int/news-room/fact-sheets/detail/trans-fat
