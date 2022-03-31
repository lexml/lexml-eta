import { customElement, LitElement, property } from 'lit-element';
import { html, TemplateResult } from 'lit-html';

import { MPV_ALTERACAO } from '../doc/mpv_alteracao';
import { MPV_SIMPLES } from '../doc/mpv_simples';
import { MPV_930_2020 } from '../doc/mpv_930_2020';
import { COD_CIVIL_COMPLETO } from '../doc/codigocivil_completo';
import { COD_CIVIL_PARCIAL1 } from '../doc/codigocivil_parcial1';
import { COD_CIVIL_PARCIAL2 } from '../doc/codigocivil_parcial2';
import { PLC_ARTIGOS_AGRUPADOS } from '../doc/plc_artigos_agrupados';
import { EMENDA_MPV_00930_2020 } from '../doc/emenda_exemplo_mpv_00930_2020';

const mapProjetosNormas = {
  novo: {},
  mpv_alteracao: MPV_ALTERACAO,
  mpv_simples: MPV_SIMPLES,
  mpv_930_2020: MPV_930_2020,
  codcivil_completo: COD_CIVIL_COMPLETO,
  codcivil_parcial1: COD_CIVIL_PARCIAL1,
  codcivil_parcial2: COD_CIVIL_PARCIAL2,
  plc_artigos_agrupados: PLC_ARTIGOS_AGRUPADOS,
};

const mapEmendas = {
  mpv_930_2020: EMENDA_MPV_00930_2020,
};

@customElement('demo-view')
export class DemoView extends LitElement {
  @property({ type: String }) modo = '';
  @property({ type: String }) projetoNorma = '';
  @property({ type: Object }) emenda = {};
  @property({ type: Object }) arquivoProjetoNorma = {};

  constructor() {
    super();
  }

  createRenderRoot(): LitElement {
    return this;
  }

  private getElement(selector: string): any {
    return document.querySelector(selector);
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
    this.getElement('lexml-emenda-comando').emenda = {};
    this.getElement('#fileUpload').value = null;

    if (elmDocumento && elmAcao) {
      setTimeout(() => {
        this.projetoNorma = elmDocumento.value;
        this.modo = elmAcao.value;
        this.emenda = {};
        this.arquivoProjetoNorma = {};
      }, 0);
    }
  }

  onChange(e: CustomEvent): void {
    console.log('EVENTO', e.detail.origemEvento || '*', e.detail);

    if (this.modo.startsWith('emenda')) {
      const emenda = this.getElement('lexml-eta').getComandoEmenda();
      this.getElement('lexml-emenda-comando').emenda = emenda;

      // console.log('Emenda ---------------------');
      // console.log(this.getElement('lexml-eta').getEmenda());
    }
  }

  salvar(): void {
    const projetoNorma = mapProjetosNormas[this.projetoNorma];
    const emenda = this.getElement('lexml-eta').getEmenda();
    const emendaJson = JSON.stringify({
      projetoNorma: projetoNorma,
      emenda: emenda,
    });
    const blob = new Blob([emendaJson], {
      type: 'application/json',
    });
    const fileName = `${this.projetoNorma}.json`;
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
      const fReader = new FileReader();
      fReader.readAsText(fileInput.files[0]);
      fReader.onloadend = e => {
        if (e.target?.result) {
          const result = JSON.parse(e.target.result as string);
          this.modo = result.emenda.classificacao;
          this.arquivoProjetoNorma = result.projetoNorma;
          this.emenda = result.emenda;
          this.projetoNorma = '';
        }
      };
    }
  }

  onClickAutoria(e: EventTarget): void {
    console.log(11111, 'Exibir formulário de autoria', e);
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

        lexml-eta {
          display: block;
          height: calc(100vh - 80px);
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
          <input type="button" value="Abrir" @click=${this.abrir}></input>
          <input
              type="file"
              id="fileUpload"
              accept="application/json"
              @change="${this.selecionaArquivo}"
              style="display: none"
          />
          <input type="button" class="lexml-eta-btn--autoria" title="Autores" value="Autoria" @click=${this.onClickAutoria} />
        </div>

        <div class="lexml-eta-main-header--selecao">
          <select id="projetoNorma" @change=${this.onChangeDocumento}>
            <option value="novo">Nova articulação</option>
            <option value="mpv_alteracao">MP 885, de 2019</option>
            <option value="mpv_simples" selected>MP 905, de 2019</option>
            <option value="mpv_930_2020">MP 930, de 2020</option>
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
        <div>
          <lexml-eta
            id="lexmlEta"
            @onchange=${this.onChange}
            modo=${this.modo}
            .projetoNorma=${Object.keys(this.arquivoProjetoNorma).length !== 0 ? this.arquivoProjetoNorma : mapProjetosNormas[this.projetoNorma]}
            .emenda=${this.projetoNorma === 'mpv_930_2020' ? mapEmendas[this.projetoNorma].emenda : this.emenda}
          >
          </lexml-eta>
        </div>
        <div id="comandoEmenda">
          <lexml-emenda-comando></lexml-emenda-comando>
        </div>
      </div>
    `;
  }
}
