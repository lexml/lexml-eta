import { expect } from '@open-wc/testing';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { inicializaRemissoesAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesAoAbrir';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MPV_905_2019 } from '../../doc/mpv_905_2019';
import { criaDispositivo, createArticulacao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { Articulacao, Artigo } from '../../../src/model/dispositivo/dispositivo';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Cria uma articulação com dois artigos e um link de remissão interna
 * do caput do art. 2 apontando para o caput do art. 1.
 */
function criarArticulacaoComRemissao(): Articulacao {
  const articulacao = createArticulacao();

  const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art1.id = 'art1';
  art1.caput!.id = 'art1_cpt';
  art1.texto = 'Dispositivo de destino.';

  const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
  art2.id = 'art2';
  art2.caput!.id = 'art2_cpt';
  // Texto com link de remissão interna apontando para art1_cpt
  art2.texto = `Conforme o <a href="art1_cpt" data-lexml-ref="art1_cpt" class="lexml-remissao-interna" target="_self">art. 1º</a> desta lei.`;

  return articulacao;
}

// ---------------------------------------------------------------------------
// Testes de fix do leak (3a)
// ---------------------------------------------------------------------------

describe('Fix do leak de remissões entre documentos', () => {
  it('deve zerar remissões ao abrir nova articulação (não vazar remissões de sessão anterior)', () => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);

    // Estado com remissões de "sessão anterior"
    const estadoAnterior = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: projetoNorma.articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });
    // Injeta remissões fictícias como se fossem da sessão anterior
    estadoAnterior.remissoes = { 99999: [{ refId: 'ref-anterior', targetLexmlId: 'art1_cpt', targetUuid: 1 }] };

    // Abre novo documento
    const novoEstado = elementoReducer(estadoAnterior, {
      type: ABRIR_ARTICULACAO,
      articulacao: projetoNorma.articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });

    expect(novoEstado.remissoes).to.not.have.property('99999');
  });

  it('deve retornar estado com remissoes definido (nunca undefined) após ABRIR_ARTICULACAO', () => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    const estado = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: projetoNorma.articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });

    expect(estado.remissoes).to.not.be.undefined;
  });
});

// ---------------------------------------------------------------------------
// Testes do bootstrap (3b)
// ---------------------------------------------------------------------------

describe('Bootstrap de remissões ao abrir documento', () => {
  it('deve registrar remissão encontrada no HTML do dispositivo', () => {
    const articulacao = criarArticulacaoComRemissao();
    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    const art2 = articulacao.artigos[1] as Artigo;
    const sourceUuid = art2.uuid!;

    expect(remissoes[sourceUuid]).to.exist;
    expect(remissoes[sourceUuid]).to.have.length(1);
  });

  it('deve resolver o targetUuid pelo lexmlId da articulação', () => {
    const articulacao = criarArticulacaoComRemissao();
    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    const art2 = articulacao.artigos[1] as Artigo;
    const art1 = articulacao.artigos[0] as Artigo;

    const entry = remissoes[art2.uuid!][0];
    expect(entry.targetUuid).to.equal(art1.uuid);
  });

  it('deve preencher targetLexmlId corretamente', () => {
    const articulacao = criarArticulacaoComRemissao();
    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    const art2 = articulacao.artigos[1] as Artigo;
    const entry = remissoes[art2.uuid!][0];

    expect(entry.targetLexmlId).to.equal('art1_cpt');
  });

  it('deve gerar refId único para cada remissão', () => {
    const articulacao = criarArticulacaoComRemissao();
    // Adiciona segunda remissão para checar unicidade
    const art3 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art3.id = 'art3';
    art3.caput!.id = 'art3_cpt';
    art3.texto = `Ver <a href="art1_cpt" data-lexml-ref="art1_cpt" class="lexml-remissao-interna">art. 1º</a>.`;

    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    const art2 = articulacao.artigos[1] as Artigo;
    const refId2 = remissoes[art2.uuid!][0].refId;
    const refId3 = remissoes[art3.uuid!][0].refId;

    expect(refId2).to.not.equal(refId3);
  });

  it('deve ignorar links sem data-lexml-ref (links externos)', () => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art1.id = 'art1';
    art1.caput!.id = 'art1_cpt';
    art1.texto = `Ver <a href="https://externo.gov.br">lei externa</a>.`;

    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    expect(Object.keys(remissoes)).to.have.length(0);
  });

  it('deve retornar objeto vazio quando articulação não tem remissões', () => {
    const projetoNorma = buildProjetoNormaFromJsonix(MPV_905_2019, true);
    const remissoes = inicializaRemissoesAoAbrir(projetoNorma.articulacao!);

    // MPV não tem remissões internas, deve retornar vazio
    expect(Object.keys(remissoes)).to.have.length(0);
  });

  it('deve ignorar remissão cujo lexmlId destino não existe na articulação', () => {
    const articulacao = createArticulacao();
    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art1.id = 'art1';
    art1.caput!.id = 'art1_cpt';
    art1.texto = `Ver <a href="art99_cpt" data-lexml-ref="art99_cpt" class="lexml-remissao-interna">art. 99</a>.`;

    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    expect(Object.keys(remissoes)).to.have.length(0);
  });

  it('deve registrar múltiplas remissões no mesmo dispositivo', () => {
    const articulacao = createArticulacao();

    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art1.id = 'art1';
    art1.caput!.id = 'art1_cpt';
    art1.texto = 'Dispositivo A.';

    const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art2.id = 'art2';
    art2.caput!.id = 'art2_cpt';
    art2.texto = 'Dispositivo B.';

    const art3 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art3.id = 'art3';
    art3.caput!.id = 'art3_cpt';
    art3.texto = `Ver <a href="art1_cpt" data-lexml-ref="art1_cpt" class="lexml-remissao-interna">art. 1º</a> e <a href="art2_cpt" data-lexml-ref="art2_cpt" class="lexml-remissao-interna">art. 2º</a>.`;

    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    expect(remissoes[art3.uuid!]).to.have.length(2);
    const lexmlIds = remissoes[art3.uuid!].map(e => e.targetLexmlId);
    expect(lexmlIds).to.include('art1_cpt');
    expect(lexmlIds).to.include('art2_cpt');
  });
});
