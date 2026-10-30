import { abrirArquivoDocumentoArticulado, lerArquivoDocumentoArticulado, salvarArquivoDocumentoArticulado } from '../../src/util/arquivoDocumentoArticulado';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { PL_5008_2023 } from '../doc/pl_5008_2023';
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { LexmlEtaConfig, LexmlEtaComponent, NovaProposicaoComponent, Usuario } from '../../src';
import type { Anexo, ObterAnexoBlobResult, ResultadoNovaProposicao } from '../../src';
import { RefProposicaoReduzida } from '../../src/model/proposicao/proposicao';
import { COD_CIVIL_COMPLETO } from '../doc/codigocivil_completo';
import { COD_CIVIL_PARCIAL1 } from '../doc/codigocivil_parcial1';
import { COD_CIVIL_PARCIAL2 } from '../doc/codigocivil_parcial2';
import { MPV_1089_2021 } from '../doc/mpv_1089_2021';
import { MPV_1100_2022 } from '../doc/mpv_1100_2022';
import { MPV_885_2019 } from '../doc/mpv_885_2019';
import { MPV_905_2019 } from '../doc/mpv_905_2019';
import { MPV_930_2020 } from '../doc/mpv_930_2020';
import { MPV_1078_2021 } from '../doc/mpv_1078_2021';
import { MPV_1160_2023 } from '../doc/mpv_1160_2023';
import { PLC_ARTIGOS_AGRUPADOS } from '../doc/plc_artigos_agrupados';
import { PL_AGRUPADORES } from '../doc/pl_agrupadores';
import { getAno, getNumero, getPreambuloPadrao, getSigla } from '../../src/model/lexml/documento/urnUtil';
import { getVocabularioDaCasa } from '../../src/model/lexml/documento/vocabulario';
import { PDL_343_2023 } from '../doc/pdl_343_2023';
import { PEC_48_2023 } from '../doc/pec_48_2023';
import { Plc_142_2018 } from '../doc/plc_142_2018';
import { PLP_197_2023 } from '../doc/plp_197_2023';
import { PRS_92_2023 } from '../doc/prs_92_2023';
import { PL_4687_2023 } from '../doc/pl_4687_2023';
import { PDS_183_2018 } from '../doc/pds_183_2018';
import { PLS_547_2018 } from '../doc/pls_547_2018';
import { PLP_137_2019 } from '../doc/plp_137_2019';
import { MPV_1210_2024 } from '../doc/mpv_1210_2024';
import { MPV_1085_2021 } from '../doc/mpv_1085_2021';
import { PLP_68_2024 } from '../doc/plp_68_2024';
import { PLP_68_2024_1 } from '../doc/plp_68_2024_1';
import { PLP_68_2024_2 } from '../doc/plp_68_2024_2';
import { PLP_68_2024_3 } from '../doc/plp_68_2024_3';
import { MPV_1170_2023 } from '../doc/mpv_1170_2023';
import { MPV_1171_2023 } from '../doc/mpv_1171_2023';
import { MPV_1232_2024 } from '../doc/mpv_1232_2024';
import { MPV_1170_2023_ALTERADA } from '../doc/mpv_1170_2023_alterada';
import { PL_4_2025 } from '../doc/pl_4_2025';
import { SBT_2_PEC_18_2025 } from '../doc/sbt_2_pec_18_2025';
import { validarRecursivo } from './jsonValidator';

