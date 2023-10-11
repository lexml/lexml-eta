import { isRevisaoPrincipal, getQuantidadeRevisoes } from './../../redux/elemento/util/revisaoUtil';
import { colarTextoArticuladoDialog, onChangeColarDialog } from './colarTextoArticuladoDialog';
import { InfoTextoColado } from './../../redux/elemento/util/colarUtil';
import { AdicionarAgrupadorArtigo } from './../../model/lexml/acao/adicionarAgrupadorArtigoAction';
import { adicionarAgrupadorArtigoDialog } from './adicionarAgrupadorArtigoDialog';
import { SlButton, SlInput } from '@shoelace-style/shoelace';
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { CmdEmdUtil } from '../../emenda/comando-emenda-util';
import { adicionarAlerta } from '../../model/alerta/acao/adicionarAlerta';
import { removerAlerta } from '../../model/alerta/acao/removerAlerta';
import { ClassificacaoDocumento } from '../../model/documento/classificacao';
import { Elemento } from '../../model/elemento';
import { ElementoAction, isAcaoMenu } from '../../model/lexml/acao';
import { adicionarAlteracaoComAssistenteAction } from '../../model/lexml/acao/adicionarAlteracaoComAssistenteAction';
import { adicionarElementoAction } from '../../model/lexml/acao/adicionarElementoAction';
import { atualizarReferenciaElementoAction } from '../../model/lexml/acao/atualizarReferenciaElementoAction';
import { atualizarTextoElementoAction } from '../../model/lexml/acao/atualizarTextoElementoAction';
import { autofixAction } from '../../model/lexml/acao/autoFixAction';
import { elementoSelecionadoAction } from '../../model/lexml/acao/elementoSelecionadoAction';
import { considerarElementoExistenteNaNorma, considerarElementoNovoNaNorma } from '../../model/lexml/acao/informarExistenciaDoElementoNaNormaAction';
import { moverElementoAbaixoAction } from '../../model/lexml/acao/moverElementoAbaixoAction';
import { moverElementoAcimaAction } from '../../model/lexml/acao/moverElementoAcimaAction';
import { redoAction } from '../../model/lexml/acao/redoAction';
import { removerElementoAction } from '../../model/lexml/acao/removerElementoAction';
import { removerElementoSemTextoAction } from '../../model/lexml/acao/removerElementoSemTextoAction';
import { renumerarElementoAction } from '../../model/lexml/acao/renumerarElementoAction';
import { shiftTabAction } from '../../model/lexml/acao/shiftTabAction';
import { tabAction } from '../../model/lexml/acao/tabAction';
import { UndoAction } from '../../model/lexml/acao/undoAction';
import { validarArticulacaAction } from '../../model/lexml/acao/validarArticulacaoAction';
import { validarElementoAction } from '../../model/lexml/acao/validarElementoAction';
import { normalizaSeForOmissis } from '../../model/lexml/conteudo/conteudoUtil';
import { TEXTO_OMISSIS } from '../../model/lexml/conteudo/textoOmissis';
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
import { AjudaModalComponent } from '../ajuda/ajuda.modal.component';
import { AtalhosModalComponent } from '../ajuda/atalhos.modal.component';
import { LexmlEtaComponent } from '../lexml-eta.component';
import { atualizarNotaAlteracaoAction } from './../../model/lexml/acao/atualizarNotaAlteracaoAction';
import { isNumeracaoValidaPorTipo } from './../../model/lexml/numeracao/numeracaoUtil';
import { ComandoEmendaModalComponent } from './../comandoEmenda/comandoEmenda.modal.component';
import { assistenteAlteracaoDialog } from './assistenteAlteracaoDialog';
import { editarNotaAlteracaoDialog } from './editarNotaAlteracaoDialog';
import { informarNormaDialog } from './informarNormaDialog';
import { RevisaoElemento } from '../../model/revisao/revisao';
import { transformarAction } from '../../model/lexml/acao/transformarAction';
import { LexmlEmendaConfig } from '../../model/lexmlEmendaConfig';
import { isRevisaoDeExclusao, setCheckedElement } from '../../redux/elemento/util/revisaoUtil';
import { aceitarRevisaoAction } from '../../model/lexml/acao/aceitarRevisaoAction';
import { rejeitarRevisaoAction } from '../../model/lexml/acao/rejeitarRevisaoAction';
import { TextoDiff, exibirDiferencasDialog } from './exibirDiferencaDialog';
import { EtaContainerRevisao } from '../../util/eta-quill/eta-container-revisao';
import { DescricaoSituacao } from '../../model/dispositivo/situacao';
import { EtaContainerOpcoes } from '../../util/eta-quill/eta-container-opcoes';
import { buscaDispositivoById } from '../../model/lexml/hierarquia/hierarquiaUtil';
import { exibirDiferencaAction } from '../../model/lexml/acao/exibirDiferencaAction';
import { alertarInfo } from '../../redux/elemento/util/alertaUtil';
import { SufixosModalComponent } from '../sufixos/sufixos.modal.componet';

@customElement('lexml-eta-editor')
export class EditorComponent extends connect(rootStore)(LitElement) {
  @property({ type: Object }) lexmlEtaConfig: LexmlEmendaConfig = new LexmlEmendaConfig();

  @query('lexml-ajuda-modal')
  private ajudaModal!: AjudaModalComponent;

  @query('lexml-sufixos-modal')
  private sufixosModal!: SufixosModalComponent;

  @query('lexml-atalhos-modal')
  private atalhosModal!: AtalhosModalComponent;

  @query('lexml-emenda-comando-modal')
  private comandoEmendaModal!: ComandoEmendaModalComponent;

  @query('#btnAceitarTodasRevisoes')
  private btnAceitarTodasRevisoes!: HTMLButtonElement;

  @query('#btnRejeitarTodasRevisoes')
  private btnRejeitarTodasRevisoes!: HTMLButtonElement;

  private modo = ClassificacaoDocumento.EMENDA;

  private _quill?: EtaQuill;
  private get quill(): EtaQuill {
    return this._quill as EtaQuill;
  }

  private eventosOnChange: StateType[] = [];

  private inscricoes: Subscription[] = [];
  private timerOnChange?: any;

