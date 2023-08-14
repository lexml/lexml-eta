import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { negrito, sublinhado, controleDropdown } from '../../../assets/icons/icons';
import { Observable } from '../../util/observable';
import { atualizaRevisaoJustificativa } from '../../redux/elemento/reducer/atualizaRevisaoJustificativa';
import { rootStore } from '../../redux/store';
import { RevisaoJustificativaEnum } from '../../redux/elemento/util/revisaoUtil';
import { Revisao } from '../../model/revisao/revisao';
import { connect } from 'pwa-helpers';
import { StateEvent, StateType } from '../../redux/state';
import { atualizaRevisaoTextoLivre } from '../../redux/elemento/reducer/atualizaRevisaoTextoLivre';

@customElement('editor-texto-rico')
export class EditorTextoRicoComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) texto = '';
  @property({ type: String, attribute: 'registro-evento' }) registroEvento = '';

  @property({ type: String })
  modo = '';

  onChange: Observable<string> = new Observable<string>();
  private timerOnChange?: any;

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
            origemEvento: this.registroEvento,
          },
        })
      );
      this.onChange.notify(this.registroEvento);
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
          //this.checkedSwitchMarcaAlteracao();
          break;
      }
      //this.atualizaQuantidadeRevisao();
      this.atualiazaRevisaoJusutificativaIcon();
    });
  }

  render(): TemplateResult {
    return html`
      <style>
        .editor-texto-rico {
          height: 375px;
        }
        .editor-texto-rico p:not(.ql-align-rigth, .ql-align-center) {
          text-indent: 3em;
        }
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 8px;
        }
        .editor-texto-rico .estilo-artigo-subordinados {
          text-indent: 0 !important;
          text-align: justify;
        }
        .editor-texto-rico .estilo-agrupador-artigo {
          text-indent: 0 !important;
          text-align: center;
        }
        .editor-texto-rico .estilo-emenda {
          text-indent: 0 !important;
          text-align: justify;
          margin-left: 40%;
        }

        #revisoes-justificativa-icon sl-icon,
        #aceita-revisao-justificativa {
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

        #chk-em-revisao-texto-livre {
          border: 1px solid #ccc !important;
          padding: 5px 10px !important;
          border-radius: 20px !important;
          margin-left: auto;
          margin-right: 5px;
          font-weight: bold;
          background-color: #eee;
        }
        #chk-em-revisao-texto-livre[checked] {
          background-color: var(--sl-color-blue-100);
        }
        #toolbar {
          padding: 1.5px 0 1.5px 8px;
        }

        #badge-marca-alteracao-justificativa::part(base) {
          min-width: 1.4rem;
        }

        #badge-marca-alteracao-texto-livre::part(base) {
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
      <div id="${`toolbar${this.id}`}">
        <span class="ql-formats">
          <select id="select-estilo" class="ql-estilo" title="Estilo">
            <option value="estilo-normal">Texto normal</option>
            <option value="estilo-artigo-subordinados">Artigo e subordinados</option>
            <option value="estilo-agrupador-artigo">Agrupador de artigo</option>
            <option value="estilo-emenda">Ementa</option>
          </select>
        </span>
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

        <lexml-switch-revisao modo="${this.modo}" class="revisao-container" .nomeSwitch="${this.getNomeSwitch()}" .nomeBadgeQuantidadeRevisao="${this.getNomeBadge()}">
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
          title="Limpar revisões na justificativa"
          @click=${(): void => this.aceitaRevisoesJustificativa()}
          disabled
          circle
        >
          <sl-icon name="check-lg"></sl-icon>
        </sl-button>
      </div>
      <div id="${this.id}-inner" class="editor-texto-rico"></div>
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
    this.container = document.querySelector(`#${this.id}-inner`);
    if (this.container) {
      this.quill = new Quill(this.container as HTMLElement, {
        formats: ['estilo', 'bold', 'italic', 'underline', 'align', 'list', 'script', 'blockquote'],
        modules: {
          toolbar: {
            container: '#toolbar' + this.id,
            handlers: {
              undo: this.undo,
              redo: this.redo,
              estilo: this.changeEstilo,
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
      this.loadDropDownEstilo();
    }
  };

  setContent = (texto: string): void => {
    if (!this.quill || !this.quill.root) {
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
    this.buildRevisoes();
    //this.atualizaQuantidadeRevisao();
  };

  buildRevisoes = (): void => {
    if (this.modo === 'justificativa') {
      atualizaRevisaoJustificativa(rootStore.getState().elementoReducer);
      this.atualiazaRevisaoJusutificativaIcon();
      this.desabilitaBtnAceitarRevisoes(this.getRevisoesJustificativa().length === 0);
    } else {
      atualizaRevisaoTextoLivre(rootStore.getState().elementoReducer);
    }
  };

  undo = (): any => {
    return this.quill?.history.undo();
  };

  redo = (): any => {
    return this.quill?.history.redo();
  };

  changeEstilo = (value): void => {
    const label = document.querySelector(`#toolbar${this.id} .ql-estilo .ql-picker-label`);
    const itens = document.querySelectorAll(`#toolbar${this.id} .ql-estilo .ql-picker-item`);
    const placeholderPickerItems = Array.prototype.slice.call(itens);
    const item = placeholderPickerItems.filter(item => item.dataset.value === value)[0];
    label!.innerHTML = item.dataset.label + '&nbsp;&nbsp;&nbsp;&nbsp;' + controleDropdown;
    const range = this.quill?.getSelection();
    if (range) {
      this.quill?.getLines(range.index)[0].domNode.setAttribute('class', value);
    }
  };

  loadDropDownEstilo = (): void => {
    const label = document.querySelector(`#toolbar${this.id} .ql-estilo .ql-picker-label`);
    const itens = document.querySelectorAll(`#toolbar${this.id} .ql-estilo .ql-picker-item`);
    if (this.container && label) {
      const placeholderPickerItems = Array.prototype.slice.call(itens);
      placeholderPickerItems.forEach(item => (item.textContent = item.dataset.label));
      label!.innerHTML = 'Texto Normal &nbsp;&nbsp;&nbsp;&nbsp;' + controleDropdown;
    }
  };

  private getNomeSwitch = (): string => {
    return this.modo === 'justificativa' ? 'chk-em-revisao-justificativa' : 'chk-em-revisao-texto-livre';
  };

  private getNomeBadge = (): string => {
    return this.modo === 'justificativa' ? 'badge-marca-alteracao-justificativa' : 'badge-marca-alteracao-texto-livre';
  };

  private atualiazaRevisaoJusutificativaIcon = (): void => {
    // const contadorView = document.getElementById('revisoes-justificativa-icon') as any;
    // contadorView.setAttribute('title', this.getMensagemRevisaoJustificativa());
    const contentRevisoes = document.querySelector('#revisoes-justificativa-icon > div[slot=content]') as any;
    const iconRevisoes = document.querySelector('#revisoes-justificativa-icon > sl-icon') as any;
    if (this.getRevisoesJustificativa().length !== 0) {
      contentRevisoes.innerHTML = this.getMensagemRevisaoJustificativa();
      iconRevisoes.classList.add('revisoes-justificativa-icon__ativo');
      iconRevisoes.removeAttribute('disabled');
    } else {
      contentRevisoes.innerHTML = 'Revisões na justificativa';
      iconRevisoes.classList.remove('revisoes-justificativa-icon__ativo');
      this.desabilitaBtnAceitarRevisoes(this.getRevisoesJustificativa().length === 0);
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
    //this.atualizaQuantidadeRevisao();
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

  // private ativarDesativarMarcaDeRevisao(): void {
  //   ativarDesativarMarcaDeRevisao(rootStore);
  //   this.checkedSwitchMarcaAlteracao();
  // }

  // private checkedSwitchMarcaAlteracao = (): void => {
  //   const switchMarcaAlteracaoView = document.getElementById('chk-em-revisao-justificativa') as any;
  //   setCheckedElement(switchMarcaAlteracaoView, rootStore.getState().elementoReducer.emRevisao);
  // };

  // private atualizaQuantidadeRevisao = (): void => {
  //   atualizaQuantidadeRevisao(rootStore.getState().elementoReducer.revisoes, document.getElementById(this._idBadgeQuantidadeRevisao) as any, true);
  // };
}
