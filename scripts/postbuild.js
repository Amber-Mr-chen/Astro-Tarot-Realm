#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const openNextDir = path.join(__dirname, '..', '.open-next');

// Rename worker.js to _worker.js
const workerSrc = path.join(openNextDir, 'worker.js');
const workerDst = path.join(openNextDir, '_worker.js');
if (fs.existsSync(workerSrc)) {
  fs.renameSync(workerSrc, workerDst);
  console.log('✓ Renamed worker.js to _worker.js');
}

// Move assets/_next to _next at root
const assetsSrc = path.join(openNextDir, 'assets', '_next');
const assetsDst = path.join(openNextDir, '_next');
if (fs.existsSync(assetsSrc) && !fs.existsSync(assetsDst)) {
  fs.renameSync(assetsSrc, assetsDst);
  console.log('✓ Moved assets/_next to .open-next/_next');
}

// Copy BUILD_ID to root
const buildIdSrc = path.join(openNextDir, 'assets', 'BUILD_ID');
const buildIdDst = path.join(openNextDir, 'BUILD_ID');
if (fs.existsSync(buildIdSrc) && !fs.existsSync(buildIdDst)) {
  fs.copyFileSync(buildIdSrc, buildIdDst);
  console.log('✓ Copied BUILD_ID to root');
}

console.log('postbuild complete');
