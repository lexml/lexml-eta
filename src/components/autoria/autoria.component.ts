import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state, query, queryAll } from 'lit/decorators.js';

import { REGEX_ACCENTS } from './../../util/string-util';
import { Parlamentar } from './../../model/autoria/parlamentar';
import { Autoria } from './../../model/autoria/autoria';
import { incluirParlamentar, excluirParlamentar, moverParlamentar } from '../../model/autoria/parlamentarUtil';
import { autoriaCss } from '../../assets/css/autoria.css';
import { LexmlAutocomplete } from './lexml-autocomplete';

const estadoInicialAutoria: Autoria = {
  tipo: 'Parlamentar',
  parlamentares: [],
  indImprimirPartidoUF: false,
  qtdAssinaturasAdicionaisDeputados: 0,
  qtdAssinaturasAdicionaisSenadores: 0,
};

const parlamentarVazio: Parlamentar = {
  id: '',
  nome: '',
  siglaPartido: '',
  siglaUF: '',
  indSexo: '',
  siglaCasa: '',
  cargo: '',
};

@customElement('lexml-autoria')
export class AutoriaComponent extends LitElement {
  static styles = [autoriaCss];

  @query('#btnNovoParlamentar')
  private _btnNovoParlamentar!: HTMLButtonElement;

  @queryAll('input#tex-cargo')
  private _inputCargos!: NodeListOf<HTMLInputElement>;

  @queryAll('lexml-autocomplete')
  private _autocompletes!: NodeListOf<LexmlAutocomplete>;

  @property({ type: Object })
  autoria: Autoria = { ...estadoInicialAutoria, parlamentares: [] };

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

