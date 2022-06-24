import { SlButton, SlInput, SlRadioButton } from '@shoelace-style/shoelace';
import { html, LitElement, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { editorStyles } from '../../assets/css/editor.css';
import { quillSnowStyles } from '../../assets/css/quill.snow.css';
import { DescricaoSituacao } from '../../model/dispositivo/situacao';
import { ClassificacaoDocumento } from '../../model/documento/classificacao';
import { Elemento } from '../../model/elemento';
import { hasElementoAscendenteAdicionado, getDispositivoFromElemento } from '../../model/elemento/elementoUtil';
import { ElementoAction, getAcao, isAcaoMenu } from '../../model/lexml/acao';
import { adicionarElementoAction } from '../../model/lexml/acao/adicionarElementoAction';
import { atualizarElementoAction } from '../../model/lexml/acao/atualizarElementoAction';
import { atualizarReferenciaElementoAction } from '../../model/lexml/acao/atualizarReferenciaElementoAction';
import { atualizarTextoElementoAction } from '../../model/lexml/acao/atualizarTextoElementoAction';
import { autofixAction } from '../../model/lexml/acao/autoFixAction';
import { elementoSelecionadoAction } from '../../model/lexml/acao/elementoSelecionadoAction';
import { moverElementoAbaixoAction } from '../../model/lexml/acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../../model/lexml/acao/moverElementoAcimaAction';
import { redoAction } from '../../model/lexml/acao/redoAction';
import { removerElementoAction } from '../../model/lexml/acao/removerElementoAction';
import { removerElementoSemTextoAction } from '../../model/lexml/acao/removerElementoSemTextoAction';
import { renumerarElementoAction } from '../../model/lexml/acao/renumerarElementoAction';
import { shiftTabAction } from '../../model/lexml/acao/shiftTabAction';
import { tabAction } from '../../model/lexml/acao/tabAction';
import { transformarAction } from '../../model/lexml/acao/transformarAction';
import { UndoAction } from '../../model/lexml/acao/undoAction';
import { validarArticulacaAction } from '../../model/lexml/acao/validarArticulacaoAction';
import { validarElementoAction } from '../../model/lexml/acao/validarElementoAction';
import { getNomeExtenso } from '../../model/lexml/documento/urnUtil';
import { podeRenumerar, rotuloParaEdicao } from '../../model/lexml/numeracao/numeracaoUtil';
import { TipoDispositivo } from '../../model/lexml/tipo/tipoDispositivo';
import { AutoFix } from '../../model/lexml/util/mensagem';
import { StateEvent, StateType } from '../../redux/state';
import { rootStore } from '../../redux/store';
import { EtaBlotConteudo } from '../../util/eta-quill/eta-blot-conteudo';
import { EtaBlotMenu } from '../../util/eta-quill/eta-blot-menu';
import { EtaBlotMenuBotao } from '../../util/eta-quill/eta-blot-menu-botao';
import { EtaBlotMenuConteudo } from '../../util/eta-quill/eta-blot-menu-conteudo';
import { EtaBlotMenuItem } from '../../util/eta-quill/eta-blot-menu-item';
import { EtaBlotRotulo } from '../../util/eta-quill/eta-blot-rotulo';
import { EtaContainerTable } from '../../util/eta-quill/eta-container-table';
import { Keyboard } from '../../util/eta-quill/eta-keyboard';
import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { EtaQuillUtil } from '../../util/eta-quill/eta-quill-util';
import { Subscription } from '../../util/observable';
import { isNumeracaoValidaPorTipo } from './../../model/lexml/numeracao/numeracaoUtil';
import { informarNormaDialog } from './informarNormaDialog';
import { CmdEmdUtil } from '../../emenda/comando-emenda-util';
import { adicionaAlerta, removerAlerta } from '../../redux/alerta/reducer/actions';
import { LexmlEtaComponent } from '../lexml-eta.component';

@customElement('lexml-eta-editor')
export class EditorComponent extends connect(rootStore)(LitElement) {
  private _quill?: EtaQuill;
  private get quill(): EtaQuill {
    return this._quill as EtaQuill;
  }

  private inscricoes: Subscription[] = [];
  private timerOnChange?: any;

  constructor() {
    super();
    this.tabIndex = -1;
  }

  createRenderRoot(): LitElement {
    return this;
  }

  async firstUpdated(): Promise<void> {
    this.inicializar(this.configEditor());
    this.querySelectorAll('.ql-bold, .ql-italic, .ql-script').forEach(tool => {
      tool.addEventListener('click', (event: any) => {
        event.stopImmediatePropagation();
      });
    });
  }

  stateChanged(state: any): void {
    if (!this.quill) {
      this.quillNaoInicializado(state);
      return;
    }
    this.quill!.undoEstruturaVazio = (state.elementoReducer.past ?? []).length === 0;
    this.quill!.redoEstruturaVazio = (state.elementoReducer.future ?? []).length === 0;

    if (state.elementoReducer.ui) {
      if (state.elementoReducer.ui.message) {
        this.alertar(state.elementoReducer.ui.message.descricao);
      } else {
        this.processarStateEvents(state.elementoReducer.ui.events);
      }
    }
  }

  disconnectedCallback(): void {
    this.inscricoes.forEach((i: Subscription) => i.cancel());
    this.removeEventListener('ontextchange', (event: any) => console.log(event));
    this.removeEventListener('rotulo', (event: any) => console.log(event));
    this.destroiQuill();
    super.disconnectedCallback();
  }

  render(): TemplateResult {
    return html`
      ${quillSnowStyles}
      ${editorStyles}
      <style>
        :host {
          --lx-eta-editor-height: 100%;
          --lx-eta-editor-overflow: display;
        }
        #lx-eta-editor {
          height: var(--lx-eta-editor-height);
          overflow: var(--lx-eta-editor-overflow);
          display: block;
        }
        .sl-toast-stack sl-alert::part(base) {
          background-color: var(--sl-color-danger-100);
        }
      </style>
      <div id="lx-eta-box">
        <div id="lx-eta-barra-ferramenta">
          <button class="ql-bold" title="Negrito (Ctrl+b)"></button>
          <button class="ql-italic" title="Itálico (Ctrl+i)"></button>
          <button class="ql-script" value="sub" title="Subscrito"></button>
          <button class="ql-script" value="super" title="Sobrescrito"></button>

          <button @click=${this.onClickUndo} class="lx-eta-ql-button lx-eta-btn-desfazer" title="Desfazer (Ctrl+Z)">
            <svg class="icon-undo-redo" id="undo" viewBox="0 0 512 512">
              <path
                d="M488,256c0,123.4-100.5,223.9-223.9,223.9c-48.8,0-95.2-15.6-134.2-44.9c-14.1-10.6-17-30.7-6.4-44.8 c10.6-14.1,30.6-16.9,44.8-6.4c27.8,20.9,61,31.9,95.9,31.9c88.1,0,159.8-71.7,159.8-159.8S352.3,96.2,264.2,96.2 c-37.5,0-73.1,13.5-101.3,36.6L208,178c17,17,5,46.1-19.1,46.1H43.2c-10.6,0-19.2-8.6-19.2-19.2V59C24,35,53.1,23,70.1,40l47.6,47.6 c40.2-34.9,91.8-55.5,146.4-55.5C387.5,32.1,488,132.6,488,256z"
              />
            </svg>
          </button>
          <button @click=${this.onClickRedo} class="lx-eta-ql-button" title="Refazer (Ctrl+y)">
            <svg class="icon-undo-redo lx-eta-rebate-180-graus" id="redo" viewBox="0 0 512 512">
              <path
                d="M488,256c0,123.4-100.5,223.9-223.9,223.9c-48.8,0-95.2-15.6-134.2-44.9c-14.1-10.6-17-30.7-6.4-44.8 c10.6-14.1,30.6-16.9,44.8-6.4c27.8,20.9,61,31.9,95.9,31.9c88.1,0,159.8-71.7,159.8-159.8S352.3,96.2,264.2,96.2 c-37.5,0-73.1,13.5-101.3,36.6L208,178c17,17,5,46.1-19.1,46.1H43.2c-10.6,0-19.2-8.6-19.2-19.2V59C24,35,53.1,23,70.1,40l47.6,47.6 c40.2-34.9,91.8-55.5,146.4-55.5C387.5,32.1,488,132.6,488,256z"
              />
            </svg>
          </button>
          <button type="button" class="ql-clean">
            <svg class="" viewBox="0 0 18 18">
              <line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"></line>
              <line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"></line>
              <line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"></line>
              <line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"></line>
              <rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"></rect>
            </svg>
          </button>

          <button @click=${this.onClickDispositivoAtual} class="lx-eta-ql-button lx-eta-btn-disp-atual" title="Localizar dispositivo atual">D</button>
          <input type="button" @click=${this.artigoOndeCouber} class="${'ql-hidden'} btn--artigoOndeCouber" value="Propor artigo onde couber" title="Artigo onde couber"></input>
          <lexml-eta-help></lexml-eta-help>
        </div>
        <div id="lx-eta-editor"></div>
      </div>
      <elix-toast id="toast-alerta" duration="3000">
        <div id="toast-msg"></div>
      </elix-toast>
      <div id="lx-eta-buffer"><p></p></div>
    `;
  }

  private formatacaoAlterada(): void {
    const texto = document.getSelection()?.toString();
    if (texto) {
      this.agendarEmissaoEventoOnChange('toolbar');
    }
  }

  private onClickUndo(): void {
    this.quill.undo();
  }

  private onClickRedo(): void {
    this.quill.redo();
  }

  private onClickDispositivoAtual(): void {
    this.quill.setSelection(this.quill.getIndex(this.quill.linhaAtual.blotConteudo), 0, Quill.sources.SILENT);
    this.quill.focus();
  }

  private artigoOndeCouber(): void {
    //rootStore.dispatch(validarArticulacaAction.execute());
  }

  private onSelectionChange: SelectionChangeHandler = (range: RangeStatic, oldRange: RangeStatic, source: Sources): void => {
    if (range?.length === 0 && source === Quill.sources.USER) {
      this.ajustarLinkParaNorma();
    }
  };

  private ajustarLinkParaNorma(): void {
    const linkTooltip = document.querySelector('a.ql-preview');
    const href = linkTooltip?.getAttribute('href');
    if (href?.startsWith('urn')) {
      const url = 'https://normas.leg.br/?urn=' + href;
      linkTooltip!.setAttribute('href', url);
      linkTooltip!.innerHTML = getNomeExtenso(href);
    }
  }

  private onBold(value: any): void {
    if (this.quill.keyboard.verificarOperacaoTecladoPermitida()) {
      this.quill.format('bold', value);
      this.formatacaoAlterada();
    }
  }

  private onItalic(value: any): void {
    if (this.quill.keyboard.verificarOperacaoTecladoPermitida()) {
      this.quill.format('italic', value);
      this.formatacaoAlterada();
    }
  }

  private onScript(value: any): void {
    if (this.quill.keyboard.verificarOperacaoTecladoPermitida()) {
      this.quill.format('script', value);
      this.formatacaoAlterada();
    }
  }

  private onOperacaoInvalida(): void {
    this.alertar('Operação não permitida.');
  }

  private isDesmembramento(textoAnterior: string, textoLinhaAtual: string, textoNovaLinha: string): boolean {
    return (textoLinhaAtual + textoNovaLinha).localeCompare(textoAnterior) !== 0;
  }

  private adicionarElemento(range: RangeStatic): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const blotConteudo: EtaBlotConteudo = linha.blotConteudo;

    const indexInicio: number = this.quill.inicioConteudoAtual ?? 0;
    const indexFim: number = indexInicio + blotConteudo!.tamanho ?? 0;
    let textoLinha = '';
    let textoNovaLinha = '';

    if (range.index === indexInicio) {
      textoLinha = '';
      textoNovaLinha = blotConteudo.html;
    } else if (range.index === indexFim) {
      textoLinha = blotConteudo.html;
      textoNovaLinha = '';
    } else {
      const tamanhoNovaLinha: number = indexFim - range.index;
      textoLinha = this.quill.getConteudoHtmlParteLinha(blotConteudo, 0, blotConteudo.tamanho - tamanhoNovaLinha);
      textoNovaLinha = this.quill.getConteudoHtmlParteLinha(blotConteudo, range.index - indexInicio, tamanhoNovaLinha);
    }
    const elemento: Elemento = this.criarElemento(linha.uuid, linha.lexmlId, linha.tipo, textoLinha, linha.numero, linha.hierarquia);

    if (this.isDesmembramento(blotConteudo.htmlAnt, textoLinha, textoNovaLinha)) {
      const elemento: Elemento = this.criarElemento(linha.uuid, linha.lexmlId, linha.tipo, textoLinha + textoNovaLinha, linha.numero, linha.hierarquia);
      rootStore.dispatch(atualizarTextoElementoAction.execute(elemento));
    }
    rootStore.dispatch(adicionarElementoAction.execute(elemento, textoNovaLinha));
  }

  private async renumerarElemento(): Promise<any> {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const atual = linha.blotConteudo.html;
    const elemento: Elemento = this.criarElemento(
      linha!.uuid ?? 0,
      linha.lexmlId,
      linha!.tipo ?? '',
      '',
      linha.numero,
      linha.hierarquia,
      linha.descricaoSituacao,
      linha.existeNaNormaAlterada
    );

    let opcaoInformada;

    if (!podeRenumerar(rootStore.getState().elementoReducer.articulacao, elemento)) {
      return;
    }

    const dialogElem = document.createElement('sl-dialog');
    document.body.appendChild(dialogElem);

    dialogElem.label = 'Informar numeração de dispositivo';
    dialogElem.addEventListener('sl-request-close', (event: any) => {
      if (event.detail.source === 'overlay') {
        event.preventDefault();
      }
    });
    const dispositivoAdicionado = elemento.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO;

    const content = document.createRange().createContextualFragment(`
      <div class="input-validation-required">
        <sl-input type="text" placeholder="" label="Numeração do dispositivo:" clearable></sl-input>
        <br/>
        <div id="dispositivoDeNorma">
            O dispositivo já existe na norma a ser alterada?
            <sl-radio-group label="O dispositivo já existe na norma a ser alterada?">
              <sl-radio-button name="existeNaNorma" id="existente" value="true">Sim</sl-radio-button>
              <sl-radio-button name="existeNaNorma" id="adicionado" value="false">Não</sl-radio-button>
            </sl-radio-group>
        </div>
      </div>
      <br/>
      <sl-alert variant="warning" closable class="alert-closable">
        <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
        <div class="erro"></div>
      </sl-alert>
      <sl-button slot="footer" variant="default">Cancelar</sl-button>
      <sl-button slot="footer" variant="primary">Ok</sl-button>
    `);

    const input = <SlInput>content.querySelector('sl-input');
    input.value = `${rotuloParaEdicao(linha.blotRotulo.rotulo)}`;

    const dispositivoNaNorma = <any>content.getElementById('dispositivoDeNorma');
    if (elemento.existeNaNormaAlterada !== undefined) {
      (content.getElementById(`${elemento.existeNaNormaAlterada ? 'existente' : 'adicionado'}`) as SlRadioButton).checked = true;
    }

    if (dispositivoAdicionado) {
      const r = hasElementoAscendenteAdicionado(rootStore.getState().elementoReducer.articulacao, elemento);
      dispositivoNaNorma.disabled = r;
      dispositivoNaNorma.style.display = r ? 'none' : 'block';
      (content.querySelector('#existente')! as any).checked = elemento.existeNaNormaAlterada;
    }

    const botoes = content.querySelectorAll('sl-button');
    const cancelar = botoes[0];
    const ok = botoes[1];

    const erro = <HTMLDivElement>content.querySelector('.erro');
    const alerta = content.querySelector('sl-alert');

    ok.onclick = (): void => {
      if (!validarElementoAdicionado()) {
        return;
      }
      this.quill.focus();
      dialogElem?.hide();
      dialogElem?.remove();

      if (elemento.conteudo?.texto !== atual) {
        elemento.conteudo!.texto = atual;
        rootStore.dispatch(atualizarElementoAction.execute(elemento));
      }

      rootStore.dispatch(renumerarElementoAction.execute(elemento, input.value.trim(), opcaoInformada === 'true'));
    };

    cancelar.onclick = (): void => {
      this.quill.focus();
      dialogElem?.hide();
      dialogElem?.remove();
    };

    const validarElementoAdicionado = (): boolean => {
      if (dispositivoNaNorma && !dispositivoNaNorma.disabled) {
        document.querySelectorAll('sl-radio-button').forEach(o => {
          if ((o as SlRadioButton).checked) {
            opcaoInformada = (o as SlRadioButton).value;
          }
        });

        if (dispositivoAdicionado && opcaoInformada === undefined) {
          const msgErro = 'É necessário informar se se trata de dispositivo existente na norma alterada';
          erro.innerText = msgErro;
          msgErro ? alerta?.show() : alerta?.hide();
          return false;
        }
      }
      erro.style.display = 'none';
      alerta?.hide();
      return true;
    };

    const validar = (): string => {
      const numeracao = input.value;
      if (/^\s*$/.test(numeracao)) {
        return 'A numeração não pode ser vazia.';
      }
      return '';
    };

    const validarInput = (evt: any): void => {
      let msgErro = validar();
      if (!msgErro && elemento.tipo && !isNumeracaoValidaPorTipo(input.value, elemento.tipo)) {
        msgErro = 'Numeração inválida.';
      }
      erro.innerText = msgErro;
      msgErro ? alerta?.show() : alerta?.hide();
      ok.disabled = Boolean(msgErro);
      if (!ok.disabled) {
        if (evt.key === 'Enter') {
          ok.click();
        }
      }
    };

    input.addEventListener('keyup', validarInput);
    input.addEventListener('sl-clear', validarInput);

    await dialogElem.appendChild(content);
    await dialogElem?.show();
    ok.disabled = Boolean(validar());
    (input as SlInput).focus();
  }

  private removerElementoSemTexto(key: string): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const elemento: Elemento = this.criarElemento(linha!.uuid ?? 0, linha.lexmlId, linha!.tipo ?? '', '', linha.numero, linha.hierarquia);
    rootStore.dispatch(removerElementoSemTextoAction.execute(elemento, key));
  }

  private removerElemento(): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const mensagem = `Você realmente deseja remover o dispositivo ${linha.blotRotulo.rotulo}?`;

    this.confirmar(mensagem, ['Sim', 'Não'], (event: CustomEvent) => {
      const choice: any = event.detail.closeResult;
      if (choice === 'Sim') {
        const elemento: Elemento = this.criarElemento(linha!.uuid ?? 0, linha.lexmlId, linha!.tipo ?? '', '', linha.numero, linha.hierarquia);
        rootStore.dispatch(removerElementoAction.execute(elemento));
      }
      this.quill.focus();
    });
  }

  private moverElemento(ev: KeyboardEvent): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const blotConteudo: EtaBlotConteudo = linha.blotConteudo;
    const textoLinha = blotConteudo.html;

    const elemento: Elemento = this.criarElemento(linha.uuid, linha.lexmlId, linha.tipo, textoLinha, linha.numero, linha.hierarquia);

    if (ev.key === 'ArrowUp') {
      rootStore.dispatch(moverElementoAcimaAction.execute(elemento));
    } else if (ev.key === 'ArrowDown') {
      rootStore.dispatch(moverElementoAbaixoAction.execute(elemento));
    }
  }

  private transformarElemento(ev: KeyboardEvent): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const blotConteudo: EtaBlotConteudo = linha.blotConteudo;
    const textoLinha = blotConteudo.html;

    const elemento: Elemento = this.criarElemento(linha.uuid, linha.lexmlId, linha.tipo, textoLinha, linha.numero, linha.hierarquia);

    if (ev.key.toLowerCase() === 'a') {
      rootStore.dispatch(transformarAction(elemento, TipoDispositivo.artigo.name!));
    } else if (ev.key.toLowerCase() === 'l') {
      rootStore.dispatch(transformarAction(elemento, TipoDispositivo.alinea.name!));
    } else if (ev.key.toLowerCase() === 'n') {
      rootStore.dispatch(transformarAction(elemento, TipoDispositivo.inciso.name!));
    } else if (ev.key.toLowerCase() === 'o') {
      rootStore.dispatch(transformarAction(elemento, TipoDispositivo.omissis.name!));
    } else if (ev.key.toLowerCase() === 'p') {
      rootStore.dispatch(transformarAction(elemento, TipoDispositivo.paragrafo.name!));
    } else if (ev.key.toLowerCase() === 't') {
      rootStore.dispatch(transformarAction(elemento, TipoDispositivo.item.name!));
    } else if (Keyboard.keys.TAB) {
      rootStore.dispatch(ev.shiftKey ? shiftTabAction(elemento) : tabAction(elemento));
    }
  }

  private elementoSelecionado(uuid: number): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const elemento: Elemento = this.criarElemento(uuid, linha.lexmlId, linha.tipo ?? '', '', linha.numero, linha.hierarquia);
    rootStore.dispatch(elementoSelecionadoAction.execute(elemento));
    this.quill.processandoMudancaLinha = false;
  }

  private undoRedoEstrutura(tipo: string): void {
    //
    // TODO: Chamar action para undo ou redo - estrutura.
    //
    if (tipo === 'undo') {
      rootStore.dispatch(UndoAction());
    } else {
      rootStore.dispatch(redoAction());
    }
  }

  private processarStateEvents(events: StateEvent[]): void {
    events?.forEach((event: StateEvent): void => {
      switch (event.stateType) {
        case StateType.DocumentoCarregado:
          this.destroiQuill();
          this.inicializar(this.configEditor());
          this.carregarArticulacao(event.elementos ?? []);
          break;

        case StateType.InformarNorma:
          informarNormaDialog(event.elementos![0], this.quill, rootStore, atualizarReferenciaElementoAction);
          break;

        case StateType.ElementoIncluido:
          this.inserirNovoElementoNoQuill(event.elementos![0], event.referencia as Elemento, true);
          this.inserirNovosElementosNoQuill(event, true);
          break;

        case StateType.ElementoModificado:
        case StateType.ElementoRestaurado:
          this.atualizarQuill(event);
          this.montarMenuContexto(event);
          break;

        case StateType.ElementoSuprimido:
          this.atualizarSituacao(event);
          this.montarMenuContexto(event);
          break;

        case StateType.ElementoRemovido:
          this.removerLinhaQuill(event);
          break;

        case StateType.ElementoRenumerado:
          this.renumerarQuill(event);
          break;

        case StateType.ElementoValidado:
          this.atualizarMensagemQuill(event);
          break;

        case StateType.ElementoSelecionado:
          this.montarMenuContexto(event);
          this.atualizarMensagemQuill(event);
          break;

        case StateType.ElementoMarcado:
          this.marcarLinha(event);
          break;

        case StateType.SituacaoElementoModificada:
          this.atualizarSituacao(event);
          this.montarMenuContexto(event);
          this.atualizarAtributos(event);
          this.atualizarMensagemQuill(event);
          break;
      }
      this.quill.limparHistory();
    });

    // Os eventos que estão no array abaixo devem emitir um custom event "ontextchange"
    const eventosQueDevemEmitirTextChange = [
      StateType.ElementoModificado,
      StateType.ElementoSuprimido,
      StateType.ElementoRestaurado,
      StateType.ElementoIncluido,
      StateType.ElementoRemovido,
      StateType.ElementoRenumerado,
    ];

    const eventosFiltrados = events?.filter(ev => eventosQueDevemEmitirTextChange.includes(ev.stateType)).map(ev => ev.stateType);

    if (eventosFiltrados?.length) {
      this.agendarEmissaoEventoOnChange('stateEvents');
    }
  }

  private marcarLinha(event: StateEvent): void {
    this.quill.desmarcarLinhaAtual(this.quill.linhaAtual);
    const elemento = event.elementos![0];
    const linha = this.quill.getLinha(elemento.uuid!)!;
    const index = this.quill.getIndex(linha.blotConteudo);
    this.quill.setIndex(index, Quill.sources.SILENT);
    this.quill.atualizarLinhaCorrente(linha);
    this.elementoSelecionado(linha.uuid);
    if (event.moverParaFimLinha) {
      setTimeout(() => {
        const posicao = this.quill.getSelection()!.index + this.quill.linhaAtual.blotConteudo.html.length;
        this.quill.setSelection(posicao, 0, Quill.sources.USER);
      }, 0);
    }
  }

  private processarEscolhaMenu(itemMenu: string): void {
    if (itemMenu === 'Remover dispositivo') {
      this.removerElemento();
    } else if (itemMenu === renumerarElementoAction.descricao) {
      this.renumerarElemento();
    } else {
      const linha: EtaContainerTable = this.quill.linhaAtual;
      const elemento: Elemento = this.criarElemento(linha!.uuid ?? 0, linha.lexmlId, linha!.tipo ?? '', '', linha.numero, linha.hierarquia);
      elemento.conteudo!.texto = linha.blotConteudo.html ?? '';
      rootStore.dispatch(getAcao(itemMenu).execute(elemento));
    }
  }

  private inserirNovoElementoNoQuill(elemento: Elemento, referencia: Elemento, selecionarLinha?: boolean): void {
    const linhaRef: EtaContainerTable | undefined = this.quill.getLinha(referencia.uuid!);

    if (linhaRef) {
      const novaLinha: EtaContainerTable = EtaQuillUtil.criarContainerLinha(elemento);

      if (linhaRef.next) {
        novaLinha.insertInto(this.quill.scroll, linhaRef.next);
      } else {
        novaLinha.insertInto(this.quill.scroll);
      }

      const isEmendaArtigoOndeCouber = rootStore.getState().elementoReducer.modo === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
      if (this.quill.linhaAtual?.blotConteudo.html !== '' || novaLinha.blotConteudo.html === '' || isEmendaArtigoOndeCouber || elemento.tipo === 'Omissis') {
        if (selecionarLinha) {
          this.quill.desmarcarLinhaAtual(this.quill.linhaAtual);
          this.quill.marcarLinhaAtual(novaLinha);
          try {
            this.quill.setIndex(this.quill.getIndex(novaLinha.blotConteudo), Quill.sources.SILENT);
          } catch (e) {
            // console.log(e);
          }
        }
      } else {
        this.quill.linhaAtual.blotConteudo.htmlAnt = this.quill.linhaAtual.blotConteudo.html;
      }
      this.quill.linhaAtual.descricaoSituacao = elemento.descricaoSituacao;
      this.quill.linhaAtual.existeNaNormaAlterada = elemento.existeNaNormaAlterada;
      this.quill.linhaAtual.setEstilo(elemento!);
    }
  }

  private inserirNovosElementosNoQuill(event: StateEvent, selecionarLinha?: boolean): void {
    const elementos: Elemento[] = event.elementos ?? [];

    for (let i = 1; i < elementos.length; i++) {
      this.inserirNovoElementoNoQuill(elementos[i], elementos[i - 1], selecionarLinha);
    }
  }

  private atualizarSituacao(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.map((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, linha);
      if (linha) {
        if (elemento.descricaoSituacao !== linha.descricaoSituacao) {
          linha.descricaoSituacao = elemento.descricaoSituacao;
          linha.setEstilo(elemento);
        }
      }
    });
  }

  private atualizarAtributos(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.forEach((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, linha);
      if (linha) {
        linha.atualizarAtributos(elemento);
      }
    });
  }

  private atualizarQuill(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.map((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, linha);
      if (linha) {
        let nivelAlerado = false;

        if (elemento.editavel !== linha.editavel) {
          linha.editavel = elemento.editavel;
        }

        if (elemento.rotulo !== linha.blotRotulo.html) {
          linha.numero = elemento.numero ?? '';
          linha.blotRotulo.format(EtaBlotRotulo.blotName, elemento.rotulo);
        }

        if (elemento.nivel !== linha.nivel) {
          linha.nivel = elemento.nivel;
          linha.format(EtaContainerTable.blotName, elemento);
          nivelAlerado = true;
        }

        if (elemento.agrupador !== linha.agrupador) {
          linha.agrupador = elemento.agrupador;
          linha.blotRotulo.format(EtaBlotRotulo.formatoStyle, elemento);
          if (!nivelAlerado) {
            linha.format(EtaContainerTable.blotName, elemento);
          }
        }

        if (elemento.conteudo?.texto !== linha.blotConteudo.html) {
          linha.blotConteudo.html = elemento.conteudo?.texto ?? '';
        }

        if (elemento.descricaoSituacao !== linha.descricaoSituacao) {
          linha.descricaoSituacao = elemento.descricaoSituacao;
          linha.setEstilo(elemento);
        }

        if (elemento.existeNaNormaAlterada !== linha.existeNaNormaAlterada) {
          linha.existeNaNormaAlterada = elemento.existeNaNormaAlterada;
          linha.domNode.setAttribute('existenanormaalterada', linha.existeNaNormaAlterada);
        }

        if (linha.children.length === 2) {
          linha.children.tail.remove();
        }

        if (elemento.mensagens && elemento.mensagens.length > 0) {
          EtaQuillUtil.criarContainerMensagens(elemento).insertInto(linha);
        }
      }
    });
  }

  private removerLinhaQuill(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.forEach((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, linha);
      if (linha) {
        linha.remove();
      }
    });
    const linhaCursor: EtaContainerTable = this.quill.getLine(this.quill.getSelection(true).index)[0].linha;
    const index: number = this.quill.getIndex(linhaCursor.blotConteudo);

    this.quill.setSelection(index, 0, Quill.sources.SILENT);
    this.quill.marcarLinhaAtual(linhaCursor);
  }

  private renumerarQuill(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.map((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, linha);
      if (linha) {
        linha.blotRotulo.format(EtaBlotRotulo.blotName, elemento.rotulo);
      }
    });
  }

  private atualizarMensagemQuill(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.map((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, linha);

      if (linha) {
        if (linha?.children.length === 2) {
          linha.children.tail.remove();
        }

        if (elemento.mensagens && elemento.mensagens.length > 0) {
          EtaQuillUtil.criarContainerMensagens(elemento).insertInto(linha);
        }
      }
    });
  }

  private montarMenuContexto(event: StateEvent): void {
    const elemento: Elemento = event.elementos ? event.elementos[0] : new Elemento();
    const acoesMenu: ElementoAction[] = (elemento?.acoesPossiveis ?? []).filter((acao: ElementoAction) => isAcaoMenu(acao));

    if (acoesMenu.length > 0) {
      if (!this.quill.linhaAtual || this.quill.linhaAtual.uuid !== elemento.uuid) {
        this.marcarLinha(event);
      }
      const blotMenu: EtaBlotMenu = new EtaBlotMenu();
      const blotMenuConteudo: EtaBlotMenuConteudo = new EtaBlotMenuConteudo(this.quill.linhaAtual.containerDireito.alinhamentoMenu);
      const callback: any = (itemMenu: string) => {
        this.processarEscolhaMenu(itemMenu);
        this.quill.focus();
      };

      new EtaBlotMenuBotao().insertInto(blotMenu);

      acoesMenu.forEach((acao: ElementoAction) => {
        new EtaBlotMenuItem(acao, callback).insertInto(blotMenuConteudo);
      });
      blotMenuConteudo.insertInto(blotMenu);

      this.quill.linhaAtual.blotContainerDireito.remove();
      blotMenu.insertInto(this.quill.linhaAtual.containerDireito);
    }
  }

  private criarElemento(
    uuid: number,
    lexmlId: string,
    tipo: string,
    html: string,
    numero: string,
    hierarquia: any,
    descricaoSituacao?: string,
    existeNaNormaAlterada?: boolean
  ): Elemento {
    const elemento: Elemento = new Elemento();
    elemento.uuid = uuid;
    elemento.lexmlId = lexmlId;
    elemento.tipo = tipo;
    elemento.numero = numero;
    elemento.conteudo = { texto: html };
    elemento.hierarquia = hierarquia;
    elemento.descricaoSituacao = descricaoSituacao;
    elemento.existeNaNormaAlterada = existeNaNormaAlterada;
    return elemento;
  }

  private inicializar(op: QuillOptionsStatic): void {
    const editorHtml: HTMLElement = this.getHtmlElement('lx-eta-editor');
    const bufferHtml: HTMLElement = this.getHtmlElement('lx-eta-buffer');

    EtaQuill.configurar();
    this._quill = new EtaQuill(editorHtml, bufferHtml, op);
    this.quill.on('selection-change', this.onSelectionChange);
    this.inscricoes.push(this.quill.keyboard.operacaoTecladoInvalida.subscribe(this.onOperacaoInvalida.bind(this)));
    this.inscricoes.push(this.quill.keyboard.adicionaElementoTeclaEnter.subscribe(this.adicionarElemento.bind(this)));
    this.inscricoes.push(this.quill.keyboard.moveElemento.subscribe(this.moverElemento.bind(this)));
    this.inscricoes.push(this.quill.keyboard.removeElemento.subscribe(this.removerElemento.bind(this)));
    this.inscricoes.push(this.quill.keyboard.removeElementoSemTexto.subscribe(this.removerElementoSemTexto.bind(this)));
    this.inscricoes.push(this.quill.keyboard.renumeraElemento.subscribe(this.renumerarElemento.bind(this)));
    this.inscricoes.push(this.quill.keyboard.transformaElemento.subscribe(this.transformarElemento.bind(this)));
    this.inscricoes.push(this.quill.undoRedoEstrutura.subscribe(this.undoRedoEstrutura.bind(this)));
    this.inscricoes.push(this.quill.elementoSelecionado.subscribe(this.elementoSelecionado.bind(this)));

    this.inscricoes.push(this.quill.observableSelectionChange.subscribe(this.atualizarTextoElemento.bind(this)));
    this.inscricoes.push(this.quill.keyboard.onChange.subscribe(this.agendarEmissaoEventoOnChange.bind(this)));
    this.inscricoes.push(this.quill.clipboard.onChange.subscribe(this.agendarEmissaoEventoOnChange.bind(this)));

    editorHtml.addEventListener('rotulo', (event: any) => {
      event.stopImmediatePropagation();
      this.renumerarElemento();
    });

    editorHtml.addEventListener('mensagem', (event: any) => {
      event.stopImmediatePropagation();

      const linha: EtaContainerTable = this.quill.linhaAtual;

      if (linha) {
        if (AutoFix.RENUMERAR_DISPOSITIVO === event.detail?.mensagem?.descricao) {
          this.renumerarElemento();
        } else {
          const blotConteudo: EtaBlotConteudo = linha.blotConteudo;
          const elemento: Elemento = this.criarElemento(linha.uuid, linha.lexmlId, linha.tipo, blotConteudo.html, linha.numero, linha.hierarquia);
          rootStore.dispatch(autofixAction.execute(elemento, event.detail.mensagem));
        }
      }
    });
  }

  private agendarEmissaoEventoOnChange(origemEvento: string): void {
    clearTimeout(this.timerOnChange);
    this.timerOnChange = setTimeout(() => this.emitirEventoOnChange(origemEvento), 1000);
  }

  private atualizarTextoElemento(linhaAtual: EtaContainerTable): void {
    if (linhaAtual?.blotConteudo?.alterado) {
      const elemento: Elemento = this.criarElemento(
        linhaAtual.uuid,
        linhaAtual.lexmlId,
        linhaAtual.tipo,
        linhaAtual.blotConteudo?.html ?? '',
        linhaAtual.numero,
        linhaAtual.hierarquia
      );
      rootStore.dispatch(atualizarTextoElementoAction.execute(elemento));
    }
  }

  private alertaGlobalVerificaRenumeracao(linhaAtual: EtaContainerTable): void {
    const elemento: Elemento = this.criarElemento(
      linhaAtual.uuid,
      linhaAtual.lexmlId,
      linhaAtual.tipo,
      linhaAtual.blotConteudo?.html ?? '',
      linhaAtual.numero,
      linhaAtual.hierarquia
    );
    const dispositivo = getDispositivoFromElemento(rootStore.getState().elementoReducer.articulacao, elemento);
    if (dispositivo) {
      if (CmdEmdUtil.verificaNecessidadeRenumeracaoRedacaoFinal([dispositivo])) {
        const alerta = {
          id: 'alerta-global-renumeracao',
          tipo: 'danger',
          mensagem:
            'Os rótulos apresentados servem apenas para o posicionamento correto do novo dispositivo no texto. Serão feitas as renumerações necessárias no momento da consolidação das emendas.',
          podeFechar: true,
        };
        rootStore.dispatch(adicionaAlerta(alerta));
      }
    }
  }

  private alertaGlobalVerificaCorrelacao(): void {
    const dispositivosEmenda = (document.querySelector('lexml-eta') as LexmlEtaComponent).getDispositivosEmenda() || [];
    const listaLexmlIds = Object.values(dispositivosEmenda)
      .flat(1)
      .map(obj => obj.id);
    const artigos = [...new Set(listaLexmlIds.map(lexmlId => lexmlId.split('_').filter(dispositivo => dispositivo.startsWith('art'))[0]))];

    if (artigos.length > 1) {
      const alerta = {
        id: 'alerta-global-correlacao',
        tipo: 'info',
        mensagem:
          'Cada emenda somente pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados antes de submetê-la.',
        podeFechar: true,
      };
      rootStore.dispatch(adicionaAlerta(alerta));
    } else if (rootStore.getState().alertaReducer.alertas.some(alerta => alerta.id === 'alerta-global-correlacao')) {
      rootStore.dispatch(removerAlerta('alerta-global-correlacao'));
    }
  }

  private emitirEventoOnChange(origemEvento: string): void {
    this.atualizarTextoElemento(this.quill.linhaAtual);

    this.dispatchEvent(
      new CustomEvent('onchange', {
        bubbles: true,
        composed: true,
        detail: {
          origemEvento,
        },
      })
    );
    // if (this.quill.linhaAtual.descricaoSituacao === 'Dispositivo Adicionado') {
    //   this.alertaGlobalVerificaRenumeracao(this.quill.linhaAtual);
    // }
    // this.alertaGlobalVerificaCorrelacao();
  }

  private carregarArticulacao(elementos: Elemento[]): void {
    setTimeout(() => {
      this.quill.getLine(0)[0].remove();
      elementos.forEach((elemento: Elemento) => {
        const etaContainerTable = EtaQuillUtil.criarContainerLinha(elemento);
        etaContainerTable.insertInto(this.quill.scroll);
        elemento.tipo === TipoDispositivo.generico.tipo && rootStore.dispatch(validarElementoAction.execute(elemento));
      });
      this.quill.limparHistory();
      if (elementos.length > 1) {
        setTimeout(() => {
          const el = this.quill.getLinha(elementos[1].uuid!);
          if (el?.blotConteudo) {
            this.quill.setSelection(this.quill.getIndex(el?.blotConteudo), 0, Quill.sources.USER);
          }
        }, 0);
      }
      rootStore.dispatch(validarArticulacaAction.execute());
    }, 0);
  }

  private configEditor(): QuillOptionsStatic {
    return {
      formats: ['bold', 'italic', 'link', 'script'],
      modules: {
        toolbar: {
          container: '#lx-eta-barra-ferramenta',
          handlers: {
            bold: this.onBold.bind(this),
            italic: this.onItalic.bind(this),
            script: this.onScript.bind(this),
          },
        },
        history: {
          delay: 0,
          maxStack: 500,
          userOnly: true,
        },
      },
      theme: 'snow',
    };
  }

  private async confirmar(mensagem: string, botoes: string[], callback: any): Promise<void> {
    let choice = '';
    const dialog = document.createElement('sl-dialog');
    dialog.label = 'Confirmação';
    const botoesHtml = `
      <sl-button slot="footer" variant="default">Não</sl-button>
      <sl-button slot="footer" variant="primary">Sim</sl-button>
    `;
    dialog.innerHTML = mensagem + botoesHtml;
    await document.body.appendChild(dialog);
    await dialog.show();
    const botoesDialog = document.querySelectorAll('sl-button');
    const nao = botoesDialog[0] as SlButton;
    const sim = botoesDialog[1] as SlButton;
    sim.focus();

    nao.onclick = (): void => {
      choice = 'Não';
      dialog?.hide();
      dialog?.remove();
    };

    sim.onclick = (): void => {
      choice = 'Sim';
      dialog?.hide();
      dialog?.remove();
    };

    dialog.addEventListener('sl-request-close', (event: any) => {
      if (event.detail.source === 'overlay') {
        event.preventDefault();
      }
    });

    dialog.addEventListener('sl-hide', (event: any) => {
      event.detail.closeResult = choice;
      callback(event);
    });
  }
  private alertar(mensagem: string): void {
    // const toast: any = this.querySelector('#toast-alerta');
    // const elmHtml: HTMLElement = this.querySelector('#toast-msg') as HTMLElement;

    // elmHtml.innerHTML = mensagem;
    // toast.fromEdge = 'top';
    // toast.open();

    const alert = Object.assign(document.createElement('sl-alert'), {
      variant: 'danger',
      closable: true,
      duration: 3000,
      innerHTML: `
        <sl-icon name="exclamation-octagon" slot="icon"></sl-icon>
        ${mensagem}
      `,
    });
    document.body.append(alert);
    alert.toast();
  }

  private quillNaoInicializado(state: any): void {
    let elementos: Elemento[] = [];
    const verificarQuillInicializado: any = (elementos: Elemento[]): void => {
      setTimeout(() => {
        if (!this.quill) {
          verificarQuillInicializado(elementos);
        } else if (elementos.length > 0) {
          this.carregarArticulacao(elementos);
        }
      }, 70);
    };

    if (state.elementoReducer.ui) {
      const event: StateEvent | undefined = state.elementoReducer.ui.events.find((event: StateEvent): boolean => event.stateType === StateType.DocumentoCarregado);
      elementos = event?.elementos ?? [];
    }
    verificarQuillInicializado(elementos);
  }

  private getHtmlElement(id: string): HTMLElement {
    return this.querySelector(`#${id}`) as HTMLElement;
  }

  private destroiQuill(): void {
    this.getHtmlElement('lx-eta-editor')!.innerHTML = '';
    this.getHtmlElement('lx-eta-buffer')!.innerHTML = '';
    if (this.quill) {
      this.quill.off('selection-change', this.onSelectionChange);
      this.quill.destroi();
    }
    this._quill = undefined;
  }
}
