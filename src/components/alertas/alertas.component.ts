import { LitElement, html, TemplateResult, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { connect } from 'pwa-helpers';
import { rootStore } from '../../redux/store';
import { Alerta } from '../../model/alerta/alerta';
// import { limparAlertas, removerAlerta } from '../../redux/alerta/reducer/actions';
import { limparAlertas } from '../../model/alerta/acao/limparAlertas';
import { removerAlerta } from '../../model/alerta/acao/removerAlerta';
import { LexmlEmendaComponent } from '../lexml-emenda.component';
import SlBadge from '@shoelace-style/shoelace/dist/components/badge/badge';

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
    this.alertas = state.elementoReducer.ui?.alertas || [];
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

  limparAlertas(): void {
    // limpa o array de alertas para do state do alertaReducer
    rootStore.dispatch(limparAlertas());
  }

  updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('alertas')) {
      const slAlertas = this.shadowRoot?.querySelectorAll('sl-alert');
      slAlertas?.forEach(alerta => {
        alerta.addEventListener('sl-after-hide', event => {
          rootStore.dispatch(removerAlerta((event.target as Element).id));
        });
      });
      const lexmlEmenda = document.querySelector('lexml-emenda') as LexmlEmendaComponent;
      lexmlEmenda.totalAlertas = this.alertas.length;
      const oldValue = changedProperties.get('alertas')?.length || 0;

      if (lexmlEmenda.totalAlertas > oldValue) {
        const badge = document.querySelector('#contadorAvisos')?.querySelector('sl-badge') as SlBadge;
        if (badge) {
          badge.pulse = true;
        }
      }
    }
  }

  render(): TemplateResult {
    return html`
      ${map(
        this.alertas,
        alerta =>
          html`${alerta.podeFechar
            ? html` <sl-alert variant="${alerta.tipo}" id="${alerta.id}" open closable class="alert-closable"> ${this.getAlertIcon(alerta.tipo)} ${alerta.mensagem} </sl-alert> `
            : html` <sl-alert variant="${alerta.tipo}" id="${alerta.id}" open> ${this.getAlertIcon(alerta.tipo)} ${alerta.mensagem} </sl-alert> `}`
      )}
    `;
  }
}
