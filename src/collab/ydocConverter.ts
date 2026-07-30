import * as Y from 'yjs';
import { Articulacao, Artigo, Dispositivo } from '../model/dispositivo/dispositivo';
import { DescricaoSituacao, TipoSituacao } from '../model/dispositivo/situacao';
import { isArtigo } from '../model/dispositivo/tipo';
import { ClassificacaoDocumento } from '../model/documento/classificacao';
import { TipoDispositivo } from '../model/lexml/tipo/tipoDispositivo';
import { createAlteracao, createArticulacao, criaDispositivo } from '../model/lexml/dispositivo/dispositivoLexmlFactory';
import { ProjetoNorma } from '../model/lexml/documento/projetoNorma';
import { DispositivoAdicionado } from '../model/lexml/situacao/dispositivoAdicionado';
import { DispositivoNovo } from '../model/lexml/situacao/dispositivoNovo';
import { DispositivoOriginal } from '../model/lexml/situacao/dispositivoOriginal';
import { ordemCanonica } from './canonicalOrder';
import { GidRegistry, gidDeterministico } from './gid';

// clientID reservado ao seed: fixá-lo torna dois seeds independentes do mesmo base byte-idênticos.
const CLIENT_ID_SEED = 0;

export interface ResultadoReconstrucao {
  projetoNorma: ProjetoNorma;
  registry: GidRegistry;
}

const construirMeta = (d: Dispositivo): Y.Map<unknown> => {
  const meta = new Y.Map<unknown>();
  const descricao = (d.situacao as TipoSituacao | undefined)?.descricaoSituacao;
  if (descricao) {
    meta.set('situacao', descricao);
  }
  if (d.notaAlteracao) {
    meta.set('notaAlteracao', d.notaAlteracao);
  }
  if (d.cabecaAlteracao) {
    meta.set('cabecaAlteracao', true);
  }
  return meta;
};

// Modificado/Suprimido carregam um snapshot Elemento no construtor (estado não-derivável pesado):
// seu round-trip completo é território de meta/Fase 5 e fica fora do núcleo da Fase 0.
const situacaoPorDescricao = (descricao: DescricaoSituacao): TipoSituacao => {
  switch (descricao) {
    case DescricaoSituacao.DISPOSITIVO_ORIGINAL:
      return new DispositivoOriginal();
    case DescricaoSituacao.DISPOSITIVO_ADICIONADO:
      return new DispositivoAdicionado();
    default:
      return new DispositivoNovo();
  }
};

const aplicarMeta = (d: Dispositivo, meta: Y.Map<unknown>): void => {
  const descricao = meta.get('situacao') as DescricaoSituacao | undefined;
  if (descricao) {
    (d as unknown as { situacao: TipoSituacao }).situacao = situacaoPorDescricao(descricao);
  }
  const nota = meta.get('notaAlteracao') as string | undefined;
  if (nota) {
    d.notaAlteracao = nota;
  }
  if (meta.get('cabecaAlteracao') === true) {
    d.cabecaAlteracao = true;
  }
};

// Semeia um Y.Doc determinístico a partir de um ProjetoNorma (espelha buildJsonixFromProjetoNorma).
export const projetoNormaToYDoc = (projetoNorma: ProjetoNorma): Y.Doc => {
  const doc = new Y.Doc();
  doc.clientID = CLIENT_ID_SEED;

  const articulacao = projetoNorma.articulacao!;
  const nodes = ordemCanonica(articulacao);
  // Grava os gids determinísticos de volta na árvore em memória: mantém dispositivo.gid consistente
  // com o Y.Doc e idêntico entre clientes (pré-requisito para paiGid de inserções ao vivo, Fase 2).
  nodes.forEach((d, i) => (d.gid = gidDeterministico(i)));

  doc.transact(() => {
    const arr = doc.getArray<Y.Map<unknown>>('articulacao');
    nodes.forEach(d => arr.push([dispositivoParaYMap(d)]));
    escreverDocumento(doc, projetoNorma);
  }, 'seed');

  return doc;
};

