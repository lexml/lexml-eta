import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';

import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';
import { ComandoEmendaBuilder } from '../emenda/comando-emenda-builder';
import { DispositivosEmendaBuilder } from '../emenda/dispositivos-emenda-builder';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { ComandoEmenda, ModoEdicaoEmenda } from '../model/emenda/emenda';
import { aplicarAlteracoesEmendaAction } from '../model/lexml/acao/aplicarAlteracoesEmenda';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { buildJsonixArticulacaoFromProjetoNorma } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix, getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../model/lexml/documento/modelo/documentoPadrao';
import { DispositivoAdicionado } from '../model/lexml/situacao/dispositivoAdicionado';
import { DispositivosEmenda } from './../model/emenda/emenda';
import { ProjetoNorma } from './../model/lexml/documento/projetoNorma';
import { rootStore } from './../redux/store';
import { LexmlEmendaConfig } from '../model/lexmlEmendaConfig';
import { Revisao } from '../model/revisao/revisao';

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: Object }) lexmlEtaConfig: LexmlEmendaConfig = new LexmlEmendaConfig();

  private modo: any = '';

  private projetoNorma = {};

  private dispositivosEmenda: DispositivosEmenda | undefined;
  private revisoes: Revisao[] | undefined;

  createRenderRoot(): LitElement {
    return this;
  }

  setProjetoNorma(modo: string, projetoNorma: ProjetoNorma, preparaAberturaEmenda = false): void {
    this.modo = modo;
    this.projetoNorma = projetoNorma;
    this.loadProjetoNorma(preparaAberturaEmenda);
    document.querySelector('lexml-eta-articulacao')!['style'].display = 'block';
  }

  getDispositivosEmenda(): DispositivosEmenda | undefined {
    if (this.modo !== ClassificacaoDocumento.EMENDA && this.modo !== ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER) {
      return undefined;
    }
    const urn = (this.projetoNorma as any).value.metadado.identificacao.urn!;
    const articulacao = rootStore.getState().elementoReducer.articulacao;
    return new DispositivosEmendaBuilder(this.modo, urn, articulacao).getDispositivosEmenda();
  }

  setDispositivosERevisoesEmenda(dispositivosEmenda: DispositivosEmenda | undefined, revisoes?: Revisao[]): void {
    this.revisoes = revisoes;
    if (dispositivosEmenda) {
      this.dispositivosEmenda = dispositivosEmenda;
      this.loadEmenda();
    }
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

  private loadProjetoNorma(preparaAberturaEmenda: boolean): void {
    let documento;

    if (!this.projetoNorma || !(this.projetoNorma as any).value) {
      this.projetoNorma = DOCUMENTO_PADRAO;
    }

    if (this.modo === ModoEdicaoEmenda.EMENDA_ARTIGO_ONDE_COUBER) {
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

      // Se estiver abrindo emenda, remove artigo inicial do documento padrão
      if (preparaAberturaEmenda) {
        documento.articulacao.removeFilho(documento.articulacao.filhos[0]);
      }
    } else {
      documento = buildProjetoNormaFromJsonix(this.projetoNorma, this.modo === ClassificacaoDocumento.EMENDA);
    }

    document.querySelector('lexml-emenda')?.querySelector('sl-tab')?.click();
    rootStore.dispatch(openArticulacaoAction(documento.articulacao!, this.modo));
  }

  private _timerLoadEmenda = 0;
  private loadEmenda(): void {
    if (this.dispositivosEmenda) {
      clearInterval(this._timerLoadEmenda);
      this._timerLoadEmenda = window.setTimeout(() => {
        rootStore.dispatch(aplicarAlteracoesEmendaAction.execute(this.dispositivosEmenda!, this.revisoes));
      }, 1000);
    }
  }

  render(): TemplateResult {
    return html`
      ${shoelaceLightThemeStyles}
      <style>
        #gtx-trans {
          display: block;
        }

        lexml-eta-articulacao {
          display: none;
          height: 100%;
        }

        lexml-eta-articulacao:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }
      </style>
      <lexml-eta-articulacao .lexmlEtaConfig=${this.lexmlEtaConfig}></lexml-eta-articulacao>
    `;
  }
}
