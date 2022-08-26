import { LitElement, html, TemplateResult, css } from 'lit';
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
          <div><b>ctrl-shift-a</b>&nbsp;-&nbsp;Seleciona o texto do dispositivo atual</div>
          <div><b>ctrl-a</b>&nbsp;-&nbsp;Seleciona todos os dispositivos da articulação</div>
          <div><b>ctrl-home</b>&nbsp;-&nbsp;Vai para o primeiro dispositivo</div>
          <div><b>ctrl-end</b>&nbsp;-&nbsp;Vai para o último dispositivo</div>
          <div><b>alt-&uarr;</b>&nbsp;-&nbsp;Move o dispositivo acima</div>
          <div><b>alt-&darr;</b>&nbsp;-&nbsp;Move o dispositivo abaixo</div>
          <div><b>ctrl-f;</b>&nbsp;-&nbsp;Localizar texto</div>
          <hr></hr>
          <div><b>enter</b>&nbsp;-&nbsp;Finaliza a edição do dispositivo atual e cria um novo</div>
          <div><b>ctrl-d</b>&nbsp;-&nbsp;Remove dispositivo atual</div>
          <div><b>ctrl-z</b>&nbsp;-&nbsp;Desfaz ultima alteração</div>
          <div><b>ctrl-y</b>&nbsp;-&nbsp;Refaz alteração</div>
          <hr></hr>
          <div><b>ctrl-alt-A</b>&nbsp;-&nbsp;Transforma o dispositivo em artigo</div>
          <div><b>ctrl-alt-L</b>&nbsp;-&nbsp;Transforma o dispositivo em alínea</div>
          <div><b>ctrl-alt-N</b>&nbsp;-&nbsp;Transforma o dispositivo em inciso</div>
          <div><b>ctrl-alt-O</b>&nbsp;-&nbsp;Transforma o dispositivo em omissis</div>
          <div><b>ctrl-alt-P</b>&nbsp;-&nbsp;Transforma o dispositivo em parágrafo</div>
          <div><b>ctrl-alt-T</b>&nbsp;-&nbsp;Transforma o dispositivo em item</div>
          <div><b>tab</b>&nbsp;-&nbsp;Indenta para a direita o dispositivo, transformando-o no tipo mais provável</div>
          <div><b>shift-tab</b>&nbsp;-&nbsp;Recua o dispositivo para a esquerda, transformando-o no tipo mais provável</div>
          <hr></hr>
          <div><b>ctrl-alt-R</b>&nbsp;-&nbsp;Renumera o dispositivo</div>
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
