const { copyFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const target = join(__dirname, '..', 'public');
mkdirSync(target, { recursive: true });
copyFileSync(
  require.resolve('canvaskit-wasm/bin/full/canvaskit.wasm'),
  join(target, 'canvaskit.wasm'),
);
