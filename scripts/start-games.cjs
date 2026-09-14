// Define a opção de laboratório também no Windows, sem sintaxe específica de shell.
const { spawn } = require('node:child_process');
const { join } = require('node:path');
const web = process.argv.includes('--web');
if (web) require('./prepare-web.cjs');
const cli = join(require.resolve('expo/package.json'), '..', 'bin', 'cli');
const child = spawn(
  process.execPath,
  [cli, 'start', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, EXPO_PUBLIC_DEV_TOOLS: '1' },
  },
);
child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 0;
});
