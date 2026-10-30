import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/radio/radio';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group';
import { html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import '../autocomplete/autocomplete-lista';
import { getCasaLegislativaResponsavel } from '../../model/lexml/documento/urnUtil';
import { inicializarVocabulario } from '../../model/lexml/documento/vocabulario';
import { CasaLegislativaEditor, TipoDocumento, TipoRelacaoSubstitutivo } from '../../model/lexml/documento/vocabulario/tiposVocabulario';
import { montaEpigrafePadrao } from './epigrafePadrao';
import { getIdentificacaoDocumento, getNovoOuNova } from './identificacaoDocumento';
import { isPlv, montaUrnNovaProposicao } from './montaUrnNovaProposicao';
import { getPreambuloNovaProposicao } from './preambuloNovaProposicao';
import { chaveTipo, getSiglasNovaProposicao, getSiglasOutraProposicao, getSiglasProposicaoReferenciada, getSiglasSubstitutivo, getTipoMpv } from './siglasNovaProposicao';
import { ColegiadoDestino, DadosIdentificacao, EspecieDocumento, LIMITE_ARQUIVO_BYTES, ResultadoNovaProposicao, TipoColegiadoDestino } from './tiposNovaProposicao';
import { ConfigNovaProposicao, montaUrlComissoes, montaUrlProposicao, validarConfigNovaProposicao } from './urlsNovaProposicao';

export const EVENTO_CONCLUIDA = 'nova-proposicao-concluida';
export const EVENTO_CANCELADA = 'nova-proposicao-cancelada';

// Altura máxima das listas flutuantes (px): siglas = 126 (7 itens) + 50%.
const ALTURA_LISTA_SIGLA = 189;
const ALTURA_LISTA_COMISSAO = 192;

const EXTENSOES_ARQUIVO = ['docx', 'txt', 'xml', 'json', 'lexml'];
const ERRO_PARSER_SIMULADO = 'Erro simulado de conversão: o tratamento real do arquivo importado ainda não está disponível.';

type EstadoVerificacao = 'nenhuma' | 'verificando' | 'ok' | 'inexistente' | 'erro';

interface Verificacao {
  estado: EstadoVerificacao;
  ementa: string;
  textoEstruturadoDisponivel: boolean;
}

interface Comissao {
  siglaCasaLegislativa: string;
  sigla: string;
  nome: string;
}

type OpcaoTexto = 'vazio' | 'importar' | 'referenciado' | 'outra';

const verificacaoVazia = (): Verificacao => ({ estado: 'nenhuma', ementa: '', textoEstruturadoDisponivel: true });

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
  @state() private chaveSubstitutivo = '';
  @state() private anoSubstitutivo = this.anoCorrente;
  @state() private numeroMpv = '';
  @state() private anoMpv = this.anoCorrente;
  @state() private verificacaoProposicao = verificacaoVazia();
  @state() private verificacaoMpv = verificacaoVazia();
  @state() private tipoColegiado: TipoColegiadoDestino = 'Plenário';
  @state() private siglaComissao = '';
  @state() private anexoParecer = false;
  @state() private comissoesVersao = 0;

  @state() private opcaoTexto: OpcaoTexto = 'vazio';
  @state() private arquivo?: File;
  @state() private erroArquivo = '';
  @state() private chaveOutra = '';
  @state() private numeroOutra = '';
  @state() private anoOutra = this.anoCorrente;
  @state() private verificacaoOutra = verificacaoVazia();
  @state() private textoIndisponivel = false;
  @state() private erroComunicacao = '';
  @state() private processando = false;
  @state() private errosConversao: string[] = [];

  constructor() {
    super();
    inicializarVocabulario('SF');
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

  /** Descarta os dados informados e volta à Tela 1. */
  reiniciar(): void {
    this.tela = 1;
    this.especie = 'proposicao';
    this.chaveProposicao = '';
    this.numeroProposicao = '';
    this.anoProposicao = this.anoCorrente;
    this.chaveSubstitutivo = '';
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
    this.processando = false;
    this.errosConversao = [];
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

  private get siglasSubstitutivo(): TipoDocumento[] {
    return getSiglasSubstitutivo(this.especie === 'subemenda' ? TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA : TipoRelacaoSubstitutivo.E_SUBSTITUTIVO);
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

  private get tipoSubstitutivo(): TipoDocumento | undefined {
    return this.siglasSubstitutivo.find(t => chaveTipo(t) === this.chaveSubstitutivo);
  }

  private get grupoSubstitutivoVisivel(): boolean {
    return this.casa === 'CD' && this.especie !== 'proposicao';
  }

  private get dados(): DadosIdentificacao {
    return {
      casa: this.casa,
      especie: this.especie,
      tipoProposicao: this.tipoProposicao,
      numeroProposicao: this.numeroProposicao,
      anoProposicao: this.anoProposicao,
      tipoSubstitutivo: this.grupoSubstitutivoVisivel ? this.tipoSubstitutivo : undefined,
      anoSubstitutivo: this.anoSubstitutivo,
      numeroMpv: this.numeroMpv,
      anoMpv: this.anoMpv,
    };
  }

  private get siglaInativaSelecionada(): boolean {
    return this.especie === 'proposicao' && !!this.tipoProposicao && !this.tipoProposicao.ativo;
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
    if (this.grupoSubstitutivoVisivel && (!this.tipoSubstitutivo || !this.anoPreenchido(this.anoSubstitutivo))) return false;
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
    this.chaveSubstitutivo = '';
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

  private onSiglaSubstitutivo(chave: string): void {
    if (chave === this.chaveSubstitutivo) return;
    this.chaveSubstitutivo = chave;
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

  private async carregarComissoes(): Promise<void> {
    const casa = this.casaDasComissoes;
    if (!casa) return;
    if (!this.comissoesPorCasa.has(casa)) await this.buscarComissoes(casa);
    // Sem lista de comissões, só o Plenário é oferecido (inclusive como padrão do substitutivo).
    if (this.comissaoIndisponivel) {
      this.tipoColegiado = 'Plenário';
      this.limparComissao();
    } else if (this.siglaComissao && !this.comissoesDisponiveis.some(c => c.sigla === this.siglaComissao)) {
      // A casa do documento mudou: a comissão escolhida deixou de existir na lista.
      this.limparComissao();
    }
    this.comissoesVersao++;
  }

  private async buscarComissoes(casa: string): Promise<void> {
    try {
      const resposta = await fetch(montaUrlComissoes(this._config!.urlComissoes!, casa));
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const lista = (await resposta.json()) as Comissao[];
      this.comissoesPorCasa.set(
        casa,
        (Array.isArray(lista) ? lista : []).filter(c => c.siglaCasaLegislativa === casa)
      );
    } catch {
      this.comissoesPorCasa.set(casa, 'indisponivel');
    }
  }

  // ---------------------------------------------------------------- verificação (RN-04, RN-05)

  private async consultar(sigla: string, numero: string, ano: string): Promise<Verificacao> {
    try {
      const resposta = await fetch(montaUrlProposicao(this._config!.urlVerificacaoProposicao!, sigla, numero, ano));
      if (resposta.status === 404) return { estado: 'inexistente', ementa: '', textoEstruturadoDisponivel: false };
      if (resposta.status !== 200) return { estado: 'erro', ementa: '', textoEstruturadoDisponivel: false };
      const corpo = await resposta.json();
      return { estado: 'ok', ementa: String(corpo?.ementa ?? ''), textoEstruturadoDisponivel: corpo?.textoEstruturadoDisponivel !== false };
    } catch {
      return { estado: 'erro', ementa: '', textoEstruturadoDisponivel: false };
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
    if (!arquivo) return;
    const extensao = arquivo.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSOES_ARQUIVO.includes(extensao)) {
      this.erroArquivo = 'Formato não aceito. Selecione um arquivo DOCX, TXT ou LexML (XML ou JSON).';
    } else if (arquivo.size > LIMITE_ARQUIVO_BYTES) {
      this.erroArquivo = 'O arquivo excede o limite de 5 MB.';
    }
  }

  // Fronteira do tratamento real do arquivo (outra issue): hoje sempre devolve um erro simulado, sem chamar URL.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async converterArquivoImportado(_arquivo: File): Promise<{ texto?: unknown; erros: string[] }> {
    return { erros: [ERRO_PARSER_SIMULADO] };
  }

  private async buscarTexto(sigla: string, numero: string, ano: string): Promise<unknown | 'indisponivel' | 'erro'> {
    try {
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

    if (this.opcaoTexto === 'vazio') return this.concluir();

    if (this.opcaoTexto === 'importar') {
      this.processando = true;
      const resultado = await this.converterArquivoImportado(this.arquivo!);
      this.processando = false;
      if (resultado.erros.length) {
        this.errosConversao = resultado.erros;
        this.tela = 3;
        return;
      }
      return this.concluir(resultado.texto);
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
      this.concluir(texto);
    }
  }

  private concluir(texto?: unknown): void {
    const { urn, urnDocumentoReferenciado } = montaUrnNovaProposicao(this.dados);
    const colegiadoDestino: ColegiadoDestino = this.tipoColegiado === 'Comissão' ? { tipoColegiado: 'Comissão', siglaComissao: this.siglaComissao } : { tipoColegiado: 'Plenário' };
    const detail: ResultadoNovaProposicao = {
      urn,
      ...(urnDocumentoReferenciado && { urnDocumentoReferenciado }),
      epigrafe: montaEpigrafePadrao(urn),
      preambulo: getPreambuloNovaProposicao(urn),
      colegiadoDestino,
      ...(texto !== undefined && { texto }),
      anexoParecer: this.anexoParecer,
    };
    this.dispatchEvent(new CustomEvent(EVENTO_CONCLUIDA, { detail, bubbles: true, composed: true }));
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

  private campoTexto(id: string, valor: string, aoDigitar?: (valor: string) => void, maxlength?: number, classe = ''): TemplateResult {
    return html`<sl-input
      id=${id}
      class=${classe}
      .value=${valor}
      maxlength=${maxlength ?? nothing}
      @sl-input=${(e: Event): void => {
        const novo = this.valorDe(e);
        if (aoDigitar && novo !== valor) aoDigitar(novo);
      }}
    ></sl-input>`;
  }

  private campoAno(id: string, valor: string, aoDigitar: (valor: string) => void): TemplateResult {
    return this.campoTexto(id, valor, aoDigitar, 4, 'np-ano');
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
      <h3>Nova proposição</h3>

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

      ${this.grupoSubstitutivoVisivel
        ? html`<fieldset id="np-g2">
            <legend>Identificação ${this.especie === 'subemenda' ? 'da subemenda substitutiva' : 'do substitutivo'}</legend>
            ${this.linhaIdentificacao(
              this.selectSiglas('np-sigla-substitutivo', this.siglasSubstitutivo, this.chaveSubstitutivo, c => this.onSiglaSubstitutivo(c)),
              this.textoCinza('np-numero-substitutivo', 's/n'),
              this.campoAno('np-ano-substitutivo', this.anoSubstitutivo, v => {
                this.anoSubstitutivo = v;
              })
            )}
          </fieldset>`
        : nothing}

      <fieldset id="np-g3">
        <legend>Identificação da proposição</legend>
        ${this.linhaIdentificacao(
          this.selectSiglas('np-sigla-proposicao', this.siglasProposicao, this.chaveProposicao, c => this.onSiglaProposicao(c)),
          numeroFixo
            ? this.textoCinza('np-numero-proposicao', 's/n')
            : this.campoTexto('np-numero-proposicao', this.numeroProposicao, v => {
                this.numeroProposicao = v;
                this.verificacaoProposicao = verificacaoVazia();
              }),
          this.campoAno('np-ano-proposicao', this.anoProposicao, v => {
            this.anoProposicao = v;
            this.verificacaoProposicao = verificacaoVazia();
          })
        )}
        ${this.siglaInativaSelecionada ? this.aviso('np-sigla-inativa', 'warning', 'Esta sigla está inativa e não deve ser usada para iniciar um texto novo.') : nothing}
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
              this.campoTexto('np-numero-mpv', this.numeroMpv, v => {
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
        <sl-button id="np-continuar" variant="primary" ?disabled=${!this.tela1Valida} @click=${(): void => this.continuarTela1()}>Continuar</sl-button>
        <sl-button id="np-cancelar" @click=${(): void => this.cancelar()}>Cancelar</sl-button>
      </div>
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
      })}
    </div>`;
  }

  private renderTela2(): TemplateResult {
    return html`
      ${this.cabecalho}
      <p>Como você quer iniciar?</p>
      <sl-radio-group>
        ${this.opcao('vazio', 'Texto vazio')} ${this.opcao('importar', 'Importar documento (DOCX, TXT ou LexML)')}
        ${this.opcaoTexto === 'importar'
          ? html`<div class="np-subopcao">
              <label>Arquivo <input type="file" id="np-arquivo" accept=".docx,.txt,.xml,.json,.lexml" @change=${(e: Event): void => this.onArquivo(e)} /></label>
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
              this.campoTexto('np-numero-outra', this.numeroOutra, v => {
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
      ${this.erroComunicacao ? this.aviso('np-erro-texto', 'danger', this.erroComunicacao) : nothing}

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
          padding-top: 10px;
          padding-bottom: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
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
