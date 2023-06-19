import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Observable } from '../../util/observable';
import { ativarDesativarMarcaDeRevisao, setCheckedElement } from '../../redux/elemento/util/revisaoUtil';
import { rootStore } from '../../redux/store';
import { connect } from 'pwa-helpers';

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

  onChange: Observable<string> = new Observable<string>();

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  createRenderRoot(): LitElement {
    return this;
  }

  render(): TemplateResult {
    return html`
      <style>
        #revisoes-justificativa-icon sl-icon {
          border: 1px solid #ccc !important;
          padding: 5px 5px !important;
          border-radius: 15px !important;
          font-weight: bold;
          background-color: #eee;
          cursor: pointer;
        }
        .lista-revisoes-justificativa {
          padding-left: 1rem;
          padding-right: 0.5rem;
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
        #revisao-div {
          margin-left: auto;
        }
        @media (max-width: 768px) {
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
}
