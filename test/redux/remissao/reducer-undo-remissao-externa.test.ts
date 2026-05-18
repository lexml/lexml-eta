import { expect } from '@open-wc/testing';
import { RemissaoExternaValue } from '../../../src/model/remissao';
import { ADICIONAR_REMISSAO_EXTERNA } from '../../../src/model/lexml/acao/adicionarRemissaoExternaAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

const TEXTO_ORIGINAL = 'Artigo 1.';
const TEXTO_COM_LINK = 'Veja <a class="lexml-remissao-externa" data-urn="urn:lex:br:federal:lei:1990-07-13;8069" data-ref-id="ref_001" href="#">Lei 8.069/1990</a>.';

const REMISSAO_EXTERNA: RemissaoExternaValue = {
  refId: 'ref_001',
  targetUrn: 'urn:lex:br:federal:lei:1990-07-13;8069',
  targetNomeNorma: 'Lei 8.069/1990',
  textoRef: 'Lei 8.069/1990',
};

describe('Undo de remissão externa', () => {
  let state: any;
  let artigo: any;

  beforeEach(() => {
    const { state: s, artigos } = criaStateComNArtigos(2);
    artigo = artigos[0];
    state = { ...s, remissoesExternas: {} };

    // Passo 1: atualiza texto do artigo com link externo → cria entrada no past
    state = elementoReducer(state, {
      type: ATUALIZAR_TEXTO_ELEMENTO,
      atual: { uuid: artigo.uuid, conteudo: { texto: TEXTO_COM_LINK } },
    });

    // Passo 2: registra a remissão externa no registry
    state = elementoReducer(state, {
      type: ADICIONAR_REMISSAO_EXTERNA,
      value: { ...REMISSAO_EXTERNA, sourceUuid: artigo.uuid },
    });

    // Passo 3: undo
    state = elementoReducer(state, { type: UNDO });
  });

  it('undo foi executado — past está vazio', () => {
    expect(state.past?.length).to.equal(0);
  });

  it('texto do dispositivo foi revertido pelo undo', () => {
    expect(artigo.texto).to.equal(TEXTO_ORIGINAL);
  });

  it('[BUG] remissoesExternas deveria ser {} após undo, mas ref_001 permanece como entrada órfã', () => {
    // O registry deveria ser {} após undo (como estava antes de adicionar a remissão).
    // O guard em elementoReducer preserva o valor stale do estado anterior ao undo.
    // Este teste falha enquanto o bug existir e passará quando for corrigido.
    expect(state.remissoesExternas?.['ref_001']).to.be.undefined;
  });
});
