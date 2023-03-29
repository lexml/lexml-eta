import { Observable } from '../../util/observable';
import { InfoTextoColado } from '../../redux/elemento/util/colarUtil';
import { EtaQuill } from '../../util/eta-quill/eta-quill';
import { SlDialog } from '@shoelace-style/shoelace';
import { adicionarElementoFromClipboardAction } from '../../model/lexml/acao/AdicionarElementosFromClipboardAction';
import { TipoDispositivo } from '../../model/lexml/tipo/tipoDispositivo';

const ID_DIALOGO_TIPO_COLAGEM = 'slDialogoTipoColagem';
const ID_DIALOGO_MODIFICAR_EXISTENTE_ADICIONAR_NOVO = 'slDialogoModificarExistenteAdicionarNovo';
const ID_DIALOGO_MODIFICAR_DISPOSITIVOS_EXISTENTES = 'slDialogoModificarDispositivosExistentes';
const ID_DIALOGO_ADICIONAR_APOS_ATUAL = 'slDialogoAdicionarAposAtual';

const RODAPE_CONFIRMAR = 'RODAPE_CONFIRMAR';
const RODAPE_FECHAR = 'RODAPE_FECHAR';

const ANTES_DE_PROSSEGUIR = 'Antes de prosseguir';
const OPERACAO_NAO_PERMITIDA = 'Operação não permitida';
const DISPOSITIVO_JA_EXISTE = 'Atenção, dispositivo já existe no texto';
const DANGER = 'danger';
const INFO = 'primary';
const SVG_DANGER = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519941
9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115
23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776
18.6668C23.2962 16.6934 24 14.3734 24 12C24 10.4241 23.6896 8.8637 23.0866 7.4078C22.4835 5.95189 21.5996 4.62902
20.4853 3.51472C19.371 2.40041 18.0481 1.5165 16.5922 0.913445C15.1363 0.310389 13.5759 0 12 0ZM12 18C11.7627 18
11.5307 17.9296 11.3333 17.7978C11.136 17.6659 10.9822 17.4785 10.8913 17.2592C10.8005 17.0399 10.7768 16.7987
10.8231 16.5659C10.8694 16.3331 10.9837 16.1193 11.1515 15.9515C11.3193 15.7836 11.5331 15.6694 11.7659 15.6231C11.9987
15.5768 12.24 15.6005 12.4592 15.6913C12.6785 15.7822 12.8659 15.936 12.9978 16.1333C13.1296 16.3307 13.2 16.5627 13.2
16.8C13.2 17.1183 13.0736 17.4235 12.8485 17.6485C12.6235 17.8736 12.3183 18 12 18ZM13.2 13.2C13.2 13.5183 13.0736 13.8235
12.8485 14.0485C12.6235 14.2736 12.3183 14.4 12 14.4C11.6817 14.4 11.3765 14.2736 11.1515 14.0485C10.9264 13.8235 10.8
13.5183 10.8 13.2V7.2C10.8 6.88174 10.9264 6.57651 11.1515 6.35147C11.3765 6.12643 11.6817 6 12 6C12.3183 6 12.6235
6.12643 12.8485 6.35147C13.0736 6.57651 13.2 6.88174 13.2 7.2V13.2Z" fill="#CA3A31"/>
</svg>`;
const SVG_INFO = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
<path d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21508 0.913451 7.4078C0.00519941
9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.807 3.51472 20.4853C5.19295 22.1635 7.33115
23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0865C18.7849 22.1783 20.6591 20.6402 21.9776
18.6668C23.2962 16.6934 24 14.3734 24 12C24 10.4241 23.6896 8.8637 23.0866 7.4078C22.4835 5.95189 21.5996 4.62902
20.4853 3.51472C19.371 2.40042 18.0481 1.5165 16.5922 0.913445C15.1363 0.310389 13.5759 0 12 0V0ZM12 18C11.7627 18
11.5307 17.9296 11.3333 17.7978C11.136 17.6659 10.9822 17.4785 10.8913 17.2592C10.8005 17.0399 10.7768 16.7987 10.8231
16.5659C10.8694 16.3331 10.9837 16.1193 11.1515 15.9515C11.3193 15.7836 11.5331 15.6694 11.7659 15.6231C11.9987
15.5768 12.24 15.6005 12.4592 15.6913C12.6785 15.7822 12.8659 15.936 12.9978 16.1333C13.1296 16.3307 13.2 16.5627
13.2 16.8C13.2 17.1183 13.0736 17.4235 12.8485 17.6485C12.6235 17.8736 12.3183 18 12 18ZM13.2 13.2C13.2 13.5183 13.0736
13.8235 12.8485 14.0485C12.6235 14.2736 12.3183 14.4 12 14.4C11.6817 14.4 11.3765 14.2736 11.1515 14.0485C10.9264 13.8235
10.8 13.5183 10.8 13.2V7.2C10.8 6.88174 10.9264 6.57651 11.1515 6.35147C11.3765 6.12643 11.6817 6 12 6C12.3183 6
12.6235 6.12643 12.8485 6.35147C13.0736 6.57651 13.2 6.88174 13.2 7.2V13.2Z" fill="#3982C1"/>
</svg>`;

