import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state, query, queryAll } from 'lit/decorators.js';

import { REGEX_ACCENTS } from './../../util/string-util';
import { Parlamentar, Autoria } from '../../model/emenda/emenda';
import { incluirParlamentar, excluirParlamentar, moverParlamentar } from '../../model/autoria/parlamentarUtil';
import { autoriaCss } from '../../assets/css/autoria.css';
import { LexmlAutocomplete } from './lexml-autocomplete';

const parlamentarVazio = new Parlamentar();

// Decorator para aguardar fim da validação para executar um método
function executarAposValidacao(interval = 200) {
  return function (_target: unknown, key: string | symbol, descriptor: PropertyDescriptor): any {
    return {
      get(): any {
        const wrapperFn = (...args: any[]): any => {
          let timer = 0;

          const executarMetodo = (): void => {
            clearInterval(timer);
            if (this['_isProcessandoValidacao']) {
              timer = window.setTimeout(() => executarMetodo(), interval);
              return;
            }

            descriptor.value.apply(this, args);
          };

          executarMetodo();
        };

        Object.defineProperty(this, key, { value: wrapperFn, configurable: true, writable: true });

        return wrapperFn;
      },
    };
  };
}

@customElement('lexml-autoria')
export class AutoriaComponent extends LitElement {
  static styles = [autoriaCss];

  @query('#btnNovoParlamentar')
  private _btnNovoParlamentar!: HTMLButtonElement;

  @queryAll('input#tex-cargo')
  private _inputCargos!: NodeListOf<HTMLInputElement>;

  @queryAll('lexml-autocomplete')
  private _autocompletes!: NodeListOf<LexmlAutocomplete>;

  @state()
  private _nomesAutocomplete: string[] = [];

  @state()
  private _podeIncluirParlamentar = true;

  private _parlamentaresAutocomplete: Parlamentar[] = [];
  @property({ type: Array })
  set parlamentares(value: Parlamentar[]) {
    const oldValue = this._parlamentaresAutocomplete;
    this._parlamentaresAutocomplete = value;
    this._nomesAutocomplete = value.map(p => p.nome);
    this.requestUpdate('parlamentares', oldValue);
  }

  get parlamentares(): Parlamentar[] {
    return this._parlamentaresAutocomplete;
  }

  private _autoriaOriginal?: Autoria;
  private _autoria!: Autoria;
  @property({ type: Object })
  set autoria(value: Autoria | undefined) {
    const oldValue = this._autoriaOriginal;
    this._autoriaOriginal = value;

    this._autoria = value ? { ...value, parlamentares: [...value.parlamentares] } : new Autoria();
    if (!this._autoria.parlamentares.length) {
      this._autoria.parlamentares = [{ ...parlamentarVazio }];
    }

    this._podeIncluirParlamentar = this._isAllAutoresOk();
    this.requestUpdate('autoria', oldValue);
  }

  get autoria(): Autoria | undefined {
    return this._autoriaOriginal;
  }

  getAutoriaAtualizada(): Autoria {
    return { ...this._autoria, parlamentares: this._autoria.parlamentares.filter(p => p.identificacao) };
  }

  render(): TemplateResult {
    return html`
      <sl-radio-group label="Autoria" fieldset class="lexml-autoria">
        ${this._getTipoAutoriaTemplate()}
        <div class="autoria-list">${this._getParlamentaresTemplate()}</div>
        <sl-button id="btnNovoParlamentar" variant="primary" @click=${this._incluirNovoParlamentar} ?disabled=${!this._podeIncluirParlamentar}>
          Incluir ${this._autoria?.parlamentares.length ? 'outro' : ''} parlamentar
        </sl-button>

        ${this._getAssinaturasAdicionaisTemplate()}

        <div class="assinaturas-adicionais">
          <label>
            <input type="checkbox" id="chk-exibir-partido-uf" ?checked=${this._autoria?.imprimirPartidoUF} @input=${(ev: Event): void => this._atualizarExibirPartidoUF(ev)} />
            Imprimir partido e UF para os signatários
          </label>
        </div>
      </sl-radio-group>
    `;
  }

