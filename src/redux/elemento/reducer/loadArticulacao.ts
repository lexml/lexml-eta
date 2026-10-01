import { configurarPaginacao } from '../util/paginacaoUtil';
import { LexmlEtaParametrosEdicao } from '../../../components/lexml-eta.component';
import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArtigo, isCaput, isParagrafo } from '../../../model/dispositivo/tipo';
import { createElementoValidadoComExtras, getElementos } from '../../../model/elemento/elementoUtil';
import { buscaDispositivoById, percorreHierarquiaDispositivos } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { TipoDispositivo } from '../../../model/lexml/tipo/tipoDispositivo';
import { State, StateType } from '../../state';
import { Alerta } from '../../../model/alerta/alerta';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { gerarRefId } from '../../../model/remissao/refId';
import { MENSAGEM_REMISSAO_INVALIDA, RemissaoInternaValue } from '../../../model/remissao/remissao';

export const load = (articulacao: Articulacao, modo?: string, params?: LexmlEtaParametrosEdicao, idsRemissoesInvalidas?: string[]): State => {
  const elementos = getElementos(articulacao);

  const { remissoes, alertas, eventosValidacao } = detectarRemissoesInvalidasAoCarregar(articulacao, idsRemissoesInvalidas);

  return {
    articulacao,
    modo,
    past: [],
    present: [],
    future: [],
    ui: {
      events: [{ stateType: StateType.DocumentoCarregado, elementos }, ...eventosValidacao],
      alertas,
      paginacao: configurarPaginacao(articulacao, params?.configuracaoPaginacao),
    },
    remissoes: Object.keys(remissoes).length > 0 ? remissoes : undefined,
    revisoes: [],
    numEventosPassadosAntesDaRevisao: 0,
  };
};

// Regex para capturar tags <a ...>conteúdo</a> (não aninhadas).
const REGEX_TAG_A = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
const REGEX_LEXML_REF = /\bdata-lexml-ref="([^"]+)"/;
const REGEX_RI_ID = /\bdata-ri-id="([^"]+)"/;

// Remove marcador de fim de rótulo (" –", ".", ")") — sobra da forma inline do texto, não cabe num rótulo isolado.
const limparRotulo = (rotulo: string): string => rotulo.replace(/[\s.)–-]+$/, '');

// Rótulo do alerta global: sobe a cadeia de pais até o Artigo (inclusive), pulando o Caput
// (sem rótulo próprio). Art./Parágrafo já se autodescrevem no rótulo ("Art. 2º", "§ 1º");
// os demais tipos ganham o nome do tipo na frente (ex.: "Inciso I").
const construirRotuloCompletoParaAlerta = (dispositivo: Dispositivo): string => {
  const segmentos: string[] = [];
  let atual: Dispositivo | undefined = dispositivo;
  while (atual) {
    if (isCaput(atual)) {
      atual = atual.pai;
      continue;
    }
    if (!atual.rotulo) {
      segmentos.push('Dispositivo');
    } else {
      const rotulo = limparRotulo(atual.rotulo);
      const descricao = Object.values(TipoDispositivo).find(t => t.tipo === atual!.tipo)?.descricao;
      segmentos.push(isArtigo(atual) || isParagrafo(atual) || !descricao ? rotulo : `${descricao} ${rotulo}`);
    }
    if (isArtigo(atual)) break;
    atual = atual.pai;
  }
  return segmentos.join(', ');
};

const detectarRemissoesInvalidasAoCarregar = (
  articulacao: Articulacao,
  idsRemissoesInvalidas?: string[]
): { remissoes: Record<number, RemissaoInternaValue[]>; alertas: Alerta[]; eventosValidacao: any[] } => {
  const remissoes: Record<number, RemissaoInternaValue[]> = {};
  const alertas: Alerta[] = [];
  const eventosValidacao: any[] = [];

  const idsInvalidosConhecidos = new Set(idsRemissoesInvalidas ?? []);
  const mensagemInvalida = { tipo: TipoMensagem.ERROR, descricao: MENSAGEM_REMISSAO_INVALIDA };

  percorreHierarquiaDispositivos(articulacao as unknown as Dispositivo, dispositivo => {
    // Caput não é visitado aqui: Artigo.texto já delega para caput.texto (tipoArtigo.ts), então
    // visitar os dois duplicaria a detecção da mesma remissão (e o Caput não tem rótulo próprio).
    if (isCaput(dispositivo)) return;
    if (!dispositivo.uuid || !dispositivo.texto || !dispositivo.texto.includes('lexml-remissao-interna')) return;

    const invalidasDoDispositivo: RemissaoInternaValue[] = [];
    REGEX_TAG_A.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = REGEX_TAG_A.exec(dispositivo.texto)) !== null) {
      const attrs = match[1];
      if (!attrs.includes('lexml-remissao-interna')) continue;

      const lexmlRefMatch = attrs.match(REGEX_LEXML_REF);
      if (!lexmlRefMatch) continue;

      const targetLexmlId = lexmlRefMatch[1];
      const riIdMatch = attrs.match(REGEX_RI_ID);
      const idPersistido = riIdMatch?.[1];

      // Lista de metadados é autoritativa: um id nela consta é inválido mesmo que o destino
      // textual tenha voltado a resolver (id reaproveitado por outro dispositivo após reestruturação).
      const invalidoPelaLista = idPersistido !== undefined && idsInvalidosConhecidos.has(idPersistido);
      if (!invalidoPelaLista && buscaDispositivoById(articulacao, targetLexmlId)) continue; // destino existe — válido

      const textoRef = match[2].replace(/<[^>]*>/g, '').trim();
      invalidasDoDispositivo.push({
        refId: gerarRefId(),
        targetLexmlId,
        targetUuid: undefined,
        textoRef,
        sourceUuid: dispositivo.uuid,
        sourceLexmlId: dispositivo.id,
        valida: false,
        ...(idPersistido && { idPersistido }),
      });
    }

    if (invalidasDoDispositivo.length === 0) return;

    remissoes[dispositivo.uuid] = invalidasDoDispositivo;

    eventosValidacao.push({
      stateType: StateType.ElementoValidado,
      elementos: [createElementoValidadoComExtras(dispositivo, [mensagemInvalida])],
    });

    alertas.push({
      id: `alerta-remissao-invalida-${dispositivo.uuid}`,
      tipo: TipoMensagem.ERROR,
      mensagem: `${construirRotuloCompletoParaAlerta(dispositivo)} contém remissão inválida para dispositivo excluído.`,
      podeFechar: true,
    });
  });

  return { remissoes, alertas, eventosValidacao };
};