export const onChangeColarDialog: Observable<string> = new Observable<string>();

export class DialogColagem {
  quill!: EtaQuill;
  rootStore?: any;
  infoTextoColado!: InfoTextoColado;
  idDialog!: string;
  labelDialog!: string;
  tipoRodape!: string;
  mensagens: string[] = [];
  variante?: string;
  range?: any;
  nomeDispositivoSingular = '';
  nomeDispositivoPlural = '';
  isPrimeiroDialogoTipoColagem = true;
}

const montaDialogoTipoColagem = (dialogColagem: DialogColagem): void => {
  const mensagens = ['Selecione abaixo o formato com o qual gostaria de colar seu texto.'];
  dialogColagem.mensagens = mensagens;
  dialogColagem.idDialog = ID_DIALOGO_TIPO_COLAGEM;
  dialogColagem.labelDialog = ANTES_DE_PROSSEGUIR;
  dialogColagem.tipoRodape = RODAPE_CONFIRMAR;
  dialogColagem.variante = INFO;
  montaDialogo(dialogColagem);
};

const montaDialagoNaoPermitidoPadrao = (dialogColagem: DialogColagem): void => {
  dialogColagem.mensagens = dialogColagem.infoTextoColado.restricoes[0].mensagens;
  dialogColagem.idDialog = 'slDialogoNaoPermitido';
  dialogColagem.labelDialog = OPERACAO_NAO_PERMITIDA;
  dialogColagem.tipoRodape = RODAPE_FECHAR;
  dialogColagem.variante = DANGER;
  montaDialogo(dialogColagem);
};

const montaDialogoAdicionarAposAtual = (dialogColagem: DialogColagem): void => {
  const mensagens = [
    ...dialogColagem.infoTextoColado.restricoes[0].mensagens,
    'Você deseja adicionar ' +
      getConcordanciaTodosTodas(dialogColagem.nomeDispositivoSingular) +
      getConcordanciaAsOs(dialogColagem.nomeDispositivoSingular) +
      dialogColagem.nomeDispositivoPlural +
      ' após a posição atual?',
  ];
  dialogColagem.mensagens = mensagens;
  dialogColagem.idDialog = ID_DIALOGO_ADICIONAR_APOS_ATUAL;
  dialogColagem.tipoRodape = RODAPE_CONFIRMAR;
  dialogColagem.variante = INFO;

  montaDialogo(dialogColagem);
};

const montaDialogoModificarExistenteAdicionarNovo = (dialogColagem: DialogColagem): void => {
  dialogColagem.idDialog = ID_DIALOGO_MODIFICAR_EXISTENTE_ADICIONAR_NOVO;
  dialogColagem.labelDialog = DISPOSITIVO_JA_EXISTE;
  dialogColagem.tipoRodape = RODAPE_CONFIRMAR;
  dialogColagem.variante = INFO;
  const mensagens = [
    'Você gostaria de modificar ' +
      getConcordanciaAsOs(dialogColagem.nomeDispositivoSingular) +
      dialogColagem.nomeDispositivoPlural +
      ' existentes ou adicionar novos após o atual?',
  ];
  dialogColagem.mensagens = mensagens;
  montaDialogo(dialogColagem);
};

/**
 * Inicializa caixas de diálogo
 */