  private _exibirTemplateTipoAutoria = false; // variável temporária
  private _getTipoAutoriaTemplate(): TemplateResult {
    return !this._exibirTemplateTipoAutoria
      ? html`<div></div>`
      : html`
          <fieldset class="autoria-label--tipo-autoria">
            <legend>Tipo de autoria</legend>
            <div class="control">
              <label class="radio">
                <input type="radio" id="opt-parlamentar" name="tipoAutoria" value="Parlamentar" ?checked=${this._autoria?.tipo === 'Parlamentar'} />
                Parlamentar
              </label>
              <label class="radio">
                <input type="radio" id="opt-comissao" name="tipoAutoria" value="Comissão" ?checked=${this._autoria?.tipo === 'Comissão'} />
                Comissão
              </label>
            </div>
          </fieldset>
        `;
  }

  private _getParlamentaresTemplate(): TemplateResult {
    return html`
      <div class="autoria-grid autoria-labels">
        <div class="autoria-grid--col1"><div class="autoria-header">Parlamentar</div></div>
        <div class="autoria-grid--col2"><div class="autoria-header">Cargo</div></div>
        <div class="autoria-grid--col3"><div class="autoria-buttons"></div></div>
      </div>
      ${this._autoria?.parlamentares.map((_, index) => this._getParlamentarAutocompleteTemplate(index))}
    `;
  }

  private _getParlamentarAutocompleteTemplate(index: number): TemplateResult {
    return html`
      <div class="autoria-grid">
        <div class="autoria-grid--col1">
          <label for="defaultInput" class="autoria-label">Parlamentar</label>
          <lexml-autocomplete
            class="lexml-autocomplete"
            .items=${this._nomesAutocomplete}
            value=${this._autoria.parlamentares[index].nome}
            @input=${(ev: Event): void => this._validarNomeParlamentar(ev, index)}
            @blur=${(ev: Event): void => this._validarNomeParlamentar(ev, index)}
            @autocomplete=${(ev: CustomEvent): void => this._atualizarParlamentar(ev, index)}
            @keyup=${(ev: KeyboardEvent): void => this._handleKeyUp(ev, index)}
            @click=${this._handleClickAutoComplete}
          ></lexml-autocomplete>
        </div>

        <div class="autoria-grid--col2">
          <label for="tex-cargo" class="autoria-label">Cargo</label>
          <sl-input
            type="text"
            id="tex-cargo"
            placeholder="ex: Presidente da Comissão ..., Líder do ..."
            class="autoria-input"
            aria-label="Cargo"
            size="small"
            .value=${this._autoria.parlamentares[index].cargo ?? ''}
            @input=${(ev: Event): void => this._atualizarCargo(ev, index)}
            @keyup=${(ev: KeyboardEvent): void => this._handleKeyUp(ev, index)}
          ></sl-input>
        </div>

        <div class="autoria-grid--col3">
          <div class="autoria-buttons">
            <sl-button id="paraBaixo" size="small" aria-label="Para baixo" title="Para baixo" @click=${(): void => this._moverParlamentar(index, 1)}>
              <sl-icon name="arrow-down"></sl-icon>
            </sl-button>
            <sl-button id="paraCima" size="small" aria-label="Para cima" title="Para cima" @click=${(): void => this._moverParlamentar(index, -1)}>
              <sl-icon name="arrow-up"></sl-icon>
            </sl-button>
            <sl-button id="excluir" size="small" aria-label="Excluir" title="Excluir" @click=${(): void => this._excluirParlamentar(index)}>
              <sl-icon name="trash"></sl-icon>
            </sl-button>
          </div>
        </div>
      </div>
    `;
  }