const mapProjetosNormas = {
  sbt_2_pec_18_2025: SBT_2_PEC_18_2025,
  mpv_885_2019: MPV_885_2019,
  mpv_905_2019: MPV_905_2019,
  mpv_930_2020: MPV_930_2020,
  mpv_1078_2021: MPV_1078_2021,
  mpv_1089_2021: MPV_1089_2021,
  mpv_1100_2022: MPV_1100_2022,
  mpv_1160_2023: MPV_1160_2023,
  mpv_1210_2024: MPV_1210_2024,
  mpv_1232_2024: MPV_1232_2024,
  mpv_1085_2021: MPV_1085_2021,
  mpv_1170_2023: MPV_1170_2023,
  mpv_1171_2023: MPV_1171_2023,
  mpv_1170_2023_ALTERADA: MPV_1170_2023_ALTERADA,
  pdl_343_2023: PDL_343_2023,
  pec_48_2023: PEC_48_2023,
  pl_142_2018: Plc_142_2018,
  plp_197_2023: PLP_197_2023,
  prs_92_2023: PRS_92_2023,
  pdl_183_2018: PDS_183_2018,
  pl_4687_2023: PL_4687_2023,
  pl_547_2018: PLS_547_2018,
  plp_137_2029: PLP_137_2019,
  pl_5008_2023: PL_5008_2023,
  _codcivil_completo: COD_CIVIL_COMPLETO,
  _codcivil_parcial1: COD_CIVIL_PARCIAL1,
  _codcivil_parcial2: COD_CIVIL_PARCIAL2,
  _plc_artigos_agrupados: PLC_ARTIGOS_AGRUPADOS,
  _pl_agrupadores: PL_AGRUPADORES,
  _plp_68_2024: PLP_68_2024,
  _plp_68_2024_1: PLP_68_2024_1,
  _plp_68_2024_2: PLP_68_2024_2,
  _plp_68_2024_3: PLP_68_2024_3,
  _mpv_905_2019: MPV_905_2019,
  _pl_4_2025: PL_4_2025,
};

const getUrnDocumento = (projetoNorma: any): string | undefined => projetoNorma?.value?.metadado?.identificacao?.urn;

// Deriva em memória um documento da Câmara a partir de um do Senado, trocando só a URN.
const derivarParaCamara = (projetoNorma: any): any => {
  const urn = (getUrnDocumento(projetoNorma) as string).replace('senado.federal', 'camara.deputados').replace(';plc:', ';pl:');
  const { metadado } = projetoNorma.value;
  return { ...projetoNorma, value: { ...projetoNorma.value, metadado: { ...metadado, identificacao: { ...metadado.identificacao, urn } } } };
};

const documentosCamara: { chave: string; rotulo: string; origem: any }[] = [
  { chave: 'cd_pl_5008_2023', rotulo: 'PL 5008, de 2023 (CD)', origem: PL_5008_2023 },
  { chave: 'cd_plc_artigos_agrupados', rotulo: 'PL com agrupadores e alterações (CD)', origem: PLC_ARTIGOS_AGRUPADOS },
  { chave: 'cd_pl_142_2018', rotulo: 'PL 142, de 2018 (CD)', origem: Plc_142_2018 },
  { chave: 'cd_plp_197_2023', rotulo: 'PLP 197, de 2023 (CD)', origem: PLP_197_2023 },
];
documentosCamara.forEach(d => (mapProjetosNormas[d.chave] = derivarParaCamara(d.origem)));

// Documentos sem rótulo derivável da chave.
const opcoesEspeciais = [
  { chave: '_codcivil_completo', rotulo: 'Código Civil Completo' },
  { chave: '_codcivil_parcial1', rotulo: 'Código Civil (arts. 1 a 1023)' },
  { chave: '_codcivil_parcial2', rotulo: 'Código Civil (arts. 1 a 388)' },
  { chave: '_plc_artigos_agrupados', rotulo: 'PL (testes unitários de cmd)' },
  { chave: '_pl_agrupadores', rotulo: 'PL Agrupadores (Simulaçao de cmd para testes)' },
  { chave: '_sem_texto', rotulo: 'PL 3/2023 (sem texto LexML)' },
  { chave: '_plp_68_2024', rotulo: 'PLP 68, de 2024 (completo)' },
  { chave: '_mpv_905_2019', rotulo: 'MPV 905, de 2019 (com dispositivos bloqueados)' },
  { chave: '_pl_4_2025', rotulo: 'PL 4, de 2025' },
];

const opcoesDocumentos = [
  ...Object.keys(mapProjetosNormas)
    .filter(k => !k.startsWith('_') && !k.startsWith('cd_'))
    .map(k => ({ chave: k, rotulo: k.toUpperCase().replace(/_/, ' ').replace(/_/, ', de ') })),
  ...documentosCamara.map(d => ({ chave: d.chave, rotulo: d.rotulo })),
  ...opcoesEspeciais,
];

