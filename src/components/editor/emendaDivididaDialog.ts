import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, query } from 'lit/decorators.js';

@customElement('emenda-dividida-modal')
export class emendaDivididaDialog extends LitElement {
  @query('sl-dialog')
  private slDialog!: any;

  public show(): void {
    this.slDialog.show();
  }

  static styles = css`
    :host {
      font-family: var(--sl-font-sans);
      --sl-dialog-width: 500px;
      font-weight: normal;
    }
    #textoDividido {
      margin: 20px;
    }
  `;

  render(): TemplateResult {
    return html`
      <sl-dialog label="Proposição dividida em páginas">
        <div id="textoDividido">
          <p>Esta proposição é muito grande e foi dividida em páginas para facilitar a edição.</p>
          <p>A seleção da página para a edição é feita na barra de ferramentas.</p>
        </div>
        <sl-button slot="footer" variant="primary" @click=${(): void => this.slDialog.hide()}>OK</sl-button>
      </sl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'emenda-dividida-modal': emendaDivididaDialog;
  }
}
