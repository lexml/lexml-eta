import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('lexml-data')
export class DataComponent extends LitElement {
  static styles = css`
    .lexml-data {
      display: block;
      /* height: 100%; */
      /* padding: 5px 10px; */
      /* margin: 0px 5px; */
      font-size: 1em;
      max-width: 700px;
    }
  `;

  @query('#input-data')
  inputData!: HTMLInputElement;

  // @query('#opt-data')
  // optData!: HTMLInputElement;

  @property({ type: String })
  data?: string;

  render(): TemplateResult {
    return html`
      <style>
        sl-radio-group::part(base) {
          display: flex;
          flex-direction: row;
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
      </style>
      <div class="lexml-data">
        <sl-radio-group label="Data" fieldset>
          <sl-radio name="data" value="1" ?checked=${!this.data} @click=${this.resetDate}>Não informar</sl-radio>
          <sl-radio name="data" value="2" ?checked=${!!this.data} @click=${this.setDate}>
            <sl-input id="input-data" label="Data" type="date" ?disabled=${!this.data} value=${this.data || this.getCurrentDate()} @input=${this.setDate}></sl-input>
          </sl-radio>
        </sl-radio-group>
      </div>
    `;
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString().split('/').reverse().join('-');
  }

  private resetDate(): void {
    const original = this.data;
    this.data = '';
    if (original !== this.data) {
      this.agendarEmissaoEventoOnChange();
    }
  }

  private setDate(): void {
    if (this.inputData) {
      const original = this.data;
      this.data = this.inputData.value;
      if (original !== this.data) {
        this.agendarEmissaoEventoOnChange();
      }
    }
  }

  private timerOnChange = 0;
  private agendarEmissaoEventoOnChange(): void {
    clearTimeout(this.timerOnChange);
    this.timerOnChange = window.setTimeout(() => this.emitirEventoOnChange(), 1000);
  }

  private emitirEventoOnChange(): void {
    this.dispatchEvent(
      new CustomEvent('onchange', {
        bubbles: true,
        composed: true,
        detail: {
          origemEvento: 'data',
        },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-data': DataComponent;
  }
}
