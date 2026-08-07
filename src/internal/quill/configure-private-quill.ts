import { negrito } from '../../../assets/icons/icons';
import TableModule from '../../assets/js/quill1-table/index.js';
import Contain from '../../assets/js/quill1-table/js/ContainBlot.js';
import Table from '../../assets/js/quill1-table/js/TableBlot.js';
import TableCell from '../../assets/js/quill1-table/js/TableCellBlot.js';
import TableRow from '../../assets/js/quill1-table/js/TableRowBlot.js';
import { EstiloTextoClass } from '../../components/editor-texto-rico/estilos-texto';
import { MarginBottomClass } from '../../components/editor-texto-rico/margin-bottom';
import { ModuloAspasCurvas } from '../../components/editor-texto-rico/moduloAspasCurvas';
import { IdNotaRodapeAttribute, ModuloNotaRodape, NotaRodapeBlot, NumeroAttribute, TextoAttribute } from '../../components/editor-texto-rico/moduloNotaRodape';
import { CustomClipboard, CustomKeyboard, DelBlot, InsBlot, ModuloRevisao } from '../../components/editor-texto-rico/moduloRevisao';
import { NoIndentClass } from '../../components/editor-texto-rico/text-indent';
import { EtaBlotAbreAspas } from '../../util/eta-quill/eta-blot-abre-aspas';
import { EtaBlotConteudo } from '../../util/eta-quill/eta-blot-conteudo';
import { EtaBlotConteudoOmissis } from '../../util/eta-quill/eta-blot-conteudo-omissis';
import { EtaBlotEspaco } from '../../util/eta-quill/eta-blot-espaco';
import { EtaBlotExistencia } from '../../util/eta-quill/eta-blot-existencia';
import { EtaBlotFechaAspas } from '../../util/eta-quill/eta-blot-fecha-aspas';
import { EtaBlotMensagem } from '../../util/eta-quill/eta-blot-mensagem';
import { EtaBlotMensagens } from '../../util/eta-quill/eta-blot-mensagens';
import { EtaBlotMenu } from '../../util/eta-quill/eta-blot-menu';
import { EtaBlotMenuBotao } from '../../util/eta-quill/eta-blot-menu-botao';
import { EtaBlotMenuConteudo } from '../../util/eta-quill/eta-blot-menu-conteudo';
import { EtaBlotMenuItem } from '../../util/eta-quill/eta-blot-menu-item';
import { EtaBlotNotaAlteracao } from '../../util/eta-quill/eta-blot-nota-alteracao';
import { EtaBlotOpcoesDiff } from '../../util/eta-quill/eta-blot-opcoes-diff';
import { EtaBlotRevisao } from '../../util/eta-quill/eta-blot-revisao';
import { EtaBlotRevisaoAceitar } from '../../util/eta-quill/eta-blot-revisao-aceitar';
import { EtaBlotRevisaoRecusar } from '../../util/eta-quill/eta-blot-revisao-recusar';
import { EtaBlotRotulo } from '../../util/eta-quill/eta-blot-rotulo';
import { EtaBlotTipoOmissis } from '../../util/eta-quill/eta-blot-tipo-omissis';
import { EtaClipboard } from '../../util/eta-quill/eta-clipboard';
import { EtaContainerOpcoes } from '../../util/eta-quill/eta-container-opcoes';
import { EtaContainerRevisao } from '../../util/eta-quill/eta-container-revisao';
import { EtaContainerTable } from '../../util/eta-quill/eta-container-table';
import { EtaContainerTdDireito } from '../../util/eta-quill/eta-container-td-direito';
import { EtaContainerTdEsquerdo } from '../../util/eta-quill/eta-container-td-esquerdo';
import { EtaContainerTr } from '../../util/eta-quill/eta-container-tr';
import { EtaKeyboard } from '../../util/eta-quill/eta-keyboard';
import PrivateQuill from './private-quill';

let configured = false;

export const configurePrivateQuill = (): void => {
  if (configured) {
    return;
  }

  const Parchment: any = PrivateQuill.import('parchment');
  const id = new Parchment.Attributor.Attribute('id', 'id', { scope: Parchment.Scope.BLOCK });
  const paddingLeft = new Parchment.Attributor.Style('paddingLeft', 'padding-left', { scope: Parchment.Scope.BLOCK });
  const border = new Parchment.Attributor.Style('border', 'border', { scope: Parchment.Scope.BLOCK });
  const borderColor = new Parchment.Attributor.Style('borderColor', 'border-color', { scope: Parchment.Scope.BLOCK });
  const display = new Parchment.Attributor.Style('display', 'display', { scope: Parchment.Scope.BLOCK });
  const ariaLabel = new Parchment.Attributor.Style('aria-label', 'aria-label', { scope: Parchment.Scope.BLOCK });
  const DataRotulo = new Parchment.Attributor.Attribute('dataRotulo', 'data-rotulo', { scope: Parchment.Scope.BLOCK });

  const icons = PrivateQuill.import('ui/icons');
  icons['bold'] = negrito;

  const bold = PrivateQuill.import('formats/bold');
  bold.tagName = 'b';
  PrivateQuill.register(bold, true);

  const italic = PrivateQuill.import('formats/italic');
  italic.tagName = 'i';
  PrivateQuill.register(italic, true);

  PrivateQuill.register('modules/aspasCurvas', ModuloAspasCurvas, true);
  PrivateQuill.register('modules/revisao', ModuloRevisao, true);
  PrivateQuill.register('modules/notaRodape', ModuloNotaRodape, true);
  PrivateQuill.register('modules/table', TableModule, true);
  PrivateQuill.register('modules/eta-keyboard', EtaKeyboard, true);
  PrivateQuill.register('modules/eta-clipboard', EtaClipboard, true);
  PrivateQuill.register('modules/revisao-keyboard', CustomKeyboard, true);
  PrivateQuill.register('modules/revisao-clipboard', CustomClipboard, true);

  [
    InsBlot,
    DelBlot,
    NotaRodapeBlot,
    IdNotaRodapeAttribute,
    NumeroAttribute,
    TextoAttribute,
    TableCell,
    TableRow,
    Table,
    Contain,
    EtaBlotConteudoOmissis,
    EtaBlotAbreAspas,
    EtaBlotFechaAspas,
    EtaBlotNotaAlteracao,
    EtaBlotExistencia,
    EtaBlotTipoOmissis,
    EtaBlotConteudo,
    EtaBlotEspaco,
    EtaBlotMensagem,
    EtaBlotMensagens,
    EtaBlotMenuBotao,
    EtaBlotMenuConteudo,
    EtaBlotMenuItem,
    EtaBlotMenu,
    EtaBlotRotulo,
    EtaContainerTable,
    EtaContainerTdEsquerdo,
    EtaContainerTdDireito,
    EtaContainerTr,
    EtaContainerRevisao,
    EtaBlotRevisao,
    EtaBlotRevisaoAceitar,
    EtaBlotRevisaoRecusar,
    EtaContainerOpcoes,
    EtaBlotOpcoesDiff,
    id,
    paddingLeft,
    border,
    borderColor,
    display,
    ariaLabel,
    DataRotulo,
  ].forEach(definition => PrivateQuill.register(definition, true));

  PrivateQuill.register('formats/estilo-texto', EstiloTextoClass, true);
  PrivateQuill.register('formats/text-indent', NoIndentClass, true);
  PrivateQuill.register('formats/margin-bottom', MarginBottomClass, true);

  configured = true;
};
