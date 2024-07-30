import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { AutocompleteAsync, Option } from '../editor/autocomplete-async';
import { ColegiadoApreciador, RefProposicaoEmendada } from '../../model/emenda/emenda';
import { Comissao } from './comissao';
import { rootStore } from '../../redux/store';
import { adicionarAlerta } from '../../model/alerta/acao/adicionarAlerta';
import { removerAlerta } from '../../model/alerta/acao/removerAlerta';
import { TipoMensagem } from '../../model/lexml/util/mensagem';

@customElement('lexml-destino')
export class DestinoComponent extends LitElement {
  @query('#auto-complete-async')
  private _autocomplete!: AutocompleteAsync;

  @state()
  private _comissoesAutocomplete: Option[] = [];

  private isMPV = false;

  private isPlenario = false;

  private tipoColegiadoPlenario = false;

  public isMateriaOrcamentaria = false;

  @state()
  private isErroComissaoSelecionada = false;

  private _proposicao!: RefProposicaoEmendada;

  @property({ type: RefProposicaoEmendada })
  set proposicao(value: RefProposicaoEmendada) {
    this._proposicao = value;
    this.isMPV = false;
    if (this._proposicao.sigla === 'MPV') {
      this.isMPV = true;
      this._colegiadoApreciador.tipoColegiado = 'Comissão';
      if (this.isMateriaOrcamentaria) {
        this._colegiadoApreciador.siglaComissao = 'CMO';
        this._autocomplete.value = `${this._colegiadoApreciador.siglaComissao} - COMISSÃO MISTA DE PLANOS, ORÇAMENTOS PÚBLICOS E FISCALIZAÇÃO`;
      } else {
        this._colegiadoApreciador.siglaComissao = `CMMPV ${this._proposicao.numero}/${this._proposicao.ano}`;
        this._autocomplete.value = `${this._colegiadoApreciador.siglaComissao} - COMISSÃO MISTA DA MEDIDA PROVISÓRIA N° ${this._proposicao.numero}, DE ${this._proposicao.ano}`;
      }
    }

    this.requestUpdate();
  }

  get proposicao(): RefProposicaoEmendada {
    return this._proposicao;
  }

  private _comissoes: Comissao[] = [];
  @property({ type: Array, state: true })
  set comissoes(value: Comissao[]) {
    this.isPlenario = false;
    if (!this._comissoes || this._comissoes.length === 0) {
      this._comissoes = value ? value : [];
      this._comissoesOptions = this.comissoes.map(comissao => new Option(comissao.sigla, `${comissao.sigla} - ${comissao.nome}`));
      this.ajustarValorAutocomplete();
      this.requestUpdate();
    }
    if (typeof value === 'undefined') {
      this.isPlenario = true;
    }
  }

  get comissoes(): Comissao[] {
    return this._comissoes;
  }

  private _comissoesOptions: Option[] = [];

  private ajustarValorAutocomplete(): void {
    if (this._colegiadoApreciador?.siglaComissao) {
      const option: Option = this._comissoesOptions.find(op => op.value === this._colegiadoApreciador.siglaComissao) || new Option('', '');
      this._selecionarComissao(option);
      this._autocomplete.value = option.description || this._colegiadoApreciador.siglaComissao;
    }
  }

  private _colegiadoApreciador!: ColegiadoApreciador;
  @property({ type: Object, state: true })
  set colegiadoApreciador(value: ColegiadoApreciador | undefined) {
    this._colegiadoApreciador = value ? value : new ColegiadoApreciador();
    this.tipoColegiadoPlenario = this._colegiadoApreciador.tipoColegiado === 'Plenário';
    if (this.tipoColegiadoPlenario) {
      this.ajustarTipoColegiadoPlenario();
    } else if (this._colegiadoApreciador.siglaComissao) {
      this.ajustarValorAutocomplete();
    } else {
      this._autocomplete.value = '';
    }
    if (!this.tipoColegiadoPlenario && !this._colegiadoApreciador.siglaComissao) {
      this.criarAlertaErroComissao();
    }
    this.requestUpdate();
  }

  public get colegiadoApreciador(): ColegiadoApreciador {
    return this._colegiadoApreciador;
  }

