import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../dispositivo/situacao';
import { Elemento } from '../../elemento';
import { ElementoAction } from '../acao';
import { AGRUPAR_ELEMENTO } from '../acao/agruparElementoAction';
import { restaurarElementoAction } from '../acao/restaurarElemento';

export class DispositivoModificado implements TipoSituacao {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_MODIFICADO;
  dispositivoOriginal: Elemento;

  constructor(dispositivoOriginal: Elemento) {
    this.dispositivoOriginal = dispositivoOriginal;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    acoes.push(restaurarElementoAction);

    const acoesSemDuplicidade = [...new Set(acoes)];

    return acoesSemDuplicidade
      .filter(a => a !== undefined)
      .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
      .filter((acao: ElementoAction): boolean => acao.tipo !== AGRUPAR_ELEMENTO)
      .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
  }
}