  private _getAssinaturasAdicionaisTemplate(): TemplateResult {
    return html`
      <div class="assinaturas-adicionais">
        <sl-input
          label="Quantidade de assinaturas adicionais de Senadores"
          type="number"
          id="num-assinaturas-adicionais-senadores"
          class="autoria-input"
          aria-label="Assinaturas Adicionais Senadores"
          size="small"
          .value=${this._autoria?.quantidadeAssinaturasAdicionaisSenadores.toString() ?? '0'}
          @input=${(ev: Event): void => this._atualizarQtdAssinaturasAdicionaisSenadores(ev)}
        ></sl-input>
        <sl-input
          label="Quantidade de assinaturas adicionais de Deputados Federais"
          type="number"
          id="num-assinaturas-adicionais-deputados"
          class="autoria-input"
          aria-label="Assinaturas Adicionais deputados"
          size="small"
          .value=${this._autoria?.quantidadeAssinaturasAdicionaisDeputados.toString() ?? '0'}
          @input=${(ev: Event): void => this._atualizarQtdAssinaturasAdicionaisDeputados(ev)}
        ></sl-input>
      </div>
    `;
  }

  updated(): void {
    this._isProcessandoMovimentacao = false;
  }

  private _isAllAutoresOk(): boolean {
    return this._autoria.parlamentares.every(p => p.identificacao);
  }

  private _incluirNovoParlamentar(): void {
    this._autoria.parlamentares = incluirParlamentar(this._autoria.parlamentares, { ...parlamentarVazio });
    this._podeIncluirParlamentar = false;
    setTimeout(() => this._autocompletes[this._autoria.parlamentares.length - 1].focus(), 200);
  }

  @executarAposValidacao()
  private _moverParlamentar(index: number, deslocamento: number): void {
    this._autoria.parlamentares = moverParlamentar(this._autoria.parlamentares, index, deslocamento);
    this.emitirEventoOnChange('moverAutor');
    this.requestUpdate();
  }

  @executarAposValidacao()
  private _excluirParlamentar(index: number): void {
    this._autoria.parlamentares = excluirParlamentar(this._autoria.parlamentares, index);
    if (!this._autoria.parlamentares.length) {
      this._autoria.parlamentares = [{ ...parlamentarVazio }];
    }
    this._podeIncluirParlamentar = this._isAllAutoresOk();
    this.emitirEventoOnChange('excluirAutor');
    this.requestUpdate();
  }

  private _timerValidacao = 0;
  protected _isProcessandoValidacao = false;
  private _validarNomeParlamentar(ev: Event, index: number): void {
    this._isProcessandoValidacao = true;
    const isBlur = ev.type === 'blur';

    if (!isBlur) {
      clearInterval(this._timerValidacao);
    }

    // O trecho abaixo está dentro de um setTimeout por dois motivos:
    // 1 - Debounce quando ev.type é "input"
    // 2 - O clique de um nome na lista do autocomplete dispara o evento "blur"
    //     e é preciso dar tempo do @autocomplete ser executado e preencher o input com o nome selecionado antes da validação
    this._timerValidacao = window.setTimeout(
      () => {
        const elLexmlAutocomplete = this._autocompletes[index];
        const cargoAtual = this._autoria.parlamentares[index].cargo;
        const nomeAtual = elLexmlAutocomplete.value ?? '';

        const regex = new RegExp('^' + nomeAtual.normalize('NFD').replace(REGEX_ACCENTS, '') + '$', 'i');
        const parlamentar = this.parlamentares.find(p =>
          p.nome
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .match(regex)
        ) || { ...parlamentarVazio, nome: isBlur ? '' : nomeAtual };

        const parlamentarEhValido = !!parlamentar.identificacao;

        parlamentar.cargo = isBlur && !parlamentarEhValido ? '' : cargoAtual;

        this._autoria.parlamentares[index] = { ...parlamentar };
        this._podeIncluirParlamentar = parlamentarEhValido && this._isAllAutoresOk();

        this._isProcessandoValidacao = false;
      },
      ev.type === 'blur' ? 200 : 0
    );
  }

