import { html, LitElement, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { iconeMarginBottom, iconeTextIndent, negrito, sublinhado, iconeNotaDeRodape } from '../../../assets/icons/icons';
import { Observable } from '../../util/observable';
import { rootStore } from '../../redux/store';
import {
  atualizaQuantidadeRevisaoTextoRico,
  getQuantidadeRevisoes,
  getQuantidadeRevisoesJustificativa,
  getQuantidadeRevisoesTextoLivre,
} from '../../redux/elemento/util/revisaoUtil';
import { connect } from 'pwa-helpers';
import { uploadAnexoDialog } from './uploadAnexoDialog';
import { showMenuImagem } from './menu-imagem';
import { Anexo } from '../../model/emenda/emenda';
import { Modo } from '../../redux/elemento/enum/enumUtil';
import { editorTextoRicoCss } from '../editor-texto-rico/editor-texto-rico.css';
import { EstiloTextoClass } from '../editor-texto-rico/estilos-texto';
import { quillTableCss } from '../editor-texto-rico/quill.table.css';
import TableModule from '../../assets/js/quill1-table/index.js';
import TableTrick from '../../assets/js/quill1-table/js/TableTrick.js';
import { removeElementosTDOcultos } from './texto-rico-util';
import { NoIndentClass } from './text-indent';
import { MarginBottomClass } from './margin-bottom';
import { StateEvent, StateType } from '../../redux/state';
import { LexmlEmendaConfig } from '../../model/lexmlEmendaConfig';
import { AlterarLarguraTabelaColunaModalComponent } from './alterar-largura-tabela-coluna-modal';
import { AlterarLarguraImagemModalComponent } from './alterar-largura-imagem-modal';
import { notaRodapeCss } from './notaRodape.css';
import { NOTA_RODAPE_CHANGE_EVENT, NOTA_RODAPE_REMOVE_EVENT, NotaRodape } from './notaRodape';
import { SwitchRevisaoComponent } from '../switchRevisao/switch-revisao.component';
import { atualizaRevisaoJustificativa } from '../../redux/elemento/reducer/atualizaRevisaoJustificativa';
import { atualizaRevisaoTextoLivre } from '../../redux/elemento/reducer/atualizaRevisaoTextoLivre';
import { adicionarAlerta } from '../../model/alerta/acao/adicionarAlerta';
import { removerAlerta } from '../../model/alerta/acao/removerAlerta';
import { QuillUtil } from './quill-util';

const DefaultKeyboardModule = Quill.import('modules/keyboard');
const DefaultClipboardModule = Quill.import('modules/clipboard');
const Delta = Quill.import('delta');

const CLASS_BUTTON_ACEITAR_REVISAO = 'aceitar-revisao';
const CLASS_BUTTON_REJEITAR_REVISAO = 'rejeitar-revisao';

@customElement('editor-texto-rico')
export class EditorTextoRicoComponent extends connect(rootStore)(LitElement) {
  @property({ type: String }) texto = '';
  @property({ type: Array }) anexos: Anexo[] = [];
  @property({ type: Array }) notasRodape: NotaRodape[] = [];
  @property({ type: String, attribute: 'registro-evento' }) registroEvento = '';
  @property({ type: Object }) lexmlEtaConfig: LexmlEmendaConfig = new LexmlEmendaConfig();

  @property({ type: String })
  modo = '';

  onChange: Observable<string> = new Observable<string>();
  private timerOnChange?: any;

  quill?: Quill;

  lastSelecion?: any;

  icons = Quill.import('ui/icons');

  @query('#lexml-alterar-largura-coluna-modal')
  private alterarLarguraColunaModal!: AlterarLarguraTabelaColunaModalComponent;

  @query('#lexml-alterar-largura-tabela-modal')
  private alterarLarguraTabelaModal!: AlterarLarguraTabelaColunaModalComponent;

  @query('#lexml-alterar-largura-img-modal')
  private alterarLarguraImagemModal!: AlterarLarguraImagemModalComponent;

  @query('#lexml-switch-revisao-component')
  private switchRevisaoComponent!: SwitchRevisaoComponent;

  _textoAntesRevisao?: string;
  get textoAntesRevisao(): string | undefined {
    // TODO: se contém revisão e texto antes da revisão for igual ao texto atual, ainda assim retorna texto antes da revisão
    //return (!this.existeRevisaoByModo() && this._textoAntesRevisao === this.texto) || !this._textoAntesRevisao ? undefined : this._textoAntesRevisao;
    return !this.existeRevisaoByModo() ? undefined : this._textoAntesRevisao;
  }

  public setTextoAntesRevisao(texto: string | undefined): void {
    this._textoAntesRevisao = texto;
  }

  private existeRevisaoByModo = (): boolean => {
    if (this.modo === Modo.TEXTO_LIVRE) {
      return getQuantidadeRevisoesTextoLivre(rootStore.getState().elementoReducer.revisoes) > 0;
    } else {
      return getQuantidadeRevisoesJustificativa(rootStore.getState().elementoReducer.revisoes) > 0;
    }
  };

  showAlterarLarguraImagemModal(img: any, width: string): void {
    this.alterarLarguraImagemModal.show(img, width);
  }

  private showAlterarLarguraColunaModal(width: string): void {
    this.alterarLarguraColunaModal.show(width);
  }

  private hideAlterarLarguraColunaModal(): void {
    this.alterarLarguraColunaModal.hide();
  }

  private showAlterarLarguraTabelaModal(width: string): void {
    this.alterarLarguraTabelaModal.show(width);
  }

  private hideAlterarLarguraTabelaModal(): void {
    this.alterarLarguraTabelaModal.hide();
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
    const moduloRevisao = (this.quill as any)?.revisao;
    const events: StateEvent[] = state.elementoReducer.ui?.events;
    if (events) {
      if (events.some(ev => ev.stateType === StateType.RevisaoAtivada)) {
        moduloRevisao && (moduloRevisao.emRevisao = true);
        if (!this._textoAntesRevisao) {
          this._textoAntesRevisao = this.texto;
        }
      } else if (events.some(ev => ev.stateType === StateType.RevisaoDesativada)) {
        moduloRevisao && (moduloRevisao.emRevisao = false);
        this._textoAntesRevisao = undefined;
      }

      if (events.some(ev => ev.stateType === StateType.AtualizaUsuario) && moduloRevisao) {
        moduloRevisao.usuario = state.elementoReducer.usuario?.nome || 'Anônimo';
      }
    }
  }

  labelAnexo = (): string => {
    const lengthAnexos = this.anexos?.length;
    return lengthAnexos === 1 ? '1 anexo' : lengthAnexos > 1 ? `${lengthAnexos} anexos` : '';
  };

  render(): TemplateResult {
    return html`
      ${quillTableCss} ${editorTextoRicoCss} ${notaRodapeCss} ${this.modo === Modo.TEXTO_LIVRE ? this.renderBotaoAnexo() : ''}

      <div class="panel-revisao">
        <lexml-switch-revisao
          id="lexml-switch-revisao-component"
          modo="${this.modo}"
          class="revisao-container"
          .nomeSwitch="${this.getNomeSwitch()}"
          .nomeBadgeQuantidadeRevisao="${this.getNomeBadge()}"
        >
        </lexml-switch-revisao>

        <sl-button class="aceitar-revisao" variant="default" size="small" title="Aceitar revisões" @click=${(): void => this.aceitarRevisoes()} disabled circle>
          <sl-icon name="check-lg"></sl-icon>
        </sl-button>
        <sl-button class="rejeitar-revisao" variant="default" size="small" title="Rejeitar revisões" @click=${(): void => this.rejeitarRevisoes()} disabled circle>
          <sl-icon name="x"></sl-icon>
        </sl-button>
      </div>
      <div id="${this.id}-inner" class="editor-texto-rico" @onTableInTable=${this.onTableInTable}></div>
      <lexml-alterar-largura-tabela-coluna-modal id="lexml-alterar-largura-tabela-modal" tipo="tabela"></lexml-alterar-largura-tabela-coluna-modal>
      <lexml-alterar-largura-tabela-coluna-modal id="lexml-alterar-largura-coluna-modal" tipo="coluna"></lexml-alterar-largura-tabela-coluna-modal>
      <lexml-alterar-largura-imagem-modal id="lexml-alterar-largura-img-modal"></lexml-alterar-largura-imagem-modal>
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
    this.icons['text-indent'] = iconeTextIndent;
    this.icons['margin-bottom'] = iconeMarginBottom;
    this.icons['nota-rodape'] = iconeNotaDeRodape;
  }

  private renderBotaoAnexo(): TemplateResult {
    return html`
      <div class="panel-anexo">
        <button type="button" style="width:auto" title="Anexo" @click=${(): any => uploadAnexoDialog(this.anexos, this.atualizaAnexo, this)}>
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

  firstUpdated(): void {
    this.init();
  }

  disconnectedCallback(): void {
    this.quill?.off('text-change', this.updateTexto);
    this.quill?.off('selection-change', this.onSelectionChange);
    super.disconnectedCallback();
  }

  init = (): void => {
    const quillContainer = this.querySelector(`#${this.id}-inner`) as HTMLElement;
    if (quillContainer) {
      Quill.register('modules/keyboard', DefaultKeyboardModule, true);
      Quill.register('modules/clipboard', DefaultClipboardModule, true);
      Quill.register('modules/table', TableModule, true);
      Quill.register('formats/estilo-texto', EstiloTextoClass, true);
      Quill.register('formats/text-indent', NoIndentClass, true);
      Quill.register('formats/margin-bottom', MarginBottomClass, true);

      const customToolbarOptions = [...toolbarOptions];
      const customFormatsOptions = [...formatsOptions];
      if (this.modo === Modo.JUSTIFICATIVA) {
        customToolbarOptions.push(['nota-rodape']);
        customToolbarOptions[1] = ['bold', 'italic', 'underline', 'link'];
        customFormatsOptions.push('nota-rodape');
        customFormatsOptions.push('link');
      }

      this.quill = new Quill(quillContainer, {
        formats: customFormatsOptions,
        modules: {
          toolbar: {
            container: customToolbarOptions,
            handlers: {
              undo: this.undo,
              redo: this.redo,
              image: this.imageHandler,
            },
          },
          aspasCurvas: true,
          notaRodape: true,
          table: {
            cellSelectionOnClick: false,
          },
          revisao: {
            usuario: rootStore.getState().elementoReducer.usuario?.nome || 'Anônimo',
            emRevisao: false,
            gerenciarKeydown: true,
            tableModule: TableModule,
            tableTrick: TableTrick,
          },
          history: {
            delay: 1000,
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
              // Desabilita autoformatação de listas
              // Referência: https://github.com/quilljs/quill/blob/1.3.7/modules/keyboard.js (linha 249)
              'list autofill': {
                key: ' ',
                handler: (): boolean => true,
              },
            },
          },
        },
        placeholder: '',
        theme: 'snow',
      });

      this.setContent(this.texto, this.notasRodape);
      this.addBotoesExtra();
      this.configureTooltip();
      this.elTableManagerButton = this.querySelectorAll('span.ql-table')[1] as HTMLSpanElement;
      this.quill?.on('text-change', this.updateTexto);
      this.quill?.on('selection-change', this.onSelectionChange);
      this.alterarLarguraColunaModal.callback = this.alterarLarguraDaColuna;
      this.alterarLarguraTabelaModal.callback = this.alterarLarguraDaTabela;
      this.alterarLarguraImagemModal.callback = this.alterarLarguraDaImagem;

      quillContainer.addEventListener('contextmenu', this.menuContextImagem);
      quillContainer.addEventListener('click', this.onClick);

      const toolbar = this.quill.getModule('toolbar');
      toolbar.addHandler('table', (value: string) => {
        TableModule.configToolbar(this.quill, value);

        if (value === 'change-width-col-modal') {
          this.lastSelecion = this.quill?.getSelection();
          const td = TableTrick.find_td_node(this.quill);
          this.showAlterarLarguraColunaModal(td.width);
        } else if (value === 'change-width-table-modal') {
          this.lastSelecion = this.quill?.getSelection();
          const table = TableTrick.find_table_node(this.quill);
          this.showAlterarLarguraTabelaModal(table.width);
        }
      });

      this.quill.root.addEventListener(NOTA_RODAPE_CHANGE_EVENT, this.updateNotasRodape);
      this.quill.root.addEventListener(NOTA_RODAPE_REMOVE_EVENT, this.updateNotasRodape);
      this.buildRevisoes();

      QuillUtil.configurarAcoesLink(this.quill!);
    }
  };

  menuContextImagem = (ev: MouseEvent): void => {
    const elemento = ev.target as Element;
    if (elemento.tagName === 'IMG') {
      ev.preventDefault();
      showMenuImagem(this, elemento, ev.pageY, ev.pageX);
    }
  };

  onClick = (ev: MouseEvent): void => {
    const elemento = ev.target as Element;
    if (elemento.tagName === 'IMG') {
      ev.preventDefault();
      this.selectImage(elemento);
    }
  };

  selectImage = (img: any): void => {
    const imgBlot = Quill.find(img);
    imgBlot && this.quill!.setSelection(this.quill!.getIndex(imgBlot), 1);
  };

  imageHandler = (): void => {
    let fileInput = this.querySelector('input.ql-image[type=file]') as any;
    if (fileInput === null) {
      fileInput = document.createElement('input');
      fileInput.setAttribute('type', 'file');
      fileInput.setAttribute('hidden', 'true');
      fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
      fileInput.classList.add('ql-image');
      fileInput.addEventListener('change', () => {
        if (fileInput.files !== null && fileInput.files[0] !== null) {
          const reader = new FileReader();
          reader.onload = e => {
            if (this.tamanhoPermitido(e)) {
              const range = this.quill!.getSelection(true);
              this.quill!.updateContents(new Delta().retain(range.index).delete(range.length).insert({ image: e.target!.result }), Quill.sources.USER);
              fileInput.value = '';
              fileInput.remove();
            } else {
              this.alertar(`Essa imagem ultrapassa o tamanho máximo permitido (${Math.trunc(this.lexmlEtaConfig.tamanhoMaximoImagem / 1024)}MB)`);
              fileInput.remove();
            }
          };
          reader.readAsDataURL(fileInput.files[0]);
        }
      });
      this.appendChild(fileInput);
    }
    fileInput.click();
  };

  tamanhoPermitido = (e: any): boolean => {
    const size = Math.round(e.loaded / 1024);
    return size < this.lexmlEtaConfig.tamanhoMaximoImagem;
  };

  alterarLarguraDaColuna = (valor: number): void => {
    this.quill!.setSelection(this.lastSelecion);
    TableTrick.changeWidthCol(this.quill, valor);
    this.updateApenasTexto();
    this.hideAlterarLarguraColunaModal();
  };

  alterarLarguraDaTabela = (valor: number): void => {
    this.quill!.setSelection(this.lastSelecion);
    TableTrick.changeWidthTable(this.quill, valor);
    this.updateApenasTexto();
    this.hideAlterarLarguraTabelaModal();
  };

  alterarLarguraDaImagem = (img: any, valor: number): void => {
    const blot = Quill.find(img);
    blot && blot.format('width', `${valor}%`);
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
    this.setTitle(toolbarContainer, 'button.ql-margin-bottom', 'Distância entre parágrafos');
    this.setTitle(toolbarContainer, 'button.ql-text-indent', 'Recuo de parágrafo');
    this.setTitle(toolbarContainer, 'button.ql-table', 'Tabela');
    this.setTitle(toolbarContainer, 'button.ql-nota-rodape', 'Nota de rodapé');
  };

  setTitle = (toolbarContainer: HTMLElement, seletor: string, title: string): void => toolbarContainer.querySelector(seletor)?.setAttribute('title', title);

  setContent = (texto: string, notasRodape: NotaRodape[] = []): void => {
    if (!this.quill || !this.quill.root) {
      return;
    }

    this.texto = texto;

    const textoAjustado = (texto || '')
      .replace(/align-justify/g, 'ql-align-justify')
      .replace(/align-center/g, 'ql-align-center')
      .replace(/align-right/g, 'ql-align-right');

    this.quill!.history.clear(); // Não remover: isso é um workaround para o bug que ocorre ao limpar conteúdo depois de alguma inserção de tabela
    (this.quill as any).revisao.modo = this.modo;
    this.configAbrindoTexto(true);
    this.quill.setContents(this.quill.clipboard.convert(textoAjustado), 'silent');
    this.configAbrindoTexto(false);
    this.notasRodape = notasRodape;

    setTimeout(() => {
      this.quill!.history.clear();
      (this.quill as any).notasRodape.associar(notasRodape);
    }, 100); // A linha anterior gera um history, então é necessário limpar novamente.

    this.atualizaStatusElementosRevisao();
  };

  configAbrindoTexto = (valor: boolean): void => {
    (this.quill as any).revisao.isAbrindoTexto = valor;
    (this.quill as any).notasRodape.isAbrindoTexto = valor;
    const emRevisao = (this.quill as any).revisao.emRevisao;
    if (!valor) {
      if (this.getQuantidadeDeRevisoes() > 0 && !emRevisao) {
        if (this.switchRevisaoComponent) {
          this.switchRevisaoComponent.ativarDesativarMarcaDeRevisao(false);
          setTimeout(() => {
            this.alertaGlobalRevisao();
          }, 0);
        }
      }
    }
    // setTimeout(() => {
    //   this.atualizaQuantidadeRevisao(this.getQuantidadeDeRevisoes());
    // }, 0);
  };

  updateApenasTexto = (): void => {
    const texto = this.ajustaHtml(this.quill?.root.innerHTML);
    this.texto = texto === '<p><br></p>' ? '' : texto;
  };

  updateTexto = (): void => {
    const texto = this.ajustaHtml(this.quill?.root.innerHTML);
    this.texto = texto === '<p><br></p>' ? '' : texto;
    this.agendarEmissaoEventoOnChange();
    this.onSelectionChange(this.quill?.getSelection());
    this.atualizaStatusElementosRevisao(false);
    this.buildRevisoes();
    this.alertaGlobalRevisao();
  };

  public alertaGlobalRevisao(): void {
    const id = 'alerta-global-revisao';

    if (this.getQuantidadeDeRevisoes() > 0 || getQuantidadeRevisoes(rootStore.getState().elementoReducer.revisoes) > 0) {
      if (rootStore.getState().elementoReducer.ui?.alertas?.filter(a => a.id === id).length === 0) {
        const alerta = {
          id: id,
          tipo: 'info',
          mensagem: 'Este documento contém marcas de revisão e não deve ser protocolado até que estas sejam removidas.',
          podeFechar: true,
          exibirComandoEmenda: true,
        };
        setTimeout(() => {
          rootStore.dispatch(adicionarAlerta(alerta));
        }, 0);
      }
    } else if (rootStore.getState().elementoReducer.ui?.alertas?.some(alerta => alerta.id === id)) {
      rootStore.dispatch(removerAlerta(id));
    }
  }

  updateNotasRodape = (): void => {
    this.notasRodape = (this.quill as any).notasRodape.getNotasRodape();
    // this.agendarEmissaoEventoOnChange();
  };

  ajustaHtml = (html = ''): string => {
    let result = html
      .replace(/ql-indent/g, 'indent')
      .replace(/ql-align-justify/g, 'align-justify')
      .replace(/ql-align-center/g, 'align-center')
      .replace(/ql-align-right/g, 'align-right');

    result = removeElementosTDOcultos(result);
    return (this.quill as any).notasRodape.ajustarConteudoTagsNotaRodape(result);
  };

  undo = (): any => {
    this.quill?.focus();
    if ((this.quill as any).revisao.handleUndo(this.quill?.getSelection(), undefined)) {
      this.quill?.history.undo();
      this.atualizaStatusElementosRevisao();
    }
  };

  redo = (): any => {
    this.quill?.focus();
    if ((this.quill as any).revisao.handleRedo(this.quill?.getSelection(), undefined)) {
      this.quill?.history.redo();
      this.atualizaStatusElementosRevisao();
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

  private aceitarRevisoes = (): void => {
    (this.quill as any).revisao.revisarTodos(true);
    this.setTextoAntesRevisao(undefined);
    this.atualizaStatusElementosRevisao();
    this.removeRevisoes();
  };

  private getQuantidadeDeRevisoes = (): number => {
    return (this.quill as any)?.revisao?.getQuantidadeRevisoes() ?? 0;
  };

  private rejeitarRevisoes = (): void => {
    (this.quill as any).revisao.revisarTodos(false);
    this.setTextoAntesRevisao(undefined);
    this.atualizaStatusElementosRevisao();
    this.removeRevisoes();
  };

  private timerAtualizaStatusElementosRevisao?: any;
  private atualizaStatusElementosRevisao = (immediate = true): void => {
    const fnUpdate = (): void => {
      const quantidade = this.getQuantidadeDeRevisoes();
      if (quantidade > 0 && !rootStore.getState().elementoReducer.emRevisao) {
        if (this.switchRevisaoComponent) {
          this.switchRevisaoComponent.ativarDesativarMarcaDeRevisao(false);
        }
      }

      if (quantidade === 0) {
        this.removeRevisoes();
      } else if (quantidade > 0) {
        this.buildRevisoes();
      }
      this.desabilitaBtn(quantidade === 0, CLASS_BUTTON_REJEITAR_REVISAO);
      this.desabilitaBtn(quantidade === 0, CLASS_BUTTON_ACEITAR_REVISAO);
      this.atualizaQuantidadeRevisao(quantidade);
    };

    if (immediate) {
      fnUpdate();
    } else {
      clearTimeout(this.timerAtualizaStatusElementosRevisao);
      this.timerAtualizaStatusElementosRevisao = setTimeout(fnUpdate, 100);
    }
  };

  private desabilitaBtn = (desabilita: boolean, button: string): void => {
    const contadorView = this.querySelector(`.${button}`) as any;
    if (contadorView) {
      if (desabilita) {
        contadorView.setAttribute('disabled', desabilita);
      } else {
        contadorView.removeAttribute('disabled');
      }
    }
  };

  private buildRevisoes = (): void => {
    if (this.modo === Modo.JUSTIFICATIVA) {
      atualizaRevisaoJustificativa(rootStore.getState().elementoReducer);
    } else {
      atualizaRevisaoTextoLivre(rootStore.getState().elementoReducer);
    }
  };

  private removeRevisoes = (): void => {
    atualizaRevisaoJustificativa(rootStore.getState().elementoReducer, true);
    atualizaRevisaoTextoLivre(rootStore.getState().elementoReducer, true);
  };

  private atualizaQuantidadeRevisao = (quantidade: number): void => {
    const elemento = this.querySelector(`#${this.getNomeBadge()}`) as any;
    atualizaQuantidadeRevisaoTextoRico(quantidade, elemento);

    // if (elemento) {
    //   elemento.innerHTML = quantidade;
    // }
  };

  editarNotaRodape(idNotaRodape: string): void {
    (this.quill as any).notasRodape.editar(idNotaRodape);
  }

  removerNotaRodape(idNotaRodape: string): void {
    (this.quill as any).notasRodape.remover(idNotaRodape);
  }
}

const formatsOptions = [
  'estilo',
  'bold',
  'italic',
  'image',
  'underline',
  'align',
  'list',
  'script',
  'image',
  'table',
  'tr',
  'td',
  'link',
  'text-indent',
  'margin-bottom',
  'width',
  'added',
  'removed',
];

const toolbarOptions = [
  [{ estilo: [false, 'ementa', 'norma-alterada'] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  // ['blockquote'],
  ['undo', 'redo'],
  [{ align: [] }],
  [{ 'text-indent': '0px' }],
  [{ 'margin-bottom': '0px' }],
  ['clean'],
  [
    {
      table: TableModule.tableOptions(),
    },
    {
      table: [
        // 'insert',
        'change-width-col-modal',
        'change-width-table-modal',
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
