import { Usuario } from './../model/revisao/usuario';
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
import { Autoria, ColegiadoApreciador, Emenda, Epigrafe, ModoEdicaoEmenda, Parlamentar, RefProposicaoEmendada, OpcoesImpressao, SubstituicaoTermo } from '../model/emenda/emenda';
import { buildFakeUrn, getAno, getNumero, getSigla, getTipo } from '../model/lexml/documento/urnUtil';
import { rootStore } from '../redux/store';
import { ClassificacaoDocumento } from './../model/documento/classificacao';
import { ProjetoNorma } from './../model/lexml/documento/projetoNorma';
import { ComandoEmendaComponent } from './comandoEmenda/comandoEmenda.component';
import { ComandoEmendaModalComponent } from './comandoEmenda/comandoEmenda.modal.component';
import { LexmlEtaComponent } from './lexml-eta.component';
import { limparAlertas } from '../model/alerta/acao/limparAlertas';
import { LexmlEmendaConfig } from '../model/lexmlEmendaConfig';
import { atualizarUsuarioAction } from '../model/lexml/acao/atualizarUsuarioAction';
import { getQuantidadeRevisoesAll, isRevisaoElemento, mostrarDialogDisclaimerRevisao, ordernarRevisoes, removeAtributosDoElemento } from '../redux/elemento/util/revisaoUtil';
import { Revisao, RevisaoElemento } from '../model/revisao/revisao';
import { ativarDesativarRevisaoAction } from '../model/lexml/acao/ativarDesativarRevisaoAction';
import { StateEvent, StateType } from '../redux/state';
import { limparRevisaoAction } from '../model/lexml/acao/limparRevisoes';
import { aplicarAlteracoesEmendaAction } from '../model/lexml/acao/aplicarAlteracoesEmenda';
import { buildContent, getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { generoFromLetra } from '../model/dispositivo/genero';
import { Comissao } from './destino/comissao';
import { SubstituicaoTermoComponent } from './substituicao-termo/substituicao-termo.component';
import { NOTA_RODAPE_CHANGE_EVENT, NOTA_RODAPE_REMOVE_EVENT, NotaRodape } from './editor-texto-rico/notaRodape';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DestinoComponent } from './destino/destino.component';
import { errorInicializarEdicaoAction } from '../model/lexml/acao/errorInicializarEdicaoAction';
import { isHtmlSemTexto } from '../util/string-util';
import { ConfiguracaoPaginacao } from '../model/paginacao/paginacao';
import { TipoMensagem } from '../model/lexml/util/mensagem';

export interface DispositivoBloqueado {
  lexmlId: string;
  bloquearFilhos: boolean;
  motivoBloqueio?: string;
}

type TipoCasaLegislativa = 'SF' | 'CD' | 'CN';

/**
 * Parâmetros de inicialização de edição de documento
 */
export class LexmlEmendaParametrosEdicao {
  modo = 'emenda';

  // Identificação da proposição (texto) emendado.
  // Opcional se for informada a emenda ou o projetoNorma
  proposicao?: {
    sigla: string;
    numero: string;
    ano: string;
    ementa: string;
  };

  // Preenchido automaticamente se for informada a emenda ou o projetoNorma
  ementa = '';

  // Indicação de matéria orçamentária. Utilizado inicalmente para definir destino de emenda a MP
  isMateriaOrcamentaria = false;

  // Texto json da proposição para emenda ou edição estruturada (modo 'emenda' ou 'edicao')
  // Obrigatório para modo 'emenda'
  // Opcional para modo 'edicao'
  projetoNorma?: ProjetoNorma;

  // Lista de lexml id's de artigos bloqueados para edição.
  // Não é salvo junto com a emenda, portanto deve ser informado também ao abrir uma emenda existente.
  dispositivosBloqueados?: (string | DispositivoBloqueado)[];

  // Emenda a ser aberta para edição
  emenda?: Emenda;

