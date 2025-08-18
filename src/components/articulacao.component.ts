import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { connect } from 'pwa-helpers';

import { Elemento } from '../model/elemento';
import { LexmlEmendaConfig } from '../model/lexmlEmendaConfig';
import { rootStore } from '../redux/store';

@customElement('lexml-eta-emenda-articulacao')
export class ArticulacaoComponent extends connect(rootStore)(LitElement) {
  @property({ type: Array }) elementos: Elemento[] = [];
  @property({ type: Object }) lexmlEtaConfig: LexmlEmendaConfig = new LexmlEmendaConfig();

  constructor() {
    super();
    this.tabIndex = -1;
  }

  createRenderRoot(): LitElement {
    return this;
  }

  render(): TemplateResult {
    return html`
      <style>
        lexml-eta-emenda-editor {
          display: block;
          height: 100%;
        }

        lexml-eta-emenda-editor:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }
      </style>
      <lexml-eta-emenda-editor .lexmlEtaConfig=${this.lexmlEtaConfig}></lexml-eta-emenda-editor>
    `;
  }
}
