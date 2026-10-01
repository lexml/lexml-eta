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
import { YjsCollabService } from '../collab/yjsCollabService';
import { criarDocumentoArticulado, DadosLexEdit, DocumentoArticulado } from '../model/lexml/documento/documentoArticulado';

@customElement('lexml-eta-proposicao')
export class LexmlEtaProposicaoComponent extends connect(rootStore)(LitElement) {
  @property({ type: Object }) lexmlEtaConfig: LexmlEtaConfig = new LexmlEtaConfig();

  @query('lexml-eta-proposicao-editor')
  private editorComponent!: EditorComponent;

  private urn = '';

  private projetoNorma?: any;

  private colabService?: YjsCollabService;

  private revisoes: Revisao[] | undefined;

  createRenderRoot(): LitElement {
    return this;
  }

  inicializarEdicao(urn: string, params?: LexmlEtaParametrosEdicao, preservarTextoDocumento = false): void {
    this.urn = urn;
    this.projetoNorma = params?.projetoNorma ? JSON.parse(JSON.stringify(params.projetoNorma)) : undefined;
    this.loadProjetoNorma(params, preservarTextoDocumento);
    void this.revelarArticulacao();
    void this.ligarColaboracao(params);
  }

  // O host pode chamar inicializarEdicao antes de o Light DOM ter renderizado (init oculto/
  // assíncrono): aguarda o render antes de revelar a articulação, sem assumir o elemento presente.
  private async revelarArticulacao(): Promise<void> {
    await this.updateComplete;
    const articulacao = this.querySelector('lexml-eta-articulacao') as HTMLElement | null;
    if (articulacao) {
      articulacao.style.display = 'block';
    }
  }

  // Overlay de colaboração (Fase 1): liga em paralelo, sem bloquear o render. OFF ⇒ no-op.
  // Falha em ligar/carregar o transporte nunca afeta a edição single-user nem o salvar.
  private async ligarColaboracao(params?: LexmlEtaParametrosEdicao): Promise<void> {
    if (!YjsCollabService.deveLigar(params?.colaboracao, params?.usuario)) {
      return;
    }
    const projetoNorma = rootStore.getState().elementoReducer?.articulacao?.projetoNorma;
    if (!projetoNorma) {
      return;
    }
    try {
      const { criarProviderReal, criarPersistenciaReal } = await import('../collab/transporteReal');
      // O editor é um neto (renderizado por lexml-eta-articulacao); espera a cadeia flushar
      // para a colaboração ligar mesmo quando o host inicializa com o componente ainda oculto.
      const editor = await this.aguardarEditor();
      if (!editor) {
        return;
      }
      const editorTexto = editor.criarAdaptadorTextoColab();
      const aplicadorTombstone = { aplicarTombstonesRemotos: (uuid: number, chaves: string[]): void => editor.aplicarTombstonesRemotos(uuid, chaves) };
      this.colabService = new YjsCollabService({ criarProvider: criarProviderReal, criarPersistencia: criarPersistenciaReal, store: rootStore, editorTexto, aplicadorTombstone });
      this.colabService.attach(params!.colaboracao, projetoNorma, params!.usuario);
      if (this.colabService.sincronizadorTexto) {
        editor.ativarColaboracaoTexto(this.colabService.sincronizadorTexto);
      }
      if (this.colabService.sincronizadorPresenca) {
        void editor.ativarColaboracaoCursores(this.colabService.sincronizadorPresenca);
      }
      if (this.colabService.undoColaboracao) {
        editor.ativarColaboracaoUndo(this.colabService.undoColaboracao);
      }
    } catch {
      this.colabService = undefined;
    }
  }

  // Aguarda o render descer até o editor (neto): proposicao → lexml-eta-articulacao → editor.
  private async aguardarEditor(): Promise<EditorComponent | undefined> {
    await this.updateComplete;
    const articulacao = this.querySelector('lexml-eta-articulacao') as LitElement | null;
    await articulacao?.updateComplete;
    await this.editorComponent?.updateComplete;
    return this.editorComponent ?? undefined;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.colabService?.destruir();
    this.colabService = undefined;
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

  getDocumentoArticulado(dados?: DadosLexEdit): DocumentoArticulado {
    this.editorComponent.flushEdicaoPendente();
    const state = rootStore.getState().elementoReducer;
    const externas = state.remissoesExternas ?? {};
    const remissoes = completarRegistroRemissoes(state.articulacao, state.remissoes ?? {}, externas);
    return criarDocumentoArticulado(state.articulacao.projetoNorma, this.urn, remissoes, externas, dados);
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

  private _timerLoadRevisoes = 0;
  private loadRevisoes(): void {
    clearInterval(this._timerLoadRevisoes);
    this._timerLoadRevisoes = window.setTimeout(() => {
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
