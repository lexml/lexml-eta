import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('lexml-eta-atalhos')
export class AtalhosComponent extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 10px;
      font-family: var(--sl-font-sans);
    }
    .lx-eta-help-content div {
      color: black;
      padding: 2px 0px;
      text-decoration: none;
      display: block;
      white-space: wrap;
      font-size: 0.8em;
      font-weight: normal !important;
      text-align: left;
    }

    /* .lx-eta-help:hover .lx-eta-help-content {
      display: block;
    } */
  `;

  render(): TemplateResult {
    return html`
      <div class="lx-eta-help">
        <div class="lx-eta-help-content">
          <div><b>Ctrl+Shift+A</b>&nbsp;-&nbsp;Seleciona o texto do dispositivo atual</div>
          <!-- <div><b>Ctrl+A</b>&nbsp;-&nbsp;Seleciona todos os dispositivos da articulação</div> -->
          <div><b>Ctrl+Home</b>&nbsp;-&nbsp;Vai para o primeiro dispositivo</div>
          <div><b>Ctrl+End</b>&nbsp;-&nbsp;Vai para o último dispositivo</div>
          <div><b>Alt+&uarr;</b>&nbsp;-&nbsp;Move o dispositivo acima</div>
          <div><b>Alt+&darr;</b>&nbsp;-&nbsp;Move o dispositivo abaixo</div>
          <div><b>Ctrl+F;</b>&nbsp;-&nbsp;Localizar texto</div>
          <hr></hr>
          <div><b>Enter</b>&nbsp;-&nbsp;Finaliza a edição do dispositivo atual e cria um novo</div>
          <div><b>Ctrl+D</b>&nbsp;-&nbsp;Remove dispositivo atual</div>
          <div><b>Ctrl+Z</b>&nbsp;-&nbsp;Desfaz ultima alteração</div>
          <div><b>Ctrl+Y</b>&nbsp;-&nbsp;Refaz alteração</div>
          <hr></hr>
          <div><b>Tab</b>&nbsp;-&nbsp;Indenta para a direita o dispositivo, transformando-o no tipo mais provável</div>
          <div><b>Shift+Tab</b>&nbsp;-&nbsp;Recua o dispositivo para a esquerda, transformando-o no tipo mais provável</div>
          <hr></hr>
          <div><b>Ctrl+Alt+R</b>&nbsp;-&nbsp;Renumera o dispositivo</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-eta-atalhos': AtalhosComponent;
  }
}
