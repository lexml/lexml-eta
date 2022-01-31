import { customElement, html, LitElement, property, PropertyValues, TemplateResult } from 'lit-element';
import { connect } from 'pwa-helpers';
import { DOCUMENTO_PADRAO } from '../model/documento/modelo/documentoPadrao';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { rootStore } from '../redux/store';

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Object }) projetoNorma = {};

  createRenderRoot(): LitElement {
    return this;
  }

  update(changedProperties: PropertyValues): void {
    if (!this.projetoNorma || !this.projetoNorma['name']) {
      this.projetoNorma = DOCUMENTO_PADRAO;
    }
    rootStore.dispatch(openArticulacaoAction(this.projetoNorma, this.modo));

    super.update(changedProperties);
  }

  render(): TemplateResult {
    return html`
      <style>
        #gtx-trans {
          display: none;
        }

        lexml-eta-articulacao {
          display: block;
          height: 100%;
        }

        lexml-eta-articulacao:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }
      </style>
      <lexml-eta-articulacao></lexml-eta-articulacao>
    `;
  }
}