// Monta o Y.Map de um dispositivo (gid/tipo/paiGid/conteudo/meta). Reusado pelo seed e pela
// sincronização estrutural ao vivo (Fase 2) — garante formato idêntico ao do seed.
export const dispositivoParaYMap = (d: Dispositivo): Y.Map<unknown> => {
  const m = new Y.Map<unknown>();
  m.set('gid', d.gid);
  m.set('tipo', d.tipo);
  m.set('paiGid', d.pai?.gid ?? null);

  // Artigo delega texto ao caput; o texto real viaja no nó do caput (evita duplicação).
  const conteudo = new Y.Text();
  conteudo.insert(0, isArtigo(d) ? '' : d.texto ?? '');
  m.set('conteudo', conteudo);

  m.set('meta', construirMeta(d));
  return m;
};

const escreverDocumento = (doc: Y.Doc, projetoNorma: ProjetoNorma): void => {
  // Fase 0: apenas a ementa (Dispositivo com texto). Epígrafe/preâmbulo ficam para depois
  // (tipados como Conteudo mas armazenados como string na base — tratar junto da parte inicial).
  const documento = doc.getMap<unknown>('documento');
  if (projetoNorma.ementa) {
    const ementa = new Y.Text();
    ementa.insert(0, projetoNorma.ementa.texto ?? '');
    documento.set('ementa', ementa);
  }
};

// Reconstrói o ProjetoNorma a partir do Y.Doc, reusando a fábrica de dispositivos (regras de tipo/hierarquia).
export const yDocToProjetoNorma = (doc: Y.Doc, classificacao = ClassificacaoDocumento.PROJETO): ResultadoReconstrucao => {
  const arr = doc.getArray<Y.Map<unknown>>('articulacao');
  const registry = new GidRegistry();
  const dispPorGid = new Map<string, Dispositivo>();
  let articulacao: Articulacao | undefined;

  arr.toArray().forEach(m => {
    const gid = m.get('gid') as string;
    const tipo = m.get('tipo') as string;
    const paiGid = m.get('paiGid') as string | null;
    const texto = (m.get('conteudo') as Y.Text).toString();
    const meta = m.get('meta') as Y.Map<unknown>;

    let d: Dispositivo;
    if (paiGid === null) {
      articulacao = createArticulacao();
      d = articulacao;
    } else {
      const pai = dispPorGid.get(paiGid)!;
      if (tipo === TipoDispositivo.caput.tipo) {
        // caput já foi auto-criado ao criar o artigo pai — apenas mapeia o gid a ele.
        d = (pai as Artigo).caput!;
      } else if (tipo === TipoDispositivo.articulacao.tipo) {
        // sub-articulação de bloco de alteração.
        createAlteracao(pai);
        d = pai.alteracoes!;
      } else {
        d = criaDispositivo(pai, tipo);
      }
    }

    d.gid = gid;
    if (!isArtigo(d)) {
      d.texto = texto;
    }
    aplicarMeta(d, meta);

    dispPorGid.set(gid, d);
    registry.registrar(gid, d.uuid!);
  });

  const projetoNorma = { classificacao, articulacao } as ProjetoNorma;
  articulacao!.projetoNorma = projetoNorma;
  lerDocumento(doc, projetoNorma);

  return { projetoNorma, registry };
};

const lerDocumento = (doc: Y.Doc, projetoNorma: ProjetoNorma): void => {
  const documento = doc.getMap<unknown>('documento');
  const ementa = documento.get('ementa') as Y.Text | undefined;
  if (ementa !== undefined) {
    const dispositivo = criaDispositivo(createArticulacao(), 'Ementa');
    dispositivo.pai = undefined;
    dispositivo.texto = ementa.toString();
    dispositivo.id = 'ementa';
    projetoNorma.ementa = dispositivo;
  }
};
