import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('lexml-opcoes-impressao')
export class OpcoesImpressao extends LitElement {
  @query('#chk-imprimir-brasao')
  imprimirBrasao!: HTMLInputElement;

  @query('#input-cabecalho')
  textoCabecalho!: HTMLInputElement;

  @query('#chk-reduzir-espaco')
  reduzirEspacoEntreLinhas!: HTMLInputElement;

  @property({ type: Boolean })
  brasao = false;

  @property({ type: String })
  cabecalho = '';

  @property({ type: Boolean })
  reduzirEspaco = false;

  static styles = css`
    .lexml-opcoes-impressao {
      display: block;
      /* height: 100%; */
      /* padding: 5px 10px; */
      margin: 20px 5px;
      font-size: 1em;
      max-width: 700px;
    }
  `;

  updated(): void {
    this.emitirEventoOnChange();
  }

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
        <sl-checkbox id="chk-imprimir-brasao">Imprimir brasão</sl-checkbox>
        <sl-input type="text" id="input-cabecalho" name="textoCabecalho" label="Texto do cabeçalho"></sl-input>
        <sl-checkbox id="chk-reduzir-espaco">Reduzir espaço entre linhas</sl-checkbox>
      </sl-radio-group>
    `;
  }

  private emitirEventoOnChange(): void {
    this.dispatchEvent(
      new CustomEvent('onchange', {
        bubbles: true,
        composed: true,
        detail: {
          origemEvento: 'opcoesImpressao',
        },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-opcoes-impressao': OpcoesImpressao;
  }
}
