import { Usuario } from '../model/revisao/usuario';
import '@shoelace-style/shoelace/dist/components/badge/badge';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
import '@shoelace-style/shoelace/dist/components/tab/tab';

import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';

import { editorStyles } from '../assets/css/editor.css';
import { quillSnowStyles } from '../assets/css/quill.snow.css';
import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';

import { adicionarAlerta } from '../model/alerta/acao/adicionarAlerta';
import { removerAlerta } from '../model/alerta/acao/removerAlerta';
import {
  getAno,
  getNumero,
  getSigla,
  getCasaLegislativaResponsavel,
  isTipoDocumentoNaoSuportado,
  normalizarDataFecho,
  verificarUrnDaCasaDoEditor,
  verificarUrnParaNovaProposicao,
} from '../model/lexml/documento/urnUtil';
import { inicializarVocabulario } from '../model/lexml/documento/vocabulario';
import { rootStore } from '../redux/store';
import { ProjetoNorma } from '../model/lexml/documento/projetoNorma';
import { LexmlEtaProposicaoComponent } from './lexml-eta-proposicao.component';
import { limparAlertas } from '../model/alerta/acao/limparAlertas';
import { LexmlEtaConfig } from '../model/lexmlEtaConfig';
import { atualizarUsuarioAction } from '../model/lexml/acao/atualizarUsuarioAction';
import { getQuantidadeRevisoesAll, isRevisaoElemento, mostrarDialogDisclaimerRevisao, ordernarRevisoes, removeAtributosDoElemento } from '../redux/elemento/util/revisaoUtil';
import { Revisao, RevisaoElemento } from '../model/revisao/revisao';
import { ativarDesativarRevisaoAction } from '../model/lexml/acao/ativarDesativarRevisaoAction';
import { StateEvent, StateType } from '../redux/state';
import { limparRevisaoAction } from '../model/lexml/acao/limparRevisoes';
import { resetarDocumentoAction } from '../model/lexml/acao/resetarDocumentoAction';
import { buildContent, getUrn, lerMetadadoLexEdit, lerSituacaoNaNormaVigente } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { Comissao } from './destino/comissao';
import { NOTA_RODAPE_CHANGE_EVENT, NOTA_RODAPE_REMOVE_EVENT, NotaRodape } from './editor-texto-rico/notaRodape';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DestinoComponent } from './destino/destino.component';
import { AnexosComponent } from './anexos/anexos.component';
import { errorInicializarEdicaoAction } from '../model/lexml/acao/errorInicializarEdicaoAction';
import { isHtmlSemTexto } from '../util/string-util';
import { TipoMensagem } from '../model/lexml/util/mensagem';
import { Anexo, Autoria, ColegiadoApreciador, Epigrafe, getRefProposicaoReduzida, OpcoesImpressao, Parlamentar, Proposicao } from '../model/proposicao/proposicao';
import { DocumentoArticulado, lerDocumentoArticulado } from '../model/lexml/documento/documentoArticulado';
import { PENDENCIA_DOCUMENTO_NAO_SUPORTADO } from '../model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { montaDocumentoNovaProposicao } from '../model/lexml/documento/modelo/montaDocumentoNovaProposicao';

const ALERTA_TIPO_NAO_SUPORTADO = 'alerta-global-tipo-nao-suportado';

type TipoCasaLegislativa = 'SF' | 'CD' | 'CN';

/** Dados de `novaProposicao`; os opcionais ausentes assumem o padrão da sessão ou do editor. */
export interface DadosNovaProposicao {
  urn: string;
  epigrafe: string;
  preambulo: string;
  urnDocumentoReferenciado?: string;
  colegiadoApreciador?: ColegiadoApreciador;
  autoria?: Autoria;
  opcoesImpressao?: OpcoesImpressao;
  outrosMetadados?: Record<string, string>;
  // Documento articulado de modelo: só a articulação e a ementa são aproveitadas.
  documentoModelo?: unknown;
  anexoParecer?: boolean;
}

