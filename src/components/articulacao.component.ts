import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { connect } from 'pwa-helpers';

import { Elemento } from '../model/elemento';
import { rootStore } from '../redux/store';

@customElement('lexml-eta-articulacao')
export class ArticulacaoComponent extends connect(rootStore)(LitElement) {
  @property({ type: Array }) elementos: Elemento[] = [];

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
        lexml-eta-editor {
          display: block;
          height: 100%;
        }

        lexml-eta-editor:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }
      </style>
      <lexml-eta-editor></lexml-eta-editor>
    `;
  }
}
