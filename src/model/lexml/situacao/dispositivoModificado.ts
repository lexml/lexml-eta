import { Dispositivo } from '../../dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../../dispositivo/situacao';
import { Elemento } from '../../elemento';
import { ElementoAction } from '../acao';
import { AgruparElemento } from '../acao/agruparElementoAction';
import { RemoverElemento } from '../acao/removerElementoAction';
import { RenumerarElemento } from '../acao/renumerarElementoAction';
import { restaurarElementoAction } from '../acao/restaurarElemento';
import { TransformarElemento } from '../acao/transformarElementoAction';

export class DispositivoModificado implements TipoSituacao {
  descricaoSituacao = DescricaoSituacao.DISPOSITIVO_MODIFICADO;
  dispositivoOriginal: Elemento;

  constructor(dispositivoOriginal: Elemento) {
    this.dispositivoOriginal = dispositivoOriginal;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAcoesPermitidas(dispositivo: Dispositivo, acoes: any[]): any[] {
    const acoesFiltradas = acoes
      .filter((a: any) => !!a)
      .filter((a: ElementoAction) => !(a instanceof AgruparElemento))
      .filter((a: ElementoAction) => !(a instanceof RemoverElemento))
      .filter((a: ElementoAction) => !(a instanceof RenumerarElemento))
      .filter((a: ElementoAction) => !a.descricao?.startsWith('Mover'))
      .filter((acao: ElementoAction): boolean => acao.descricao !== 'Adicionar' && acao.descricao !== 'Atualizar dispositivo')
      .filter((a: ElementoAction) => !(a instanceof TransformarElemento));

    acoesFiltradas.push(restaurarElementoAction);

    return acoesFiltradas.filter(a => a !== undefined).sort((a, b) => a.descricao!.localeCompare(b.descricao!));
  }
}
