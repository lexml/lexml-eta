import '../../src';

import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { COD_CIVIL_COMPLETO } from '../doc/codigocivil_completo';
import { COD_CIVIL_PARCIAL1 } from '../doc/codigocivil_parcial1';
import { COD_CIVIL_PARCIAL2 } from '../doc/codigocivil_parcial2';
import { MPV_1089_2021 } from '../doc/mpv_1089_2021';
import { MPV_930_2020 } from '../doc/mpv_930_2020';
import { MPV_ALTERACAO } from '../doc/mpv_alteracao';
import { MPV_SIMPLES } from '../doc/mpv_simples';
import { PLC_ARTIGOS_AGRUPADOS } from '../doc/plc_artigos_agrupados';
import { DispositivosEmenda } from './../../src/model/emenda/emenda';

import { Emenda } from '../../src/model/emenda/emenda';

const mapProjetosNormas = {
  novo: {},
  mpv_alteracao: MPV_ALTERACAO,
  mpv_simples: MPV_SIMPLES,
  mpv_930_2020: MPV_930_2020,
  mpv_1089_2021: MPV_1089_2021,
  codcivil_completo: COD_CIVIL_COMPLETO,
  codcivil_parcial1: COD_CIVIL_PARCIAL1,
  codcivil_parcial2: COD_CIVIL_PARCIAL2,
  plc_artigos_agrupados: PLC_ARTIGOS_AGRUPADOS,
};

@customElement('demo-view')
export class DemoView extends LitElement {
  @property({ type: String }) modo = '';
  @property({ type: String }) projetoNorma = '';
  @property({ type: Object }) emenda: any = {};
  @property({ type: Object }) arquivoProjetoNorma = {};

  dispositivosEmenda?: DispositivosEmenda;

  constructor() {
    super();
  }

  createRenderRoot(): LitElement {
    return this;
  }

  private getElement(selector: string): any {
    return document.querySelector(selector);
  }

  private resetaEmenda(): void {
    const emenda = new Emenda();
    this.getElement('lexml-emenda').setEmenda(emenda);
    this.getElement('lexml-emenda-comando').emenda = {};
  }

  onChangeDocumento(): void {
    const elmDocumento = this.getElement('#projetoNorma');
    if (elmDocumento?.value === 'novo') {
      this.getElement('#emenda').disabled = true;
      this.getElement('#emendaArtigoOndeCouber').disabled = true;
      this.getElement('#edicao').selected = true;
    } else {
      this.getElement('#emenda').disabled = false;
      this.getElement('#emendaArtigoOndeCouber').disabled = false;
    }
  }

  executar(): void {
    const elmAcao = this.getElement('#modo');
    const elmDocumento = this.getElement('#projetoNorma');
    if (this.getElement('lexml-emenda').style.display) {
      this.resetaEmenda();
    }
    this.getElement('#fileUpload').value = null;

    if (elmDocumento && elmAcao) {
      setTimeout(() => {
        this.projetoNorma = elmDocumento.value;
        this.modo = elmAcao.value;
        this.emenda = {};
        this.arquivoProjetoNorma = {};
        this.dispositivosEmenda = {
          dispositivosSuprimidos: [],
          dispositivosModificados: [],
          dispositivosAdicionados: [],
        };
        document.querySelector('lexml-emenda')!['style'].display = 'block';
      }, 0);
    }
  }

  onChange(e: CustomEvent): void {
    console.log('EVENTO', e.detail.origemEvento || '*', e.detail);

    if (this.modo.startsWith('emenda')) {
      const comandoEmenda = this.getElement('lexml-eta').getComandoEmenda();
      this.getElement('lexml-emenda-comando').emenda = comandoEmenda;
    }
  }