export const colarTextoArticuladoDialog = (quill: EtaQuill, rootStore: any, infoTextoColado: InfoTextoColado, range: any, isPrimeiroDialogoTipoColagem = true): void => {
  const dialogColagem: DialogColagem = new DialogColagem();
  dialogColagem.quill = quill;
  dialogColagem.rootStore = rootStore;
  dialogColagem.infoTextoColado = infoTextoColado;
  dialogColagem.range = range;
  dialogColagem.nomeDispositivoSingular = getNomeDispositivo(TipoSubstantivoEnum.SINGULAR, dialogColagem.infoTextoColado);
  dialogColagem.nomeDispositivoPlural = getNomeDispositivo(TipoSubstantivoEnum.PLURAL, dialogColagem.infoTextoColado);
  dialogColagem.isPrimeiroDialogoTipoColagem = isPrimeiroDialogoTipoColagem;

  montaDialogoTipoColagem(dialogColagem);
  dialogColagem.isPrimeiroDialogoTipoColagem = false;
};

/**
 * Método utilizado para criar caixas de diálogo conforme restrições encontradas
 *
 * @param dialogColagem
 */
const executarValidacaoRestricao = (dialogColagem: DialogColagem): void => {
  if (dialogColagem.infoTextoColado.restricoes.length) {
    const restricao = dialogColagem.infoTextoColado.restricoes[0];
    dialogColagem.labelDialog = restricao.titulo || OPERACAO_NAO_PERMITIDA;
    restricao.isPermitidoColarAdicionando ? montaDialogoAdicionarAposAtual(dialogColagem) : montaDialagoNaoPermitidoPadrao(dialogColagem);
  } else if (dialogColagem.infoTextoColado.restricoes.length === 0 && dialogColagem.infoTextoColado.infoElementos.existentes.length === 0) {
    adicionaElemento(dialogColagem, false);
  } else {
    montaDialogoModificarExistenteAdicionarNovo(dialogColagem);
  }
};

/**
 * Constrói dinamicamente html e ações de cada caixa de diálogo
 */
const montaDialogo = (dialogColagem: DialogColagem): void => {
  Array.from(document.querySelectorAll('.dialogo-colagem')).forEach(el => document.body.removeChild(el));

  const dialogElem = document.createElement('sl-dialog');
  dialogElem.classList.add('dialogo-colagem');
  dialogElem.id = dialogColagem.idDialog;

  document.body.appendChild(dialogElem);
  dialogElem.label = dialogColagem.labelDialog as string;

  const content = document.createRange().createContextualFragment(`
    <style>
      .rodape-confirmar {
        float: right;
      }
      .tiposColagem {
        font-weight: normal;
      }
    </style>
      <div class="tiposColagem">
        ${buildMessages(dialogColagem.mensagens)}
        <br><br>
        ${getRadioGroup(dialogColagem)}
        <div class="rodape-confirmar">
        ${getTipoRodape(dialogColagem)}
        <div/>
      </div>
  `);

  buildButtons(content, dialogElem, dialogColagem);

  buildRadioClick(content);

  dialogColagem.quill.blur();
  dialogElem.appendChild(content);
  dialogElem.show();

  setTimeout(() => addIconBeforeTitle(dialogColagem), 0);

  if (dialogColagem.idDialog === ID_DIALOGO_TIPO_COLAGEM) {
    setTimeout(() => setFocusButtonConfirmar(), 0);
  }
};

const setFocusButtonConfirmar = (): void => {
  document.getElementById('btnConfirmar')!.focus();
};

const addIconBeforeTitle = (dialogColagem: DialogColagem): void => {
  const elDialogTitle = document.querySelector('#' + dialogColagem.idDialog)!.shadowRoot!.querySelector('#title');
  elDialogTitle?.insertAdjacentHTML('afterbegin', getIcon(dialogColagem));
};

const getIcon = (dialogColagem: DialogColagem): string => {
  if (dialogColagem.variante === DANGER) {
    return SVG_DANGER;
  }
  return SVG_INFO;
};

/**
 * Define os botões da caixa de diálogo
 */
