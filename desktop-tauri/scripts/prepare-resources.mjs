/**
 * Stage Tauri bundle resources before `tauri build`:
 * - Portable Node 20 LTS for target platform
 * - Bundled bridge/server.mjs (esbuild)
 * - cli/lib + prod node_modules (fallback if bundle skipped)
 *
 * Env:
 *   SKB_NODE_TARGET  darwin-arm64 | darwin-x64 | linux-x64 | win-x64
 *   SKB_SKIP_NODE    set to 1 to skip Node download (local re-bundle)
 *   SKB_SKIP_BUNDLE  set to 1 to copy raw bridge + cli-lib instead of esbuild
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { createWriteStream } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const repoRoot = path.join(root, '..');
const resourcesDir = path.join(root, 'src-tauri/resources');
const cacheDir = path.join(root, '.cache/node');

const NODE_VERSION = '20.18.1';

const TARGETS = {
  'darwin-arm64': { os: 'darwin', arch: 'arm64', ext: 'tar.gz' },
  'darwin-x64': { os: 'darwin', arch: 'x64', ext: 'tar.gz' },
  'linux-x64': { os: 'linux', arch: 'x64', ext: 'tar.xz' },
  'win-x64': { os: 'win', arch: 'x64', ext: 'zip' }
};

function detectTarget() {
  if (process.env.SKB_NODE_TARGET && TARGETS[process.env.SKB_NODE_TARGET]) {
    return process.env.SKB_NODE_TARGET;
  }
  const { platform, arch } = process;
  if (platform === 'darwin') {
    return arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
  }
  if (platform === 'win32') {
    return 'win-x64';
  }
  return 'linux-x64';
}

function nodeDistName(target) {
  const t = TARGETS[target];
  return `node-v${NODE_VERSION}-${t.os}-${t.arch}`;
}

function nodeDownloadUrl(target) {
  const name = nodeDistName(target);
  const ext = TARGETS[target].ext;
  return `https://nodejs.org/dist/v${NODE_VERSION}/${name}.${ext}`;
}

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

async function download(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          download(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        pipeline(res, file).then(resolve, reject);
      })
      .on('error', reject);
  });
}

async function ensurePortableNode(target) {
  if (process.env.SKB_SKIP_NODE === '1') {
    console.log('skip Node download (SKB_SKIP_NODE=1)');
    return;
  }

  const destNodeDir = path.join(resourcesDir, 'node');
  const distName = nodeDistName(target);
  const archiveName = `${distName}.${TARGETS[target].ext}`;
  const url = nodeDownloadUrl(target);
  const cachedArchive = path.join(cacheDir, archiveName);
  const extractDir = path.join(cacheDir, distName);

  fs.mkdirSync(cacheDir, { recursive: true });

  if (!fs.existsSync(cachedArchive)) {
    console.log(`downloading ${url}`);
    await download(url, cachedArchive);
  } else {
    console.log(`using cached ${cachedArchive}`);
  }

  rmrf(extractDir);
  fs.mkdirSync(extractDir, { recursive: true });

  const ext = TARGETS[target].ext;
  if (ext === 'tar.gz') {
    execSync(`tar -xzf "${cachedArchive}" -C "${extractDir}"`, { stdio: 'inherit' });
  } else if (ext === 'tar.xz') {
    execSync(`tar -xJf "${cachedArchive}" -C "${extractDir}"`, { stdio: 'inherit' });
  } else if (ext === 'zip') {
    if (process.platform === 'win32') {
      execSync(
        `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${cachedArchive.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force"`,
        { stdio: 'inherit' }
      );
    } else {
      execSync(`unzip -q "${cachedArchive}" -d "${extractDir}"`, { stdio: 'inherit' });
    }
  } else {
    execSync(`tar -xf "${cachedArchive}" -C "${extractDir}"`, { stdio: 'inherit' });
  }

  const extractedRoot = path.join(extractDir, distName);
  rmrf(destNodeDir);
  fs.mkdirSync(destNodeDir, { recursive: true });

  if (target === 'win-x64') {
    fs.copyFileSync(path.join(extractedRoot, 'node.exe'), path.join(destNodeDir, 'node.exe'));
    // Tauri bundle lists both node layouts; stub the Unix path (unused on Windows).
    fs.mkdirSync(path.join(destNodeDir, 'bin'), { recursive: true });
    fs.writeFileSync(path.join(destNodeDir, 'bin/node'), '');
  } else {
    fs.mkdirSync(path.join(destNodeDir, 'bin'), { recursive: true });
    fs.copyFileSync(path.join(extractedRoot, 'bin/node'), path.join(destNodeDir, 'bin/node'));
    fs.chmodSync(path.join(destNodeDir, 'bin/node'), 0o755);
    // Stub for Windows path (unused on macOS/Linux).
    fs.writeFileSync(path.join(destNodeDir, 'node.exe'), '');
  }

  console.log(`portable Node → ${destNodeDir}`);
}

async function stageCliLibFallback() {
  const dest = path.join(resourcesDir, 'cli-lib');
  rmrf(dest);
  copyDir(path.join(repoRoot, 'cli/lib'), dest);

  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'cli/package.json'), 'utf8'));
  const minimal = {
    name: 'skill-base-cli-lib',
    private: true,
    type: 'module',
    dependencies: pkg.dependencies
  };
  fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify(minimal, null, 2));

  console.log('installing cli-lib prod dependencies…');
  execSync('pnpm install --prod --ignore-workspace', { cwd: dest, stdio: 'inherit' });
  console.log(`cli-lib fallback → ${dest}`);
}

async function stageBridge() {
  if (process.env.SKB_SKIP_BUNDLE === '1') {
    const bridgeDest = path.join(resourcesDir, 'bridge');
    rmrf(bridgeDest);
    fs.mkdirSync(bridgeDest, { recursive: true });
    fs.copyFileSync(path.join(root, 'bridge/server.mjs'), path.join(bridgeDest, 'server.mjs'));
    await stageCliLibFallback();
    return;
  }

  rmrf(path.join(resourcesDir, 'cli-lib'));
  await import('./bundle-bridge.mjs');
}

async function main() {
  const target = detectTarget();
  console.log(`prepare-resources target=${target} (${os.platform()}/${os.arch()})`);

  fs.mkdirSync(resourcesDir, { recursive: true });
  await ensurePortableNode(target);
  await stageBridge();

  console.log('resources ready:', resourcesDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
