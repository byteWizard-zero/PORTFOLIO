import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const FILES_TO_WATCH = [
  'app/globals.css',
  'data/github-contributions.json',
  'data/leetcode-stats.json'
];

console.log('🚀 [Dev Watcher] Starting Next.js Dev Server and Auto-Sync Daemon...');

console.log('📊 [Dev Watcher] Fetching latest contributions and LeetCode stats...');
try {
  execSync('node scripts/fetch-contributions.mjs', { stdio: 'inherit', cwd: rootDir });
  execSync('node scripts/fetch-leetcode.mjs', { stdio: 'inherit', cwd: rootDir });
} catch (error) {
  console.error('⚠️ [Dev Watcher] Failed to fetch latest stats on startup:', error.message);
}

const nextDev = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: rootDir
});

nextDev.on('close', (code) => {
  process.exit(code || 0);
});

function syncFileToGit(file) {
  try {
    const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');

    const status = execSync(`git status --porcelain "${relativePath}"`, { cwd: rootDir }).toString().trim();
    if (!status) return; 

    console.log(`\n📦 [Auto-Sync] Detected changes in: ${relativePath}`);
    console.log(`Staging and committing...`);
    execSync(`git add "${relativePath}"`, { cwd: rootDir });
    execSync(`git commit -m "auto: sync ${relativePath}"`, { cwd: rootDir });
    
    console.log(`📤 Pushing updates to origin main...`);
    execSync(`git push origin main`, { cwd: rootDir });
    console.log(`✓ [Auto-Sync] Sync complete for ${relativePath}\n`);
  } catch (error) {
    console.error(`✗ [Auto-Sync] Sync failed for ${relativePath}:`, error.message);
  }
}

const debounceTimers = {};

FILES_TO_WATCH.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);

  if (!fs.existsSync(fullPath)) {
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, relPath.endsWith('.json') ? '{}' : '');
  }

  fs.watchFile(fullPath, { interval: 1000 }, (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      if (debounceTimers[relPath]) {
        clearTimeout(debounceTimers[relPath]);
      }
      debounceTimers[relPath] = setTimeout(() => {
        syncFileToGit(fullPath);
      }, 2000); 
    }
  });
  console.log(`👀 [Watcher] Tracking for auto-sync: ${relPath}`);

  syncFileToGit(fullPath);
});