  private _idSwitchRevisao = 'chk-em-revisao';
  private _idBadgeQuantidadeRevisao = 'badge-marca-alteracao';

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
        //this.alertar(state.elementoReducer.ui.message.descricao);
        alertarInfo(state.elementoReducer.ui.message.descricao);
      } else if (state.elementoReducer.ui.events[0]?.stateType !== 'AtualizacaoAlertas') {
        this.processarStateEvents(state.elementoReducer.ui.events);
      }
    }
  }

  disconnectedCallback(): void {
    this.inscricoes.forEach((i: Subscription) => i.cancel());
    this.destroiQuill();
    super.disconnectedCallback();
  }

  @property({ type: Boolean })
  exibirBotoesParaTratarTodas = false;

  render(): TemplateResult {
    return html`
      <style>
        :host {
          --lx-eta-editor-height: 100%;
          --lx-eta-editor-overflow: display;
        }

        lexml-eta-editor .ql-editor {
          white-space: normal;
        }

        #lx-eta-editor {
          overflow: var(--lx-eta-editor-overflow);
          display: block;
          height: var(--heightEmenda);
        }
        .sl-toast-stack sl-alert::part(base) {
          background-color: var(--sl-color-danger-100);
        }
        .checkBoxRevisao {
          padding: 3px 5px;
          margin: 5px 5px 5px 4px;
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
          <button type="button" class="ql-clean" title="Remover formatação">
            <svg class="" viewBox="0 0 18 18">
              <line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"></line>
              <line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"></line>
              <line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"></line>
              <line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"></line>
              <rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"></rect>
            </svg>
          </button>

          <lexml-switch-revisao
          class="revisao-container"
          .nomeSwitch="${this._idSwitchRevisao}"
          .nomeBadgeQuantidadeRevisao="${this._idBadgeQuantidadeRevisao}"
          modo="${this.modo}"
          >
          </lexml-switch-revisao>

          <sl-button class="button-navegacao-marca" variant="default" size="small" circle @click=${(): void => this.navegarEntreMarcasRevisao('abaixo')}>
            <sl-icon-button name="arrow-down"></sl-icon-button>
          </sl-button>

          <sl-button class="button-navegacao-marca" variant="default" size="small" circle @click=${(): void => this.navegarEntreMarcasRevisao('acima')}>
            <sl-icon-button name="arrow-up"></sl-icon-button>
          </sl-button>

          ${this.exibirBotoesParaTratarTodas ? this.renderBotoesParaTratarTodasRevisoes() : ''}

          <input type="button" @click=${this.artigoOndeCouber} class="${'ql-hidden'} btn--artigoOndeCouber" value="Propor artigo onde couber" title="Artigo onde couber"></input>
          <div class="mobile-buttons">
            <button class="mobile-button btn-comando" title="Comando" @click=${this.showComandoEmendaModal}>
              <sl-icon name="code"></sl-icon>
              <span>Comando</span>
            </button>
            <button class="mobile-button btn-dicas" title="Dicas" @click=${this.showAjudaModal}>
              <sl-icon name="lightbulb"></sl-icon>
              <span>Dicas</span>
            </button>
            <button class="mobile-button" title="Atalhos" @click=${this.showAtalhosModal}>
              <sl-icon name="keyboard"></sl-icon>
              <span>Atalhos</span>
            </button>
          </div>
        </div>
        <div id="lx-eta-editor"></div>
      </div>
      <elix-toast id="toast-alerta" duration="3000">
        <div id="toast-msg"></div>
      </elix-toast>
      <div id="lx-eta-buffer"><p></p></div>
      <lexml-ajuda-modal></lexml-ajuda-modal>
      <lexml-emenda-comando-modal></lexml-emenda-comando-modal>
      <lexml-atalhos-modal></lexml-atalhos-modal>
      <lexml-sufixos-modal></lexml-sufixos-modal>
    `;
  }

  private renderBotoesParaTratarTodasRevisoes(): TemplateResult {
    return html`
      <sl-icon-button id="btnRejeitarTodasRevisoes" name="x" label="" title="Rejeitar Revisões" ?disabled=${true} @click=${(): void => this.rejeitarTodasRevisoes()}>
        Rejeitar Revisões
      </sl-icon-button>

      <sl-icon-button id="btnAceitarTodasRevisoes" name="check-lg" label="" title="Aceitar Revisões" ?disabled=${true} @click=${(): void => this.aceitarTodasRevisoes()}>
        Aceitar Revisões
      </sl-icon-button>
    `;
  }

  private showAjudaModal(): void {
    this.ajudaModal.show();
  }

  private showModalSufixos(): void {
    if (this.sufixosModal !== null) {
      this.sufixosModal.show();
    }
  }

  private showAtalhosModal(): void {
    this.atalhosModal.show();
  }

  private showComandoEmendaModal(): void {
    this.comandoEmendaModal.show();
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
    const elemento: Elemento = this.criarElemento(linha.uuid, linha.uuid2, linha.lexmlId, linha.tipo, textoLinha, linha.numero, linha.hierarquia);

    if (this.isDesmembramento(blotConteudo.htmlAnt, textoLinha, textoNovaLinha)) {
      const elemento: Elemento = this.criarElemento(linha.uuid, linha.uuid2, linha.lexmlId, linha.tipo, textoLinha + textoNovaLinha, linha.numero, linha.hierarquia);
      rootStore.dispatch(atualizarTextoElementoAction.execute(elemento));
    }
    rootStore.dispatch(adicionarElementoAction.execute(elemento, textoNovaLinha));
  }

  private editarNotaAlteracao(elemento: Elemento): void {
    editarNotaAlteracaoDialog(elemento, this.quill, rootStore);
  }

  private async renumerarElemento(): Promise<any> {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const elemento: Elemento = this.criarElemento(
      linha!.uuid ?? 0,
      linha!.uuid2 ?? '',
      linha.lexmlId,
      linha!.tipo ?? '',
      '',
      linha.numero,
      linha.hierarquia,
      linha.descricaoSituacao,
      linha.existeNaNormaAlterada
    );

    if (!podeRenumerar(rootStore.getState().elementoReducer.articulacao, elemento)) {
      this.alertar('Nessa situação, não é possível renumerar o dispositivo');
      return;
    }

    const dialogElem = document.createElement('sl-dialog');
    document.body.appendChild(dialogElem);

    dialogElem.label = 'Informar numeração';
    dialogElem.addEventListener('sl-request-close', (event: any) => {
      if (event.detail.source === 'overlay') {
        event.preventDefault();
      }
    });

    const getMsgPlaceholder = (tipo: string): string => {
      const tp = tipo.toLowerCase();
      const descricao = TipoDispositivo[tp].descricao?.toLowerCase();
      if (!tp) {
        return '';
      } else if (['artigo', 'paragrafo', 'item'].includes(tp)) {
        return 'Digite o número do ' + descricao + '. Ex: 5, 6-A' + (tp === 'paragrafo' ? ', único' : '');
      } else if (tp === 'alinea') {
        return 'Digite a letra da ' + descricao + '. Ex: b, c-A';
      } else {
        const genero = ['parte', 'secao', 'subsecao'].includes(tp) ? 'a' : 'o';
        return `Digite o número romano d${genero} ${descricao}. Ex: II, III-A'`;
      }
    };

    const content = document.createRange().createContextualFragment(`
      <div class="input-validation-required">
        <sl-input type="text" help-text="${getMsgPlaceholder(elemento.tipo ?? '')}" label="Numeração do dispositivo:" clearable></sl-input>
        <br/>
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
    const rotuloAtual = `${rotuloParaEdicao(linha.blotRotulo!.rotulo)}`;
    input.value = rotuloAtual;

    const botoes = content.querySelectorAll('sl-button');
    const cancelar = botoes[0];
    const ok = botoes[1];

    const erro = <HTMLDivElement>content.querySelector('.erro');
    const alerta = content.querySelector('sl-alert');

    ok.onclick = (): void => {
      this.quill.focus();
      dialogElem?.hide();
      dialogElem?.remove();

      if (input.value?.trim().toLowerCase() !== rotuloAtual?.toLowerCase()) {
        rootStore.dispatch(renumerarElementoAction.execute(elemento, input.value.trim()));
      }
    };

    cancelar.onclick = (): void => {
      this.quill.focus();
      dialogElem?.hide();
      dialogElem?.remove();
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

    dialogElem.appendChild(content);
    await dialogElem?.show();
    ok.disabled = Boolean(validar());
    (input as SlInput).focus();
  }

  private toggleExistencia(): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const elemento: Elemento = this.criarElemento(
      linha!.uuid ?? 0,
      linha!.uuid2 ?? '',
      linha.lexmlId,
      linha!.tipo ?? '',
      '',
      linha.numero,
      linha.hierarquia,
      linha.descricaoSituacao,
      linha.existeNaNormaAlterada
    );
    this.toggleExistenciaElemento(elemento);
  }

  private adicionaAgrupador(): void {
    this.adicionarAgrupadorArtigo(this.quill.linhaAtual.elemento);
  }

  private adicionarAgrupadorArtigo(elemento: Elemento): void {
    adicionarAgrupadorArtigoDialog(elemento, this.quill, rootStore);
  }

  private toggleExistenciaElemento(elemento: Elemento): void {
    const action = elemento.existeNaNormaAlterada ? considerarElementoNovoNaNorma : considerarElementoExistenteNaNorma;
    rootStore.dispatch(action.execute(elemento));
  }

  private removerElementoSemTexto(key: string): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const elemento: Elemento = this.criarElemento(linha!.uuid ?? 0, linha!.uuid2, linha.lexmlId, linha!.tipo ?? '', '', linha.numero, linha.hierarquia);
    rootStore.dispatch(removerElementoSemTextoAction.execute(elemento, key));
  }

  private removerElemento(): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const elementoLinhaAnterior = this.quill.linhaAtual.prev?.elemento;
    const elemento: Elemento = this.criarElemento(linha!.uuid ?? 0, linha!.uuid2, linha.lexmlId, linha!.tipo ?? '', '', linha.numero, linha.hierarquia);
    rootStore.dispatch(removerElementoAction.execute(elemento, elementoLinhaAnterior));
  }

  private moverElemento(ev: KeyboardEvent): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    if (linha) {
      const blotConteudo: EtaBlotConteudo = linha.blotConteudo;
      const textoLinha = blotConteudo.html;

      const elemento: Elemento = this.criarElemento(linha.uuid, linha.uuid2, linha.lexmlId, linha.tipo, textoLinha, linha.numero, linha.hierarquia);

      if (ev.key === 'ArrowUp') {
        rootStore.dispatch(moverElementoAcimaAction.execute(elemento));
      } else if (ev.key === 'ArrowDown') {
        rootStore.dispatch(moverElementoAbaixoAction.execute(elemento));
      }
    }
  }

  private transformarElemento(ev: KeyboardEvent): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    const blotConteudo: EtaBlotConteudo = linha.blotConteudo;
    const textoLinha = blotConteudo.html;

    const elemento: Elemento = this.criarElemento(linha.uuid, linha.uuid2, linha.lexmlId, linha.tipo, textoLinha, linha.numero, linha.hierarquia);

    if (ev.key.toLowerCase() === 'o') {
      rootStore.dispatch(transformarAction(elemento, TipoDispositivo.omissis.name!));
    } else if (Keyboard.keys.TAB) {
      rootStore.dispatch(ev.shiftKey ? shiftTabAction(elemento) : tabAction(elemento));
    }
  }

  private elementoSelecionado(uuid: number): void {
    const linha: EtaContainerTable = this.quill.linhaAtual;
    if (linha) {
      const elemento: Elemento = this.criarElemento(uuid, linha!.uuid2, linha.lexmlId, linha.tipo ?? '', '', linha.numero, linha.hierarquia);
      rootStore.dispatch(elementoSelecionadoAction.execute(elemento));
      this.quill.processandoMudancaLinha = false;
    }
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
    const ultimoEventoElementoSelecionado = events.filter((ev: StateEvent) => ev.stateType === StateType.ElementoSelecionado).slice(-1)[0];
    events?.forEach((event: StateEvent): void => {
      switch (event.stateType) {
        case StateType.DocumentoCarregado:
          this.destroiQuill();
          this.inicializar(this.configEditor());
          this.carregarArticulacao(event.elementos ?? []);
          break;

        case StateType.InformarDadosAssistente:
          assistenteAlteracaoDialog(event.elementos![0], this.quill, rootStore, adicionarAlteracaoComAssistenteAction, this.lexmlEtaConfig.urlAutocomplete);
          break;

        case StateType.InformarNorma:
          informarNormaDialog(event.elementos![0], this.quill, rootStore, atualizarReferenciaElementoAction, this.lexmlEtaConfig.urlAutocomplete);
          break;

        case StateType.ElementoIncluido:
          this.inserirNovoElementoNoQuill(event.elementos![0], event.referencia as Elemento, true);
          this.inserirNovosElementosNoQuill(event, true);
          // this.atualizarReferenciaEmRevisoesDeExclusaoSeNecessario(events, event);
          break;

        case StateType.ElementoModificado:
        case StateType.ElementoRestaurado:
          this.atualizarQuill(event);
          this.atualizarOmissis(event);
          if (events[events.length - 1] === event) {
            this.marcarLinha(event);
          }
          break;

        case StateType.ElementoSuprimido:
          this.atualizarSituacao(event);
          if (events[events.length - 1] === event) {
            this.marcarLinha(event);
          }
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
          this.atualizarAtributos(event);
          if (ultimoEventoElementoSelecionado === event) {
            this.montarMenuContexto(event);
          }
          this.atualizarMensagemQuill(event);
          break;

        case StateType.ElementoMarcado:
          setTimeout(() => this.marcarLinha(event), 100);
          break;

        case StateType.SituacaoElementoModificada:
          this.atualizarQuill(event);
          this.atualizarSituacao(event);
          this.atualizarAtributos(event);
          this.atualizarMensagemQuill(event);
          this.atualizarOmissis(event);
          break;

        case StateType.RevisaoAtivada:
          this.checkedSwitchMarcaAlteracao();
          break;
        case StateType.RevisaoDesativada:
          this.checkedSwitchMarcaAlteracao();
          this.atualizarEstiloBotaoRevisao();
          break;
        case StateType.RevisaoAceita:
          this.processaRevisoesAceitas(events, event);
          break;
        case StateType.RevisaoAdicionalRejeitada:
          this.removerLinhaQuill(event);
          break;
      }

      this.disabledParagrafoElementoRemovido(event);
      this.quill.limparHistory();
    });

    this.indicadorMarcaRevisao(events);
    this.indicadorTextoModificado(events);
    //this.atualizaQuantidadeRevisao();
    this.atualizarStatusBotoesRevisao();

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
      // TODO: Implementar lógica do atributo eventosFiltrados, sem repetir os itens
      this.eventosOnChange.push(...eventosFiltrados);

      this.agendarEmissaoEventoOnChange('stateEvents', eventosFiltrados);
    }
  }

  private processaRevisoesAceitas(events: StateEvent[], event: StateEvent): void {
    if (this.isAceitandoRevisoesDeExclusao(event)) {
      this.removerLinhaQuill(event);
    } else {
      this.atualizarAtributos(event);
      if (events[events.length - 1] === event) {
        this.montarMenuContexto(event);
      }
      this.atualizarMensagemQuill(event);
    }
  }

  private isAceitandoRevisoesDeExclusao(event: StateEvent): boolean {
    return event.elementos?.some(e => (this.quill.getLinha(e.uuid!)?.elemento.revisao as RevisaoElemento)?.stateType === StateType.ElementoRemovido) ?? false;
  }

  private existeReinclusaoDoElemento(elementosIncluidos: Elemento[], elemento: Elemento): boolean {
    return elementosIncluidos.some(elementoIncluido => elementoIncluido.uuid === elemento.uuid);
  }

  private marcarLinha(event: StateEvent): void {
    try {
      this.quill.desmarcarLinhaAtual(this.quill.linhaAtual);
      const elemento = event.elementos![0];
      const linha = this.quill.getLinha(elemento.uuid!)!;
      this.quill.atualizarLinhaCorrente(linha);
      this.elementoSelecionado(linha.uuid);
      const index = this.quill.getIndex(linha.blotConteudo);
      try {
        this.quill.setIndex(index, Quill.sources.SILENT);
        // eslint-disable-next-line no-empty
      } catch (error) {}
      if (event.moverParaFimLinha) {
        setTimeout(() => {
          const posicao = this.quill.getSelection()!.index + this.quill.linhaAtual.blotConteudo.html.length;
          this.quill.setSelection(posicao, 0, Quill.sources.USER);
        }, 0);
      }
    } catch (error) {
      // linha, provavelmente, foi removida do Quill
    }
  }

  private processarEscolhaMenu(itemMenu: any): void {
    if (itemMenu === renumerarElementoAction) {
      this.renumerarElemento();
    } else if (itemMenu === atualizarNotaAlteracaoAction) {
      this.editarNotaAlteracao(this.quill.linhaAtual.elemento);
    } else if (itemMenu instanceof AdicionarAgrupadorArtigo) {
      this.adicionarAgrupadorArtigo(this.quill.linhaAtual.elemento);
    } else if (itemMenu === removerElementoAction) {
      const linha: EtaContainerTable = this.quill.linhaAtual;
      const elemento: Elemento = this.criarElemento(linha!.uuid ?? 0, linha!.uuid2, linha.lexmlId, linha!.tipo ?? '', '', linha.numero, linha.hierarquia);
      elemento.conteudo!.texto = linha.blotConteudo.html ?? '';

      const elementoLinhaAnterior = this.quill.linhaAtual.prev?.elemento;
      rootStore.dispatch(itemMenu.execute(elemento, elementoLinhaAnterior));
    } else if (itemMenu === exibirDiferencaAction) {
      this.exibirDiferencas(this.quill.linhaAtual.elemento);
    } else {
      const linha: EtaContainerTable = this.quill.linhaAtual;
      const elemento: Elemento = this.criarElemento(linha!.uuid ?? 0, linha!.uuid2, linha.lexmlId, linha!.tipo ?? '', '', linha.numero, linha.hierarquia);
      elemento.conteudo!.texto = linha.blotConteudo.html ?? '';
      rootStore.dispatch(itemMenu.execute(elemento));
    }
  }

  private inserirNovoElementoNoQuill(elemento: Elemento, referencia: Elemento, selecionarLinha?: boolean): void {
    const fnSelecionarNovaLinha = (linha: EtaContainerTable, linhaAtual: EtaContainerTable): void => {
      this.quill.desmarcarLinhaAtual(linhaAtual);
      this.quill.marcarLinhaAtual(linha);
      try {
        this.quill.setIndex(this.quill.getIndex(linha.blotConteudo), Quill.sources.SILENT);
      } catch (e) {
        // console.log(e);
      }
    };

    const linhaASerReinserida = this.quill.getLinha(elemento.uuid!);

    if (linhaASerReinserida) {
      linhaASerReinserida.atualizarElemento(elemento);
      selecionarLinha && fnSelecionarNovaLinha(linhaASerReinserida, this.quill.linhaAtual);
      return;
    }

    const linhaRef: EtaContainerTable | undefined = this.quill.getLinha(elemento.elementoAnteriorNaSequenciaDeLeitura?.uuid || referencia.uuid!);

    if (linhaRef) {
      const novaLinha: EtaContainerTable = EtaQuillUtil.criarContainerLinha(elemento);

      if (linhaRef.next) {
        novaLinha.insertInto(this.quill.scroll, linhaRef.next);
      } else {
        novaLinha.insertInto(this.quill.scroll);
      }

      const isEmendaArtigoOndeCouber = rootStore.getState().elementoReducer.modo === ClassificacaoDocumento.EMENDA_ARTIGO_ONDE_COUBER;
      if (this.quill.linhaAtual?.blotConteudo.html !== '' || novaLinha.blotConteudo.html === '' || isEmendaArtigoOndeCouber || elemento.tipo === 'Omissis') {
        selecionarLinha && !this.timerOnChange && fnSelecionarNovaLinha(novaLinha, this.quill.linhaAtual);
      } else {
        this.quill.linhaAtual.blotConteudo.htmlAnt = this.quill.linhaAtual.blotConteudo.html;
      }

      novaLinha.descricaoSituacao = elemento.descricaoSituacao;
      novaLinha.existeNaNormaAlterada = elemento.existeNaNormaAlterada;
      novaLinha.setEstilo(elemento!);
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

    elementos.forEach((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, elemento.tipo === 'Ementa' ? undefined : linha);
      if (linha) {
        if (elemento.descricaoSituacao !== linha.descricaoSituacao) {
          linha.descricaoSituacao = elemento.descricaoSituacao;
          linha.setEstilo(elemento);
          linha.atualizarElemento(elemento);
        }
      }
    });
  }

  private atualizarAtributos(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.forEach((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, elemento.tipo === 'Ementa' ? undefined : linha);
      if (linha) {
        linha.atualizarElemento(elemento);
      }
    });
  }

  private atualizarOmissis(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.forEach((elemento: Elemento) => {
      if (elemento.dispositivoAlteracao) {
        linha = this.quill.getLinha(elemento.uuid ?? 0, linha);
        if (linha && normalizaSeForOmissis(linha.blotConteudo?.html).indexOf(TEXTO_OMISSIS) >= 0) {
          linha.blotConteudo.html = '';
          const index = this.quill.getIndex(linha.blotConteudo);
          this.quill.insertText(index, TEXTO_OMISSIS, { EtaBlotConteudoOmissis: true });
        }
        if (elemento.conteudo?.texto !== linha?.blotConteudo.html) {
          const texto = normalizaSeForOmissis(elemento.conteudo?.texto ?? '');
          if (texto.indexOf(TEXTO_OMISSIS) >= 0) {
            linha?.domNode.classList.add('container_elemento--omissis');
          }
        }
      }
    });
  }

  private atualizarQuill(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.map((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, elemento.tipo === 'Ementa' ? undefined : linha);
      if (linha) {
        let nivelAlerado = false;

        if (elemento.editavel !== linha.editavel) {
          linha.editavel = elemento.editavel;
        }

        if (elemento.rotulo !== linha.blotRotulo?.html) {
          linha.numero = elemento.numero ?? '';
          linha.blotRotulo?.format(EtaBlotRotulo.blotName, elemento.rotulo);
        }

        if (elemento.nivel !== linha.nivel) {
          linha.nivel = elemento.nivel;
          linha.format(EtaContainerTable.blotName, elemento);
          nivelAlerado = true;
        }

        if (elemento.agrupador !== linha.agrupador) {
          linha.agrupador = elemento.agrupador;
          linha.blotRotulo?.format(EtaBlotRotulo.formatoStyle, elemento);
          if (!nivelAlerado) {
            linha.format(EtaContainerTable.blotName, elemento);
          }
        }

        // Substituir o texto apenas quando precisa evita retorno do cursor para o início da linha.
        const novoTexto = elemento.conteudo?.texto ?? '';
        if (linha.blotConteudo.html !== novoTexto) {
          linha.blotConteudo.html = novoTexto;
        }

        if (elemento.descricaoSituacao !== linha.descricaoSituacao) {
          linha.descricaoSituacao = elemento.descricaoSituacao;
          linha.setEstilo(elemento);
        }

        linha.atualizarElemento(elemento);

        if (linha.children.length === 2) {
          linha.children.tail.remove();
        }

        if (elemento.mensagens && elemento.mensagens.length > 0 && !this.elementoRemovidoEmRevisao(elemento)) {
          EtaQuillUtil.criarContainerMensagens(elemento).insertInto(linha);
        }
      }
    });
  }

  private elementoRemovidoEmRevisao(elemento: Elemento): boolean {
    if (elemento.revisao && (elemento.revisao as RevisaoElemento).stateType === StateType.ElementoRemovido) {
      return true;
    }
    return false;
  }

  private removerLinhaQuill(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.forEach((elemento: Elemento, index) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, linha) || this.quill.getLinha(elemento.uuid ?? 0);
      if (linha) {
        if (elemento.revisao && (!linha.elemento.revisao || !isRevisaoDeExclusao(linha.elemento.revisao as RevisaoElemento))) {
          linha.atualizarElemento(elemento);
          index === 0 && this.montarMenuContexto(event);
        } else {
          linha.remove();
        }
      }
    });

    const range = this.quill.getSelection();
    if (range) {
      const linhaCursor: EtaContainerTable = this.quill.getLine(range.index - 1)[0].linha;

      const index: number = this.quill.getIndex(linhaCursor.blotConteudo);

      this.quill.setSelection(index, 0, Quill.sources.SILENT);
      this.quill.marcarLinhaAtual(linhaCursor);
    }
  }

  private renumerarQuill(event: StateEvent): void {
    const elementos: Elemento[] = event.elementos ?? [];
    let linha: EtaContainerTable | undefined;

    elementos.map((elemento: Elemento) => {
      linha = this.quill.getLinha(elemento.uuid ?? 0, linha) || this.quill.getLinha(elemento.uuid ?? 0);
      if (linha) {
        linha.blotRotulo?.format(EtaBlotRotulo.blotName, elemento.rotulo);
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

        if (elemento.mensagens && elemento.mensagens.length > 0 && !this.elementoRemovidoEmRevisao(elemento)) {
          EtaQuillUtil.criarContainerMensagens(elemento).insertInto(linha);
        }
      }
    });
  }

  private montarMenuContexto(event: StateEvent): void {
    const elemento: Elemento = event.elementos ? event.elementos[0] : new Elemento();
    const acoesMenu: ElementoAction[] = (elemento?.acoesPossiveis ?? []).filter((acao: ElementoAction) => isAcaoMenu(acao));

    if (acoesMenu.length > 0) {
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

      this.quill.linhaAtual.blotInsideContainerDireito?.remove();
      blotMenu.insertInto(this.quill.linhaAtual.containerDireito);
    }
  }

  private criarElemento(
    uuid: number,
    uuid2: string,
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
    elemento.uuid2 = uuid2;
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
    this.inscricoes.push(this.quill.keyboard.toggleExistencia.subscribe(this.toggleExistencia.bind(this)));
    this.inscricoes.push(this.quill.keyboard.adicionaAgrupador.subscribe(this.adicionaAgrupador.bind(this)));
    this.inscricoes.push(this.quill.undoRedoEstrutura.subscribe(this.undoRedoEstrutura.bind(this)));
    this.inscricoes.push(this.quill.elementoSelecionado.subscribe(this.elementoSelecionado.bind(this)));

    this.inscricoes.push(this.quill.observableSelectionChange.subscribe(this.atualizarTextoElemento.bind(this)));
    this.inscricoes.push(this.quill.keyboard.onChange.subscribe(this.agendarEmissaoEventoOnChange.bind(this)));
    this.inscricoes.push(this.quill.clipboard.onChange.subscribe(this.agendarEmissaoEventoOnChange.bind(this)));
    this.inscricoes.push(onChangeColarDialog.subscribe(this.agendarEmissaoEventoOnChange.bind(this)));
    this.inscricoes.push(this.quill.clipboard.onPasteTextoArticulado.subscribe(this.onPasteTextoArticulado.bind(this)));

    editorHtml.addEventListener('rotulo', (event: any) => {
      event.stopImmediatePropagation();
      this.renumerarElemento();
    });

    editorHtml.addEventListener('nota-alteracao', (event: any) => {
      event.stopImmediatePropagation();
      this.editarNotaAlteracao(event.detail.elemento);
    });

    editorHtml.addEventListener('toggle-existencia', (event: any) => {
      event.stopImmediatePropagation();
      this.toggleExistenciaElemento(event.detail.elemento);
    });

    editorHtml.addEventListener('mensagem', (event: any) => {
      event.stopImmediatePropagation();

      const linha: EtaContainerTable = this.quill.linhaAtual;

      if (linha) {
        if (AutoFix.RENUMERAR_DISPOSITIVO === event.detail?.mensagem?.descricao) {
          this.renumerarElemento();
        } else {
          const blotConteudo: EtaBlotConteudo = linha.blotConteudo;
          const elemento: Elemento = this.criarElemento(linha.uuid, linha.uuid2, linha.lexmlId, linha.tipo, blotConteudo.html, linha.numero, linha.hierarquia);
          rootStore.dispatch(autofixAction.execute(elemento, event.detail.mensagem));
        }
      }
    });

    editorHtml.addEventListener('aceitar-revisao', (event: any) => {
      event.stopImmediatePropagation();
      this.aceitarRevisao(event.detail.elemento);
    });

    editorHtml.addEventListener('rejeitar-revisao', (event: any) => {
      event.stopImmediatePropagation();
      this.rejeitarRevisao(event.detail.elemento);
    });

    editorHtml.addEventListener('exibir-diferencas', (event: any) => {
      event.stopImmediatePropagation();
      this.exibirDiferencas(event.detail.elemento);
    });

    editorHtml.addEventListener('onmodalsufixos', (event: any) => {
      event.stopImmediatePropagation();
      this.exibirModalSufixos();
    });
    this.configListenersEta();
  }

  exibirModalSufixos(): void {
    //exibirSufixosDialog(this.quill);
    this.showModalSufixos();
  }

  exibirDiferencas(elemento: Elemento): void {
    const diff: TextoDiff = new TextoDiff();
    diff.textoAtual = elemento.conteudo!.texto!;
    diff.quill = this.quill;

    const revisao = elemento.revisao as RevisaoElemento;
    const d = buscaDispositivoById(rootStore.getState().elementoReducer.articulacao, elemento.lexmlId!);

    if (revisao) {
      diff.textoAntesRevisao = revisao.elementoAntesRevisao!.conteudo!.texto!;

      if (d && d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ADICIONADO && d.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_ORIGINAL) {
        diff.textoOriginal = d!.situacao.dispositivoOriginal!.conteudo!.texto!;
      } else {
        diff.textoOriginal = elemento.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL ? diff.textoAtual : diff.textoAntesRevisao;
        diff.adicionado = true;
      }

      exibirDiferencasDialog(diff);
    } else {
      if (d && d!.situacao.dispositivoOriginal?.conteudo !== undefined) {
        diff.textoOriginal = d!.situacao.dispositivoOriginal!.conteudo!.texto!;
      }
      exibirDiferencasDialog(diff);
    }
  }

  aceitarRevisao(elemento: Elemento): void {
    rootStore.dispatch(aceitarRevisaoAction.execute(elemento, undefined));
    this.alertaGlobalRevisao();
  }

  rejeitarRevisao(elemento: Elemento): void {
    rootStore.dispatch(rejeitarRevisaoAction.execute(elemento, undefined));
  }

  aceitarTodasRevisoes(): void {
    rootStore.dispatch(aceitarRevisaoAction.execute(undefined as any, undefined));
  }

  rejeitarTodasRevisoes(): void {
    rootStore.dispatch(rejeitarRevisaoAction.execute(undefined as any, undefined));
  }

  private agendarEmissaoEventoOnChange(origemEvento: string, statesType: StateType[] = []): void {
    clearTimeout(this.timerOnChange);
    this.timerOnChange = setTimeout(() => this.emitirEventoOnChange(origemEvento, statesType), 1000);
  }

  private atualizarTextoElemento(linhaAtual: EtaContainerTable): void {
    if (linhaAtual?.blotConteudo?.alterado) {
      const elemento: Elemento = this.criarElemento(
        linhaAtual.uuid,
        linhaAtual.uuid2,
        linhaAtual.lexmlId,
        linhaAtual.tipo,
        linhaAtual.blotConteudo?.html ?? '',
        linhaAtual.numero,
        linhaAtual.hierarquia
      );
      rootStore.dispatch(atualizarTextoElementoAction.execute(elemento));
    }
  }

  private alertaGlobalVerificaRenumeracao(): void {
    const idAlerta = 'alerta-global-renumeracao';
    const dispositivos = CmdEmdUtil.getDispositivosAdicionados(rootStore.getState().elementoReducer.articulacao);

    if (dispositivos.length && CmdEmdUtil.verificaNecessidadeRenumeracaoRedacaoFinal(dispositivos)) {
      const alerta = {
        id: idAlerta,
        tipo: 'warning',
        mensagem:
          'Os rótulos apresentados servem apenas para o posicionamento correto do novo dispositivo no texto. Serão feitas as renumerações necessárias no momento da consolidação das emendas.',
        podeFechar: true,
      };

      rootStore.dispatch(adicionarAlerta(alerta));
    } else {
      rootStore.dispatch(removerAlerta(idAlerta));
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
          'Cada emenda pode referir-se a apenas um dispositivo, salvo se houver correlação entre dispositivos. Verifique se há correlação entre os dispositivos emendados antes de submetê-la.',
        podeFechar: true,
        exibirComandoEmenda: true,
      };
      rootStore.dispatch(adicionarAlerta(alerta));
    } else if (rootStore.getState().elementoReducer.ui?.alertas?.some(alerta => alerta.id === 'alerta-global-correlacao')) {
      rootStore.dispatch(removerAlerta('alerta-global-correlacao'));
    }
  }

  private alertaGlobalRevisao(): void {
    const id = 'alerta-global-revisao';
    const revisoesElementos = document.getElementsByClassName('blot__revisao');

    if (revisoesElementos.length > 0) {
      const alerta = {
        id: id,
        tipo: 'info',
        mensagem: 'Este documento contém marcas de revisão e não deve ser protocolado até que estas sejam removidas.',
        podeFechar: true,
        exibirComandoEmenda: true,
      };
      rootStore.dispatch(adicionarAlerta(alerta));
    } else if (rootStore.getState().elementoReducer.ui?.alertas?.some(alerta => alerta.id === id)) {
      rootStore.dispatch(removerAlerta(id));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitirEventoOnChange(origemEvento: string, statesType: StateType[] = []): void {
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

    if (this.eventosOnChange?.length && (this.eventosOnChange.includes(StateType.ElementoIncluido) || this.eventosOnChange.includes(StateType.ElementoRemovido))) {
      this.alertaGlobalVerificaRenumeracao();
    }

    this.alertaGlobalVerificaCorrelacao();
    this.alertaGlobalRevisao();
    this.eventosOnChange = [];
    this.timerOnChange = null;
  }

  private carregarArticulacao(elementos: Elemento[]): void {
    setTimeout(() => {
      this.quill.getLine(0)[0].remove();
      elementos.forEach((elemento: Elemento) => {
        const etaContainerTable = EtaQuillUtil.criarContainerLinha(elemento);
        etaContainerTable.insertInto(this.quill.scroll);
        etaContainerTable.setEstilo(elemento);

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
      formats: ['bold', 'italic', 'link', 'script', 'EtaBlotConteudoOmissis'],
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
    document.body.appendChild(dialog);
    await dialog.show();
    const botoesDialog = dialog.querySelectorAll('sl-button');
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
    this.removeListenersEta();

    this.getHtmlElement('lx-eta-editor')!.innerHTML = '';
    this.getHtmlElement('lx-eta-buffer')!.innerHTML = '';
    if (this.quill) {
      this.quill.off('selection-change', this.onSelectionChange);
      this.quill.destroi();
    }
    this._quill = undefined;
  }

  private listenerRotulo = (event: any): void => {
    event.stopImmediatePropagation();
    this.renumerarElemento();
  };

  private listenerNotaAlteracao = (event: any): void => {
    event.stopImmediatePropagation();
    this.editarNotaAlteracao(event.detail.elemento);
  };

  private listenerToggleExistencia = (event: any): void => {
    event.stopImmediatePropagation();
    this.toggleExistenciaElemento(event.detail.elemento);
  };

  private listenerMensagem = (event: any): void => {
    event.stopImmediatePropagation();

    const linha: EtaContainerTable = this.quill.linhaAtual;

    if (linha) {
      if (AutoFix.RENUMERAR_DISPOSITIVO === event.detail?.mensagem?.descricao) {
        this.renumerarElemento();
      } else {
        const blotConteudo: EtaBlotConteudo = linha.blotConteudo;
        const elemento: Elemento = this.criarElemento(linha.uuid, linha.uuid2, linha.lexmlId, linha.tipo, blotConteudo.html, linha.numero, linha.hierarquia);
        rootStore.dispatch(autofixAction.execute(elemento, event.detail.mensagem));
      }
    }
  };

  private listenerAceitarRevisao = (event: any): void => {
    event.stopImmediatePropagation();
    this.aceitarRevisao(event.detail.elemento);
  };

  private listenerRejeitarRevisao = (event: any): void => {
    event.stopImmediatePropagation();
    this.rejeitarRevisao(event.detail.elemento);
  };

  private configListenersEta(): void {
    const editorHtml: HTMLElement = this.getHtmlElement('lx-eta-editor');
    editorHtml.addEventListener('rotulo', this.listenerRotulo);
    editorHtml.addEventListener('nota-alteracao', this.listenerNotaAlteracao);
    editorHtml.addEventListener('toggle-existencia', this.listenerToggleExistencia);
    editorHtml.addEventListener('mensagem', this.listenerMensagem);
    editorHtml.addEventListener('aceitar-revisao', this.listenerAceitarRevisao);
    editorHtml.addEventListener('rejeitar-revisao', this.listenerRejeitarRevisao);
  }

  private removeListenersEta(): void {
    const editorHtml: HTMLElement = this.getHtmlElement('lx-eta-editor');
    editorHtml.removeEventListener('rotulo', this.listenerRotulo);
    editorHtml.removeEventListener('nota-alteracao', this.listenerNotaAlteracao);
    editorHtml.removeEventListener('toggle-existencia', this.listenerToggleExistencia);
    editorHtml.removeEventListener('mensagem', this.listenerMensagem);
    editorHtml.removeEventListener('aceitar-revisao', this.listenerAceitarRevisao);
    editorHtml.removeEventListener('rejeitar-revisao', this.listenerRejeitarRevisao);
  }

  private async onPasteTextoArticulado(payload: any): Promise<void> {
    const linha = this.quill.linhaAtual;
    const elemento: Elemento = new Elemento();
    elemento.uuid = linha.uuid;
    elemento.tipo = linha.tipo;

    const infoTextoColado = await InfoTextoColado.newInstanceFromTexto(
      payload.textoColadoOriginal,
      payload.textoColadoAjustado,
      rootStore.getState().elementoReducer.articulacao,
      linha.elemento
    );
    colarTextoArticuladoDialog(this.quill, rootStore, infoTextoColado, payload.range);
  }

  private atualizarEstiloBotaoRevisao(): void {
    const botaoRevisao = this.getHtmlElement('lx-eta-btn-revisao');
    if (botaoRevisao) {
      botaoRevisao.classList.toggle('revisao-ativa', rootStore.getState().elementoReducer.emRevisao);
    }
  }

  private indicadorTextoModificado(events: StateEvent[]): void {
    const ignorarStateTypes: StateType[] = [
      StateType.DocumentoCarregado,
      StateType.ElementoIncluido,
      StateType.ElementoValidado,
      StateType.AtualizaUsuario,
      StateType.AtualizacaoAlertas,
    ];
    const mapElementos: Map<number, Elemento> = new Map();

    events
      .filter(ev => !ignorarStateTypes.includes(ev.stateType))
      .map(ev => ev.elementos || [])
      .flat()
      .forEach(e => mapElementos.set(e.uuid!, e));

    const elementos: Elemento[] = [...mapElementos.values()];
    const uuidsElementosSemModificacao = elementos.filter(e => e.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_MODIFICADO).map(e => e.uuid!);
    const uuidsElementosComModificacao = elementos
      .filter(
        e =>
          e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO ||
          (e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO && e.revisao && e.revisao.descricao === 'Texto do dispositivo foi alterado') ||
          (e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL &&
            e.revisao &&
            (e.revisao as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto !== e.conteudo?.texto)
        // || (e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && e.revisao
        //   && (e.revisao.descricao === 'Dispositivo restaurado' || e.revisao.descricao === 'Texto do dispositivo foi alterado'))
      )
      .map(e => e.uuid!);

    uuidsElementosSemModificacao.forEach(uuid => {
      const containerOpcoes = document.getElementById(EtaContainerOpcoes.className + uuid);
      if (containerOpcoes) {
        const linha = this.quill.getLinha(uuid);
        linha?.containerOpcoes?.remove();
        containerOpcoes.remove();
      }
    });

    uuidsElementosComModificacao.forEach(uuid => {
      const linha = this.quill.getLinha(uuid);
      if (linha) {
        this.adicionaRemoveOpcaoDiffMenu(linha.elemento, uuidsElementosComModificacao);

        if (linha.containerOpcoes?.blotBotaoExibirDiferencas) {
          linha.containerOpcoes.atualizarElemento(mapElementos.get(uuid)!);
        } else {
          const containerOpcoes = document.getElementById(EtaContainerOpcoes.className + uuid);
          if (containerOpcoes) {
            containerOpcoes.remove();
          }
          const containerTr = linha.children.head;
          containerTr.insertBefore(EtaQuillUtil.criarContainerOpcoes(mapElementos.get(uuid)!), linha.containerDireito.prev);
        }
      }
    });
  }

  private adicionaRemoveOpcaoDiffMenu(elemento: Elemento, uuidsElementosComModificacao: any): void {
    if (uuidsElementosComModificacao.includes(elemento.uuid)) {
      elemento.acoesPossiveis?.push(exibirDiferencaAction);
    }
  }

  private indicadorMarcaRevisao(events: StateEvent[]): void {
    const ignorarStateTypes: StateType[] = [
      StateType.DocumentoCarregado,
      StateType.ElementoIncluido,
      StateType.ElementoValidado,
      StateType.AtualizaUsuario,
      StateType.AtualizacaoAlertas,
    ];
    const mapElementos: Map<number, Elemento> = new Map();
    events
      .filter(ev => !ignorarStateTypes.includes(ev.stateType))
      .map(ev => ev.elementos || [])
      .flat()
      .forEach(e => mapElementos.set(e.uuid!, e));

    const elementos: Elemento[] = [...mapElementos.values()];
    const uuidsElementosSemRevisao = elementos.filter(e => !e.revisao).map(e => e.uuid!);
    const uuidsElementosComRevisao = elementos.filter(e => e.revisao && isRevisaoPrincipal(e.revisao)).map(e => e.uuid!);

    // Remove container de revisão de elementos que não estão mais em revisão
    uuidsElementosSemRevisao.forEach(uuid => {
      const containerRevisao = document.getElementById(EtaContainerRevisao.className + uuid);
      if (containerRevisao) {
        const linha = this.quill.getLinha(uuid);
        linha?.containerRevisao?.remove();
      }
    });

    // Adiciona (ou atualiza) container de revisão para elementos que estão em revisão
    uuidsElementosComRevisao.forEach(uuid => {
      const linha = this.quill.getLinha(uuid);
      if (linha) {
        if (linha.containerRevisao?.blotBotaoAceitarRevisao) {
          linha.containerRevisao.atualizarElemento(mapElementos.get(uuid)!);
        } else {
          const containerTr = linha.children.head;
          containerTr.insertBefore(EtaQuillUtil.criarContainerRevisao(mapElementos.get(uuid)!), linha.containerDireito.prev);
        }
      }
    });
  }

  // private atualizaQuantidadeRevisao = (): void => {
  //   atualizaQuantidadeRevisao(rootStore.getState().elementoReducer.revisoes, document.getElementById(this._idBadgeQuantidadeRevisao) as any);
  // };

  private atualizarStatusBotoesRevisao(): void {
    const numRevisoes = getQuantidadeRevisoes(rootStore.getState().elementoReducer.revisoes);
    this.btnAceitarTodasRevisoes && (this.btnAceitarTodasRevisoes.disabled = numRevisoes === 0);
    this.btnRejeitarTodasRevisoes && (this.btnRejeitarTodasRevisoes.disabled = numRevisoes === 0);
  }

  /**
   * Método utilizado para navegar entre as marcas de revisão
   * @param direcao
   */
  private navegarEntreMarcasRevisao = (direcao: string): void => {
    const atributo = direcao === 'abaixo' ? 'next' : 'prev';
    let linha = this.quill.linhaAtual;
    if (linha.elemento.revisao) {
      linha = linha[atributo];
    }

    while (linha && !linha.elemento.revisao) {
      linha = linha[atributo];
    }

    if (linha) {
      this.quill.desmarcarLinhaAtual(this.quill.linhaAtual);
      this.quill.marcarLinhaAtual(linha);
    }
  };

  private checkedSwitchMarcaAlteracao = (): void => {
    const switchMarcaAlteracaoView = document.getElementById(this._idSwitchRevisao) as any;
    setCheckedElement(switchMarcaAlteracaoView, rootStore.getState().elementoReducer.emRevisao);
  };

  private disabledParagrafoElementoRemovido = (event: StateEvent): void => {
    const elementos: Elemento[] = event.elementos ?? [];
    elementos!.forEach((elemento: Elemento) => {
      const paragrafo = document.getElementById('texto__dispositivo' + elemento.uuid) as any;

      if (paragrafo) {
        if (elemento.revisao && elemento.revisao.descricao === 'Dispositivo removido') {
          paragrafo.setAttribute('contenteditable', 'false');
        } else {
          paragrafo.setAttribute('contenteditable', 'true');
        }
      }
    });
  };
}