  salvar(): void {
    const projetoNorma = Object.keys(this.arquivoProjetoNorma).length !== 0 ? this.arquivoProjetoNorma : mapProjetosNormas[this.projetoNorma];
    const emenda = this.getElement('lexml-emenda').getEmenda();
    const emendaJson = JSON.stringify({
      projetoNorma: projetoNorma,
      emenda: emenda,
    });
    const blob = new Blob([emendaJson], {
      type: 'application/json',
    });
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

  selecionaArquivo(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files) {
      this.resetaEmenda();
      const fReader = new FileReader();
      fReader.readAsText(fileInput.files[0]);
      fReader.onloadend = (e): void => {
        if (e.target?.result) {
          const result = JSON.parse(e.target.result as string);
          this.getElement('lexml-emenda').setEmenda(result.emenda);
          this.arquivoProjetoNorma = result.projetoNorma;
          this.projetoNorma = result.projetoNorma?.value?.projetoNorma?.norma?.parteInicial?.epigrafe?.content[0] ?? '';
          this.getElement('lexml-emenda-comando').emenda = result.emenda.comandoEmenda;
          this.getElement('#comandoEmenda')!['style'].display = 'block';
          this.getElement('.wrapper').style['grid-template-columns'] = '2fr 1fr';
          document.querySelector('lexml-emenda')!['style'].display = 'block';
        }
      };
    }
  }

  getDispositivosEmenda(): DispositivosEmenda | undefined {
    // TODO - Atualizar mapEmendas com emendas no novo formato.
    // if (this.projetoNorma === 'mpv_930_2020') {
    //   return mapEmendas[this.projetoNorma].emenda.dispositivos;
    // } else
    return this.emenda?.dispositivos;
  }

  render(): TemplateResult {
    return html`
      <style>
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
          font-family: sans-serif;
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
        }

        /*
        Apesar do problema de performance mencionado em https://lit.dev/docs/components/styles/#styles-in-the-template
        as expressões abaixo foram mantidas por se tratar de um código para teste.
        */
        .wrapper {
          display: grid;
          grid-template-columns: ${this.modo.startsWith('emenda') ? '2fr 1fr' : '1fr 0'};
          border: 2px solid red;
          height: calc(100vh - 110px);
        }
        #comandoEmenda {
          display: ${this.modo.startsWith('emenda') ? 'block' : 'none'};
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
          <input type="file" id="fileUpload" accept="application/json" @change="${this.selecionaArquivo}" style="display: none" />
        </div>

        <div class="lexml-eta-main-header--selecao">
          <select id="projetoNorma" @change=${this.onChangeDocumento}>
            <option value="novo">Nova articulação</option>
            <option value="mpv_alteracao">MP 885, de 2019</option>
            <option value="mpv_simples" selected>MP 905, de 2019</option>
            <option value="mpv_930_2020">MP 930, de 2020</option>
            <option value="mpv_1089_2021">MP 1089, de 2021</option>
            <option value="codcivil_completo">Código Civil Completo</option>
            <option value="codcivil_parcial1">Código Civil (arts. 1 a 1023)</option>
            <option value="codcivil_parcial2">Código Civil (arts. 1 a 388)</option>
            <option value="plc_artigos_agrupados">PLC Artigos Agrupados</option>
          </select>
          <select id="modo">
            <option value="edicao" id="edicao">Edição</option>
            <option value="emenda" id="emenda" selected>Emenda</option>
            <option value="emendaArtigoOndeCouber" id="emendaArtigoOndeCouber">Emenda: propor artigo onde couber</option>
          </select>
          <input type="button" value="Ok" @click=${this.executar} />
        </div>
      </div>
      <div class="wrapper">
        <div class="emenda">
          <lexml-emenda
            @onchange=${this.onChange}
            modo=${this.modo}
            .projetoNorma=${Object.keys(this.arquivoProjetoNorma).length !== 0 ? this.arquivoProjetoNorma : mapProjetosNormas[this.projetoNorma]}
          >
          </lexml-emenda>
        </div>
        <div id="comandoEmenda">
          <lexml-emenda-comando></lexml-emenda-comando>
        </div>
      </div>
    `;
  }
}
