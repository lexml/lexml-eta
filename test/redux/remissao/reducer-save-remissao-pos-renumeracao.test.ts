import { expect } from '@open-wc/testing';
import { adicionarArtigoAntes } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { DispositivoAdicionado } from '../../../src/model/lexml/situacao/dispositivoAdicionado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { inicializaRemissoesAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesAoAbrir';
import { adicionaRemissaoInterna, completarRegistroRemissoes } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';

// Reproduz o bug observado em produção: após renumeração que altera o lexmlId do
// dispositivo destino, salvar sem digitar antes mantém o href obsoleto na proposição
// serializada. Isso ocorre porque `atualizarReferencias` no Quill usa updateContents
// em modo 'silent', que atualiza o DOM mas não propaga para `caput.texto` no Redux
// nem para o registry de remissões. A serialização então gera <Remissao href="art2">
// quando o destino real passou a ser "art3".
describe('Bug: serialização de remissão após renumeração sem digitação', () => {
  it('deve serializar o href com o lexmlId atualizado quando o destino é renumerado', () => {
    const articulacao = createArticulacao();

    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art1.texto = 'Primeiro artigo.';

    const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    // Remissão auto-referente: art2 menciona o próprio art. 2º.
    // Texto simula o estado pós-abertura (formato canônico já com href fixado pelo
    // inicializaRemissoesAoAbrir e data-ref-id presente).
    art2.texto = 'Texto fixo.';

    articulacao.renumeraFilhos();
    art1.createRotulo(art1);
    art2.createRotulo(art2);
    updateIdDispositivoAndFilhos(articulacao);

    const art2UuidOriginal = art2.uuid!;

    // Substitui o texto do caput por uma referência interna válida; isso reflete
    // como o documento estaria após carregamento e fixação dos hrefs.
    art2.caput!.texto = `Ver o <a href="art2" data-lexml-ref="art2" class="lexml-remissao-interna" target="_self">art. 2º</a> desta lei.`;

    // Bootstrap: monta o registry como aconteceria em ABRIR_ARTICULACAO.
    const remissoesIniciais = inicializaRemissoesAoAbrir(articulacao);

    // Marca os artigos como adicionados (para permitir renumeração via reducer).
    art1.situacao = new DispositivoAdicionado();
    art1.caput!.situacao = new DispositivoAdicionado();
    art2.situacao = new DispositivoAdicionado();
    art2.caput!.situacao = new DispositivoAdicionado();

    const state: State = {
      articulacao,
      modo: 'emenda',
      past: [],
      present: [],
      future: [],
      ui: { events: [] },
      remissoes: remissoesIniciais,
    };

    // Sanity: remissão inicial aponta para art2 (auto-referência) e tem o uuid
    // do art2 original como targetUuid.
    expect(remissoesIniciais[art2UuidOriginal]).to.have.length(1);
    expect(remissoesIniciais[art2UuidOriginal][0].targetLexmlId).to.equal('art2');
    expect(remissoesIniciais[art2UuidOriginal][0].targetUuid).to.equal(art2UuidOriginal);

    // Insere um artigo antes do art1, forçando renumeração: art1→art2, art2→art3.
    const elementoArt1 = createElemento(art1, true);
    const result = elementoReducer(state, adicionarArtigoAntes.execute(elementoArt1));

    // Após renumeração, o artigo de uuid original do art2 deve estar com id 'art3'.
    const artigoRenumerado = result.articulacao!.artigos.find(a => a.uuid === art2UuidOriginal)!;
    expect(artigoRenumerado.id).to.equal('art3');

    // Simula o fluxo de salvamento sem digitação intermediária:
    // completarRegistroRemissoes + buildJsonixFromProjetoNorma (como faz
    // getProjetoAtualizado em lexml-eta-proposicao.component.ts).
    const registroCompleto = completarRegistroRemissoes(result.articulacao!, result.remissoes ?? {});

    const projetoNorma = {
      classificacao: ClassificacaoDocumento.NORMA,
      epigrafe: { texto: 'TESTE' },
      ementa: { texto: 'Ementa' } as any,
      preambulo: { texto: '' },
      articulacao: result.articulacao!,
    };

    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', registroCompleto);

    // Localiza o caput do artigo renumerado na árvore serializada.
    // Após inserir antes: [novoArt1, art2(era art1), art3(era art2)].
    const lXhier = resultado.value.projetoNorma.norma.articulacao.lXhier;
    expect(lXhier).to.have.length(3);

    const art3Node = lXhier[2];
    const caputContent = art3Node.value.lXcontainersOmissis[0].value.p[0].content;

    const remissao = caputContent.find((c: any) => c?.name?.localPart === 'Remissao');
    expect(remissao, 'a serialização deve conter um nó Remissao').to.exist;

    // O destino real após renumeração é art3 — o href deveria refletir isso.
    expect(remissao.value.href).to.equal('art3');
  });

  // Cenário runtime: remissão criada por digitação no editor (não vem do arquivo).
  // `adicionaRemissaoInterna` registra a entrada mas `renderizarRemissoesDoState`
  // formata o link via Quill `formatText('silent')` — o link existe apenas no DOM
  // do Quill, e `dispositivo.texto` no Redux permanece como texto plano sem `<a>`.
  // Desde a Fase 5 do plano de simplificação, `sincronizarRemissoesPosAcao` corrige
  // `caput.texto` em tempo real (na própria ação de renumeração), não só ao salvar —
  // este teste confirma que o resultado final salvo continua correto mesmo assim.
  it('runtime: deve serializar href atualizado quando remissão veio de digitação (sem <a> em caput.texto)', () => {
    const articulacao = createArticulacao();

    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art1.texto = 'Primeiro artigo.';

    const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    // Texto plano, como ficaria após o usuário digitar (sem <a> — o link só existe
    // no DOM do Quill após `formatText('silent')`).
    art2.texto = 'No art. 2º bla blab bla.';

    articulacao.renumeraFilhos();
    art1.createRotulo(art1);
    art2.createRotulo(art2);
    updateIdDispositivoAndFilhos(articulacao);

    art1.situacao = new DispositivoAdicionado();
    art1.caput!.situacao = new DispositivoAdicionado();
    art2.situacao = new DispositivoAdicionado();
    art2.caput!.situacao = new DispositivoAdicionado();

    const art2UuidOriginal = art2.uuid!;

    // Estado inicial sem remissões — vamos disparar adicionaRemissaoInterna em seguida.
    const stateInicial: State = {
      articulacao,
      modo: 'emenda',
      past: [],
      present: [],
      future: [],
      ui: { events: [] },
      remissoes: {},
    };

    // Simula a auto-detecção pós-digitação: registra remissão para "art. 2º" → art2 (self).
    const elementoArt2 = createElemento(art2, true);
    const stateComRemissao = adicionaRemissaoInterna(stateInicial, { atual: elementoArt2 });

    expect(stateComRemissao.remissoes![art2UuidOriginal]).to.have.length(1);
    const entryInicial = stateComRemissao.remissoes![art2UuidOriginal][0];
    expect(entryInicial.targetLexmlId).to.equal('art2');
    expect(entryInicial.textoRef).to.equal('art. 2º');
    expect(entryInicial.inicio).to.equal('No '.length);

    // Insere artigo antes do art1 → renumeração: art1→art2, art2→art3.
    const elementoArt1 = createElemento(art1, true);
    const stateRenumerado = elementoReducer(stateComRemissao, adicionarArtigoAntes.execute(elementoArt1));

    const artigoRenumerado = stateRenumerado.articulacao!.artigos.find(a => a.uuid === art2UuidOriginal)!;
    expect(artigoRenumerado.id).to.equal('art3');
    // Fase 5 do plano de simplificação: `sincronizarRemissoesPosAcao` (elementoReducer.ts) já
    // corrige `caput.texto` em tempo real, na própria ação de renumeração — não é mais preciso
    // esperar o salvamento para isso. Antes desta fase, o texto ficava "stale" até salvar; agora
    // já reflete o número atualizado imediatamente.
    expect(artigoRenumerado.caput!.texto).to.contain('art. 3º');

    // Save sem digitação intermediária.
    const registroCompleto = completarRegistroRemissoes(stateRenumerado.articulacao!, stateRenumerado.remissoes ?? {});

    const projetoNorma = {
      classificacao: ClassificacaoDocumento.NORMA,
      epigrafe: { texto: 'TESTE' },
      ementa: { texto: 'Ementa' } as any,
      preambulo: { texto: '' },
      articulacao: stateRenumerado.articulacao!,
    };

    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', registroCompleto);

    const lXhier = resultado.value.projetoNorma.norma.articulacao.lXhier;
    expect(lXhier).to.have.length(3);

    const art3Node = lXhier[2];
    const caputContent = art3Node.value.lXcontainersOmissis[0].value.p[0].content;

    const remissao = caputContent.find((c: any) => c?.name?.localPart === 'Remissao');
    expect(remissao, 'a serialização deve conter um nó Remissao').to.exist;
    expect(remissao.value.href).to.equal('art3');
    expect(remissao.value.content[0]).to.equal('art. 3º');
  });
});

