/**
 * Generates institutional hero images for each country page via Nano Banana (OpenRouter).
 * - Reads countryContent from src/data
 * - For each country, builds a parametric institutional-style prompt
 * - Saves PNG to seo-reports/_tmp_hero_batch/<slug>.png
 * - Skips if output already exists (idempotent)
 * - Concurrency: 3 parallel requests
 *
 * API key: read from C:/Progetti_WSL/sito-claudio/.env.local (kept outside this repo)
 *
 * Usage: npx tsx scripts/generate-country-heroes.ts [slug1,slug2,...]
 *        (no args = all countries that don't have output yet)
 */
import * as fs from 'fs';
import * as path from 'path';
import { countryContent } from '../src/data/countryContent';

const ENV_FILE = 'C:/Progetti_WSL/sito-claudio/.env.local';
const OUT_DIR = 'C:/Progetti_WSL/calcolare-codice-fiscale/seo-reports/_tmp_hero_batch';
const CONCURRENCY = 3;
const MODEL = 'google/gemini-2.5-flash-image';

function loadApiKey(): string {
  const text = fs.readFileSync(ENV_FILE, 'utf-8');
  const m = text.match(/OPENROUTER_API_KEY=(.+)/);
  if (!m) throw new Error(`OPENROUTER_API_KEY not found in ${ENV_FILE}`);
  return m[1].trim();
}

function buildPrompt(countryName: string, demonym: string): string {
  return `Formal institutional photograph in archival/diplomatic aesthetic. Italian state office interior, sober and authoritative. The palette is dominated by deep institutional navy (#0F172A and #1E3A5F), ivory paper, warm aged wood, brass and bronze metal tones, with a single subtle italian-green accent. Even diffused lighting, no dramatic shadows, no warm golden-hour mood. Medium format film aesthetic. Centered, symmetrical composition with quiet hierarchy. Square 1:1 format. No text, no letters, no numbers, no country names anywhere in the image.

The scene: a wide-angle frontal view of a polished dark mahogany desk in a classical Italian government office, framed symmetrically. On the desk surface, neatly arranged:
- centered: a single closed ivory-colored bureaucratic folder with a thin navy-blue ribbon binding, and a plain ivory-white sheet of paper showing a faint embossed seal pattern (no letters or marks)
- LEFT side of the desk, on a polished brass stand with cylindrical base: a small Italian desk flag pennant (vertical fabric drape with three vertical bands of green, white, red — the Italian tricolor flag, hung from a small horizontal crossbar attached to a brass pole)
- RIGHT side of the desk, on an identical polished brass stand with cylindrical base: a small ${demonym} desk flag pennant (vertical fabric drape showing the national flag of ${countryName}, faithfully rendered with its correct colors and pattern at a small dignified size of approx 15cm tall, hung from a small horizontal crossbar attached to a brass pole)
- behind the folder: a heavy bronze inkwell to the right, a vintage rotary date-stamp to the left

Both flags are small and dignified, classic diplomatic desk-flag style, symbolizing a bilateral institutional relationship between Italy and ${countryName}. The flags are positioned as mirror images flanking the central folder.

Behind the desk, slightly out of focus, a tall classical wooden bookshelf with leather-bound institutional registries in deep red and dark green spines, the kind found in an Italian state archive. Through a tall window in the deep background on the right, the distant silhouette of an institutional or administrative building typical of ${countryName} (government palace, ministry, or classical civic architecture — NOT a tourist landmark, monument, or natural landscape), rendered in cool grey morning haze, heavily blurred.

Mood: formal, archival, authoritative, civic, diplomatic. The aesthetic of state bureaucracy and bilateral agreements, notarized documents, registered acts. Absolutely no people, no large flags on poles, no recognizable maps, no stock international business imagery, no editorial lifestyle composition, no coffee cups, no laptops, no modern technology, no tourist landmarks, no natural landscapes (mountains, beaches, deserts, etc).

Composition: lower 60% occupied by the desk, the two desk flags, and central objects in sharp focus; upper 40% with the softly blurred bookshelf and window.`;
}

