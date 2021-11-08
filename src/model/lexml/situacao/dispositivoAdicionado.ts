import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { ElementoAction } from '../acao';
import { AGRUPAR_ELEMENTO } from '../acao/agruparElementoAction';
import { hasApenasDispositivosIrmaosNovos as hasApenasDispositivosIrmaosAdicionados } from '../regras/regrasUtil';
import { DispositivoNovo } from './dispositivoNovo';

export class DispositivoAdicionado extends DispositivoNovo {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_ADICIONADO;

  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    const acoesSemDuplicidade = [...new Set(acoes)];

    return acoesSemDuplicidade
      .filter(a => a !== undefined)
      .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
      .filter((acao: ElementoAction): boolean => acao.tipo !== AGRUPAR_ELEMENTO)
      .filter((a: ElementoAction) => !a.descricao?.startsWith('Mover') || hasApenasDispositivosIrmaosAdicionados(dispositivo))
      .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
  }
}
