import { customElement, html, LitElement, property, PropertyValues, TemplateResult } from 'lit-element';
import { connect } from 'pwa-helpers';
import { ComandoEmendaBuilder } from '../emenda/comando-emenda-builder';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { buildJsonixArticulacaoFromProjetoNorma } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../model/lexml/documento/modelo/documentoPadrao';
import { rootStore } from '../redux/store';

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Object }) projetoNorma = {};

  createRenderRoot(): LitElement {
    return this;
  }

  getEmenda(): string {
    return JSON.stringify({
      comandosEmenda: new ComandoEmendaBuilder((this.projetoNorma as any).value.metadado.identificacao.urn!, rootStore.getState().elementoReducer.articulacao).getComandos(),
    });
  }

  getProjetoAtualizado(): string {
    const out = { ...this.projetoNorma };
    const articulacaoAtualizada = buildJsonixArticulacaoFromProjetoNorma(rootStore.getState().elementoReducer.articulacao);
    (out as any).value.projetoNorma[(out as any).value.projetoNorma.norma ? 'norma' : 'projeto'].articulacao.lXhier = articulacaoAtualizada.lXhier;
    return JSON.stringify(out);
  }

  update(changedProperties: PropertyValues): void {
    if (!this.projetoNorma || !this.projetoNorma['name']) {
      this.projetoNorma = DOCUMENTO_PADRAO;
    }
    const documento = buildProjetoNormaFromJsonix(this.projetoNorma, this.modo === ClassificacaoDocumento.EMENDA);

    rootStore.dispatch(openArticulacaoAction(documento.articulacao!));

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
