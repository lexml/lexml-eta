import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../dispositivo/situacao';
import { ElementoAction } from '../acao';

export class DispositivoNovo implements TipoSituacao {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_NOVO;

  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    const acoesSemDuplicidade = [...new Set(acoes)];

    return acoesSemDuplicidade
      .filter(a => a !== undefined)
      .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
      .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
  }
}