const buildButtons = (content: DocumentFragment, dialogElem: SlDialog, dialogColagem: DialogColagem): void => {
  const botoes = content.querySelectorAll('sl-button');

  if (botoes.length === 1) {
    const fechar = botoes[0];
    fechar.onclick = (): void => {
      fecharDialog(dialogElem, dialogColagem);
    };
  } else if (botoes.length > 1) {
    const confirma = botoes[0];
    const fechar = botoes[1];

    fechar.onclick = (): void => {
      fecharDialog(dialogElem, dialogColagem);
    };

    confirma.onclick = (): void => {
      executeByIdDialog(dialogColagem, dialogElem);
    };
  }
};

const buildRadioClick = (content: DocumentFragment): void => {
  const radio = content.querySelectorAll('sl-radio');

  if (radio.length > 0) {
    const opt1 = radio[0];
    const opt2 = radio[1];

    opt1.onclick = (): void => {
      habilitaBotaoConfirmar();
    };
    opt2.onclick = (): void => {
      habilitaBotaoConfirmar();
    };
  }
};

const getValueFromRadioGroup = (idRadioGroup: string): string => {
  return (document.getElementById(idRadioGroup)!.querySelector('sl-radio[checked]') as any).value;
};

/**
 * Realiza validação e constrói ação de cada situação de cada caixa de diálogo de acordo com o texto colado
 */
const executeByIdDialog = (dialogColagem: DialogColagem, dialogElem: SlDialog): void => {
  const { idDialog } = dialogColagem;
  let valor = '';
  let colarSubstituindo = false;

  if (idDialog === ID_DIALOGO_ADICIONAR_APOS_ATUAL) {
    valor = getValueFromRadioGroup('rdgSimNao') === '1' ? '1' : '';
  } else if (idDialog === ID_DIALOGO_TIPO_COLAGEM) {
    valor = getValueFromRadioGroup('rdgTipoColagem');
    if (valor === '1') {
      colarComoTextoSimples(dialogColagem);
      valor = ''; // para não executar adicionarElementoFromClipboardAction
    } else if (valor === '2' && dialogColagem.isPrimeiroDialogoTipoColagem) {
      dialogColagem.isPrimeiroDialogoTipoColagem = false;
      valor = '';
      colarTextoArticuladoDialog(dialogColagem.quill, dialogColagem.rootStore, dialogColagem.infoTextoColado, dialogColagem.range, false);
    } else if (valor === '2' && !dialogColagem.isPrimeiroDialogoTipoColagem) {
      executarValidacaoRestricao(dialogColagem);
      valor = '';
    }
  } else if (idDialog === ID_DIALOGO_MODIFICAR_EXISTENTE_ADICIONAR_NOVO) {
    valor = getValueFromRadioGroup('rdgModificarExistenteAdicionarNovo');
    colarSubstituindo = valor === '1';
  }

  if (valor) {
    adicionaElemento(dialogColagem, colarSubstituindo);
  }

  fecharDialog(dialogElem, dialogColagem);
};

const adicionaElemento = (dialogColagem: DialogColagem, colarSubstituindo: boolean): void => {
  const { infoTextoColado, rootStore } = dialogColagem;
  rootStore.dispatch(
    adicionarElementoFromClipboardAction.execute(
      infoTextoColado.infoElementos.atual,
      infoTextoColado.jsonix,
      undefined,
      infoTextoColado.infoElementos.atual.dispositivoAlteracao,
      colarSubstituindo,
      'depois'
    )
  );
};

const colarComoTextoSimples = (dialogColagem: DialogColagem): void => {
  const { quill, range, infoTextoColado } = dialogColagem;
  quill.clipboard.dangerouslyPasteHTML(range.index, infoTextoColado.textoColadoOriginal);
  onChangeColarDialog.notify('clipboard');
};

const fecharDialog = (dialogElem: SlDialog, dialogColagem: DialogColagem): void => {
  dialogElem?.hide();
  if (document.body.contains(dialogElem)) {
    document.body.removeChild(dialogElem);
  }
  setTimeout(() => dialogColagem.quill.focus(), 0);
};

const buildMessages = (mensagens: string[]): string => mensagens.join('<br><br>');

const getRadioGroup = (dialogColagem: DialogColagem): string => {
  if (dialogColagem.idDialog === ID_DIALOGO_TIPO_COLAGEM) {
    return getRadioGroupTipoColagem();
  } else if (dialogColagem.idDialog === ID_DIALOGO_MODIFICAR_EXISTENTE_ADICIONAR_NOVO) {
    return getRadioGroupModificarExistenteAdicionarNovo(dialogColagem);
  } else if (dialogColagem.idDialog === ID_DIALOGO_MODIFICAR_DISPOSITIVOS_EXISTENTES || dialogColagem.idDialog === ID_DIALOGO_ADICIONAR_APOS_ATUAL) {
    return getRadioGroupSimNao();
  }
  return '';
};

