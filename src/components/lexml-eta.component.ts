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
import { Autoria, ColegiadoApreciador, Emenda, Epigrafe, Parlamentar, OpcoesImpressao } from '../model/emenda/emenda';
import { buildFakeUrn, getAno, getNumero, getSigla } from '../model/lexml/documento/urnUtil';
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
import { buildContent, getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { Comissao } from './destino/comissao';
import { NOTA_RODAPE_CHANGE_EVENT, NOTA_RODAPE_REMOVE_EVENT, NotaRodape } from './editor-texto-rico/notaRodape';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DestinoComponent } from './destino/destino.component';
import { errorInicializarEdicaoAction } from '../model/lexml/acao/errorInicializarEdicaoAction';
import { isHtmlSemTexto } from '../util/string-util';
import { ConfiguracaoPaginacao } from '../model/paginacao/paginacao';
import { TipoMensagem } from '../model/lexml/util/mensagem';
import { getRefProposicaoReduzida, Proposicao } from '../model/proposicao/proposicao';

export interface DispositivoBloqueado {
  lexmlId: string;
  bloquearFilhos: boolean;
  motivoBloqueio?: string;
}

type TipoCasaLegislativa = 'SF' | 'CD' | 'CN';

/**
 * Parâmetros de inicialização de edição de documento
 */
export class LexmlEtaParametrosEdicao {
  // Identificação da proposição (texto).
  // Opcional se for informada a proposicao ou o projetoNorma
  urn = '';
  sigla = '';
  numero = '';
  ano = '';

  proposicao?: Proposicao;

  // Indica se é texto substitutivo. Quando true, sigla, numero e ano são obrigatórios.
  substitutivo = false;

  // Indicação de matéria orçamentária. Utilizado inicialmente para definir destino de emenda a MP
  isMateriaOrcamentaria = false;

  // Texto json da proposição para edição estruturada
  // Opcional para modo 'edicao'
  projetoNorma?: ProjetoNorma;

  // Lista de lexml id's de artigos bloqueados para edição.
  // Não é salvo junto com a emenda, portanto deve ser informado também ao abrir uma emenda existente.
  dispositivosBloqueados?: (string | DispositivoBloqueado)[];

  // Identificação do usuário para registro de marcas de revisão
  usuario?: Usuario;

  // Preferências de usuário ----

  // Autoria padrão
  autoriaPadrao?: { identificacao: string; siglaCasaLegislativa: 'SF' | 'CD' };

  // Opções de impressão padrão
  opcoesImpressaoPadrao?: { imprimirBrasao: boolean; textoCabecalho: string; tamanhoFonte: number };

  // Configuração de paginação de dispositivos durante a edição da emenda
  configuracaoPaginacao?: ConfiguracaoPaginacao;

  // Casa legislativa resposavel pela apreciaçao da matéria
  casaLegislativa?: TipoCasaLegislativa;
}

@customElement('lexml-eta')
export class LexmlEtaComponent extends connect(rootStore)(LitElement) {
  @property({ type: Boolean }) existeObserverEmenda = false;
  @property({ type: Number }) totalAlertas = 0;
  @property({ type: Boolean }) exibirAjuda = true;
  @property({ type: Array }) parlamentares: Parlamentar[] = [];
  @property({ type: Array }) comissoes: Comissao[] = [];
  @property({ type: Object }) lexmlEmendaConfig: LexmlEtaConfig = new LexmlEtaConfig();

  private urn = '';

  private isMateriaOrcamentaria = false;

  private projetoNorma: any;

  private casaLegislativa: TipoCasaLegislativa = 'CN';

  private parlamentaresCarregados = false;
  private comissoesCarregadas = false;

  private substitutivo = false;

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
  @query('#tabs-esquerda')
  _tabsEsquerda;
  @query('#tabs-direita')
  _tabsDireita;

  @query('sl-split-panel')
  private slSplitPanel!: any;

