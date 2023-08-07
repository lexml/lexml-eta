import { EtaContainerRevisao } from './eta-container-revisao';
import { DescricaoSituacao } from './../../model/dispositivo/situacao';
import { EtaBlotQuebraLinha } from './eta-blot-quebra-linha';
import { EtaBlotTipoOmissis } from './eta-blot-tipo-omissis';
import { EtaBlotExistencia } from './eta-blot-existencia';
import { EtaBlotAbreAspas } from './eta-blot-abre-aspas';
import { EtaBlotFechaAspas } from './eta-blot-fecha-aspas';
import { EtaBlotNotaAlteracao } from './eta-blot-nota-alteracao';
import { Elemento } from '../../model/elemento';
import { Mensagem } from '../../model/lexml/util/mensagem';
import { EtaBlotConteudo } from './eta-blot-conteudo';
import { EtaBlotEspaco } from './eta-blot-espaco';
import { EtaBlotMensagem } from './eta-blot-mensagem';
import { EtaBlotRotulo } from './eta-blot-rotulo';
import { EtaContainerTable } from './eta-container-table';
import { EtaContainerTdDireito } from './eta-container-td-direito';
import { EtaContainerTdEsquerdo } from './eta-container-td-esquerdo';
import { EtaContainerTr } from './eta-container-tr';
import { AlinhamentoMenu } from './eta-blot-menu';
import { EtaBlotRevisao } from './eta-blot-revisao';
import { EtaBlotRevisaoAceitar } from './eta-blot-revisao-aceitar';
import { EtaBlotRevisaoRecusar } from './eta-blot-revisao-recusar';
import { isRevisaoPrincipal } from '../../redux/elemento/util/revisaoUtil';
// import { EtaContainerOpcoes } from './eta-container-opcoes';
// import { EtaBlotOpcoesDiff } from './eta-blot-opcoes-diff';

export class EtaQuillUtil {
  static alinhamentoMenu = AlinhamentoMenu.Esquerda;

  static criarContainerLinha(elemento: Elemento): EtaContainerTable {
    const etaTable: EtaContainerTable = new EtaContainerTable(elemento);
    const etaTrContainer: EtaContainerTr = new EtaContainerTr(elemento.editavel, this.alinhamentoMenu);
    const etaTdTexto: EtaContainerTdEsquerdo = new EtaContainerTdEsquerdo(elemento);
    const etaTdEspaco: EtaContainerTdDireito = new EtaContainerTdDireito(this.alinhamentoMenu);

    if (elemento.abreAspas) {
      new EtaBlotAbreAspas(elemento).insertInto(etaTdTexto);
    }

    new EtaBlotRotulo(elemento).insertInto(etaTdTexto);

    if (elemento.dispositivoAlteracao === true && elemento.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO) {
      new EtaBlotExistencia(elemento).insertInto(etaTdTexto);
    }

    if (elemento.tipo === 'Omissis') {
      new EtaBlotTipoOmissis(elemento).insertInto(etaTdTexto);
    }

    if (elemento.agrupador) {
      new EtaBlotQuebraLinha().insertInto(etaTdTexto);
    }

    new EtaBlotConteudo(elemento).insertInto(etaTdTexto);

    // new EtaBlotFechaAspas(elemento).insertInto(etaTdTexto);
    // new EtaBlotNotaAlteracao(elemento).insertInto(etaTdTexto);
    if (elemento.fechaAspas !== undefined && elemento.fechaAspas) {
      new EtaBlotFechaAspas(elemento).insertInto(etaTdTexto);
      if (elemento.notaAlteracao) {
        new EtaBlotNotaAlteracao(elemento).insertInto(etaTdTexto);
      }
    }

    new EtaBlotEspaco().insertInto(etaTdEspaco);

    if (elemento.revisao && isRevisaoPrincipal(elemento.revisao)) {
      EtaQuillUtil.criarContainerRevisao(elemento).insertInto(etaTrContainer);
    }

    // if (elemento.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO || (elemento.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO && elemento.revisao)) {
    //   EtaQuillUtil.criarContainerOpcoes(elemento).insertInto(etaTrContainer);
    // }

    etaTdTexto.insertInto(etaTrContainer);
    etaTdEspaco.insertInto(etaTrContainer);

    etaTrContainer.insertInto(etaTable);

    return etaTable;
  }

  static criarContainerRevisao(elemento: Elemento): EtaContainerRevisao {
    const etaContainerRevisao: EtaContainerRevisao = new EtaContainerRevisao(elemento);
    new EtaBlotRevisaoAceitar(elemento).insertInto(etaContainerRevisao);
    new EtaBlotRevisaoRecusar(elemento).insertInto(etaContainerRevisao);
    new EtaBlotRevisao(elemento).insertInto(etaContainerRevisao);
    return etaContainerRevisao;
  }

  // static criarContainerOpcoes(elemento: Elemento): EtaContainerOpcoes {
  //   const etaContainerOpcoes: EtaContainerOpcoes = new EtaContainerOpcoes(elemento);
  //   new EtaBlotOpcoesDiff(elemento).insertInto(etaContainerOpcoes);
  //   return etaContainerOpcoes;
  // }

  static criarContainerMensagens(elemento: Elemento): EtaContainerTr {
    const etaTrContainer: EtaContainerTr = new EtaContainerTr(false, this.alinhamentoMenu);
    const etaTdMensagens: EtaContainerTdEsquerdo = new EtaContainerTdEsquerdo(elemento);
    const etaTdEspaco: EtaContainerTdDireito = new EtaContainerTdDireito(this.alinhamentoMenu);

    if (elemento.mensagens && elemento.mensagens.length > 0) {
      elemento.mensagens.forEach((mensagem: Mensagem): void => {
        new EtaBlotMensagem(mensagem).insertInto(etaTdMensagens);
      });
    }
    new EtaBlotEspaco().insertInto(etaTdEspaco);
    etaTdMensagens.domNode.classList.add('container__texto--mensagem');
    etaTdMensagens.insertInto(etaTrContainer);
    etaTdEspaco.insertInto(etaTrContainer);

    return etaTrContainer;
  }
}