// Demonym mapping (English adjective forms used in flag description)
const demonymMap: Record<string, string> = {
  'albania': 'Albanian', 'algeria': 'Algerian', 'argentina': 'Argentine', 'australia': 'Australian',
  'austria': 'Austrian', 'bangladesh': 'Bangladeshi', 'belgio': 'Belgian', 'bielorussia': 'Belarusian',
  'bolivia': 'Bolivian', 'bosnia-erzegovina': 'Bosnian', 'brasile': 'Brazilian', 'bulgaria': 'Bulgarian',
  'burkina-faso': 'Burkinabé', 'camerun': 'Cameroonian', 'canada': 'Canadian', 'cile': 'Chilean',
  'cina': 'Chinese', 'colombia': 'Colombian', 'corea-del-nord': 'North Korean', 'corea-del-sud': 'South Korean',
  'costa-avorio': 'Ivorian', 'costa-rica': 'Costa Rican', 'croazia': 'Croatian', 'cuba': 'Cuban',
  'danimarca': 'Danish', 'ecuador': 'Ecuadorian', 'egitto': 'Egyptian', 'eritrea': 'Eritrean',
  'estonia': 'Estonian', 'etiopia': 'Ethiopian', 'federazione-russa': 'Russian', 'filippine': 'Filipino',
  'finlandia': 'Finnish', 'francia': 'French', 'georgia': 'Georgian', 'germania': 'German',
  'ghana': 'Ghanaian', 'giappone': 'Japanese', 'grecia': 'Greek', 'india': 'Indian',
  'indonesia': 'Indonesian', 'iran': 'Iranian', 'iraq': 'Iraqi', 'irlanda': 'Irish',
  'israele': 'Israeli', 'kosovo': 'Kosovar', 'lettonia': 'Latvian', 'libano': 'Lebanese',
  'lituania': 'Lithuanian', 'lussemburgo': 'Luxembourgish', 'macedonia-del-nord': 'North Macedonian',
  'madagascar': 'Malagasy', 'malaysia': 'Malaysian', 'malta': 'Maltese', 'marocco': 'Moroccan',
  'messico': 'Mexican', 'moldova': 'Moldovan', 'nigeria': 'Nigerian', 'norvegia': 'Norwegian',
  'nuova-zelanda': 'New Zealand', 'paesi-bassi': 'Dutch', 'pakistan': 'Pakistani',
  'papua-nuova-guinea': 'Papua New Guinean', 'paraguay': 'Paraguayan', 'peru': 'Peruvian',
  'polonia': 'Polish', 'portogallo': 'Portuguese', 'regno-unito': 'British',
  'repubblica-ceca': 'Czech', 'repubblica-democratica-del-congo': 'Congolese',
  'repubblica-dominicana': 'Dominican', 'romania': 'Romanian', 'san-marino': 'Sammarinese',
  'senegal': 'Senegalese', 'serbia': 'Serbian', 'singapore': 'Singaporean', 'siria': 'Syrian',
  'slovacchia': 'Slovak', 'slovenia': 'Slovenian', 'spagna': 'Spanish', 'sri-lanka': 'Sri Lankan',
  'stati-uniti': 'American', 'sudafrica': 'South African', 'sudan': 'Sudanese',
  'svizzera': 'Swiss', 'svezia': 'Swedish', 'thailandia': 'Thai', 'tunisia': 'Tunisian',
  'turchia': 'Turkish', 'ucraina': 'Ukrainian', 'ungheria': 'Hungarian', 'uruguay': 'Uruguayan',
  'venezuela': 'Venezuelan', 'vietnam': 'Vietnamese', 'yemen': 'Yemeni',
  // Batch 2 (19 mag 2026)
  'kenya': 'Kenyan', 'mauritius': 'Mauritian', 'mali': 'Malian', 'somalia': 'Somali',
  'tanzania': 'Tanzanian', 'mozambico': 'Mozambican', 'angola': 'Angolan',
  'gambia': 'Gambian', 'niger': 'Nigerien', 'liberia': 'Liberian',
  'nepal': 'Nepalese', 'afghanistan': 'Afghan', 'cipro': 'Cypriot',
  'emirati-arabi-uniti': 'Emirati', 'qatar': 'Qatari', 'arabia-saudita': 'Saudi Arabian',
  'mongolia': 'Mongolian', 'uzbekistan': 'Uzbek', 'armenia': 'Armenian',
  'el-salvador': 'Salvadoran', 'honduras': 'Honduran', 'guatemala': 'Guatemalan',
  'haiti': 'Haitian', 'trinidad-e-tobago': 'Trinidadian', 'giamaica': 'Jamaican',
  'islanda': 'Icelandic', 'monaco': 'Monégasque', 'montenegro': 'Montenegrin',
  'liechtenstein': 'Liechtensteiner',
};