// Documento resolvido pelo vocabulário da casa do editor; sem URN (ex.: sem texto), sempre listado.
const documentoDaCasa = (chave: string): boolean => {
  const urn = getUrnDocumento(mapProjetosNormas[chave]);
  if (!urn) return true;
  const [autoridade, segmento] = urn.replace('urn:lex:br:', '').split(':');
  const tipoSemSigla = segmento?.split(';')[0];
  return getVocabularioDaCasa().tiposDocumento.some(t => t.urnAutoridade === autoridade && (t.urn === segmento || (t.ativo && !!t.sigla && t.urnTipoDocumento === tipoSemSigla)));
};

const mapConfiguracaoPaginacaoDispositivos = {
  _plp_68_2024: {
    // maxItensPorPagina: 700,
    rangeArtigos: [
      { numInicial: 1, numFinal: 160 },
      { numInicial: 161, numFinal: 392 },
      { numInicial: 393, numFinal: 499 },
    ],
  },
};

@customElement('demo-view')
export class DemoView extends LitElement {
  @query('.nome-proposicao')
  private elNomeProposicao!: HTMLDivElement;

  @query('#projetoNorma')
  private elDocumento!: HTMLSelectElement;

  @query('lexml-eta')
  private elLexmlEta!: LexmlEtaComponent;

  @query('lexml-nova-proposicao')
  private elNovaProposicao?: NovaProposicaoComponent;

  @state() modo = 'edicao';
  // O modal só existe no DOM enquanto aberto: não interfere em outros sl-dialog da página.
  @state() modalNovaProposicao = false;
  @state() casa: 'SF' | 'CD' = 'SF';
  @state() projetoNorma: any = {};
  @state() proposicaoCorrente = new RefProposicaoReduzida();

  private nomeUsuario?: string = 'Fulano';
  etaConfig: LexmlEtaConfig;

  constructor() {
    super();
    setBasePath('./');
    this.etaConfig = new LexmlEtaConfig();
    this.etaConfig.urlConsultaParlamentares = '/parlamentares';
    this.configurarAnexos();
  }

  // O host da demo guarda os arquivos em memória, só durante a sessão da página.
  private configurarAnexos(): void {
    const arquivos = new Map<string, Blob>();
    let sequencia = 0;
    this.etaConfig.tiposAnexos = [
      { codigo: 'substitutivo', nome: 'Substitutivo' },
      { codigo: 'emenda', nome: 'Emenda' },
    ];
    this.etaConfig.onUploadAnexo = (file: File): string => {
      const idArquivo = `demo-${++sequencia}`;
      arquivos.set(idArquivo, file);
      return idArquivo;
    };
    this.etaConfig.onDeleteAnexo = (anexo: Anexo): void => {
      arquivos.delete(anexo.idArquivo);
    };
    this.etaConfig.onObterAnexoBlob = (anexo: Anexo): ObterAnexoBlobResult => {
      const blob = arquivos.get(anexo.idArquivo);
      if (!blob) throw new Error(`Arquivo ${anexo.idArquivo} não está disponível na demo.`);
      return { blob, contentType: blob.type || null };
    };
  }

  createRenderRoot(): LitElement {
    return this;
  }

  protected firstUpdated(): void {
    this.elNomeProposicao.style.display = 'none';
    this.elLexmlEta.setUsuario(new Usuario(this.nomeUsuario));
  }

  // URLs simuladas pelo backend da demo (demo/server), servido pelo web-dev-server.
  private configurarNovaProposicao(): void {
    if (!this.elNovaProposicao) return;
    this.elNovaProposicao.config = {
      casaLegislativaEditor: this.casa,
      urlVerificacaoProposicao: '/demo-api/proposicoes/{sigla}/{numero}/{ano}',
      urlTextoEstruturado: '/demo-api/proposicoes/{sigla}/{numero}/{ano}/texto',
      urlComissoes: '/demo-api/comissoes/{casa}',
    };
  }

  private getElement(selector: string): any {
    return document.querySelector(selector);
  }

