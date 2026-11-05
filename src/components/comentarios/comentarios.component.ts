import { html, LitElement, PropertyValues, render, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { SlDialog } from '@shoelace-style/shoelace';
import { iconeComentario } from '../../../assets/icons/icons';
import { Comentario, OrdenacaoComentarios, SequenciaComentario } from '../../model/comentario/comentario';
import { formatarDataComentario, ordenarSequencias, podeEditarComentario, podeExcluirComentario, TAMANHO_MAXIMO_COMENTARIO } from '../../model/comentario/comentarioUtil';
import { Usuario } from '../../model/revisao/usuario';
import { comentariosCss } from './comentarios.css';

type AcaoModal = 'adicionar' | 'responder' | 'editar';

interface ModalComentario {
  acao: AcaoModal;
  trecho?: string;
  idSequencia?: string;
  indice?: number;
}

interface Confirmacao {
  idSequencia: string;
  indice?: number;
}

const TITULOS: Record<AcaoModal, string> = { adicionar: 'Adicionar comentário', responder: 'Responder comentário', editar: 'Editar comentário' };
const PLACEHOLDERS: Record<AcaoModal, string> = {
  adicionar: 'Escreva seu comentário sobre o trecho selecionado...',
  responder: 'Escreva sua resposta para esta sequência...',
  editar: 'Atualize o texto do comentário...',
};

// Aba e modais dos comentários. Não guarda as sequências: recebe-as do componente raiz e devolve as ações por eventos.
@customElement('lexml-eta-comentarios')
export class ComentariosComponent extends LitElement {
  @property({ type: Array }) sequencias: SequenciaComentario[] = [];
  @property({ type: Object }) usuario?: Usuario;
  @property({ type: String }) idSequenciaAtual?: string;
  @property({ attribute: false }) getTrecho: (idSequencia: string) => string = (): string => '';
  @property({ attribute: false }) getPosicao: (idSequencia: string) => number | undefined = (): undefined => undefined;

  @state() ordenacao: OrdenacaoComentarios = 'ordem-no-texto';
  @state() private modal?: ModalComentario;
  @state() private textoModal = '';
  @state() private confirmacao?: Confirmacao;

  private resolverAdicao?: (texto?: string) => void;

  // Os modais ficam fora da aba: o painel inativo tem display:none e esconderia o diálogo aberto.
  readonly containerModais: HTMLElement = document.createElement('div');

  createRenderRoot(): LitElement {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.containerModais.className = 'comentarios-modais';
    document.body.appendChild(this.containerModais);
  }

  disconnectedCallback(): void {
    this.containerModais.remove();
    super.disconnectedCallback();
  }

  get sequenciasOrdenadas(): SequenciaComentario[] {
    return ordenarSequencias(this.sequencias, this.ordenacao, this.getPosicao);
  }

  /** Abre o modal de adicionar; resolve com o texto confirmado ou indefinido se cancelado. */
  abrirModalAdicionar(trecho: string): Promise<string | undefined> {
    this.resolverAdicao?.(undefined);
    this.abrirModal({ acao: 'adicionar', trecho });
    return new Promise(resolve => (this.resolverAdicao = resolve));
  }

  protected updated(alteradas: PropertyValues): void {
    render(html`${comentariosCss}${this.renderModalComentario()} ${this.renderConfirmacao()}`, this.containerModais, { host: this });
    if ((alteradas.has('idSequenciaAtual') || alteradas.has('ordenacao')) && this.idSequenciaAtual) {
      this.getCard(this.idSequenciaAtual)?.scrollIntoView?.({ block: 'nearest' });
    }
  }

  render(): TemplateResult {
    const sequencias = this.sequenciasOrdenadas;
    return html`
      ${comentariosCss}
      <div class="comentarios">
        <div class="comentarios__cabecalho">
          <h4>Comentários</h4>
          <select
            class="comentarios__ordenacao"
            aria-label="Ordenação dos comentários"
            .value=${this.ordenacao}
            @change=${(ev: Event): void => {
              this.ordenacao = (ev.target as HTMLSelectElement).value as OrdenacaoComentarios;
            }}
          >
            <option value="ordem-no-texto">Ordem no texto</option>
            <option value="mais-recentes">Mais recentes</option>
          </select>
        </div>
        ${sequencias.length
          ? html`<div class="comentarios__lista">${sequencias.map(seq => this.renderSequencia(seq))}</div>`
          : html`<span class="comentarios__vazio">Não há comentários registrados.</span>`}
      </div>
    `;
  }

  private renderSequencia(seq: SequenciaComentario): TemplateResult {
    const selecionada = seq.id === this.idSequenciaAtual;
    const trecho = this.getTrecho(seq.id);
    return html`
      <article
        class="comentario-sequencia ${selecionada ? 'comentario-sequencia--selecionada' : ''}"
        data-id-sequencia-comentario=${seq.id}
        tabindex="0"
        aria-selected=${selecionada ? 'true' : 'false'}
        @click=${(ev: MouseEvent): void => this.aoClicarSequencia(ev, seq.id)}
        @keydown=${(ev: KeyboardEvent): void => this.navegarPorTeclado(ev, seq.id)}
      >
        <div class="comentario-sequencia__topo">
          <span class="comentario-sequencia__origem">Na justificação</span>
          <span class="comentario-sequencia__acoes">
            <button
              type="button"
              class="comentario-sequencia__acao comentario-sequencia__responder"
              @click=${(): void => this.abrirModal({ acao: 'responder', idSequencia: seq.id })}
            >
              <sl-icon name="reply"></sl-icon>
              Responder
            </button>
            <button
              type="button"
              class="comentario-sequencia__acao comentario-sequencia__excluir"
              title="Excluir sequência de comentários"
              aria-label="Excluir sequência de comentários"
              @click=${(): void => this.abrirConfirmacao({ idSequencia: seq.id })}
            >
              <sl-icon name="trash"></sl-icon>
            </button>
          </span>
        </div>
        <blockquote class="comentario-sequencia__trecho">${trecho || 'Trecho comentado não localizado.'}</blockquote>
        <div class="comentario-sequencia__comentarios">${seq.comentarios.map((comentario, indice) => this.renderComentario(seq, comentario, indice))}</div>
      </article>
    `;
  }

  private renderComentario(seq: SequenciaComentario, comentario: Comentario, indice: number): TemplateResult {
    const editavel = podeEditarComentario(comentario, this.usuario);
    const excluivel = podeExcluirComentario(seq, comentario, this.usuario);
    return html`
      <section class="comentario-item ${indice > 0 ? 'comentario-item--resposta' : ''}">
        <div class="comentario-item__cabecalho">
          <span class="comentario-item__autor">${comentario.usuario?.nome || 'Anônimo'}</span>
          <span class="comentario-item__data" title=${comentario.data}>${formatarDataComentario(comentario.data)}</span>
        </div>
        <p class="comentario-item__texto">${comentario.texto}</p>
        ${editavel || excluivel
          ? html`
              <span class="comentario-item__acoes">
                ${editavel
                  ? html`<button
                      type="button"
                      class="comentario-item__acao comentario-item__editar"
                      @click=${(): void => this.abrirModal({ acao: 'editar', idSequencia: seq.id, indice }, comentario.texto)}
                    >
                      <sl-icon name="pencil-square"></sl-icon>
                      Editar
                    </button>`
                  : ''}
                ${excluivel
                  ? html`<button type="button" class="comentario-item__acao comentario-item__excluir" @click=${(): void => this.abrirConfirmacao({ idSequencia: seq.id, indice })}>
                      <sl-icon name="trash"></sl-icon>
                      Excluir
                    </button>`
                  : ''}
              </span>
            `
          : ''}
      </section>
    `;
  }

  private renderModalComentario(): TemplateResult {
    const acao = this.modal?.acao ?? 'adicionar';
    const podeConfirmar = this.textoModal.trim().length > 0;
    return html`
      <sl-dialog
        id="dlg-comentario"
        class="comentario-dialog"
        label=${TITULOS[acao]}
        ?open=${!!this.modal}
        @sl-initial-focus=${(ev: Event): void => {
          ev.preventDefault();
          (this.containerModais.querySelector('#textarea-comentario') as HTMLTextAreaElement | null)?.focus();
        }}
        @sl-after-hide=${(ev: Event): void => {
          (ev.target as SlDialog).id === 'dlg-comentario' && this.fecharModal();
        }}
      >
        ${acao === 'adicionar' && this.modal?.trecho
          ? html`<div class="comentario-modal__trecho">
              <span class="comentario-modal__label">Trecho selecionado</span>
              <blockquote>${this.modal.trecho}</blockquote>
            </div>`
          : ''}
        <label class="comentario-modal__label" for="textarea-comentario">Comentário</label>
        <textarea
          id="textarea-comentario"
          class="comentario-modal__textarea"
          maxlength=${TAMANHO_MAXIMO_COMENTARIO}
          placeholder=${PLACEHOLDERS[acao]}
          .value=${this.textoModal}
          @input=${(ev: Event): void => {
            this.textoModal = (ev.target as HTMLTextAreaElement).value;
          }}
        ></textarea>
        <span class="comentario-modal__contador">${this.textoModal.length} / ${TAMANHO_MAXIMO_COMENTARIO} caracteres</span>
        <sl-button slot="footer" id="btn-cancelar-comentario" @click=${this.fecharModal}>Cancelar</sl-button>
        <sl-button slot="footer" id="btn-confirmar-comentario" variant="primary" .disabled=${!podeConfirmar} @click=${this.confirmarModal}>
          <span slot="prefix" class="comentario-modal__icone">${unsafeHTML(iconeComentario)}</span>
          Comentar
        </sl-button>
      </sl-dialog>
    `;
  }

  private renderConfirmacao(): TemplateResult {
    const comentario = this.confirmacao?.indice !== undefined;
    return html`
      <sl-dialog
        id="dlg-excluir-comentario"
        class="comentario-dialog"
        label="Confirmar exclusão"
        ?open=${!!this.confirmacao}
        @sl-after-hide=${(ev: Event): void => {
          if ((ev.target as SlDialog).id === 'dlg-excluir-comentario') this.confirmacao = undefined;
        }}
      >
        <p class="comentario-confirmacao__titulo">${comentario ? 'Excluir este comentário?' : 'Excluir esta sequência de comentários?'}</p>
        <p class="comentario-confirmacao__texto">
          ${comentario ? 'Só este comentário será removido; o trecho comentado e as demais respostas continuam.' : 'Todos os comentários e respostas do trecho serão removidos.'}
        </p>
        <sl-button slot="footer" id="btn-cancelar-exclusao" @click=${(): void => (this.confirmacao = undefined)}>Cancelar</sl-button>
        <sl-button slot="footer" id="btn-confirmar-exclusao" variant="danger" @click=${this.confirmarExclusao}>
          <sl-icon slot="prefix" name="trash"></sl-icon>
          Excluir
        </sl-button>
      </sl-dialog>
    `;
  }

  private abrirModal(modal: ModalComentario, textoInicial = ''): void {
    if (modal.acao !== 'adicionar') {
      this.resolverAdicao?.(undefined);
      this.resolverAdicao = undefined;
    }
    this.modal = modal;
    this.textoModal = textoInicial;
  }

  private fecharModal = (): void => {
    this.resolverAdicao?.(undefined);
    this.resolverAdicao = undefined;
    this.modal = undefined;
    this.textoModal = '';
  };

  private confirmarModal = (): void => {
    const texto = this.textoModal.trim();
    const modal = this.modal;
    if (!texto || !modal) {
      return;
    }

    if (modal.acao === 'adicionar') {
      this.resolverAdicao?.(texto);
      this.resolverAdicao = undefined;
    } else if (modal.acao === 'responder') {
      this.emitir('comentario-responder', { idSequencia: modal.idSequencia, texto });
    } else {
      this.emitir('comentario-editar', { idSequencia: modal.idSequencia, indice: modal.indice, texto });
    }
    this.fecharModal();
  };

  private abrirConfirmacao(confirmacao: Confirmacao): void {
    this.confirmacao = confirmacao;
  }

  private confirmarExclusao = (): void => {
    const confirmacao = this.confirmacao;
    if (!confirmacao) {
      return;
    }
    confirmacao.indice === undefined
      ? this.emitir('comentario-excluir-sequencia', { idSequencia: confirmacao.idSequencia })
      : this.emitir('comentario-excluir', { idSequencia: confirmacao.idSequencia, indice: confirmacao.indice });
    this.confirmacao = undefined;
  };

  // Clique num botão da sequência não a seleciona.
  private aoClicarSequencia(ev: MouseEvent, idSequencia: string): void {
    if ((ev.target as HTMLElement).closest('button')) {
      return;
    }
    this.emitir('comentario-selecionar-sequencia', { idSequencia });
  }

  private navegarPorTeclado(ev: KeyboardEvent, idSequencia: string): void {
    if ((ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') || ev.target !== ev.currentTarget) {
      return;
    }
    ev.preventDefault();
    const lista = this.sequenciasOrdenadas;
    const proxima = lista[lista.findIndex(seq => seq.id === idSequencia) + (ev.key === 'ArrowDown' ? 1 : -1)];
    if (!proxima) {
      return;
    }
    this.emitir('comentario-selecionar-sequencia', { idSequencia: proxima.id });
    // Selecionar posiciona o cursor no editor; o foco volta para a lista depois.
    setTimeout(() => this.getCard(proxima.id)?.focus(), 0);
  }

  private getCard(idSequencia: string): HTMLElement | null {
    return this.querySelector(`[data-id-sequencia-comentario="${idSequencia}"]`);
  }

  private emitir(nome: string, detail: Record<string, unknown>): void {
    this.dispatchEvent(new CustomEvent(nome, { bubbles: true, composed: true, detail }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-eta-comentarios': ComentariosComponent;
  }
}
