import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Option } from '../editor/autocomplete-async';
import { LexmlAutocomplete } from '../lexml-autocomplete';
import { ColegiadoApreciador, RefProposicaoEmendada } from '../../model/emenda/emenda';
import { Comissao } from './comissao';

@customElement('lexml-destino')
export class DestinoComponent extends LitElement {
  @query('#auto-complete-async')
  private _autocomplete!: LexmlAutocomplete;

  @state()
  private _comissoesAutocomplete: Option[] = [];

  @state()
  private comissaoSelecionada = '';
  private isMPV = false;
  private isPlenario = false;
  private tipoColegiadoPlenario = false;

  private _proposicao!: RefProposicaoEmendada;
  @property({ type: RefProposicaoEmendada })
  set proposicao(value: RefProposicaoEmendada) {
    this._autocomplete.value = '';
    this._proposicao = value;
    this.isMPV = false;
    if (this._proposicao.sigla === 'MPV') {
      this._colegiadoApreciador.siglaCasaLegislativa = 'CN';
      this._colegiadoApreciador.tipoColegiado = 'Comissão';
      this._colegiadoApreciador.siglaComissao = `CMMPV ${this._proposicao.numero}/${this._proposicao.ano}`;
      this._autocomplete.value = `${this._colegiadoApreciador.siglaComissao} - COMISSÃO MISTA DA MEDIDA PROVISÓRIA N° ${this._proposicao.numero}, DE ${this._proposicao.ano}`;
      this.isMPV = true;
    }

    this.requestUpdate();
  }

  get proposicao(): RefProposicaoEmendada {
    return this._proposicao;
  }

  private _comissoes!: Comissao[];
  @property({ type: Array, state: true })
  set comissoes(value: Comissao[] | undefined) {
    this.isPlenario = false;
    if (!this._comissoes || this._comissoes.length === 0) {
      this._comissoes = value ? value : [];
      this._comissoesOptions = this.comissoes.map(comissao => new Option(comissao.sigla, `${comissao.sigla} - ${comissao.nome}`));
      this.requestUpdate();
    }
    if (typeof value === 'undefined') {
      this.isPlenario = true;
    }
  }

  get comissoes(): Array<Comissao> {
    return this._comissoes;
  }

  private _comissoesOptions: Option[] = [];

  private _colegiadoApreciador!: ColegiadoApreciador;
  @property({ type: Object, state: true })
  set colegiadoApreciador(value: ColegiadoApreciador | undefined) {
    this._colegiadoApreciador = value ? value : new ColegiadoApreciador();
    this.tipoColegiadoPlenario = this._colegiadoApreciador.tipoColegiado === 'Plenário' ? true : false;
    if (this._colegiadoApreciador.siglaComissao) {
      const option: Option = this._comissoesOptions.find(op => op.value === this._colegiadoApreciador.siglaComissao) || new Option('', '');
      this._autocomplete.value = option.description;
    }
    this.requestUpdate();
  }

  get colegiadoApreciador(): ColegiadoApreciador {
    return this._colegiadoApreciador;
  }

  render(): TemplateResult {
    return html`
      <style>
        .lexml-destino {
          display: block;
          font-size: 1em;
          max-width: 700px;
        }
        sl-radio-group::part(base) {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          background-color: var(--sl-color-gray-100);
          box-shadow: var(--sl-shadow-x-large);
          flex-wrap: wrap;
          padding: 20px 20px;
        }
        sl-radio-group::part(label) {
          background-color: var(--sl-color-gray-200);
          font-weight: bold;
          border-radius: 5px;
          border: 1px solid var(--sl-color-gray-300);
          padding: 2px 5px;
          box-shadow: var(--sl-shadow-small);
        }
        sl-radio-group > sl-radio:first-child {
          display: inline-flex;
          padding: 0 20px 0 0;
        }
        sl-input::part(form-control) {
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        sl-input::part(base) {
          max-width: 190px;
        }
        @media (max-width: 480px) {
          sl-input::part(base) {
            max-width: 150px;
          }
        }

        sl-radio-group::part(base) {
          box-shadow: none;
        }
      </style>
      <sl-radio-group label="Destino" fieldset class="lexml-destino">
        <div>
          <sl-radio-group id="tipoColegiado">
            <sl-radio
              name="tipoColegiado"
              @click=${() => this.clickTipoColegiado('Plenário')}
              ?checked=${this._colegiadoApreciador?.tipoColegiado === 'Plenário'}
              value="Plenário"
              ?disabled=${this.isMPV || this.isPlenario}
              >Plenário</sl-radio
            >
            <sl-radio
              name="tipoColegiado"
              @click=${() => this.clickTipoColegiado('Comissão')}
              ?checked=${this._colegiadoApreciador?.tipoColegiado === 'Comissão'}
              value="Comissão"
              ?disabled=${this.isMPV || this.isPlenario}
              >Comissão</sl-radio
            >
            <sl-radio
              name="tipoColegiado"
              @click=${() => this.clickTipoColegiado('Plenário via Comissão')}
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
            @blur=${this._blurAutoComplete}
            ?disabled=${this.isMPV || this.isPlenario || this.tipoColegiadoPlenario}
          ></autocomplete-async>
        </div>
      </sl-radio-group>
    `;
  }

  private clickTipoColegiado(value: any): void {
    if (!this.isMPV && !this.isPlenario) {
      this._colegiadoApreciador.tipoColegiado = value;
      this.tipoColegiadoPlenario = this._colegiadoApreciador.tipoColegiado === 'Plenário' ? true : false;
      this.requestUpdate();
    }
  }

  private _selecionarComissao(item: Option): void {
    this._colegiadoApreciador.siglaComissao = item.value;
  }

  private _filtroComissao(query: string): void {
    const regex = new RegExp(query, 'i');
    this._comissoesAutocomplete = this._comissoesOptions.filter(comissao => comissao.description.match(regex));
  }

  private _blurAutoComplete(): void {
    setTimeout(() => {
      const comissao = this._autocomplete.value ?? '';
      const comissaoSelecionada = this._comissoesOptions.find(comissaoOp => comissao === comissaoOp.description);

      if (!comissaoSelecionada) {
        this._autocomplete.value = '';
        this.comissaoSelecionada = '';
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
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-destino': DestinoComponent;
  }
}
