import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { negrito, sublinhado } from '../../../assets/icons/icons';
import { Observable } from '../../util/observable';
import { atualizaRevisaoJustificativa } from '../../redux/elemento/reducer/atualizaRevisaoJustificativa';
import { rootStore } from '../../redux/store';
import { atualizaQuantidadeRevisao, RevisaoJustificativaEnum, RevisaoTextoLivreEnum } from '../../redux/elemento/util/revisaoUtil';
import { Revisao } from '../../model/revisao/revisao';
import { connect } from 'pwa-helpers';
import { uploadAnexoDialog } from './uploadAnexoDialog';
import { Anexo } from '../../model/emenda/emenda';
import { atualizaRevisaoTextoLivre } from '../../redux/elemento/reducer/atualizaRevisaoTextoLivre';
import { Modo } from '../../redux/elemento/enum/enumUtil';
import { editorTextoRicoCss } from '../editor-texto-rico/editor-texto-rico.css';
import { EstiloTextoClass } from '../editor-texto-rico/estilos-texto';
import { quillTableCss } from '../editor-texto-rico/quill.table.css';
import TableModule from '../../assets/js/quill1-table/index.js';
import { removeElementosTDOcultos } from './texto-rico-util';
import { StateEvent, StateType } from '../../redux/state';

const DefaultKeyboardModule = Quill.import('modules/keyboard');
const DefaultClipboardModule = Quill.import('modules/clipboard');

