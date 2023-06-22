import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { negrito, sublinhado } from '../../../assets/icons/icons';
import { Observable } from '../../util/observable';
import { atualizaRevisaoJustificativa } from '../../redux/elemento/reducer/atualizaRevisaoJustificativa';
import { rootStore } from '../../redux/store';
import { ativarDesativarMarcaDeRevisao, atualizaQuantidadeRevisao, RevisaoJustificativaEnum, setCheckedElement } from '../../redux/elemento/util/revisaoUtil';
import { Revisao } from '../../model/revisao/revisao';
import { connect } from 'pwa-helpers';
import { StateEvent, StateType } from '../../redux/state';

@customElement('lexml-emenda-justificativa')
export class JustificativaEmendaComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) texto = '';

  onChange: Observable<string> = new Observable<string>();
  private timerOnChange?: any;
  private _idSwitchRevisao = 'chk-em-revisao-justificativa';
  private _idBadgeQuantidadeRevisao = 'badge-marca-alteracao-justificativa';

  quill?: Quill;
  container;

  toolbarOptions = [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    ['blockquote'],
    ['undo', 'redo'],
    [{ align: [] }],
    ['clean'],
  ];

  icons = Quill.import('ui/icons');

  private agendarEmissaoEventoOnChange(): void {
    clearTimeout(this.timerOnChange);
    this.timerOnChange = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('onchange', {
          bubbles: true,
          composed: true,
          detail: {
            origemEvento: 'justificativa',
          },
        })
      );
      this.onChange.notify('justificativa');
    }, 1000);
  }

  update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
  }

  createRenderRoot(): LitElement {
    return this;
  }

  stateChanged(state: any): void {
    if (state.elementoReducer.ui?.events) {
      this.processarStateEvents(state.elementoReducer.ui.events);
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
    });
  }

  render(): TemplateResult {
    return html`
      <style>
        #editor-justificativa {
          height: 375px;
        }
        #editor-justificativa p:not(.ql-align-rigth, .ql-align-center) {
          text-indent: 3em;
        }
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 8px;
        }

        #revisoes-justificativa-icon sl-icon {
          margin-right: 0.1rem;
        }

        .revisoes-justificativa-icon__ativo {
          color: white;
          background-color: var(--sl-color-warning-600) !important;
          border-color: white !important;
        }
        .lista-revisoes-justificativa {
          padding-left: 1rem;
          padding-right: 0.5rem;
        }
        #chk-em-revisao-justificativa {
          border: 1px solid #ccc !important;
          padding: 5px 10px !important;
          border-radius: 20px !important;
          margin-left: auto;
          margin-right: 5px;
          font-weight: bold;
          background-color: #eee;
        }
        #chk-em-revisao-justificativa[checked] {
          background-color: var(--sl-color-blue-100);
        }
        #toolbar {
          padding: 1.5px 0 1.5px 8px;
        }

        #badge-marca-alteracao-justificativa::part(base) {
          min-width: 1.4rem;
        }
        revisao-container {
          margin-left: auto;
        }

        @media (max-width: 768px) {
          .mobile-buttons {
            display: inline-block !important;
          }
          #chk-em-revisao-justificativa span {
            display: none;
          }
        }
      </style>
      <div id="toolbar">
        <span class="ql-formats">
          <button type="button" class="ql-bold" title="Negrito (Ctrl+b)"></button>
          <button type="button" class="ql-italic" title="Itálico (Ctrl+i)"></button>
          <button type="button" class="ql-underline" title="Sublinhado (Ctrl+u)"></button>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-list" value="ordered" title="Lista ordenada"></button>
          <button type="button" class="ql-list" value="bullet" title="Lista não ordenada"></button>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-script" value="sub" title="Subscrito"></button>
          <button type="button" class="ql-script" value="super" title="Sobrescrito"></button>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-blockquote" title="Bloco de citação"></button>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-undo" title="Desfazer (Ctrl+z)"></button>
          <button type="button" class="ql-redo" title="Refazer (Ctrl+Shift+z)"></button>
        </span>
        <span class="ql-formats">
          <select class="ql-align" title="Alinhar">
            <option value=""></option>
            <option value="center"></option>
            <option value="right"></option>
            <option value="justify"></option>
          </select>
        </span>
        <span class="ql-formats">
          <button type="button" class="ql-clean" title="Limpar formatação"></button>
        </span>

        <!-- <sl-icon id="revisoes-justificativa-icon" name="exclamation-octagon" label="Settings" title=""></sl-icon> -->

        <!--
        <sl-switch id="chk-em-revisao-justificativa" size="small" @sl-change=${(): void =>
          this.ativarDesativarMarcaDeRevisao()}><span>Marcas de revisão</span> <sl-badge id="badge-marca-alteracao-justificativa" variant="warning" pill>0</sl-badge>
        </sl-switch>
        -->

        <lexml-switch-revisao class="revisao-container" .nomeSwitch="${this._idSwitchRevisao}" .nomeBadgeQuantidadeRevisao="${this._idBadgeQuantidadeRevisao}">
        </lexml-switch-revisao>

        <sl-tooltip id="revisoes-justificativa-icon" placement="bottom-end">
          <div slot="content">
            <div>Revisões na justificativa</div>
          </div>
          <sl-icon name="person-check-fill"></sl-icon>
        </sl-tooltip>

        <sl-button
          id="aceita-revisao-justificativa"
          variant="default"
          size="small"
          title="Aceitar Revisões Justificativa"
          @click=${(): void => this.aceitaRevisoesJustificativa()}
          disabled
          circle
        >
          <sl-icon name="check-lg"></sl-icon>
        </sl-button>
      </div>
      <div id="editor-justificativa"></div>
    `;
  }

  constructor() {
    super();
    this.icons['undo'] = `<svg viewbox="0 0 18 18">
    <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
    <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
    </svg>`;
    this.icons['redo'] = `<svg viewbox="0 0 18 18">
    <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
    <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
    </svg>`;
    this.icons['bold'] = negrito;
    this.icons['underline'] = sublinhado;
  }

  firstUpdated(): void {
    this.init();
  }

  init = (): void => {
    this.container = document.querySelector('#editor-justificativa');
    if (this.container) {
      this.quill = new Quill(this.container as HTMLElement, {
        formats: ['bold', 'italic', 'underline', 'align', 'list', 'script', 'blockquote'],
        modules: {
          toolbar: {
            container: '#toolbar',
            handlers: {
              undo: this.undo,
              redo: this.redo,
            },
          },
          history: {
            delay: 0,
            maxStack: 500,
            userOnly: true,
          },
          clipboard: {},
        },
        placeholder: '',
        theme: 'snow',
      });

      this.setContent(this.texto);

      this.quill?.on('text-change', this.updateTexto);
    }
  };

  setContent = (texto: string): void => {
    if (!this.quill) {
      return;
    }
    this.quill.root.innerHTML = texto
      .replace(/indent/g, 'ql-indent')
      .replace(/align-justify/g, 'ql-align-justify')
      .replace(/align-center/g, 'ql-align-center')
      .replace(/align-right/g, 'ql-align-right');
  };

  updateTexto = (): void => {
    const texto = this.quill?.root.innerHTML
      ? this.quill?.root.innerHTML
          .replace(/ql-indent/g, 'indent')
          .replace(/ql-align-justify/g, 'align-justify')
          .replace(/ql-align-center/g, 'align-center')
          .replace(/ql-align-right/g, 'align-right')
      : '';
    this.texto = texto === '<p><br></p>' ? '' : texto;
    this.agendarEmissaoEventoOnChange();
    atualizaRevisaoJustificativa(rootStore.getState().elementoReducer);
    this.atualiazaRevisaoJusutificativaIcon();
    this.desabilitaBtnAceitarRevisoes(this.getRevisoesJustificativa().length === 0);
    this.atualizaQuantidadeRevisao();
  };

  undo = (): any => {
    return this.quill?.history.undo();
  };

  redo = (): any => {
    return this.quill?.history.redo();
  };

  private atualiazaRevisaoJusutificativaIcon = (): void => {
    // const contadorView = document.getElementById('revisoes-justificativa-icon') as any;
    // contadorView.setAttribute('title', this.getMensagemRevisaoJustificativa());
    const contentRevisoes = document.querySelector('#revisoes-justificativa-icon > div[slot=content]') as any;
    const iconRevisoes = document.querySelector('#revisoes-justificativa-icon > sl-icon') as any;
    if (this.getRevisoesJustificativa().length !== 0) {
      contentRevisoes.innerHTML = this.getMensagemRevisaoJustificativa();
      iconRevisoes.classList.add('revisoes-justificativa-icon__ativo');
    } else {
      contentRevisoes.innerHTML = 'Revisões na justificativa';
      iconRevisoes.classList.remove('revisoes-justificativa-icon__ativo');
    }
  };

  private getMensagemRevisaoJustificativa = (): string => {
    const revisoesJustificativa = this.getRevisoesJustificativa();
    let mensagem = '<ul class="lista-revisoes-justificativa">';

    if (revisoesJustificativa.length > 0) {
      revisoesJustificativa!.forEach((revisao: Revisao) => {
        const pipe = ' | ';
        mensagem = mensagem + '<li>' + revisao.usuario.nome + pipe + revisao.dataHora + '</li>';
      });
    }
    return mensagem + '</ul>';
  };

  private aceitaRevisoesJustificativa = (): void => {
    atualizaRevisaoJustificativa(rootStore.getState().elementoReducer, true);
    this.atualiazaRevisaoJusutificativaIcon();
    this.desabilitaBtnAceitarRevisoes(this.getRevisoesJustificativa().length === 0);
    this.atualizaQuantidadeRevisao();
  };

  private getRevisoesJustificativa = (): Revisao[] => {
    const revisoes = rootStore.getState().elementoReducer.revisoes;
    return revisoes.filter(r => r.descricao === RevisaoJustificativaEnum.JustificativaAlterada);
  };

  private desabilitaBtnAceitarRevisoes = (desabilita: boolean): void => {
    const contadorView = document.getElementById('aceita-revisao-justificativa') as any;
    if (desabilita) {
      contadorView.setAttribute('disabled', desabilita);
    } else {
      contadorView.removeAttribute('disabled');
    }
  };

  private ativarDesativarMarcaDeRevisao(): void {
    ativarDesativarMarcaDeRevisao(rootStore);
    this.checkedSwitchMarcaAlteracao();
  }

  private checkedSwitchMarcaAlteracao = (): void => {
    const switchMarcaAlteracaoView = document.getElementById('chk-em-revisao-justificativa') as any;
    setCheckedElement(switchMarcaAlteracaoView, rootStore.getState().elementoReducer.emRevisao);
  };

  private atualizaQuantidadeRevisao = (): void => {
    atualizaQuantidadeRevisao(rootStore, document.getElementById(this._idBadgeQuantidadeRevisao) as any, true);
  };
}