  private atualizarProposicaoCorrente(projetoNorma: any): void {
    const { sigla, numero, ano } = this.getSiglaNumeroAnoFromUrn(projetoNorma?.value?.metadado?.identificacao?.urn);
    this.proposicaoCorrente.sigla = sigla;
    this.proposicaoCorrente.numero = numero;
    this.proposicaoCorrente.ano = ano;
    this.elNomeProposicao.style.display = 'block';
  }

  private atualizarSelects(projetoNorma: any): void {
    const { sigla, numero, ano } = this.getSiglaNumeroAnoFromUrn(projetoNorma?.value?.metadado?.identificacao?.urn);

    const key = `${sigla.toLowerCase()}_${numero}_${ano}`;
    const el = this.getElement(`option[value="${key}"]`);
    if (el) {
      el.selected = true;
    }
  }

  onChangeDocumento(): void {
    // this.getElement('#optEdicao').disabled = true;
    // if (this.elDocumento.value === 'novo') {
    //   this.getElement('#optEdicao').disabled = false;
    //   this.getElement('#optEdicao').selected = true;
    // } else {
    //   this.getElement('#optEdicao').disabled = false;
    // }
  }

  limparTela(): void {
    this.projetoNorma = {};
    this.elLexmlEta.fecharDocumento();

    this.proposicaoCorrente.sigla = '';
    this.proposicaoCorrente.numero = '';
    this.proposicaoCorrente.ano = '';
    this.elNomeProposicao.style.display = 'none';
  }

  executar(): void {
    if (!this.elDocumento.value) {
      this.limparTela();
      return;
    }

    this.getElement('#fileUpload').value = null;

    if (this.elDocumento) {
      setTimeout(() => {
        this.projetoNorma = this.elDocumento.value.indexOf('sem_texto') >= 0 ? null : { ...mapProjetosNormas[this.elDocumento.value] };

        if (this.elLexmlEta) {
          this.etaConfig.configuracaoPaginacao = mapConfiguracaoPaginacaoDispositivos[this.elDocumento.value];

          if (this.projetoNorma && Object.keys(this.projetoNorma).length > 0) {
            this.elLexmlEta.abrirDocumentoArticulado(this.projetoNorma).catch(erro => window.alert((erro as Error).message || 'Não foi possível iniciar o documento.'));
            this.atualizarProposicaoCorrente(this.projetoNorma);
          } else {
            this.novaProposicaoPadrao();
          }
        } else {
          this.atualizarProposicaoCorrente(this.projetoNorma);
        }
      }, 0);
    }
  }

  private getUrnNovaProposicao(): string {
    const autoridade = this.casa === 'SF' ? 'senado.federal' : 'camara.deputados';
    return `urn:lex:br:${autoridade}:projeto.lei;pl:2026;999999`;
  }

  async novaProposicao(): Promise<void> {
    this.modalNovaProposicao = true;
    await this.updateComplete;
    this.configurarNovaProposicao();
  }

  private onNovaProposicaoConcluida(e: CustomEvent<ResultadoNovaProposicao>): void {
    const { urn, urnDocumentoReferenciado, epigrafe, preambulo, colegiadoDestino, texto, anexoParecer } = e.detail;
    // Os textos simulados da demo são do Senado: na CD, só a URN do modelo é trocada (o editor recusa documento da outra casa).
    this.modalNovaProposicao = false;
    this.getElement('#fileUpload').value = null;
    this.projetoNorma = {};
    this.elLexmlEta
      .novaProposicao({
        urn,
        urnDocumentoReferenciado,
        epigrafe,
        preambulo,
        colegiadoApreciador: { ...colegiadoDestino, siglaCasaLegislativa: this.casa },
        documentoModelo: this.casa === 'CD' && texto ? derivarParaCamara(texto) : texto,
        anexoParecer,
      })
      .catch(erro => window.alert((erro as Error).message || 'Não foi possível criar a proposição.'));
    this.atualizarProposicaoCorrente({ value: { metadado: { identificacao: { urn } } } });
  }

  private novaProposicaoPadrao(): void {
    const urn = this.getUrnNovaProposicao();
    this.getElement('#fileUpload').value = null;
    this.projetoNorma = {};
    this.elLexmlEta
      .novaProposicao({ urn, epigrafe: 'PROJETO DE LEI Nº , DE 2026', preambulo: getPreambuloPadrao(urn) ?? '' })
      .catch(erro => window.alert((erro as Error).message || 'Não foi possível criar a proposição.'));
    this.atualizarProposicaoCorrente({ value: { metadado: { identificacao: { urn } } } });
  }

