import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { connect } from 'pwa-helpers';
import { rootStore } from '../../redux/store';
import { Alerta } from '../../model/alerta/alerta';

@customElement('lexml-eta-alertas')
export class AlertasComponent extends connect(rootStore)(LitElement) {
  static styles = css`
    sl-alert {
      --box-shadow: var(--sl-shadow-x-large);
      margin: 20px;
    }
  `;

  @property({ type: Array }) alertas: Alerta[] = [];

  stateChanged(state: any): void {
    this.alertas = state.alertaReducer.alertas;
  }

  getAlertIcon(tipo: string): TemplateResult {
    if (tipo === 'success') {
      return html`<sl-icon slot="icon" name="check2-circle"></sl-icon>`;
    } else if (tipo === 'warning') {
      return html`<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>`;
    } else if (tipo === 'danger') {
      return html`<sl-icon slot="icon" name="exclamation-octagon"></sl-icon>`;
    } else {
      return html`<sl-icon slot="icon" name="info-circle"></sl-icon>`;
    }
  }

  render(): TemplateResult {
    return html`
      ${map(
        this.alertas,
        alerta => html` <sl-alert variant="${alerta.tipo}" open closable class="alert-closable"> ${this.getAlertIcon(alerta.tipo)} ${alerta.mensagem} </sl-alert> `
      )}
    `;
  }
}
