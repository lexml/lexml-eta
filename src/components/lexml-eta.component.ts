import { customElement, html, LitElement, property, PropertyValues, TemplateResult } from 'lit-element';
import { connect } from 'pwa-helpers';
import { EMENDA_MPV_00930_2020 } from '../../demo/doc/emenda_exemplo_mpv_00930_2020';
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
    let documento;

    if (!this.projetoNorma) {
      this.projetoNorma = DOCUMENTO_PADRAO;
    }

    if (this.modo === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER) {
      const urn = getUrn(this.projetoNorma) ?? '';
      documento = buildProjetoNormaFromJsonix(DOCUMENTO_PADRAO, true);
      documento.urn = urn;
      documento.articulacao!.artigos[0]!.numero = undefined;
      documento.articulacao!.artigos[0]!.rotulo = 'Art.';
      documento.articulacao!.artigos[0]!.situacao = new DispositivoAdicionado();
      documento.articulacao!.artigos[0]!.situacao.tipoEmenda = ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
    } else {
      documento = buildProjetoNormaFromJsonix(this.projetoNorma, this.modo === ClassificacaoDocumento.EMENDA);
    }

    rootStore.dispatch(openArticulacaoAction(documento.articulacao!, this.modo));

    // TODO feito apenas para teste
    if ((this.projetoNorma as any).value.metadado.identificacao.urn === 'urn:lex:br:congresso.nacional:medida.provisoria;mpv:2020;930') {
      setTimeout(() => {
        rootStore.dispatch(
          aplicarAlteracoesEmendaAction.execute({
            dispositivosModificados: EMENDA_MPV_00930_2020.emenda.dispositivosModificados,
            dispositivosSuprimidos: EMENDA_MPV_00930_2020.emenda.dispositivosSuprimidos,
          })
        );
        this.emenda = EMENDA_MPV_00930_2020.emenda;
      }, 1000);
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

  private hasProjetoNorma(): boolean {
    return this.projetoNorma && this.projetoNorma['name'];
  }
}
