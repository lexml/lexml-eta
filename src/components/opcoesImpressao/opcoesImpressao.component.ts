import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { OpcoesImpressao } from '../../model/emenda/emenda';

@customElement('lexml-opcoes-impressao')
export class OpcoesImpressaoComponent extends LitElement {
  @query('#chk-imprimir-brasao')
  imprimirBrasao!: HTMLInputElement;

  @query('#input-cabecalho')
  textoCabecalho!: HTMLInputElement;

  @query('#chk-reduzir-espaco')
  reduzirEspacoEntreLinhas!: HTMLInputElement;

  private _opcoesImpressao!: OpcoesImpressao;
  @property({ type: Object })
  set opcoesImpressao(value: OpcoesImpressao | undefined) {
    this._opcoesImpressao = value ? value : new OpcoesImpressao();
    this.requestUpdate();
  }

  get opcoesImpressao(): OpcoesImpressao {
    return this._opcoesImpressao;
  }

  private timerEmitirEventoOnChange = 0;

  static styles = css`
    .lexml-opcoes-impressao {
      display: block;
      margin: 20px 0 80px 0;
      font-size: 1em;
      max-width: 700px;
    }
  `;

  render(): TemplateResult {
    return html`
      <style>
        sl-radio-group::part(base) {
          display: flex;
          flex-direction: column;
          gap: 20px;
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

        sl-input::part(form-control) {
        }
        sl-input::part(base) {
        }
        @media (max-width: 480px) {
          sl-input::part(base) {
          }
        }
      </style>

      <sl-radio-group label="Opções de impressão" fieldset class="lexml-opcoes-impressao">
        <sl-checkbox id="chk-imprimir-brasao" ?checked=${this._opcoesImpressao?.imprimirBrasao} @input=${(ev: Event): void => this._atualizarImprimirBrasao(ev)}
          >Imprimir brasão</sl-checkbox
        >
        <sl-input
          type="text"
          id="input-cabecalho"
          name="textoCabecalho"
          label="Texto do cabeçalho"
          value=${this._opcoesImpressao?.textoCabecalho}
          @input=${(ev: Event): void => this._atualizarTextoCabecalho(ev)}
        ></sl-input>
        <sl-checkbox id="chk-reduzir-espaco" ?checked=${this._opcoesImpressao?.reduzirEspacoEntreLinhas} @input=${(ev: Event): void => this._atualizarReduzirEspacoEntreLinhas(ev)}
          >Reduzir espaço entre linhas</sl-checkbox
        >
      </sl-radio-group>
    `;
  }

  private _atualizarTextoCabecalho(ev: Event): void {
    this._opcoesImpressao.textoCabecalho = (ev.target as HTMLInputElement).value;
  }

  private _atualizarImprimirBrasao(ev: Event): void {
    this._opcoesImpressao.imprimirBrasao = (ev.target as HTMLInputElement).checked;
  }

  private _atualizarReduzirEspacoEntreLinhas(ev: Event): void {
    this._opcoesImpressao.reduzirEspacoEntreLinhas = (ev.target as HTMLInputElement).checked;
  }

  private agendarEmissaoEventoOnChange(origemEvento: string): void {
    clearInterval(this.timerEmitirEventoOnChange);
    this.timerEmitirEventoOnChange = window.setTimeout(() => this.emitirEventoOnChange(origemEvento), 500);
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
    'lexml-opcoes-impressao': OpcoesImpressaoComponent;
  }
}
