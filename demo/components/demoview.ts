import { PL_5008_2023 } from '../doc/pl_5008_2023';
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { LexmlEtaConfig, LexmlEtaComponent, LexmlEtaParametrosEdicao, Usuario } from '../../src';
import { RefProposicaoEmendada } from '../../src/model/emenda/emenda';
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
import { getAno, getNumero, getSigla } from '../../src/model/lexml/documento/urnUtil';
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

const mapDispositivosBloqueados = {
  _mpv_905_2019: [
    'art1',
    'art2_par1',
    'art2_par3',
    {
      lexmlId: 'art3',
      bloquearFilhos: false,
    },
    'art4_par1u',
    {
      lexmlId: 'art5',
      bloquearFilhos: false,
    },
  ],
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

  @state() modo = 'edicao';
  @state() projetoNorma: any = {};
  @state() proposicaoCorrente = new RefProposicaoEmendada();

  private nomeUsuario?: string = 'Fulano';
  emendaConfig: LexmlEtaConfig;

  constructor() {
    super();
    this.emendaConfig = new LexmlEtaConfig();
    this.emendaConfig.urlConsultaParlamentares = '/parlamentares';
    this.emendaConfig.urlComissoes = '/comissoes';
  }

  createRenderRoot(): LitElement {
    return this;
  }

  protected firstUpdated(): void {
    this.elNomeProposicao.style.display = 'none';
    this.elLexmlEta.setUsuario(new Usuario(this.nomeUsuario));
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
    el ? (el.selected = true) : undefined;
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
    this.elLexmlEta.style.display = 'none';
    this.projetoNorma = {};

    const params = new LexmlEtaParametrosEdicao();
    params.projetoNorma = this.projetoNorma;
    this.elLexmlEta.inicializarEdicao(params);

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
          const params = new LexmlEtaParametrosEdicao();
          params.configuracaoPaginacao = mapConfiguracaoPaginacaoDispositivos[this.elDocumento.value];
          params.dispositivosBloqueados = mapDispositivosBloqueados[this.elDocumento.value];

          if (this.projetoNorma && Object.keys(this.projetoNorma).length > 0) {
            params.projetoNorma = this.projetoNorma;
            //params.autoriaPadrao = { identificacao: '6335', siglaCasaLegislativa: 'SF' };
            //params.opcoesImpressaoPadrao = { imprimirBrasao: true, textoCabecalho: 'Texto Teste Dennys', tamanhoFonte: 14 };
            console.log('projetoNormaArquivo', params.projetoNorma);
          } else {
            params.sigla = 'PL';
            params.numero = '1';
            params.ano = new Date().getFullYear().toString();
          }
          // params.casaLegislativa = 'SF';
          this.elLexmlEta.inicializarEdicao(params);

          this.atualizarProposicaoCorrente(this.projetoNorma);
          this.elLexmlEta.style.display = 'block';
        } else {
          this.atualizarProposicaoCorrente(this.projetoNorma);
        }
      }, 0);
    }
  }

  salvar(): void {
    const proposicao = this.elLexmlEta.getProposicao();
    const proposicaoJson = JSON.stringify(proposicao, null, '\t');
    const blob = new Blob([proposicaoJson], { type: 'application/json' });
    const fileName = `${this.modo} - ${proposicao.sigla} nº ${proposicao.numero}, de ${proposicao.ano}.json`;
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
  }

  abrir(): void {
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload !== null) {
      fileUpload.click();
    }
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
          const projetoNormaArquivo = proposicao.projetoNorma;

          console.log('projetoNormaBase', projetoNormaBase);
          console.log('projetoNormaArquivo', projetoNormaArquivo);

          const erros = [];
          validarRecursivo(erros, projetoNormaBase, projetoNormaArquivo, 'raiz');
          console.log('erros', erros);
        }
      };
    }
  }

  selecionaArquivo(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files) {
      const fReader = new FileReader();
      fReader.readAsText(fileInput.files[0]);
      fReader.onloadend = async (e): Promise<void> => {
        if (e.target?.result) {
          this.modo = 'edicao';
          const proposicao = JSON.parse(e.target.result as string);
          this.projetoNorma = proposicao.projetoNorma;

          console.log('projetoNormaArquivo', this.projetoNorma);

          const params = new LexmlEtaParametrosEdicao();
          params.projetoNorma = this.projetoNorma;
          params.proposicao = proposicao;
          this.elLexmlEta.inicializarEdicao(params);

          this.atualizarProposicaoCorrente(this.projetoNorma);
          this.atualizarSelects(this.projetoNorma);
          // this.getElement('.wrapper').style['grid-template-columns'] = '2fr 1fr';
          this.elLexmlEta.style.display = 'block';

          this.onChangeDocumento();
        }
      };
    }
  }

  private async getProjetoNormaJsonixFromEmenda(emenda: any): Promise<any> {
    let { sigla, numero, ano } = emenda.proposicao;
    if (!sigla || !numero || !ano) {
      ({ sigla, numero, ano } = this.getSiglaNumeroAnoFromUrn(emenda.proposicao.urn));
    }
    return this.getProjetoNormaJsonix(sigla, numero, ano);
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
          display: none;
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
          <input type="button" value="Salvar" @click=${this.salvar} />
          <input type="button" value="Abrir" @click=${this.abrir} />
          <input type="button" value="Usuário" @click=${this.usuario} />
          <input type="button" value="Comparar" @click=${this.comparar} />
          <input type="file" id="compararFileUpload" accept="application/json" @change="${this.selecionaArquivoComparar}" style="display: none" />
          <input type="file" id="fileUpload" accept="application/json" @change="${this.selecionaArquivo}" style="display: none" />
        </div>

        <div class="lexml-eta-main-header--selecao">
          <select id="projetoNorma" @change=${this.onChangeDocumento}>
            <option value="novo" selected>Nova articulação</option>
            ${Object.keys(mapProjetosNormas)
              .filter(k => !k.startsWith('_'))
              .map(k => html`<option value="${k}">${k.toUpperCase().replace(/_/, ' ').replace(/_/, ', de ')}</option>`)}
            <option value="_codcivil_completo">Código Civil Completo</option>
            <option value="_codcivil_parcial1">Código Civil (arts. 1 a 1023)</option>
            <option value="_codcivil_parcial2">Código Civil (arts. 1 a 388)</option>
            <option value="_plc_artigos_agrupados">PL (testes unitários de cmd)</option>
            <option value="_pl_agrupadores">PL Agrupadores (Simulaçao de cmd para testes)</option>
            <option value="_sem_texto">PL 3/2023 (sem texto LexML)</option>
            <option value="_plp_68_2024">PLP 68, de 2024 (completo)</option>
            <option value="_mpv_905_2019">MPV 905, de 2019 (com dispositivos bloqueados)</option>
            <option value="_pl_4_2025">PL 4, de 2025</option>
          </select>
          <input type="button" value="Ok" @click=${this.executar} />
        </div>
      </div>
      <div class="nome-proposicao">${this.proposicaoCorrente.sigla ? `${this.proposicaoCorrente.sigla} ${this.proposicaoCorrente.numero}/${this.proposicaoCorrente.ano}` : ''}</div>
      <lexml-eta .lexmlEmendaConfig=${this.emendaConfig} modo=${this.modo} @onrevisao=${this.onRevisao}></lexml-eta>
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
