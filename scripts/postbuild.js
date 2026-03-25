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

console.log('postbuild complete');
