import * as Y from 'yjs';
import { ProjetoNorma } from '../model/lexml/documento/projetoNorma';
import { GidRegistry } from './gid';
import { SincronizadorEstrutural, StoreColaboracao } from './sincronizadorEstrutural';
import { EditorTextoColab, TextoSincronizador } from './textoSincronizador';
import { projetoNormaToYDoc } from './ydocConverter';

// Overlay de colaboração no cliente. Fase 1: ciclo de vida + degradação graciosa (keep-local-Y.Doc).
// O serviço é puro (só yjs + conversor da Fase 0); transporte/persistência entram por injeção,
// para não arrastar browser (y-websocket/y-indexeddb) e permitir teste headless.

export enum EstadoColaboracao {
  DESLIGADO = 'DESLIGADO', // feature OFF — nenhum Y.Doc, app idêntico ao de hoje
  LOCAL = 'LOCAL', // Y.Doc vivo, sem rede (cold-start ou queda de transporte)
  CONECTADO = 'CONECTADO', // sincronizando com o sidecar
}

export interface ParametrosColaboracao {
  roomId: string; // sala = urn/id da proposição
  wsUrl: string; // endpoint do sidecar
  token: string; // cunhado pelo host; o lexml-eta só carrega, nunca valida
}

export interface UsuarioColaboracao {
  nome?: string;
  id?: unknown;
  sigla?: string;
}

export interface ProviderColaboracao {
  on(evento: 'status', cb: (e: { status: string }) => void): void;
  disconnect(): void;
  destroy(): void;
}

export interface PersistenciaColaboracao {
  destroy(): void;
}

export interface FabricasColaboracao {
  criarProvider?: (p: ParametrosColaboracao, doc: Y.Doc) => ProviderColaboracao;
  criarPersistencia?: (roomId: string, doc: Y.Doc) => PersistenciaColaboracao;
  timeoutConexaoMs?: number;
  clientId?: number; // identidade CRDT deste cliente para edições ao vivo (padrão: aleatório)
  store?: StoreColaboracao; // store Redux para a sincronização estrutural (Fase 2)
  editorTexto?: EditorTextoColab; // adaptador do Quill para a co-edição de texto (Fase 3)
}

const TIMEOUT_CONEXAO_PADRAO_MS = 5000;

// O seed usa clientID=0 (determinismo, Fase 0). Após semear, o cliente adota um clientID único
// para que suas edições ao vivo não colidam com as de outros clientes no merge (§3.10.3.1).
const gerarClientId = (): number => Math.floor(Math.random() * 0x7ffffffe) + 1;

export class YjsCollabService {
  private doc?: Y.Doc;
  private provider?: ProviderColaboracao;
  private persistencia?: PersistenciaColaboracao;
  private sincronizador?: SincronizadorEstrutural;
  private textoSincronizador?: TextoSincronizador;
  private timerConexao?: ReturnType<typeof setTimeout>;
  private _estado = EstadoColaboracao.DESLIGADO;

  constructor(private fabricas: FabricasColaboracao = {}) {}

  get estado(): EstadoColaboracao {
    return this._estado;
  }

  get yDoc(): Y.Doc | undefined {
    return this.doc;
  }

  get ativo(): boolean {
    return this._estado !== EstadoColaboracao.DESLIGADO;
  }

  // Exposto para o editor (browser) dirigir a co-edição de texto: rotear deltas locais e re-observar na troca de página.
  get sincronizadorTexto(): TextoSincronizador | undefined {
    return this.textoSincronizador;
  }

  // Gate de UX (nunca de segurança): sem params completos ou anônimo ⇒ OFF.
  static deveLigar(colaboracao?: ParametrosColaboracao, usuario?: UsuarioColaboracao): boolean {
    return !!colaboracao?.roomId && !!colaboracao?.wsUrl && !!colaboracao?.token && !YjsCollabService.isAnonimo(usuario);
  }

