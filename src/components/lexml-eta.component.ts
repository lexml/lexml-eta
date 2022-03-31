import { LitElement, html, TemplateResult, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { connect } from 'pwa-helpers';
import { ComandoEmendaBuilder } from '../emenda/comando-emenda-builder';
import { EmendaBuilder } from '../emenda/emenda-builder';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { aplicarAlteracoesEmendaAction } from '../model/lexml/acao/aplicarAlteracoesEmenda';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { buildJsonixArticulacaoFromProjetoNorma } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix, getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../model/lexml/documento/modelo/documentoPadrao';
import { DispositivoAdicionado } from '../model/lexml/situacao/dispositivoAdicionado';
import { rootStore } from '../redux/store';
import { ComandoEmenda, Emenda } from './../model/lexml/documento/emenda';

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Object }) projetoNorma = {};
  @property({ type: Object }) emenda = {};

  createRenderRoot(): LitElement {
    return this;
  }

  getEmenda(): Emenda | undefined {
    const classificacao = this.modo;
    if (classificacao !== ClassificacaoDocumento.EMENDA && classificacao !== ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER) {
      return undefined;
    }
    const urn = (this.projetoNorma as any).value.metadado.identificacao.urn!;
    const articulacao = rootStore.getState().elementoReducer.articulacao;
    return new EmendaBuilder(classificacao, urn, articulacao).getEmenda();
  }

  getComandoEmenda(): ComandoEmenda {
    const urn = (this.projetoNorma as any).value.metadado.identificacao.urn!;
    const articulacao = rootStore.getState().elementoReducer.articulacao;
    return new ComandoEmendaBuilder(urn, articulacao).getComandoEmenda();
  }

  getProjetoAtualizado(): any {
    const out = { ...this.projetoNorma };
    const articulacaoAtualizada = buildJsonixArticulacaoFromProjetoNorma(rootStore.getState().elementoReducer.articulacao);
    (out as any).value.projetoNorma[(out as any).value.projetoNorma.norma ? 'norma' : 'projeto'].articulacao.lXhier = articulacaoAtualizada.lXhier;
    return out;
  }

  update(changedProperties: PropertyValues): void {
    if (this.hasChangedProjetoNorma(changedProperties) || this.hasChangedModo(changedProperties)) {
      this.loadProjetoNorma();
    }
    if (this.hasChangedEmenda(changedProperties) && Object.keys(this.emenda).length > /*  */ 0) {
      this.loadEmenda();
    }
    super.update(changedProperties);
  }

  private hasChangedProjetoNorma(changedProperties: PropertyValues): boolean {
    return changedProperties.has('projetoNorma') && changedProperties.get('projetoNorma') !== undefined;
  }

  private hasChangedModo(changedProperties: PropertyValues): boolean {
    return changedProperties.has('modo') && changedProperties.get('modo') !== undefined;
  }

  private hasChangedEmenda(changedProperties: PropertyValues): boolean {
    return changedProperties.has('emenda') && changedProperties.get('emenda') !== undefined;
  }

  private loadProjetoNorma(): void {
    let documento;

    if (!this.projetoNorma || !(this.projetoNorma as any).value) {
      this.projetoNorma = DOCUMENTO_PADRAO;
    }

    if (this.modo === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER) {
      const urn = getUrn(this.projetoNorma) ?? '';
      documento = buildProjetoNormaFromJsonix(DOCUMENTO_PADRAO, true);
      documento.urn = urn;
      const artigo = documento.articulacao!.artigos[0]!;
      artigo.rotulo = 'Art.';
      artigo.numero = '1';
      artigo.id = 'art1';
      const situacao = new DispositivoAdicionado();
      situacao.tipoEmenda = ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
      artigo.situacao = situacao;
    } else {
      documento = buildProjetoNormaFromJsonix(this.projetoNorma, this.modo === ClassificacaoDocumento.EMENDA);
    }

    rootStore.dispatch(openArticulacaoAction(documento.articulacao!, this.modo));
  }

  private loadEmenda(): void {
    if (this.emenda) {
      setTimeout(() => {
        rootStore.dispatch(
          aplicarAlteracoesEmendaAction.execute({
            dispositivosModificados: (this.emenda as any).dispositivosModificados,
            dispositivosSuprimidos: (this.emenda as any).dispositivosSuprimidos,
            dispositivosAdicionados: (this.emenda as any).dispositivosAdicionados,
          })
        );
      }, 1000);
    }
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