const getRadioGroupTipoColagem = (): string => {
  return `
  <sl-radio-group id="rdgTipoColagem">
    <sl-radio class="tipo-colagem" id="colarSimples" value="1">Colar como texto simples</sl-radio>
    <sl-radio class="tipo-colagem" id="colarEstruturado" value="2" checked>Colar como dispositivo</sl-radio>
  </sl-radio-group>
  `;
};

const getRadioGroupModificarExistenteAdicionarNovo = (dialogColagem: DialogColagem): string => {
  return (
    `
  <sl-radio-group id="rdgModificarExistenteAdicionarNovo">
    <sl-radio id="modificarExistente" value="1">Modificar ` +
    dialogColagem.nomeDispositivoPlural +
    ` existentes</sl-radio>
    <sl-radio id="adicionarNovo" value="2">Adicionar nov` +
    getConcordanciaAsOs(dialogColagem.nomeDispositivoSingular) +
    dialogColagem.nomeDispositivoPlural +
    `</sl-radio>
  </sl-radio-group>
  `
  );
};

const getRadioGroupSimNao = (): string => {
  return `
  <sl-radio-group id="rdgSimNao">
    <sl-radio id="sim" value="1">Sim</sl-radio>
    <sl-radio id="nao" value="2">Não</sl-radio>
  </sl-radio-group>
  `;
};

const getTipoRodape = (dialogColagem: DialogColagem): string => (dialogColagem.tipoRodape === RODAPE_CONFIRMAR ? getRodapeConfirmar(dialogColagem) : getRodapeFechar());

const getRodapeFechar = (): string => {
  return `
    <div class="rodape-confirmar">
      <br/>
      <sl-button slot="footer" variant="primary">Fechar</sl-button>
    </div>
  `;
};

const getRodapeConfirmar = (dialogColagem: DialogColagem): string => {
  const disabled = dialogColagem.idDialog === ID_DIALOGO_TIPO_COLAGEM ? '' : 'disabled';
  return `
    <div class="rodape-confirmar" id="rodapeConfirmar">
      <br/>
      <sl-button id="btnConfirmar" slot="footer" variant="primary" ${disabled}>Confirmar</sl-button>
      <sl-button slot="footer" variant="default">Fechar</sl-button>
    </div>
  `;
};

const habilitaBotaoConfirmar = (): void => {
  (document.getElementById('btnConfirmar') as any).disabled = false;
  setFocusButtonConfirmar();
};

enum TipoSubstantivoEnum {
  PLURAL,
  SINGULAR,
}

/**
 * Retorna o nome do dispositivo no singular ou plural
 */
const getNomeDispositivo = (tipoSubstantivo: TipoSubstantivoEnum, infoTextoColado: InfoTextoColado): string => {
  const dispositivo = infoTextoColado.infoElementos.tiposColados[0].toLowerCase();
  return tipoSubstantivo === TipoSubstantivoEnum.PLURAL ? TipoDispositivo[dispositivo].descricaoPlural!.toLowerCase() : TipoDispositivo[dispositivo].descricao!.toLowerCase();
};

// /**
//  * Retorna a concordância de início de frase
//  */
// const getConcordanciaInicialMensagem = (nomeDispositivo: string): string => (isGeneroFeminino(nomeDispositivo) ? 'A ' : 'O ');

const isGeneroFeminino = (nomeDispositivo: string): boolean => ['parte', 'seção', 'subseção', 'alínea'].includes(nomeDispositivo);

/**
 * retorna concordância de meio de frase 'todos' e 'todas'
 */
const getConcordanciaTodosTodas = (nomeDispositivo: string): string => (isGeneroFeminino(nomeDispositivo) ? 'todas ' : 'todos ');

/**
 * retorna concordância de meio de frase 'as' e 'os'
 */
const getConcordanciaAsOs = (nomeDispositivo: string): string => (isGeneroFeminino(nomeDispositivo) ? 'as ' : 'os ');
