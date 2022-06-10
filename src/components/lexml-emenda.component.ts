import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { connect } from 'pwa-helpers';
import { rootStore } from '../redux/store';

// import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab/tab';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
// eslint-disable-next-line import/no-duplicates
import SlBadge from '@shoelace-style/shoelace/dist/components/badge/badge';
// eslint-disable-next-line import/no-duplicates
import '@shoelace-style/shoelace/dist/components/badge/badge';

import { Autoria, Parlamentar, Emenda, ModoEdicaoEmenda, ColegiadoApreciador } from '../model/emenda/emenda';
import { getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { getSigla, getNumero, getAno } from './../../src/model/lexml/documento/urnUtil';

@customElement('lexml-emenda')
export class LexmlEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Object }) projetoNorma = {};
  @property({ type: Boolean }) existeObserverEmenda = false;
  @property({ type: Number }) totalAlertas = 0;

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

  private montarColegiadoApreciador(numero: string, ano: string): ColegiadoApreciador {
    return {
      siglaCasaLegislativa: 'CN',
      tipoColegiado: 'Comissão',
      siglaComissao: `CMMPV ${numero}/${ano}`,
    };
  }

  private montarLocalFromColegiadoApreciador(colegiado: ColegiadoApreciador): any {
    return colegiado.tipoColegiado === 'Comissão' ? 'Sala da comissão' : 'Sala das sessões';
  }

  private montarEmendaBasicaFromProjetoNorma(projetoNorma: any, modoEdicao: ModoEdicaoEmenda): Emenda {
    const emenda = new Emenda();
    emenda.modoEdicao = modoEdicao;
    const urn = getUrn(this.projetoNorma);
    emenda.componentes[0].urn = urn;
    emenda.proposicao = {
      urn,
      sigla: getSigla(urn),
      numero: getNumero(urn),
      ano: getAno(urn),
      ementa: projetoNorma.value.projetoNorma.norma.parteInicial.ementa.content[0],
      identificacaoTexto: '',
    };
    return emenda;
  }

  getEmenda(): Emenda {
    const emenda = this.montarEmendaBasicaFromProjetoNorma(this.projetoNorma, this.modo as ModoEdicaoEmenda);

    emenda.componentes[0].dispositivos = this._lexmlEta.getDispositivosEmenda();
    emenda.comandoEmenda = this._lexmlEta.getComandoEmenda();
    emenda.justificativa = this._lexmlJustificativa.texto;
    emenda.autoria = this._lexmlAutoria.getAutoriaAtualizada();
    emenda.data = this._lexmlData.data;
    emenda.colegiadoApreciador = this.montarColegiadoApreciador(emenda.proposicao.numero, emenda.proposicao.ano);
    emenda.local = this.montarLocalFromColegiadoApreciador(emenda.colegiadoApreciador);

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
    // cria resizeObserver apenas se altura for ajustada
    if (this?.ajustarAltura()) {
      if (this.existeObserverEmenda !== true) {
        this.observarAltura();
      }
    }
    const tabAvisos = document.querySelector('#sl-tab-4');
    tabAvisos?.addEventListener('focus', (event: any) => {
      event.stopImmediatePropagation();
      const badge = (event.target as Element).querySelector('sl-badge') as SlBadge;
      if (badge) {
        badge.pulse = false;
      }
    });
  }

  private pesquisarAlturaParentElement(elemento): number {
    if (elemento.parentElement === null) {
      // chegou no HTML e não encontrou altura
      return 0;
    } else {
      const minHeight = getComputedStyle(this).getPropertyValue('--min-height').replace('px', '');
      if (elemento.scrollHeight >= minHeight) {
        return elemento.scrollHeight;
      } else {
        return this.pesquisarAlturaParentElement(elemento.parentElement);
      }
    }
  }
  // procura por uma altura definida e ajusta componente
  private ajustarAltura(altura?: number): boolean {
    let alturaElemento = altura !== undefined ? altura : this.pesquisarAlturaParentElement(this);
    const lexmlEtaTabs = document.querySelector('sl-tab-group')?.shadowRoot?.querySelector('.tab-group__nav-container');
    // altura dos tabs
    const alturaLexmlEtaTabs = lexmlEtaTabs?.scrollHeight;
    if (alturaLexmlEtaTabs) {
      alturaElemento = alturaElemento - alturaLexmlEtaTabs - 2;
      if (alturaElemento > 0) {
        this?.style.setProperty('--height', alturaElemento + 'px');
        this?.style.setProperty('--overflow', 'hidden');
        // console.log('H ajustada: ' + alturaElemento);
        return true;
      }
    }
    return false;
  }

  // recupera redimensionamento da caixa do componente e reajusta altura
  private observarAltura() {
    const emendaObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          this.ajustarAltura(entry.contentBoxSize[0].blockSize);
        }
      }
    });
    this.existeObserverEmenda = true;
    emendaObserver.observe(this);
  }

  render(): TemplateResult {
    return html`
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
          /* overflow-y: auto; */
        }
        sl-tab-panel.overflow-hidden::part(base) {
          overflow-y: auto;
        }
        lexml-emenda-justificativa #editor-justificativa {
          height: calc(var(--height) - 44px);
          overflow: var(--overflow);
        }
        .badge-pulse {
          margin-left: 7px;
          height: 16px;
          margin-top: -4px;
        }
      </style>
      <sl-tab-group>
        <sl-tab slot="nav" panel="lexml-eta">Texto</sl-tab>
        <sl-tab slot="nav" panel="justificativa">Justificativa</sl-tab>
        <sl-tab slot="nav" panel="autoria">Data e Autoria</sl-tab>
        <sl-tab slot="nav" panel="avisos">
          Avisos
          <div class="badge-pulse" id="contadorAvisos">${this.totalAlertas > 0 ? html` <sl-badge variant="danger" pill pulse>${this.totalAlertas}</sl-badge> ` : ''}</div>
        </sl-tab>
        <sl-tab-panel name="lexml-eta">
          <lexml-eta id="lexmlEta" modo=${this.modo} .projetoNorma=${this.projetoNorma}></lexml-eta>
        </sl-tab-panel>
        <sl-tab-panel name="justificativa">
          <lexml-emenda-justificativa></lexml-emenda-justificativa>
        </sl-tab-panel>
        <sl-tab-panel name="autoria" class="overflow-hidden">
          <lexml-data></lexml-data>
          <hr />
          <lexml-autoria .parlamentares=${this.parlamentares} .autoria=${this.autoria}></lexml-autoria>
        </sl-tab-panel>
        <sl-tab-panel name="avisos" class="overflow-hidden">
          <lexml-eta-alertas></lexml-eta-alertas>
        </sl-tab-panel>
      </sl-tab-group>
    `;
  }
}
