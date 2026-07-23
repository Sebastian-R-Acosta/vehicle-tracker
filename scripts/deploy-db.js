const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  try {
    return { ok: true, stdout: execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }) };
  } catch (e) {
    return { ok: false, stdout: e.stdout || '', stderr: e.stderr || '', message: e.message };
  }
}

function getMigrationDirs() {
  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  return fs.readdirSync(migrationsDir)
    .filter(d => d !== 'migration_lock.toml' && fs.statSync(path.join(migrationsDir, d)).isDirectory())
    .sort();
}

console.log('[deploy-db] Attempting prisma migrate deploy...');
let result = run('npx prisma migrate deploy');

if (result.ok) {
  console.log('[deploy-db] Migrations applied successfully.');
  console.log(result.stdout);
  process.exit(0);
}

if (result.stderr.includes('P3005')) {
  console.log('[deploy-db] P3005 — database not empty, baselining existing migrations...');

  const migrations = getMigrationDirs();
  console.log(`[deploy-db] Found ${migrations.length} migrations to baseline.`);

  for (const m of migrations) {
    console.log(`[deploy-db] Resolving ${m} as applied...`);
    const resolve = run(`npx prisma migrate resolve --applied "${m}"`);
    if (!resolve.ok) {
      console.log(`[deploy-db] Could not resolve ${m} (may already be applied): ${resolve.stderr.substring(0, 200)}`);
    }
  }

  console.log('[deploy-db] Retrying prisma migrate deploy after baseline...');
  result = run('npx prisma migrate deploy');

  if (result.ok) {
    console.log('[deploy-db] Migrations applied successfully after baseline.');
    console.log(result.stdout);
    process.exit(0);
  }

  console.error('[deploy-db] Migrations still failing after baseline:');
  console.error(result.stderr);
  process.exit(1);
}

console.error('[deploy-db] Unexpected migration error:');
console.error(result.stderr || result.message);
process.exit(1);
