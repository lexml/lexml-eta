import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArticulacao, isCaput } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { getDispositivoPosteriorNaSequenciaDeLeitura } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { RevisaoElemento } from '../../../model/revisao/revisao';
import { State, StateEvent, StateType } from '../../state';
import { findPaginaByUuidDispositivo, getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao, hasMultiplasPaginas } from '../util/paginacaoUtil';
import {
  excluidoImediatamenteAntes,
  findRevisaoByElementoUuid,
  findRevisaoElementoPrincipal,
  isRevisaoDeExclusao,
  isRevisaoElemento,
  isRevisaoPrincipal,
  principalDoExcluido,
} from '../util/revisaoUtil';

// Item da ordem de leitura: um dispositivo do texto ou a exclusão principal que aparece no lugar do excluído.
type ItemDeLeitura = { dispositivo?: Dispositivo; exclusao?: RevisaoElemento; alterado: boolean };

export const navegaEntreDispositivosAlterados = (state: any, action: any): State => {
  const sequencia = montaSequenciaDeLeitura(state);
  const posicao = posicaoNaSequencia(sequencia, state, action.atual);
  const passo = action.direcao === 'proximo' ? 1 : -1;
  let indice = posicao < 0 ? -1 : posicao + passo;
  while (indice >= 0 && indice < sequencia.length && !sequencia[indice].alterado) indice += passo;

  const item = posicao < 0 ? undefined : sequencia[indice];
  if (!item) {
    state.ui.events = [];
    return state;
  }

  const elementoAlterado = (item.exclusao ? item.exclusao.elementoAposRevisao : createElemento(item.dispositivo!)) as Elemento;
  let pagina = state.ui?.paginacao?.paginaSelecionada;
  const eventos: StateEvent[] = [];

  // Se a articulação tiver mais de uma página, verifica se o elemento alterado está em outra página
  if (hasMultiplasPaginas(state)) {
    // O excluído não está na articulação: vale a página do dispositivo do texto logo acima dele.
    const ref = item.dispositivo ?? dispositivoAcima(sequencia, indice);
    const paginaDoRef = ref && findPaginaByUuidDispositivo(state.ui.paginacao, ref.uuid!);
    if (paginaDoRef) {
      pagina = paginaDoRef;
      if (pagina !== state.ui.paginacao.paginaSelecionada) {
        eventos.push({
          stateType: StateType.PaginaArticulacaoSelecionada,
          elementos: getElementosDaArticulacaoEElementosExcluidosEmModoDeRevisao(state),
        });
      }
    }
  }

  eventos.push(
    ...[
      {
        stateType: StateType.ElementoMarcado,
        elementos: [elementoAlterado],
      },
      {
        stateType: StateType.ElementoSelecionado,
        elementos: [elementoAlterado],
      },
    ]
  );

  return {
    ...state,
    ui: {
      events: eventos,
      alertas: state.ui?.alertas,
      paginacao: {
        ...state.ui?.paginacao,
        paginaSelecionada: pagina,
      },
    },
  };
};

// Epígrafe, ementa, preâmbulo e articulação (sem caput), com cada exclusão logo depois do dispositivo ou do excluído acima dela.
const montaSequenciaDeLeitura = (state: State): ItemDeLeitura[] => {
  const articulacao = state.articulacao as Articulacao;
  const revisoes = (state.revisoes ?? []).filter(isRevisaoElemento) as RevisaoElemento[];
  const principais = revisoes.filter(isRevisaoPrincipal);
  const todasExclusoes = revisoes.filter(isRevisaoDeExclusao);
  const exclusoes = principais.filter(isRevisaoDeExclusao);

  const dispositivos: Dispositivo[] = [articulacao, articulacao.projetoNorma?.ementa, articulacao.projetoNorma?.preambulo].filter(d => !!d) as Dispositivo[];
  for (let d = getDispositivoPosteriorNaSequenciaDeLeitura(articulacao, d => !isCaput(d)); d; d = getDispositivoPosteriorNaSequenciaDeLeitura(d, d => !isCaput(d))) {
    dispositivos.push(d);
  }
  const uuidsDoTexto = new Set(dispositivos.map(d => d.uuid));

  // A chave da âncora: o dispositivo do texto ("d") ou a exclusão principal ("r") logo acima do excluído.
  const ancoradas = new Map<string, RevisaoElemento[]>();
  exclusoes.forEach(r => {
    const anterior = r.elementoAposRevisao.elementoAnteriorNaSequenciaDeLeitura;
    const excluidoAcima = anterior?.uuid2 === '_encadeado' ? excluidoImediatamenteAntes(r, exclusoes) : principalDoExcluido(anterior?.uuid, todasExclusoes, r);
    const chave = anterior?.uuid !== undefined && uuidsDoTexto.has(anterior.uuid) ? `d${anterior.uuid}` : excluidoAcima ? `r${excluidoAcima.id}` : '';
    ancoradas.set(chave, [...(ancoradas.get(chave) ?? []), r]);
  });

  const sequencia: ItemDeLeitura[] = [];
  const incluidas = new Set<RevisaoElemento>();
  const incluiAncoradas = (chave: string): void => {
    (ancoradas.get(chave) ?? [])
      .filter(r => !incluidas.has(r))
      .forEach(r => {
        incluidas.add(r);
        sequencia.push({ exclusao: r, alterado: true });
        incluiAncoradas(`r${r.id}`);
      });
  };

  dispositivos.forEach(d => {
    sequencia.push({ dispositivo: d, alterado: !isArticulacao(d) && !!findRevisaoByElementoUuid(principais, d.uuid!) });
    incluiAncoradas(`d${d.uuid}`);
  });
  // Exclusão sem âncora conhecida vai para o fim, para continuar alcançável.
  exclusoes.filter(r => !incluidas.has(r)).forEach(r => sequencia.push({ exclusao: r, alterado: true }));
  return sequencia;
};

// O excluído (ou um descendente dele) conta como a exclusão principal.
const posicaoNaSequencia = (sequencia: ItemDeLeitura[], state: State, atual: Elemento): number => {
  const doTexto = sequencia.findIndex(item => item.dispositivo?.uuid === atual?.uuid);
  if (doTexto >= 0) {
    return doTexto;
  }
  const revisao = findRevisaoByElementoUuid(state.revisoes, atual?.uuid);
  if (!revisao || !isRevisaoDeExclusao(revisao)) {
    return -1;
  }
  const principal = isRevisaoPrincipal(revisao) ? revisao : findRevisaoElementoPrincipal(state, state.revisoes!, revisao);
  return sequencia.findIndex(item => item.exclusao === principal);
};

const dispositivoAcima = (sequencia: ItemDeLeitura[], indice: number): Dispositivo | undefined => {
  for (let i = indice - 1; i >= 0; i--) {
    if (sequencia[i].dispositivo) return sequencia[i].dispositivo;
  }
  return undefined;
};
