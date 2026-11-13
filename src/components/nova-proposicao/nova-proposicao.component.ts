import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/radio/radio';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group';
import { html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import '../autocomplete/autocomplete-lista';
import { getCasaLegislativaResponsavel } from '../../model/lexml/documento/urnUtil';
import { ColegiadoApreciador } from '../../model/proposicao/proposicao';
import { inicializarVocabulario } from '../../model/lexml/documento/vocabulario';
import { CasaLegislativaEditor, TipoDocumento } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { montaEpigrafeNovaProposicao } from './epigrafeNovaProposicao';
import { getIdentificacaoDocumento, getNovoOuNova } from './identificacaoDocumento';
import { lerDadosIdentificacao } from './lerDadosIdentificacao';
import { isPlv, montaUrnNovaProposicao, numeroOriginalVale } from './montaUrnNovaProposicao';
import { getPreambuloNovaProposicao } from './preambuloNovaProposicao';
import {
  chaveTipo,
  ehComplementar,
  getSiglasNovaProposicao,
  getSiglasOutraProposicao,
  getSiglasProposicaoReferenciada,
  getTipoMpv,
  getTipoSubstitutivoCd,
  resolverTipoComplementar,
} from './siglasNovaProposicao';
import {
  ColegiadoDestino,
  DadosIdentificacao,
  EspecieDocumento,
  LIMITE_ARQUIVO_BYTES,
  NumeroOriginal,
  ResultadoAlteracaoDadosBasicos,
  ResultadoNovaProposicao,
  TipoColegiadoDestino,
} from './tiposNovaProposicao';
import {
  ConfigNovaProposicao,
  CONTENT_TYPE_IMPORTACAO,
  montaUrlComissoes,
  montaUrlProposicao,
  normalizaConsultaProposicao,
  ResultadoVerificacaoProposicao,
  validarConfigNovaProposicao,
} from './urlsNovaProposicao';

export const EVENTO_CONCLUIDA = 'nova-proposicao-concluida';
export const EVENTO_CANCELADA = 'nova-proposicao-cancelada';
export const EVENTO_DADOS_BASICOS_ALTERADOS = 'dados-basicos-alterados';

export const MENSAGEM_PERDA_AUTORIA = 'Ao alterar para um tipo de outra casa legislativa a autoria informada será perdida. Deseja continuar?';
export const MENSAGEM_PERDA_JUSTIFICACAO = 'Ao apresentar o documento em parecer, a justificação informada será perdida. Deseja continuar?';

export type ModoNovaProposicao = 'criacao' | 'edicao';

/** Dados atuais do documento, usados como ponto de partida no modo de edição (em geral, o `detail` de `alteracao-dados-basicos-solicitada`). */
export interface DadosIniciaisEdicao {
  urn: string;
  urnDocumentoReferenciado?: string;
  colegiadoApreciador?: Pick<ColegiadoApreciador, 'tipoColegiado' | 'siglaComissao'>;
  anexoParecer?: boolean;
}

// Altura máxima das listas flutuantes (px): siglas = 126 (7 itens) + 50%.
const ALTURA_LISTA_SIGLA = 189;
const ALTURA_LISTA_COMISSAO = 192;

const EXTENSOES_ARQUIVO = ['pdf', 'docx', 'txt', 'xml', 'json'];
const ERRO_CONVERSOR_SEM_TEXTO = 'O conversor não devolveu o texto do documento.';
const TITULO_ARQUIVO_RECUSADO = 'O arquivo não pôde ser importado';
const MENSAGEM_RECUSA_SEM_CORPO = 'O serviço de conversão recusou o arquivo.';
const ORIENTACAO_ARQUIVO_RECUSADO = 'Selecione outro arquivo ou escolha outra forma de iniciar o texto.';
const MENSAGEM_JSON_INVALIDO = 'O arquivo JSON não pôde ser lido: o conteúdo não é um JSON válido.';

const mensagemFalhaImportacao = (nome: string): string =>
  `Não foi possível converter o arquivo "${nome}": o serviço de conversão apresentou uma falha. Tente novamente em alguns instantes.`;

const extensaoDe = (nome: string): string => nome.split('.').pop()?.toLowerCase() ?? '';

interface AvisoImportacao {
  titulo?: string;
  linhas: string[];
}

type ConteudoInicial = Pick<ResultadoNovaProposicao, 'texto' | 'documentoImportado'>;

type DesfechoImportacao = { documento: unknown } | { erros: string[] } | { aviso: AvisoImportacao } | 'falha';

type EstadoVerificacao = 'nenhuma' | 'verificando' | 'ok' | 'inexistente' | 'erro';

interface Verificacao {
  estado: EstadoVerificacao;
  ementa: string;
  textoEstruturadoDisponivel: boolean;
  // Só PLS/PLC: lei complementar (padrão false quando a resposta não traz o atributo).
  complementar: boolean;
}

interface Comissao {
  siglaCasaLegislativa: string;
  sigla: string;
  nome: string;
}

type OpcaoTexto = 'vazio' | 'importar' | 'referenciado' | 'outra';

const verificacaoVazia = (): Verificacao => ({ estado: 'nenhuma', ementa: '', textoEstruturadoDisponivel: true, complementar: false });

@customElement('lexml-nova-proposicao')
export class NovaProposicaoComponent extends LitElement {
  private _config?: ConfigNovaProposicao;
  private casa: CasaLegislativaEditor = 'SF';
  private readonly anoCorrente = String(new Date().getFullYear());
  private comissoesPorCasa = new Map<string, Comissao[] | 'indisponivel'>();

  @state() private erroConfiguracao = '';
  @state() private tela: 1 | 2 | 3 = 1;
  @state() private especie: EspecieDocumento = 'proposicao';
  @state() private chaveProposicao = '';
  @state() private numeroProposicao = '';
  @state() private anoProposicao = this.anoCorrente;
  // Sem campo na tela: ano corrente na criação e o da URN inicial na edição.
  @state() private anoSubstitutivo = this.anoCorrente;
  @state() private numeroMpv = '';
  @state() private anoMpv = this.anoCorrente;
  @state() private verificacaoProposicao = verificacaoVazia();
  @state() private verificacaoMpv = verificacaoVazia();
  @state() private tipoColegiado: TipoColegiadoDestino = 'Plenário';
  @state() private siglaComissao = '';
  @state() private anexoParecer = false;
  @state() private comissoesVersao = 0;
  @state() private confirmando = false;
  @state() private erroDadosIniciais = '';

  @state() private opcaoTexto: OpcaoTexto = 'vazio';
  @state() private arquivo?: File;
  @state() private erroArquivo = '';
  @state() private chaveOutra = '';
  @state() private numeroOutra = '';
  @state() private anoOutra = this.anoCorrente;
  @state() private verificacaoOutra = verificacaoVazia();
  @state() private textoIndisponivel = false;
  @state() private erroComunicacao = '';
  @state() private avisoImportacao?: AvisoImportacao;
  @state() private processando = false;
  @state() private errosConversao: string[] = [];

  // Definidos só por iniciar/iniciarModoEdicao/reiniciar.
  @state() modo: ModoNovaProposicao = 'criacao';
  @state() dadosIniciais?: DadosIniciaisEdicao;

  private numeroOriginal?: NumeroOriginal;

  constructor() {
    super();
    inicializarVocabulario('SF');
  }

  protected willUpdate(alteradas: Map<string, unknown>): void {
    if ((alteradas.has('modo') || alteradas.has('dadosIniciais')) && this.modo === 'edicao' && this.dadosIniciais && this._config && !this.erroConfiguracao) {
      void this.aplicarDadosIniciais();
    }
  }

  createRenderRoot(): LitElement {
    return this;
  }

  /** Falha, nomeando a URL ausente; nenhuma tela é exibida enquanto a configuração for inválida. */
  @property({ type: Object })
  get config(): ConfigNovaProposicao | undefined {
    return this._config;
  }

  set config(valor: ConfigNovaProposicao | undefined) {
    this._config = valor;
    try {
      validarConfigNovaProposicao(valor);
    } catch (erro) {
      this.erroConfiguracao = (erro as Error).message;
      throw erro;
    }
    this.erroConfiguracao = '';
    this.casa = valor?.casaLegislativaEditor === 'CD' ? 'CD' : 'SF';
    inicializarVocabulario(this.casa);
    this.comissoesPorCasa.clear();
    this.reiniciar();
  }

  /** Reinicia em modo de criação. Chame depois de `config`. */
  iniciar(): void {
    this.reiniciar();
  }

  /** Reinicia em modo de edição de dados básicos, preenchendo a Tela 1 com os dados iniciais. Chame depois de `config`. */
  iniciarModoEdicao(dadosIniciais: DadosIniciaisEdicao): void {
    this.reiniciar();
    this.modo = 'edicao';
    this.dadosIniciais = dadosIniciais;
  }

  /** Volta ao estado original: modo de criação, sem dados iniciais, Tela 1 com os padrões. A configuração é mantida. */
  reiniciar(): void {
    this.modo = 'criacao';
    this.dadosIniciais = undefined;
    this.numeroOriginal = undefined;
    this.confirmando = false;
    this.erroDadosIniciais = '';
    this.tela = 1;
    this.especie = 'proposicao';
    this.chaveProposicao = '';
    this.numeroProposicao = '';
    this.anoProposicao = this.anoCorrente;
    this.anoSubstitutivo = this.anoCorrente;
    this.numeroMpv = '';
    this.anoMpv = this.anoCorrente;
    this.verificacaoProposicao = verificacaoVazia();
    this.verificacaoMpv = verificacaoVazia();
    this.aplicarPadroesDaEspecie();
    this.opcaoTexto = 'vazio';
    this.arquivo = undefined;
    this.erroArquivo = '';
    this.chaveOutra = '';
    this.numeroOutra = '';
    this.anoOutra = this.anoCorrente;
    this.verificacaoOutra = verificacaoVazia();
    this.textoIndisponivel = false;
    this.erroComunicacao = '';
    this.avisoImportacao = undefined;
    this.processando = false;
    this.errosConversao = [];
  }

  // ---------------------------------------------------------------- modo de edição

  private async aplicarDadosIniciais(): Promise<void> {
    const iniciais = this.dadosIniciais!;
    let lidos;
    try {
      lidos = lerDadosIdentificacao(iniciais.urn, iniciais.urnDocumentoReferenciado, this.casa);
    } catch (erro) {
      this.erroDadosIniciais = (erro as Error).message;
      return;
    }
    this.erroDadosIniciais = '';
    const { dados, numeroOriginal } = lidos;
    this.numeroOriginal = numeroOriginal;
    this.tela = 1;
    this.especie = dados.especie;
    // Na proposição referenciada a lista tem uma entrada por sigla: a verificação diz se é lei complementar.
    const complementar = !!dados.tipoProposicao && ehComplementar(dados.tipoProposicao);
    const tipoNaLista = (dados.especie === 'proposicao' ? getSiglasNovaProposicao(this.casa) : getSiglasProposicaoReferenciada()).find(
      t => t.sigla === dados.tipoProposicao?.sigla && t.urnAutoridade === dados.tipoProposicao?.urnAutoridade
    );
    this.chaveProposicao = tipoNaLista ? chaveTipo(tipoNaLista) : '';
    this.numeroProposicao = dados.especie === 'proposicao' ? '' : dados.numeroProposicao;
    this.anoProposicao = dados.anoProposicao;
    this.anoSubstitutivo = dados.tipoSubstitutivo ? dados.anoSubstitutivo : this.anoCorrente;
    this.numeroMpv = dados.numeroMpv;
    this.anoMpv = dados.anoMpv || this.anoCorrente;
    // O documento referenciado inicial vale como verificado até o usuário mudar sigla, número ou ano.
    const verificada: Verificacao = { estado: 'ok', ementa: '', textoEstruturadoDisponivel: true, complementar };
    this.verificacaoProposicao = dados.especie === 'proposicao' ? verificacaoVazia() : verificada;
    this.verificacaoMpv = this.plv ? verificada : verificacaoVazia();
    const colegiado = iniciais.colegiadoApreciador;
    this.tipoColegiado = colegiado?.tipoColegiado === 'Comissão' ? 'Comissão' : 'Plenário';
    this.siglaComissao = this.tipoColegiado === 'Comissão' ? colegiado?.siglaComissao ?? '' : '';
    this.anexoParecer = !!iniciais.anexoParecer;

    // Comissão fora da lista (ou lista indisponível): o destino fica inválido até o usuário escolher outro.
    await this.carregarComissoes(true);
  }

  private get emEdicao(): boolean {
    return this.modo === 'edicao';
  }

  private numeroFixoDe(tipo?: TipoDocumento): string {
    return numeroOriginalVale(this.especie, tipo, this.numeroOriginal) ? this.numeroOriginal.numero : 's/n';
  }

  private mensagensDePerda(urn: string): string[] {
    const iniciais = this.dadosIniciais!;
    const mensagens: string[] = [];
    if (getCasaLegislativaResponsavel(urn) !== getCasaLegislativaResponsavel(iniciais.urn)) mensagens.push(MENSAGEM_PERDA_AUTORIA);
    if (!iniciais.anexoParecer && this.anexoParecer) mensagens.push(MENSAGEM_PERDA_JUSTIFICACAO);
    return mensagens;
  }

  private continuarEdicao(): void {
    if (!this.tela1Valida) return;
    const { urn } = montaUrnNovaProposicao(this.dados, this.numeroOriginal);
    if (this.mensagensDePerda(urn).length) this.confirmando = true;
    else this.concluirEdicao();
  }

  private concluirEdicao(): void {
    this.confirmando = false;
    // Sem texto: montarResultado só o inclui quando informado.
    const detail: ResultadoAlteracaoDadosBasicos = this.montarResultado();
    this.dispatchEvent(new CustomEvent(EVENTO_DADOS_BASICOS_ALTERADOS, { detail, bubbles: true, composed: true }));
  }

  private renderConfirmacao(): TemplateResult {
    const urn = this.tela1Valida ? montaUrnNovaProposicao(this.dados, this.numeroOriginal).urn : '';
    const mensagens = this.confirmando && urn ? this.mensagensDePerda(urn) : [];
    return html`<sl-dialog id="np-confirmacao" label="Confirmação" ?open=${this.confirmando} @sl-request-close=${(e: Event): void => e.preventDefault()}>
      ${mensagens.map(m => html`<p class="np-mensagem-perda">${m}</p>`)}
      <sl-button slot="footer" id="np-confirmar-sim" variant="primary" @click=${(): void => this.concluirEdicao()}>Sim</sl-button>
      <sl-button
        slot="footer"
        id="np-confirmar-nao"
        @click=${(): void => {
          this.confirmando = false;
        }}
        >Não</sl-button
      >
    </sl-dialog>`;
  }

  // ---------------------------------------------------------------- derivados da Tela 1

  private get referenciaExigida(): boolean {
    return this.especie !== 'proposicao' || this.plv;
  }

  private get plv(): boolean {
    return isPlv({ especie: this.especie, tipoProposicao: this.tipoProposicao });
  }

  private get siglasProposicao(): TipoDocumento[] {
    return this.especie === 'proposicao' ? getSiglasNovaProposicao(this.casa) : getSiglasProposicaoReferenciada();
  }

  private get tipoProposicao(): TipoDocumento | undefined {
    return this.siglasProposicao.find(t => chaveTipo(t) === this.chaveProposicao);
  }

  // Sigla da "outra proposição" (Tela 2): qualquer sigla da casa do editor, ativa ou inativa, inclusive a MPV.
  private get tipoOutra(): TipoDocumento | undefined {
    return getSiglasOutraProposicao().find(t => chaveTipo(t) === this.chaveOutra);
  }

  private get siglaOutra(): string {
    return this.tipoOutra?.sigla ?? '';
  }

  // Na CD o tipo do substitutivo/subemenda não é escolhido: SBT ou SSP conforme a espécie.
  private get tipoSubstitutivo(): TipoDocumento | undefined {
    return this.documentoProprioCd && this.especie !== 'proposicao' ? getTipoSubstitutivoCd(this.especie) : undefined;
  }

  private get documentoProprioCd(): boolean {
    return this.casa === 'CD' && this.especie !== 'proposicao';
  }

  // Na referenciada, a sigla não distingue lei ordinária de complementar: quem decide é a verificação.
  private get tipoProposicaoResolvido(): TipoDocumento | undefined {
    const tipo = this.tipoProposicao;
    return tipo && this.especie !== 'proposicao' ? resolverTipoComplementar(tipo, this.verificacaoProposicao.complementar) : tipo;
  }

  private get dados(): DadosIdentificacao {
    return {
      casa: this.casa,
      especie: this.especie,
      tipoProposicao: this.tipoProposicaoResolvido,
      numeroProposicao: this.numeroProposicao,
      anoProposicao: this.anoProposicao,
      tipoSubstitutivo: this.tipoSubstitutivo,
      anoSubstitutivo: this.anoSubstitutivo,
      numeroMpv: this.numeroMpv,
      anoMpv: this.anoMpv,
    };
  }

  // Casa cujas comissões são oferecidas: a da autoridade da URN do novo documento.
  private get casaDasComissoes(): string | undefined {
    try {
      const urn = montaUrnNovaProposicao(this.dados).urn;
      return getCasaLegislativaResponsavel(urn);
    } catch {
      return undefined;
    }
  }

  private get comissoesDisponiveis(): Comissao[] {
    const casa = this.casaDasComissoes;
    const lista = casa ? this.comissoesPorCasa.get(casa) : undefined;
    return Array.isArray(lista) ? lista : [];
  }

  private get comissaoIndisponivel(): boolean {
    const casa = this.casaDasComissoes;
    return !!casa && this.comissoesPorCasa.get(casa) === 'indisponivel';
  }

  private get destinoValido(): boolean {
    return this.tipoColegiado === 'Plenário' || (!!this.siglaComissao && this.comissoesDisponiveis.some(c => c.sigla === this.siglaComissao));
  }

  private numeroPreenchido = (valor: string): boolean => /^\d+$/.test(valor.trim());
  private anoPreenchido = (valor: string): boolean => /^\d{4}$/.test(valor.trim());

  private podeVerificar(numero: string, ano: string): boolean {
    return this.numeroPreenchido(numero) && this.anoPreenchido(ano);
  }

  private get tela1Valida(): boolean {
    if (!this.tipoProposicao || !this.anoPreenchido(this.anoProposicao)) return false;
    if (!this.destinoValido) return false;
    if (this.especie !== 'proposicao' && this.verificacaoProposicao.estado !== 'ok') return false;
    if (this.plv && this.verificacaoMpv.estado !== 'ok') return false;
    return true;
  }

  // ---------------------------------------------------------------- padrões (RN-19, RN-20)

  private aplicarPadroesDaEspecie(): void {
    const substitutivo = this.especie !== 'proposicao';
    this.tipoColegiado = substitutivo && !this.comissaoIndisponivel ? 'Comissão' : 'Plenário';
    this.limparComissao();
    this.anexoParecer = substitutivo;
  }

  private onEspecie(especie: EspecieDocumento): void {
    if (especie === this.especie) return;
    this.especie = especie;
    this.chaveProposicao = '';
    this.numeroProposicao = '';
    this.verificacaoProposicao = verificacaoVazia();
    this.verificacaoMpv = verificacaoVazia();
    this.aplicarPadroesDaEspecie();
    this.carregarComissoes();
  }

  private onSiglaProposicao(chave: string): void {
    if (chave === this.chaveProposicao) return;
    this.chaveProposicao = chave;
    this.verificacaoProposicao = verificacaoVazia();
    this.verificacaoMpv = verificacaoVazia();
    this.carregarComissoes();
  }

  private onTipoColegiado(tipo: TipoColegiadoDestino): void {
    if (tipo === this.tipoColegiado) return;
    this.tipoColegiado = tipo;
    if (tipo === 'Plenário') this.limparComissao();
    else this.carregarComissoes();
  }

  // ---------------------------------------------------------------- comissões (g5, RN-19)

  private limparComissao(): void {
    this.siglaComissao = '';
  }

  private rotuloComissao(c: Comissao): string {
    return `${c.sigla} - ${c.nome}`;
  }

  private renderComissao(): TemplateResult {
    const itens = this.comissoesDisponiveis.map(c => ({ value: c.sigla, label: this.rotuloComissao(c) }));
    return html`<lexml-eta-autocomplete-lista
      id="np-comissao"
      label="Comissão"
      placeholder="Digite para buscar a comissão"
      .items=${itens}
      .value=${this.siglaComissao}
      .alturaMaxima=${ALTURA_LISTA_COMISSAO}
      @autocomplete-change=${(e: CustomEvent<{ value: string }>): void => {
        this.siglaComissao = e.detail.value;
      }}
    ></lexml-eta-autocomplete-lista>`;
  }

  // `manterDestino`: na abertura do modo de edição, lista indisponível não troca a Comissão inicial por Plenário.
  private async carregarComissoes(manterDestino = false): Promise<void> {
    const casa = this.casaDasComissoes;
    if (!casa) return;
    if (!this.comissoesPorCasa.has(casa)) await this.buscarComissoes(casa);
    // Sem lista de comissões, só o Plenário é oferecido (inclusive como padrão do substitutivo).
    if (this.comissaoIndisponivel) {
      if (!manterDestino) this.tipoColegiado = 'Plenário';
      this.limparComissao();
    } else if (this.siglaComissao && !this.comissoesDisponiveis.some(c => c.sigla === this.siglaComissao)) {
      // A casa do documento mudou: a comissão escolhida deixou de existir na lista.
      this.limparComissao();
    }
    this.comissoesVersao++;
  }

  private async buscarComissoes(casa: string): Promise<void> {
    try {
      const lista = await this.obterComissoes(casa);
      this.comissoesPorCasa.set(
        casa,
        (Array.isArray(lista) ? (lista as Comissao[]) : []).filter(c => c.siglaCasaLegislativa === casa)
      );
    } catch {
      this.comissoesPorCasa.set(casa, 'indisponivel');
    }
  }

  // Chamado pela configuração (e não solto) para preservar o `this` do host.
  private async obterComissoes(casa: string): Promise<unknown> {
    if (this._config!.onObterComissoes) return this._config!.onObterComissoes(casa);
    const resposta = await fetch(montaUrlComissoes(this._config!.urlComissoes!, casa));
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return resposta.json();
  }

  // ---------------------------------------------------------------- verificação (RN-04, RN-05)

  private verificacaoDe(corpo?: ResultadoVerificacaoProposicao): Verificacao {
    return {
      estado: 'ok',
      ementa: String(corpo?.ementa ?? ''),
      textoEstruturadoDisponivel: corpo?.textoEstruturadoDisponivel !== false,
      complementar: corpo?.complementar === true,
    };
  }

  private async consultar(sigla: string, numero: string, ano: string): Promise<Verificacao> {
    const inexistente: Verificacao = { estado: 'inexistente', ementa: '', textoEstruturadoDisponivel: false, complementar: false };
    try {
      if (this._config!.onVerificarProposicao) {
        const resultado = await this._config!.onVerificarProposicao(normalizaConsultaProposicao(sigla, numero, ano));
        return resultado ? this.verificacaoDe(resultado) : inexistente;
      }
      const resposta = await fetch(montaUrlProposicao(this._config!.urlVerificacaoProposicao!, sigla, numero, ano));
      if (resposta.status === 404) return inexistente;
      if (resposta.status !== 200) return { estado: 'erro', ementa: '', textoEstruturadoDisponivel: false, complementar: false };
      return this.verificacaoDe(await resposta.json());
    } catch {
      return { estado: 'erro', ementa: '', textoEstruturadoDisponivel: false, complementar: false };
    }
  }

  private async verificarProposicao(): Promise<void> {
    const sigla = this.tipoProposicao?.sigla ?? '';
    this.verificacaoProposicao = { ...verificacaoVazia(), estado: 'verificando' };
    this.verificacaoProposicao = await this.consultar(sigla, this.numeroProposicao, this.anoProposicao);
  }

  private async verificarMpv(): Promise<void> {
    this.verificacaoMpv = { ...verificacaoVazia(), estado: 'verificando' };
    this.verificacaoMpv = await this.consultar(getTipoMpv()?.sigla ?? 'MPV', this.numeroMpv, this.anoMpv);
  }

  private async verificarOutra(): Promise<void> {
    this.verificacaoOutra = { ...verificacaoVazia(), estado: 'verificando' };
    this.textoIndisponivel = false;
    this.verificacaoOutra = await this.consultar(this.siglaOutra, this.numeroOutra, this.anoOutra);
  }

  // ---------------------------------------------------------------- navegação e conclusão

  private cancelar(): void {
    this.reiniciar();
    this.dispatchEvent(new CustomEvent(EVENTO_CANCELADA, { bubbles: true, composed: true }));
  }

  private continuarTela1(): void {
    if (!this.tela1Valida) return;
    this.opcaoTexto = this.referenciaExigida ? 'referenciado' : 'vazio';
    this.textoIndisponivel = false;
    this.erroComunicacao = '';
    this.tela = 2;
  }

  private get verificacaoReferenciada(): Verificacao {
    return this.plv ? this.verificacaoMpv : this.verificacaoProposicao;
  }

  private get textoIndisponivelNaOpcao(): boolean {
    if (this.opcaoTexto === 'referenciado') return this.textoIndisponivel || !this.verificacaoReferenciada.textoEstruturadoDisponivel;
    if (this.opcaoTexto === 'outra') return this.textoIndisponivel || (this.verificacaoOutra.estado === 'ok' && !this.verificacaoOutra.textoEstruturadoDisponivel);
    return false;
  }

  private get tela2Valida(): boolean {
    if (this.processando) return false;
    if (this.opcaoTexto === 'importar') return !!this.arquivo && !this.erroArquivo;
    if (this.opcaoTexto === 'outra') return this.verificacaoOutra.estado === 'ok' && !this.textoIndisponivelNaOpcao;
    if (this.opcaoTexto === 'referenciado') return !this.textoIndisponivelNaOpcao;
    return true;
  }

  private onArquivo(evento: Event): void {
    const arquivo = (evento.target as HTMLInputElement).files?.[0];
    this.arquivo = arquivo;
    this.erroArquivo = '';
    this.erroComunicacao = '';
    this.avisoImportacao = undefined;
    if (!arquivo) return;
    if (!EXTENSOES_ARQUIVO.includes(extensaoDe(arquivo.name))) {
      this.erroArquivo = 'Formato não aceito. Selecione um arquivo PDF, DOCX, TXT ou LexML (XML ou JSON).';
    } else if (arquivo.size > LIMITE_ARQUIVO_BYTES) {
      this.erroArquivo = 'O arquivo excede o limite de 5 MB.';
    }
  }

  // O .json já é o documento articulado: não passa pela URL nem pelo callback.
  private async importarArquivo(arquivo: File): Promise<DesfechoImportacao> {
    const extensao = extensaoDe(arquivo.name);
    if (extensao === 'json') {
      try {
        return { documento: JSON.parse((await arquivo.text()).replace(/^\uFEFF/, '')) };
      } catch {
        return { aviso: { linhas: [MENSAGEM_JSON_INVALIDO] } };
      }
    }
    if (this._config!.onImportarArquivo) return this.importarPeloCallback(arquivo);
    return this.importarPelaUrl(arquivo, CONTENT_TYPE_IMPORTACAO[extensao]);
  }

  private async importarPeloCallback(arquivo: File): Promise<DesfechoImportacao> {
    let resultado;
    try {
      resultado = await this._config!.onImportarArquivo!(arquivo);
    } catch {
      return 'falha';
    }
    if (!resultado) return 'falha';
    const erros = Array.isArray(resultado.erros) ? [...resultado.erros] : [];
    if (!erros.length && (resultado.texto === undefined || resultado.texto === null)) erros.push(ERRO_CONVERSOR_SEM_TEXTO);
    return erros.length ? { erros } : { documento: resultado.texto };
  }

  // O corpo do 400 é mensagem para o usuário; o das demais falhas pode ser técnico e não é exibido.
  private async importarPelaUrl(arquivo: File, contentType: string): Promise<DesfechoImportacao> {
    let resposta: Response;
    try {
      resposta = await fetch(this._config!.urlImportacaoArquivo!, { method: 'POST', body: arquivo, headers: { 'Content-Type': contentType } });
    } catch {
      return 'falha';
    }
    if (resposta.status === 400) {
      const corpo = (await resposta.text().catch(() => '')).trim();
      return { aviso: { titulo: TITULO_ARQUIVO_RECUSADO, linhas: [corpo || MENSAGEM_RECUSA_SEM_CORPO, ORIENTACAO_ARQUIVO_RECUSADO] } };
    }
    if (resposta.status !== 200) return 'falha';
    try {
      return { documento: await resposta.json() };
    } catch {
      return 'falha';
    }
  }

  private async buscarTexto(sigla: string, numero: string, ano: string): Promise<unknown | 'indisponivel' | 'erro'> {
    try {
      if (this._config!.onObterTexto) {
        const texto = await this._config!.onObterTexto(normalizaConsultaProposicao(sigla, numero, ano));
        return texto === undefined || texto === null ? 'indisponivel' : texto;
      }
      const resposta = await fetch(montaUrlProposicao(this._config!.urlTextoEstruturado!, sigla, numero, ano));
      if (resposta.status === 404) return 'indisponivel';
      if (resposta.status !== 200) return 'erro';
      return await resposta.json();
    } catch {
      return 'erro';
    }
  }

  private async continuarTela2(): Promise<void> {
    if (!this.tela2Valida) return;
    this.erroComunicacao = '';
    this.avisoImportacao = undefined;

    if (this.opcaoTexto === 'vazio') return this.concluir();

    if (this.opcaoTexto === 'importar') {
      this.processando = true;
      const desfecho = await this.importarArquivo(this.arquivo!);
      this.processando = false;
      // Falha e recusa deixam o usuário na Tela 2, para trocar o arquivo ou tentar de novo.
      if (desfecho === 'falha') {
        this.erroComunicacao = mensagemFalhaImportacao(this.arquivo!.name);
      } else if ('aviso' in desfecho) {
        this.avisoImportacao = desfecho.aviso;
      } else if ('erros' in desfecho) {
        this.errosConversao = desfecho.erros;
        this.tela = 3;
      } else {
        this.concluir({ documentoImportado: desfecho.documento });
      }
      return;
    }

    const [sigla, numero, ano] =
      this.opcaoTexto === 'outra'
        ? [this.siglaOutra, this.numeroOutra, this.anoOutra]
        : this.plv
        ? [getTipoMpv()?.sigla ?? 'MPV', this.numeroMpv, this.anoMpv]
        : [this.tipoProposicao?.sigla ?? '', this.numeroProposicao, this.anoProposicao];

    this.processando = true;
    const texto = await this.buscarTexto(sigla, numero, ano);
    this.processando = false;
    if (texto === 'indisponivel') {
      this.textoIndisponivel = true;
    } else if (texto === 'erro') {
      this.erroComunicacao = 'Não foi possível obter o texto da proposição. Tente novamente.';
    } else {
      this.concluir({ texto });
    }
  }

  private concluir(conteudo: ConteudoInicial = {}): void {
    this.dispatchEvent(new CustomEvent(EVENTO_CONCLUIDA, { detail: this.montarResultado(conteudo), bubbles: true, composed: true }));
  }

  private montarResultado({ texto, documentoImportado }: ConteudoInicial = {}): ResultadoNovaProposicao {
    const { urn, urnDocumentoReferenciado } = montaUrnNovaProposicao(this.dados, this.numeroOriginal);
    const colegiadoDestino: ColegiadoDestino = this.tipoColegiado === 'Comissão' ? { tipoColegiado: 'Comissão', siglaComissao: this.siglaComissao } : { tipoColegiado: 'Plenário' };
    const detail: ResultadoNovaProposicao = {
      urn,
      ...(urnDocumentoReferenciado && { urnDocumentoReferenciado }),
      epigrafe: montaEpigrafeNovaProposicao(urn, urnDocumentoReferenciado, this.casa, colegiadoDestino),
      preambulo: getPreambuloNovaProposicao(urn),
      colegiadoDestino,
      ...(texto !== undefined && { texto }),
      ...(documentoImportado !== undefined && { documentoImportado }),
      anexoParecer: this.anexoParecer,
    };
    return detail;
  }

  // ---------------------------------------------------------------- renderização

  private valorDe(e: Event): string {
    return (e.target as HTMLInputElement).value ?? '';
  }

  // Eco assíncrono do sl-change (também quando o valor muda por código): os tratadores ignoram valor igual ao estado.
  private radio(nome: string, valor: string, rotulo: string, marcado: boolean, aoMarcar: () => void, desabilitado = false): TemplateResult {
    return html`<sl-radio
      name=${nome}
      value=${valor}
      ?checked=${marcado}
      ?disabled=${desabilitado}
      @click=${(): void => aoMarcar()}
      @sl-change=${(e: Event): void => {
        if ((e.target as HTMLInputElement).checked) aoMarcar();
      }}
      >${rotulo}</sl-radio
    >`;
  }

  private selectSiglas(id: string, tipos: TipoDocumento[], valor: string, aoMudar: (chave: string) => void): TemplateResult {
    const itens = tipos.map(t => ({ value: chaveTipo(t), label: t.sigla!, inativo: !t.ativo }));
    return html`<lexml-eta-autocomplete-lista
      id=${id}
      class="np-sigla"
      placeholder="Sigla"
      .items=${itens}
      .value=${valor}
      .alturaMaxima=${ALTURA_LISTA_SIGLA}
      @autocomplete-change=${(e: CustomEvent<{ value: string }>): void => aoMudar(e.detail.value)}
    ></lexml-eta-autocomplete-lista>`;
  }

  private campoTexto(id: string, valor: string, aoDigitar?: (valor: string) => void, maxlength?: number, classe = '', numerico = false): TemplateResult {
    return html`<sl-input
      id=${id}
      class=${classe}
      .value=${valor}
      maxlength=${maxlength ?? nothing}
      inputmode=${numerico ? 'numeric' : nothing}
      @sl-input=${(e: Event): void => {
        const campo = e.target as HTMLInputElement;
        let novo = campo.value ?? '';
        if (numerico && /\D/.test(novo)) {
          // Colar ou digitar não dígitos: o campo volta a ter só os dígitos.
          novo = novo.replace(/\D/g, '');
          campo.value = novo;
        }
        if (aoDigitar && novo !== valor) aoDigitar(novo);
      }}
    ></sl-input>`;
  }

  // Número e ano só aceitam dígitos.
  private campoNumero(id: string, valor: string, aoDigitar: (valor: string) => void): TemplateResult {
    return this.campoTexto(id, valor, aoDigitar, undefined, '', true);
  }

  private campoAno(id: string, valor: string, aoDigitar: (valor: string) => void): TemplateResult {
    return this.campoTexto(id, valor, aoDigitar, 4, 'np-ano', true);
  }

  // Texto fixo (ex.: "s/n"), sem campo editável.
  private textoCinza(id: string, texto: string): TemplateResult {
    return html`<span id=${id} class="np-cinza">${texto}</span>`;
  }

  // "<sigla> nº <número>, de <ano>" na mesma linha, sem rótulos.
  private linhaIdentificacao(sigla: TemplateResult, numero: TemplateResult, ano: TemplateResult): TemplateResult {
    return html`<div class="np-identificacao">${sigla}<span>nº</span>${numero}<span>, de</span>${ano}</div>`;
  }

  private aviso(id: string, variante: 'danger' | 'warning' | 'neutral', texto: string): TemplateResult {
    return html`<sl-alert id=${id} variant=${variante} open>${texto}</sl-alert>`;
  }

  // Problemas no arquivo importado ficam logo abaixo da pergunta, antes das opções.
  private renderAlertasImportacao(): TemplateResult | typeof nothing {
    if (this.opcaoTexto !== 'importar' || (!this.erroComunicacao && !this.avisoImportacao)) return nothing;
    return html`<div class="np-alertas-importacao">
      ${this.erroComunicacao ? this.aviso('np-erro-texto', 'danger', this.erroComunicacao) : nothing}
      ${this.avisoImportacao ? this.renderAvisoImportacao(this.avisoImportacao) : nothing}
    </div>`;
  }

  private renderAvisoImportacao({ titulo, linhas }: AvisoImportacao): TemplateResult {
    return html`<sl-alert id="np-aviso-importacao" variant="warning" open>
      ${titulo ? html`<strong>${titulo}</strong><br />` : nothing}${linhas.map((linha, i) => html`${i ? html`<br />` : nothing}${linha}`)}
    </sl-alert>`;
  }

  private rotuloVerificacao(v: Verificacao): TemplateResult | typeof nothing {
    if (v.estado === 'verificando') return this.aviso('np-verificando', 'neutral', 'Verificando…');
    if (v.estado === 'inexistente') return this.aviso('np-nao-encontrado', 'danger', 'Documento não encontrado.');
    if (v.estado === 'erro') return this.aviso('np-erro-verificacao', 'danger', 'Não foi possível verificar o documento. Tente novamente.');
    return nothing;
  }

  private grupoVerificacao(prefixo: string, v: Verificacao, aoVerificar: () => void, habilitado: boolean): TemplateResult {
    const pode = habilitado && v.estado !== 'verificando';
    return html`
      <sl-button id="${prefixo}-verificar" ?disabled=${!pode} @click=${(): void => (pode ? aoVerificar() : undefined)}>Verificar</sl-button>
      ${this.rotuloVerificacao(v)}
      <div class="np-ementa-rotulo">Ementa</div>
      <div id="${prefixo}-ementa" class="np-ementa">${v.estado === 'ok' ? v.ementa : ''}</div>
    `;
  }

  private renderTela1(): TemplateResult {
    const substitutivo = this.especie !== 'proposicao';
    const numeroFixo = this.especie === 'proposicao';
    return html`
      <h3 id="np-titulo">${this.emEdicao ? 'Alterar dados básicos' : 'Nova proposição'}</h3>
      ${this.erroDadosIniciais ? this.aviso('np-erro-dados-iniciais', 'danger', this.erroDadosIniciais) : nothing}

      <fieldset id="np-g1">
        <legend>Espécie de documento</legend>
        ${keyed(
          this.casa,
          html`<sl-radio-group>
            ${this.radio('especie', 'proposicao', 'Proposição', this.especie === 'proposicao', () => this.onEspecie('proposicao'))}
            ${this.radio('especie', 'substitutivo', 'Substitutivo', this.especie === 'substitutivo', () => this.onEspecie('substitutivo'))}
            ${this.casa === 'CD' ? this.radio('especie', 'subemenda', 'Subemenda substitutiva', this.especie === 'subemenda', () => this.onEspecie('subemenda')) : nothing}
          </sl-radio-group>`
        )}
      </fieldset>

      <fieldset id="np-g3">
        <legend>Identificação da proposição</legend>
        ${this.linhaIdentificacao(
          this.selectSiglas('np-sigla-proposicao', this.siglasProposicao, this.chaveProposicao, c => this.onSiglaProposicao(c)),
          numeroFixo
            ? this.textoCinza('np-numero-proposicao', this.numeroFixoDe(this.tipoProposicao))
            : this.campoNumero('np-numero-proposicao', this.numeroProposicao, v => {
                this.numeroProposicao = v;
                this.verificacaoProposicao = verificacaoVazia();
              }),
          this.campoAno('np-ano-proposicao', this.anoProposicao, v => {
            this.anoProposicao = v;
            this.verificacaoProposicao = verificacaoVazia();
          })
        )}
        ${substitutivo
          ? this.grupoVerificacao(
              'np-proposicao',
              this.verificacaoProposicao,
              () => this.verificarProposicao(),
              !!this.tipoProposicao && this.podeVerificar(this.numeroProposicao, this.anoProposicao)
            )
          : nothing}
      </fieldset>

      ${this.plv
        ? html`<fieldset id="np-g4">
            <legend>Identificação da medida provisória</legend>
            ${this.linhaIdentificacao(
              html`<span id="np-sigla-mpv" class="np-sigla-fixa">${getTipoMpv()?.sigla ?? 'MPV'}</span>`,
              this.campoNumero('np-numero-mpv', this.numeroMpv, v => {
                this.numeroMpv = v;
                this.verificacaoMpv = verificacaoVazia();
              }),
              this.campoAno('np-ano-mpv', this.anoMpv, v => {
                this.anoMpv = v;
                this.verificacaoMpv = verificacaoVazia();
              })
            )}
            ${this.grupoVerificacao('np-mpv', this.verificacaoMpv, () => this.verificarMpv(), this.podeVerificar(this.numeroMpv, this.anoMpv))}
          </fieldset>`
        : nothing}

      <fieldset id="np-g5">
        <legend>Destino</legend>
        <sl-radio-group>
          ${this.radio('destino', 'Plenário', 'Plenário', this.tipoColegiado === 'Plenário', () => this.onTipoColegiado('Plenário'))}
          ${this.radio('destino', 'Comissão', 'Comissão', this.tipoColegiado === 'Comissão', () => this.onTipoColegiado('Comissão'), this.comissaoIndisponivel)}
        </sl-radio-group>
        ${this.comissaoIndisponivel ? this.aviso('np-erro-comissoes', 'danger', 'Não foi possível obter a lista de comissões. Só o Plenário está disponível.') : nothing}
        ${this.tipoColegiado === 'Comissão' ? this.renderComissao() : nothing}
      </fieldset>

      <fieldset id="np-g6">
        <legend>Forma de apresentação</legend>
        <sl-checkbox
          id="np-anexo-parecer"
          ?checked=${this.anexoParecer}
          @sl-change=${(e: Event): void => {
            this.anexoParecer = (e.target as HTMLInputElement).checked;
          }}
          >Este documento será apresentado em parecer</sl-checkbox
        >
      </fieldset>

      <div class="np-botoes">
        <sl-button id="np-continuar" variant="primary" ?disabled=${!this.tela1Valida} @click=${(): void => (this.emEdicao ? this.continuarEdicao() : this.continuarTela1())}
          >Continuar</sl-button
        >
        <sl-button id="np-cancelar" @click=${(): void => this.cancelar()}>Cancelar</sl-button>
      </div>
      ${this.emEdicao ? this.renderConfirmacao() : nothing}
    `;
  }

  private get cabecalho(): TemplateResult {
    return html`<h3 id="np-cabecalho">${getNovoOuNova(this.dados)} ${getIdentificacaoDocumento(this.dados)}.</h3>`;
  }

  private opcao(valor: OpcaoTexto, rotulo: string): TemplateResult {
    return html`<div class="np-opcao">
      ${this.radio('opcaoTexto', valor, rotulo, this.opcaoTexto === valor, () => {
        if (this.opcaoTexto === valor) return;
        this.opcaoTexto = valor;
        this.erroComunicacao = '';
        this.avisoImportacao = undefined;
      })}
    </div>`;
  }

  private renderTela2(): TemplateResult {
    return html`
      ${this.cabecalho}
      <p>Como você quer iniciar?</p>
      ${this.renderAlertasImportacao()}
      <sl-radio-group>
        ${this.opcao('vazio', 'Texto vazio')} ${this.opcao('importar', 'Importar documento (PDF, DOCX, TXT ou LexML)')}
        ${this.opcaoTexto === 'importar'
          ? html`<div class="np-subopcao">
              <label>Arquivo <input type="file" id="np-arquivo" accept=".pdf,.docx,.txt,.xml,.json" @change=${(e: Event): void => this.onArquivo(e)} /></label>
              ${this.erroArquivo ? this.aviso('np-erro-arquivo', 'danger', this.erroArquivo) : nothing}
            </div>`
          : nothing}
        ${this.referenciaExigida ? this.opcao('referenciado', `Texto do(a) ${this.descricaoReferenciada}`) : nothing} ${this.opcao('outra', 'Texto de outra proposição')}
      </sl-radio-group>
      ${this.opcaoTexto === 'outra'
        ? html`<div class="np-subopcao">
            ${this.linhaIdentificacao(
              this.selectSiglas('np-sigla-outra', getSiglasOutraProposicao(), this.chaveOutra, chave => {
                if (chave === this.chaveOutra) return;
                this.chaveOutra = chave;
                this.verificacaoOutra = verificacaoVazia();
                this.textoIndisponivel = false;
              }),
              this.campoNumero('np-numero-outra', this.numeroOutra, v => {
                this.numeroOutra = v;
                this.verificacaoOutra = verificacaoVazia();
                this.textoIndisponivel = false;
              }),
              this.campoAno('np-ano-outra', this.anoOutra, v => {
                this.anoOutra = v;
                this.verificacaoOutra = verificacaoVazia();
                this.textoIndisponivel = false;
              })
            )}
            ${this.grupoVerificacao('np-outra', this.verificacaoOutra, () => this.verificarOutra(), !!this.tipoOutra && this.podeVerificar(this.numeroOutra, this.anoOutra))}
          </div>`
        : nothing}
      ${this.textoIndisponivelNaOpcao ? this.aviso('np-texto-indisponivel', 'warning', 'Texto estruturado não disponível para edição') : nothing}
      ${this.erroComunicacao && this.opcaoTexto !== 'importar' ? this.aviso('np-erro-texto', 'danger', this.erroComunicacao) : nothing}

      <div class="np-botoes">
        <sl-button id="np-continuar" variant="primary" ?disabled=${!this.tela2Valida} @click=${(): void => void this.continuarTela2()}>Continuar</sl-button>
        <sl-button
          id="np-voltar"
          @click=${(): void => {
            this.tela = 1;
          }}
          >Voltar</sl-button
        >
        <sl-button id="np-cancelar" @click=${(): void => this.cancelar()}>Cancelar</sl-button>
      </div>
    `;
  }

  private get descricaoReferenciada(): string {
    if (this.plv) return `Medida Provisória nº ${this.numeroMpv.trim()} de ${this.anoMpv.trim()}`;
    return `${this.tipoProposicao?.descricao ?? ''} nº ${this.numeroProposicao.trim()} de ${this.anoProposicao.trim()}`;
  }

  private renderTela3(): TemplateResult {
    return html`
      ${this.cabecalho}
      <p id="np-erros-titulo">Ocorreram os seguintes erros na tentativa de conversão do ${this.arquivo?.name ?? 'arquivo'}.</p>
      <ul id="np-erros">
        ${this.errosConversao.map(e => html`<li>${e}</li>`)}
      </ul>
      <p>Você pode corrigi-los no documento e tentar novamente ou continuar para iniciar com um documento vazio.</p>
      <div class="np-botoes">
        <sl-button id="np-continuar" variant="primary" @click=${(): void => this.concluir()}>Continuar</sl-button>
        <sl-button
          id="np-voltar"
          @click=${(): void => {
            this.tela = 2;
          }}
          >Voltar</sl-button
        >
        <sl-button id="np-cancelar" @click=${(): void => this.cancelar()}>Cancelar</sl-button>
      </div>
    `;
  }

  render(): TemplateResult {
    // Referência a comissoesVersao: o recarregamento das comissões (Map fora do estado) precisa redesenhar.
    void this.comissoesVersao;
    if (this.erroConfiguracao) return this.aviso('np-erro-configuracao', 'danger', this.erroConfiguracao);
    // Radios do Shoelace não podem entrar num grupo já existente: só se desenha depois da configuração (casa definida).
    if (!this._config) return html``;
    return html`
      <style>
        lexml-nova-proposicao fieldset {
          border: 1px solid var(--sl-color-gray-300, #ccc);
          border-radius: 4px;
          margin: 0 0 12px;
          padding: 10px 12px 15px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        /* O componente se desenha no DOM do hospedeiro: fixa a legenda para não herdar estilos globais (ex.: Bootstrap). */
        lexml-nova-proposicao legend {
          display: block;
          width: auto;
          max-width: 100%;
          float: none;
          margin: 0;
          padding: 0 4px;
          border: 0;
          font-size: inherit;
          font-weight: 600;
          line-height: inherit;
          color: inherit;
          white-space: normal;
        }
        lexml-nova-proposicao .np-botoes {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        lexml-nova-proposicao .np-identificacao {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        lexml-nova-proposicao .np-identificacao sl-input,
        lexml-nova-proposicao .np-identificacao lexml-eta-autocomplete-lista {
          width: 9rem;
        }
        lexml-nova-proposicao .np-identificacao sl-input.np-ano {
          width: 6rem;
        }
        lexml-nova-proposicao .np-cinza {
          color: #888;
          display: inline-block;
          min-width: 9rem;
        }
        lexml-nova-proposicao .np-ementa-rotulo {
          font-size: 0.85em;
          color: #555;
        }
        lexml-nova-proposicao .np-ementa {
          font-weight: normal;
          line-height: 1.5;
          min-height: 1.5em;
          max-height: 4.5em;
          overflow-y: auto;
          border: 1px solid var(--sl-color-gray-300, #ccc);
          border-radius: 4px;
          padding: 2px 6px;
        }
        lexml-nova-proposicao .np-alertas-importacao {
          margin: 12px 0;
        }
        lexml-nova-proposicao .np-opcao {
          margin: 4px 0;
        }
        lexml-nova-proposicao .np-subopcao {
          margin: 4px 0 8px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        lexml-nova-proposicao sl-radio-group::part(base) {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      </style>
      ${this.tela === 1 ? this.renderTela1() : this.tela === 2 ? this.renderTela2() : this.renderTela3()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lexml-nova-proposicao': NovaProposicaoComponent;
  }
}
