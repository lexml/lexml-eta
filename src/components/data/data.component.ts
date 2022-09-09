import { LitElement, html, css, TemplateResult } from 'lit';
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

  @query('#opt-data')
  optData!: HTMLInputElement;

  @property({ type: String })
  data?: string;

  render(): TemplateResult {
    return html`
      <style>
        sl-radio-group::part(base) {
          display: flex;
          flex-direction: row;
          gap: 10px;
          background-color: #fff;
          box-shadow: var(--sl-shadow-x-large);
        }
        sl-radio-group > sl-radio {
          display: inline-flex;
        }
        sl-input::part(form-control) {
          display: flex;
          flex-direction: row;
          gap: 10px;
          align-items: center;
        }
      </style>
      <div class="lexml-data">
        <!-- <h3>Data</h3>
        <div class="control">
          <label class="radio">
            <input type="radio" id="opt-nao-informar" name="data" ?checked=${!this.data} @input=${(): void => (this.data = undefined)} />
            Não informar
          </label>
          <label class="radio">
            <input type="radio" id="opt-data" name="data" ?checked=${!!this.data} @input=${this.setDate} />
            Data
            <input type="date" id="input-data" value=${this.data || this.getCurrentDate()} @input=${this.setDate} />
          </label>
        </div> -->
        <sl-radio-group label="Data" fieldset>
          <sl-radio value="1" id="opt-nao-informar" name="data" id="opt-nao-informar" name="data" ?checked=${!this.data} @input=${(): void => (this.data = undefined)}
            >Não informar</sl-radio
          >
          <sl-radio value="2" id="opt-data" ?checked=${!!this.data} @input=${this.setDate}>
            <sl-input id="input-data" label="Data" type="date" clearable value=${this.data || this.getCurrentDate()} @input=${this.setDate}></sl-input>
          </sl-radio>
        </sl-radio-group>
      </div>
    `;
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString().split('/').reverse().join('-');
  }

  private setDate(): void {
    if (this.inputData) {
      this.data = this.inputData.value;
      this.optData.checked = true;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-data': DataComponent;
  }
}
