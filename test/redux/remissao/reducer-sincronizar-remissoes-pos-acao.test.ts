import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { sincronizarRemissoesPosAcao } from '../../../src/redux/elemento/reducer/sincronizarRemissoesPosAcao';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { StateType } from '../../../src/redux/state';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

// Change 2026-09-23-c01 (D3): o evento de repintura sai para o uuid atual da origem, que é por onde o editor localiza a linha.
describe('sincronizarRemissoesPosAcao — uuid trocado', () => {
  const uuidsDosEventos = (state: any): number[] => state.ui.events.filter((e: any) => e.stateType === StateType.AtualizaRemissaoInterna).map((e: any) => e.elementos[0].uuid);

  it('origem movida: registry reindexado e evento emitido para o uuid novo', () => {
    const { state } = criaStateComNArtigos(2);
    const [art1, art2] = state.articulacao!.artigos;
    art2.texto = 'Conforme o art. 1º, aplica-se.';
    const entry: RemissaoInternaValue = {
      refId: 'ref1',
      sourceUuid: art2.uuid,
      sourceUuid2: art2.uuid2,
      targetUuid: art1.uuid,
      targetUuid2: art1.uuid2,
      targetLexmlId: 'art1',
      textoRef: 'art. 1º',
      inicio: 'Conforme o '.length,
    };
    const uuidAntigo = art2.uuid!;
    state.remissoes = { [uuidAntigo]: [entry] };
    art2.uuid = 950001;

    const result = sincronizarRemissoesPosAcao(state, ADICIONAR_ELEMENTO);

    expect(Object.keys(result.remissoes!)).to.deep.equal(['950001']);
    expect(uuidsDosEventos(result)).to.deep.equal([950001]);
  });

  it('destino reancorado sem mudança de id textual emite evento para repintar o href', () => {
    const { state } = criaStateComNArtigos(2);
    const [art1, art2] = state.articulacao!.artigos;
    art1.texto = 'Conforme o art. 2º, aplica-se.';
    const entry: RemissaoInternaValue = {
      refId: 'ref1',
      sourceUuid: art1.uuid,
      sourceUuid2: art1.uuid2,
      targetUuid: art2.uuid,
      targetUuid2: art2.uuid2,
      targetLexmlId: 'art2',
      textoRef: 'art. 2º',
      inicio: 'Conforme o '.length,
    };
    state.remissoes = { [art1.uuid!]: [entry] };
    art2.uuid = 950002;

    const result = sincronizarRemissoesPosAcao(state, ADICIONAR_ELEMENTO);

    expect(result.remissoes![art1.uuid!][0].targetUuid).to.equal(950002);
    expect(uuidsDosEventos(result)).to.deep.equal([art1.uuid]);
  });
});
