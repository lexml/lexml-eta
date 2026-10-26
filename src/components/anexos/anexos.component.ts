import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import type { SlDialog, SlInput, SlSelect } from '@shoelace-style/shoelace';
import { LexmlEtaConfig } from '../../model/lexmlEtaConfig';
import { Anexo, MimeType } from '../../model/proposicao/proposicao';
import { normalizarTiposAnexos, TIPO_ANEXO_OUTRO, TipoAnexo } from '../../model/proposicao/tipoAnexo';
import { alertarInfo } from '../../redux/elemento/util/alertaUtil';

const FORMATOS_POR_EXTENSAO: Record<string, MimeType> = { '.pdf': MimeType.PDF, '.docx': MimeType.DOCX };
const ACCEPT = `.pdf,.docx,${MimeType.PDF},${MimeType.DOCX}`;
const TEMPO_REVOGAR_URL_MS = 60_000;

const nomeSemExtensao = (nome: string): string => nome.replace(/\.[^.]*$/, '');

const dividirNomeArquivo = (nome: string): { base: string; extensao: string } => {
  const ponto = nome.lastIndexOf('.');
  return ponto > 0 ? { base: nome.slice(0, ponto), extensao: nome.slice(ponto) } : { base: nome, extensao: '' };
};

// A extensão decide; o tipo MIME só vale quando a extensão não é reconhecida.
const formatoDoArquivo = (arquivo: File): MimeType | undefined => {
  const { extensao } = dividirNomeArquivo(arquivo.name.toLowerCase());
  return FORMATOS_POR_EXTENSAO[extensao] ?? ((Object.values(MimeType) as string[]).includes(arquivo.type) ? (arquivo.type as MimeType) : undefined);
};

const formatarTamanhoKb = (kb: number): string => (kb >= 1024 ? `${(kb / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB` : `${kb} KB`);

@customElement('lexml-eta-anexos')
export class AnexosComponent extends LitElement {
  @property({ type: Object }) lexmlEtaConfig: LexmlEtaConfig = new LexmlEtaConfig();

  // Lista como recebida; o tipo só é normalizado ao ler, para a ordem de atribuição da configuração não perder o tipo original.
  @state() private _brutos: Anexo[] = [];
  @state() private _dialogAberto = false;
  @state() private _arquivo: File | null = null;
  @state() private _tipoDialog = '';
  @state() private _nomeDialog = '';
  @state() private _enviando = false;

  private _nomeDigitado = false;

  // Pontos de substituição nos testes; o aviso usa o mesmo alerta do restante do editor.
  private avisar = (mensagem: string): void => alertarInfo(mensagem);

  createRenderRoot(): LitElement {
    return this;
  }

  get anexos(): Anexo[] {
    return this._anexos;
  }

  set anexos(valor: Anexo[]) {
    this._brutos = Array.isArray(valor) ? valor.map(anexo => ({ ...anexo })) : [];
  }

  private get _anexos(): Anexo[] {
    return this.comTiposNormalizados(this._brutos);
  }

  private set _anexos(valor: Anexo[]) {
    this._brutos = valor;
  }

  private get tipos(): TipoAnexo[] {
    return normalizarTiposAnexos(this.lexmlEtaConfig?.tiposAnexos);
  }

  // Tipo fora da lista do host vale "outro" (design.md, D3b).
  private comTiposNormalizados(anexos: Anexo[]): Anexo[] {
    const codigos = new Set(this.tipos.map(tipo => tipo.codigo));
    return anexos.map(anexo => ({ ...anexo, tipo: codigos.has(anexo.tipo) ? anexo.tipo : TIPO_ANEXO_OUTRO.codigo }));
  }

  private emitirOnChange(): void {
    this.dispatchEvent(new CustomEvent('onchange', { bubbles: true, composed: true, detail: { origemEvento: 'anexo' } }));
  }

  private atualizarAnexo(indice: number, alteracao: Partial<Anexo>): void {
    this._anexos = this._anexos.map((anexo, i) => (i === indice ? { ...anexo, ...alteracao } : anexo));
    this.emitirOnChange();
  }

  private alterarTipo(indice: number, evento: Event): void {
    const valor = String((evento.target as SlSelect).value);
    // O sl-select também emite sl-change (assíncrono) quando o valor muda por código; esse eco não é escolha do usuário.
    if (valor === this._anexos[indice]?.tipo || !this.tipos.some(tipo => tipo.codigo === valor)) return;
    this.atualizarAnexo(indice, { tipo: valor });
  }