  render(): TemplateResult {
    return html`
      <style>
        fieldset {
          display: flex;
          flex-direction: column;
          gap: 1em;
          background-color: var(--sl-color-gray-100);
          box-shadow: var(--sl-shadow-x-large);
          flex-wrap: wrap;
          padding: 20px 20px;
          border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
          border-radius: var(--sl-border-radius-medium);
          max-width: 655px;
        }

        legend {
          background-color: var(--sl-color-gray-200);
          font-weight: bold;
          border-radius: 5px;
          border: 1px solid var(--sl-color-gray-300);
          padding: 2px 5px;
          box-shadow: var(--sl-shadow-small);
        }

        .mensagem {
          font-size: 0.8em;
          font-weight: normal;
          text-align: left;
          border: 1px solid;
          padding: 4px 10px;
          margin: 10px 0;
          display: inline-block;
          border-radius: 2px;
          font-family: var(--sl-font-sans);
        }

        .mensagem--danger {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }
      </style>
      <fieldset class="lexml-destino">
        <legend>Destino</legend>
        <div>
          <sl-radio-group id="tipoColegiado">
            <sl-radio
              name="tipoColegiado"
              @click=${(): void => this.updateTipoColegiado('Plenário')}
              @sl-change=${(evt: any): void => evt.target?.checked && this.updateTipoColegiado('Plenário')}
              ?checked=${this._colegiadoApreciador?.tipoColegiado === 'Plenário'}
              value="Plenário"
              ?disabled=${this.isMPV || this.isPlenario}
              >Plenário</sl-radio
            >
            <sl-radio
              name="tipoColegiado"
              @click=${(): void => this.updateTipoColegiado('Comissão')}
              @sl-change=${(evt: any): void => evt.target?.checked && this.updateTipoColegiado('Comissão')}
              ?checked=${this._colegiadoApreciador?.tipoColegiado === 'Comissão'}
              value="Comissão"
              ?disabled=${this.isMPV || this.isPlenario}
              >Comissão</sl-radio
            >
            <sl-radio
              name="tipoColegiado"
              @click=${(): void => this.updateTipoColegiado('Plenário via Comissão')}
              @sl-change=${(evt: any): void => evt.target?.checked && this.updateTipoColegiado('Plenário via Comissão')}
              ?checked=${this._colegiadoApreciador?.tipoColegiado === 'Plenário via Comissão'}
              value="Plenário via Comissão"
              ?disabled=${this.isMPV || this.isPlenario}
              >Plenário via Comissão</sl-radio
            >
          </sl-radio-group>
        </div>
        <div style="width:100%;margin-top:10px">
          <autocomplete-async
            id="auto-complete-async"
            label="Comissão"
            .async=${false}
            ?readonly=${this.isMPV || this.isPlenario}
            placeholder="ex: Comissão"
            .items=${this._comissoesAutocomplete}
            .onSearch=${value => this._filtroComissao(value)}
            .onSelect=${value => this._selecionarComissao(value)}
            .onChange="${() => true}"
            .onClick="${() => this._exibirComissoes()}"
            @blur=${this._blurAutoComplete}
            ?disabled=${this.isMPV || this.isPlenario || this.tipoColegiadoPlenario || !this.comissoes?.length}
          ></autocomplete-async>
          ${this.isErroComissaoSelecionada ? html` <div class="mensagem mensagem--danger">A comissão de destino deve ser selecionada.</div> ` : ''}
        </div>
      </fieldset>
    `;
  }

  private _exibirComissoes() {
    this._autocomplete.value = '';
    this._comissoesAutocomplete = [];
  }

  private criarAlertaErroComissao(): void {
    this.isErroComissaoSelecionada = true;
    const alerta = {
      id: 'alerta-global-comissao-nao-selecionada',
      tipo: TipoMensagem.CRITICAL,
      mensagem: 'A comissão de destino deve ser selecionada.',
      podeFechar: false,
    };
    rootStore.dispatch(adicionarAlerta(alerta));
  }

  private removerAlertaErroComissao(): void {
    this.isErroComissaoSelecionada = false;
    rootStore.dispatch(removerAlerta('alerta-global-comissao-nao-selecionada'));
  }

  private updateTipoColegiado(value: any): void {
    if (!this.isMPV && !this.isPlenario) {
      this._colegiadoApreciador.tipoColegiado = value;
      this.tipoColegiadoPlenario = this._colegiadoApreciador.tipoColegiado === 'Plenário';
      if (this.tipoColegiadoPlenario) this.ajustarTipoColegiadoPlenario();
      this.requestUpdate();
    }
  }

  private _selecionarComissao(item: Option): void {
    const comissaoSelecionada: Comissao = this._comissoes.find(op => op.sigla === item.value)!;
    if (comissaoSelecionada) {
      this._colegiadoApreciador.siglaCasaLegislativa = comissaoSelecionada.siglaCasaLegislativa;
      this._colegiadoApreciador.siglaComissao = comissaoSelecionada.sigla;
      this.removerAlertaErroComissao();
    }
  }

  private _filtroComissao(query: string): void {
    const regex = new RegExp(query, 'i');
    this._comissoesAutocomplete = this._comissoesOptions.filter(comissao => comissao.description.match(regex));
  }

  private _blurAutoComplete(): void {
    if (!this.comissoes?.length) return;

    setTimeout(() => {
      const comissao = this._autocomplete.value ?? '';
      const comissaoSelecionada = this._comissoesOptions.find(comissaoOp => comissao === comissaoOp.description);

      if (!comissaoSelecionada) {
        this._colegiadoApreciador.siglaComissao = '';
        this.criarAlertaErroComissao();
        this._autocomplete.value = '';
      }
    }, 200);
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

  private ajustarTipoColegiadoPlenario(): void {
    this._autocomplete.value = '';
    this._colegiadoApreciador.siglaComissao = '';
    this.removerAlertaErroComissao();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-destino': DestinoComponent;
  }
}
