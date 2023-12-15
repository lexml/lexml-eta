/* eslint-disable @typescript-eslint/no-unused-vars */
import { customElement, property, query } from 'lit/decorators.js';
import { LitElement, html, css, TemplateResult } from 'lit';

@customElement('lexml-sufixos-modal')
export class SufixosModalComponent extends LitElement {
  @property({ type: Number }) private step = 1;
  @query('sl-dialog') private slDialog!: any;

  static styles = css`
    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap; /* Quebra de linha no mobile ou quando o espaço for insuficiente */
    }

    .footer-container sl-switch {
      order: 1; /* Garante que o switch sempre venha primeiro */
      margin-right: auto; /* Empurra qualquer conteúdo à sua direita para o canto mais distante */
    }

    .footer-container sl-button {
      order: 2; /* Garante que o botão sempre venha depois do switch */
      margin-left: auto; /* Empurra qualquer conteúdo à sua esquerda para o canto mais distante */
    }
  `;

  public show(): void {
    const noShowAgain = localStorage.getItem('naoMostrarExplicacaoSufixo');
    const noShowAgainSwitch = this.shadowRoot?.querySelector('#noShowAgain') as any;
    if (noShowAgain && noShowAgainSwitch) {
      noShowAgainSwitch.checked = true;
    }
    this.slDialog.show();
  }

  private handleSwitchChange(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      localStorage.setItem('naoMostrarExplicacaoSufixo', 'true');
    } else {
      localStorage.removeItem('naoMostrarExplicacaoSufixo');
    }
  }

  render(): TemplateResult {
    return html`
      <sl-dialog>
        <span slot="label">Sufixos de posicionamento</span>

        <div>
          <p>
            Os sufixos na numeração de dispositivos, como -1, -2 e assim por diante, são usados para orientar o posicionamento na redação final. Eles não indicam uma numeração
            definitiva.
          </p>
          <p>Os dispositivos propostos e adjacentes deverão ser devidamente renumerados no momento da consolidação das emendas ao texto da proposição pela Redação Final.</p>
        </div>

        <div slot="footer" class="footer-container">
          <sl-switch id="noShowAgain" @sl-change=${this.handleSwitchChange}> Não mostrar novamente </sl-switch>

          <sl-button variant="default" @click=${(): void => this.slDialog.hide()}> Fechar </sl-button>
        </div>
      </sl-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-sufixos-modal': SufixosModalComponent;
  }
}