  private alterarNomeDocumento(indice: number, evento: Event): void {
    const campo = evento.target as SlInput;
    const anexo = this._anexos[indice];
    if (!anexo) return;
    const nome = campo.value.trim() || nomeSemExtensao(anexo.nomeArquivo);
    campo.value = nome;
    if (nome !== anexo.nomeDocumento) this.atualizarAnexo(indice, { nomeDocumento: nome });
  }

  private mover(indice: number, delta: number): void {
    const destino = indice + delta;
    if (destino < 0 || destino >= this._anexos.length) return;
    const lista = [...this._anexos];
    const [anexo] = lista.splice(indice, 1);
    lista.splice(destino, 0, anexo);
    this._anexos = lista;
    this.emitirOnChange();
  }

  // ---------- Integração com o host ----------

  private async excluir(indice: number): Promise<void> {
    const anexo = this._anexos[indice];
    if (!anexo) return;
    try {
      if (typeof this.lexmlEtaConfig.onDeleteAnexo !== 'function') throw new Error('Callback onDeleteAnexo não informado.');
      await this.lexmlEtaConfig.onDeleteAnexo({ ...anexo });
      this._anexos = this._anexos.filter(a => a.idArquivo !== anexo.idArquivo);
      this.emitirOnChange();
    } catch (err) {
      console.error('[lexml-eta-anexos] Erro ao excluir anexo:', err);
      this.avisar('Não foi possível excluir o anexo. Tente novamente.');
    }
  }

  private async obterBlob(anexo: Anexo): Promise<Blob> {
    if (typeof this.lexmlEtaConfig.onObterAnexoBlob !== 'function') throw new Error('Callback onObterAnexoBlob não informado.');
    const resultado = await this.lexmlEtaConfig.onObterAnexoBlob({ ...anexo });
    if (!resultado?.blob) throw new Error('Callback de obtenção de anexo não retornou o conteúdo.');
    return resultado.blob;
  }

