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
        sl-radio-group > sl-radio {
          display: inline-flex;
        }
        sl-input::part(form-control) {
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
      </style>
      <div class="lexml-data">
        <sl-radio-group label="Data" fieldset>
          <sl-radio name="data" value="1" ?checked=${!this.data} @click=${this.resetDate}>Não informar</sl-radio>
          <sl-radio name="data" value="2" ?checked=${!!this.data} @click=${this.setDate}>
            <sl-input id="input-data" label="Data" type="date" ?disabled=${!this.data} clearable value=${this.data || this.getCurrentDate()} @input=${this.setDate}></sl-input>
          </sl-radio>
        </sl-radio-group>
      </div>
    `;
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString().split('/').reverse().join('-');
  }

  private resetDate(): void {
    this.data = '';
  }

  private setDate(): void {
    if (this.inputData) {
      this.data = this.inputData.value;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-data': DataComponent;
  }
}
