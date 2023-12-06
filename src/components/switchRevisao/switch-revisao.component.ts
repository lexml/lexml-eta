import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Observable } from '../../util/observable';
import { ativarDesativarMarcaDeRevisao, atualizaQuantidadeRevisaoTextoRico, setCheckedElement } from '../../redux/elemento/util/revisaoUtil';
import { rootStore } from '../../redux/store';
import { connect } from 'pwa-helpers';
import { StateEvent, StateType } from '../../redux/state';
import { alertarInfo } from '../../redux/elemento/util/alertaUtil';
import { Modo } from '../../redux/elemento/enum/enumUtil';

@customElement('lexml-switch-revisao')
export class SwitchRevisaoComponent extends connect(rootStore)(LitElement) {
  @property({ type: Number })
  quantidadeRevisao = 0;

  @property({ type: String })
  nomeSwitch = '';

  @property({ type: String })
  nomeBadgeQuantidadeRevisao = '';

  @property({ type: Boolean, reflect: true })
  checkedRevisao = false;

  @property({ type: String })
  modo = '';

  onChange: Observable<string> = new Observable<string>();

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  createRenderRoot(): LitElement {
    return this;
  }

  stateChanged(state: any): void {
    if (state.elementoReducer.ui) {
      if (state.elementoReducer.ui.events) {
        if (state.elementoReducer.ui.message && state.elementoReducer.ui.events[0]?.stateType === 'AtualizacaoAlertas') {
          alertarInfo(state.elementoReducer.ui.message.descricao);
        }
        this.processarStateEvents(state.elementoReducer.ui.events);
      }
    }
  }

  private processarStateEvents(events: StateEvent[]): void {
    events?.forEach((event: StateEvent): void => {
      switch (event.stateType) {
        case StateType.RevisaoAtivada:
        case StateType.RevisaoDesativada:
          this.checkedSwitchMarcaAlteracao();
          break;
      }
      this.atualizaQuantidadeRevisao();
      // this.atualiazaRevisaoJusutificativaIcon();
    });
  }

  render(): TemplateResult {
    return html`
      <style>
        #revisoes-justificativa-icon sl-icon {
          border: 1px solid #ccc !important;
          padding: 0.4rem 0.4rem !important;
          border-radius: 15px !important;
          font-weight: bold;
          background-color: #eee;
          cursor: pointer;
        }

        #revisoes-texto-livre-icon sl-icon {
          border: 1px solid #ccc !important;
          padding: 0.4rem 0.4rem !important;
          border-radius: 15px !important;
          font-weight: bold;
          background-color: #eee;
          cursor: pointer;
        }
        #chk-em-revisao {
          border: 1px solid #ccc !important;
          padding: 5px 10px !important;
          border-radius: 20px !important;
          margin-left: auto;
          margin-right: 5px;
          font-weight: bold;
          background-color: #eee;
        }
        #chk-em-revisao[checked] {
          background-color: var(--sl-color-blue-100);
        }
        .revisao-container {
          margin-left: auto;
        }
        .sl-toast-stack sl-alert::part(base) {
          background-color: var(--sl-color-danger-100);
        }
        @media (max-width: 992px) {
          .mobile-buttons {
            display: inline-block !important;
          }
          #chk-em-revisao span {
            display: none;
          }
        }
      </style>
      <div id="toolbar">
        <sl-switch id="${this.nomeSwitch}" size="small" @sl-change=${(): void => this.ativarDesativarMarcaDeRevisao()}>
          <span>Marcas de revisão</span>
          <sl-badge id="${this.nomeBadgeQuantidadeRevisao}" variant="warning" pill>0</sl-badge>
        </sl-switch>
      </div>
    `;
  }

  constructor() {
    super();
  }

  private ativarDesativarMarcaDeRevisao(): void {
    ativarDesativarMarcaDeRevisao(rootStore);
    this.checkedSwitchMarcaAlteracao();
  }

  private checkedSwitchMarcaAlteracao = (): void => {
    const switchMarcaAlteracaoView = document.getElementById(this.nomeSwitch) as any;
    setCheckedElement(switchMarcaAlteracaoView, rootStore.getState().elementoReducer.emRevisao);
  };

  private atualizaQuantidadeRevisao = (): void => {
    // console.log(qtdIns + qtdDel);
    //atualizaQuantidadeRevisao(rootStore.getState().elementoReducer.revisoes, document.getElementById(this.nomeBadgeQuantidadeRevisao) as any, this.modo);

    const revisoesIns = document.getElementsByClassName('ins') || [];
    const revisoesDel = document.getElementsByClassName('del') || [];

    const revisoesInsEmenda = this.getElementsByContainer('editor-texto-rico-emenda-inner', revisoesIns);
    const revisoesInsJustificativa = this.getElementsByContainer('editor-texto-rico-justificativa-inner', revisoesIns);

    const revisoesDelEmenda = this.getElementsByContainer('editor-texto-rico-emenda-inner', revisoesDel);
    const revisoesDelJustificativa = this.getElementsByContainer('editor-texto-rico-justificativa-inner', revisoesDel);

    const qtdInsEmenda = this.getNumberElementsRevision(revisoesInsEmenda);
    const qtdInsJustificativa = this.getNumberElementsRevision(revisoesInsJustificativa);

    const qtdDelEmenda = this.getNumberElementsRevision(revisoesDelEmenda);
    const qtdDelJustificativa = this.getNumberElementsRevision(revisoesDelJustificativa);

    const totalEmenda = qtdDelEmenda + qtdInsEmenda;
    const totalJustificativa = qtdDelJustificativa + qtdInsJustificativa;

    if (this.modo === Modo.JUSTIFICATIVA) {
      atualizaQuantidadeRevisaoTextoRico(totalJustificativa, document.getElementById(this.nomeBadgeQuantidadeRevisao) as any);
    } else if (this.modo === Modo.TEXTO_LIVRE) {
      atualizaQuantidadeRevisaoTextoRico(totalEmenda, document.getElementById(this.nomeBadgeQuantidadeRevisao) as any);
    }

    //console.log('Revisoes Emenda: ' + totalEmenda);
    //console.log('Revisoes Justificativa: ' + totalJustificativa);
  };

  getElementsByContainer(nameContainer: string, elements: any) {
    const listReturn = [] as any;

    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];

      if (element.parentNode.parentNode.parentNode.id === nameContainer) {
        listReturn.push(element);
      }
    }

    return listReturn;
  }

  private getNumberElementsRevision(listElements: any) {
    const revisoesSemDuplicidade = [] as any;

    for (let index = 0; index < listElements.length; index++) {
      const element = listElements[index];
      if (revisoesSemDuplicidade.length > 0) {
        if (revisoesSemDuplicidade.filter(r => r.id === element.id).length === 0) {
          revisoesSemDuplicidade.push(element);
        }
      } else {
        revisoesSemDuplicidade.push(element);
      }
    }
    return revisoesSemDuplicidade.length;
  }
}
