import { html, LitElement, TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import '../../src';
import { LexmlEmendaComponent, LexmlEmendaParametrosEdicao } from '../../src/components/lexml-emenda.component';
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
import { ComandoEmendaComponent } from './../../src/components/comandoEmenda/comandoEmenda.component';
import { getAno, getNumero, getSigla } from './../../src/model/lexml/documento/urnUtil';
import { Usuario } from '../../src/model/revisao/usuario';

const mapProjetosNormas = {
  novo: {},
  mpv_885_2019: MPV_885_2019,
  mpv_905_2019: MPV_905_2019,
  mpv_930_2020: MPV_930_2020,
  mpv_1078_2021: MPV_1078_2021,
  mpv_1089_2021: MPV_1089_2021,
  mpv_1100_2022: MPV_1100_2022,
  mpv_1160_2023: MPV_1160_2023,
  codcivil_completo: COD_CIVIL_COMPLETO,
  codcivil_parcial1: COD_CIVIL_PARCIAL1,
  codcivil_parcial2: COD_CIVIL_PARCIAL2,
  plc_artigos_agrupados: PLC_ARTIGOS_AGRUPADOS,
};

@customElement('demo-view')
export class DemoView extends LitElement {
  @query('.nome-proposicao')
  private elNomeProposicao!: HTMLDivElement;

  @query('#projetoNorma')
  private elDocumento!: HTMLSelectElement;

  @query('lexml-emenda')
  private elLexmlEmenda!: LexmlEmendaComponent;

  @query('lexml-emenda-comando')
  private elLexmlEmendaComando!: ComandoEmendaComponent;

  @state() modo = '';
  @state() projetoNorma: any = {};
  @state() proposicaoCorrente = new RefProposicaoEmendada();

  private nomeUsuario?: string = 'Fulano';

  constructor() {
    super();
  }

  createRenderRoot(): LitElement {
    return this;
  }

  protected firstUpdated(): void {
    this.elNomeProposicao.style.display = 'none';
    this.elLexmlEmenda.setUsuario(new Usuario(this.nomeUsuario));
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
    let el = this.getElement(`option[value="${key}"]`);
    el ? (el.selected = true) : undefined;

    el = this.getElement('#optEmenda');
    el.disabled = false;
    el.selected = true;
  }

  onChangeDocumento(): void {
    if (this.elDocumento.value === 'novo') {
      this.getElement('#optEmenda').disabled = true;
      this.getElement('#optEmendaArtigoOndeCouber').disabled = true;
      this.getElement('#optEdicao').selected = true;
    } else {
      this.getElement('#optEmenda').disabled = false;
      this.getElement('#optEmendaArtigoOndeCouber').disabled = false;
    }
  }

  limparTela(): void {
    this.elLexmlEmenda.style.display = 'none';
    this.elLexmlEmendaComando.style.display = 'none';
    this.projetoNorma = {};

    const params = new LexmlEmendaParametrosEdicao();
    params.modo = this.modo;
    params.projetoNorma = this.projetoNorma;
    this.elLexmlEmenda.inicializarEdicao(params);

    this.proposicaoCorrente.sigla = '';
    this.proposicaoCorrente.numero = '';
    this.proposicaoCorrente.ano = '';
    this.elNomeProposicao.style.display = 'none';
  }

  executar(): void {
    const elmAcao = this.getElement('#modo');

    if (!this.elDocumento.value) {
      this.limparTela();
      return;
    }

    this.getElement('#fileUpload').value = null;

    if (this.elDocumento && elmAcao) {
      this.modo = elmAcao.value;
      setTimeout(() => {
        this.projetoNorma = { ...mapProjetosNormas[this.elDocumento.value] };

        if (this.elLexmlEmenda) {
          const params = new LexmlEmendaParametrosEdicao();
          params.modo = this.modo;
          params.projetoNorma = this.projetoNorma;
          params.motivo = 'Motivo da emenda de texto livre';
          this.elLexmlEmenda.inicializarEdicao(params);

          this.atualizarProposicaoCorrente(this.projetoNorma);
          this.elLexmlEmenda.style.display = 'block';
        } else {
          this.atualizarProposicaoCorrente(this.projetoNorma);
        }
      }, 0);
    }
  }

  salvar(): void {
    const projetoNorma = this.projetoNorma;
    const emenda = this.elLexmlEmenda.getEmenda();
    const emendaJson = JSON.stringify(emenda, null, '\t');
    const blob = new Blob([emendaJson], { type: 'application/json' });
    const fileName = `${projetoNorma?.value?.projetoNorma?.norma?.parteInicial?.epigrafe?.content[0]}.json`;
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
      this.elLexmlEmenda.setUsuario(new Usuario(nome));
    }
  }

  selecionaArquivo(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files) {
      const fReader = new FileReader();
      fReader.readAsText(fileInput.files[0]);
      fReader.onloadend = async (e): Promise<void> => {
        if (e.target?.result) {
          const result = JSON.parse(e.target.result as string);
          const emenda = 'emenda' in result ? result.emenda : result;
          this.modo = emenda.modoEdicao;
          this.projetoNorma = await this.getProjetoNormaJsonixFromEmenda(emenda);

          const params = new LexmlEmendaParametrosEdicao();
          params.modo = this.modo;
          params.projetoNorma = this.projetoNorma;
          params.emenda = emenda;
          this.elLexmlEmenda.inicializarEdicao(params);

          this.atualizarProposicaoCorrente(this.projetoNorma);
          this.atualizarSelects(this.projetoNorma);
          this.elLexmlEmendaComando.emenda = emenda.comandoEmenda;
          this.elLexmlEmendaComando.style.display = 'block';
          // this.getElement('.wrapper').style['grid-template-columns'] = '2fr 1fr';
          this.elLexmlEmenda.style.display = 'block';
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
    const aux = mapProjetosNormas[`${sigla.toLowerCase()}_${numero}_${ano}`];
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
        lexml-emenda {
          display: none;
          outline: 0;
          border: 0;
          -webkit-box-shadow: 0px;
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
          <input type="file" id="fileUpload" accept="application/json" @change="${this.selecionaArquivo}" style="display: none" />
        </div>

        <div class="lexml-eta-main-header--selecao">
          <select id="projetoNorma" @change=${this.onChangeDocumento}>
            <option value=""></option>
            <option value="novo">Nova articulação</option>
            <option value="mpv_885_2019">MP 885, de 2019</option>
            <option value="mpv_905_2019" selected>MP 905, de 2019</option>
            <option value="mpv_930_2020">MP 930, de 2020</option>
            <option value="mpv_1078_2021">MP 1078, de 2021</option>
            <option value="mpv_1089_2021">MP 1089, de 2021</option>
            <option value="mpv_1100_2022">MP 1100, de 2022</option>
            <option value="mpv_1160_2023">MP 1160, de 2022</option>
            <option value="codcivil_completo">Código Civil Completo</option>
            <option value="codcivil_parcial1">Código Civil (arts. 1 a 1023)</option>
            <option value="codcivil_parcial2">Código Civil (arts. 1 a 388)</option>
            <option value="plc_artigos_agrupados">PLC artigos agrupados</option>
          </select>
          <select id="modo">
            <option value="edicao" id="optEdicao">Edição</option>
            <option value="emenda" id="optEmenda" selected>Emenda</option>
            <option value="emendaArtigoOndeCouber" id="optEmendaArtigoOndeCouber">Emenda: propor artigo onde couber</option>
            <option value="emendaTextoLivre" id="optemendaTextoLivre">Emenda Texto Livre</option>
          </select>
          <input type="button" value="Ok" @click=${this.executar} />
        </div>
      </div>
      <div class="nome-proposicao">${this.proposicaoCorrente.sigla ? `${this.proposicaoCorrente.sigla} ${this.proposicaoCorrente.numero}/${this.proposicaoCorrente.ano}` : ''}</div>
      <lexml-emenda modo=${this.modo} @onrevisao=${this.onRevisao} @onchange=${() => console.log('chegou evento')}></lexml-emenda>
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
