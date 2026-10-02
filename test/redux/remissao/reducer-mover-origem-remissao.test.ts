import { expect } from '@open-wc/testing';
import { moverElementoAcimaAction } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { moverElementoAbaixoAction } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { adicionarParagrafo } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';
import { State, StateType } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { findDispositivoByUuid } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { criaStateComNArtigos, detectaRemissoes } from '../../helpers/dispositivo-helper';

// O editor recria a linha do artigo movido a partir do ElementoIncluido e depois só reaplica o link sobre esse
// texto; se o evento sair com a numeração antiga, o link aparece apontando certo com o texto velho.
const TEXTO_ART2 = 'parágrafo único do art. 2º';
const TEXTO_ART3 = 'parágrafo único do art. 3º';

describe('remissão a parágrafo único quando a origem é o artigo movido', () => {
  let state: State;

  const artigos = (): Artigo[] => state.articulacao!.artigos as Artigo[];
  const entrada = (): RemissaoInternaValue => Object.values(state.remissoes ?? {}).flat()[0] as RemissaoInternaValue;

  // Texto que o editor recebe para recriar a linha da origem (a do artigo no índice dado).
  const textoEnviadoAoEditor = (indiceOrigem: number, tipo: StateType = StateType.ElementoIncluido): string | undefined => {
    const origem = artigos()[indiceOrigem];
    const evento = state.ui!.events.find(e => e.stateType === tipo && e.elementos?.some(el => el.uuid === origem.uuid));
    return evento?.elementos?.find(el => el.uuid === origem.uuid)?.conteudo?.texto;
  };

  const criaCenario = (indiceOrigem: number): void => {
    state = criaStateComNArtigos(3).state;
    state = elementoReducer(state, adicionarParagrafo.execute(createElemento(artigos()[1], true)));
    const origem = artigos()[indiceOrigem];
    const criadas = detectaRemissoes(state, origem, `Conforme o ${TEXTO_ART2}`);
    state.remissoes = { [origem.uuid!]: criadas };
    expect(criadas, 'pré-condição: remissão criada pela detecção').to.have.length(1);
    expect(entrada().textoRef).to.equal(TEXTO_ART2);
  };

  const mover = (indice: number, direcao: 'acima' | 'abaixo'): void => {
    const acao = direcao === 'acima' ? moverElementoAcimaAction : moverElementoAbaixoAction;
    state = elementoReducer(state, acao.execute(createElemento(artigos()[indice])));
  };

  describe('origem no art. 3º, movido para cima', () => {
    beforeEach(() => criaCenario(2));

    it('mover atualiza a remissão para "parágrafo único do art. 3º"', () => {
      mover(2, 'acima');

      const destino = findDispositivoByUuid(state.articulacao as unknown as Dispositivo, entrada().targetUuid!, true) as any;
      expect(destino?.rotulo, 'o destino continua sendo o parágrafo único').to.equal('Parágrafo único.');
      expect(destino?.pai?.id, 'o parágrafo agora pertence ao art. 3º').to.equal('art3');
      expect(entrada().targetLexmlId).to.equal('art3_par1u');
      expect(entrada().textoRef).to.equal(TEXTO_ART3);
      expect(artigos()[1].texto, 'a origem é o novo art. 2º').to.contain(TEXTO_ART3);
    });

    it('mover envia ao editor a linha recriada com o texto atualizado', () => {
      mover(2, 'acima');
      expect(textoEnviadoAoEditor(1), 'ElementoIncluido').to.contain(TEXTO_ART3);
    });

    it('desfazer envia ao editor a linha recriada com o texto anterior', () => {
      mover(2, 'acima');
      state = elementoReducer(state, { type: UNDO });
      expect(textoEnviadoAoEditor(2), 'ElementoIncluido').to.contain(TEXTO_ART2);
    });

    it('refazer envia ao editor a linha recriada com o texto atualizado', () => {
      mover(2, 'acima');
      state = elementoReducer(state, { type: UNDO });
      state = elementoReducer(state, { type: REDO });
      expect(entrada().textoRef).to.equal(TEXTO_ART3);
      expect(textoEnviadoAoEditor(1), 'ElementoIncluido').to.contain(TEXTO_ART3);
    });

    it('rejeitar a revisão de movimentação envia ao editor a linha recriada com o texto anterior', () => {
      state = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
      mover(2, 'acima');
      const principal = (state.revisoes ?? []).filter(isRevisaoPrincipal)[0];
      expect(principal, 'ação em revisão deveria gerar revisão principal').to.exist;
      state = elementoReducer(state, { type: REJEITAR_REVISAO, revisao: principal });
      expect(textoEnviadoAoEditor(2), 'ElementoIncluido').to.contain(TEXTO_ART2);
    });
  });

  describe('origem no art. 1º, movido para baixo', () => {
    beforeEach(() => criaCenario(0));

    it('mover envia ao editor a linha recriada com "parágrafo único do art. 1º"', () => {
      mover(0, 'abaixo');
      expect(entrada().textoRef).to.equal('parágrafo único do art. 1º');
      expect(textoEnviadoAoEditor(1), 'ElementoIncluido').to.contain('parágrafo único do art. 1º');
    });
  });

  describe('origem que não é movida', () => {
    beforeEach(() => criaCenario(0));

    it('mover o art. 3º para cima atualiza a remissão do art. 1º, sem recriar a linha da origem', () => {
      mover(2, 'acima');
      expect(entrada().textoRef).to.equal(TEXTO_ART3);
      expect(artigos()[0].texto).to.contain(TEXTO_ART3);
      expect(textoEnviadoAoEditor(0), 'a origem não é recriada').to.equal(undefined);
      const atualiza = state.ui!.events.find(e => e.stateType === StateType.AtualizaRemissaoInterna && e.elementos?.some(el => el.uuid === artigos()[0].uuid));
      expect(atualiza, 'a origem recebe AtualizaRemissaoInterna').to.exist;
    });
  });
});
