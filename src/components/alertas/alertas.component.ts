import { LitElement, html, TemplateResult, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { connect } from 'pwa-helpers';
import { rootStore } from '../../redux/store';
import { Alerta } from '../../model/alerta/alerta';
import { limparAlertas } from '../../model/alerta/acao/limparAlertas';
import { removerAlerta } from '../../model/alerta/acao/removerAlerta';
import { LexmlEmendaComponent } from '../lexml-emenda.component';
import SlBadge from '@shoelace-style/shoelace/dist/components/badge/badge';
import { TipoMensagem } from '../../model/lexml/util/mensagem';

const mapTipoMensagem = {
  [TipoMensagem.INFO]: {
    icon: 'info-circle',
    variant: 'primary',
  },
  [TipoMensagem.WARNING]: {
    icon: 'exclamation-triangle',
    variant: 'warning',
  },
  [TipoMensagem.ERROR]: {
    icon: 'exclamation-octagon',
    variant: 'danger',
  },
  [TipoMensagem.CRITICAL]: {
    icon: 'exclamation-octagon',
    variant: 'danger',
  },
  [TipoMensagem.SUCCESS]: {
    icon: 'check2-circle',
    variant: 'success',
  },
};

@customElement('lexml-eta-alertas')
export class AlertasComponent extends connect(rootStore)(LitElement) {
  static styles = css`
    sl-alert {
      --box-shadow: var(--sl-shadow-x-large);
      margin: 20px;
    }
    .alert__close-button {
      font-size: 1.25rem;
      float: right;
    }
  `;

  @property({ type: Array }) alertas: Alerta[] = [];

  stateChanged(state: any): void {
    this.alertas = state.elementoReducer.ui?.alertas || [];
  }

  getAlertIcon(tipoAlerta: TipoMensagem): TemplateResult {
    // if (tipoAlerta === 'success') {
    //   return html`<sl-icon slot="icon" name="check2-circle"></sl-icon>`;
    // } else if (tipoAlerta === 'warning') {
    //   return html`<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>`;
    // } else if (tipoAlerta === 'danger') {
    //   return html`<sl-icon slot="icon" name="exclamation-octagon"></sl-icon>`;
    // } else {
    //   return html`<sl-icon slot="icon" name="info-circle"></sl-icon>`;
    // }
    return html`<sl-icon slot="icon" name="${mapTipoMensagem[tipoAlerta].icon}"></sl-icon>`;
  }

  limparAlertas(): void {
    // limpa o array de alertas para do state.ui.alertas
    rootStore.dispatch(limparAlertas());
  }

  removeAlertaById(id: string): void {
    rootStore.dispatch(removerAlerta(id));
  }

  updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('alertas')) {
      this.alertas?.forEach(alerta => {
        this.shadowRoot?.getElementById(alerta.id)?.addEventListener('click', event => {
          event.stopImmediatePropagation();
          this.removeAlertaById((event.target as Element).id);
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
      ${this.alertas.map(
        alerta =>
          html` ${alerta.podeFechar
            ? html`
                <sl-alert variant="${mapTipoMensagem[alerta.tipo].variant}" open>
                  <sl-icon-button name="x" class="alert__close-button" id="${alerta.id}" label="fechar"></sl-icon-button>
                  ${this.getAlertIcon(alerta.tipo)} ${alerta.mensagem}
                </sl-alert>
              `
            : html` <sl-alert variant="${mapTipoMensagem[alerta.tipo].variant}" open> ${this.getAlertIcon(alerta.tipo)} ${alerta.mensagem} </sl-alert> `}`
      )}
    `;
  }
}
