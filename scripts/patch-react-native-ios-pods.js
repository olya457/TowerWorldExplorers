#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const FMT_VERSION = '12.1.0';
const LEGACY_FMT_VERSION = '11.0.2';
const projectRoot = path.resolve(__dirname, '..');
const reactNativeRoot = path.join(projectRoot, 'node_modules', 'react-native');

function collectPodspecs(dir, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectPodspecs(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.podspec')) {
      results.push(fullPath);
    }
  }

  return results;
}

if (!fs.existsSync(reactNativeRoot)) {
  console.warn('[ios-pods] react-native is not installed yet; skipping fmt patch.');
  process.exit(0);
}

let changed = 0;

for (const podspecPath of collectPodspecs(reactNativeRoot)) {
  const before = fs.readFileSync(podspecPath, 'utf8');
  let after = before.replace(
    /(dependency\s+["']fmt["']\s*,\s*["'])11\.0\.2(["'])/g,
    `$1${FMT_VERSION}$2`,
  );

  if (podspecPath.endsWith(path.join('third-party-podspecs', 'fmt.podspec'))) {
    after = after.replace(new RegExp(LEGACY_FMT_VERSION, 'g'), FMT_VERSION);
  }

  if (after !== before) {
    fs.writeFileSync(podspecPath, after);
    changed += 1;
  }
}

console.log(
  changed > 0
    ? `[ios-pods] Patched ${changed} React Native podspecs to use fmt ${FMT_VERSION}.`
    : `[ios-pods] React Native podspecs already use fmt ${FMT_VERSION}.`,
);
