import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

// Sobe o servidor y-websocket local (test-tools/collab-ws-server.mjs) para os testes colaborativos.
export default async function globalSetup(): Promise<void> {
  const srv = spawn('node', ['test-tools/collab-ws-server.mjs'], {
    env: { ...process.env, PORT: '1234' },
    stdio: 'ignore',
    detached: true,
  });
  writeFileSync('.ws-server.pid', String(srv.pid));
  srv.unref();
  await new Promise(r => setTimeout(r, 1000)); // tempo de subir
}
