import { LitElement, html, TemplateResult } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';

@customElement('lexml-alterar-largura-tabela-coluna-modal')
export class AlterarLarguraTabelaColunaModalComponent extends LitElement {
  @query('sl-dialog')
  private slDialog!: any;

  @query('sl-alert')
  private slAlert!: any;

  @property({ type: String })
  private valorLargura = '';

  @property({ type: String })
  private tipo = '';

  @property({ type: Function })
  callback;

  public show(width: string): void {
    this.valorLargura = width ? width.replace('%', '') : '';
    this.slAlert.hide();
    this.slDialog.show();
    setTimeout(() => {
      this.shadowRoot?.querySelector('sl-input')?.focus();
    }, 0);
  }

  public hide(): void {
    this.slDialog.hide();
  }

  private alterarLargura(): void {
    const width = parseInt(this.valorLargura);
    if (isNaN(width) || width < 1 || width > 100) {
      this.slAlert.show();
    } else if (this.callback) {
      this.callback(width);
      this.hide();
    }
  }

  render(): TemplateResult {
    return html`
      <style>
        :host {
          font-family: var(--sl-font-sans);
        }
        sl-input::part(base) {
          width: 150px;
        }
        sl-alert {
          margin-top: 20px;
        }
      </style>
      <sl-dialog label="Alterar a largura da ${this.tipo}">
        <label>Informe o percentual da largura da ${this.tipo}</label>
        <sl-input type="number" value=${this.valorLargura} width="30px" @input=${e => (this.valorLargura = e.target.value)}>
          <sl-icon name="percent" slot="suffix"></sl-icon>
        </sl-input>
        <sl-alert variant="warning" closable class="alert-closable">
          <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
          Informe uma valor numérico de 1 a 100.
        </sl-alert>
        <sl-button slot="footer" @click=${(): void => this.alterarLargura()}>Alterar</sl-button>
        <sl-button slot="footer" variant="primary" @click=${(): void => this.slDialog.hide()}>Fechar</sl-button>
      </sl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-alterar-largura-tabela-coluna-modal': AlterarLarguraTabelaColunaModalComponent;
  }
}
