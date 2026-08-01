// Servidor y-websocket mínimo, SÓ PARA TESTE/DEV (relay Yjs por sala, sem auth/persistência/seed).
// É o "sidecar" reduzido ao transporte. Reusa y-protocols (sync + awareness) já instalado.
// Uso: PORT=1234 node test-tools/collab-ws-server.mjs
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const MSG_SYNC = 0;
const MSG_AWARENESS = 1;
const PORT = Number(process.env.PORT) || 1234;

/** @type {Map<string, {ydoc: Y.Doc, awareness: awarenessProtocol.Awareness, conns: Map<any, Set<number>>}>} */
const salas = new Map();

const getSala = name => {
  let sala = salas.get(name);
  if (sala) return sala;

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);
  awareness.setLocalState(null);
  const conns = new Map(); // ws -> Set<clientID> introduzidos por essa conexão

  ydoc.on('update', (update, origin) => {
    const enc = encoding.createEncoder();
    encoding.writeVarUint(enc, MSG_SYNC);
    syncProtocol.writeUpdate(enc, update);
    const msg = encoding.toUint8Array(enc);
    conns.forEach((_ids, ws) => ws !== origin && ws.send(msg));
  });

  awareness.on('update', ({ added, updated, removed }, origin) => {
    const changed = added.concat(updated, removed);
    if (origin && origin.controlledIds) {
      added.concat(updated).forEach(id => origin.controlledIds.add(id));
      removed.forEach(id => origin.controlledIds.delete(id));
    }
    const enc = encoding.createEncoder();
    encoding.writeVarUint(enc, MSG_AWARENESS);
    encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(awareness, changed));
    const msg = encoding.toUint8Array(enc);
    conns.forEach((_ids, ws) => ws.send(msg));
  });

  sala = { ydoc, awareness, conns };
  salas.set(name, sala);
  return sala;
};

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws, req) => {
  ws.binaryType = 'arraybuffer';
  const nome = decodeURIComponent((req.url || '/').slice(1).split('?')[0]) || 'default';
  const sala = getSala(nome);
  ws.controlledIds = new Set();
  sala.conns.set(ws, ws.controlledIds);
  console.log(`[collab-ws-server] conexão na sala "${nome}" (total ${sala.conns.size})`);

  ws.on('message', data => {
    const dec = decoding.createDecoder(new Uint8Array(data));
    const tipo = decoding.readVarUint(dec);
    if (tipo === MSG_SYNC) {
      const enc = encoding.createEncoder();
      encoding.writeVarUint(enc, MSG_SYNC);
      syncProtocol.readSyncMessage(dec, enc, sala.ydoc, ws); // ws = origin da transação
      if (encoding.length(enc) > 1) ws.send(encoding.toUint8Array(enc));
    } else if (tipo === MSG_AWARENESS) {
      awarenessProtocol.applyAwarenessUpdate(sala.awareness, decoding.readVarUint8Array(dec), ws);
    }
  });

  ws.on('close', () => {
    sala.conns.delete(ws);
    awarenessProtocol.removeAwarenessStates(sala.awareness, Array.from(ws.controlledIds), null);
    if (sala.conns.size === 0) salas.delete(nome);
  });

  // sync step 1 + estados de awareness atuais
  const enc = encoding.createEncoder();
  encoding.writeVarUint(enc, MSG_SYNC);
  syncProtocol.writeSyncStep1(enc, sala.ydoc);
  ws.send(encoding.toUint8Array(enc));

  const estados = sala.awareness.getStates();
  if (estados.size > 0) {
    const encA = encoding.createEncoder();
    encoding.writeVarUint(encA, MSG_AWARENESS);
    encoding.writeVarUint8Array(encA, awarenessProtocol.encodeAwarenessUpdate(sala.awareness, Array.from(estados.keys())));
    ws.send(encoding.toUint8Array(encA));
  }
});

console.log(`[collab-ws-server] escutando em ws://localhost:${PORT}`);
