import { parseHtmlDecorado, RESOLVER_URL_TEMPLATE } from './parseHtmlDecorado';
import { LexmlLinkResponse, MensagemRequisicaoWorker, MensagemRespostaWorker, RemissaoExternaDetectada } from './lexmlLinker.types';

interface Pendente {
  resolve: (resposta: LexmlLinkResponse) => void;
  reject: (erro: unknown) => void;
}

/**
 * Cliente do lexml-linker (WASM) rodando em Web Worker. Worker é criado sob demanda (lazy) e
 * reaproveitado entre chamadas.
 */
export class LexmlLinkerClient {
  private worker: Worker | null = null;
  private proximoId = 0;
  private pendentes = new Map<number, Pendente>();
  private ultimaChamadaId = 0;

  private obterWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./lexml-linker.worker.js', import.meta.url), { type: 'module' });
      this.worker.onmessage = (evento: MessageEvent<MensagemRespostaWorker>): void => this.aoReceberMensagem(evento.data);
      this.worker.onerror = (evento: ErrorEvent): void => this.aoReceberErroFatal(evento);
    }
    return this.worker;
  }

  private aoReceberMensagem(mensagem: MensagemRespostaWorker): void {
    const pendente = this.pendentes.get(mensagem.id);
    if (!pendente) return;
    this.pendentes.delete(mensagem.id);
    if (mensagem.erro !== undefined) {
      pendente.reject(new Error(mensagem.erro));
    } else {
      pendente.resolve(mensagem.resposta as LexmlLinkResponse);
    }
  }

  private aoReceberErroFatal(evento: ErrorEvent): void {
    const erro = evento.error ?? new Error(evento.message);
    for (const pendente of this.pendentes.values()) {
      pendente.reject(erro);
    }
    this.pendentes.clear();
  }

  private enviar(request: MensagemRequisicaoWorker['request']): Promise<LexmlLinkResponse> {
    const worker = this.obterWorker();
    const id = ++this.proximoId;
    return new Promise((resolve, reject) => {
      this.pendentes.set(id, { resolve, reject });
      worker.postMessage({ id, request } as MensagemRequisicaoWorker);
    });
  }

  /**
   * Detecta remissões externas no texto. Chamadas concorrentes descartam o resultado das
   * anteriores — se uma chamada mais nova começar antes desta terminar, esta resolve com
   * `null` em vez de entregar um resultado potencialmente obsoleto (texto já mudou de novo).
   */
  async detectarRemissoesExternas(texto: string): Promise<RemissaoExternaDetectada[] | null> {
    const idChamada = ++this.ultimaChamadaId;
    const resposta = await this.enviar({
      input: texto,
      outputType: 'html',
      context: 'federal',
      resolverUrl: RESOLVER_URL_TEMPLATE,
    });

    if (idChamada !== this.ultimaChamadaId) {
      return null;
    }
    if (!resposta.ok) {
      throw new Error(resposta.error);
    }
    return parseHtmlDecorado(resposta.content);
  }

  /** Encerra o worker. Uso principal: testes — libera o worker entre casos isolados. */
  encerrar(): void {
    this.worker?.terminate();
    this.worker = null;
    this.pendentes.clear();
  }
}

export const lexmlLinkerClient = new LexmlLinkerClient();