  // A casa define o vocabulário do componente: o documento em edição é encerrado e a lista de documentos é refiltrada.
  onChangeCasa(event: Event): void {
    this.limparTela();
    this.casa = (event.target as HTMLSelectElement).value as 'SF' | 'CD';
    this.etaConfig.casaLegislativaEditor = this.casa;
    this.elLexmlEta.lexmlEtaConfig = this.etaConfig;
    this.configurarNovaProposicao();
    this.elDocumento.value = '';
  }

  async salvar(): Promise<void> {
    try {
      await salvarArquivoDocumentoArticulado(this.elLexmlEta.getDocumentoArticulado());
    } catch (erro) {
      window.alert((erro as Error).message || 'Não foi possível salvar o documento.');
    }
  }

  async abrir(): Promise<void> {
    try {
      const documento = await abrirArquivoDocumentoArticulado();
      if (documento) await this.carregarDocumentoArticulado(documento);
    } catch (erro) {
      window.alert((erro as Error).message || 'Não foi possível abrir o documento.');
    }
  }

  private async carregarDocumentoArticulado(documento: unknown): Promise<void> {
    await this.elLexmlEta.abrirDocumentoArticulado(documento);
    this.modo = 'edicao';
    this.projetoNorma = documento;
    this.atualizarProposicaoCorrente(this.projetoNorma);
    this.atualizarSelects(this.projetoNorma);
    this.elLexmlEta.style.display = 'block';
    this.onChangeDocumento();
  }

  usuario(): void {
    // createUsuarioRevisaoDialog(rootStore);
    const nome = prompt('Nome do usuário', this.nomeUsuario ?? '');
    if (nome !== null) {
      this.nomeUsuario = nome;
      this.elLexmlEta.setUsuario(new Usuario(nome));
    }
  }

  comparar(): void {
    const selecionaArquivoComparar = document.getElementById('compararFileUpload');
    if (selecionaArquivoComparar !== null) {
      selecionaArquivoComparar.click();
    }
  }