  render(): TemplateResult {
    return html`
      <div class="lexml-autoria">
        <h3>Autoria</h3>
        ${this._getTipoAutoriaTemplate()}
        <div class="autoria-list">${this._getParlamentaresTemplate()}</div>
        <button id="btnNovoParlamentar" @click=${this._incluirNovoParlamentar} ?disabled=${!this._podeIncluirParlamentar}>
          Incluir ${this.autoria.parlamentares.length ? 'outro' : ''} parlamentar
        </button>
        ${this._getAssinaturasAdicionaisTemplate()}
      </div>
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
                <input type="radio" id="opt-parlamentar" name="tipoAutoria" value="Parlamentar" ?checked=${this.autoria?.tipo === 'Parlamentar'} />
                Parlamentar
              </label>
              <label class="radio">
                <input type="radio" id="opt-comissao" name="tipoAutoria" value="Comissão" ?checked=${this.autoria?.tipo === 'Comissão'} />
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
      ${this.autoria?.parlamentares.map((_, index) => this._getParlamentarAutocompleteTemplate(index))}
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
            value=${this.autoria.parlamentares[index].nome}
            @input=${(ev: Event): void => this._validarNomeParlamentar(ev, index)}
            @blur=${(ev: Event): void => this._validarNomeParlamentar(ev, index)}
            @autocomplete=${(ev: CustomEvent): void => this._atualizarParlamentar(ev, index)}
            @keyup=${(ev: KeyboardEvent): void => this._handleKeyUp(ev, index)}
          ></lexml-autocomplete>
        </div>

        <div class="autoria-grid--col2">
          <label for="tex-cargo" class="autoria-label">Cargo</label>
          <input
            type="text"
            id="tex-cargo"
            placeholder="ex: Presidente da Comissão ..., Líder do ..."
            class="autoria-input"
            aria-label="Cargo"
            .value=${this.autoria.parlamentares[index].cargo ?? ''}
            @input=${(ev: Event): void => this._atualizarCargo(ev, index)}
            @keyup=${(ev: KeyboardEvent): void => this._handleKeyUp(ev, index)}
          />
        </div>

        <div class="autoria-grid--col3">
          <div class="autoria-buttons">
            <button class="autoria-button" id="paraBaixo" aria-label="Para baixo" title="Para baixo" @click=${(): void => this._moverParlamentar(index, 1)}>
              <i class="autoria-icon icon-down"></i>
              <span class="sr-only">Para baixo</span>
            </button>
            <button class="autoria-button" id="paraBaixo" aria-label="Para cima" title="Para cima" @click=${(): void => this._moverParlamentar(index, -1)}>
              <i class="autoria-icon icon-up"></i>
              <span class="sr-only">Para cima</span>
            </button>
            <button class="autoria-button" id="paraBaixo" aria-label="Excluir" title="Excluir" @click=${(): void => this._excluirParlamentar(index)}>
              <i class="autoria-icon icon-delete"></i>
              <span class="sr-only">Exluir</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _getAssinaturasAdicionaisTemplate(): TemplateResult {
    return html`
      <div class="assinaturas-adicionais">
        <div>
          <label for="num-assinaturas-adicionais-senadores" class="assinaturas-adicionais-label">Quantidade de assinaturas adicionais de Senadores</label>
          <input
            type="text"
            id="num-assinaturas-adicionais-senadores"
            class="autoria-input"
            aria-label="Assinaturas Adicionais Senadores"
            .value=${this.autoria.qtdAssinaturasAdicionaisSenadores.toString()}
            @input=${(ev: Event): void => this._atualizarQtdAssinaturasAdicionaisSenadores(ev)}
          />
        </div>

        <div>
          <label for="num-assinaturas-adicionais-deputados" class="assinaturas-adicionais-label">Quantidade de assinaturas adicionais de Deputados Federais</label>
          <input
            type="text"
            id="num-assinaturas-adicionais-deputados"
            class="autoria-input"
            aria-label="Assinaturas Adicionais deputados"
            .value=${this.autoria.qtdAssinaturasAdicionaisDeputados.toString()}
            @input=${(ev: Event): void => this._atualizarQtdAssinaturasAdicionaisDeputados(ev)}
          />
        </div>
      </div>
    `;
  }

  private _incluirNovoParlamentar(): void {
    this.autoria.parlamentares = incluirParlamentar(this.autoria.parlamentares, { ...parlamentarVazio });
    this.autoria = { ...this.autoria };
    this._podeIncluirParlamentar = false;
    setTimeout(() => this._autocompletes[this.autoria.parlamentares.length - 1].focus(), 200);
  }

  private _moverParlamentar(index: number, deslocamento: number): void {
    this.autoria.parlamentares = moverParlamentar(this.autoria.parlamentares, index, deslocamento);
    this.autoria = { ...this.autoria };
  }

  private _excluirParlamentar(index: number): void {
    this.autoria.parlamentares = excluirParlamentar(this.autoria.parlamentares, index);
    this._podeIncluirParlamentar = this.autoria.parlamentares.every(p => p.id);
    this.autoria = { ...this.autoria };
  }

  private _timerValidacao = 0;
  private _validarNomeParlamentar(ev: Event, index: number): void {
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
        const cargoAtual = this.autoria.parlamentares[index].cargo;
        const nomeAtual = elLexmlAutocomplete.value ?? '';

        const regex = new RegExp('^' + nomeAtual.normalize('NFD').replace(REGEX_ACCENTS, '') + '$', 'i');
        const parlamentar = this.parlamentares.find(p =>
          p.nome
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .match(regex)
        ) || { ...parlamentarVazio, nome: isBlur ? '' : nomeAtual };

        const parlamentarEhValido = !!parlamentar.id;

        parlamentar.cargo = isBlur && !parlamentarEhValido ? '' : cargoAtual;
        this._podeIncluirParlamentar = parlamentarEhValido && this.autoria.parlamentares.filter((_, _index) => _index !== index).every(p => p.id);

        this.autoria.parlamentares[index] = { ...parlamentar };

        // TODO: descobrir como atualizar os inputs via "dados reativos"
        elLexmlAutocomplete.value = parlamentar.nome;
        this._inputCargos[index].value = parlamentar.cargo!;
      },
      ev.type === 'blur' ? 200 : 0
    );
  }

  private _atualizarParlamentar(ev: CustomEvent, index: number): void {
    const parlamentarAutocomplete = this.parlamentares.find(p => p.nome === ev.detail.value);
    if (parlamentarAutocomplete) {
      const { cargo } = this.autoria.parlamentares[index];
      this.autoria.parlamentares[index] = {
        ...parlamentarAutocomplete,
        cargo,
      };
    }
    this._podeIncluirParlamentar = !!parlamentarAutocomplete;
    (ev.target as HTMLElement).focus();
    this._lastIndexAutoCompleted = index;
  }

  private _atualizarCargo(ev: Event, index: number): void {
    this.autoria.parlamentares[index].cargo = (ev.target as HTMLInputElement).value;
  }

  private _atualizarQtdAssinaturasAdicionaisSenadores(ev: Event): void {
    this.autoria.qtdAssinaturasAdicionaisSenadores = Number((ev.target as HTMLInputElement).value);
  }

  private _atualizarQtdAssinaturasAdicionaisDeputados(ev: Event): void {
    this.autoria.qtdAssinaturasAdicionaisDeputados = Number((ev.target as HTMLInputElement).value);
  }

  private _lastIndexAutoCompleted = -1;
  private _handleKeyUp(ev: KeyboardEvent, index: number): void {
    if (ev.key === 'Enter' && !ev.ctrlKey && !ev.altKey && !ev.shiftKey && this._podeIncluirParlamentar && index !== this._lastIndexAutoCompleted) {
      this._btnNovoParlamentar.click();
    }
    this._lastIndexAutoCompleted = -1;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-autoria': AutoriaComponent;
  }
}
