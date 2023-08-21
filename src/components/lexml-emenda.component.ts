import { Usuario } from './../model/revisao/usuario';
import '@shoelace-style/shoelace/dist/components/badge/badge';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
import '@shoelace-style/shoelace/dist/components/tab/tab';

import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';

import { editorStyles } from '../assets/css/editor.css';
import { quillSnowStyles } from '../assets/css/quill.snow.css';
import { shoelaceLightThemeStyles } from '../assets/css/shoelace.theme.light.css';

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
import { limparAlertas } from '../model/alerta/acao/limparAlertas';
import { LexmlEmendaConfig } from '../model/lexmlEmendaConfig';
import { atualizarUsuarioAction } from '../model/lexml/acao/atualizarUsuarioAction';
import { isRevisaoElemento, ordernarRevisoes, removeAtributosDoElemento } from '../redux/elemento/util/revisaoUtil';
import { Revisao, RevisaoElemento } from '../model/revisao/revisao';
import { ativarDesativarRevisaoAction } from '../model/lexml/acao/ativarDesativarRevisaoAction';

@customElement('lexml-emenda')
export class LexmlEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: Boolean }) existeObserverEmenda = false;
  @property({ type: Number }) totalAlertas = 0;
  @property({ type: Boolean }) exibirAjuda = true;
  @property({ type: Array }) parlamentares: Parlamentar[] = [];
  @property({ type: Object }) lexmlEmendaConfig: LexmlEmendaConfig = new LexmlEmendaConfig();

  @property({ type: String })
  private modo: any = ClassificacaoDocumento.EMENDA;

  @property({ type: String })
  private motivo = '';

  private projetoNorma = {};

  @state()
  autoria = new Autoria();

  @query('lexml-eta')
  _lexmlEta?: LexmlEtaComponent;
  @query('#editor-texto-rico-emenda')
  _lexmlEmendaTextoRico;
  @query('#editor-texto-rico-justificativa')
  _lexmlJustificativa;
  @query('lexml-autoria')
  _lexmlAutoria;
  @query('lexml-data')
  _lexmlData;
  @query('lexml-opcoes-impressao')
  _lexmlOpcoesImpressao;
  @query('#tabs-esquerda')
  _tabsEsquerda;
  @query('#tabs-direita')
  _tabsDireita;
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
    if (this._lexmlEta) {
      emenda.componentes[0].dispositivos = this._lexmlEta.getDispositivosEmenda()!;
      emenda.comandoEmenda = this._lexmlEta.getComandoEmenda();
    } else {
      emenda.comandoEmendaTextoLivre.motivo = this.motivo;
      emenda.comandoEmendaTextoLivre.texto = this._lexmlEmendaTextoRico.texto;
    }
    emenda.justificativa = this._lexmlJustificativa.texto;
    emenda.autoria = this._lexmlAutoria.getAutoriaAtualizada();
    emenda.data = this._lexmlData.data || undefined;
    emenda.opcoesImpressao = this._lexmlOpcoesImpressao.opcoesImpressao;
    emenda.colegiadoApreciador = this.montarColegiadoApreciador(numeroProposicao, emenda.proposicao.ano);
    emenda.epigrafe = new Epigrafe();
    emenda.epigrafe.texto = `EMENDA Nº         - CMMPV ${numeroProposicao}/${emenda.proposicao.ano}`;
    emenda.epigrafe.complemento = `(à ${emenda.proposicao.sigla} ${numeroProposicao}/${emenda.proposicao.ano})`;
    emenda.local = this.montarLocalFromColegiadoApreciador(emenda.colegiadoApreciador);
    emenda.revisoes = this.getRevisoes();
    return emenda;
  }

  private getRevisoes(): Revisao[] {
    const revisoes = ordernarRevisoes([...rootStore.getState().elementoReducer.revisoes]);

    revisoes.filter(isRevisaoElemento).forEach(r => {
      const re = r as RevisaoElemento;
      removeAtributosDoElemento(re.elementoAposRevisao);
      re.elementoAntesRevisao && removeAtributosDoElemento(re.elementoAntesRevisao);
    });

    return revisoes;
  }

  inicializarEdicao(modo: string, projetoNorma: ProjetoNorma, emenda?: Emenda, motivo = '', usuario?: Usuario): void {
    this._lexmlEmendaComando.emenda = [];
    this.modo = modo;
    this.projetoNorma = projetoNorma;
    this.motivo = motivo;

    if (this.modo !== 'emendaTextoLivre') {
      this._lexmlEta!.setProjetoNorma(modo, projetoNorma, !!emenda);
    }

    this.desativarMarcaRevisao();

    if (emenda) {
      this.setEmenda(emenda);
    } else {
      this.resetaEmenda(modo as ModoEdicaoEmenda);
    }

    this.limparAlertas();

    if (this.modo === 'emendaTextoLivre' && !this._lexmlEmendaTextoRico.texto) {
      this.showAlertaEmendaTextoLivre();
    }
    this.setUsuario(usuario ?? rootStore.getState().elementoReducer.usuario);
    setTimeout(this.handleResize, 0);
  }

  private desativarMarcaRevisao = (): void => {
    if (rootStore.getState().elementoReducer.emRevisao) {
      rootStore.dispatch(ativarDesativarRevisaoAction.execute());
    }
  };

  public setUsuario(usuario = new Usuario()): void {
    rootStore.dispatch(atualizarUsuarioAction.execute(usuario));
  }

  private setEmenda(emenda: Emenda): void {
    if (this._lexmlEta) {
      this._lexmlEta.setDispositivosERevisoesEmenda(emenda.componentes[0].dispositivos, emenda.revisoes);
    }
    this._lexmlAutoria.autoria = emenda.autoria;
    this._lexmlOpcoesImpressao.opcoesImpressao = emenda.opcoesImpressao;
    this._lexmlJustificativa.setContent(emenda.justificativa);
    if (this._lexmlEmendaTextoRico) {
      this._lexmlEmendaTextoRico.setContent(emenda?.comandoEmendaTextoLivre.texto || '');
    }
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
    if (this.modo.startsWith('emenda') && this.modo !== 'emendaTextoLivre') {
      if (this.sizeMode === 'desktop') {
        this.slSplitPanel.position = this.splitPanelPosition;
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
    } else {
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

    const badgeAtalhos = this._tabsDireita?.querySelector('#badgeAtalhos');
    if (badgeAtalhos) {
      const naoPulsarBadgeAtalhos = localStorage.getItem('naoPulsarBadgeAtalhos');
      if (!naoPulsarBadgeAtalhos) {
        badgeAtalhos.pulse = true;
        badgeAtalhos.setAttribute('variant', 'warning');
      }
    }

    this._tabsDireita?.addEventListener('sl-tab-show', (event: any) => {
      const tabName = event.detail.name;
      if (tabName === 'atalhos') {
        const badge = (event.target as Element).querySelector('sl-badge');
        if (badge) {
          badge.pulse = false;
          badge.setAttribute('variant', 'primmay');
        }
        localStorage.setItem('naoPulsarBadgeAtalhos', 'true');
      }
    });
  }

  updated(): void {
    if (this.modo.startsWith('emenda') && this.modo !== 'emendaTextoLivre') {
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
    if (this.modo.startsWith('emenda') && this.modo !== 'emendaTextoLivre') {
      const comandoEmenda = this._lexmlEta!.getComandoEmenda();
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
    } else if (this.modo === 'emendaTextoLivre') {
      if (!this._lexmlEmendaTextoRico.texto) {
        this.showAlertaEmendaTextoLivre();
      } else {
        rootStore.dispatch(removerAlerta('alerta-global-emenda-texto-livre'));
      }
    }
  }

  limparAlertas(): void {
    rootStore.dispatch(limparAlertas());
  }

  showAlertaEmendaTextoLivre(): void {
    const alerta = {
      id: 'alerta-global-emenda-texto-livre',
      tipo: 'error',
      mensagem: 'O comando de emenda deve ser preenchido.',
      podeFechar: false,
    };
    rootStore.dispatch(adicionarAlerta(alerta));
  }

  render(): TemplateResult {
    return html`
      ${shoelaceLightThemeStyles} ${quillSnowStyles} ${editorStyles}
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
          display: ${this.modo.startsWith('emenda') && this.modo !== 'emendaTextoLivre' ? 'block' : 'none'};
          height: 100%;
        }
        lexml-eta {
          font-family: var(--eta-font-serif);
          text-align: left;
        }
        /* #editor-texto-rico-justificativa #editor-texto-rico {
          height: calc(var(--height) - 44px);
          overflow: var(--overflow);
        } */

        #editor-texto-rico-emenda-inner {
          height: calc(var(--height) - 57px);
          overflow: var(--overflow);
        }

        #editor-texto-rico-justificativa-inner {
          height: calc(var(--height) - 57px);
          overflow: var(--overflow);
        }
        .badge-pulse {
          margin-left: 7px;
          height: 16px;
          margin-top: -4px;
        }

        #badgeAtalhos::part(base) {
          height: 16px;
          margin-top: 2px;
          font-size: var(--sl-font-size-small);
          background-color: transparent;
          color: var(--sl-color-neutral-600);
        }
        sl-tab[panel='atalhos'][active] #badgeAtalhos::part(base) {
          color: var(--sl-color-primary-600);
        }

        sl-split-panel {
          --divider-width: ${this.modo.startsWith('emenda') && this.modo !== 'emendaTextoLivre' ? '15px' : '0px'};
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
              ${this.modo && this.modo !== 'emendaTextoLivre'
                ? html`<lexml-eta id="lexmlEta" .lexmlEtaConfig=${this.lexmlEmendaConfig} @onchange=${this.onChange}></lexml-eta>`
                : html`<editor-texto-rico id="editor-texto-rico-emenda" registroEvento="justificativa" @onchange=${this.onChange}></editor-texto-rico>`}
            </sl-tab-panel>
            <sl-tab-panel name="justificativa" class="overflow-hidden">
              <editor-texto-rico id="editor-texto-rico-justificativa" registroEvento="justificativa" @onchange=${this.onChange}></editor-texto-rico>
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
          <sl-tab-group id="tabs-direita">
            <sl-tab slot="nav" panel="comando">
              <sl-icon name="code"></sl-icon>
              Comando
            </sl-tab>
            <sl-tab slot="nav" panel="dicas">
              <sl-icon name="lightbulb"></sl-icon>
              Dicas
            </sl-tab>
            <sl-tab slot="nav" panel="atalhos">
              <sl-badge variant="primary" id="badgeAtalhos" pill>
                <sl-icon name="keyboard"></sl-icon>
                Atalhos
              </sl-badge>
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
