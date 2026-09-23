import { expect } from '@open-wc/testing';
import { moverElementoAcimaAction } from '../../../src/model/lexml/acao/moverElementoAcimaAction';
import { moverElementoAbaixoAction } from '../../../src/model/lexml/acao/moverElementoAbaixoAction';
import { adicionarArtigoAntes } from '../../../src/model/lexml/acao/adicionarElementoAction';
import { UNDO } from '../../../src/model/lexml/acao/undoAction';
import { REDO } from '../../../src/model/lexml/acao/redoAction';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { State } from '../../../src/redux/state';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { textoCanonicoDoDispositivo } from '../../../src/model/remissao/lexmlIdUtil';
import { findDispositivoByUuid } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { inicializaRemissoesAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesAoAbrir';
import { completarRegistroRemissoes } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { criaStateComNArtigos, montaState } from '../../helpers/dispositivo-helper';

// Issue #1004: mover para cima/baixo deve atualizar remissões como as demais ações estruturais.
// Mover atribui uuid novo à subárvore movida (resetUuidTodaArvore), então o vínculo é verificado
// pela resolução do destino/origem após a ação, não pelo uuid capturado antes.

const PREFIXO = 'Conforme o ';

const criaEntrada = (origem: Dispositivo, destino: Dispositivo, refId = 'ref_mover'): RemissaoInternaValue => {
  const textoRef = textoCanonicoDoDispositivo(destino);
  origem.texto = `${PREFIXO}${textoRef}, aplica-se o disposto.`;
  return {
    refId,
    sourceUuid: origem.uuid,
    targetUuid: destino.uuid,
    targetLexmlId: destino.id,
    textoRef,
    inicio: PREFIXO.length,
  };
};

const unicaEntrada = (state: State): { chave: number; entrada: RemissaoInternaValue } => {
  const chaves = Object.keys(state.remissoes ?? {});
  expect(chaves, 'registry deve ter uma única origem').to.have.length(1);
  const chave = Number(chaves[0]);
  return { chave, entrada: state.remissoes![chave][0] };
};

const destinoDe = (state: State, entrada: RemissaoInternaValue): Dispositivo | null =>
  findDispositivoByUuid(state.articulacao as unknown as Dispositivo, entrada.targetUuid!, true);

const mover = (state: State, d: Dispositivo, direcao: 'acima' | 'abaixo'): State =>
  elementoReducer(state, (direcao === 'acima' ? moverElementoAcimaAction : moverElementoAbaixoAction).execute(createElemento(d)));

const criaIncisoNoCaput = (artigo: Artigo): Dispositivo => {
  const inciso = criaDispositivo(artigo, 'Inciso');
  inciso.texto = 'inciso;';
  artigo.caput!.renumeraFilhos();
  inciso.createRotulo(inciso);
  updateIdDispositivoAndFilhos(artigo.pai!);
  return inciso;
};

describe('Atualização de remissões ao mover dispositivo', () => {
  let state: State;
  let art1: Artigo, art2: Artigo, art3: Artigo, art4: Artigo;

  beforeEach(() => {
    state = criaStateComNArtigos(4).state;
    [art1, art2, art3, art4] = state.articulacao!.artigos as Artigo[];
  });

  describe('Destino é o dispositivo movido', () => {
    it('mover para cima: remissão para art. 3º passa a art. 2º', () => {
      state.remissoes = { [art1.uuid!]: [criaEntrada(art1, art3)] };

      const result = mover(state, art3, 'acima');

      const { entrada } = unicaEntrada(result);
      expect(entrada.targetLexmlId).to.equal('art2');
      expect(entrada.textoRef).to.equal('art. 2º');
      expect(destinoDe(result, entrada)?.texto).to.equal('Artigo 3.');
      expect(art1.texto).to.contain('art. 2º');
    });

    it('mover para baixo: remissão para art. 2º passa a art. 3º', () => {
      state.remissoes = { [art4.uuid!]: [criaEntrada(art4, art2)] };

      const result = mover(state, art2, 'abaixo');

      const { entrada } = unicaEntrada(result);
      expect(entrada.targetLexmlId).to.equal('art3');
      expect(entrada.textoRef).to.equal('art. 3º');
      expect(destinoDe(result, entrada)?.texto).to.equal('Artigo 2.');
    });
  });

  describe('Destino é o irmão deslocado', () => {
    it('mover art. 3º para cima desloca art. 2º para art. 3º', () => {
      state.remissoes = { [art1.uuid!]: [criaEntrada(art1, art2)] };

      const result = mover(state, art3, 'acima');

      const { entrada } = unicaEntrada(result);
      expect(entrada.targetLexmlId).to.equal('art3');
      expect(entrada.textoRef).to.equal('art. 3º');
      expect(destinoDe(result, entrada)?.texto).to.equal('Artigo 2.');
    });
  });

  describe('Destino é descendente do dispositivo movido', () => {
    it('inciso do artigo movido acompanha a nova numeração', () => {
      const inciso = criaIncisoNoCaput(art3);
      state.remissoes = { [art1.uuid!]: [criaEntrada(art1, inciso)] };

      const result = mover(state, art3, 'acima');

      const { entrada } = unicaEntrada(result);
      const destino = destinoDe(result, entrada);
      expect(destino, 'destino deve continuar resolvível').to.exist;
      expect(destino!.pai!.pai!.texto).to.equal('Artigo 3.');
      expect(entrada.targetLexmlId).to.equal('art2_cpt_inc1');
      expect(entrada.textoRef).to.equal(textoCanonicoDoDispositivo(destino!));
    });

    it('parágrafo de artigo com bloco de alteração acompanha a nova numeração', () => {
      const par = criaDispositivo(art3, 'Paragrafo');
      par.texto = 'parágrafo.';
      art3.renumeraFilhos();
      par.createRotulo(par);
      createAlteracao(art3);
      art3.alteracoes!.addFilho(criaDispositivo(art3, 'Artigo'));
      updateIdDispositivoAndFilhos(state.articulacao!);
      expect(art3.hasAlteracao()).to.be.true;
      state.remissoes = { [art1.uuid!]: [criaEntrada(art1, par)] };

      const result = mover(state, art3, 'acima');

      const { entrada } = unicaEntrada(result);
      const destino = destinoDe(result, entrada);
      expect(destino, 'destino deve continuar resolvível').to.exist;
      expect(destino!.texto).to.equal('parágrafo.');
      expect(entrada.targetLexmlId).to.equal(destino!.id);
      expect(destino!.id!.startsWith('art2')).to.be.true;
      expect(entrada.textoRef).to.equal(textoCanonicoDoDispositivo(destino!));
    });

    it('caput do artigo movido acompanha a nova numeração', () => {
      state.remissoes = { [art1.uuid!]: [criaEntrada(art1, art3.caput!)] };

      const result = mover(state, art3, 'acima');

      const { entrada } = unicaEntrada(result);
      const destino = destinoDe(result, entrada);
      expect(destino, 'destino deve continuar resolvível').to.exist;
      expect(entrada.targetLexmlId).to.equal('art2_cpt');
      expect(entrada.textoRef).to.equal(textoCanonicoDoDispositivo(destino!));
    });
  });

  describe('Remissão contida no dispositivo movido', () => {
    it('registry é reindexado pelo uuid atual da origem', () => {
      state.remissoes = { [art3.uuid!]: [criaEntrada(art3, art1)] };

      const result = mover(state, art3, 'acima');

      const movido = result.articulacao!.artigos[1];
      expect(movido.texto).to.contain(PREFIXO);
      const { chave, entrada } = unicaEntrada(result);
      expect(chave).to.equal(movido.uuid);
      expect(entrada.sourceUuid).to.equal(movido.uuid);
      expect(entrada.targetLexmlId).to.equal('art1');
    });

    it('continua sendo atualizada em renumeração posterior do destino', () => {
      state.remissoes = { [art3.uuid!]: [criaEntrada(art3, art1)] };

      let result = mover(state, art3, 'acima');
      result = elementoReducer(result, adicionarArtigoAntes.execute(createElemento(result.articulacao!.artigos[0], true)));

      const movido = result.articulacao!.artigos.find(a => a.texto?.includes(PREFIXO))!;
      const { chave, entrada } = unicaEntrada(result);
      expect(chave).to.equal(movido.uuid);
      expect(entrada.targetLexmlId).to.equal('art2');
      expect(entrada.textoRef).to.equal('art. 2º');
      expect(movido.texto).to.contain('art. 2º');
    });
  });

  describe('Artigo movido para outro agrupador mantendo o número', () => {
    it('reancora o destino mesmo sem mudança de id textual', () => {
      const articulacao = createArticulacao();
      const cap1 = criaDispositivo(articulacao, 'Capitulo');
      const a1 = criaDispositivo(cap1, 'Artigo');
      const a2 = criaDispositivo(cap1, 'Artigo');
      const cap2 = criaDispositivo(articulacao, 'Capitulo');
      const a3 = criaDispositivo(cap2, 'Artigo');
      a1.texto = 'Artigo 1.';
      a2.texto = 'Artigo 2.';
      a3.texto = 'Artigo 3.';
      articulacao.renumeraFilhos();
      cap1.renumeraFilhos();
      cap2.renumeraFilhos();
      [cap1, cap2, a1, a2, a3].forEach(d => d.createRotulo(d));
      updateIdDispositivoAndFilhos(articulacao);
      const s = montaState(articulacao);
      s.remissoes = { [a1.uuid!]: [criaEntrada(a1, a2)] };

      const result = mover(s, a2, 'abaixo');

      const movido = cap2.filhos[0];
      expect(movido.texto, 'art. 2º deve ter passado ao Capítulo II').to.equal('Artigo 2.');
      expect(movido.id).to.equal('art2');
      const { entrada } = unicaEntrada(result);
      expect(entrada.targetUuid).to.equal(movido.uuid);
      expect(entrada.targetLexmlId).to.equal('art2');
    });
  });

  describe('Undo/redo do movimento', () => {
    it('undo restaura o texto anterior e redo reaplica o movimento', () => {
      state.remissoes = { [art1.uuid!]: [criaEntrada(art1, art3)] };

      let result = mover(state, art3, 'acima');
      expect(unicaEntrada(result).entrada.textoRef).to.equal('art. 2º');

      result = elementoReducer(result, { type: UNDO });
      let { entrada } = unicaEntrada(result);
      expect(entrada.targetLexmlId).to.equal('art3');
      expect(entrada.textoRef).to.equal('art. 3º');
      expect(destinoDe(result, entrada)?.texto).to.equal('Artigo 3.');

      result = elementoReducer(result, { type: REDO });
      ({ entrada } = unicaEntrada(result));
      expect(entrada.targetLexmlId).to.equal('art2');
      expect(entrada.textoRef).to.equal('art. 2º');
      expect(destinoDe(result, entrada)?.texto).to.equal('Artigo 3.');
    });

    // Pendente: o undo recria o artigo com caput novo (novos uuid e uuid2) — ver docs/sessao/PROMPT_BUG_CAPUT_UNDO.md.
    it.skip('undo/redo com alvo no caput do artigo movido', () => {
      state.remissoes = { [art1.uuid!]: [criaEntrada(art1, art3.caput!)] };

      let result = mover(state, art3, 'acima');
      result = elementoReducer(result, { type: UNDO });

      const { entrada } = unicaEntrada(result);
      expect(destinoDe(result, entrada), 'caput deve continuar resolvível').to.exist;
      expect(entrada.targetLexmlId).to.equal('art3_cpt');
    });
  });

  describe('Save após mover', () => {
    it('link salvo aponta para o novo id do destino, não como excluído', () => {
      art1.texto = `Ver o <a href="art3" data-lexml-ref="art3" class="lexml-remissao-interna" target="_self">art. 3º</a> desta lei.`;
      state.remissoes = inicializaRemissoesAoAbrir(state.articulacao!);
      expect(state.remissoes[art1.uuid!][0].targetUuid).to.equal(art3.uuid);

      const result = mover(state, art3, 'acima');

      const registroCompleto = completarRegistroRemissoes(result.articulacao!, result.remissoes ?? {});
      const projetoNorma = {
        classificacao: ClassificacaoDocumento.NORMA,
        epigrafe: { texto: 'TESTE' },
        ementa: { texto: 'Ementa' } as any,
        preambulo: { texto: '' },
        articulacao: result.articulacao!,
      };
      const jsonix = buildJsonixFromProjetoNorma(projetoNorma, 'urn:teste', registroCompleto);

      const caputArt1 = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content;
      const remissao = caputArt1.find((c: any) => c?.name?.localPart === 'Remissao');
      expect(remissao, 'a serialização deve conter um nó Remissao').to.exist;
      expect(remissao.value.href).to.equal('art2');
    });
  });
});
