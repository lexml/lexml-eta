import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { excluirRemissaoManual } from '../../../src/redux/elemento/reducer/excluirRemissaoManual';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { createElemento } from '../../../src/model/elemento/elementoUtil';

/**
 * Regressão do bug: o botão "Excluir" de uma remissão válida (destino existente) só removia
 * o formato no Quill (DOM), sem deixar rastro no registry Redux (`state.remissoes`). Qualquer
 * edição subsequente e não relacionada no mesmo dispositivo disparava `adicionaRemissaoInterna`,
 * que reencontrava o texto (nunca mudou) e reaproveitava a entrada antiga — reaparecendo o link.
 *
 * Correção: `excluirRemissaoManual` marca a entrada como `excluidaManualmente: true` (tombstone)
 * em vez de deixá-la intocada. `adicionaRemissaoInterna` passa a pular a recriação quando o
 * trio (targetLexmlId, inicio, textoRef) bate com um tombstone — e descarta o tombstone assim
 * que o texto detectado naquela posição deixar de ser idêntico.
 */
describe('Exclusão manual de remissão via botão "Excluir" — tombstone no registry', () => {
  it('reducer isolado: excluirRemissaoManual marca a entrada como excluidaManualmente:true', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2] = artigos;

    const stateComRemissao: State = {
      ...state,
      remissoes: {
        [art1.uuid!]: [{ refId: 'ref-original', targetLexmlId: art2.id, targetUuid: art2.uuid, sourceUuid: art1.uuid, textoRef: 'art. 2º', inicio: 8 }],
      },
    };

    const result = excluirRemissaoManual(stateComRemissao, { sourceUuid: art1.uuid, refId: 'ref-original' });

    const remissoesArt1 = (result.remissoes as any)[art1.uuid!];
    expect(remissoesArt1).to.have.length(1);
    expect(remissoesArt1[0].refId).to.equal('ref-original');
    expect(remissoesArt1[0].excluidaManualmente).to.equal(true);
  });

  it('reducer isolado: excluirRemissaoManual é no-op quando o refId não existe no registry (ex.: remissão manual com texto não-canônico)', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1] = artigos;

    const result = excluirRemissaoManual(state, { sourceUuid: art1.uuid, refId: 'refId-inexistente' });

    expect((result.remissoes as any)?.[art1.uuid!] ?? []).to.have.length(0);
  });

  it('fluxo completo: excluir remissão válida pelo botão, editar texto não relacionado, remissão NÃO reaparece', () => {
    const { state, artigos } = criaStateComNArtigos(3);
    const [art1, art2] = artigos;

    // Passo 1 — usuário digita uma referência a art2; detecção automática cria o link.
    art1.texto = 'Vide o art. 2º.';
    let elemento = createElemento(art1, true);
    const resultDeteccao = adicionaRemissaoInterna(state, { atual: elemento });
    const remissoesAposDeteccao = (resultDeteccao.remissoes as any)[art1.uuid!];

    expect(remissoesAposDeteccao).to.have.length(1);
    expect(remissoesAposDeteccao[0].targetLexmlId).to.equal(art2.id);
    const refIdOriginal = remissoesAposDeteccao[0].refId;

    const stateAposDeteccao: State = { ...state, remissoes: resultDeteccao.remissoes };

    // Passo 2 — usuário clica em "Excluir" no popup do link (fluxo real de produção).
    const resultExclusao = excluirRemissaoManual(stateAposDeteccao, { sourceUuid: art1.uuid, refId: refIdOriginal });
    const stateAposExclusao: State = { ...stateAposDeteccao, remissoes: resultExclusao.remissoes ?? stateAposDeteccao.remissoes };

    // Passo 3 — usuário edita o dispositivo em outro trecho, sem relação com o link excluído.
    art1.texto = 'Vide o art. 2º. Texto adicional sem relação com a remissão excluída.';
    elemento = createElemento(art1, true);
    const resultEdicao = adicionaRemissaoInterna(stateAposExclusao, { atual: elemento });
    const remissoesFinal = (resultEdicao.remissoes as any)[art1.uuid!];

    // O tombstone continua no registry (para persistir a exclusão em edições futuras), mas
    // nenhuma entrada "ativa" (sem excluidaManualmente) deve existir apontando para art2.
    const entradasAtivas = remissoesFinal.filter((r: any) => !r.excluidaManualmente);
    expect(entradasAtivas, 'a remissão excluída pelo botão não deveria reaparecer após uma edição não relacionada').to.have.length(0);

    const tombstone = remissoesFinal.find((r: any) => r.refId === refIdOriginal);
    expect(tombstone, 'o tombstone da exclusão manual deve continuar no registry').to.exist;
    expect(tombstone.excluidaManualmente).to.equal(true);
  });

  it('editar o texto exato do link excluído libera a redetecção (tombstone é descartado)', () => {
    const { state, artigos } = criaStateComNArtigos(4);
    const [art1, , art3] = artigos;

    // Passo 1 — cria o link para art2.
    art1.texto = 'Vide o art. 2º.';
    let elemento = createElemento(art1, true);
    const resultDeteccao = adicionaRemissaoInterna(state, { atual: elemento });
    const refIdOriginal = (resultDeteccao.remissoes as any)[art1.uuid!][0].refId;
    const stateAposDeteccao: State = { ...state, remissoes: resultDeteccao.remissoes };

    // Passo 2 — exclui via botão (tombstone).
    const resultExclusao = excluirRemissaoManual(stateAposDeteccao, { sourceUuid: art1.uuid, refId: refIdOriginal });
    const stateAposExclusao: State = { ...stateAposDeteccao, remissoes: resultExclusao.remissoes ?? stateAposDeteccao.remissoes };

    // Passo 3 — usuário edita o PRÓPRIO texto da remissão excluída, trocando o destino para art3.
    art1.texto = 'Vide o art. 3º.';
    elemento = createElemento(art1, true);
    const resultEdicao = adicionaRemissaoInterna(stateAposExclusao, { atual: elemento });
    const remissoesFinal = (resultEdicao.remissoes as any)[art1.uuid!];

    // Como o texto mudou, o tombstone não bate mais (trio diferente) e a nova referência
    // (para art3) deve ser criada normalmente.
    const entradasAtivas = remissoesFinal.filter((r: any) => !r.excluidaManualmente);
    expect(entradasAtivas).to.have.length(1);
    expect(entradasAtivas[0].targetLexmlId).to.equal(art3.id);

    // O tombstone antigo (para art2) não é mais confirmado pela redetecção — deve ter sido descartado.
    const tombstoneAntigo = remissoesFinal.find((r: any) => r.refId === refIdOriginal && r.excluidaManualmente);
    expect(tombstoneAntigo, 'o tombstone obsoleto deveria ter sido descartado após a edição do texto').to.not.exist;
  });
});
