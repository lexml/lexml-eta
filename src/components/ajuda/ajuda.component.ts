import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { connect } from 'pwa-helpers';
import { Elemento } from '../../model/elemento';
import { ElementoAction, isAcaoMenu } from '../../model/lexml/acao';
import { StateEvent, StateType } from '../../redux/state';
import { rootStore } from '../../redux/store';

@customElement('lexml-ajuda')
export class AjudaComponent extends connect(rootStore)(LitElement) {
  static styles = css`
    :host {
      padding: 0 10px;
      display: block;
      font-family: var(--sl-font-sans);
      font-size: var(--sl-font-size-small);
      font-weight: var(--sl-font-weight-normal);
    }
  `;
  @state()
  private elementoSelecionado?: Elemento;

  @state()
  private acoesMenu: ElementoAction[] = [];

  stateChanged(state: any): void {
    if (state.elementoReducer.ui?.events && state.elementoReducer.ui.events[0]?.stateType !== 'AtualizacaoAlertas') {
      this.processarStateEvents(state.elementoReducer.ui.events);
    }
  }

  private processarStateEvents(events: StateEvent[]): void {
    events?.forEach((event: StateEvent): void => {
      switch (event.stateType) {
        case StateType.ElementoSelecionado:
        case StateType.ElementoMarcado:
          if (events[events.length - 1] === event && event.elementos) {
            this.atualizarAjuda(event.elementos[0]);
          }
          break;
      }
    });
  }

  private atualizarAjuda(elemento: Elemento): void {
    this.elementoSelecionado = elemento;
    this.acoesMenu = (elemento.acoesPossiveis ?? []).filter((acao: ElementoAction) => isAcaoMenu(acao));
  }

  render(): TemplateResult {
    return !this.elementoSelecionado || !this.acoesMenu.length
      ? html``
      : html`
          <p>O que você pode fazer com o dispositivo selecionado:</p>
          <ul>
            <li>Sugerir uma nova redação para o dispositivo. Para isso basta alterar o texto do dispositivo selecionado.</li>
            <li>
              Adicionar um novo dispositivo após o dispositivo atual. Para isso vá para o final do texto e pressione a tecla
              <span class="badge">enter</span>.
            </li>
          </ul>

          <p>
            Além disso, clicando no menu de ações
            <span class="badge"><strong>⋮</strong></span> que fica à esquerda do dispositivo selecionado você também pode:
          </p>
          <ul>
            ${this.acoesMenu.map(am => html` <li>${am.descricao}</li> `)}
          </ul>
        `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-ajuda': AjudaComponent;
  }
}