// Reproduz o bug de assimetria no sentinela @invalido:
// Ao excluir Art. 1 (com Art. 2 e Art. 3 tendo remissões para ele), a serialização
// aplicava @invalido corretamente apenas no Art. 3 (que tinha HTML em caput.texto),
// mas não no Art. 2 (que tinha texto plain — remissão só existia no DOM do Quill).
// Causa: registry usa artigo.uuid como chave; completarRegistroRemissoes visitava o
// caput (cujo uuid é diferente), não encontrava entrada, re-detectava do texto plain
// e criava uma entrada VÁLIDA para o novo Art. 1 (lexmlId reciclado após renumeração).
describe('Bug: assimetria no sentinela @invalido após exclusão com texto plain', () => {
  it('ambos os artigos com remissão inválida devem serializar href="@invalido"', () => {
    const articulacao = createArticulacao();

    const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    art1.texto = 'Primeiro artigo.';

    const art2 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    // Texto plain: remissão auto-detectada só existe no DOM do Quill, não em caput.texto.
    art2.texto = 'Ver o art. 1º desta lei.';

    const art3 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    // Texto HTML: usuário editou após a remissão ser detectada, persistindo o <a> no Redux.
    art3.texto = `Ver o <a href="#lxEtaIdPLACEHOLDER" data-lexml-ref="art1" class="lexml-remissao-interna" target="_self">art. 1º</a> desta lei.`;

    articulacao.renumeraFilhos();
    art1.createRotulo(art1);
    art2.createRotulo(art2);
    art3.createRotulo(art3);
    updateIdDispositivoAndFilhos(articulacao);

    // Substitui o placeholder pelo uuid real de art1
    art3.texto = `Ver o <a href="#lxEtaId${art1.uuid}" data-lexml-ref="art1" class="lexml-remissao-interna" target="_self">art. 1º</a> desta lei.`;

    art1.situacao = new DispositivoAdicionado();
    art1.caput!.situacao = new DispositivoAdicionado();
    art2.situacao = new DispositivoAdicionado();
    art2.caput!.situacao = new DispositivoAdicionado();
    art3.situacao = new DispositivoAdicionado();
    art3.caput!.situacao = new DispositivoAdicionado();

    const art2Uuid = art2.uuid!;
    const art3Uuid = art3.uuid!;

    // Estado inicial: simula adicionaRemissaoInterna para art2 (texto plain) e
    // inicializaRemissoesAoAbrir para art3 (HTML com link).
    const elementoArt2 = createElemento(art2, true);
    const stateInicial: State = {
      articulacao,
      modo: 'emenda',
      past: [],
      present: [],
      future: [],
      ui: { events: [] },
      remissoes: {},
    };
    // Detecta remissão em art2 (pelo artigo, como faz o editor em runtime).
    const stateComRemissao = adicionaRemissaoInterna(stateInicial, { atual: elementoArt2 });
    expect(stateComRemissao.remissoes![art2Uuid]).to.have.length(1);
    expect(stateComRemissao.remissoes![art2Uuid][0].targetLexmlId).to.equal('art1');

    // Adiciona remissão de art3 via inicializaRemissoesAoAbrir (HTML já no caput.texto).
    const remissoesArt3 = inicializaRemissoesAoAbrir(articulacao);
    // Merge: mantém a remissão de art2 detectada em runtime.
    const remissoesMerge = { ...stateComRemissao.remissoes!, ...remissoesArt3 };
    // inicializaRemissoesAoAbrir detecta pelo artigo (getDispositivoAndFilhosAsLista).
    expect(Object.keys(remissoesMerge).map(Number)).to.include(art3Uuid);

    const state: State = { ...stateComRemissao, remissoes: remissoesMerge };

    // Exclui art1 → renumeração: art2 vira Art. 1, art3 vira Art. 2.
    const elementoArt1 = createElemento(art1, true);
    const elementoArt2Prev = createElemento(articulacao, true);
    const stateAposRemocao = elementoReducer(state, removerElementoAction.execute(elementoArt1, elementoArt2Prev));

    // Verifica que as remissões foram marcadas como inválidas.
    const remissoesPos = stateAposRemocao.remissoes!;
    const entriesArt2 = remissoesPos[art2Uuid];
    expect(entriesArt2, 'art2 deve ter remissão marcada inválida').to.exist;
    expect(entriesArt2[0].valida).to.equal(false);

    // Serializa — este era o ponto do bug.
    const registroCompleto = completarRegistroRemissoes(stateAposRemocao.articulacao!, remissoesPos);
    const projetoNorma = {
      classificacao: ClassificacaoDocumento.NORMA,
      epigrafe: { texto: 'TESTE' },
      ementa: { texto: 'Ementa' } as any,
      preambulo: { texto: '' },
      articulacao: stateAposRemocao.articulacao!,
    };
    const resultado = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', registroCompleto);

    const lXhier = resultado.value.projetoNorma.norma.articulacao.lXhier;
    // Após remover art1: apenas art2 (novo art1) e art3 (novo art2) permanecem.
    expect(lXhier).to.have.length(2);

    const getRemissao = (idx: number): any => {
      const content = lXhier[idx].value.lXcontainersOmissis[0].value.p[0].content;
      return content.find((c: any) => c?.name?.localPart === 'Remissao');
    };

    const remissaoArt2 = getRemissao(0);
    expect(remissaoArt2, 'art2 (texto plain) deve ter nó Remissao').to.exist;
    expect(remissaoArt2.value.href, 'art2 deve serializar @invalido, não art1 reciclado').to.equal('@invalido');

    const remissaoArt3 = getRemissao(1);
    expect(remissaoArt3, 'art3 (HTML) deve ter nó Remissao').to.exist;
    expect(remissaoArt3.value.href).to.equal('@invalido');
  });
});
