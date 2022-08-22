import { ComandoEmenda } from './../../model/emenda/emenda';
import { ComandoEmendaComponent } from './comandoEmenda.component';
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';

@customElement('lexml-emenda-comando-modal')
export class ComandoEmendaModalComponent extends LitElement {
  @query('sl-dialog')
  private slDialog!: any;

  @query('#comando-emenda-modal')
  private lexmlComandoEmenda!: ComandoEmendaComponent;

  @property({ type: Object })
  private comandoEmenda?: ComandoEmenda;

  public atualizarComandoEmenda(comandoEmenda: ComandoEmenda): void {
    this.lexmlComandoEmenda.emenda = comandoEmenda;
  }

  public show(): void {
    this.slDialog.show();
  }

  render(): TemplateResult {
    return html`
      <sl-dialog label="Comando">
        <lexml-emenda-comando id="comando-emenda-modal" .emenda=${this.comandoEmenda}></lexml-emenda-comando>
        <sl-button slot="footer" variant="primary" @click=${(): void => this.slDialog.hide()}>Fechar</sl-button>
      </sl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-emenda-comando-modal': ComandoEmendaModalComponent;
  }
}
