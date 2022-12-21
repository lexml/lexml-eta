import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { buildContent, getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';

import { connect } from 'pwa-helpers';
import { rootStore } from '../redux/store';

import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
import '@shoelace-style/shoelace/dist/components/tab/tab';
// eslint-disable-next-line import/no-duplicates
import SlBadge from '@shoelace-style/shoelace/dist/components/badge/badge';
// eslint-disable-next-line import/no-duplicates
import '@shoelace-style/shoelace/dist/components/badge/badge';

import { Autoria, ColegiadoApreciador, ComandoEmenda, Emenda, Epigrafe, ModoEdicaoEmenda, Parlamentar } from '../model/emenda/emenda';
import { getAno, getNumero, getSigla } from '../model/lexml/documento/urnUtil';

import { adicionarAlerta } from '../model/alerta/acao/adicionarAlerta';
import { removerAlerta } from '../model/alerta/acao/removerAlerta';
import { ComandoEmendaComponent } from './comandoEmenda/comandoEmenda.component';
import { ComandoEmendaModalComponent } from './comandoEmenda/comandoEmenda.modal.component';
import { LexmlEtaComponent } from './lexml-eta.component';

@customElement('lexml-emenda')
export class LexmlEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) modo = '';
  @property({ type: Boolean }) existeObserverEmenda = false;
  @property({ type: Number }) totalAlertas = 0;
  @property({ type: Boolean }) exibirAjuda = true;
  @property({ type: Array }) parlamentares: Parlamentar[] = [];

  private _projetoNorma = {};

  @property({ type: Object })
  get projetoNorma(): any {
    return this._projetoNorma;
  }

  set projetoNorma(value: any) {
    const oldValue = this._projetoNorma;
    this._projetoNorma = value;

    if (this._lexmlEmendaComando) {
      this._lexmlEmendaComando.emenda = [];
    }
    this._lexmlEmendaComandoModal?.atualizarComandoEmenda(new ComandoEmenda());

    this.requestUpdate('projetoNorma', oldValue);
  }

  @state()
  autoria = new Autoria();

  @query('lexml-eta')
  _lexmlEta!: LexmlEtaComponent;
  @query('lexml-emenda-justificativa')
  _lexmlJustificativa;
  @query('lexml-autoria')
  _lexmlAutoria;
  @query('lexml-data')
  _lexmlData;
  @query('lexml-opcoes-impressao')
  _lexmlOpcoesImpressao;

  @query('lexml-emenda-comando')
  _lexmlEmendaComando!: ComandoEmendaComponent;

  @query('lexml-emenda-comando-modal')
  _lexmlEmendaComandoModal!: ComandoEmendaModalComponent;

  @query('sl-split-panel')
  private slSplitPanel!: any;

  async getParlamentares(): Promise<Parlamentar[]> {
    try {
      const _response = await fetch('api/parlamentares');
      const _parlamentares = await _response.json();
      return _parlamentares.map(p => ({
        identificacao: p.id + '',
        nome: p.nome,
        sexo: p.sexo,
        siglaPartido: p.siglaPartido,
        siglaUF: p.siglaUF,
        siglaCasaLegislativa: p.siglaCasa,
      }));
    } catch (err) {
      console.log(err);
      window.alert('Erro inesperado ao carregar lista de parlamentares');
    }
    return Promise.resolve([]);
  }

  atualizaListaParlamentares(): void {
    this.getParlamentares().then(parlamentares => (this.parlamentares = parlamentares));
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
    if (urn) {
      emenda.proposicao = {
        urn,
        sigla: getSigla(urn),
        numero: getNumero(urn),
        ano: getAno(urn),
        ementa: buildContent(projetoNorma?.value?.projetoNorma?.norma?.parteInicial?.ementa.content),
        identificacaoTexto: 'Texto da MPV',
      };
    }
    return emenda;
  }

  getEmenda(): Emenda {
    const emenda = this.montarEmendaBasicaFromProjetoNorma(this.projetoNorma, this.modo as ModoEdicaoEmenda);
    const numeroProposicao = emenda.proposicao.numero.replace(/^0+/, '');
    emenda.componentes[0].dispositivos = this._lexmlEta.getDispositivosEmenda()!;
    emenda.comandoEmenda = this._lexmlEta.getComandoEmenda();
    emenda.justificativa = this._lexmlJustificativa.texto;
    emenda.autoria = this._lexmlAutoria.getAutoriaAtualizada();
    emenda.data = this._lexmlData.data || undefined;
    emenda.opcoesImpressao = this._lexmlOpcoesImpressao.opcoesImpressao;
    console.log('opcoesImpressao', emenda.opcoesImpressao);
    emenda.colegiadoApreciador = this.montarColegiadoApreciador(numeroProposicao, emenda.proposicao.ano);
    emenda.epigrafe = new Epigrafe();
    emenda.epigrafe.texto = `EMENDA Nº         - CMMPV ${numeroProposicao}/${emenda.proposicao.ano}`;
    emenda.epigrafe.complemento = `(à ${emenda.proposicao.sigla} ${numeroProposicao}/${emenda.proposicao.ano})`;
    emenda.local = this.montarLocalFromColegiadoApreciador(emenda.colegiadoApreciador);

    return emenda;
  }

  setEmenda(emenda: Emenda): void {
    this.modo = emenda.modoEdicao;
    this._lexmlEta.dispositivosEmenda = emenda.componentes[0].dispositivos;
    this._lexmlAutoria.autoria = emenda.autoria;
    this._lexmlOpcoesImpressao.opcoesImpressao = emenda.opcoesImpressao;
    this._lexmlJustificativa.setContent(emenda.justificativa);
    this._lexmlData.data = emenda.data;
  }

  resetaEmenda(): void {
    const emenda = new Emenda();
    this.setEmenda(emenda);
    this._lexmlEmendaComando.emenda = {};
  }

  constructor() {
    super();
  }

  createRenderRoot(): LitElement {
    return this;
  }

  private MOBILE_WIDTH = 768;
  private splitPanelPosition = 68;
  private sizeMode = '';

  myObserver = new ResizeObserver(entries => {
    entries.forEach(() => this.updateLayoutSplitPanel());
  });

  private updateLayoutSplitPanel(forceUpdate = false): void {
    if (this.modo.startsWith('emenda')) {
      if (this.sizeMode === 'desktop') {
        this.splitPanelPosition = this.slSplitPanel.position;
      }

      if (window.innerWidth <= this.MOBILE_WIDTH && (this.sizeMode !== 'mobile' || forceUpdate)) {
        this.sizeMode = 'mobile';
        this.slSplitPanel.position = 100;
        this.slSplitPanel.setAttribute('disabled', 'true');
      } else if (window.innerWidth > this.MOBILE_WIDTH && (this.sizeMode !== 'desktop' || forceUpdate)) {
        this.sizeMode = 'desktop';
        this.slSplitPanel.position = this.splitPanelPosition;
        this.slSplitPanel.removeAttribute('disabled');
      }
    } else if (this.modo === 'edicao') {
      this.slSplitPanel.position = 100;
    }
  }

  protected firstUpdated(): void {
    this.myObserver.observe(document.body);
    this.atualizaListaParlamentares();
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
      this.slSplitPanel.removeAttribute('disabled');
      this.slSplitPanel.position = this.splitPanelPosition;
    } else {
      this.slSplitPanel.setAttribute('disabled', 'true');
      this.slSplitPanel.position = 100;
    }

    this.parlamentares.length === 0 && this.atualizaListaParlamentares();
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

  private onChange(): void {
    if (this.modo.startsWith('emenda')) {
      const comandoEmenda = this._lexmlEta.getComandoEmenda();
      this._lexmlEmendaComando.emenda = comandoEmenda;
      this._lexmlEmendaComandoModal.atualizarComandoEmenda(comandoEmenda);

      if (comandoEmenda.comandos?.length > 0 && !this._lexmlJustificativa.texto) {
        const alerta = {
          id: 'alerta-global-justificativa',
          tipo: 'error',
          mensagem: 'A emenda não possui uma justificativa',
          podeFechar: false,
        };
        rootStore.dispatch(adicionarAlerta(alerta));
      } else {
        rootStore.dispatch(removerAlerta('alerta-global-justificativa'));
      }
    }
  }

  render(): TemplateResult {
    setTimeout(() => this.updateLayoutSplitPanel(true), 0);

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
          /* overflow: var(--overflow); */
          /* overflow-y: auto; */
        }
        sl-tab-panel[name='autoria'] {
          padding: 10px;
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
        sl-tab sl-icon {
          margin-right: 5px;
          font-size: 18px;
        }
        @media (max-width: 768px) {
          sl-split-panel {
            --divider-width: 0px;
          }
        }
      </style>

      <sl-split-panel>
        <sl-icon slot="handle" name="grip-vertical"></sl-icon>
        <div slot="start">
          <sl-tab-group>
            <sl-tab slot="nav" panel="lexml-eta">Texto</sl-tab>
            <sl-tab slot="nav" panel="justificativa">Justificativa</sl-tab>
            <sl-tab slot="nav" panel="autoria">Data, Autoria e Impressão</sl-tab>
            <sl-tab slot="nav" panel="avisos">
              Avisos
              <div class="badge-pulse" id="contadorAvisos">${this.totalAlertas > 0 ? html` <sl-badge variant="danger" pill pulse>${this.totalAlertas}</sl-badge> ` : ''}</div>
            </sl-tab>
            <sl-tab-panel name="lexml-eta">
              <lexml-eta id="lexmlEta" @onchange=${this.onChange} modo=${this.modo} .projetoNorma=${this.projetoNorma}></lexml-eta>
            </sl-tab-panel>
            <sl-tab-panel name="justificativa">
              <lexml-emenda-justificativa @onchange=${this.onChange}></lexml-emenda-justificativa>
            </sl-tab-panel>
            <sl-tab-panel name="autoria" class="overflow-hidden">
              <lexml-data></lexml-data>
              <br />
              <lexml-autoria .parlamentares=${this.parlamentares}></lexml-autoria>
              <lexml-opcoes-impressao></lexml-opcoes-impressao>
            </sl-tab-panel>
            <sl-tab-panel name="avisos" class="overflow-hidden">
              <lexml-eta-alertas></lexml-eta-alertas>
            </sl-tab-panel>
          </sl-tab-group>
        </div>
        <div slot="end">
          <sl-tab-group>
            <sl-tab slot="nav" panel="comando">
              <sl-icon name="code"></sl-icon>
              Comando
            </sl-tab>
            <sl-tab slot="nav" panel="dicas">
              <sl-icon name="lightbulb"></sl-icon>
              Dicas
            </sl-tab>
            <sl-tab slot="nav" panel="atalhos">
              <sl-icon name="keyboard"></sl-icon>
              Atalhos
            </sl-tab>
            <sl-tab-panel name="comando" class="overflow-hidden">
              <lexml-emenda-comando></lexml-emenda-comando>
            </sl-tab-panel>
            <sl-tab-panel name="dicas" class="overflow-hidden">
              <lexml-ajuda></lexml-ajuda>
            </sl-tab-panel>
            <sl-tab-panel name="atalhos" class="overflow-hidden">
              <lexml-eta-atalhos></lexml-eta-atalhos>
            </sl-tab-panel>
          </sl-tab-group>
        </div>
      </sl-split-panel>
    `;
  }
}