  static isAnonimo(usuario?: UsuarioColaboracao): boolean {
    return !usuario || usuario.id === undefined || usuario.id === null || usuario.id === '' || usuario.nome === 'Anônimo';
  }

  // Liga o overlay: semeia o Y.Doc local (Fase 0) e tenta conectar sem bloquear.
  attach(colaboracao: ParametrosColaboracao | undefined, projetoNorma: ProjetoNorma, usuario?: UsuarioColaboracao): void {
    if (this.ativo) {
      return;
    }
    if (!YjsCollabService.deveLigar(colaboracao, usuario)) {
      this._estado = EstadoColaboracao.DESLIGADO;
      return;
    }

    // seed determinístico (Fase 0): o Y.Doc vive mesmo sem rede (keep-local, §3.10.1).
    this.doc = projetoNormaToYDoc(projetoNorma);
    // adota identidade CRDT própria para as edições ao vivo (o seed permanece sob clientID=0).
    this.doc.clientID = this.fabricas.clientId ?? gerarClientId();
    this._estado = EstadoColaboracao.LOCAL;

    // sincronização estrutural Redux↔Y.Array (ativa já em LOCAL, antes de qualquer rede).
    if (this.fabricas.store) {
      this.sincronizador = new SincronizadorEstrutural(this.doc, this.fabricas.store, new GidRegistry());
      this.sincronizador.ligar();
    }

    // co-edição de texto Quill↔Y.Text por dispositivo (Fase 3).
    if (this.fabricas.editorTexto) {
      this.textoSincronizador = new TextoSincronizador(this.doc, this.fabricas.editorTexto);
      this.textoSincronizador.observarRenderizados();
    }

    this.persistencia = this.fabricas.criarPersistencia?.(colaboracao!.roomId, this.doc);
    this.conectar(colaboracao!);
  }

  private conectar(colaboracao: ParametrosColaboracao): void {
    const provider = this.fabricas.criarProvider?.(colaboracao, this.doc!);
    if (!provider) {
      return; // sem transporte configurado ⇒ permanece LOCAL (degradação)
    }
    this.provider = provider;

    const timeoutMs = this.fabricas.timeoutConexaoMs ?? TIMEOUT_CONEXAO_PADRAO_MS;
    // timeout de conexão: não conectou a tempo ⇒ segue LOCAL (nunca bloqueia edição/salvar).
    this.timerConexao = setTimeout(() => (this.timerConexao = undefined), timeoutMs);

    provider.on('status', ({ status }) => {
      if (status === 'connected') {
        this.limparTimerConexao();
        this._estado = EstadoColaboracao.CONECTADO;
      } else if (status === 'disconnected') {
        // keep-local: só o transporte caiu; o Y.Doc permanece vivo.
        if (this.doc) {
          this._estado = EstadoColaboracao.LOCAL;
        }
      }
    });
  }

  // Queda/saída de transporte: desconecta só o provider; o Y.Doc permanece (§3.10.1).
  detach(): void {
    this.limparTimerConexao();
    this.provider?.disconnect();
    this.provider?.destroy();
    this.provider = undefined;
    if (this.doc) {
      this._estado = EstadoColaboracao.LOCAL;
    }
  }

  // Encerramento total (fechar o editor): libera transporte, sincronizador, persistência e Y.Doc.
  destruir(): void {
    this.detach();
    this.sincronizador?.desligar();
    this.sincronizador = undefined;
    this.textoSincronizador?.desobservar();
    this.textoSincronizador = undefined;
    this.persistencia?.destroy();
    this.persistencia = undefined;
    this.doc?.destroy();
    this.doc = undefined;
    this._estado = EstadoColaboracao.DESLIGADO;
  }

  private limparTimerConexao(): void {
    if (this.timerConexao !== undefined) {
      clearTimeout(this.timerConexao);
      this.timerConexao = undefined;
    }
  }
}
