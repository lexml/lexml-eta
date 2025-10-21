import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao } from '../../dispositivo/situacao';
import { ClassificacaoDocumento } from '../../documento/classificacao';
import { ElementoAction } from '../acao';
import { AgruparElemento } from './../acao/agruparElementoAction';
import { DispositivoNovo } from './dispositivoNovo';

export class DispositivoAdicionado extends DispositivoNovo {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_ADICIONADO;
  tipoEmenda = ClassificacaoDocumento.PROJETO;
  existeNaNormaAlterada?;

  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    const acoesSemDuplicidade = [...new Set(acoes)];

    return acoesSemDuplicidade
      .filter((a: ElementoAction) => !(a instanceof AgruparElemento))
      .filter(a => a !== undefined)
      .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
      .sort((a, b) => a.descricao!.localeCompare(b.descricao!));
  }
}
