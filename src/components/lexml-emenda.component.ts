import '@shoelace-style/shoelace/dist/components/badge/badge';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
import '@shoelace-style/shoelace/dist/components/tab/tab';

import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';

import { adicionarAlerta } from '../model/alerta/acao/adicionarAlerta';
import { removerAlerta } from '../model/alerta/acao/removerAlerta';
import { Autoria, ColegiadoApreciador, Emenda, Epigrafe, ModoEdicaoEmenda, Parlamentar } from '../model/emenda/emenda';
import { buildContent, getUrn } from '../model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { getAno, getNumero, getSigla } from '../model/lexml/documento/urnUtil';
import { rootStore } from '../redux/store';
import { ClassificacaoDocumento } from './../model/documento/classificacao';
import { ProjetoNorma } from './../model/lexml/documento/projetoNorma';
import { ComandoEmendaComponent } from './comandoEmenda/comandoEmenda.component';
import { ComandoEmendaModalComponent } from './comandoEmenda/comandoEmenda.modal.component';
import { LexmlEtaComponent } from './lexml-eta.component';
import { LexmlEmendaConfig } from '../model/lexmlEmendaConfig';

@customElement('lexml-emenda')
export class LexmlEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: Boolean }) existeObserverEmenda = false;
  @property({ type: Number }) totalAlertas = 0;
  @property({ type: Boolean }) exibirAjuda = true;
  @property({ type: Array }) parlamentares: Parlamentar[] = [];
  @property() lexmlEmendaConfig: LexmlEmendaConfig = new LexmlEmendaConfig();

  private modo: any = ClassificacaoDocumento.EMENDA;
  private projetoNorma = {};

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
  @query('#tabs-esquerda')
  _tabsEsquerda;

  @query('lexml-emenda-comando')
  _lexmlEmendaComando!: ComandoEmendaComponent;

  @query('lexml-emenda-comando-modal')
  _lexmlEmendaComandoModal!: ComandoEmendaModalComponent;

  @query('sl-split-panel')
  private slSplitPanel!: any;

  async getParlamentares(): Promise<Parlamentar[]> {
    try {
      const _response = await fetch(this.lexmlEmendaConfig.urlConsultaParlamentares);
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
      console.log('Erro inesperado ao carregar lista de parlamentares');
      console.log(err);
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
    emenda.colegiadoApreciador = this.montarColegiadoApreciador(numeroProposicao, emenda.proposicao.ano);
    emenda.epigrafe = new Epigrafe();
    emenda.epigrafe.texto = `EMENDA Nº         - CMMPV ${numeroProposicao}/${emenda.proposicao.ano}`;
    emenda.epigrafe.complemento = `(à ${emenda.proposicao.sigla} ${numeroProposicao}/${emenda.proposicao.ano})`;
    emenda.local = this.montarLocalFromColegiadoApreciador(emenda.colegiadoApreciador);

    return emenda;
  }

  inicializarEdicao(modo: string, projetoNorma: ProjetoNorma, emenda?: Emenda): void {
    this._lexmlEmendaComando.emenda = [];
    this.modo = modo;
    this.projetoNorma = projetoNorma;
    this._lexmlEta.setProjetoNorma(modo, projetoNorma, !!emenda);
    if (emenda) {
      this.setEmenda(emenda);
    } else {
      this.resetaEmenda(modo as ModoEdicaoEmenda);
    }
    setTimeout(this.handleResize, 0);
  }

  private setEmenda(emenda: Emenda): void {
    this._lexmlEta.setDispositivosEmenda(emenda.componentes[0].dispositivos);
    this._lexmlAutoria.autoria = emenda.autoria;
    this._lexmlOpcoesImpressao.opcoesImpressao = emenda.opcoesImpressao;
    this._lexmlJustificativa.setContent(emenda.justificativa);
    this._lexmlData.data = emenda.data;
  }

  private resetaEmenda(modoEdicao = ModoEdicaoEmenda.EMENDA): void {
    const emenda = new Emenda();
    emenda.modoEdicao = modoEdicao;
    this._lexmlEmendaComando.emenda = {};
    this.setEmenda(emenda);
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

  // Documentação de tratamento de eventos no Lit
  // https://lit.dev/docs/components/events/

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this.handleResize);
    super.disconnectedCallback();
  }

  handleResize = (): void => {
    this.updateLayoutSplitPanel();
    this.ajustarAltura();
  };

  protected firstUpdated(): void {
    setTimeout(() => this.atualizaListaParlamentares(), 5000);

    this._tabsEsquerda?.addEventListener('sl-tab-show', (event: any) => {
      const tabName = event.detail.name;
      if (tabName === 'avisos') {
        const badge = (event.target as Element).querySelector('sl-badge');
        if (badge) {
          badge.pulse = false;
        }
      } else if (tabName === 'autoria') {
        this.parlamentares.length === 0 && this.atualizaListaParlamentares();
      }
    });
  }

  updated(): void {
    if (this.modo.startsWith('emenda')) {
      this.slSplitPanel.removeAttribute('disabled');
      this.slSplitPanel.position = this.splitPanelPosition;
    } else {
      this.slSplitPanel.setAttribute('disabled', 'true');
      this.slSplitPanel.position = 100;
    }
  }

  private pesquisarAlturaParentElement(elemento): number {
    if (elemento.parentElement === null) {
      // chegou no HTML e não encontrou altura
      return 0;
    } else {
      const minHeight = getComputedStyle(this).getPropertyValue('--min-height').replace('px', '');
      if (elemento.clientHeight >= minHeight) {
        return elemento.clientHeight;
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
    const alturaLexmlEtaTabs = lexmlEtaTabs?.clientHeight;
    if (alturaLexmlEtaTabs) {
      alturaElemento = alturaElemento - alturaLexmlEtaTabs - 12;
      if (alturaElemento > 0) {
        this?.style.setProperty('--height', alturaElemento + 'px');
        this?.style.setProperty('--overflow', 'hidden');
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
        .tab-autoria__container {
          padding: 10px;
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
          <sl-tab-group id="tabs-esquerda">
            <sl-tab slot="nav" panel="lexml-eta">Texto</sl-tab>
            <sl-tab slot="nav" panel="justificativa">Justificativa</sl-tab>
            <sl-tab slot="nav" panel="autoria">Data, Autoria e Impressão</sl-tab>
            <sl-tab slot="nav" panel="avisos">
              Avisos
              <div class="badge-pulse" id="contadorAvisos">${this.totalAlertas > 0 ? html` <sl-badge variant="danger" pill pulse>${this.totalAlertas}</sl-badge> ` : ''}</div>
            </sl-tab>
            <sl-tab-panel name="lexml-eta" class="overflow-hidden">
              <lexml-eta id="lexmlEta" @onchange=${this.onChange}></lexml-eta>
            </sl-tab-panel>
            <sl-tab-panel name="justificativa" class="overflow-hidden">
              <lexml-emenda-justificativa @onchange=${this.onChange}></lexml-emenda-justificativa>
            </sl-tab-panel>
            <sl-tab-panel name="autoria" class="overflow-hidden">
              <div class="tab-autoria__container">
                <lexml-data></lexml-data>
                <br />
                <lexml-autoria .parlamentares=${this.parlamentares}></lexml-autoria>
                <lexml-opcoes-impressao></lexml-opcoes-impressao>
              </div>
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