  selecionaArquivoComparar(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files) {
      const fReader = new FileReader();
      fReader.readAsText(fileInput.files[0]);
      fReader.onloadend = async (e): Promise<void> => {
        if (e.target?.result) {
          const projetoNormaBase = this.elDocumento.value.indexOf('sem_texto') >= 0 ? null : { ...mapProjetosNormas[this.elDocumento.value] };

          const proposicao = JSON.parse(e.target.result as string);
          const projetoNormaArquivo = proposicao;

          console.log('projetoNormaBase', projetoNormaBase);
          console.log('projetoNormaArquivo', projetoNormaArquivo);

          const erros = [];
          validarRecursivo(erros, projetoNormaBase, projetoNormaArquivo, 'raiz');
          console.log('erros', erros);
        }
      };
    }
  }

  async selecionaArquivo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;
    try {
      await this.carregarDocumentoArticulado(await lerArquivoDocumentoArticulado(arquivo));
    } catch (erro) {
      window.alert((erro as Error).message || 'Não foi possível abrir o documento.');
    } finally {
      input.value = '';
    }
  }

  private async getProjetoNormaJsonix(sigla: string, numero: string, ano: string): Promise<any> {
    const key = `${sigla.toLowerCase()}_${numero}_${ano}`;
    const aux = mapProjetosNormas[key] || mapProjetosNormas[`_${key}`];
    if (aux) {
      return Promise.resolve({ ...aux });
    }
    const res = await fetch(`https://www3.congressonacional.leg.br/editor-emendas/api/proposicao/texto-json?sigla=${sigla}&numero=${numero}&ano=${ano}`);
    return await res.json();
  }

  private getSiglaNumeroAnoFromUrn(urn: string): any {
    if (!urn) {
      return {
        sigla: '',
        numero: '',
        ano: '',
      };
    }

    return {
      sigla: getSigla(urn) || 'MPV',
      numero: getNumero(urn),
      ano: getAno(urn),
    };
  }

  render(): TemplateResult {
    return html`
      <style>
        body {
          font-family: var(--sl-font-sans);
          font-size: var(--sl-font-size-medium);
          font-weight: var(--sl-font-weight-semibold);
          /* color: var(--sl-color-neutral-600); */
        }
        .lexml-eta-main-header {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          flex-wrap: wrap;
        }
        .lexml-eta-main-header--selecao select,
        .lexml-eta-main-header--selecao button {
          height: 1.5rem;
        }
        .lexml-eta-main-header span {
          vertical-align: middle;
          font-family: var(--sl-font-sans);
          font-size: 1.2rem;
          font-weight: bold;
        }
        .lexml-eta-btn--demo {
          text-align: center;
          color: white;
          border-radius: 8px;
          background: red;
          width: 4rem;
          height: 1.5rem;
        }
        lexml-eta {
          display: block;
          outline: 0;
          border: 0;
          -webkit-box-shadow: none;
          box-shadow: none;
          height: calc(100vh - 100px);
        }

        .nome-proposicao {
          font-family: var(--sl-font-sans);
          font-weight: bold;
          background-color: #ccc;
          /* color: black; */
          padding: 5px 10px;
          border-radius: 2px;
          margin-bottom: 2px;
        }
      </style>
      <div class="lexml-eta-main-header">
        <div class="lexml-eta-main-header--title">
          <span>ETA - Editor de Textos Articulados </span>
          <input type="button" class="lexml-eta-btn--demo" title="Aplicação exemplo" value="Demo" />
        </div>
        <div class="lexml-eta-main-header--actions">
          <select id="casaEditor" title="Casa legislativa do editor" .value=${this.casa} @change=${this.onChangeCasa}>
            <option value="SF">SF</option>
            <option value="CD">CD</option>
          </select>
          <input type="button" value="Nova proposição" @click=${this.novaProposicao} />
          <input type="button" value="Salvar" @click=${this.salvar} />
          <input type="button" value="Resetar" @click=${this.limparTela} />
          <input type="button" value="Abrir" @click=${this.abrir} />
          <input type="button" value="Usuário" @click=${this.usuario} />
          <input type="button" value="Comparar" @click=${this.comparar} />
          <input type="file" id="compararFileUpload" accept="application/json" @change="${this.selecionaArquivoComparar}" style="display: none" />
          <input type="file" id="fileUpload" accept="application/json" @change="${this.selecionaArquivo}" style="display: none" />
        </div>

        <div class="lexml-eta-main-header--selecao">
          <select id="projetoNorma" @change=${this.onChangeDocumento}>
            <option value="" selected>Selecione um documento</option>
            ${opcoesDocumentos.filter(o => documentoDaCasa(o.chave)).map(o => html`<option value="${o.chave}">${o.rotulo}</option>`)}
          </select>
          <input type="button" value="Ok" @click=${this.executar} />
        </div>
      </div>
      <div class="nome-proposicao">${this.proposicaoCorrente.sigla ? `${this.proposicaoCorrente.sigla} ${this.proposicaoCorrente.numero}/${this.proposicaoCorrente.ano}` : ''}</div>
      <lexml-eta .lexmlEtaConfig=${this.etaConfig} modo=${this.modo} @onrevisao=${this.onRevisao}></lexml-eta>
      ${this.modalNovaProposicao
        ? html`<sl-dialog
            id="dialogNovaProposicao"
            open
            label="Nova proposição"
            style="--width: 46rem"
            no-header
            @sl-hide=${(e: Event): void => {
              if (e.target === e.currentTarget) this.modalNovaProposicao = false;
            }}
          >
            <lexml-nova-proposicao
              @nova-proposicao-concluida=${this.onNovaProposicaoConcluida}
              @nova-proposicao-cancelada=${(): void => {
                this.modalNovaProposicao = false;
              }}
            ></lexml-nova-proposicao>
          </sl-dialog>`
        : ''}
    `;
  }

  private onRevisao(e: CustomEvent): void {
    if (e.detail.emRevisao) {
      console.log('Revisão ativada');
      !this.nomeUsuario && this.usuario();
    } else {
      console.log('Revisão desativada');
    }
  }
}
