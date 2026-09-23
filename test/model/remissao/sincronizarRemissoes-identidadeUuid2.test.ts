import { expect } from '@open-wc/testing';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { buscarDispositivoPorUuid2, sincronizarRemissoesComEstadoAtual } from '../../../src/model/remissao/sincronizarRemissoes';
import { textoCanonicoDoDispositivo } from '../../../src/model/remissao/lexmlIdUtil';

// Change 2026-09-23-c01 (D1, D2, D4): mover/undo trocam o uuid da subárvore; a entrada é resolvida
// pelo uuid2 e reancorada. A troca de uuid é simulada diretamente, como faz resetUuidTodaArvore.

const UUID_NOVO_BASE = 900000;
let proximoUuid = UUID_NOVO_BASE;
const trocaUuid = (d: Dispositivo): number => (d.uuid = ++proximoUuid);

const PREFIXO = 'Conforme o ';

const entradaEmTextoPuro = (origem: Dispositivo, destino: Dispositivo, comUuid2 = true): RemissaoInternaValue => {
  const textoRef = textoCanonicoDoDispositivo(destino);
  origem.texto = `${PREFIXO}${textoRef}, aplica-se o disposto.`;
  return {
    refId: 'ref1',
    sourceUuid: origem.uuid,
    sourceUuid2: comUuid2 ? origem.uuid2 : undefined,
    targetUuid: destino.uuid,
    targetUuid2: comUuid2 ? destino.uuid2 : undefined,
    targetLexmlId: destino.id,
    textoRef,
    inicio: PREFIXO.length,
  };
};

const sincroniza = (articulacao: any, entry: RemissaoInternaValue): RemissaoInternaValue =>
  sincronizarRemissoesComEstadoAtual(articulacao, { [entry.sourceUuid!]: [entry] })[entry.sourceUuid!][0];

describe('sincronizarRemissoes — identidade por uuid2', () => {
  let articulacao: any;
  let art1: Artigo, art2: Artigo;

  beforeEach(() => {
    articulacao = createArticulacao();
    art1 = criaDispositivo(articulacao, 'Artigo') as Artigo;
    art2 = criaDispositivo(articulacao, 'Artigo') as Artigo;
    articulacao.renumeraFilhos();
    updateIdDispositivoAndFilhos(articulacao);
  });

  describe('buscarDispositivoPorUuid2', () => {
    it('encontra caput', () => {
      expect(buscarDispositivoPorUuid2(articulacao, art2.caput!.uuid2!)).to.equal(art2.caput);
    });

    it('encontra parágrafo próprio de artigo com bloco de alteração', () => {
      const par = criaDispositivo(art2, 'Paragrafo');
      createAlteracao(art2);
      art2.alteracoes!.addFilho(criaDispositivo(art2, 'Artigo'));
      expect(art2.hasAlteracao()).to.be.true;

      expect(buscarDispositivoPorUuid2(articulacao, par.uuid2!)).to.equal(par);
    });
  });

  describe('Destino com uuid trocado', () => {
    it('é resolvido pelo uuid2, reancorado e tem o texto atualizado', () => {
      const entry = entradaEmTextoPuro(art1, art2);
      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      const uuidNovo = trocaUuid(art2);

      const resultado = sincroniza(articulacao, entry);

      expect(resultado.targetUuid).to.equal(uuidNovo);
      expect(resultado.targetLexmlId).to.equal('art3');
      expect(resultado.textoRef).to.equal('art. 3º');
      expect(art1.texto).to.contain('art. 3º');
    });

    it('caput é resolvido pelo uuid2', () => {
      const entry = entradaEmTextoPuro(art1, art2.caput!);
      const uuidNovo = trocaUuid(art2.caput!);

      expect(sincroniza(articulacao, entry).targetUuid).to.equal(uuidNovo);
    });

    it('parágrafo de artigo com alteração é resolvido pelo uuid2', () => {
      const par = criaDispositivo(art2, 'Paragrafo');
      art2.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      createAlteracao(art2);
      art2.alteracoes!.addFilho(criaDispositivo(art2, 'Artigo'));
      const entry = entradaEmTextoPuro(art1, par);
      const uuidNovo = trocaUuid(par);

      expect(sincroniza(articulacao, entry).targetUuid).to.equal(uuidNovo);
    });

    it('sem uuid2 gravado, a entrada fica como está', () => {
      const entry = entradaEmTextoPuro(art1, art2, false);
      trocaUuid(art2);

      expect(sincroniza(articulacao, entry)).to.equal(entry);
    });
  });

  describe('Origem com uuid trocado', () => {
    it('sourceUuid é reancorado', () => {
      const entry = entradaEmTextoPuro(art2, art1);
      const uuidNovo = trocaUuid(art2);

      const resultado = sincroniza(articulacao, entry);

      expect(resultado.sourceUuid).to.equal(uuidNovo);
      expect(resultado.sourceUuid2).to.equal(art2.uuid2);
    });
  });

  describe('Mesmo id textual, uuid trocado (D2)', () => {
    it('reancora e corrige o href sem alterar o texto', () => {
      const uuidAntigo = art2.uuid!;
      art1.texto = `Ver o <a href="#lxEtaId${uuidAntigo}" data-lexml-ref="art2" data-ref-id="ref1" class="lexml-remissao-interna">art. 2º</a> desta lei.`;
      const entry: RemissaoInternaValue = {
        refId: 'ref1',
        sourceUuid: art1.uuid,
        sourceUuid2: art1.uuid2,
        targetUuid: uuidAntigo,
        targetUuid2: art2.uuid2,
        targetLexmlId: 'art2',
        textoRef: 'art. 2º',
      };
      const uuidNovo = trocaUuid(art2);

      const resultado = sincroniza(articulacao, entry);

      expect(resultado.targetUuid).to.equal(uuidNovo);
      expect(resultado.textoRef).to.equal('art. 2º');
      expect(art1.texto).to.contain(`href="#lxEtaId${uuidNovo}"`);
      expect(art1.texto).to.contain('>art. 2º</a>');
    });
  });

  describe('Link em HTML com href obsoleto (D4)', () => {
    it('reescreve href junto com data-lexml-ref e texto', () => {
      const uuidAntigo = art2.uuid!;
      art1.texto = `Ver o <a href="#lxEtaId${uuidAntigo}" data-lexml-ref="art2" data-ref-id="ref1" class="lexml-remissao-interna">art. 2º</a> desta lei.`;
      const entry: RemissaoInternaValue = {
        refId: 'ref1',
        sourceUuid: art1.uuid,
        targetUuid: uuidAntigo,
        targetUuid2: art2.uuid2,
        targetLexmlId: 'art2',
        textoRef: 'art. 2º',
      };
      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      const uuidNovo = trocaUuid(art2);

      sincroniza(articulacao, entry);

      expect(art1.texto).to.contain(`href="#lxEtaId${uuidNovo}"`);
      expect(art1.texto).to.contain('data-lexml-ref="art3"');
      expect(art1.texto).to.contain('>art. 3º</a>');
      expect(art1.texto).not.to.contain(`#lxEtaId${uuidAntigo}"`);
    });
  });

  describe('Preenchimento de uuid2 ausente', () => {
    it('entrada resolvida pelo uuid ganha targetUuid2 e sourceUuid2', () => {
      const entry = entradaEmTextoPuro(art1, art2, false);
      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincroniza(articulacao, entry);

      expect(resultado.targetUuid2).to.equal(art2.uuid2);
      expect(resultado.sourceUuid2).to.equal(art1.uuid2);
    });
  });
});
