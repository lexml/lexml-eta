import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { ParametrosColaboracao, PersistenciaColaboracao, ProviderColaboracao } from './yjsCollabService';

// Transporte/persistência reais (browser). Módulo carregado dinamicamente pelo componente só quando
// a colaboração liga — mantém y-websocket/y-indexeddb fora do grafo estático (app OFF intocado).

export const criarProviderReal = (p: ParametrosColaboracao, doc: Y.Doc): ProviderColaboracao => {
  // token viaja no query do handshake; o gate/validação é do sidecar+Spring, nunca do cliente.
  const provider = new WebsocketProvider(p.wsUrl, p.roomId, doc, { params: { token: p.token } });
  return provider as unknown as ProviderColaboracao;
};

export const criarPersistenciaReal = (roomId: string, doc: Y.Doc): PersistenciaColaboracao => {
  return new IndexeddbPersistence(roomId, doc) as unknown as PersistenciaColaboracao;
};
