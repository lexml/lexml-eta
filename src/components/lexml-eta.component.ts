import { customElement, html, LitElement, property, PropertyValues, TemplateResult } from 'lit-element';
import { connect } from 'pwa-helpers';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { gerarComandoEmendaAction } from '../model/lexml/acao/gerarComandoEmendaAction';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { recuperarArticulacaoAtualizadaAction } from '../model/lexml/acao/recuperarArticulacaoAtualizadaAction';
import { buildJsonixArticulacaoFromProjetoNorma } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../model/lexml/documento/modelo/documentoPadrao';
import { StateType } from '../redux/state';
import { rootStore } from '../redux/store';

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Object }) projetoNorma = {};

  emenda = {};
  projetoAtualizado = {};

  createRenderRoot(): LitElement {
    return this;
  }

  geraEmenda(): void {
    (this.projetoNorma as any)?.value.metadado.identificacao.urn &&
      rootStore.dispatch(gerarComandoEmendaAction.execute((this.projetoNorma as any).value.metadado.identificacao.urn!));
  }

  geraProjetoAtualizado(): void {
    rootStore.dispatch(recuperarArticulacaoAtualizadaAction());
  }

  private buildProjetoAtualizadoEmJson(state): void {
    const out = { ...this.projetoNorma };
    const articulacaoAtualizada = buildJsonixArticulacaoFromProjetoNorma(state.elementoReducer.articulacao);
    (out as any).value.projetoNorma[(out as any).value.projetoNorma.norma ? 'norma' : 'projeto'].articulacao.lXhier = articulacaoAtualizada.lXhier;
    this.projetoAtualizado = JSON.stringify(out);
  }

  private buildComandoEmenda(state): void {
    (document.getElementById('lexmlEmendaComando') as any).emenda = state.elementoReducer.ui.events[0]?.emenda;
  }

  stateChanged(state: any): void {
    if (state.elementoReducer?.ui?.events && state.elementoReducer.ui.events?.every(e => e.stateType === StateType.ArticulacaoAtualizada)) {
      this.buildProjetoAtualizadoEmJson(state);
    }
    if (this.modo === ClassificacaoDocumento.EMENDA && state.elementoReducer.ui.events?.every(e => e.stateType === StateType.ComandoEmendaGerado)) {
      this.buildComandoEmenda(state);
    }
  }

  update(changedProperties: PropertyValues): void {
    if (!this.projetoNorma || !this.projetoNorma['name']) {
      this.projetoNorma = DOCUMENTO_PADRAO;
    }
    const documento = buildProjetoNormaFromJsonix(this.projetoNorma, this.modo === ClassificacaoDocumento.EMENDA);

    rootStore.dispatch(openArticulacaoAction(documento.articulacao!));

    super.update(changedProperties);
  }

  onClickButton(): void {
    rootStore.dispatch(recuperarArticulacaoAtualizadaAction());
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
        .wrapper {
          display: grid;
          grid-template-columns: ${this.modo === 'emenda' ? '2fr 1fr' : '1fr 0'};
        }
        #comandoEmenda {
          display: ${this.modo === 'emenda' ? 'block' : 'none'};
        }
      </style>

      <div class="wrapper">
        <div>
          <lexml-eta-articulacao></lexml-eta-articulacao>
        </div>
        <div id="comandoEmenda">
          <lexml-emenda-comando id="lexmlEmendaComando" emenda="${JSON.stringify(this.emenda)}"> </lexml-emenda-comando>
        </div>
      </div>
    `;
  }
}
