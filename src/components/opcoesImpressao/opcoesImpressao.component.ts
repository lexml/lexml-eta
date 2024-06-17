import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { OpcoesImpressao } from '../../model/emenda/emenda';
import { SlSelect } from '@shoelace-style/shoelace';

@customElement('lexml-opcoes-impressao')
export class OpcoesImpressaoComponent extends LitElement {
  @query('#select-tamanho-fonte')
  tamanhoFonte!: SlSelect;

  private _opcoesImpressao!: OpcoesImpressao;
  @property({ type: Object, state: true })
  set opcoesImpressao(value: OpcoesImpressao) {
    this._opcoesImpressao = value ? value : new OpcoesImpressao();
    this.requestUpdate();
  }

  get opcoesImpressao(): OpcoesImpressao {
    return this._opcoesImpressao;
  }

  private timerEmitirEventoOnChange = 0;

  protected firstUpdated(): void {
    this.tamanhoFonte.addEventListener('sl-change', (ev: Event) => this._atualizarTamanhoFonte(ev));
  }
  render(): TemplateResult {
    return html`
      <style>
        fieldset {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          background-color: var(--sl-color-gray-100);
          box-shadow: var(--sl-shadow-x-large);
          flex-wrap: wrap;
          padding: 20px 20px;
          border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
          border-radius: var(--sl-border-radius-medium);
          max-width: 655px;
          margin: 1em 0 2em 0;
        }

        legend {
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
        sl-select {
          max-width: 400px;
        }
        label {
          line-height: var(--sl-toggle-size);
          font-size: var(--sl-font-size-small);
          display: flex;
          align-items: center;
          gap: 5px;
        }
      </style>

      <fieldset class="lexml-opcoes-impressao">
        <legend>Opções de impressão</legend>
        <div>
          <label class="lbl-imprimir-brasao" for="chk-imprimir-brasao">
            <input type="checkbox" id="chk-imprimir-brasao" ?checked=${this._opcoesImpressao?.imprimirBrasao} @input=${(ev: Event): void => this._atualizarImprimirBrasao(ev)} />
            Imprimir brasão
          </label>
        </div>
        <sl-input
          type="text"
          id="input-cabecalho"
          name="textoCabecalho"
          label="Texto do cabeçalho"
          value=${this._opcoesImpressao?.textoCabecalho}
          @input=${(ev: Event): void => this._atualizarTextoCabecalho(ev)}
          size="small"
        ></sl-input>
        <div>
          <sl-select id="select-tamanho-fonte" label="Tamanho da letra" size="small" value=${this._opcoesImpressao?.tamanhoFonte}>
            <sl-menu-item value="14">14</sl-menu-item>
            <sl-menu-item value="16">16</sl-menu-item>
            <sl-menu-item value="18">18</sl-menu-item>
          </sl-select>
        </div>
        <div>
          <label class="lbl-reduzir-espaco" for="chk-reduzir-espaco">
            <input
              type="checkbox"
              id="chk-reduzir-espaco"
              ?checked=${this._opcoesImpressao?.reduzirEspacoEntreLinhas}
              @input=${(ev: Event): void => this._atualizarReduzirEspacoEntreLinhas(ev)}
            />
            Reduzir espaço entre linhas
          </label>
        </div>
      </fieldset>
    `;
  }

  private _atualizarTextoCabecalho(ev: Event): void {
    this._opcoesImpressao.textoCabecalho = (ev.target as HTMLInputElement).value;
    this.requestUpdate();
  }

  private _atualizarImprimirBrasao(ev: Event): void {
    this._opcoesImpressao.imprimirBrasao = (ev.target as HTMLInputElement).checked;
    this.requestUpdate();
  }

  private _atualizarTamanhoFonte(ev: Event): void {
    const valorFonte = parseInt((ev.target as SlSelect).value as string);
    this._opcoesImpressao.tamanhoFonte = valorFonte;
    this.requestUpdate();
  }

  private _atualizarReduzirEspacoEntreLinhas(ev: Event): void {
    this._opcoesImpressao.reduzirEspacoEntreLinhas = (ev.target as HTMLInputElement).checked;
    this.requestUpdate();
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