@customElement('editor-texto-rico')
export class EditorTextoRicoComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) texto = '';
  @state() @property({ type: Array }) anexos: Anexo[] = [];
  @property({ type: String, attribute: 'registro-evento' }) registroEvento = '';

  @property({ type: String })
  modo = '';

  onChange: Observable<string> = new Observable<string>();
  private timerOnChange?: any;

  quill?: Quill;

  icons = Quill.import('ui/icons');

  private MAX_WIDTH_IMAGEM = 400;

  _textoAntesRevisao?: string;
  get textoAntesRevisao(): string | undefined {
    // TODO: se contém revisão e texto antes da revisão for igual ao texto atual, ainda assim retorna texto antes da revisão
    return this._textoAntesRevisao === this.texto || !this._textoAntesRevisao ? undefined : this._textoAntesRevisao;
  }

  public limparRedimencionamentoImagens(): void {
    const imagens = document.querySelectorAll('#editor-texto-rico-emenda-inner img');
    if (imagens?.length) {
      imagens.forEach(img => {
        img.removeAttribute('width');
        img.removeAttribute('height');
      });
    }
  }

  public redimencionarImagens(): void {
    const imagens = document.querySelectorAll('#editor-texto-rico-emenda-inner img');
    if (imagens?.length) {
      imagens.forEach(img => this.redimencionarImagem(img as HTMLImageElement));
    }
  }

  private redimencionarImagem(img: HTMLImageElement): void {
    const imgWidth = img.width;
    const imgHeight = img.height;
    if (imgWidth > this.MAX_WIDTH_IMAGEM) {
      const porcentagem = (imgWidth - this.MAX_WIDTH_IMAGEM) / imgWidth;
      img.width = imgWidth - imgWidth * porcentagem;
      img.height = imgHeight - imgHeight * porcentagem;
    }
  }

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
    const events: StateEvent[] = state.elementoReducer.ui?.events;
    if (events) {
      this.atualizaRevisaoIcon();

      if (events.some(ev => ev.stateType === StateType.RevisaoAtivada)) {
        this._textoAntesRevisao = this.texto;
      } else if (events.some(ev => ev.stateType === StateType.RevisaoDesativada)) {
        this._textoAntesRevisao = undefined;
      }
    }
  }

  labelAnexo = (): string => {
    const lengthAnexos = this.anexos?.length;
    return lengthAnexos === 1 ? '1 anexo' : lengthAnexos > 1 ? `${lengthAnexos} anexos` : '';
  };

  render(): TemplateResult {
    return html`
      ${quillTableCss} ${editorTextoRicoCss} ${this.modo === Modo.TEXTO_LIVRE ? this.renderBotaoAnexo() : ''}

      <div class="panel-revisao">
        <lexml-switch-revisao modo="${this.modo}" class="revisao-container" .nomeSwitch="${this.getNomeSwitch()}" .nomeBadgeQuantidadeRevisao="${this.getNomeBadge()}">
        </lexml-switch-revisao>

        <sl-tooltip id="${this.getIdTooltip()}" placement="bottom-end">
          <div slot="content">
            <div>${this.modo === Modo.JUSTIFICATIVA ? 'Revisões na justificativa' : 'Revisões no texto livre'}</div>
          </div>
          <sl-icon name="person-check-fill"></sl-icon>
        </sl-tooltip>

        <sl-button id="${this.getIdButtonAceitarRevisoes()}" variant="default" size="small" title="Limpar revisões" @click=${(): void => this.aceitarRevisoes()} disabled circle>
          <sl-icon name="check-lg"></sl-icon>
        </sl-button>
      </div>
      <div id="${this.id}-inner" class="editor-texto-rico" @onTableInTable=${this.onTableInTable}></div>
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
    //this.icons['anexo'] = anexo + ;
    this.icons['bold'] = negrito;
    this.icons['underline'] = sublinhado;
  }

  private renderBotaoAnexo(): TemplateResult {
    return html`
      <div class="panel-anexo">
        <button type="button" style="width:auto" title="Enviar anexo" @click=${(): any => uploadAnexoDialog(this.anexos, this.atualizaAnexo)}>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 35 35" data-name="Layer 2" id="Layer_2">
              <path
                d="M18,34.75A11.32,11.32,0,0,1,6.69,23.45V8A7.78,7.78,0,0,1,22.25,8V22.49a4.58,4.58,0,1,1-9.15,0V9.29a1.25,1.25,0,0,1,2.5,0v13.2a2.08,2.08,0,1,0,4.15,0V8A5.28,5.28,0,0,0,9.19,8V23.45A8.82,8.82,0,0,0,18,32.25c4.6,0,7.81-3.62,7.81-8.8V9.66a1.25,1.25,0,0,1,2.5,0V23.45C28.31,30,24,34.75,18,34.75Z"
              />
            </svg>
            ${this.labelAnexo()}
          </span>
        </button>
      </div>
    `;
  }

  private timerAlerta?: any;
  private onTableInTable = (): void => {
    clearTimeout(this.timerAlerta);
    this.timerAlerta = setTimeout(() => this.alertar('Não é permitido inserir uma tabela dentro de outra tabela.'), 100);
  };

  private alertar(mensagem: string): void {
    const alert = Object.assign(document.createElement('sl-alert'), {
      variant: 'danger',
      closable: true,
      duration: 4000,
      innerHTML: `
        <sl-icon name="exclamation-octagon" slot="icon"></sl-icon>
        ${mensagem}
      `,
    });
    document.body.append(alert);
    alert.toast();
  }

  private getIdTooltip = (): string => {
    return this.modo === Modo.JUSTIFICATIVA ? 'revisoes-justificativa-icon' : 'revisoes-texto-livre-icon';
  };

  private getIdButtonAceitarRevisoes = (): string => {
    return this.modo === Modo.JUSTIFICATIVA ? 'aceita-revisao-justificativa' : 'aceita-revisao-texto-livre';
  };

  firstUpdated(): void {
    this.init();
  }

  disconnectedCallback(): void {
    this.quill?.off('text-change', this.updateTexto);
    this.quill?.off('selection-change', this.onSelectionChange);
    super.disconnectedCallback();
  }

  init = (): void => {
    const quillContainer = document.querySelector(`#${this.id}-inner`) as HTMLElement;
    if (quillContainer) {
      Quill.register('modules/keyboard', DefaultKeyboardModule, true);
      Quill.register('modules/clipboard', DefaultClipboardModule, true);
      Quill.register('modules/table', TableModule, true);
      Quill.register('formats/estilo-texto', EstiloTextoClass, true);
      this.quill = new Quill(quillContainer, {
        formats: ['estilo', 'bold', 'italic', 'image', 'underline', 'align', 'list', 'script', 'blockquote', 'image', 'table', 'tr', 'td'],
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              undo: this.undo,
              redo: this.redo,
            },
          },
          table: {
            cellSelectionOnClick: false,
          },
          history: {
            delay: 0,
            maxStack: 500,
            userOnly: true,
          },
          clipboard: {},
          keyboard: {
            // Since Quill’s default handlers are added at initialization, the only way to prevent them is to add yours in the configuration.
            bindings: {
              tab: {
                key: 'tab',
                handler: (range: any, keycontext: any): any => {
                  const Delta = Quill.import('delta');
                  const outSideOfTable = TableModule.keyboardHandler(this.quill, 'tab', range, keycontext);
                  if (outSideOfTable && this.quill) {
                    //for some reason when you return true as quill says it should hand it to the default like the other bindings... for tab it doesnt.
                    this.quill.history.cutoff(); //mimic the exact same thing quill does
                    const delta = new Delta().retain(range.index).delete(range.length).insert('\t');
                    this.quill.updateContents(delta as any, Quill.sources.USER);
                    this.quill.history.cutoff();
                    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                  }
                },
              },
              shiftTab: {
                key: 'tab',
                shiftKey: true,
                handler: (range: any, keycontext: any): any => {
                  return TableModule.keyboardHandler(this.quill, 'shiftTab', range, keycontext);
                },
              },
              selectAll: {
                key: 'a',
                ctrlKey: true,
                handler: (range: any, keycontext: any): any => {
                  return TableModule.keyboardHandler(this.quill, 'selectAll', range, keycontext);
                },
              },
              backspace: {
                key: 'backspace',
                handler: (range: any, keycontext: any): any => {
                  return TableModule.keyboardHandler(this.quill, 'backspace', range, keycontext);
                },
              },
              delete: {
                key: 'delete',
                handler: (range: any, keycontext: any): any => {
                  return TableModule.keyboardHandler(this.quill, 'delete', range, keycontext);
                },
              },
              undo: {
                ctrlKey: true,
                key: 'z',
                handler: (range: any, keycontext: any): any => {
                  return TableModule.keyboardHandler(this.quill, 'undo', range, keycontext);
                },
              },
              redo: {
                ctrlKey: true,
                key: 'y',
                handler: (range: any, keycontext: any): any => {
                  return TableModule.keyboardHandler(this.quill, 'redo', range, keycontext);
                },
              },
              redo2: {
                ctrlKey: true,
                shiftKey: true,
                key: 'z',
                handler: (range: any, keycontext: any): any => {
                  return TableModule.keyboardHandler(this.quill, 'redo', range, keycontext);
                },
              },
              copy: {
                ctrlKey: true,
                key: 'c',
                handler: (range: any, keycontext: any): any => {
                  return TableModule.keyboardHandler(this.quill, 'copy', range, keycontext);
                },
              },
            },
          },
        },
        placeholder: '',
        theme: 'snow',
      });

      this.setContent(this.texto);
      this.addBotoesExtra();
      this.configureTooltip();
      this.elTableManagerButton = this.querySelectorAll('span.ql-table')[1] as HTMLSpanElement;
      this.quill?.on('text-change', this.updateTexto);
      this.quill?.on('selection-change', this.onSelectionChange);
    }
  };

  private elTableManagerButton?: HTMLSpanElement;
  onSelectionChange = (range: any): void => {
    setTimeout(() => {
      const format = range && this.quill?.getFormat(range);
      this.highLightBotaoGerenciarTabela(format);
    }, 0);
  };

  highLightBotaoGerenciarTabela = (format: any): void => {
    format?.td ? this.elTableManagerButton?.classList.add('table-selected') : this.elTableManagerButton?.classList.remove('table-selected');
  };

  addBotoesExtra = (): void => {
    const toolbarContainer = this.quill!.getModule('toolbar').container;
    const elAnexo = this.querySelector('.panel-anexo');
    const elRevisao = this.querySelector('.panel-revisao')!;

    if (elAnexo) {
      elAnexo.parentNode!.removeChild(elAnexo);
      toolbarContainer.appendChild(elAnexo);
    }

    elRevisao.parentNode!.removeChild(elRevisao);
    toolbarContainer.appendChild(elRevisao);
  };

  configureTooltip = (): void => {
    const toolbarContainer = this.quill!.getModule('toolbar').container;
    this.setTitle(toolbarContainer, 'button.ql-bold', 'Negrito (Ctrl+b)');
    this.setTitle(toolbarContainer, 'button.ql-italic', 'Itálico (Ctrl+i)');
    this.setTitle(toolbarContainer, 'button.ql-underline', 'Sublinhado (Ctrl+u)');
    this.setTitle(toolbarContainer, 'button.ql-list[value="ordered"]', 'Lista ordenada');
    this.setTitle(toolbarContainer, 'button.ql-list[value="bullet"]', 'Lista não ordenada');
    this.setTitle(toolbarContainer, 'button.ql-blockquote', 'Bloco de citação');
    this.setTitle(toolbarContainer, 'button.ql-script[value="sub"]', 'Subscrito');
    this.setTitle(toolbarContainer, 'button.ql-script[value="super"]', 'Sobrescrito');
    this.setTitle(toolbarContainer, '.ql-align .ql-picker-options > span:nth-child(1)', 'Alinhar à esquerda');
    this.setTitle(toolbarContainer, '.ql-align .ql-picker-options > span:nth-child(2)', 'Centralizar');
    this.setTitle(toolbarContainer, '.ql-align .ql-picker-options > span:nth-child(3)', 'Alinhar à direita');
    this.setTitle(toolbarContainer, '.ql-align .ql-picker-options > span:nth-child(4)', 'Justificar');
    this.setTitle(toolbarContainer, 'button.ql-clean', 'Limpar formatação');
    this.setTitle(toolbarContainer, 'button.ql-image', 'Inserir imagem');
    this.setTitle(toolbarContainer, 'button.ql-undo', 'Desfazer (Ctrl+z)');
    this.setTitle(toolbarContainer, 'button.ql-redo', 'Refazer (Ctrl+y)');
  };

  setTitle = (toolbarContainer: HTMLElement, seletor: string, title: string): void => toolbarContainer.querySelector(seletor)?.setAttribute('title', title);

  setContent = (texto: string): void => {
    if (!this.quill || !this.quill.root) {
      return;
    }

    this.texto = texto;

    const textoAjustado = (texto || '')
      .replace(/indent/g, 'ql-indent')
      .replace(/align-justify/g, 'ql-align-justify')
      .replace(/align-center/g, 'ql-align-center')
      .replace(/align-right/g, 'ql-align-right');

    this.quill!.history.clear(); // Não remover: isso é um workaround para o bug que ocorre ao limpar conteúdo depois de alguma inserção de tabela
    this.quill.setContents(this.quill.clipboard.convert(textoAjustado), 'silent');
    setTimeout(() => this.quill!.history.clear(), 100); // A linha anterior gera um history, então é necessário limpar novamente.
  };

  updateTexto = (): void => {
    const texto = this.ajustaHtml(this.quill?.root.innerHTML);
    this.texto = texto === '<p><br></p>' ? '' : texto;
    this.agendarEmissaoEventoOnChange();
    this.buildRevisoes();
    this.onSelectionChange(this.quill?.getSelection());
  };

  ajustaHtml = (html = ''): string => {
    const result = html
      .replace(/ql-indent/g, 'indent')
      .replace(/ql-align-justify/g, 'align-justify')
      .replace(/ql-align-center/g, 'align-center')
      .replace(/ql-align-right/g, 'align-right');

    return removeElementosTDOcultos(result);
  };

  buildRevisoes = (): void => {
    if (this.modo === Modo.JUSTIFICATIVA) {
      atualizaRevisaoJustificativa(rootStore.getState().elementoReducer);
    } else {
      atualizaRevisaoTextoLivre(rootStore.getState().elementoReducer);
    }
    this.atualizaRevisaoIcon();
    this.desabilitaBtnAceitarRevisoes(this.getRevisoes().length === 0, this.getIdButtonAceitarRevisoes());
  };

  undo = (): any => {
    if (TableModule.keyboardHandler(this.quill, 'undo', this.quill?.getSelection(true), undefined)) {
      this.quill?.history.undo();
    }
  };

  redo = (): any => {
    if (TableModule.keyboardHandler(this.quill, 'redo', this.quill?.getSelection(true), undefined)) {
      this.quill?.history.redo();
    }
  };

  atualizaAnexo = (anexo: Anexo[]): void => {
    this.anexos = [...anexo];
  };

  private getNomeSwitch = (): string => {
    return this.modo === Modo.JUSTIFICATIVA ? 'chk-em-revisao-justificativa' : 'chk-em-revisao-texto-livre';
  };

  private getNomeBadge = (): string => {
    return this.modo === Modo.JUSTIFICATIVA ? 'badge-marca-alteracao-justificativa' : 'badge-marca-alteracao-texto-livre';
  };

  private atualizaRevisaoIcon = (): void => {
    const idIcon = '#' + this.getIdTooltip() + '>';
    const contentRevisoes = document.querySelector(idIcon + 'div[slot=content]') as any;
    const iconRevisoes = document.querySelector(idIcon + 'sl-icon') as any;

    if (contentRevisoes && iconRevisoes) {
      if (this.getRevisoes().length !== 0) {
        contentRevisoes.innerHTML = this.getMensagemRevisoes();
        iconRevisoes.classList.add(this.getIdTooltip() + '__ativo');
        iconRevisoes.removeAttribute('disabled');
      } else {
        contentRevisoes.innerHTML = this.getTitle();
        iconRevisoes.classList.remove(this.getIdTooltip() + '__ativo');
        this.desabilitaBtnAceitarRevisoes(this.getRevisoes().length === 0, this.getIdButtonAceitarRevisoes());
      }
    }
  };

  private getTitle = (): string => {
    return this.modo === Modo.JUSTIFICATIVA ? 'Revisões na justificativa' : 'Revisões no texto livre';
  };

  private getMensagemRevisoes = (): string => {
    let revisoes: any;

    if (this.modo === Modo.JUSTIFICATIVA) {
      revisoes = this.getRevisoesJustificativa();
    } else {
      revisoes = this.getRevisoesTextoLivre();
    }

    let mensagem = '<ul class="lista-revisoes-justificativa">';

    if (revisoes.length > 0) {
      revisoes!.forEach((revisao: Revisao) => {
        const pipe = ' | ';
        mensagem = mensagem + '<li>' + revisao.usuario.nome + pipe + revisao.dataHora + '</li>';
      });
    }
    return mensagem + '</ul>';
  };

  private aceitarRevisoes = (): void => {
    if (this.modo === Modo.JUSTIFICATIVA) {
      this.aceitaRevisoesJustificativa();
    } else {
      this.aceitaRevisoesTextoLivre();
    }
  };

  private aceitaRevisoesJustificativa = (): void => {
    atualizaRevisaoJustificativa(rootStore.getState().elementoReducer, true);
    this.atualizaRevisaoIcon();
    this.desabilitaBtnAceitarRevisoes(this.getRevisoesJustificativa().length === 0, 'aceita-revisao-justificativa');
    this.atualizaQuantidadeRevisao();
  };

  private aceitaRevisoesTextoLivre = (): void => {
    atualizaRevisaoTextoLivre(rootStore.getState().elementoReducer, true);
    this.atualizaRevisaoIcon();
    this.desabilitaBtnAceitarRevisoes(this.getRevisoesTextoLivre().length === 0, 'aceita-revisao-texto-livre');
    this.atualizaQuantidadeRevisao();
  };

  private getRevisoes = (): Revisao[] => {
    return this.modo === Modo.JUSTIFICATIVA ? this.getRevisoesJustificativa() : this.getRevisoesTextoLivre();
  };

  private getRevisoesJustificativa = (): Revisao[] => {
    const revisoes = rootStore.getState().elementoReducer.revisoes;
    return revisoes.filter(r => r.descricao === RevisaoJustificativaEnum.JustificativaAlterada);
  };

  private getRevisoesTextoLivre = (): Revisao[] => {
    const revisoes = rootStore.getState().elementoReducer.revisoes;
    return revisoes.filter(r => r.descricao === RevisaoTextoLivreEnum.TextoLivreAlterado);
  };

  private desabilitaBtnAceitarRevisoes = (desabilita: boolean, button: string): void => {
    const contadorView = document.getElementById(button) as any;
    if (desabilita) {
      contadorView.setAttribute('disabled', desabilita);
    } else {
      contadorView.removeAttribute('disabled');
    }
  };

  private atualizaQuantidadeRevisao = (): void => {
    atualizaQuantidadeRevisao(rootStore.getState().elementoReducer.revisoes, document.getElementById(this.getNomeBadge()) as any, this.modo);
  };
}

const toolbarOptions = [
  [{ estilo: [false, 'ementa', 'norma-alterada'] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  // ['blockquote'],
  ['undo', 'redo'],
  [{ align: [] }],
  ['clean'],
  [
    {
      table: TableModule.tableOptions(),
    },
    {
      table: [
        // 'insert',
        'append-row-above',
        'append-row-below',
        'append-col-before',
        'append-col-after',
        'remove-col',
        'remove-row',
        'remove-table',
        'split-cell',
        'merge-selection',
        // 'remove-cell',
        // 'remove-selection',
      ],
    },
  ],
  ['image'],
];
