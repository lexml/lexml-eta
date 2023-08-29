import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { exibirDiferencaAction } from '../../../model/lexml/acao/exibirDiferencaAction';
import { RevisaoElemento } from '../../../model/revisao/revisao';
import { State } from '../../state';

export const adicionaDiffMenuOpcoes = (state: State): State => {
  state.ui?.events.forEach(se =>
    se.elementos?.filter(Boolean).forEach(e => {
      if (
        e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO ||
        (e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ADICIONADO && e.revisao && e.revisao.descricao === 'Texto do dispositivo foi alterado') ||
        (e.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && e.revisao && (e.revisao as RevisaoElemento).elementoAntesRevisao?.conteudo?.texto !== e.conteudo?.texto)
      ) {
        !e.acoesPossiveis!.includes(exibirDiferencaAction) && e.acoesPossiveis!.push(exibirDiferencaAction);
      }
    })
  );

  return state;
};