// Parâmetros da rotina interna de inicialização; a identificação vem sempre da URN do documento.
class ParametrosEdicao {
  projetoNorma?: ProjetoNorma;
  anexoParecer = false;
  // Indica se é texto substitutivo.
  substitutivo = false;
}

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: Number }) totalAlertas = 0;
  @property({ type: Boolean }) exibirAjuda = true;
  @property({ type: Array }) parlamentares: Parlamentar[] = [];
  @property({ type: Array }) comissoes: Comissao[] = [];
  // Pares chave/valor do host gravados no documento; ao abrir um arquivo, recebe os pares dele.
  @property({ type: Object }) outrosMetadados: Record<string, string> = {};

  private _lexmlEtaConfig = new LexmlEtaConfig();

  // O vocabulário depende da casa do editor e precisa estar pronto antes de inicializarEdicao.
  @property({ type: Object })
  get lexmlEtaConfig(): LexmlEtaConfig {
    return this._lexmlEtaConfig;
  }

  set lexmlEtaConfig(config: LexmlEtaConfig) {
    const anterior = this._lexmlEtaConfig;
    this._lexmlEtaConfig = config;
    inicializarVocabulario(config?.casaLegislativaEditor);
    this.requestUpdate('lexmlEtaConfig', anterior);
  }

  private urn = '';

  private projetoNorma: any;

  private casaLegislativa: TipoCasaLegislativa = 'CN';

  private parlamentaresCarregados = false;
  private comissoesCarregadas = false;

  private substitutivo = false;

  // O destino não é salvo: o local lido do arquivo vale enquanto o destino for o mesmo da abertura.
  private localDoArquivo?: string;
  private destinoAoAbrir?: ColegiadoApreciador;

  @state()
  private anexoParecer = false;

  private urnDocumentoReferenciado?: string;

  // Documento que não é proposição suportada (ex.: MPV, norma): sem destino e autoria, com erro na aba de avisos.
  @state()
  private tipoNaoSuportado = false;

  // Estado neutro: nenhum documento inicializado (ou após fecharDocumento).
  @state()
  private documentoInicializado = false;

  @state()
  private totalAnexos = 0;

  // Para forçar atualização da interface
  @state()
  private updateState: any;

  @state()
  private notasRodape: NotaRodape[] = [];

  @state()
  autoria = new Autoria();

  @query('lexml-eta-proposicao')
  _lexmlEta?: LexmlEtaProposicaoComponent;
  @query('#lexml-eta-editor-texto-rico-justificativa')
  _lexmlJustificativa;
  @query('lexml-eta-destino')
  _lexmlDestino?: DestinoComponent;
  @query('lexml-eta-autoria')
  _lexmlAutoria;
  @query('lexml-eta-data')
  _lexmlData;
  @query('lexml-eta-opcoes-impressao')
  _lexmlOpcoesImpressao;
  @query('lexml-eta-anexos')
  _lexmlAnexos?: AnexosComponent;
  @query('#tabs-esquerda')
  _tabsEsquerda;
  @query('#tabs-direita')
  _tabsDireita;

  @query('sl-split-panel')
  private slSplitPanel!: any;

  async getParlamentares(): Promise<Parlamentar[]> {
    try {
      const _response = await fetch(this.lexmlEtaConfig.urlConsultaParlamentares);
      const _parlamentares = await _response.json();
      return _parlamentares
        .filter(p => this.casaLegislativa === 'CN' || p.siglaCasa === this.casaLegislativa)
        .map(p => ({
          identificacao: p.id + '',
          nome: p.nome,
          sexo: p.sexo,
          siglaPartido: p.siglaPartido,
          siglaUF: p.siglaUF,
          siglaCasaLegislativa: p.siglaCasa,
        }));
    } catch (err) {
      console.log('Erro inesperado ao carregar lista de parlamentares');
      console.log(err);
    } finally {
      this.parlamentaresCarregados = true;
      // this.habilitarBotoes();
    }
    return Promise.resolve([]);
  }

  async getComissoes(siglaCasaLegislativa: string): Promise<Comissao[]> {
    try {
      if (!this.lexmlEtaConfig.urlComissoes) {
        return Promise.resolve([]);
      }
      const _response = await fetch(`${this.lexmlEtaConfig.urlComissoes}?siglaCasaLegislativa=${siglaCasaLegislativa}`);
      const _comissoes = await _response.json();
      return _comissoes
        .filter(c => c.siglaCasaLegislativa === siglaCasaLegislativa)
        .map(c => ({
          siglaCasaLegislativa: c.siglaCasaLegislativa,
          sigla: c.sigla,
          nome: c.nome,
        }));
    } catch (err) {
      console.log('Erro inesperado ao carregar lista de comissões');
      console.log(err);
    } finally {
      this.comissoesCarregadas = true;
      // this.habilitarBotoes();
    }
    return Promise.resolve([]);
  }

  atualizaListaComissoes(): void {
    this.getComissoes(this.casaLegislativa).then(comissoes => (this.comissoes = comissoes));
  }

  private montarLocalFromColegiadoApreciador(colegiado: ColegiadoApreciador): any {
    return colegiado.tipoColegiado === 'Comissão' ? 'Sala da comissão' : 'Sala das sessões';
  }

  private montarProposicaoPorUrn(urn: string): Proposicao {
    const prop = new Proposicao();
    if (urn) {
      prop.urn = urn;
      prop.ementa = this.getEmentaFromProjetoNorma(this.projetoNorma);
      prop.sigla = getSigla(urn);
      prop.numero = getNumero(urn);
      prop.ano = getAno(urn);
    }
    return prop;
  }

  private getLocalFecho(): string {
    const destino = this._lexmlDestino?.colegiadoApreciador ?? new ColegiadoApreciador();
    const destinoInalterado =
      !!this.destinoAoAbrir && destino.tipoColegiado === this.destinoAoAbrir.tipoColegiado && (destino.siglaComissao ?? '') === (this.destinoAoAbrir.siglaComissao ?? '');
    return this.localDoArquivo && destinoInalterado ? this.localDoArquivo : this.montarLocalFromColegiadoApreciador(destino);
  }

  /** Exporta somente os grupos implementados do documento LexML. */
  getDocumentoArticulado(): DocumentoArticulado {
    if (!this.urn) throw new Error('Inicialize um documento antes de salvar.');
    // O colegiado apreciador não é gravado no anexo de parecer (spec metadados-lexedit).
    return this._lexmlEta!.getDocumentoArticulado({
      anexoParecer: this.anexoParecer,
      ...(this.urnDocumentoReferenciado && { urnDocumentoReferenciado: this.urnDocumentoReferenciado }),
      local: this.getLocalFecho(),
      data: normalizarDataFecho(this._lexmlData.data),
      // Em tipo não suportado, destino e autoria não são editáveis e saem vazios.
      ...(this.tipoNaoSuportado ? {} : { autoria: this._lexmlAutoria.getAutoriaAtualizada() }),
      ...(this.anexoParecer || this.tipoNaoSuportado ? {} : { colegiadoApreciador: this._lexmlDestino!.colegiadoApreciador }),
      opcoesImpressao: this._lexmlOpcoesImpressao.opcoesImpressao,
      outrosMetadados: this.outrosMetadados,
      anexos: this._lexmlAnexos?.anexos,
    });
  }

  /** Cria uma nova proposição; entrada inválida emite o erro fatal e deixa o documento em edição como estava. */
  async novaProposicao(dados: DadosNovaProposicao): Promise<void> {
    let documento: any;
    try {
      this.validarDadosNovaProposicao(dados);
      verificarUrnDaCasaDoEditor(dados.urn);
      verificarUrnParaNovaProposicao(dados.urn);
      const modelo = dados.documentoModelo === undefined ? undefined : lerDocumentoArticulado(dados.documentoModelo);
      documento = montaDocumentoNovaProposicao(dados.urn, dados.epigrafe, dados.preambulo, modelo);
    } catch (err) {
      this.emitirEventoFatalError(err);
      throw err;
    }

    const params = new ParametrosEdicao();
    params.projetoNorma = documento;
    params.anexoParecer = dados.anexoParecer ?? false;
    // Com modelo, o texto da articulação é preservado como em um documento aberto, mas os padrões da sessão valem.
    await this.inicializarEdicao(params, dados.documentoModelo !== undefined, true);

    if (dados.autoria) this._lexmlAutoria.autoria = dados.autoria;
    if (dados.opcoesImpressao) this._lexmlOpcoesImpressao.opcoesImpressao = dados.opcoesImpressao;
    if (dados.colegiadoApreciador && !this.anexoParecer) {
      this._lexmlDestino!.colegiadoApreciador = { ...dados.colegiadoApreciador, siglaCasaLegislativa: this.casaLegislativa };
    }
    this.outrosMetadados = dados.outrosMetadados ?? {};
    this.urnDocumentoReferenciado = dados.urnDocumentoReferenciado?.trim() || undefined;
  }

  private validarDadosNovaProposicao(dados: DadosNovaProposicao): void {
    const ausente = (nome: string): Error => new Error(`Dado obrigatório ausente em novaProposicao: '${nome}'.`);
    if (!dados || typeof dados !== 'object') throw new Error('Dados da nova proposição não informados.');
    if (typeof dados.urn !== 'string' || !dados.urn.trim()) throw ausente('urn');
    if (typeof dados.epigrafe !== 'string' || !dados.epigrafe.trim()) throw ausente('epigrafe');
    // Vazio é válido: o tipo pode não ter preâmbulo padrão.
    if (typeof dados.preambulo !== 'string') throw ausente('preambulo');
  }

  /** Aceita o objeto Jsonix ou seu texto JSON e valida antes de alterar o editor. */
  async abrirDocumentoArticulado(entrada: unknown): Promise<void> {
    let documento: DocumentoArticulado;
    try {
      documento = lerDocumentoArticulado(entrada);
    } catch (err) {
      this.emitirEventoFatalError(err);
      throw err;
    }
    const dados = lerMetadadoLexEdit(documento);
    const params = new ParametrosEdicao();
    params.projetoNorma = documento as any;
    params.anexoParecer = dados.anexoParecer ?? false;
    await this.inicializarEdicao(params, true);
    // Sem o atraso de setRevisoes (1 s): o documento aberto já sai com as marcas e em modo de revisão.
    if (dados.revisoesLidas?.length) await this._lexmlEta!.aplicarRevisoesDoArquivo(dados.revisoesLidas, lerSituacaoNaNormaVigente(documento));
    // Depois de inicializarEdicao: resetaProposicao sobrescreve o formulário com os valores padrão.
    if (dados.opcoesImpressao) this._lexmlOpcoesImpressao.opcoesImpressao = dados.opcoesImpressao;
    // Em tipo não suportado, destino e autoria do arquivo são ignorados.
    // Dados do arquivo como gravados, sem consultar a lista de parlamentares do host.
    if (dados.autoria && !this.tipoNaoSuportado) this._lexmlAutoria.autoria = dados.autoria;
    this._lexmlData.data = dados.data ?? '';
    // A casa continua a do host: ela define a lista de comissões carregada.
    if (dados.colegiadoApreciador && !this.anexoParecer && !this.tipoNaoSuportado) {
      const { tipoColegiado, siglaComissao } = dados.colegiadoApreciador;
      this._lexmlDestino!.colegiadoApreciador = { ...this._lexmlDestino!.colegiadoApreciador, tipoColegiado, siglaComissao };
    }
    this.localDoArquivo = dados.local;
    this.destinoAoAbrir = { ...this._lexmlDestino!.colegiadoApreciador };
    this.outrosMetadados = dados.outrosMetadados ?? {};
    this.urnDocumentoReferenciado = dados.urnDocumentoReferenciado;
    this.aplicarAnexos(dados.anexos);
  }

  private aplicarAnexos(anexos: Anexo[] = []): void {
    this._lexmlAnexos!.anexos = anexos;
    this.atualizarTotalAnexos();
  }

  private atualizarTotalAnexos(): void {
    this.totalAnexos = this._lexmlAnexos?.anexos.length ?? 0;
  }

  getProposicao(): Proposicao {
    if (!this.urn) {
      const proposicao = new Proposicao();
      if (this.anexoParecer) {
        this.removerDadosNaoAplicaveisAoAnexoParecer(proposicao);
      }
      return proposicao;
    }

    this.projetoNorma = this._lexmlEta?.getProjetoAtualizado();

    const proposicao = this.montarProposicaoPorUrn(this.urn);
    proposicao.dataUltimaModificacao = this._lexmlData.data || undefined;
    proposicao.projetoNorma = this.projetoNorma;
    proposicao.justificativa = this._lexmlJustificativa.texto;
    proposicao.notasRodape = this._lexmlJustificativa.notasRodape;
    proposicao.autoria = this._lexmlAutoria.getAutoriaAtualizada();
    proposicao.opcoesImpressao = this._lexmlOpcoesImpressao.opcoesImpressao;
    proposicao.ementa = this.getEmentaFromProjetoNorma(this.projetoNorma);

    proposicao.revisoes = this.getRevisoes();
    proposicao.justificativaAntesRevisao = this._lexmlJustificativa.textoAntesRevisao;
    proposicao.pendenciasPreenchimento = this.getPendenciasPreenchimento(proposicao);
    proposicao.epigrafe = this.getEpigrafe(this.projetoNorma);

    proposicao.colegiadoApreciador = this._lexmlDestino!.colegiadoApreciador;
    proposicao.anexos = this._lexmlAnexos?.anexos ?? [];
    proposicao.substitutivo = this.substitutivo;
    if (proposicao.colegiadoApreciador) proposicao.local = this.montarLocalFromColegiadoApreciador(proposicao.colegiadoApreciador);

    if (this.anexoParecer) {
      this.removerDadosNaoAplicaveisAoAnexoParecer(proposicao);
    }

    return proposicao;
  }

  private removerDadosNaoAplicaveisAoAnexoParecer(proposicao: Proposicao): void {
    Reflect.deleteProperty(proposicao, 'justificativa');
    Reflect.deleteProperty(proposicao, 'justificativaAntesRevisao');
    Reflect.deleteProperty(proposicao, 'notasRodape');
  }

  getEpigrafe(projetoNorma: any): Epigrafe {
    const epigrafe = new Epigrafe();
    const doc = projetoNorma.value.projetoNorma.norma || projetoNorma.value.projetoNorma.projeto;
    epigrafe.texto = buildContent(doc.parteInicial?.epigrafe?.content);

    return epigrafe;
  }

  private getPendenciasPreenchimento(proposicao: Proposicao): string[] {
    const pendenciasPreenchimento: Array<string> = [];

    // Verifica preenchimento da justificação
    if (this.isJustificacaoObrigatoria() && isHtmlSemTexto(proposicao.justificativa)) {
      pendenciasPreenchimento.push('Não foi informado um texto de justificação.');
    }

    const messagesCritical = rootStore.getState().elementoReducer.mensagensCritical;

    for (let index = 0; index < messagesCritical.length; index++) {
      const element = messagesCritical[index];
      pendenciasPreenchimento.push(element);
    }

    return pendenciasPreenchimento;
  }

  private getRevisoes(): Revisao[] {
    const revisoes = ordernarRevisoes([...rootStore.getState().elementoReducer.revisoes]);

    revisoes.filter(isRevisaoElemento).forEach(r => {
      const re = r as RevisaoElemento;
      removeAtributosDoElemento(re.elementoAposRevisao);
      re.elementoAntesRevisao && removeAtributosDoElemento(re.elementoAntesRevisao);
    });

    return revisoes;
  }

  private async inicializarEdicao(params: ParametrosEdicao, preservarTextoDocumento = false, aplicarPadroes = !preservarTextoDocumento): Promise<void> {
    try {
      // Antes de qualquer atribuição, para que o documento em edição continue como estava.
      const urnRecebida = getUrn(params.projetoNorma);
      if (!urnRecebida) throw new Error('A URN do documento não foi informada.');
      verificarUrnDaCasaDoEditor(urnRecebida);

      this.descartarDocumentoAtual();
      this.anexoParecer = params.anexoParecer ?? false;
      this.projetoNorma = params.projetoNorma;

      this.urn = urnRecebida;
      this.tipoNaoSuportado = isTipoDocumentoNaoSuportado(this.urn);

      this.setUsuario(this.lexmlEtaConfig.usuario ?? rootStore.getState().elementoReducer.usuario);

      this.casaLegislativa = getCasaLegislativaResponsavel(this.urn) ?? 'CN';

      // Deve ser chamado antes do reset para garantir a autoria padrão e depois da inicialização da casaLegislativa
      this.parlamentares = await this.getParlamentares();

      // Abrir um documento não recebe os padrões da sessão; só a nova proposição.
      this.resetaProposicao(params, aplicarPadroes);

      this.atualizaListaComissoes();

      this.limparAlertas();

      // Carrega o documento por último, depois de toda limpeza de alertas acima (setProposicao/
      // resetaProposicao/limparAlertas): documentos com remissão interna inválida persistida
      // populam alertas globais ao abrir (ABRIR_ARTICULACAO), que seriam apagados se essa chamada
      // viesse antes das limpezas.
      this.documentoInicializado = true;
      this._lexmlEta!.inicializarEdicao(this.urn, params.projetoNorma, this.lexmlEtaConfig.configuracaoPaginacao, preservarTextoDocumento);
      if (this.tipoNaoSuportado) {
        rootStore.dispatch(adicionarAlerta({ id: ALERTA_TIPO_NAO_SUPORTADO, tipo: TipoMensagem.ERROR, mensagem: PENDENCIA_DOCUMENTO_NAO_SUPORTADO, podeFechar: false }));
      }

      setTimeout(this.handleResize, 0);

      this.desativarMarcaRevisao();

      this.updateView();
      await this.updateComplete;
      this.sincronizarESelecionarAba(this._tabsEsquerda, 'lexml-eta-proposicao');
      this.sincronizarESelecionarAba(this._tabsDireita, this.anexoParecer ? 'atalhos' : 'notas');
    } catch (err) {
      console.error(err);
      this.emitirEventoFatalError(err);
      setTimeout(() => {
        rootStore.dispatch(errorInicializarEdicaoAction.execute(err));
      }, 0);
      throw err;
    }
  }

  /** Encerra a edição do documento atual e volta ao estado neutro. A confirmação de perda de dados é do host. */
  fecharDocumento(): void {
    this.descartarDocumentoAtual();
    this.documentoInicializado = false;
    this.limparAlertas();
    this.querySelector<HTMLElement>('lexml-eta-articulacao')?.style.setProperty('display', 'none');
    this.updateComplete.then(() => this.sincronizarESelecionarAba(this._tabsEsquerda, 'lexml-eta-proposicao'));
  }

  // Descarta tudo o que é do documento (Redux e componentes); a configuração da sessão e o usuário ficam.
  private descartarDocumentoAtual(): void {
    rootStore.dispatch(resetarDocumentoAction.execute());
    this.urn = '';
    this.projetoNorma = undefined;
    this.anexoParecer = false;
    this.urnDocumentoReferenciado = undefined;
    this.tipoNaoSuportado = false;
    this.substitutivo = false;
    this.localDoArquivo = undefined;
    this.destinoAoAbrir = undefined;
    this.outrosMetadados = {};
    this.notasRodape = [];
    // Antes da primeira renderização os formulários ainda não existem.
    if (this._lexmlJustificativa) {
      const vazia = new Proposicao();
      vazia.dataUltimaModificacao = '';
      this.setProposicao(vazia);
    }
  }

  getEmentaFromProjetoNorma(projetoNorma: any): string {
    const estrutura = projetoNorma?.value?.projetoNorma;
    return buildContent((estrutura?.norma ?? estrutura?.projeto)?.parteInicial?.ementa?.content);
  }

  stateChanged(state: any): void {
    const revisaoAtivada = state?.elementoReducer?.ui?.events?.some((ev: StateEvent) => ev.stateType === StateType.RevisaoAtivada);
    const revisaoDesativada = state?.elementoReducer?.ui?.events?.some((ev: StateEvent) => ev.stateType === StateType.RevisaoDesativada);
    revisaoAtivada && this.mostrarDialogDisclaimerRevisao();
    if (revisaoAtivada || revisaoDesativada) {
      this.emitiEventoOnRevisao(rootStore.getState().elementoReducer.emRevisao);
    }
  }

  private emitiEventoOnRevisao(emRevisao: boolean): void {
    this.dispatchEvent(
      new CustomEvent('onrevisao', {
        bubbles: true,
        composed: true,
        detail: {
          emRevisao,
        },
      })
    );
  }

  private emitirEventoFatalError(err): void {
    this.dispatchEvent(
      new CustomEvent('fatalError', {
        bubbles: true,
        composed: true,
        detail: {
          err,
        },
      })
    );
  }

  private desativarMarcaRevisao = (): void => {
    if (rootStore.getState().elementoReducer.emRevisao) {
      const quantidade = getQuantidadeRevisoesAll(rootStore.getState().elementoReducer.revisoes);
      if (quantidade === 0) {
        rootStore.dispatch(ativarDesativarRevisaoAction.execute(quantidade));
      }
    }
  };

  public setUsuario(usuario = new Usuario()): void {
    rootStore.dispatch(atualizarUsuarioAction.execute(usuario));
  }

  private setProposicao(proposicao: Proposicao): void {
    rootStore.dispatch(limparAlertas());

    this.substitutivo = proposicao.substitutivo;
    this._lexmlAutoria.autoria = proposicao.autoria || new Autoria();
    this._lexmlAutoria.casaLegislativa = this.casaLegislativa;
    this._lexmlOpcoesImpressao.opcoesImpressao = proposicao.opcoesImpressao;
    this._lexmlJustificativa.setTextoAntesRevisao(proposicao.justificativaAntesRevisao);
    this._lexmlDestino!.colegiadoApreciador = proposicao.colegiadoApreciador;
    this._lexmlDestino!.proposicao = getRefProposicaoReduzida(proposicao);
    this.notasRodape = proposicao.notasRodape || [];
    this._lexmlJustificativa.setContent(proposicao.justificativa || '', proposicao.notasRodape || []);
    this._lexmlData.data = proposicao.dataUltimaModificacao;
    this._lexmlEta!.setRevisoes(proposicao.revisoes);
    this.aplicarAnexos(proposicao.anexos);
  }

  private resetaProposicao(params: ParametrosEdicao, aplicarPadroes = true): void {
    const proposicao = new Proposicao();
    // Documento novo nasce com "Não informar"; o padrão do modelo é o instante atual.
    proposicao.dataUltimaModificacao = '';
    proposicao.autoria = aplicarPadroes ? this.montarAutoriaPadrao() : new Autoria();
    proposicao.opcoesImpressao = aplicarPadroes ? this.montarOpcoesImpressaoPadrao() : new OpcoesImpressao();
    proposicao.colegiadoApreciador.siglaCasaLegislativa = this.casaLegislativa;
    proposicao.substitutivo = params.substitutivo;
    this.setProposicao(proposicao);
    rootStore.dispatch(limparRevisaoAction.execute());
  }

  private montarAutoriaPadrao(): Autoria {
    const autoria = new Autoria();
    if (this.lexmlEtaConfig.autoriaPadrao?.identificacao) {
      const autoriaPadrao = this.lexmlEtaConfig.autoriaPadrao;
      const parlamentarAutor = this.parlamentares.find(
        par => par.identificacao === autoriaPadrao!.identificacao && par.siglaCasaLegislativa === autoriaPadrao!.siglaCasaLegislativa
      );
      if (parlamentarAutor) {
        autoria.parlamentares = [parlamentarAutor];
      }
    }
    return autoria;
  }

  private montarOpcoesImpressaoPadrao(): OpcoesImpressao {
    const opcoesImpressao = new OpcoesImpressao();
    const padrao = this.lexmlEtaConfig.opcoesImpressaoPadrao;
    if (padrao) {
      opcoesImpressao.imprimirBrasao = padrao.imprimirBrasao;
      opcoesImpressao.textoCabecalho = padrao.textoCabecalho;
      opcoesImpressao.tamanhoFonte = padrao.tamanhoFonte;
    }
    return opcoesImpressao;
  }

  constructor() {
    super();
    inicializarVocabulario(this._lexmlEtaConfig.casaLegislativaEditor);
    this.addEventListener(NOTA_RODAPE_CHANGE_EVENT, this.onChangeNotasRodape);
    this.addEventListener(NOTA_RODAPE_REMOVE_EVENT, this.onChangeNotasRodape);
  }

  createRenderRoot(): LitElement {
    return this;
  }

  private MOBILE_WIDTH = 768;
  private splitPanelPosition = 67;
  private sizeMode = '';

  private updateLayoutSplitPanel(forceUpdate = false): void {
    if (this.sizeMode === 'desktop') {
      this.slSplitPanel.position = this.splitPanelPosition;
    }

    if (window.innerWidth <= this.MOBILE_WIDTH && (this.sizeMode !== 'mobile' || forceUpdate)) {
      this.sizeMode = 'mobile';
      this.slSplitPanel.position = 100;
      this.slSplitPanel.setAttribute('disabled', 'true');
    } else if (window.innerWidth > this.MOBILE_WIDTH && (this.sizeMode !== 'desktop' || forceUpdate)) {
      this.sizeMode = 'desktop';
      this.slSplitPanel.position = this.splitPanelPosition;
      // Sem documento o divisor também fica desabilitado.
      if (this.documentoInicializado) this.slSplitPanel.removeAttribute('disabled');
      else this.slSplitPanel.setAttribute('disabled', 'true');
    }
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('documentoInicializado')) this.updateLayoutSplitPanel(true);
  }

  // Documentação de tratamento de eventos no Lit
  // https://lit.dev/docs/components/events/

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this.handleResize);
    super.disconnectedCallback();
  }

  handleResize = (): void => {
    this.updateLayoutSplitPanel();
    this.ajustarAltura();
  };

  protected firstUpdated(): void {
    // this.habilitarBotoes();
    // setTimeout(() => this.atualizaListaParlamentares(), 0);
    // setTimeout(() => this.atualizaListaComissoes(), 0);

    this._tabsEsquerda?.addEventListener('sl-tab-show', (event: any) => {
      const tabName = event.detail.name;
      if (tabName === 'avisos') {
        const badge = (event.target as Element).querySelector('sl-badge');
        if (badge) {
          badge.pulse = false;
        }
      } else if (tabName === 'autoria') {
        // this.parlamentares.length === 0 && this.atualizaListaParlamentares();
        // this.comissoes?.length === 0 && this.atualizaListaComissoes();
      }
    });

    this.slSplitPanel.addEventListener('sl-reposition', () => {
      this.ajustarAltura();
    });
  }

  private pesquisarAlturaParentElement(elemento): number {
    if (elemento.parentElement === null) {
      // chegou no HTML e não encontrou altura
      return 0;
    } else {
      const minHeight = getComputedStyle(this).getPropertyValue('--min-height').replace('px', '');
      if (elemento.clientHeight >= minHeight) {
        return elemento.clientHeight;
      } else {
        return this.pesquisarAlturaParentElement(elemento.parentElement);
      }
    }
  }

  private ajustarAltura(altura?: number): boolean {
    const alturaElementoBase = altura ?? this.pesquisarAlturaParentElement(this);
    const lexmlEtaTabs = document.querySelector('sl-tab-group')?.shadowRoot?.querySelector('.tab-group__nav-container');
    const alturaLexmlEtaTabs = lexmlEtaTabs?.clientHeight;

    if (!alturaLexmlEtaTabs) return false;

    const alturaElemento = alturaElementoBase - alturaLexmlEtaTabs - 12;
    if (alturaElemento <= 0) return false;

    const getElement = (selector: string): HTMLElement => document.querySelector(selector) as HTMLElement;

    const justificativaTabPanel = getElement('sl-tab-panel[name="justificativa"]');
    const proposicaoTabPanel = getElement('sl-tab-panel[name="lexml-eta-proposicao"]');
    const qlToolbarJustificativa = getElement('#lexml-eta-editor-texto-rico-justificativa .ql-toolbar');
    const qlToolbar = getElement('#lx-eta-barra-ferramenta');

    const estilosOriginais = {
      justificativa: {
        display: justificativaTabPanel.style.display,
        opacity: justificativaTabPanel.style.opacity,
        pointerEvents: justificativaTabPanel.style.pointerEvents,
      },
      proposicao: {
        display: proposicaoTabPanel.style.display,
        opacity: proposicaoTabPanel.style.opacity,
        pointerEvents: proposicaoTabPanel.style.pointerEvents,
      },
    };

    const setTabPanelStyles = (tabPanel: HTMLElement, estilos: any, isTemporary = false): void => {
      if (isTemporary) {
        tabPanel.style.opacity = '0';
        tabPanel.style.pointerEvents = 'none';
        tabPanel.style.display = 'block';
      } else {
        tabPanel.style.opacity = estilos.opacity;
        tabPanel.style.pointerEvents = estilos.pointerEvents;
        tabPanel.style.display = estilos.display;
      }
    };

    if (estilosOriginais.justificativa.display === 'none') {
      setTabPanelStyles(justificativaTabPanel, estilosOriginais.justificativa, true);
    }
    if (estilosOriginais.proposicao.display === 'none') {
      setTabPanelStyles(proposicaoTabPanel, estilosOriginais.proposicao, true);
    }

    const alturaToolBarJustificativa = qlToolbarJustificativa?.clientHeight + 10;
    const alturaToolBar = qlToolbar?.clientHeight + 10;

    setTabPanelStyles(justificativaTabPanel, estilosOriginais.justificativa);
    setTabPanelStyles(proposicaoTabPanel, estilosOriginais.proposicao);

    this.style.setProperty('--heightJustificativa', `${alturaElemento - alturaToolBarJustificativa}px`);
    this.style.setProperty('--heightToolbar', `${alturaElemento - alturaToolBar}px`);
    this.style.setProperty('--height', `${alturaElemento}px`);
    this.style.setProperty('--overflow', 'hidden');

    return true;
  }

  private onChange(): void {
    this.buildAlertaJustificativa();
  }

  private isJustificacaoObrigatoria(): boolean {
    return !this.anexoParecer;
  }

  buildAlertaJustificativa(): void {
    if (!this.isJustificacaoObrigatoria()) {
      rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
      return;
    }

    if (this._lexmlJustificativa.isEditorVazio()) {
      this.disparaAlerta();
    } else {
      rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
    }
  }

  disparaAlerta(): void {
    const alerta = {
      id: 'alerta-global-justificativa',
      tipo: TipoMensagem.CRITICAL,
      mensagem: 'A proposição não possui uma justificação',
      podeFechar: false,
    };
    rootStore.dispatch(adicionarAlerta(alerta));
  }

  getJustificativa(): string {
    return '';
  }

  limparAlertas(): void {
    rootStore.dispatch(limparAlertas());
  }

  mostrarDialogDisclaimerRevisao(): void {
    mostrarDialogDisclaimerRevisao();
  }

  private updateView(): void {
    this.updateState = new Date();
  }

  private sincronizarESelecionarAba(tabGroup: any, nomePainel: string): void {
    if (!tabGroup) return;

    tabGroup.syncTabsAndPanels();
    const aba = tabGroup.getAllTabs().find(tab => tab.panel === nomePainel);
    if (!aba) return;

    if (tabGroup.getActiveTab() === aba) {
      tabGroup.getAllTabs(true).forEach(tab => (tab.active = tab === aba));
      tabGroup.getAllPanels().forEach(panel => (panel.active = panel.name === nomePainel));
      tabGroup.syncIndicator();
    } else {
      tabGroup.setActiveTab(aba, { emitEvents: false });
    }
  }

  render(): TemplateResult {
    const neutro = !this.documentoInicializado;
    return html`
      ${shoelaceLightThemeStyles} ${quillSnowStyles} ${editorStyles}
      <style>
        :root {
          --height: 100%;
          --overflow: visible;
          --min-height: 300px;
          --heightJustificativa: 100%;
          --heightToolbar: 100%;
          --visibilityNotasAcao: hidden;
        }
        sl-tab-panel {
          --padding: 0px;
        }
        sl-tab-panel::part(base) {
          height: var(--height);
        }
        sl-tab-panel.overflow-hidden::part(base) {
          overflow-y: auto;
        }
        lexml-eta-destino[hidden],
        lexml-eta-autoria[hidden] {
          display: none !important;
        }
        sl-tab.aba-neutra {
          opacity: 0.5;
        }
        lexml-eta-proposicao.oculto {
          display: none !important;
        }
        .aguardando-inicializacao {
          display: flex;
          align-items: center;
          justify-content: center;
          height: var(--height);
          min-height: var(--min-height);
          color: var(--sl-color-neutral-500);
          font-family: var(--eta-font-sans);
        }
        sl-tab-panel.painel-anexo-parecer {
          display: none !important;
        }
        lexml-eta-proposicao {
          font-family: var(--eta-font-serif);
          text-align: left;
        }
        #lexml-eta-editor-texto-rico-justificativa-inner {
          height: calc(var(--heightJustificativa));
          overflow: var(--overflow);
        }
        .badge-pulse {
          margin-left: 7px;
          height: 16px;
          margin-top: -4px;
        }

        #badgeAtalhos::part(base) {
          height: 16px;
          margin-top: 2px;
          font-size: var(--sl-font-size-small);
          background-color: transparent;
          color: var(--sl-color-neutral-600);
        }
        sl-tab[panel='atalhos'][active] #badgeAtalhos::part(base) {
          color: var(--sl-color-primary-600);
        }

        sl-split-panel {
          --divider-width: 15px;
          --min: 70%;
          --max: 85%;
        }
        sl-tab sl-icon {
          margin-right: 5px;
          font-size: 18px;
        }
        .tab-autoria__container {
          padding: 10px;
        }
        .notas-rodape {
          font-family: var(--eta-font-serif);
          font-style: normal;
          padding: 10px;
        }
        .notas-rodape h4 {
          font-family: var(--eta-font-sans);
          font-style: normal;
          padding: 1rem 0px 0.5rem;
          margin: 0px;
        }
        .notas-texto-vazio {
          padding-left: 20px;
          color: var(--sl-color-gray-500);
          font-style: italic;
        }

        .notas-rodape ol {
          padding-left: 20px;
          list-style: none;
          counter-reset: item;
          margin: 0px;
        }

        .notas-rodape li {
          padding: 0px;
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .notas-rodape li:hover {
          --visibilityNotasAcao: visible;
          background-color: var(--sl-color-gray-100);
        }

        .notas-rodape li::before {
          content: counter(item);
          counter-increment: item;
          position: absolute;
          width: 20px;
          left: -20px;
          top: 4px;
          font-size: smaller;
          vertical-align: super;
          font-weight: bold;
          font-size: 12px;
          color: var(--sl-color-gray-500);
          text-align: right;
        }

        .notas-texto {
          flex-grow: 1;
          cursor: pointer;
          padding: 5px;
          color: var(--sl-color-gray-500);
        }

        .notas-texto p {
          margin-block-start: 0;
          margin-block-end: 0;
        }

        .notas-acoes {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .notas-acao {
          margin-left: 5px;
          visibility: var(--visibilityNotasAcao);
          cursor: pointer;
        }

        .notas-checkbox {
          appearance: none;
          background: transparent;
          display: none;
        }

        .notas-checkbox:checked + .notas-texto {
          color: black;
          font-style: italic;
        }

        @media (max-width: 768px) {
          sl-split-panel {
            --divider-width: 0px;
          }
        }
      </style>

      <sl-split-panel position="67">
        <sl-icon slot="handle" name="grip-vertical"></sl-icon>
        <div slot="start">
          <sl-tab-group id="tabs-esquerda">
            <sl-tab slot="nav" panel="lexml-eta-proposicao" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>Texto</sl-tab>
            ${!this.anexoParecer ? html`<sl-tab slot="nav" panel="justificativa" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>Justificação</sl-tab>` : ''}
            <sl-tab slot="nav" panel="autoria" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>Destino, Data, Autoria e Impressão</sl-tab>
            <sl-tab slot="nav" panel="anexos" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>Anexos${this.totalAnexos > 0 ? ` (${this.totalAnexos})` : ''}</sl-tab>
            <sl-tab slot="nav" panel="avisos" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>
              Avisos
              <div class="badge-pulse" id="contadorAvisos">${this.totalAlertas > 0 ? html` <sl-badge variant="danger" pill pulse>${this.totalAlertas}</sl-badge> ` : ''}</div>
            </sl-tab>
            <sl-tab-panel name="lexml-eta-proposicao" class="overflow-hidden">
              ${neutro ? html`<div class="aguardando-inicializacao">aguardando inicialização</div>` : ''}
              <lexml-eta-proposicao
                class=${neutro ? 'oculto' : ''}
                style="display: block}"
                id="lexmlEta"
                .lexmlEtaConfig=${this.lexmlEtaConfig}
                @onchange=${this.onChange}
              ></lexml-eta-proposicao>
            </sl-tab-panel>
            <sl-tab-panel name="justificativa" class="overflow-hidden ${this.anexoParecer ? 'painel-anexo-parecer' : ''}">
              <lexml-eta-editor-texto-rico
                .lexmlEtaConfig=${this.lexmlEtaConfig}
                modo="justificativa"
                id="lexml-eta-editor-texto-rico-justificativa"
                registroEvento="justificativa"
                @onchange=${this.onChange}
              ></lexml-eta-editor-texto-rico>
            </sl-tab-panel>
            <sl-tab-panel name="autoria" class="overflow-hidden">
              <div class="tab-autoria__container">
                <lexml-eta-destino .comissoes=${this.comissoes} ?hidden=${this.tipoNaoSuportado}></lexml-eta-destino>
                <div>
                  <br />
                  <lexml-eta-data></lexml-eta-data>
                  <br />
                  <lexml-eta-autoria .parlamentares=${this.parlamentares} ?hidden=${this.tipoNaoSuportado}></lexml-eta-autoria>
                </div>
                <lexml-eta-opcoes-impressao></lexml-eta-opcoes-impressao>
              </div>
            </sl-tab-panel>
            <sl-tab-panel name="anexos" class="overflow-hidden">
              <lexml-eta-anexos .lexmlEtaConfig=${this.lexmlEtaConfig} @onchange=${this.atualizarTotalAnexos}></lexml-eta-anexos>
            </sl-tab-panel>
            <sl-tab-panel name="avisos" class="overflow-hidden">
              <lexml-eta-alertas></lexml-eta-alertas>
            </sl-tab-panel>
          </sl-tab-group>
        </div>
        <div slot="end">
          <sl-tab-group id="tabs-direita">
            ${this.tabIsVisible('comando')
              ? html`
                  <sl-tab slot="nav" panel="comando" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>
                    <sl-icon name="code"></sl-icon>
                    Comando
                  </sl-tab>
                `
              : ''}
            ${this.tabIsVisible('notas')
              ? html`
                  <sl-tab slot="nav" panel="notas" title="Notas de rodapé" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>
                    <sl-icon name="footnote"></sl-icon>
                    Notas
                  </sl-tab>
                `
              : ''}
            ${this.tabIsVisible('dicas')
              ? html`
                  <sl-tab slot="nav" panel="dicas" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>
                    <sl-icon name="lightbulb"></sl-icon>
                    Dicas
                  </sl-tab>
                `
              : ''}
            ${this.tabIsVisible('atalhos')
              ? html`
                  <sl-tab slot="nav" panel="atalhos" ?inert=${neutro} class=${neutro ? 'aba-neutra' : ''}>
                    <sl-badge variant="primary" id="badgeAtalhos" pill>
                      <sl-icon name="keyboard"></sl-icon>
                      Atalhos
                    </sl-badge>
                  </sl-tab>
                `
              : ''}
            ${!this.anexoParecer
              ? html`
                  <sl-tab-panel name="notas" class="overflow-hidden">
                    <div class="notas-rodape">
                      <h4>Notas de rodapé</h4>
                      ${this.renderNotasRodape()}
                    </div>
                  </sl-tab-panel>
                `
              : ''}
            <sl-tab-panel name="dicas" class="overflow-hidden">
              <lexml-eta-ajuda></lexml-eta-ajuda>
            </sl-tab-panel>
            <sl-tab-panel name="atalhos" class="overflow-hidden">
              <lexml-eta-atalhos></lexml-eta-atalhos>
            </sl-tab-panel>
          </sl-tab-group>
        </div>
      </sl-split-panel>
    `;
  }

  tabIsVisible(tab: string): boolean {
    if (tab === 'notas' && this.anexoParecer) {
      return false;
    }
    return tab === 'notas' || tab === 'atalhos';
  }

  onChangeNotasRodape(): void {
    this.notasRodape = this._lexmlJustificativa.notasRodape;
    if (!this.anexoParecer) {
      this.focusOnTab('notas');
    }
  }

  renderNotasRodape(): TemplateResult {
    return !this.notasRodape.length
      ? html`<span class="notas-texto-vazio">Não há notas de rodapé registradas.</span>`
      : html`
          <ol>
            ${this._lexmlJustificativa.notasRodape.map(
              (nr: NotaRodape) =>
                html`
                  <li>
                    <input type="checkbox" idNotaRodape="${nr.id}" class="notas-checkbox" id="checkbox-${nr.id}" @change=${(): void => this.selecionarNotaRodape(nr.id)} />
                    <label for="checkbox-${nr.id}" class="notas-texto">${unsafeHTML(nr.texto)}</label>
                    <span class="notas-acoes">
                      <sl-button
                        class="notas-acao"
                        variant="default"
                        size="small"
                        aria-label="Editar nota de rodapé"
                        title="Editar nota de rodapé"
                        idNotaRodape="${nr.id}"
                        @click=${this.editarNotaRodape}
                      >
                        <sl-icon slot="prefix" name="pencil-square"></sl-icon>
                      </sl-button>
                      <sl-button
                        class="notas-acao"
                        variant="default"
                        size="small"
                        aria-label="Excluir nota de rodapé"
                        title="Excluir nota de rodapé"
                        idNotaRodape="${nr.id}"
                        @click=${this.removerNotaRodape}
                      >
                        <sl-icon slot="prefix" name="trash"></sl-icon>
                      </sl-button>
                    </span>
                  </li>
                `
            )}
          </ol>
        `;
  }

  focusOnTab(tabName: string): void {
    if (this.anexoParecer) return;

    const tab = this.querySelector(`sl-tab[panel="${tabName}"]`) as HTMLElement | null;
    if (!tab) return;

    this._tabsDireita?.show('notas');

    if (tabName === 'notas') {
      const badgeElement = tab?.querySelector('sl-badge');
      if (!badgeElement) return;

      if (!tab.hasAttribute('active')) {
        if (tabName === 'notas') {
          badgeElement.setAttribute('pulse', '');
          setTimeout(() => {
            badgeElement.removeAttribute('pulse');
          }, 4000);
        }
      }
    }
  }

  localizarNotaRodape(idNotaRodape: any): void {
    // const idNotaRodape = event.target.getAttribute('idNotaRodape');
    const notaRodapeElement = this.querySelector(`.ql-editor lexml-eta-nota-rodape[id-lexml-eta-nota-rodape="${idNotaRodape}"]`);
    const tab = this.getTabFromElement(notaRodapeElement);
    this.focusOnTab(tab.getAttribute('name'));
    notaRodapeElement && setTimeout(() => notaRodapeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    const notasRodape = this.querySelectorAll('.ql-editor lexml-eta-nota-rodape');
    notasRodape.forEach(nr => {
      if (nr.attributes['id-lexml-eta-nota-rodape'].value === idNotaRodape) {
        nr?.classList.add('pulse');
      } else {
        nr.classList.remove('pulse');
      }
    });
  }

  selecionarNotaRodape(idNotaRodape: any): void {
    const checkbox = document.getElementById(`checkbox-${idNotaRodape}`) as HTMLInputElement | null;
    if (checkbox) {
      if (checkbox.checked) {
        const checkboxes = document.querySelectorAll('.notas-checkbox') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(cb => {
          if (cb.id !== checkbox.id) {
            cb.checked = false;
          }
        });
        this.localizarNotaRodape(idNotaRodape);
      } else {
        this.removerPulsarNotaRodape(idNotaRodape);
      }
    }
  }

  removerPulsarNotaRodape(idNotaRodape: any): void {
    const notaRodapeElement = this.querySelector(`.ql-editor lexml-eta-nota-rodape[id-lexml-eta-nota-rodape="${idNotaRodape}"]`);
    notaRodapeElement?.classList.remove('pulse');
  }

  editarNotaRodape(event: any): void {
    const idNotaRodape = event.target.getAttribute('idNotaRodape');
    const notaRodapeElement = this.querySelector(`.ql-editor lexml-eta-nota-rodape[id-lexml-eta-nota-rodape="${idNotaRodape}"]`);
    const editorTextoRico = this.getEditorTextoRicoFromElement(notaRodapeElement);
    editorTextoRico?.focus();
    editorTextoRico.editarNotaRodape(idNotaRodape);
  }

  removerNotaRodape(event: any): void {
    const idNotaRodape = event.target.getAttribute('idNotaRodape');
    const notaRodapeElement = this.querySelector(`.ql-editor lexml-eta-nota-rodape[id-lexml-eta-nota-rodape="${idNotaRodape}"]`);
    const editorTextoRico = this.getEditorTextoRicoFromElement(notaRodapeElement);
    editorTextoRico?.focus();
    editorTextoRico.removerNotaRodape(idNotaRodape);
  }

  getEditorTextoRicoFromElement(element: any): any {
    return element.closest('lexml-eta-editor-texto-rico');
  }

  getTabFromElement(element: any): any {
    return element.closest('sl-tab-panel');
  }
}
