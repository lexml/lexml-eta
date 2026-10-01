import { LitElement, html, TemplateResult } from 'lit';
import { customElement, query } from 'lit/decorators.js';

@customElement('lexml-eta-ajuda-modal')
export class AjudaModalComponent extends LitElement {
  @query('sl-dialog')
  private slDialog!: any;

  public show(): void {
    this.slDialog.show();
  }

  render(): TemplateResult {
    return html`
      <style>
        :host {
          font-family: var(--sl-font-sans);
        }
      </style>
      <sl-dialog label="Dicas">
        <lexml-eta-ajuda></lexml-eta-ajuda>
        <sl-button slot="footer" variant="primary" @click=${(): void => this.slDialog.hide()}>Fechar</sl-button>
      </sl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-eta-ajuda-modal': AjudaModalComponent;
  }
}
