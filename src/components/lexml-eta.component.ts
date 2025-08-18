import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';

import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';
import { ComandoEmendaBuilder } from '../emenda/comando-emenda-builder';
import { DispositivosEmendaBuilder } from '../emenda/dispositivos-emenda-builder';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { Anexo, ComandoEmenda, ModoEdicaoEmenda } from '../model/emenda/emenda';
import { aplicarAlteracoesEmendaAction } from '../model/lexml/acao/aplicarAlteracoesEmenda';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { buildJsonixArticulacaoFromProjetoNorma } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../model/lexml/documento/modelo/documentoPadrao';
import { DispositivoAdicionado } from '../model/lexml/situacao/dispositivoAdicionado';
import { DispositivosEmenda } from './../model/emenda/emenda';
import { ProjetoNorma } from './../model/lexml/documento/projetoNorma';
import { rootStore } from './../redux/store';
import { LexmlEmendaConfig } from '../model/lexmlEmendaConfig';
import { Revisao } from '../model/revisao/revisao';
import { LexmlEmendaParametrosEdicao } from './lexml-emenda.component';
import { EditorComponent } from './editor/editor.component';

@customElement('lexml-eta-emenda')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: Object }) lexmlEtaConfig: LexmlEmendaConfig = new LexmlEmendaConfig();

  @query('lexml-eta-emenda-editor')
  private editorComponent!: EditorComponent;

  private modo: any = '';

  private urn = '';

  private projetoNorma?: any;

  private dispositivosEmenda: DispositivosEmenda | undefined;
  private revisoes: Revisao[] | undefined;

  createRenderRoot(): LitElement {
    return this;
  }

  inicializarEdicao(modo: string, urn: string, projetoNorma?: ProjetoNorma, preparaAberturaEmenda = false, params?: LexmlEmendaParametrosEdicao): void {
    this.modo = modo;
    this.urn = urn;
    if (projetoNorma) {
      this.projetoNorma = projetoNorma;
    }
    this.loadProjetoNorma(preparaAberturaEmenda, params);
    document.querySelector('lexml-eta-emenda-articulacao')!['style'].display = 'block';
  }

  getDispositivosEmenda(): DispositivosEmenda | undefined {
    if (this.modo !== ClassificacaoDocumento.EMENDA && this.modo !== ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER) {
      return undefined;
    }
    const articulacao = rootStore.getState().elementoReducer.articulacao;
    return new DispositivosEmendaBuilder(this.modo, this.urn, articulacao).getDispositivosEmenda();
  }

  setDispositivosERevisoesEmenda(dispositivosEmenda: DispositivosEmenda | undefined, revisoes?: Revisao[]): void {
    this.revisoes = revisoes;
    if (dispositivosEmenda) {
      this.dispositivosEmenda = dispositivosEmenda;
      this.loadEmenda();
    }
  }

  getComandoEmenda(): ComandoEmenda {
    const articulacao = rootStore.getState().elementoReducer.articulacao;
    return new ComandoEmendaBuilder(this.urn, articulacao).getComandoEmenda();
  }

  getProjetoAtualizado(): any {
    const out = { ...this.projetoNorma };
    const articulacaoAtualizada = buildJsonixArticulacaoFromProjetoNorma(rootStore.getState().elementoReducer.articulacao);
    (out as any).value.projetoNorma[(out as any).value.projetoNorma.norma ? 'norma' : 'projeto'].articulacao.lXhier = articulacaoAtualizada.lXhier;
    return out;
  }

  getAnexos() {
    return this.editorComponent.anexos;
  }

  atualizaAnexos(anexos: Anexo[]) {
    this.editorComponent.atualizaAnexo(anexos);
  }

  private loadProjetoNorma(preparaAberturaEmenda: boolean, params?: LexmlEmendaParametrosEdicao): void {
    let documento;

    if (!this.projetoNorma || !this.projetoNorma.value) {
      this.projetoNorma = DOCUMENTO_PADRAO;
    }

    if (this.modo === ModoEdicaoEmenda.EMENDA_ARTIGO_ONDE_COUBER) {
      documento = buildProjetoNormaFromJsonix(DOCUMENTO_PADRAO, true);
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

    documento.urn = this.urn;

    document.querySelector('lexml-emenda')?.querySelector('sl-tab')?.click();
    rootStore.dispatch(openArticulacaoAction(documento.articulacao!, this.modo, params));
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

        lexml-eta-emenda-articulacao {
          display: none;
          height: 100%;
        }

        lexml-eta-emenda-articulacao:focus {
          outline: 0;
          border: 0px solid #f1f1f1;
          -webkit-box-shadow: 0px;
          box-shadow: none;
        }
      </style>
      <lexml-eta-emenda-articulacao .lexmlEtaConfig=${this.lexmlEtaConfig}></lexml-eta-emenda-articulacao>
    `;
  }
}
