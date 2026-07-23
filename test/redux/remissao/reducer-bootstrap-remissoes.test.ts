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
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { sincronizarRemissoesComEstadoAtual } from '../../../src/model/remissao/sincronizarRemissoes';

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

  it('deve resolver o targetUuid pelo lexmlId da articulação, apontando para o CAPUT (não o Artigo inteiro) quando o id termina em "_cpt"', () => {
    // buscaDispositivoById trata "art{N}_cpt" como sinônimo do próprio Artigo — comportamento
    // intencional para o fluxo de aplicação de emendas (mod/sup), mas incorreto para remissão: uma
    // remissão para "art1_cpt" refere-se ao CAPUT, não ao artigo inteiro. Sem a correção em
    // inicializaRemissoesAoAbrir.ts (resolveCaputSeNecessario), targetUuid nascia como o uuid do
    // Artigo, e a atualização por renumeração gerava o texto do artigo inteiro (ex.: "art. 4º") em
    // vez de preservar referências contextuais como "caput deste artigo".
    const articulacao = criarArticulacaoComRemissao();
    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    const art2 = articulacao.artigos[1] as Artigo;
    const art1 = articulacao.artigos[0] as Artigo;

    const entry = remissoes[art2.uuid!][0];
    expect(entry.targetUuid).to.equal(art1.caput!.uuid);
    expect(entry.targetUuid).to.not.equal(art1.uuid);
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

// ---------------------------------------------------------------------------
// Regressão: remissão contextual "caput deste artigo", carregada de documento salvo, não deve
// virar "art. Nº" ao renumerar por causa de um artigo alheio inserido antes.
// ---------------------------------------------------------------------------

describe('Bug: remissão "caput deste artigo" carregada de documento vira "art. Nº" ao renumerar', () => {
  it('preserva "caput deste artigo" quando um artigo alheio é inserido antes (documento carregado via inicializaRemissoesAoAbrir)', () => {
    // Reproduz o cenário relatado: um § do art. 3 referencia "caput deste artigo" (o próprio caput
    // do art. 3). O documento é "carregado" (não criado ao vivo pela UI) — o link já vem pronto no
    // HTML, como viria de um arquivo salvo, e é bootstrapado via inicializaRemissoesAoAbrir (mesmo
    // caminho usado por abreArticulacao ao abrir um arquivo).
    const articulacao = createArticulacao();
    criaDispositivo(articulacao, TipoDispositivo.artigo.tipo); // filler: art1
    criaDispositivo(articulacao, TipoDispositivo.artigo.tipo); // filler: art2
    const art3 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);
    art3.caput!.texto = 'Esta seção regula os procedimentos administrativos de fiscalização.';

    const par1 = criaDispositivo(art3, TipoDispositivo.paragrafo.tipo);
    updateIdDispositivoAndFilhos(articulacao);
    expect(art3.id).to.equal('art3'); // âncora: confirma a numeração inicial antes da inserção
    par1.texto = `Conforme o <a href="art3_cpt" data-lexml-ref="art3_cpt" class="lexml-remissao-interna">caput deste artigo</a>, observam-se as seguintes regras:`;

    const remissoes = inicializaRemissoesAoAbrir(articulacao);

    // Insere um artigo alheio antes de tudo — art3 (e seu caput/parágrafos) renumeram para art4.
    criaDispositivo(articulacao, TipoDispositivo.artigo.tipo, undefined, 0);
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);

    expect(art3.id).to.equal('art4'); // âncora: confirma que a renumeração de fato ocorreu

    const remissoesAtualizadas = sincronizarRemissoesComEstadoAtual(articulacao, remissoes);
    const entrada = remissoesAtualizadas[par1.uuid!][0];

    expect(par1.texto).to.contain('caput deste artigo');
    expect(par1.texto).to.not.contain('art. 4');
    expect(entrada.textoRef).to.equal('caput deste artigo');
  });
});