async function generateOne(apiKey: string, slug: string, countryName: string, demonym: string): Promise<{ ok: boolean; error?: string }> {
  const outPath = path.join(OUT_DIR, `${slug}.png`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) {
    return { ok: true };
  }
  const prompt = buildPrompt(countryName, demonym);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) {
      const t = await response.text();
      return { ok: false, error: `HTTP ${response.status}: ${t.substring(0, 200)}` };
    }
    const data = await response.json();
    const msg = data.choices?.[0]?.message;
    if (msg?.images?.[0]?.image_url?.url?.startsWith('data:')) {
      const b64 = msg.images[0].image_url.url.split(',')[1];
      const buf = Buffer.from(b64, 'base64');
      fs.writeFileSync(outPath, buf);
      return { ok: true };
    }
    return { ok: false, error: `no image in response. keys: ${Object.keys(msg || {}).join(',')}` };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const apiKey = loadApiKey();
  const filterArg = process.argv[2];
  const filterSlugs = filterArg ? new Set(filterArg.split(',').map(s => s.trim())) : null;

  const targets = countryContent.filter(c => !filterSlugs || filterSlugs.has(c.slug));
  console.log(`Targets: ${targets.length} countries`);

  let done = 0, ok = 0, fail = 0, skipped = 0;
  const failures: { slug: string; error: string }[] = [];

  // Simple semaphore for concurrency
  const queue = [...targets];
  const inflight: Promise<void>[] = [];

  async function worker() {
    while (queue.length > 0) {
      const c = queue.shift();
      if (!c) return;
      const demonym = demonymMap[c.slug] || c.nomeBreve;
      const outPath = path.join(OUT_DIR, `${c.slug}.png`);
      const alreadyExists = fs.existsSync(outPath) && fs.statSync(outPath).size > 100000;
      if (alreadyExists) {
        skipped++;
      } else {
        const t0 = Date.now();
        const res = await generateOne(apiKey, c.slug, c.nomeBreve, demonym);
        const dt = Math.round((Date.now() - t0) / 100) / 10;
        if (res.ok) {
          ok++;
          console.log(`[${++done}/${targets.length}] OK  ${c.slug} (${dt}s)`);
        } else {
          fail++;
          failures.push({ slug: c.slug, error: res.error || 'unknown' });
          console.log(`[${++done}/${targets.length}] FAIL ${c.slug}: ${res.error}`);
        }
        continue;
      }
      done++;
      console.log(`[${done}/${targets.length}] SKIP ${c.slug} (exists)`);
    }
  }

  for (let i = 0; i < CONCURRENCY; i++) inflight.push(worker());
  await Promise.all(inflight);

  console.log(`\n=== DONE ===`);
  console.log(`Generated: ${ok}, Skipped: ${skipped}, Failed: ${fail}`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach(f => console.log(`  ${f.slug}: ${f.error}`));
    fs.writeFileSync(path.join(OUT_DIR, '_failures.json'), JSON.stringify(failures, null, 2));
  }
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
