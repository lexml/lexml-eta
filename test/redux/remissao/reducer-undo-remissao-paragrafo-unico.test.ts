// Preserva a forma "único"/numerada do parágrafo (e da remissão) quando undo/redo/rejeição de revisão o recriam.
import { expect } from '@open-wc/testing';
import { moverElementoAcimaAction } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { adicionarParagrafo } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { removerElementoAction } from '../../../src/model/lexml/acao/removerElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';
import { openArticulacaoAction } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../doc/parser/mpv_885_20190617';
import { percorreHierarquiaDispositivos } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { REJEITAR_REVISAO } from '../../../src/model/lexml/acao/rejeitarRevisaoAction';
import { isRevisaoPrincipal } from '../../../src/redux/elemento/util/revisaoUtil';

const PREFIXO = 'Conforme o ';
const TEXTO_REF = 'parágrafo único do art. 2º';

const paragrafoDoArtigoComTexto = (state: State, textoArtigo: string): any => {
  const artigo = (state.articulacao!.artigos as Artigo[]).find(a => a.texto === textoArtigo)!;
  return artigo.filhos.find(f => f.tipo === 'Paragrafo');
};

describe('remissão a parágrafo único após undo/redo', () => {
  let state: State;
  let art1: Artigo;

  beforeEach(() => {
    state = criaStateComNArtigos(3).state;
    const art2 = (state.articulacao!.artigos as Artigo[])[1];
    state = elementoReducer(state, adicionarParagrafo.execute(createElemento(art2, true)));
    art1 = (state.articulacao!.artigos as Artigo[])[0];

    const par = paragrafoDoArtigoComTexto(state, 'Artigo 2.');
    expect(par.informouParagrafoUnico, 'pré-condição: parágrafo criado ao vivo é único').to.equal(true);
    expect(par.id).to.equal('art2_par1u');

    art1.texto = `${PREFIXO}${TEXTO_REF}, aplica-se o disposto.`;
    state.remissoes = {
      [art1.uuid!]: [{ refId: 'ref_pu', sourceUuid: art1.uuid, targetUuid: par.uuid, targetLexmlId: par.id, textoRef: TEXTO_REF, inicio: PREFIXO.length }],
    };
  });

  const verificaUnico = (result: State, rotulo: string, textoRefEsperado: string): void => {
    const par = paragrafoDoArtigoComTexto(result, 'Artigo 2.');
    const entrada = Object.values(result.remissoes ?? {}).flat()[0] as RemissaoInternaValue;
    expect(par.informouParagrafoUnico, 'flag informouParagrafoUnico').to.equal(true);
    expect(par.rotulo, 'rótulo').to.equal('Parágrafo único.');
    expect(par.id, 'id do parágrafo').to.match(/_par1u$/);
    expect(entrada.textoRef, 'textoRef da remissão').to.equal(textoRefEsperado);
  };

  it('controle: mover art. 2º acima sem undo mantém "parágrafo único"', () => {
    const art2 = (state.articulacao!.artigos as Artigo[])[1];
    const result = elementoReducer(state, moverElementoAcimaAction.execute(createElemento(art2)));
    verificaUnico(result, 'mover', 'parágrafo único do art. 1º');
  });

  it('mover art. 2º acima + UNDO mantém "parágrafo único"', () => {
    const art2 = (state.articulacao!.artigos as Artigo[])[1];
    let result = elementoReducer(state, moverElementoAcimaAction.execute(createElemento(art2)));
    result = elementoReducer(result, { type: UNDO });
    verificaUnico(result, 'mover+undo', TEXTO_REF);
  });

  it('mover art. 2º acima + UNDO + REDO mantém "parágrafo único"', () => {
    const art2 = (state.articulacao!.artigos as Artigo[])[1];
    let result = elementoReducer(state, moverElementoAcimaAction.execute(createElemento(art2)));
    result = elementoReducer(result, { type: UNDO });
    result = elementoReducer(result, { type: REDO });
    verificaUnico(result, 'mover+undo+redo', 'parágrafo único do art. 1º');
  });

  it('remover o parágrafo + UNDO mantém "parágrafo único"', () => {
    const par = paragrafoDoArtigoComTexto(state, 'Artigo 2.');
    let result = elementoReducer(state, removerElementoAction.execute(createElemento(par), undefined));
    result = elementoReducer(result, { type: UNDO });
    verificaUnico(result, 'remover+undo', TEXTO_REF);
  });

  const rejeitaPrincipal = (result: State): State => {
    const principal = (result.revisoes ?? []).filter(isRevisaoPrincipal)[0];
    expect(principal, 'ação em revisão deveria gerar revisão principal').to.exist;
    return elementoReducer(result, { type: REJEITAR_REVISAO, revisao: principal });
  };

  it('revisão: mover art. 2º acima + rejeitar mantém "parágrafo único"', () => {
    const art2 = (state.articulacao!.artigos as Artigo[])[1];
    let result = elementoReducer(state, { type: ATIVAR_DESATIVAR_REVISAO });
    result = elementoReducer(result, moverElementoAcimaAction.execute(createElemento(art2)));
    result = rejeitaPrincipal(result);
    verificaUnico(result, 'revisao:mover+rejeitar', TEXTO_REF);
  });

  describe('artigo com mais de um parágrafo e remoção do artigo inteiro', () => {
    it('mover art. 2º acima + UNDO, com dois parágrafos, mantém a forma numerada (D2)', () => {
      const par = paragrafoDoArtigoComTexto(state, 'Artigo 2.');
      let result = elementoReducer(state, adicionarParagrafo.execute(createElemento(par, true)));
      const art2 = (result.articulacao!.artigos as Artigo[])[1];
      expect(art2.filhos.filter(f => f.tipo === 'Paragrafo').length, 'pré-condição').to.equal(2);
      result = elementoReducer(result, moverElementoAcimaAction.execute(createElemento(art2)));
      result = elementoReducer(result, { type: UNDO });

      const pars = (result.articulacao!.artigos as Artigo[])[1].filhos.filter(f => f.tipo === 'Paragrafo') as any[];
      expect(pars.map(p => p.rotulo)).to.deep.equal(['§ 1º', '§ 2º']);
      expect(pars.map(p => p.id)).to.deep.equal(['art2_par1', 'art2_par2']);
      expect(pars[0].informouParagrafoUnico).to.equal(false);
    });

    it('remover o art. 2º inteiro + UNDO restaura a remissão válida e "único"', () => {
      const art2 = (state.articulacao!.artigos as Artigo[])[1];
      let result = elementoReducer(state, removerElementoAction.execute(createElemento(art2), undefined));
      result = elementoReducer(result, { type: UNDO });
      verificaUnico(result, 'remover artigo+undo', TEXTO_REF);
      const entrada = Object.values(result.remissoes ?? {}).flat()[0] as RemissaoInternaValue;
      expect(entrada.valida, 'remissão válida').to.not.equal(false);
    });
  });
});

