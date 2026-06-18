import { configurarPaginacao } from '../util/paginacaoUtil';
import { DispositivoBloqueado, LexmlEtaParametrosEdicao } from '../../../components/lexml-eta.component';
import { Articulacao, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { createElementoValidadoComExtras, getElementos } from '../../../model/elemento/elementoUtil';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista, percorreHierarquiaDispositivos } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { State, StateType } from '../../state';
import { Alerta } from '../../../model/alerta/alerta';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { gerarRefId } from '../../../model/remissao/refId';
import { MENSAGEM_REMISSAO_INVALIDA, RemissaoInternaValue } from '../../../model/remissao/remissao';

export const load = (articulacao: Articulacao, modo?: string, params?: LexmlEtaParametrosEdicao): State => {
  articulacao = bloqueiaDispositivos(articulacao, params);
  const elementos = getElementos(articulacao);

  const { remissoes, alertas, eventosValidacao } = detectarRemissoesInvalidasAoCarregar(articulacao);

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

const detectarRemissoesInvalidasAoCarregar = (articulacao: Articulacao): { remissoes: Record<number, RemissaoInternaValue[]>; alertas: Alerta[]; eventosValidacao: any[] } => {
  const remissoes: Record<number, RemissaoInternaValue[]> = {};
  const alertas: Alerta[] = [];
  const eventosValidacao: any[] = [];

  const mensagemInvalida = { tipo: TipoMensagem.ERROR, descricao: MENSAGEM_REMISSAO_INVALIDA };

  percorreHierarquiaDispositivos(articulacao as unknown as Dispositivo, dispositivo => {
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
      if (buscaDispositivoById(articulacao, targetLexmlId)) continue; // destino existe — válido

      const textoRef = match[2].replace(/<[^>]*>/g, '').trim();
      invalidasDoDispositivo.push({
        refId: gerarRefId(),
        targetLexmlId,
        targetUuid: undefined,
        textoRef,
        sourceUuid: dispositivo.uuid,
        sourceLexmlId: dispositivo.id,
        valida: false,
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
      mensagem: `${dispositivo.rotulo ?? 'Dispositivo'} contém remissão inválida para dispositivo excluído.`,
      podeFechar: true,
    });
  });

  return { remissoes, alertas, eventosValidacao };
};

const bloqueiaDispositivos = (articulacao: Articulacao, params?: LexmlEtaParametrosEdicao): Articulacao => {
  const dispositivosBloqueados = getDispositivosBloqueados(params);

  dispositivosBloqueados?.forEach(db => {
    const dispositivo = buscaDispositivoById(articulacao, db.lexmlId);

    if (dispositivo) {
      if (db.bloquearFilhos) {
        getDispositivoAndFilhosAsLista(dispositivo).forEach(d => (d.bloqueado = true));
      } else {
        dispositivo.bloqueado = true;
      }
    }
  });

  return articulacao;
};

const getDispositivosBloqueados = (params?: LexmlEtaParametrosEdicao): DispositivoBloqueado[] | undefined => {
  return params?.dispositivosBloqueados?.map(v => ({
    lexmlId: (v as DispositivoBloqueado).lexmlId ?? v,
    bloquearFilhos: (v as DispositivoBloqueado).bloquearFilhos ?? true,
  }));
};
