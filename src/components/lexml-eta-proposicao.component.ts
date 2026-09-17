import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';

import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';
import { Anexo } from '../model/proposicao/proposicao';
import { aplicarRevisoesAction } from '../model/lexml/acao/aplicarRevisoes';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { buildJsonixFromProjetoNorma } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { completarRegistroRemissoes } from '../redux/elemento/reducer/adicionaRemissaoInterna';
import { buildProjetoNormaFromJsonix, lerIdsRemissoesInvalidas } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../model/lexml/documento/modelo/documentoPadrao';
import { rootStore } from '../redux/store';
import { LexmlEtaConfig } from '../model/lexmlEtaConfig';
import { Revisao } from '../model/revisao/revisao';
import { LexmlEtaParametrosEdicao } from './lexml-eta.component';
import { EditorComponent } from './editor/editor.component';
import { criarDocumentoArticulado, DocumentoArticulado } from '../model/lexml/documento/documentoArticulado';

@customElement('lexml-eta-proposicao')
export class LexmlEtaProposicaoComponent extends connect(rootStore)(LitElement) {
  @property({ type: Object }) lexmlEtaConfig: LexmlEtaConfig = new LexmlEtaConfig();

  @query('lexml-eta-proposicao-editor')
  private editorComponent!: EditorComponent;

  private urn = '';

  private projetoNorma?: any;

  private revisoes: Revisao[] | undefined;

  createRenderRoot(): LitElement {
    return this;
  }

  inicializarEdicao(urn: string, params?: LexmlEtaParametrosEdicao, preservarTextoDocumento = false): void {
    this.urn = urn;
    this.projetoNorma = params?.projetoNorma ? JSON.parse(JSON.stringify(params.projetoNorma)) : undefined;
    this.loadProjetoNorma(params, preservarTextoDocumento);
    document.querySelector('lexml-eta-articulacao')!['style'].display = 'block';
  }

  setRevisoes(revisoes?: Revisao[]): void {
    this.revisoes = revisoes;
    // Sem essa guarda o dispatch roda sempre, e o reducer acaba marcando o 1º artigo como "adicionado"
    // (situação padrão de todo dispositivo recém-criado), deslocando o cursor da ementa ~1s após o carregamento.
    if (revisoes?.length) {
      this.loadRevisoes();
    }
  }

  getProjetoAtualizado(): any {
    this.editorComponent.flushEdicaoPendente();
    const out = JSON.parse(JSON.stringify(this.projetoNorma));
    out.value.metadado.identificacao.urn = this.urn;
    const elementoState = rootStore.getState().elementoReducer;
    const remissoesExternas = elementoState.remissoesExternas ?? {};
    const registroCompleto = completarRegistroRemissoes(elementoState.articulacao, elementoState.remissoes ?? {}, remissoesExternas);
    const articulacaoAtualizada = buildJsonixFromProjetoNorma(elementoState.articulacao?.projetoNorma, this.urn, registroCompleto, remissoesExternas);
    const tipo = (out as any).value.projetoNorma.norma ? 'norma' : 'projeto';
    (out as any).value.projetoNorma[tipo].parteInicial = articulacaoAtualizada.value.projetoNorma[tipo].parteInicial;
    (out as any).value.projetoNorma[tipo].articulacao.lXhier = articulacaoAtualizada.value.projetoNorma[tipo].articulacao.lXhier;
    return out;
  }

  getDocumentoArticulado(): DocumentoArticulado {
    this.editorComponent.flushEdicaoPendente();
    const state = rootStore.getState().elementoReducer;
    const externas = state.remissoesExternas ?? {};
    const remissoes = completarRegistroRemissoes(state.articulacao, state.remissoes ?? {}, externas);
    return criarDocumentoArticulado(state.articulacao.projetoNorma, this.urn, remissoes, externas);
  }

  getAnexos() {
    return this.editorComponent.anexos;
  }

  atualizaAnexos(anexos: Anexo[]) {
    this.editorComponent.atualizaAnexo(anexos);
  }

  private loadProjetoNorma(params?: LexmlEtaParametrosEdicao, preservarTextoDocumento = false): void {
    if (!this.projetoNorma || !this.projetoNorma.value) {
      this.projetoNorma = JSON.parse(JSON.stringify(DOCUMENTO_PADRAO));
      this.projetoNorma.value.metadado.identificacao.urn = this.urn;
    }

    const documento = buildProjetoNormaFromJsonix(this.projetoNorma, preservarTextoDocumento);
    documento.urn = this.urn;
    const idsRemissoesInvalidas = lerIdsRemissoesInvalidas(this.projetoNorma);

    document.querySelector('lexml-eta')?.querySelector('sl-tab')?.click();
    rootStore.dispatch(openArticulacaoAction(documento.articulacao!, 'edicao', params, idsRemissoesInvalidas));
  }

  private _timerLoadEmenda = 0;
  private loadRevisoes(): void {
    clearInterval(this._timerLoadEmenda);
    this._timerLoadEmenda = window.setTimeout(() => {
      rootStore.dispatch(aplicarRevisoesAction.execute(this.revisoes));
    }, 1000);
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
