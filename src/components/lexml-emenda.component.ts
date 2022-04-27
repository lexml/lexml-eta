import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { connect } from 'pwa-helpers';
import { rootStore } from '../redux/store';

import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab/tab';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';

import { Autoria, Parlamentar, Emenda, TipoEmenda } from '../model/emenda/emenda';
import { getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';

@customElement('lexml-emenda')
export class LexmlEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) textoJustificativa = '';
  @property({ type: String }) modo = '';
  @property({ type: String }) projetoNorma = '';
  @property({ type: Object }) dispositivosEmenda = {};

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
    emenda.tipo = this.modo as any as TipoEmenda;
    emenda.proposicao.urn = getUrn(this.projetoNorma);
    emenda.dispositivos = this._lexmlEta.getDispositivosEmenda();
    emenda.comandoEmenda = this._lexmlEta.getComandoEmenda();
    emenda.justificativa = this._lexmlJustificativa.texto;
    emenda.autoria = this._lexmlAutoria.getAutoriaAtualizada();
    emenda.data = this._lexmlData.data;
    return emenda;
  }

  constructor() {
    super();
    this.getParlamentares().then(parlamentares => (this.parlamentares = parlamentares));
  }

  createRenderRoot(): LitElement {
    return this;
  }

  render(): TemplateResult {
    return html`
      ${shoelaceLightThemeStyles}
      <style>
        lexml-emenda {
          display: none;
          height: 100%;
        }
      </style>
      <sl-tab-group>
        <sl-tab slot="nav" panel="lexml-eta" ${this.projetoNorma ? '' : html`disabled`}>Texto</sl-tab>
        <sl-tab slot="nav" panel="justificativa" ${this.projetoNorma ? '' : html`disabled`}>Justificativa</sl-tab>
        <sl-tab slot="nav" panel="autoria" ${this.projetoNorma ? '' : html`disabled`}>Data e Autoria</sl-tab>
        <sl-tab-panel name="lexml-eta">
          <lexml-eta id="lexmlEta" modo=${this.modo} .projetoNorma=${this.projetoNorma} .dispositivosEmenda=${this.dispositivosEmenda}></lexml-eta>
        </sl-tab-panel>
        <sl-tab-panel name="justificativa">
          <lexml-emenda-justificativa texto=${this.textoJustificativa}></lexml-emenda-justificativa>
        </sl-tab-panel>
        <sl-tab-panel name="autoria">
          <lexml-data></lexml-data>
          <hr />
          <lexml-autoria .parlamentares=${this.parlamentares} .autoria=${this.autoria}></lexml-autoria>
        </sl-tab-panel>
      </sl-tab-group>
    `;
  }
}
