import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { connect } from 'pwa-helpers';
import { rootStore } from '../redux/store';

import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab/tab';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import { Autoria, Parlamentar, Emenda, ModoEdicaoEmenda } from '../model/emenda/emenda';
import { getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';

@customElement('lexml-emenda')
export class LexmlEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Object }) projetoNorma = {};

  @state()
  autoria = new Autoria();
  @state()
  parlamentares: Parlamentar[] = [];

  @query('lexml-eta')
  _lexmlEta;
  @query('lexml-emenda-justificativa')
  _lexmlJustificativa;
  @query('lexml-autoria')
  _lexmlAutoria;
  @query('lexml-data')
  _lexmlData;

  async getParlamentares(): Promise<Parlamentar[]> {
    const _parlamentares = await (await fetch('https://emendas-api.herokuapp.com/parlamentares')).json();
    return _parlamentares.map(p => ({
      identificacao: p.id,
      nome: p.nome,
      sexo: p.sexo,
      siglaPartido: p.siglaPartido,
      siglaUF: p.siglaUF,
      siglaCasaLegislativa: p.siglaCasa,
    }));
  }

  getEmenda(): Emenda {
    const emenda = new Emenda();
    emenda.modoEdicao = this.modo as any as ModoEdicaoEmenda;
    emenda.proposicao.urn = getUrn(this.projetoNorma);
    emenda.componentes[0].urn = emenda.proposicao.urn;
    emenda.componentes[0].dispositivos = this._lexmlEta.getDispositivosEmenda();
    emenda.comandoEmenda = this._lexmlEta.getComandoEmenda();
    emenda.justificativa = this._lexmlJustificativa.texto;
    emenda.autoria = this._lexmlAutoria.getAutoriaAtualizada();
    emenda.data = this._lexmlData.data;
    return emenda;
  }

  setEmenda(emenda: Emenda): void {
    this.modo = emenda.modoEdicao;
    this._lexmlEta.dispositivosEmenda = emenda.componentes[0].dispositivos;
    this.autoria = emenda.autoria;
    this._lexmlJustificativa.setContent(emenda.justificativa);
    this._lexmlData.data = emenda.data;
  }

  constructor() {
    super();
    this.getParlamentares().then(parlamentares => (this.parlamentares = parlamentares));
  }

  createRenderRoot(): LitElement {
    return this;
  }

  updated(): void {
    let alturaElemento = this.pesquisarAlturaParentElement(this);
    // altura dos tabs
    const lexmlEtaTabs = document.querySelector('sl-tab-group')?.shadowRoot?.querySelector('.tab-group__nav-container');
    const alturaLexmlEtaTabs = lexmlEtaTabs?.scrollHeight;
    if (alturaLexmlEtaTabs) {
      alturaElemento = alturaElemento - alturaLexmlEtaTabs - 2;
      if (alturaElemento > 0) {
        this?.style.setProperty('--height', alturaElemento + 'px');
        this?.style.setProperty('--overflow', 'hidden');
      }
    }
  }

  private pesquisarAlturaParentElement(elemento): number {
    if (elemento.parentElement === null) {
      // chegou no HTML e não encontrou altura
      return 0;
    } else {
      const minHeight = getComputedStyle(this).getPropertyValue('--min-height').replace('px', '');
      if (elemento.scrollHeight >= minHeight) {
        console.log('h:', elemento.scrollHeight, 'encontrada no elemento:', elemento.localName, elemento.className);
        return elemento.scrollHeight;
      } else {
        return this.pesquisarAlturaParentElement(elemento.parentElement);
      }
    }
  }

  render(): TemplateResult {
    return html`
      ${shoelaceLightThemeStyles}
      <style>
        :root {
          --height: 100%;
          --overflow: visible;
          --min-height: 300px;
        }
        lexml-emenda {
        }
        lexml-eta {
        }
        sl-tab-panel {
          --padding: 0px;
        }
        sl-tab-panel::part(base) {
          height: var(--height);
          overflow: var(--overflow);
          overflow-y: auto;
        }
        .badge-pulse {
          margin-left: 5px;
        }
        sl-alert {
          --box-shadow: var(--sl-shadow-x-large);
          margin: 20px;
        }
      </style>

      <sl-tab-group>
        <sl-tab slot="nav" panel="lexml-eta">Texto</sl-tab>
        <sl-tab slot="nav" panel="justificativa">Justificativa</sl-tab>
        <sl-tab slot="nav" panel="autoria">Data e Autoria</sl-tab>
        <sl-tab slot="nav" panel="avisos">
          Avisos
          <div class="badge-pulse">
            <sl-badge variant="danger" pill pulse>4</sl-badge>
          </div>
        </sl-tab>
        <sl-tab-panel name="lexml-eta">
          <lexml-eta id="lexmlEta" modo=${this.modo} .projetoNorma=${this.projetoNorma}></lexml-eta>
        </sl-tab-panel>
        <sl-tab-panel name="justificativa">
          <lexml-emenda-justificativa></lexml-emenda-justificativa>
        </sl-tab-panel>
        <sl-tab-panel name="autoria">
          <lexml-data></lexml-data>
          <hr />
          <lexml-autoria .parlamentares=${this.parlamentares} .autoria=${this.autoria}></lexml-autoria>
        </sl-tab-panel>
        <sl-tab-panel name="avisos">
          <sl-alert variant="success" open closable class="alert-closable">
            <sl-icon slot="icon" name="check2-circle"></sl-icon>
            Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados
            antes de submetê-la.
          </sl-alert>
          <sl-alert variant="warning" open closable class="alert-closable">
            <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
            Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados
            antes de submetê-la.
          </sl-alert>
          <sl-alert variant="danger" open closable class="alert-closable">
            <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
            Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados
            antes de submetê-la.
          </sl-alert>
          <sl-alert variant="primary" open closable class="alert-closable">
            <sl-icon slot="icon" name="info-circle"></sl-icon>
            Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados
            antes de submetê-la.
          </sl-alert>
        </sl-tab-panel>
      </sl-tab-group>
    `;
  }
}
