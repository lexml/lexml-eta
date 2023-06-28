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
    .lx-eta-help-content div div {
      color: black;
      padding: 0.4rem 0;
      text-decoration: none;
      display: block;
      white-space: wrap;
      font-size: 0.8em;
      font-weight: normal !important;
      text-align: left;
    }

    .lx-eta-help-info {
      display: block;
      font-weight: normal !important;
      text-align: left;
      color: #555555;
      background-color: #fefefe;
      border: 0.5px solid #ccc;
      padding: 0.5rem;
      margin-block: 0.1rem;
      border-radius: 0.5rem;
      font-style: italic;
    }
    .lx-eta-help-content h4 {
      padding-bottom: 0.5rem;
      margin: 0;
    }

    .lx-eta-help-group {
      background-color: #eeeeee;
      padding: 0.5rem;
      border-radius: 0.5rem;
      border: 0.5px solid #ccc;
      box-shadow: var(--sl-shadow-x-large);
      margin-block-end: 1rem;
    }
  `;

  render(): TemplateResult {
    return html`
      <div class="lx-eta-help">
        <div class="lx-eta-help-content">
          <h4>Desfazer e refazer</h4>
          <div class="lx-eta-help-group">
            <div><sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">Z</sl-badge>&nbsp;-&nbsp;Desfaz ultima alteração</div>
            <div><sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">Y</sl-badge>&nbsp;-&nbsp;Refaz alteração</div>
          </div>
          <h4>Seleção e navegação</h4>
          <div class="lx-eta-help-group">
            <div>
              <sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">Shift</sl-badge>+<sl-badge variant="neutral">A</sl-badge>&nbsp;-&nbsp;Seleciona o texto do
              dispositivo atual
            </div>
            <div><sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">Home</sl-badge>&nbsp;-&nbsp;Vai para o primeiro dispositivo</div>
            <div><sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">End</sl-badge>&nbsp;-&nbsp;Vai para o último dispositivo</div>
            <div><sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">F</sl-badge>&nbsp;-&nbsp;Localizar texto</div>
          </div>
          <h4>Criação e edição de dispositivos adicionados</h4>
          <div class="lx-eta-help-group">
            <div>
              <sl-badge variant="neutral">Enter</sl-badge>&nbsp;-&nbsp;Cria um novo dispositivo do mesmo tipo ou cria dispositivo subordinado quando termina com dois pontos
            </div>
            <div><span class="lx-eta-help-info">Os atalhos abaixo funcionam apenas para dispositivos adicionados</span></div>
            <div><sl-badge variant="neutral">Tab</sl-badge>&nbsp;-&nbsp;Indenta para a direita o dispositivo, transformando-o no tipo mais provável</div>
            <div>
              <sl-badge variant="neutral">Shift</sl-badge>+<sl-badge variant="neutral">Tab</sl-badge>&nbsp;-&nbsp;Recua o dispositivo para a esquerda, transformando-o no tipo mais
              provável
            </div>
            <div><sl-badge variant="neutral">Alt</sl-badge>+<sl-badge variant="neutral">&uarr;</sl-badge>&nbsp;-&nbsp;Move o dispositivo acima</div>
            <div><sl-badge variant="neutral">Alt</sl-badge>+<sl-badge variant="neutral">&darr;</sl-badge>&nbsp;-&nbsp;Move o dispositivo abaixo</div>
            <div><sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">D</sl-badge>&nbsp;-&nbsp;Remove dispositivo atual</div>
            <div><span class="lx-eta-help-info">Os atalhos abaixo funcionam apenas para dispositivos adicionados em alteração de normas</span></div>
            <div>
              <sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">Alt</sl-badge>+<sl-badge variant="neutral">N</sl-badge>&nbsp;-&nbsp;Numera o dispositivo que
              foi adicionado em alteração de norma
            </div>
            <div>
              <sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">Alt</sl-badge>+<sl-badge variant="neutral">O</sl-badge>&nbsp;-&nbsp;Omite dispositivos
              (transforma em linha pontilhada que representa um ou mais dispositivos omitidos)
            </div>
            <div><sl-badge variant="neutral">...</sl-badge>&nbsp;-&nbsp;Digitando três pontos no texto do dispositivo, cria-se uma linha pontilhada</div>
          </div>
          <h4>Formatação de texto</h4>
          <div class="lx-eta-help-group">
            <div><sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">N</sl-badge>&nbsp;-&nbsp;Aplica <b>negrito</b> ao texto selecionado</div>
            <div><sl-badge variant="neutral">Ctrl</sl-badge>+<sl-badge variant="neutral">I</sl-badge>&nbsp;-&nbsp;Aplica <i>itálico</i> ao texto selecionado</div>
          </div>
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
