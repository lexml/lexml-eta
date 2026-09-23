import { expect } from '@open-wc/testing';
import { ADICIONAR_ELEMENTO } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { preencherUuid2DasRemissoes } from '../../../src/redux/elemento/reducer/sincronizarRemissoesPosAcao';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

// Change 2026-09-23-c01 (D5): o uuid2 precisa estar na entrada antes da ação que troca o uuid.
describe('preencherUuid2DasRemissoes', () => {
  const montaCenario = (): { state: any; entry: RemissaoInternaValue; art1: any; art2: any } => {
    const { state } = criaStateComNArtigos(2);
    const [art1, art2] = state.articulacao!.artigos;
    const entry: RemissaoInternaValue = { refId: 'ref1', sourceUuid: art1.uuid, targetUuid: art2.caput!.uuid, targetLexmlId: art2.caput!.id };
    state.remissoes = { [art1.uuid!]: [entry] };
    return { state, entry, art1, art2 };
  };

  it('preenche targetUuid2 e sourceUuid2 em ação estrutural, inclusive para caput', () => {
    const { state, entry, art1, art2 } = montaCenario();

    preencherUuid2DasRemissoes(state, ADICIONAR_ELEMENTO);

    expect(entry.targetUuid2).to.equal(art2.caput!.uuid2);
    expect(entry.sourceUuid2).to.equal(art1.uuid2);
  });

  it('não toca a entrada em ação não estrutural', () => {
    const { state, entry } = montaCenario();

    preencherUuid2DasRemissoes(state, ATUALIZAR_TEXTO_ELEMENTO);

    expect(entry.targetUuid2).to.be.undefined;
    expect(entry.sourceUuid2).to.be.undefined;
  });

  it('não toca entrada inválida', () => {
    const { state, entry } = montaCenario();
    entry.valida = false;

    preencherUuid2DasRemissoes(state, ADICIONAR_ELEMENTO);

    expect(entry.targetUuid2).to.be.undefined;
  });
});
