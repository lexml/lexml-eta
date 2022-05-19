import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

@customElement('lexml-eta-alertas')
export class AlertasComponent extends LitElement {
  static styles = css`
    sl-alert {
      --box-shadow: var(--sl-shadow-x-large);
      margin: 20px;
    }
  `;

  render(): TemplateResult {
    return html`
      <sl-alert variant="success" open closable class="alert-closable">
        <sl-icon slot="icon" name="check2-circle"></sl-icon>
        Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados antes
        antes de submetê-la.
      </sl-alert>
      <sl-alert variant="warning" open closable class="alert-closable">
        <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
        Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados antes
        antes de submetê-la.
      </sl-alert>
      <sl-alert variant="danger" open closable class="alert-closable">
        <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
        Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados antes
        antes de submetê-la.
      </sl-alert>
      <sl-alert variant="primary" open closable class="alert-closable">
        <sl-icon slot="icon" name="info-circle"></sl-icon>
        Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados antes
        antes de submetê-la.
      </sl-alert>
    `;
  }
}
