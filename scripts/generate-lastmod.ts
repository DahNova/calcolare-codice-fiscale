/**
 * Genera src/data/source-dates.json: data dell'ultimo commit che ha toccato
 * ciascun file sorgente rilevante per il <lastmod> della sitemap.
 *
 *   npm run lastmod
 *
 * Il JSON viene COMMITTATO. Il build lo legge e non chiama git: su Vercel il
 * clone e' shallow e `git log` sui file vecchi non troverebbe nulla, quindi
 * calcolare le date durante il build produrrebbe una sitemap senza lastmod
 * (o peggio, con date sbagliate). Lo script va rilanciato quando cambia il
 * contenuto, prima del deploy.
 *
 * Se git non risponde per un file, il valore gia' presente nel JSON viene
 * conservato: uno script eseguito in un ambiente senza storia non puo'
 * cancellare date buone.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_SOURCES } from '../src/lib/lastmod.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/data/source-dates.json');

function dataUltimoCommit(file: string): string | undefined {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || undefined;
  } catch {
    return undefined;
  }
}

const precedenti: Record<string, string> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf8'))
  : {};

const date: Record<string, string> = {};
const senzaData: string[] = [];
const conservati: string[] = [];

for (const file of ALL_SOURCES) {
  if (!existsSync(resolve(ROOT, file))) {
    console.warn(`  ! sorgente assente su disco, ignorata: ${file}`);
    continue;
  }
  const iso = dataUltimoCommit(file);
  if (iso) {
    date[file] = iso;
  } else if (precedenti[file]) {
    date[file] = precedenti[file];
    conservati.push(file);
  } else {
    senzaData.push(file);
  }
}

const ordinate = Object.fromEntries(Object.entries(date).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, `${JSON.stringify(ordinate, null, 2)}\n`);

console.log(`source-dates.json: ${Object.keys(ordinate).length}/${ALL_SOURCES.length} sorgenti datate`);
if (conservati.length) {
  console.log(`  date conservate dal file precedente (git muto): ${conservati.join(', ')}`);
}
if (senzaData.length) {
  console.warn(`  ATTENZIONE senza data, resteranno senza lastmod: ${senzaData.join(', ')}`);
}