  private timerEmitirEventoOnChange = 0;
  private _atualizarParlamentar(ev: CustomEvent, index: number): void {
    const parlamentarAutocomplete = this.parlamentares.find(p => p.nome === ev.detail.value);
    if (parlamentarAutocomplete) {
      const { cargo } = this._autoria.parlamentares[index];
      this._autoria.parlamentares[index] = {
        ...parlamentarAutocomplete,
        cargo,
      };
    }
    this._podeIncluirParlamentar = !!parlamentarAutocomplete && this._isAllAutoresOk();
    (ev.target as HTMLElement).focus();
    this._lastIndexAutoCompleted = index;

    clearInterval(this.timerEmitirEventoOnChange);
    this.timerEmitirEventoOnChange = window.setTimeout(() => this.emitirEventoOnChange('atualizarAutor'), 500);
    this.requestUpdate();
  }

  private _atualizarCargo(ev: Event, index: number): void {
    this._autoria.parlamentares[index].cargo = (ev.target as HTMLInputElement).value;
  }

  private _atualizarQtdAssinaturasAdicionaisSenadores(ev: Event): void {
    this._autoria.quantidadeAssinaturasAdicionaisSenadores = Number((ev.target as HTMLInputElement).value);
  }

  private _atualizarQtdAssinaturasAdicionaisDeputados(ev: Event): void {
    this._autoria.quantidadeAssinaturasAdicionaisDeputados = Number((ev.target as HTMLInputElement).value);
  }

  private _atualizarExibirPartidoUF(ev: Event): void {
    this._autoria.imprimirPartidoUF = (ev.target as HTMLInputElement).checked;
  }

  private _isProcessandoMovimentacao = false;
  private _lastIndexAutoCompleted = -1;
  private _handleKeyUp(ev: KeyboardEvent, index: number): void {
    if (!ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
      if (ev.key === 'Enter' && this._podeIncluirParlamentar && index !== this._lastIndexAutoCompleted) {
        this._btnNovoParlamentar.click();
        this._lastIndexAutoCompleted = -1;
      } else if (['ArrowUp', 'ArrowDown'].includes(ev.key) && this._autoria.parlamentares[index].identificacao) {
        this._focarAutocompleteOuCargo(ev.target!, index, ev.key === 'ArrowUp' ? -1 : 1);
      }
    } else if (ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
      if (ev.key === 'ArrowUp') {
        if (!this._isProcessandoMovimentacao) {
          this._isProcessandoMovimentacao = true;
          this._moverParlamentar(index, -1);
          this._focarAutocompleteOuCargo(ev.target!, index, -1);
        }
      } else if (ev.key === 'ArrowDown') {
        if (!this._isProcessandoMovimentacao) {
          this._isProcessandoMovimentacao = true;
          this._moverParlamentar(index, 1);
          this._focarAutocompleteOuCargo(ev.target!, index, 1);
        }
      }
    }
  }

  private _focarAutocompleteOuCargo(el: EventTarget, index: number, deslocamento: number): void {
    const nodes = (el as HTMLElement).tagName === 'LEXML-AUTOCOMPLETE' ? this._autocompletes : this._inputCargos;
    const newIndex = index + deslocamento;
    if (newIndex < 0 || newIndex >= nodes.length) {
      return;
    }
    setTimeout(() => nodes[newIndex].focus(), 0);
  }

  private _handleClickAutoComplete(): void {
    window.setTimeout(() => (this._lastIndexAutoCompleted = -1), 0);
  }

  private emitirEventoOnChange(origemEvento: string): void {
    this.dispatchEvent(
      new CustomEvent('onchange', {
        bubbles: true,
        composed: true,
        detail: {
          origemEvento,
        },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-autoria': AutoriaComponent;
  }
}
