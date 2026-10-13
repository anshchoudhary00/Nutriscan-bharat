/**
 * NutriScan Bharat — client/server-neutral label intelligence helpers.
 * These are educational heuristics, not official FSSAI determinations or medical advice.
 */
export type Product = {
  code?: string; product_name?: string; product_name_en?: string; brands?: string;
  categories?: string; categories_tags_en?: string[] | string; ingredients_text?: string;
  ingredients_text_en?: string; allergens?: string; allergens_tags?: string[];
  additives_tags?: string[]; serving_size?: string; quantity?: string;
  price_inr?: number; nutriments?: Record<string, number | string | null | undefined>;
};
export type Nutrients = { energyKcal: number|null; sugarG: number|null; addedSugarG: number|null; totalFatG: number|null; saturatedFatG: number|null; sodiumMg: number|null; proteinG: number|null; fibreG: number|null; carbsG: number|null };
export type Flag = { code: string; severity: 'info'|'watch'|'critical'; title: string; detail: string };
export type Condition = 'Diabetes'|'Hypertension'|'PCOS'|'Uric Acid / Gout'|'IBS / Sensitive Gut';

const val = (p: Product, keys: string[]): number|null => {
  for (const key of keys) { const raw = p.nutriments?.[key]; if (raw !== null && raw !== undefined && raw !== '' && Number.isFinite(Number(raw))) return Number(raw); }
  return null;
};
export function getNutrients(p: Product): Nutrients {
  const sodiumG = val(p, ['sodium_100g']);
  const saltG = val(p, ['salt_100g']);
  const sodiumMg = sodiumG !== null ? sodiumG*1000 : saltG !== null ? saltG/2.5*1000 : null;
  let energy = val(p, ['energy-kcal_100g','energy-kcal_value']);
  if (energy === null) { const kj=val(p,['energy-kj_100g','energy_100g']); if(kj!==null) energy=kj/4.184; }
  return {energyKcal:energy,sugarG:val(p,['sugars_100g','sugars_value']),addedSugarG:val(p,['added-sugars_100g','added_sugars_100g']),totalFatG:val(p,['fat_100g']),saturatedFatG:val(p,['saturated-fat_100g','saturated_fat_100g']),sodiumMg,proteinG:val(p,['proteins_100g','protein_100g']),fibreG:val(p,['fiber_100g','fibre_100g']),carbsG:val(p,['carbohydrates_100g'])};
}
export const ingredientsOf = (p: Product) => String(p.ingredients_text_en || p.ingredients_text || '');
const nameOf = (p: Product) => p.product_name || p.product_name_en || 'Unnamed product';

