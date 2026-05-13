/**
 * Crops + converts country hero PNGs to optimized WebP.
 * - Input:  seo-reports/_tmp_hero_batch/<slug>.png  (1024x1024 source from nano-banana)
 * - Output: src/assets/countries-hero/<slug>.webp   (1024x750, quality 85)
 *
 * Crop strategy: extract bottom portion (top:274, height:750) to remove the
 * blurred bookshelf/window area above the desk. The flags + folder + desk
 * surface stay centered. This also fits the page layout better (less ATF push).
 *
 * Usage: npx tsx scripts/optimize-country-heroes.ts [slug1,slug2,...]
 *        (no args = all PNG sources)
 */
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SRC_DIR = 'C:/Progetti_WSL/calcolare-codice-fiscale/seo-reports/_tmp_hero_batch';
const OUT_DIR = 'C:/Progetti_WSL/calcolare-codice-fiscale/src/assets/countries-hero';

const SOURCE_W = 1024;
const SOURCE_H = 1024;
const TARGET_H = 750;
const TOP_OFFSET = SOURCE_H - TARGET_H; // 274
const WEBP_QUALITY = 85;

async function processOne(slug: string): Promise<{ slug: string; ok: boolean; inSize?: number; outSize?: number; error?: string }> {
  const inputPath = path.join(SRC_DIR, `${slug}.png`);
  const outputPath = path.join(OUT_DIR, `${slug}.webp`);
  if (!fs.existsSync(inputPath)) return { slug, ok: false, error: 'input PNG missing' };
  try {
    const inStat = fs.statSync(inputPath);
    await sharp(inputPath)
      .extract({ left: 0, top: TOP_OFFSET, width: SOURCE_W, height: TARGET_H })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toFile(outputPath);
    const outStat = fs.statSync(outputPath);
    return { slug, ok: true, inSize: inStat.size, outSize: outStat.size };
  } catch (e: any) {
    return { slug, ok: false, error: e.message };
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const filterArg = process.argv[2];
  const filterSlugs = filterArg ? filterArg.split(',').map(s => s.trim()) : null;

  const allPngs = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace(/\.png$/, ''));
  const targets = filterSlugs ? allPngs.filter(s => filterSlugs.includes(s)) : allPngs;

  console.log(`Processing ${targets.length} images: ${SOURCE_W}x${SOURCE_H} → ${SOURCE_W}x${TARGET_H} (crop top ${TOP_OFFSET}px) WebP Q${WEBP_QUALITY}`);

  let totalIn = 0, totalOut = 0, ok = 0, fail = 0;
  for (const slug of targets) {
    const res = await processOne(slug);
    if (res.ok) {
      ok++;
      totalIn += res.inSize || 0;
      totalOut += res.outSize || 0;
      const reduction = res.inSize && res.outSize ? Math.round((1 - res.outSize / res.inSize) * 100) : 0;
      console.log(`  ${slug.padEnd(30)} ${(res.inSize! / 1024).toFixed(0).padStart(6)} KB → ${(res.outSize! / 1024).toFixed(0).padStart(5)} KB  (-${reduction}%)`);
    } else {
      fail++;
      console.log(`  ${slug.padEnd(30)} FAIL: ${res.error}`);
    }
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  console.log(`Total: ${(totalIn / 1024 / 1024).toFixed(1)} MB → ${(totalOut / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
