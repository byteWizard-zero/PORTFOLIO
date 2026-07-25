

import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const USERNAME = 'byteWizard-zero';
const API = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'data', 'github-contributions.json');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toWeeks(contributions) {
  const weeks = [];
  let week = [];
  for (const day of contributions) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay(); 
    if (weekday === 0 && week.length > 0) {
      weeks.push(week);
      week = [];
    }
    
    if (weeks.length === 0 && week.length === 0 && weekday > 0) {
      for (let i = 0; i < weekday; i += 1) week.push(null);
    }
    week.push({ date: day.date, count: day.count, level: day.level });
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null); 
    weeks.push(week);
  }
  return weeks;
}

function emptyGrid() {
  const weeks = Array.from({ length: 53 }, () =>
    Array.from({ length: 7 }, () => null),
  );
  return { username: USERNAME, total: 0, generatedAt: today(), weeks };
}

async function main() {
  try {
    const res = await fetch(API, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const contributions = Array.isArray(json.contributions) ? json.contributions : [];
    if (contributions.length === 0) throw new Error('no contributions in response');

    const total =
      json?.total?.lastYear ??
      contributions.reduce((sum, d) => sum + (d.count || 0), 0);

    const out = {
      username: USERNAME,
      total,
      generatedAt: today(),
      weeks: toWeeks(contributions),
    };

    await writeFile(OUT, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    console.log(
      `✓ contributions: ${total} total, ${out.weeks.length} weeks → data/github-contributions.json`,
    );
  } catch (err) {
    if (existsSync(OUT)) {
      
      console.warn(
        `⚠ contributions fetch failed (${err.message}); keeping existing data/github-contributions.json`,
      );
    } else {
      await writeFile(OUT, `${JSON.stringify(emptyGrid(), null, 2)}\n`, 'utf8');
      console.warn(
        `⚠ contributions fetch failed (${err.message}); wrote empty fallback grid`,
      );
    }
  }
}

await main();
