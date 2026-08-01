import { existsSync, readFileSync, unlinkSync } from 'fs';

export default async function globalTeardown(): Promise<void> {
  if (existsSync('.ws-server.pid')) {
    try {
      process.kill(Number(readFileSync('.ws-server.pid', 'utf8')));
    } catch {
      /* já encerrado */
    }
    unlinkSync('.ws-server.pid');
  }
}
