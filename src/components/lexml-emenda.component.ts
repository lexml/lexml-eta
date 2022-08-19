import { buildContent } from './../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { connect } from 'pwa-helpers';
import { rootStore } from '../redux/store';

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

import { LexmlEtaComponent } from './lexml-eta.component';
import { ComandoEmendaComponent } from './comandoEmenda/comandoEmenda.component';

@customElement('lexml-emenda')
export class LexmlEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Object }) projetoNorma = {};
  @property({ type: Boolean }) existeObserverEmenda = false;
  @property({ type: Number }) totalAlertas = 0;
  @property({ type: Boolean }) exibirAjuda = true;

  @state()
  autoria = new Autoria();
  @state()
  parlamentares: Parlamentar[] = [];

  @query('lexml-eta')
  _lexmlEta!: LexmlEtaComponent;
  @query('lexml-emenda-justificativa')
  _lexmlJustificativa;
  @query('lexml-autoria')
  _lexmlAutoria;
  @query('lexml-data')
  _lexmlData;

  @query('lexml-emenda-comando')
  _lexmlEmendaComando!: ComandoEmendaComponent;

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
      ementa: buildContent(projetoNorma?.value?.projetoNorma?.norma?.parteInicial?.ementa.content),
      identificacaoTexto: 'Texto da MPV',
    };
    return emenda;
  }

  getEmenda(): Emenda {
    const emenda = this.montarEmendaBasicaFromProjetoNorma(this.projetoNorma, this.modo as ModoEdicaoEmenda);

    emenda.componentes[0].dispositivos = this._lexmlEta.getDispositivosEmenda()!;
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
    this.ajustarAltura();
    const tabAvisos = document.querySelector('#sl-tab-4');
    tabAvisos?.addEventListener('focus', (event: any) => {
      event.stopImmediatePropagation();
      const badge = (event.target as Element).querySelector('sl-badge') as SlBadge;
      if (badge) {
        badge.pulse = false;
      }
    });
    if (this.modo.startsWith('emenda')) {
      document.querySelector('sl-split-panel')?.removeAttribute('disabled');
    } else {
      document.querySelector('sl-split-panel')?.setAttribute('disabled', 'true');
    }
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

  private onChange(evt: CustomEvent): void {
    console.log('EVENTO', evt.detail.origemEvento || '*', evt.detail);

    if (this.modo.startsWith('emenda')) {
      const comandoEmenda = this._lexmlEta.getComandoEmenda();
      this._lexmlEmendaComando.emenda = comandoEmenda;
    }
  }

  render(): TemplateResult {
    return html`
      <style>
        :root {
          --height: 100%;
          --overflow: visible;
          --min-height: 300px;
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
        lexml-emenda-comando {
          font-family: var(--eta-font-serif);
          display: ${this.modo.startsWith('emenda') ? 'block' : 'none'};
          height: 100%;
        }
        lexml-eta {
          font-family: var(--eta-font-serif);
          text-align: left;
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
        sl-split-panel {
          --divider-width: ${this.modo.startsWith('emenda') ? '15px' : '0px'};
        }
      </style>

      <sl-split-panel position="${this.modo.startsWith('emenda') ? '68' : '100'}">
        <sl-icon slot="handle" name="grip-vertical"></sl-icon>
        <div slot="start">
          <sl-tab-group>
            <sl-tab slot="nav" panel="lexml-eta">Texto</sl-tab>
            <sl-tab slot="nav" panel="justificativa">Justificativa</sl-tab>
            <sl-tab slot="nav" panel="autoria">Data e Autoria</sl-tab>
            <sl-tab slot="nav" panel="avisos">
              Avisos
              <div class="badge-pulse" id="contadorAvisos">${this.totalAlertas > 0 ? html` <sl-badge variant="danger" pill pulse>${this.totalAlertas}</sl-badge> ` : ''}</div>
            </sl-tab>
            <sl-tab-panel name="lexml-eta">
              <lexml-eta id="lexmlEta" @onchange=${this.onChange} modo=${this.modo} .projetoNorma=${this.projetoNorma}></lexml-eta>
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
        </div>
        <div slot="end">
          <sl-tab-group>
            <sl-tab slot="nav" panel="comando">Comando</sl-tab>
            <sl-tab slot="nav" panel="ajuda" style=${this.exibirAjuda ? '' : 'display:none;'}>Ajuda</sl-tab>
            <sl-tab-panel name="comando" class="overflow-hidden">
              <lexml-emenda-comando></lexml-emenda-comando>
            </sl-tab-panel>
            <sl-tab-panel name="ajuda" class="overflow-hidden">
              <lexml-ajuda></lexml-ajuda>
            </sl-tab-panel>
          </sl-tab-group>
        </div>
      </sl-split-panel>
    `;
  }
}
