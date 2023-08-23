import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Observable } from '../../util/observable';
import { ativarDesativarMarcaDeRevisao, atualizaQuantidadeRevisao, setCheckedElement } from '../../redux/elemento/util/revisaoUtil';
import { rootStore } from '../../redux/store';
import { connect } from 'pwa-helpers';
import { StateEvent, StateType } from '../../redux/state';
import { alertarInfo } from '../../redux/elemento/util/alertaUtil';

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
    atualizaQuantidadeRevisao(rootStore.getState().elementoReducer.revisoes, document.getElementById(this.nomeBadgeQuantidadeRevisao) as any, this.modo);
  };
}