// Simula documento carregado: único parágrafo redigido pelo autor como "§ 1º" (sem renumeraFilhos, como no parse).
describe('remissão a "§ 1º" único carregado após undo', () => {
  const TEXTO_REF_P1 = '§ 1º do art. 2º';
  let state: State;

  beforeEach(() => {
    state = criaStateComNArtigos(3).state;
    const [art1, art2] = state.articulacao!.artigos as Artigo[];
    const par: any = criaDispositivo(art2, 'Paragrafo');
    par.texto = 'Parágrafo do autor.';
    par.createNumeroFromRotulo('§ 1º');
    par.rotulo = '§ 1º';
    updateIdDispositivoAndFilhos(state.articulacao!);
    expect(par.informouParagrafoUnico, 'pré-condição').to.equal(false);
    expect(par.id).to.equal('art2_par1');

    art1.texto = `${PREFIXO}${TEXTO_REF_P1}, aplica-se o disposto.`;
    state.remissoes = {
      [art1.uuid!]: [{ refId: 'ref_p1', sourceUuid: art1.uuid, targetUuid: par.uuid, targetLexmlId: par.id, textoRef: TEXTO_REF_P1, inicio: PREFIXO.length }],
    };
  });

  const verificaNumerado = (result: State, rotulo: string, textoRefEsperado: string): void => {
    const par = paragrafoDoArtigoComTexto(result, 'Artigo 2.');
    const entrada = Object.values(result.remissoes ?? {}).flat()[0] as RemissaoInternaValue;
    expect(par.rotulo, 'rótulo').to.equal('§ 1º');
    expect(par.informouParagrafoUnico, 'flag informouParagrafoUnico').to.equal(false);
    expect(par.id, 'id do parágrafo').to.match(/_par1$/);
    expect(entrada.textoRef, 'textoRef da remissão').to.equal(textoRefEsperado);
  };

  it('controle: mover art. 2º acima mantém "§ 1º"', () => {
    const art2 = (state.articulacao!.artigos as Artigo[])[1];
    const result = elementoReducer(state, moverElementoAcimaAction.execute(createElemento(art2)));
    verificaNumerado(result, 'p1:mover', '§ 1º do art. 1º');
  });

  it('mover art. 2º acima + UNDO mantém "§ 1º"', () => {
    const art2 = (state.articulacao!.artigos as Artigo[])[1];
    let result = elementoReducer(state, moverElementoAcimaAction.execute(createElemento(art2)));
    result = elementoReducer(result, { type: UNDO });
    verificaNumerado(result, 'p1:mover+undo', TEXTO_REF_P1);
  });

  it('remover o parágrafo + UNDO mantém "§ 1º"', () => {
    const par = paragrafoDoArtigoComTexto(state, 'Artigo 2.');
    let result = elementoReducer(state, removerElementoAction.execute(createElemento(par), undefined));
    result = elementoReducer(result, { type: UNDO });
    verificaNumerado(result, 'p1:remover+undo', TEXTO_REF_P1);
  });
});

describe('parágrafo único em bloco de alteração após undo', () => {
  it('remover o parágrafo único do art. 4º (alteração) + UNDO mantém "Parágrafo único." e o id', () => {
    const projetoNorma = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
    let state: State = openArticulacaoAction(projetoNorma.articulacao!);
    state.ui = { events: [] };
    let par: any;
    percorreHierarquiaDispositivos(state.articulacao!, (d: any) => {
      if (d.id === 'art3_cpt_alt1_art4_par1u') par = d;
    });
    expect(par, 'pré-condição: parágrafo único em alteração').to.exist;

    state = elementoReducer(state, removerElementoAction.execute(createElemento(par), undefined));
    state = elementoReducer(state, { type: UNDO });

    let depois: any;
    percorreHierarquiaDispositivos(state.articulacao!, (d: any) => {
      if (d.id === 'art3_cpt_alt1_art4_par1u') depois = d;
    });
    expect(depois, 'parágrafo recriado com o mesmo id').to.exist;
    expect(depois.rotulo).to.equal('Parágrafo único.');
    expect(depois.informouParagrafoUnico).to.equal(true);
  });
});