  // Motivo de uma nova emenda de texto livre
  // Preenchido automaticamente se for informada a emenda
  motivo = '';

  // Identificação do usuário para registro de marcas de revisão
  usuario?: Usuario;

  // Preferências de usuário ----

  // Autoria padrão
  autoriaPadrao?: { identificacao: string; siglaCasaLegislativa: 'SF' | 'CD' };

  // Opções de impressão padrão
  opcoesImpressaoPadrao?: { imprimirBrasao: boolean; textoCabecalho: string; tamanhoFonte: number };

  // Configuração de paginação de dispositivos durante a edição da emenda
  configuracaoPaginacao?: ConfiguracaoPaginacao;
  // Casa legislativa resposavel pela apreciaçao da emenda
  casaLegislativa?: TipoCasaLegislativa;

  // Indica se o texto a ser emendado é substitutivo
  emendarTextoSubstitutivo = false;
}

@customElement('lexml-emenda')
export class LexmlEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: Boolean }) existeObserverEmenda = false;
  @property({ type: Number }) totalAlertas = 0;
  @property({ type: Boolean }) exibirAjuda = true;
  @property({ type: Array }) parlamentares: Parlamentar[] = [];
  @property({ type: Array }) comissoes: Comissao[] = [];
  @property({ type: Object }) lexmlEmendaConfig: LexmlEmendaConfig = new LexmlEmendaConfig();

  private modo: any = ClassificacaoDocumento.EMENDA;

  private urn = '';

  private ementa = '';

  private isMateriaOrcamentaria = false;

  private projetoNorma: any;

  private motivo = '';

  private params?: LexmlEmendaParametrosEdicao;
  private casaLegislativa: TipoCasaLegislativa = 'CN';

  private parlamentaresCarregados = false;
  private comissoesCarregadas = false;

  private emendarTextoSubstitutivo = false;

  // Para forçar atualização da interface
  @state()
  private updateState: any;

  @state()
  private notasRodape: NotaRodape[] = [];

  @state()
  autoria = new Autoria();

  @query('lexml-substituicao-termo')
  _substituicaoTermo?: SubstituicaoTermoComponent;

  @query('lexml-eta-emenda')
  _lexmlEta?: LexmlEtaComponent;
  @query('#editor-texto-rico-emenda')
  _lexmlEmendaTextoRico;
  @query('#editor-texto-rico-justificativa')
  _lexmlJustificativa;
  @query('lexml-destino')
  _lexmlDestino?: DestinoComponent;
  @query('lexml-autoria')
  _lexmlAutoria;
  @query('lexml-data')
  _lexmlData;
  @query('lexml-opcoes-impressao')
  _lexmlOpcoesImpressao;
  @query('#tabs-esquerda')
  _tabsEsquerda;
  @query('#tabs-direita')
  _tabsDireita;
  @query('lexml-emenda-comando')
  _lexmlEmendaComando!: ComandoEmendaComponent;

  @query('lexml-emenda-comando-modal')
  _lexmlEmendaComandoModal!: ComandoEmendaModalComponent;

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

  private montarEmendaBasica(): Emenda {
    const emenda = new Emenda();
    emenda.modoEdicao = this.modo;
    emenda.componentes[0].urn = this.urn;
    emenda.proposicao = this.montarProposicaoPorUrn(this.urn, this.ementa);
    return emenda;
  }

  private montarProposicaoPorUrn(urn: string, ementa: string): RefProposicaoEmendada {
    if (urn) {
      return {
        urn: urn,
        sigla: getSigla(urn),
        numero: getNumero(urn),
        ano: getAno(urn),
        ementa: ementa,
        identificacaoTexto: this.emendarTextoSubstitutivo ? 'Substitutivo' : 'Texto inicial',
        emendarTextoSubstitutivo: this.emendarTextoSubstitutivo,
      };
    }
    return new RefProposicaoEmendada();
  }

  getEmenda(): Emenda {
    // Para evitar erros de referência nula quando chamado antes da inicialização do componente
    if (!this.urn) {
      return new Emenda();
    }

    const emenda = this.montarEmendaBasica();
    const numeroProposicao = emenda.proposicao.numero.replace(/^0+/, '');
    if (this.isEmendaSubstituicaoTermo()) {
      emenda.substituicaoTermo = this._substituicaoTermo!.getSubstituicaoTermo();
      emenda.comandoEmenda = this._substituicaoTermo!.getComandoEmenda(this.urn);
      emenda.comandoEmendaTextoLivre.texto = '';
    } else if (this.isEmendaTextoLivre()) {
      emenda.comandoEmendaTextoLivre.motivo = this.motivo;
      emenda.comandoEmendaTextoLivre.texto = this._lexmlEmendaTextoRico.texto;
      emenda.anexos = this._lexmlEmendaTextoRico.anexos;
      emenda.comandoEmendaTextoLivre.textoAntesRevisao = this._lexmlEmendaTextoRico.textoAntesRevisao;
    } else {
      emenda.comandoEmendaTextoLivre.texto = '';
      emenda.componentes[0].dispositivos = this._lexmlEta!.getDispositivosEmenda()!;
      emenda.comandoEmenda = this._lexmlEta!.getComandoEmenda();
      emenda.anexos = this._lexmlEta!.getAnexos();
    }
    emenda.justificativa = this._lexmlJustificativa.texto;
    emenda.notasRodape = this._lexmlJustificativa.notasRodape;
    emenda.autoria = this._lexmlAutoria.getAutoriaAtualizada();
    emenda.data = this._lexmlData.data || undefined;
    emenda.opcoesImpressao = this._lexmlOpcoesImpressao.opcoesImpressao;
    emenda.colegiadoApreciador = this._lexmlDestino!.colegiadoApreciador;
    emenda.epigrafe = new Epigrafe();
    emenda.epigrafe.texto = 'EMENDA Nº         ';
    if (emenda.colegiadoApreciador && emenda.colegiadoApreciador.tipoColegiado !== 'Plenário' && emenda.colegiadoApreciador.siglaComissao) {
      emenda.epigrafe.texto += `- ${emenda.colegiadoApreciador.siglaComissao}`;
    }

    const generoProposicao = generoFromLetra(getTipo(emenda.proposicao.urn).genero);
    const inicioEpigrafe = this.emendarTextoSubstitutivo ? '(ao substitutivo ' : '(';
    emenda.epigrafe.complemento = `${inicioEpigrafe}${generoProposicao.artigoDefinidoPrecedidoPreposicaoASingular.trim()} ${emenda.proposicao.sigla} ${numeroProposicao}/${
      emenda.proposicao.ano
    })`;
    if (emenda.colegiadoApreciador) emenda.local = this.montarLocalFromColegiadoApreciador(emenda.colegiadoApreciador);
    emenda.revisoes = this.getRevisoes();
    emenda.justificativaAntesRevisao = this._lexmlJustificativa.textoAntesRevisao;
    emenda.pendenciasPreenchimento = this.getPendenciasPreenchimentoEmenda(emenda);

    return emenda;
  }

  private getPendenciasPreenchimentoEmenda(emenda: Emenda): string[] {
    const pendenciasPreenchimento: Array<string> = [];

    if (this.isEmendaPadrao()) {
      if (emenda.comandoEmenda.comandos.length === 0) {
        pendenciasPreenchimento.push('Deve ser feita pelo menos uma modificação no texto da proposição para a geração do comando de emenda.');
      }
    } else if (this.isEmendaSubstituicaoTermo()) {
      if (emenda.substituicaoTermo?.termo.replace('(termo a ser substituído)', '').trim() === '' || emenda.substituicaoTermo?.novoTermo.replace('(novo termo)', '').trim() === '') {
        pendenciasPreenchimento.push('Substituição de termo não preenchida.');
      }
    } else if (this.isEmendaTextoLivre()) {
      if (isHtmlSemTexto(emenda.comandoEmendaTextoLivre.texto)) {
        pendenciasPreenchimento.push('Emenda de texto livre não preenchida.');
      }
    }

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

  async inicializarEdicao(params: LexmlEmendaParametrosEdicao) {
    try {
      this._lexmlEmendaComando.emenda = [];
      this.modo = params.modo;
      this.projetoNorma = params.projetoNorma;
      this.isMateriaOrcamentaria = params.isMateriaOrcamentaria || (!!params.emenda && params.emenda.colegiadoApreciador.siglaComissao === 'CMO');
      this._lexmlDestino!.isMateriaOrcamentaria = this.isMateriaOrcamentaria;
      this.params = params;

      this.inicializaProposicao(params);

      this.motivo = params.motivo;
      if (this.isEmendaTextoLivre() && params.emenda) {
        this.motivo = params.emenda.comandoEmendaTextoLivre.motivo || 'Motivo não informado na emenda';
      }

      this.setUsuario(params.usuario ?? rootStore.getState().elementoReducer.usuario);

      if (!this.isEmendaTextoLivre() && !this.isEmendaSubstituicaoTermo()) {
        this._lexmlEta!.inicializarEdicao(this.urn, params.projetoNorma, !!params.emenda, params);
      }

      this.casaLegislativa = this.inicializaCasaLegislativa(getSigla(this.urn), params);

      // Deve ser chamado antes do reseta emenda para garantir a autoria padrão e depois da inicialização da casaLegislativa
      this.parlamentares = await this.getParlamentares();

      if (params.emenda) {
        this.setEmenda(params.emenda);
      } else {
        this.resetaEmenda(params);
      }

      this.atualizaListaComissoes();

      this.limparAlertas();

      if (this.isEmendaTextoLivre() && this._lexmlEmendaTextoRico.isEditorVazio()) {
        this.showAlertaEmendaTextoLivre();
      }
      setTimeout(this.handleResize, 0);

      if (!params.emenda?.revisoes?.length) {
        this.desativarMarcaRevisao();
      }

      this._tabsEsquerda.show('lexml-eta-emenda');

      if (this.modo.startsWith('emenda') && !this.isEmendaTextoLivre()) {
        setTimeout(() => {
          this._tabsDireita?.show('comando');
        });
      } else {
        setTimeout(() => {
          this._tabsDireita?.show('notas');
        });
      }

      this.updateView();
    } catch (err) {
      console.error(err);
      this.emitirEventoFatalError(err);
      setTimeout(() => {
        rootStore.dispatch(errorInicializarEdicaoAction.execute(err));
      }, 0);
    }
  }

  private inicializaCasaLegislativa(siglaProposicao: string, params: LexmlEmendaParametrosEdicao): TipoCasaLegislativa {
    if (['MPV', 'PDN', 'PRN'].indexOf(siglaProposicao) > -1) {
      return 'CN';
    }
    return (params.emenda ? params.emenda.colegiadoApreciador.siglaCasaLegislativa : params.casaLegislativa) || 'CN';
  }

  public trocarModoEdicao(modo: string, motivo = ''): void {
    if (this.modo === modo) {
      console.log('Ignorando tentativa de mudança para o mesmo modo de edição.');
      return;
    }

    if (!this.projetoNorma && modo === 'emenda') {
      throw 'Não é possível trocar para o modo "emenda" quando não há texto da proposição.';
    }

    this._lexmlEmendaComando.emenda = [];
    this.modo = modo;

    this.motivo = motivo;
    if (this.isEmendaTextoLivre() && !this.motivo) {
      throw 'Deve ser informado um motivo para a emenda de texto livre.';
    }

    if (!this.isEmendaTextoLivre() && !this.isEmendaSubstituicaoTermo()) {
      this._lexmlEta!.inicializarEdicao(this.urn, this.projetoNorma, false, this.params);
    }

    rootStore.dispatch(limparAlertas());

    if (this.isEmendaTextoLivre()) {
      this._lexmlEmendaTextoRico.reset();
      this._lexmlEmendaTextoRico.anexos = [];
    } else if (this.isEmendaSubstituicaoTermo()) {
      this._lexmlEmendaTextoRico.reset();
      this._substituicaoTermo!.setSubstituicaoTermo(new SubstituicaoTermo());
    }

    this.limparAlertas();

    if (this.isEmendaTextoLivre() && this._lexmlEmendaTextoRico.isEditorVazio()) {
      this.showAlertaEmendaTextoLivre();
    }
    setTimeout(this.handleResize, 0);

    this._tabsEsquerda.show('lexml-eta-emenda');

    if (this.modo.startsWith('emenda') && !this.isEmendaTextoLivre()) {
      setTimeout(() => {
        this._tabsDireita?.show('comando');
      });
    } else {
      setTimeout(() => {
        this._tabsDireita?.show('notas');
      });
    }

    this.updateView();
  }

  private inicializaProposicao(params: LexmlEmendaParametrosEdicao): void {
    this.urn = '';
    this.ementa = '';

    if (params.proposicao) {
      // Preferência para a proposição informada
      this.urn = buildFakeUrn(params.proposicao.sigla, params.proposicao.numero, params.proposicao.ano);
      this.ementa = params.proposicao.ementa; // Preferência para a ementa informada
    }
    this.emendarTextoSubstitutivo = params.emendarTextoSubstitutivo || false;

    // Se não forem informados, utilizar da Emenda
    if (params.emenda) {
      if (!this.urn) {
        this.urn = params.emenda.proposicao.urn;
      }
      if (!this.ementa) {
        this.ementa = params.emenda.proposicao.ementa;
      }
      this.emendarTextoSubstitutivo = params.emenda.proposicao.emendarTextoSubstitutivo || false;
    }

    // Por último do ProjetoNorma
    if (this.projetoNorma) {
      if (!this.urn) {
        this.urn = getUrn(this.projetoNorma);
      }
      if (!this.ementa) {
        this.ementa = this.getEmentaFromProjetoNorma(this.projetoNorma);
      }
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

  private setEmenda(emenda: Emenda): void {
    rootStore.dispatch(limparAlertas());

    if (!this.isEmendaTextoLivre() && !this.isEmendaSubstituicaoTermo()) {
      this._lexmlEta!.setDispositivosERevisoesEmenda(emenda.componentes[0].dispositivos, emenda.revisoes);
    }

    this._lexmlAutoria.autoria = emenda.autoria;
    this._lexmlAutoria.casaLegislativa = this.casaLegislativa;
    this._lexmlOpcoesImpressao.opcoesImpressao = emenda.opcoesImpressao;
    this._lexmlJustificativa.setTextoAntesRevisao(emenda.justificativaAntesRevisao);
    this._lexmlDestino!.colegiadoApreciador = emenda.colegiadoApreciador;
    this._lexmlDestino!.proposicao = emenda.proposicao;
    this.notasRodape = emenda.notasRodape || [];
    this._lexmlJustificativa.setContent(emenda.justificativa, emenda.notasRodape);

    if (this.isEmendaTextoLivre()) {
      this._lexmlEmendaTextoRico.setContent(emenda?.comandoEmendaTextoLivre.texto || '');
      this._lexmlEmendaTextoRico.anexos = emenda.anexos || [];
      this._lexmlEmendaTextoRico.setTextoAntesRevisao(emenda.comandoEmendaTextoLivre.textoAntesRevisao);
      rootStore.dispatch(aplicarAlteracoesEmendaAction.execute(emenda.componentes[0].dispositivos, emenda.revisoes));
    } else if (this.isEmendaSubstituicaoTermo()) {
      this._substituicaoTermo!.setSubstituicaoTermo(emenda.substituicaoTermo || new SubstituicaoTermo());
    } else if (this.isEmendaPadrao() || this.isEmendaDispositivoOndeCouber()) {
      this._lexmlEta!.atualizaAnexos(emenda.anexos || []);
    }
    this._lexmlData.data = emenda.data;
  }

  private resetaEmenda(params: LexmlEmendaParametrosEdicao): void {
    const emenda = new Emenda();
    emenda.modoEdicao = params.modo as ModoEdicaoEmenda;
    emenda.proposicao = this.montarProposicaoPorUrn(this.urn, params.ementa);
    emenda.autoria = this.montarAutoriaPadrao(params);
    emenda.opcoesImpressao = this.montarOpcoesImpressaoPadrao(params);
    emenda.colegiadoApreciador.siglaCasaLegislativa = this.casaLegislativa;
    this._lexmlEmendaComando.emenda = {};
    this.setEmenda(emenda);
    rootStore.dispatch(limparRevisaoAction.execute());
  }

  private montarAutoriaPadrao(params: LexmlEmendaParametrosEdicao): Autoria {
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

  private montarOpcoesImpressaoPadrao(params: LexmlEmendaParametrosEdicao): OpcoesImpressao {
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

  updated(): void {
    // if (this.modo.startsWith('emenda') && !this.isEmendaTextoLivre()) {
    //   this.slSplitPanel.removeAttribute('disabled');
    //   this.slSplitPanel.position = this.splitPanelPosition;
    // } else {
    //   this.slSplitPanel.setAttribute('disabled', 'true');
    //   this.slSplitPanel.position = 100;
    // }
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
    const emendaTabPanel = getElement('sl-tab-panel[name="lexml-eta-emenda"]');
    const qlToolbarJustificativa = getElement('#editor-texto-rico-justificativa .ql-toolbar');
    const qlToolbarEmenda = getElement('#lx-eta-barra-ferramenta');

    const estilosOriginais = {
      justificativa: {
        display: justificativaTabPanel.style.display,
        opacity: justificativaTabPanel.style.opacity,
        pointerEvents: justificativaTabPanel.style.pointerEvents,
      },
      emenda: {
        display: emendaTabPanel.style.display,
        opacity: emendaTabPanel.style.opacity,
        pointerEvents: emendaTabPanel.style.pointerEvents,
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
    if (estilosOriginais.emenda.display === 'none') {
      setTabPanelStyles(emendaTabPanel, estilosOriginais.emenda, true);
    }

    const alturaToolBarJustificativa = qlToolbarJustificativa?.clientHeight + 10;
    const alturaToolBarEmenda = qlToolbarEmenda?.clientHeight + 10;

    setTabPanelStyles(justificativaTabPanel, estilosOriginais.justificativa);
    setTabPanelStyles(emendaTabPanel, estilosOriginais.emenda);

    this.style.setProperty('--heightJustificativa', `${alturaElemento - alturaToolBarJustificativa}px`);
    this.style.setProperty('--heightEmenda', `${alturaElemento - alturaToolBarEmenda}px`);
    this.style.setProperty('--height', `${alturaElemento}px`);
    this.style.setProperty('--overflow', 'hidden');

    return true;
  }

  private onChange(): void {
    let comandoEmenda = null as any;
    if (this.isEmendaSubstituicaoTermo()) {
      comandoEmenda = this._substituicaoTermo!.getComandoEmenda(this.urn);
      this._lexmlEmendaComando.emenda = comandoEmenda;
      this._lexmlEmendaComandoModal.atualizarComandoEmenda(comandoEmenda);
    } else if (this.isEmendaTextoLivre()) {
      if (!this._lexmlEmendaTextoRico.isEditorVazio() && this._lexmlJustificativa.isEditorVazio()) {
        this.disparaAlerta();
      } else {
        rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
      }
      if (this._lexmlEmendaTextoRico.isEditorVazio()) {
        this.showAlertaEmendaTextoLivre();
      } else {
        rootStore.dispatch(removerAlerta('alerta-global-emenda-texto-livre'));
      }
    }

    if (!this.isEmendaTextoLivre()) {
      this.buildAlertaJustificativa(comandoEmenda);
    }
  }

  buildAlertaJustificativa(comandoEmenda: any): void {
    if (comandoEmenda === null) {
      // comandoEmenda = this._lexmlEta!.getComandoEmenda();
      this._lexmlEmendaComando.emenda = comandoEmenda;
      this._lexmlEmendaComandoModal.atualizarComandoEmenda(comandoEmenda);
    }

    if (comandoEmenda !== null && comandoEmenda.comandos?.length > 0 && this._lexmlJustificativa.isEditorVazio()) {
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

  private isEmendaPadrao(): boolean {
    return this.modo === ClassificacaoDocumento.EMENDA;
  }

  private isEmendaDispositivoOndeCouber(): boolean {
    return this.modo === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
  }

  private isEmendaTextoLivre(): boolean {
    return this.modo === ClassificacaoDocumento.EMENDA_TEXTO_LIVRE;
  }

  private isEmendaSubstituicaoTermo(): boolean {
    return this.modo === ClassificacaoDocumento.EMENDA_SUBSTITUICAO_TERMO;
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
        lexml-emenda-comando {
          font-family: var(--eta-font-serif);
          display: ${this.modo.startsWith('emenda') && !this.isEmendaTextoLivre() ? 'block' : 'none'};
          height: 100%;
        }
        lexml-eta-emenda {
          font-family: var(--eta-font-serif);
          text-align: left;
        }
        /* #editor-texto-rico-justificativa #editor-texto-rico {
          height: calc(var(--height) - 44px);
          overflow: var(--overflow);
        } */

        #editor-texto-rico-emenda-inner {
          height: calc(var(--heightJustificativa));
          overflow: var(--overflow);
        }
        #editor-texto-rico-justificativa-inner {
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
            <sl-tab slot="nav" panel="lexml-eta-emenda">Texto</sl-tab>
            <sl-tab slot="nav" panel="justificativa">Justificação</sl-tab>
            <sl-tab slot="nav" panel="autoria">Destino, Data, Autoria e Impressão</sl-tab>
            <sl-tab slot="nav" panel="avisos">
              Avisos
              <div class="badge-pulse" id="contadorAvisos">${this.totalAlertas > 0 ? html` <sl-badge variant="danger" pill pulse>${this.totalAlertas}</sl-badge> ` : ''}</div>
            </sl-tab>
            <sl-tab-panel name="lexml-eta-emenda" class="overflow-hidden">
              <lexml-eta-emenda
                style="display: ${!this.isEmendaTextoLivre() && !this.isEmendaSubstituicaoTermo() ? 'block' : 'none'}"
                id="lexmlEta"
                .lexmlEtaConfig=${this.lexmlEmendaConfig}
                @onchange=${this.onChange}
              ></lexml-eta-emenda>
              <editor-texto-rico
                style="display: ${this.isEmendaTextoLivre() ? 'block' : 'none'}"
                modo="textoLivre"
                id="editor-texto-rico-emenda"
                registroEvento="justificativa"
                @onchange=${this.onChange}
              ></editor-texto-rico>
              <lexml-substituicao-termo style="display: ${this.isEmendaSubstituicaoTermo() ? 'block' : 'none'}" @onchange=${this.onChange}></lexml-substituicao-termo>
            </sl-tab-panel>
            <sl-tab-panel name="justificativa" class="overflow-hidden">
              <editor-texto-rico
                .lexmlEtaConfig=${this.lexmlEmendaConfig}
                modo="justificativa"
                id="editor-texto-rico-justificativa"
                registroEvento="justificativa"
                @onchange=${this.onChange}
              ></editor-texto-rico>
            </sl-tab-panel>
            <sl-tab-panel name="autoria" class="overflow-hidden">
              <div class="tab-autoria__container">
                <lexml-destino .comissoes=${this.comissoes}></lexml-destino>
                <br />
                <lexml-data></lexml-data>
                <br />
                <lexml-autoria .parlamentares=${this.parlamentares}></lexml-autoria>
                <lexml-opcoes-impressao></lexml-opcoes-impressao>
              </div>
            </sl-tab-panel>
            <sl-tab-panel name="avisos" class="overflow-hidden">
              <lexml-eta-emenda-alertas></lexml-eta-emenda-alertas>
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
            <sl-tab-panel name="comando" class="overflow-hidden">
              <lexml-emenda-comando></lexml-emenda-comando>
            </sl-tab-panel>
            <sl-tab-panel name="notas" class="overflow-hidden">
              <div class="notas-rodape">
                <h4>Notas de rodapé</h4>
                ${this.renderNotasRodape()}
              </div>
            </sl-tab-panel>
            <sl-tab-panel name="dicas" class="overflow-hidden">
              <lexml-ajuda></lexml-ajuda>
            </sl-tab-panel>
            <sl-tab-panel name="atalhos" class="overflow-hidden">
              <lexml-eta-emenda-atalhos></lexml-eta-emenda-atalhos>
            </sl-tab-panel>
          </sl-tab-group>
        </div>
      </sl-split-panel>
    `;
  }

  tabIsVisible(tab: string): boolean {
    if ((tab === 'atalhos' || tab === 'dicas') && this.modo === 'emendaSubstituicaoTermo') {
      return false;
    } else if (tab === 'notas' && (this.isEmendaTextoLivre() || this.modo === 'edicao')) {
      return true;
    }
    return this.modo.startsWith('emenda') && !this.isEmendaTextoLivre();
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
                    <input type="checkbox" idNotaRodape="${nr.id}" class="notas-checkbox" id="checkbox-${nr.id}" @change=${() => this.selecionarNotaRodape(nr.id)} />
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
    const notaRodapeElement = this.querySelector(`.ql-editor nota-rodape[id-nota-rodape="${idNotaRodape}"]`);
    const tab = this.getTabFromElement(notaRodapeElement);
    this.focusOnTab(tab.getAttribute('name'));
    notaRodapeElement && setTimeout(() => notaRodapeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    const notasRodape = this.querySelectorAll('.ql-editor nota-rodape');
    notasRodape.forEach(nr => {
      if (nr.attributes['id-nota-rodape'].value === idNotaRodape) {
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
    const notaRodapeElement = this.querySelector(`.ql-editor nota-rodape[id-nota-rodape="${idNotaRodape}"]`);
    notaRodapeElement?.classList.remove('pulse');
  }

  editarNotaRodape(event: any): void {
    const idNotaRodape = event.target.getAttribute('idNotaRodape');
    const notaRodapeElement = this.querySelector(`.ql-editor nota-rodape[id-nota-rodape="${idNotaRodape}"]`);
    const editorTextoRico = this.getEditorTextoRicoFromElement(notaRodapeElement);
    editorTextoRico?.focus();
    editorTextoRico.editarNotaRodape(idNotaRodape);
  }

  removerNotaRodape(event: any): void {
    const idNotaRodape = event.target.getAttribute('idNotaRodape');
    const notaRodapeElement = this.querySelector(`.ql-editor nota-rodape[id-nota-rodape="${idNotaRodape}"]`);
    const editorTextoRico = this.getEditorTextoRicoFromElement(notaRodapeElement);
    editorTextoRico?.focus();
    editorTextoRico.removerNotaRodape(idNotaRodape);
  }

  getEditorTextoRicoFromElement(element: any): any {
    return element.closest('editor-texto-rico');
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
