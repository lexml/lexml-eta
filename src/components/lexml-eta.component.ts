import { customElement, html, LitElement, property, PropertyValues, TemplateResult } from 'lit-element';
import { connect } from 'pwa-helpers';
import { EXEMPLO_CC } from '../../demo/doc/codigocivil-eta';
import { novaArticulacaoAction } from '../model/lexml/acao/novaArticulacaoAction';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { rootStore } from '../redux/store';

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) articulacao = '';

  createRenderRoot(): LitElement {
    return this;
  }

  update(changedProperties: PropertyValues): void {
    if (this.articulacao === 'codigo-civil') {
      rootStore.dispatch(openArticulacaoAction(EXEMPLO_CC));
    } else if (this.articulacao === 'nova') {
      rootStore.dispatch(novaArticulacaoAction());
    }
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