  async getParlamentares(): Promise<Parlamentar[]> {
    try {
      const _response = await fetch(this.lexmlEmendaConfig.urlConsultaParlamentares);
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
      if (!this.lexmlEmendaConfig.urlComissoes) {
        return Promise.resolve([]);
      }
      const _response = await fetch(`${this.lexmlEmendaConfig.urlComissoes}?siglaCasaLegislativa=${siglaCasaLegislativa}`);
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

  getProposicao(): any {
    if (!this.urn) {
      return new Proposicao();
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
    proposicao.pendenciasPreenchimento = this.getPendenciasPreenchimentoEmenda(proposicao);
    proposicao.epigrafe = this.getEpigrafe(this.projetoNorma);

    proposicao.colegiadoApreciador = this._lexmlDestino!.colegiadoApreciador;
    proposicao.anexos = this._lexmlEta!.getAnexos();
    proposicao.substitutivo = this.substitutivo;
    if (proposicao.colegiadoApreciador) proposicao.local = this.montarLocalFromColegiadoApreciador(proposicao.colegiadoApreciador);

    return proposicao;
  }

  getEpigrafe(projetoNorma: any): Epigrafe {
    const epigrafe = new Epigrafe();
    const doc = projetoNorma.value.projetoNorma.norma || projetoNorma.value.projetoNorma.projeto;
    epigrafe.texto = doc.parteInicial?.epigrafe.content[0];

    return epigrafe;
  }

  private getPendenciasPreenchimentoEmenda(emenda: Emenda | Proposicao): string[] {
    const pendenciasPreenchimento: Array<string> = [];

    // Verifica preenchimento da justificação
    if (isHtmlSemTexto(emenda.justificativa)) {
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

  async inicializarEdicao(params: LexmlEtaParametrosEdicao) {
    try {
      this.projetoNorma = params.projetoNorma;
      this.isMateriaOrcamentaria = params.isMateriaOrcamentaria || (!!params.proposicao && params.proposicao.colegiadoApreciador?.siglaComissao === 'CMO');
      this._lexmlDestino!.isMateriaOrcamentaria = this.isMateriaOrcamentaria;

      this.inicializaProposicao(params);

      this.setUsuario(params.usuario ?? rootStore.getState().elementoReducer.usuario);

      this._lexmlEta!.inicializarEdicao(this.urn, params);

      this.casaLegislativa = this.inicializaCasaLegislativa(getSigla(this.urn), params);

      // Deve ser chamado antes do reseta emenda para garantir a autoria padrão e depois da inicialização da casaLegislativa
      this.parlamentares = await this.getParlamentares();

      if (params.proposicao) {
        this.setProposicao(params.proposicao);
      } else {
        this.resetaProposicao(params);
      }

      this.atualizaListaComissoes();

      this.limparAlertas();

      setTimeout(this.handleResize, 0);

      if (!params.proposicao?.revisoes?.length) {
        this.desativarMarcaRevisao();
      }

      this._tabsEsquerda.show('lexml-eta');

      setTimeout(() => {
        this._tabsDireita?.show('notas');
      });

      this.updateView();
    } catch (err) {
      console.error(err);
      this.emitirEventoFatalError(err);
      setTimeout(() => {
        rootStore.dispatch(errorInicializarEdicaoAction.execute(err));
      }, 0);
    }
  }

  private inicializaCasaLegislativa(siglaProposicao: string, params: LexmlEtaParametrosEdicao): TipoCasaLegislativa {
    if (['MPV', 'PDN', 'PRN'].indexOf(siglaProposicao) > -1) {
      return 'CN';
    }
    //TODO Mudar para proposicao
    return (params.proposicao ? params.proposicao.colegiadoApreciador?.siglaCasaLegislativa : params.casaLegislativa) || 'CN';
  }

  private validarParametrosIdentificacaoProposicao(params: LexmlEtaParametrosEdicao): void {
    if (!params.sigla) {
      throw new Error('O parâmetro "sigla" é obrigatório.');
    }
    if (params.substitutivo) {
      if (!params.numero) {
        throw new Error('O parâmetro "numero" é obrigatório para texto substitutivo.');
      }
      if (!params.ano) {
        throw new Error('O parâmetro "ano" é obrigatório para texto substitutivo.');
      }
    } else {
      if (!params.numero) {
        params.numero = '1';
      }
      if (!params.ano) {
        params.ano = new Date().getFullYear().toString();
      }
    }
  }

  private inicializaProposicao(params: LexmlEtaParametrosEdicao): void {
    this.urn = '';

    if (params.proposicao) {
      this.urn = buildFakeUrn(params.proposicao.sigla, params.proposicao.numero, params.proposicao.ano);
    } else if (this.projetoNorma) {
      this.urn = getUrn(params.projetoNorma);
    } else {
      this.validarParametrosIdentificacaoProposicao(params);
      this.urn = buildFakeUrn(params.sigla, params.numero, params.ano);
    }
  }

  getEmentaFromProjetoNorma(projetoNorma: any): string {
    return buildContent(projetoNorma.value?.projetoNorma?.norma?.parteInicial?.ementa.content);
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
    if (proposicao.autoria) this._lexmlAutoria.autoria = proposicao.autoria;
    this._lexmlAutoria.casaLegislativa = this.casaLegislativa;
    this._lexmlOpcoesImpressao.opcoesImpressao = proposicao.opcoesImpressao;
    this._lexmlJustificativa.setTextoAntesRevisao(proposicao.justificativaAntesRevisao);
    this._lexmlDestino!.colegiadoApreciador = proposicao.colegiadoApreciador;
    this._lexmlDestino!.proposicao = getRefProposicaoReduzida(proposicao);
    this.notasRodape = proposicao.notasRodape || [];
    this._lexmlJustificativa.setContent(proposicao.justificativa, proposicao.notasRodape);
    this._lexmlData.data = proposicao.dataUltimaModificacao;
    this._lexmlEta!.setDispositivosERevisoesEmenda(proposicao.revisoes);
    this._lexmlEta!.atualizaAnexos(proposicao.anexos || []);
  }

  private resetaProposicao(params: LexmlEtaParametrosEdicao): void {
    const proposicao = new Proposicao();
    // emenda.proposicao = this.montarProposicaoPorUrn(this.urn, params.ementa);
    proposicao.autoria = this.montarAutoriaPadrao(params);
    proposicao.opcoesImpressao = this.montarOpcoesImpressaoPadrao(params);
    proposicao.colegiadoApreciador.siglaCasaLegislativa = this.casaLegislativa;
    proposicao.substitutivo = params.substitutivo;
    this.setProposicao(proposicao);
    rootStore.dispatch(limparRevisaoAction.execute());
  }

  private montarAutoriaPadrao(params: LexmlEtaParametrosEdicao): Autoria {
    const autoria = new Autoria();
    if (params.autoriaPadrao?.identificacao) {
      const autoriaPadrao = params.autoriaPadrao;
      const parlamentarAutor = this.parlamentares.find(
        par => par.identificacao === autoriaPadrao!.identificacao && par.siglaCasaLegislativa === autoriaPadrao!.siglaCasaLegislativa
      );
      if (parlamentarAutor) {
        autoria.parlamentares = [parlamentarAutor];
      }
    }
    return autoria;
  }

  private montarOpcoesImpressaoPadrao(params: LexmlEtaParametrosEdicao): OpcoesImpressao {
    const opcoesImpressao = new OpcoesImpressao();
    if (params.opcoesImpressaoPadrao) {
      opcoesImpressao.imprimirBrasao = params.opcoesImpressaoPadrao.imprimirBrasao;
      opcoesImpressao.textoCabecalho = params.opcoesImpressaoPadrao.textoCabecalho;
      opcoesImpressao.tamanhoFonte = params.opcoesImpressaoPadrao.tamanhoFonte;
    }
    return opcoesImpressao;
  }

  constructor() {
    super();
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
      this.slSplitPanel.removeAttribute('disabled');
    }
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

    const badgeAtalhos = this._tabsDireita?.querySelector('#badgeAtalhos');
    if (badgeAtalhos) {
      const naoPulsarBadgeAtalhos = localStorage.getItem('naoPulsarBadgeAtalhos');
      if (!naoPulsarBadgeAtalhos) {
        badgeAtalhos.pulse = true;
        badgeAtalhos.setAttribute('variant', 'warning');
      }
    }

    this._tabsDireita?.addEventListener('sl-tab-show', (event: any) => {
      const tabName = event.detail.name;
      if (tabName === 'atalhos') {
        const badge = (event.target as Element).querySelector('sl-badge');
        if (badge) {
          badge.pulse = false;
          badge.setAttribute('variant', 'primmay');
        }
        localStorage.setItem('naoPulsarBadgeAtalhos', 'true');
      }
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
    const qlToolbarEmenda = getElement('#lx-eta-barra-ferramenta');

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
    const alturaToolBarEmenda = qlToolbarEmenda?.clientHeight + 10;

    setTabPanelStyles(justificativaTabPanel, estilosOriginais.justificativa);
    setTabPanelStyles(proposicaoTabPanel, estilosOriginais.proposicao);

    this.style.setProperty('--heightJustificativa', `${alturaElemento - alturaToolBarJustificativa}px`);
    this.style.setProperty('--heightEmenda', `${alturaElemento - alturaToolBarEmenda}px`);
    this.style.setProperty('--height', `${alturaElemento}px`);
    this.style.setProperty('--overflow', 'hidden');

    return true;
  }

  private onChange(): void {
    this.buildAlertaJustificativa();
  }

  buildAlertaJustificativa(): void {
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
      mensagem: 'A emenda não possui uma justificação',
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

  showAlertaEmendaTextoLivre(): void {
    const alerta = {
      id: 'alerta-global-emenda-texto-livre',
      tipo: TipoMensagem.CRITICAL,
      mensagem: 'O comando de emenda deve ser preenchido.',
      podeFechar: false,
    };
    rootStore.dispatch(adicionarAlerta(alerta));
  }

  mostrarDialogDisclaimerRevisao(): void {
    mostrarDialogDisclaimerRevisao();
  }

  private updateView(): void {
    this.updateState = new Date();
  }

  render(): TemplateResult {
    return html`
      ${shoelaceLightThemeStyles} ${quillSnowStyles} ${editorStyles}
      <style>
        :root {
          --height: 100%;
          --overflow: visible;
          --min-height: 300px;
          --heightJustificativa: 100%;
          --heightEmenda: 100%;
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
        lexml-eta-proposicao {
          font-family: var(--eta-font-serif);
          text-align: left;
        }
        /* #lexml-eta-editor-texto-rico-justificativa #lexml-eta-editor-texto-rico {
          height: calc(var(--height) - 44px);
          overflow: var(--overflow);
        } */
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
            <sl-tab slot="nav" panel="lexml-eta-proposicao">Texto</sl-tab>
            <sl-tab slot="nav" panel="justificativa">Justificação</sl-tab>
            <sl-tab slot="nav" panel="autoria">Destino, Data, Autoria e Impressão</sl-tab>
            <sl-tab slot="nav" panel="avisos">
              Avisos
              <div class="badge-pulse" id="contadorAvisos">${this.totalAlertas > 0 ? html` <sl-badge variant="danger" pill pulse>${this.totalAlertas}</sl-badge> ` : ''}</div>
            </sl-tab>
            <sl-tab-panel name="lexml-eta-proposicao" class="overflow-hidden">
              <lexml-eta-proposicao style="display: block}" id="lexmlEta" .lexmlEtaConfig=${this.lexmlEmendaConfig} @onchange=${this.onChange}></lexml-eta-proposicao>
            </sl-tab-panel>
            <sl-tab-panel name="justificativa" class="overflow-hidden">
              <lexml-eta-editor-texto-rico
                .lexmlEtaConfig=${this.lexmlEmendaConfig}
                modo="justificativa"
                id="lexml-eta-editor-texto-rico-justificativa"
                registroEvento="justificativa"
                @onchange=${this.onChange}
              ></lexml-eta-editor-texto-rico>
            </sl-tab-panel>
            <sl-tab-panel name="autoria" class="overflow-hidden">
              <div class="tab-autoria__container">
                <lexml-eta-destino .comissoes=${this.comissoes}></lexml-eta-destino>
                <br />
                <lexml-eta-data></lexml-eta-data>
                <br />
                <lexml-eta-autoria .parlamentares=${this.parlamentares}></lexml-eta-autoria>
                <lexml-eta-opcoes-impressao></lexml-eta-opcoes-impressao>
              </div>
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
                  <sl-tab slot="nav" panel="comando">
                    <sl-icon name="code"></sl-icon>
                    Comando
                  </sl-tab>
                `
              : ''}
            ${this.tabIsVisible('notas')
              ? html`
                  <sl-tab slot="nav" panel="notas" title="Notas de rodapé">
                    <sl-icon name="footnote"></sl-icon>
                    Notas
                  </sl-tab>
                `
              : ''}
            ${this.tabIsVisible('dicas')
              ? html`
                  <sl-tab slot="nav" panel="dicas">
                    <sl-icon name="lightbulb"></sl-icon>
                    Dicas
                  </sl-tab>
                `
              : ''}
            ${this.tabIsVisible('atalhos')
              ? html`
                  <sl-tab slot="nav" panel="atalhos">
                    <sl-badge variant="primary" id="badgeAtalhos" pill>
                      <sl-icon name="keyboard"></sl-icon>
                      Atalhos
                    </sl-badge>
                  </sl-tab>
                `
              : ''}
            <sl-tab-panel name="notas" class="overflow-hidden">
              <div class="notas-rodape">
                <h4>Notas de rodapé</h4>
                ${this.renderNotasRodape()}
              </div>
            </sl-tab-panel>
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
    return tab === 'notas' || tab === 'atalhos';
  }

  onChangeNotasRodape(): void {
    this.notasRodape = this._lexmlJustificativa.notasRodape;
    this.focusOnTab('notas');
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

  getRestricoesConhecidas(): string[] {
    return [
      'Emendamento ou adição de anexos.',
      'Emendamento ou adição de pena, penalidade etc.',
      'Emendamento ou adição de especificação temática do dispositivo (usado para nome do tipo penal e outros).',
      'Alteração de anexo de MP de crédito extraordinário.',
      'Alteração do texto da proposição e proposta de adição de dispositivos onde couber na mesma emenda.',
      'Alteração de norma que não segue a LC nº 95 de 98 (ex: norma com alíneas em parágrafos).',
      'Casos especiais de numeração de parte (PARTE GERAL, PARTE ESPECIAL e uso de numeral ordinal por extenso).',
      'Tabelas e imagens no texto da proposição.',
    ];
  }
}
