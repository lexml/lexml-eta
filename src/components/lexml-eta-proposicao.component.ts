import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';

import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';
import { Anexo, DispositivosEmenda } from '../model/emenda/emenda';
import { aplicarAlteracoesEmendaAction } from '../model/lexml/acao/aplicarAlteracoesEmenda';
import { openArticulacaoAction } from '../model/lexml/acao/openArticulacaoAction';
import { buildJsonixFromProjetoNorma } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { completarRegistroRemissoes } from '../redux/elemento/reducer/adicionaRemissaoInterna';
import { buildProjetoNormaFromJsonix } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { DOCUMENTO_PADRAO } from '../model/lexml/documento/modelo/documentoPadrao';
import { rootStore } from '../redux/store';
import { LexmlEtaConfig } from '../model/lexmlEtaConfig';
import { Revisao } from '../model/revisao/revisao';
import { LexmlEtaParametrosEdicao } from './lexml-eta.component';
import { EditorComponent } from './editor/editor.component';
import { YjsCollabService } from '../collab/yjsCollabService';

@customElement('lexml-eta-proposicao')
export class LexmlEtaProposicaoComponent extends connect(rootStore)(LitElement) {
  @property({ type: Object }) lexmlEtaConfig: LexmlEtaConfig = new LexmlEtaConfig();

  @query('lexml-eta-proposicao-editor')
  private editorComponent!: EditorComponent;

  private urn = '';

  private projetoNorma?: any;

  private colabService?: YjsCollabService;

  private dispositivosEmenda: DispositivosEmenda | undefined;
  private revisoes: Revisao[] | undefined;

  createRenderRoot(): LitElement {
    return this;
  }

  inicializarEdicao(urn: string, params?: LexmlEtaParametrosEdicao): void {
    this.urn = urn;
    if (params?.projetoNorma) {
      this.projetoNorma = params.projetoNorma;
    }
    this.loadProjetoNorma(params);
    document.querySelector('lexml-eta-articulacao')!['style'].display = 'block';
    void this.ligarColaboracao(params);
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
      const editorTexto = this.editorComponent?.criarAdaptadorTextoColab();
      const aplicadorTombstone = { aplicarTombstonesRemotos: (uuid: number, chaves: string[]): void => this.editorComponent.aplicarTombstonesRemotos(uuid, chaves) };
      this.colabService = new YjsCollabService({ criarProvider: criarProviderReal, criarPersistencia: criarPersistenciaReal, store: rootStore, editorTexto, aplicadorTombstone });
      this.colabService.attach(params!.colaboracao, projetoNorma, params!.usuario);
      if (this.colabService.sincronizadorTexto) {
        this.editorComponent.ativarColaboracaoTexto(this.colabService.sincronizadorTexto);
      }
      if (this.colabService.sincronizadorPresenca) {
        void this.editorComponent.ativarColaboracaoCursores(this.colabService.sincronizadorPresenca);
      }
      if (this.colabService.undoColaboracao) {
        this.editorComponent.ativarColaboracaoUndo(this.colabService.undoColaboracao);
      }
    } catch {
      this.colabService = undefined;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.colabService?.destruir();
    this.colabService = undefined;
  }

  setDispositivosERevisoesEmenda(revisoes?: Revisao[]): void {
    this.revisoes = revisoes;
    this.loadEmenda();
  }

  getProjetoAtualizado(): any {
    this.editorComponent.flushEdicaoPendente();
    const out = { ...this.projetoNorma };
    const elementoState = rootStore.getState().elementoReducer;
    const registroCompleto = completarRegistroRemissoes(elementoState.articulacao, elementoState.remissoes ?? {});
    const remissoesExternas = elementoState.remissoesExternas ?? {};
    const articulacaoAtualizada = buildJsonixFromProjetoNorma(elementoState.articulacao?.projetoNorma, this.urn, registroCompleto, remissoesExternas);
    const tipo = (out as any).value.projetoNorma.norma ? 'norma' : 'projeto';
    (out as any).value.projetoNorma[tipo].parteInicial = articulacaoAtualizada.value.projetoNorma[tipo].parteInicial;
    (out as any).value.projetoNorma[tipo].articulacao.lXhier = articulacaoAtualizada.value.projetoNorma[tipo].articulacao.lXhier;
    return out;
  }

  getAnexos() {
    return this.editorComponent.anexos;
  }

  atualizaAnexos(anexos: Anexo[]) {
    this.editorComponent.atualizaAnexo(anexos);
  }

  private loadProjetoNorma(params?: LexmlEtaParametrosEdicao): void {
    if (!this.projetoNorma || !this.projetoNorma.value) {
      this.projetoNorma = DOCUMENTO_PADRAO;
      this.projetoNorma.value.metadado.identificacao.urn = this.urn;
    }

    const documento = buildProjetoNormaFromJsonix(this.projetoNorma, false);
    documento.urn = this.urn;

    document.querySelector('lexml-eta')?.querySelector('sl-tab')?.click();
    rootStore.dispatch(openArticulacaoAction(documento.articulacao!, 'edicao', params));
  }

  private _timerLoadEmenda = 0;
  private loadEmenda(): void {
    clearInterval(this._timerLoadEmenda);
    this._timerLoadEmenda = window.setTimeout(() => {
      rootStore.dispatch(aplicarAlteracoesEmendaAction.execute(this.dispositivosEmenda!, this.revisoes));
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