/** Draft-specific reference values only: never display as universal current FSSAI FoPL law. */
export function fssaiDraftSchoolFoodFlags(p: Product): Flag[] {
  const n=getNutrients(p), t=`${p.categories||''} ${Array.isArray(p.categories_tags_en)?p.categories_tags_en.join(' '):p.categories_tags_en||''} ${nameOf(p)}`.toLowerCase();
  const liquid=/drink|beverage|juice|soda|cola|nectar|water|liquid|milk/.test(t); const unit=liquid?'100 ml':'100 g'; const flags:Flag[]=[];
  if(n.addedSugarG!==null && n.addedSugarG>(liquid?2:3)) flags.push({code:'HIGH_SUGAR',severity:'watch',title:'High added sugar',detail:`${n.addedSugarG} g added sugar per ${unit} exceeds the FSSAI draft school-food reference (${liquid?'>2 g/100 ml':'>3 g/100 g'}). This is a draft/scope-specific reference, not a universal FoPL legal finding.`});
  else if(n.sugarG!==null && n.sugarG>=(liquid?5:10)) flags.push({code:'HIGH_TOTAL_SUGAR',severity:'watch',title:'High total sugar',detail:`${n.sugarG} g total sugars per ${unit}; total sugar and added sugar are different fields.`});
  if(n.sodiumMg!==null && n.sodiumMg>=(liquid?70:250)) flags.push({code:'HIGH_SODIUM',severity:n.sodiumMg>=600?'critical':'watch',title:'Elevated sodium',detail:`${n.sodiumMg} mg sodium per ${unit}. This is a NutriScan screening cue, not an official universal FSSAI threshold.`});
  if(n.saturatedFatG!==null && n.saturatedFatG>=5) flags.push({code:'HIGH_SATURATED_FAT',severity:'watch',title:'High saturated fat',detail:`${n.saturatedFatG} g saturated fat per ${unit}; compare similar products and portion sizes.`});
  return flags;
}
const FAT_MARKERS: [string,RegExp,string][] = [
  ['PALM_OIL',/\bpalm oil\b|\bpalmolein\b|\bpalm kernel oil\b/i,'Palm-derived oil is listed; the amount and total fatty-acid profile are not disclosed by the name alone.'],
  ['HYDROGENATED_FAT',/hydrogenated vegetable oil|partially hydrogenated|fully hydrogenated|hydrogenated fat/i,'Hydrogenated fat is listed. Partially hydrogenated oil is a stronger industrial trans-fat concern; verify the package.'],
  ['INTERESTERIFIED_FAT',/interesterified fat|interesterified oil|interesterified vegetable/i,'Interesterified fat is listed; the label does not establish the precise fatty-acid profile.'],
  ['GENERIC_VEGETABLE_OIL',/edible vegetable oil|vegetable oil blend|vegetable fat|edible vegetable fat/i,'Generic oil wording may mask the specific source or blend; do not assume a particular oil without evidence.'],
  ['VANASPATI',/vanaspati|dalda/i,'Vanaspati is listed; check the current nutrition panel and trans-fat declaration.']
];
export function reviewFatSources(p: Product) { const t=ingredientsOf(p); return FAT_MARKERS.filter(([,re])=>re.test(t)).map(([code,,detail])=>({code,detail})); }
export const HIDDEN_SUGAR_TERMS = [
  'sugar','sucrose','glucose','dextrose','fructose','maltose','lactose','maltodextrin','invert sugar','invert sugar syrup','invert syrup','liquid glucose','glucose syrup','corn syrup','corn syrup solids','high fructose corn syrup','hfcs','fructose syrup','glucose-fructose syrup','fructose-glucose syrup','rice syrup','brown rice syrup','rice malt syrup','barley malt','barley malt syrup','malt syrup','malt extract','malt solids','maltose syrup','agave nectar','agave syrup','honey','maple syrup','date syrup','date paste','coconut sugar','coconut nectar','palm sugar','jaggery','gur','molasses','blackstrap molasses','treacle','golden syrup','caramel syrup','fruit juice concentrate','fruit concentrate','apple juice concentrate','grape juice concentrate','pear juice concentrate','evaporated cane juice','cane juice crystals','cane sugar','raw sugar','brown sugar','powdered sugar','icing sugar','demerara sugar','turbinado sugar','muscovado sugar','sorbitol','mannitol','xylitol','erythritol','isomalt','polydextrose','galactose','maltitol syrup','sweet whey powder','sweetened condensed milk'
] as const;
export function reviewHiddenSugars(p: Product) {
  const t=ingredientsOf(p).toLowerCase().replace(/[()]/g,' '), candidates:{term:string;start:number;end:number}[]=[];
  for(const term of [...HIDDEN_SUGAR_TERMS].sort((a,b)=>b.length-a.length)){const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const re=new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`,'gi');for(const m of t.matchAll(re)){const start=(m.index||0)+(m[1]||'').length;candidates.push({term,start,end:start+term.length});}}
  candidates.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));const accepted=candidates.filter((c,i)=>!candidates.slice(0,i).some(a=>c.start<a.end&&c.end>a.start));const found=Array.from(new Set(accepted.map(x=>x.term)));
  const score=Math.min(100,found.length*18+(found.length>=3?15:0));
  return {count:found.length,names:found,score,meaning:found.length>=3?'Several sugar-related terms detected':found.length?'Sugar-related terms detected':'No dictionary match',note:'Name matches do not reveal the amount. Maltodextrin is a carbohydrate ingredient, not chemically identical to table sugar.'};
}
export function estimatePortion(p: Product, gramsOrMl: number, declaredServing?: number) {
  if(!Number.isFinite(gramsOrMl)||gramsOrMl<=0) throw new Error('Portion must be a positive number.');
  const n=getNutrients(p),f=gramsOrMl/100; return {portion:gramsOrMl,energyKcal:n.energyKcal===null?null:round(n.energyKcal*f),sugarG:n.sugarG===null?null:round(n.sugarG*f),totalFatG:n.totalFatG===null?null:round(n.totalFatG*f),saturatedFatG:n.saturatedFatG===null?null:round(n.saturatedFatG*f),sodiumMg:n.sodiumMg===null?null:Math.round(n.sodiumMg*f),proteinG:n.proteinG===null?null:round(n.proteinG*f),multiplesOfDeclaredServing:declaredServing&&declaredServing>0?round(gramsOrMl/declaredServing):null};
}
const round=(x:number)=>Math.round(x*10)/10;
const ALLERGEN_PATTERNS: [string,RegExp][] = [['Gluten',/wheat|barley|rye|malt|gluten|semolina|durum/i],['Soy',/soy(?:bean)?|soya|soy lecithin/i],['Peanuts',/peanut|groundnut|arachis/i],['Milk / lactose',/milk|lactose|whey|casein|butter|cream|milk solids/i],['Tree nuts',/almond|cashew|pistachio|walnut|hazelnut|pecan|macadamia/i],['Sesame',/sesame|til seed/i],['Egg',/egg white|egg yolk|albumen|ovalbumin/i],['Fish / crustacean',/fish oil|fish sauce|shrimp|prawn|crab|anchovy/i]];
export function findAllergens(p: Product) { const t=`${ingredientsOf(p)} ${p.allergens||''} ${(p.allergens_tags||[]).join(' ')}`;return ALLERGEN_PATTERNS.filter(([,re])=>re.test(t)).map(([name])=>name); }
export function findDietaryDerivatives(p: Product) { const t=ingredientsOf(p);return [{code:'GELATIN',re:/gelatin|gelatine/i,detail:'Often animal-derived; verify the source.'},{code:'SHELLAC_E904',re:/shellac|e904|ins ?904/i,detail:'May be insect-derived; verify the source if relevant.'},{code:'COCHINEAL_E120',re:/cochineal|carmine|e120|ins ?120/i,detail:'Cochineal/carmine is insect-derived.'},{code:'BONE_CHAR',re:/bone char/i,detail:'If this matters to your diet, ask the manufacturer; generic sugar wording does not disclose processing aids.'}].filter(x=>x.re.test(t)).map(({code,detail})=>({code,detail})); }
export const ADDITIVES: Record<string,{name:string;hi:string;function:string;risk:string}> = {
  '102':{name:'Tartrazine',hi:'पीला कृत्रिम रंग',function:'Synthetic yellow colouring.',risk:'Check local permitted uses; presence alone does not prove harm.'},
  '110':{name:'Sunset Yellow FCF',hi:'नारंगी-पीला कृत्रिम रंग',function:'Synthetic yellow-orange colouring.',risk:'Some colour mixtures have been studied for possible activity/attention effects in children; this is not proof of harm for an individual product.'},
  '120':{name:'Carmine / cochineal',hi:'कीट से प्राप्त लाल रंग',function:'Red colouring; may be insect-derived.',risk:'Relevant to vegan/vegetarian preferences.'},
  '129':{name:'Allura Red AC',hi:'लाल कृत्रिम रंग',function:'Synthetic red colouring.',risk:'Check jurisdiction-specific rules; presence is not proof of danger.'},
  '211':{name:'Sodium benzoate',hi:'सोडियम बेंजोएट',function:'Preservative for suitable foods.',risk:'Food category and permitted limits matter.'},
  '202':{name:'Potassium sorbate',hi:'पोटैशियम सोर्बेट',function:'Preservative against some yeasts and moulds.',risk:'Permitted use depends on food category.'},
  '330':{name:'Citric acid',hi:'साइट्रिक एसिड',function:'Acidity regulator.',risk:'Commonly used; context and amount matter.'},
  '621':{name:'Monosodium glutamate',hi:'मोनोसोडियम ग्लूटामेट',function:'Umami flavour enhancer.',risk:'Presence alone does not mean a food is unsafe.'},
  '950':{name:'Acesulfame potassium',hi:'उच्च-तीव्रता मिठासकारक',function:'High-intensity sweetener.',risk:'Not the same as added sugar.'},
  '951':{name:'Aspartame',hi:'एस्पार्टेम',function:'High-intensity sweetener.',risk:'People with phenylketonuria must follow medical dietary advice.'},
  '955':{name:'Sucralose',hi:'सुक्रालोज़',function:'High-intensity sweetener.',risk:'Low sugar does not automatically mean nutritionally ideal.'},
  '407':{name:'Carrageenan',hi:'कैरेजीनन',function:'Thickener / stabiliser.',risk:'Individual tolerance and product context vary.'},
  '322':{name:'Lecithins',hi:'लेसिथिन',function:'Emulsifier.',risk:'May be derived from soy; check allergen statements.'}
};
export function decodeAdditives(p: Product) { const t=`${ingredientsOf(p)} ${(p.additives_tags||[]).join(' ')}`.toLowerCase(),ids=new Set<string>();for(const m of t.matchAll(/(?:ins\s*|e\s*-?\s*)(\d{3,4})/gi))ids.add(m[1]);return [...ids].map(id=>({id,...(ADDITIVES[id]||{name:`INS/E${id}`,hi:'विवरण उपलब्ध नहीं',function:'No verified explanation in this prototype.',risk:'Check official regulations for the relevant food category.'})})); }
export function conditionGuardrails(p: Product, conditions: Condition[]): Flag[] {
  const n=getNutrients(p),t=ingredientsOf(p).toLowerCase(),out:Flag[]=[];
  for(const c of conditions){
    if(c==='Diabetes'&&((n.sugarG!==null&&n.sugarG>=15)||/glucose syrup|dextrose|sucrose|invert syrup/.test(t)))out.push({code:'DIABETES_CARB_REVIEW',severity:n.sugarG!==null&&n.sugarG>=25?'critical':'watch',title:'Review sugars and total carbohydrates',detail:'Consider portion size and your individual diabetes plan; ingredient text cannot predict your glucose response.'});
    if(c==='Hypertension'&&n.sodiumMg!==null&&n.sodiumMg>=600)out.push({code:'HYPERTENSION_SODIUM',severity:'critical',title:'High sodium',detail:`${n.sodiumMg} mg sodium per 100 g/ml. Consider a lower-sodium alternative and your clinician's advice.`});
    if(c==='PCOS'&&((n.sugarG!==null&&n.sugarG>=15)||(n.fibreG!==null&&n.fibreG<2)))out.push({code:'PCOS_GENERAL_NUTRITION',severity:'watch',title:'Review sugar and fibre',detail:'General nutrition cue only; PCOS needs are individual.'});
    if(c==='Uric Acid / Gout'&&/high fructose corn syrup|fructose syrup|glucose-fructose syrup/.test(t))out.push({code:'GOUT_FRUCTOSE_MARKER',severity:'watch',title:'Fructose-sweetener marker',detail:'Review portion and personal advice with your clinician/dietitian.'});
    if(c==='IBS / Sensitive Gut'&&/sorbitol|mannitol|xylitol|maltitol|erythritol|inulin|chicory root|polydextrose/.test(t))out.push({code:'IBS_POTENTIAL_TRIGGER',severity:'watch',title:'Potential gut-tolerance trigger',detail:'Some sugar alcohols and added fibres trigger symptoms for some people; tolerance varies.'});
  }return out;
}
export function estimateNovaGroup(p: Product) { const t=ingredientsOf(p).toLowerCase();if(!t.trim())return {group:null,label:'Unknown',confidence:'low',markers:[] as string[]};const markers=['maltodextrin','protein isolate','hydrolysed protein','hydrolyzed protein','modified starch','hydrogenated oil','emulsifier','flavouring','flavoring','artificial flavour','artificial flavor','sweetener','sucralose','acesulfame','aspartame','preservative','thickener','stabiliser','stabilizer','high fructose corn syrup'].filter(x=>t.includes(x));if(markers.length>=2)return {group:4,label:'Likely ultra-processed (heuristic)',confidence:'medium',markers};if(markers.length===1)return {group:3,label:'Processing uncertain; review label',confidence:'low',markers};return {group:null,label:'Not classifiable by this simple rule',confidence:'low',markers}; }
export function checkAdditiveSynergy(p: Product) { const t=`${ingredientsOf(p)} ${(p.additives_tags||[]).join(' ')}`.toLowerCase(),dyes=['tartrazine','sunset yellow','allura red','carmoisine','ponceau','quinoline yellow','e102','e110','e129','ins 102','ins 110','ins 129'].filter(x=>t.includes(x));return dyes.length&&/sodium benzoate|e211|ins 211/.test(t)?[{severity:'watch',title:'Colour + benzoate combination detected',dyes,detail:'Some mixtures have been studied for behavioural effects in children; this is not proof of harm or regulatory non-compliance.'}]:[]; }
export function compareProducts(a: Product,b: Product) { const x=getNutrients(a),y=getNutrients(b);return {a:nameOf(a),b:nameOf(b),differences:[{metric:'Sugar (g/100g)',a:x.sugarG,b:y.sugarG,better:x.sugarG===null||y.sugarG===null?'unknown':x.sugarG===y.sugarG?'tie':x.sugarG<y.sugarG?'A':'B'},{metric:'Protein (g/100g)',a:x.proteinG,b:y.proteinG,better:x.proteinG===null||y.proteinG===null?'unknown':x.proteinG===y.proteinG?'tie':x.proteinG>y.proteinG?'A':'B'},{metric:'Sodium (mg/100g)',a:x.sodiumMg,b:y.sodiumMg,better:x.sodiumMg===null||y.sodiumMg===null?'unknown':x.sodiumMg===y.sodiumMg?'tie':x.sodiumMg<y.sodiumMg?'A':'B'},{metric:'Saturated fat (g/100g)',a:x.saturatedFatG,b:y.saturatedFatG,better:x.saturatedFatG===null||y.saturatedFatG===null?'unknown':x.saturatedFatG===y.saturatedFatG?'tie':x.saturatedFatG<y.saturatedFatG?'A':'B'}],novaA:estimateNovaGroup(a),novaB:estimateNovaGroup(b)}; }
export function cleanOcrText(raw: string) { return String(raw||'').replace(/[|¦]/g,'I').replace(/[“”]/g,'"').replace(/[’‘]/g,"'").replace(/[ \t]+/g,' ').replace(/\r/g,'\n').replace(/\n{3,}/g,'\n\n').trim(); }
export function parseOcrLabel(raw: string) { const text=cleanOcrText(raw),m=text.match(/ingredients?\s*[:\-]?([\s\S]*?)(?=nutrition(?:al)?\s*(?:information|facts)?|per\s*100|allergen|contains|$)/i),ingredients=m?m[1].split(/[,;•\n]/).map(x=>x.trim()).filter(x=>x.length>1):[];const nutritionTable:Record<string,{value:number;unit:string}>={};for(const row of text.matchAll(/(energy|calories|total sugars?|added sugars?|total fat|saturated fat|trans fat|protein|carbohydrates?|dietary fibre|fibre|fiber|sodium|salt)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(kcal|kj|g|mg|mcg|µg)?/gi)){nutritionTable[row[1].toLowerCase().replace(/\s+/g,'_')]={value:Number(row[2]),unit:(row[3]||'unspecified').toLowerCase()};}return {ingredients,nutritionTable,rawText:text,needsHumanReview:true}; }