  private async visualizar(indice: number): Promise<void> {
    const anexo = this._anexos[indice];
    if (!anexo || anexo.mimeType !== MimeType.PDF) return;
    try {
      if (typeof this.lexmlEtaConfig.onVisualizarAnexo === 'function') {
        await this.lexmlEtaConfig.onVisualizarAnexo({ ...anexo });
        return;
      }
      const url = URL.createObjectURL(await this.obterBlob(anexo));
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), TEMPO_REVOGAR_URL_MS);
    } catch (err) {
      console.error('[lexml-eta-anexos] Erro ao visualizar anexo:', err);
      this.avisar('Não foi possível visualizar o anexo. Tente novamente.');
    }
  }

  private async baixar(indice: number): Promise<void> {
    const anexo = this._anexos[indice];
    if (!anexo) return;
    try {
      const url = URL.createObjectURL(await this.obterBlob(anexo));
      const link = document.createElement('a');
      link.href = url;
      link.download = anexo.nomeArquivo || anexo.idArquivo;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[lexml-eta-anexos] Erro ao baixar anexo:', err);
      this.avisar('Não foi possível baixar o anexo. Tente novamente.');
    }
  }

  // ---------- Importação ----------

  private get podeConfirmar(): boolean {
    return !!this._arquivo && !!this._tipoDialog && !this._enviando;
  }

  private abrirDialogo(): void {
    this._arquivo = null;
    this._tipoDialog = '';
    this._nomeDialog = '';
    this._nomeDigitado = false;
    this._dialogAberto = true;
  }

  private fecharDialogo(): void {
    this._dialogAberto = false;
    this._arquivo = null;
    const campoArquivo = this.querySelector<HTMLInputElement>('#input-arquivo-anexo');
    if (campoArquivo) campoArquivo.value = '';
  }

  private aoEscolherArquivo(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0] ?? null;
    if (!arquivo) {
      this._arquivo = null;
      return;
    }
    if (!formatoDoArquivo(arquivo)) {
      this.recusarArquivo(campo, 'Arquivo inválido. Envie apenas PDF ou DOCX.');
      return;
    }
    const limite = this.lexmlEtaConfig.tamanhoMaximoAnexo;
    if (typeof limite === 'number' && limite > 0 && arquivo.size / 1024 > limite) {
      this.recusarArquivo(campo, `O arquivo ultrapassa o tamanho máximo permitido de ${formatarTamanhoKb(limite)}.`);
      return;
    }
    this._arquivo = arquivo;
    if (!this._nomeDigitado) this._nomeDialog = nomeSemExtensao(arquivo.name);
  }

  private recusarArquivo(campo: HTMLInputElement, mensagem: string): void {
    campo.value = '';
    this._arquivo = null;
    this.avisar(mensagem);
  }

  private nomeArquivoJaExiste(nome: string): boolean {
    const chave = nome.trim().toLowerCase();
    return this._anexos.some(anexo => anexo.nomeArquivo.trim().toLowerCase() === chave);
  }

  private nomeArquivoUnico(original: string): string {
    const nome = original.trim() || 'anexo';
    if (!this.nomeArquivoJaExiste(nome)) return nome;
    const { base, extensao } = dividirNomeArquivo(nome);
    for (let i = 1; i < 1000; i++) {
      const candidato = `${base} (${i})${extensao}`;
      if (!this.nomeArquivoJaExiste(candidato)) return candidato;
    }
    return `${base} (${Date.now()})${extensao}`;
  }

  private async enviarArquivo(arquivo: File): Promise<string> {
    if (typeof this.lexmlEtaConfig.onUploadAnexo !== 'function') throw new Error('Callback onUploadAnexo não informado.');
    const idArquivo = (await this.lexmlEtaConfig.onUploadAnexo(arquivo))?.trim();
    if (!idArquivo) throw new Error('Callback de upload não retornou um idArquivo válido.');
    return idArquivo;
  }

  private async confirmarImportacao(): Promise<void> {
    if (!this.podeConfirmar) return;
    const arquivo = this._arquivo!;
    this._enviando = true;
    try {
      const idArquivo = await this.enviarArquivo(arquivo);
      const nomeArquivo = this.nomeArquivoUnico(arquivo.name);
      const nomeOriginal = nomeSemExtensao(arquivo.name);
      const nomeInformado = this._nomeDialog.trim();
      const nomeDocumento = this._nomeDigitado && nomeInformado && nomeInformado !== nomeOriginal ? nomeInformado : nomeSemExtensao(nomeArquivo) || nomeInformado;
      this._anexos = [...this._anexos, { idArquivo, nomeArquivo, nomeDocumento, tipo: this._tipoDialog, mimeType: formatoDoArquivo(arquivo)! }];
      this.emitirOnChange();
      this.fecharDialogo();
    } catch (err) {
      console.error('[lexml-eta-anexos] Erro ao enviar anexo:', err);
      this.avisar('Erro ao enviar anexo. Tente novamente mais tarde.');
    } finally {
      this._enviando = false;
    }
  }

  // ---------- Renderização ----------

  render(): TemplateResult {
    return html`
      <style>
        .lexml-eta-anexos {
          display: flex;
          flex-direction: column;
          gap: 0.75em;
          padding: 1em;
        }
        .lexml-eta-anexos .anexo {
          border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
          border-radius: var(--sl-border-radius-medium);
          box-shadow: var(--sl-shadow-small);
        }
        .lexml-eta-anexos .anexo-cabecalho {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1em;
          padding: 0.5em 0.75em;
          border-bottom: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
        }
        .lexml-eta-anexos .anexo-rotulo {
          border: 1px solid var(--sl-color-gray-300);
          border-radius: 999px;
          padding: 0 0.5em;
          font-size: var(--sl-font-size-x-small);
          margin-right: 0.5em;
        }
        .lexml-eta-anexos .anexo-acoes {
          display: flex;
          gap: 0.25em;
          flex-shrink: 0;
        }
        .lexml-eta-anexos .anexo-campos {
          display: grid;
          grid-template-columns: minmax(10em, 1fr) minmax(10em, 2fr);
          gap: 1em;
          padding: 0.75em;
        }
        .lexml-eta-anexos .anexos-vazio {
          text-align: center;
          color: var(--sl-color-gray-600);
        }
        .lexml-eta-anexos .anexos-importar {
          display: flex;
          justify-content: center;
        }
        .lexml-eta-anexos .importar-campos {
          display: flex;
          flex-direction: column;
          gap: 1em;
        }
      </style>
      <div class="lexml-eta-anexos">
        ${this._anexos.length === 0 ? html`<p class="anexos-vazio">Nenhum anexo.</p>` : this._anexos.map((anexo, indice) => this.renderAnexo(anexo, indice))}
        <div class="anexos-importar">
          <sl-button id="btn-importar-anexo" variant="primary" @click=${this.abrirDialogo}>Importar anexo</sl-button>
        </div>
        ${this.renderDialogo()}
      </div>
    `;
  }

  private renderAnexo(anexo: Anexo, indice: number): TemplateResult {
    const tipos = this.tipos;
    return html`
      <div class="anexo" data-indice=${indice}>
        <div class="anexo-cabecalho">
          <span class="anexo-nome-arquivo"><span class="anexo-rotulo">Anexo</span>${anexo.nomeArquivo}</span>
          <div class="anexo-acoes">
            <sl-button
              class="btn-visualizar"
              size="small"
              title=${anexo.mimeType === MimeType.PDF ? 'Visualizar' : 'Visualização disponível apenas para PDF'}
              aria-label="Visualizar"
              .disabled=${anexo.mimeType !== MimeType.PDF}
              @click=${(): Promise<void> => this.visualizar(indice)}
            >
              <sl-icon name="eye"></sl-icon>
            </sl-button>
            <sl-button class="btn-baixar" size="small" title="Baixar" aria-label="Baixar" @click=${(): Promise<void> => this.baixar(indice)}>
              <sl-icon name="download"></sl-icon>
            </sl-button>
            <sl-button class="btn-subir" size="small" title="Para cima" aria-label="Para cima" .disabled=${indice === 0} @click=${(): void => this.mover(indice, -1)}>
              <sl-icon name="arrow-up"></sl-icon>
            </sl-button>
            <sl-button
              class="btn-descer"
              size="small"
              title="Para baixo"
              aria-label="Para baixo"
              .disabled=${indice === this._anexos.length - 1}
              @click=${(): void => this.mover(indice, 1)}
            >
              <sl-icon name="arrow-down"></sl-icon>
            </sl-button>
            <sl-button class="btn-excluir" size="small" variant="danger" title="Excluir" aria-label="Excluir" @click=${(): Promise<void> => this.excluir(indice)}>
              <sl-icon name="trash"></sl-icon>
            </sl-button>
          </div>
        </div>
        <div class="anexo-campos">
          <sl-select class="anexo-tipo" label="Tipo" size="small" .value=${anexo.tipo} @sl-change=${(evento: Event): void => this.alterarTipo(indice, evento)}>
            ${tipos.map(tipo => html`<sl-menu-item value=${tipo.codigo}>${tipo.nome}</sl-menu-item>`)}
          </sl-select>
          <sl-input
            class="anexo-nome-documento"
            label="Nome"
            size="small"
            .value=${anexo.nomeDocumento}
            @sl-change=${(evento: Event): void => this.alterarNomeDocumento(indice, evento)}
          ></sl-input>
        </div>
      </div>
    `;
  }

  private renderDialogo(): TemplateResult {
    return html`
      <sl-dialog
        id="dlg-importar-anexo"
        label="Importar anexo"
        ?open=${this._dialogAberto}
        @sl-request-close=${(evento: Event): void => {
          if (this._enviando) evento.preventDefault();
        }}
        @sl-after-hide=${(evento: Event): void => {
          // Os sl-select internos também emitem sl-after-hide.
          if ((evento.target as SlDialog).id === 'dlg-importar-anexo') this.fecharDialogo();
        }}
      >
        <div class="importar-campos">
          <label for="input-arquivo-anexo">Arquivo (PDF ou DOCX)</label>
          <input id="input-arquivo-anexo" type="file" accept=${ACCEPT} @change=${this.aoEscolherArquivo} />
          <sl-select
            id="select-tipo-anexo"
            label="Tipo"
            placeholder="Escolha o tipo"
            size="small"
            .value=${this._tipoDialog}
            @sl-change=${(evento: Event): void => {
              this._tipoDialog = String((evento.target as SlSelect).value);
            }}
          >
            ${this.tipos.map(tipo => html`<sl-menu-item value=${tipo.codigo}>${tipo.nome}</sl-menu-item>`)}
          </sl-select>
          <sl-input
            id="input-nome-anexo"
            label="Nome do documento"
            size="small"
            .value=${this._nomeDialog}
            @sl-input=${(evento: Event): void => {
              this._nomeDigitado = true;
              this._nomeDialog = (evento.target as SlInput).value;
            }}
          ></sl-input>
        </div>
        <sl-button slot="footer" id="btn-cancelar-importacao" ?disabled=${this._enviando} @click=${this.fecharDialogo}>Cancelar</sl-button>
        <sl-button slot="footer" id="btn-confirmar-importacao" variant="primary" .disabled=${!this.podeConfirmar} ?loading=${this._enviando} @click=${this.confirmarImportacao}>
          Confirmar
        </sl-button>
      </sl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-eta-anexos': AnexosComponent;
  }
}
