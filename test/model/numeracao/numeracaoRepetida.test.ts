import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoValidator';
import { getUuidsComNumeracaoRepetida, isNumeracaoRepetida } from '../../../src/model/lexml/numeracao/numeracaoRepetida';
import { registraValidacaoNumeracao } from '../../../src/model/lexml/numeracao/validacaoNumeracao';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { AutoFix, TipoMensagem } from '../../../src/model/lexml/util/mensagem';

const novo = (pai: Dispositivo, tipo: string, numero: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  d.numero = numero;
  return d;
};

const mensagemRepetida = (d: Dispositivo): any => validaDispositivo(d).find(m => m.descricao === AutoFix.NUMERACAO_REPETIDA);

describe('Numeração repetida', () => {
  let articulacao: Articulacao;

  beforeEach(() => {
    articulacao = createArticulacao();
  });

  afterEach(() => registraValidacaoNumeracao(undefined));

  describe('detecção', () => {
    it('em capítulos diferentes, só o segundo "Art. 5º" tem numeração repetida', () => {
      const cap1 = novo(articulacao, TipoDispositivo.capitulo.tipo, '1');
      const cap2 = novo(articulacao, TipoDispositivo.capitulo.tipo, '2');
      const art1 = novo(cap1, TipoDispositivo.artigo.tipo, '5');
      const art2 = novo(cap2, TipoDispositivo.artigo.tipo, '5');

      expect(isNumeracaoRepetida(art1)).to.equal(false);
      expect(isNumeracaoRepetida(art2)).to.equal(true);
      expect([...getUuidsComNumeracaoRepetida(articulacao)]).to.deep.equal([art2.uuid]);
    });

    it('os incisos do segundo artigo repetido não têm numeração repetida', () => {
      const art1 = novo(articulacao, TipoDispositivo.artigo.tipo, '5');
      const art2 = novo(articulacao, TipoDispositivo.artigo.tipo, '5');
      [art1, art2].forEach(a => {
        novo(a, TipoDispositivo.inciso.tipo, '1');
        novo(a, TipoDispositivo.inciso.tipo, '2');
      });

      const repetidos = getUuidsComNumeracaoRepetida(articulacao);

      expect([...repetidos]).to.deep.equal([art2.uuid]);
      (art2 as Artigo).caput!.filhos.forEach(inciso => expect(isNumeracaoRepetida(inciso)).to.equal(false));
    });

    it('três incisos "II" no mesmo caput: o segundo e o terceiro têm numeração repetida', () => {
      const art = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
      const incisos = [novo(art, TipoDispositivo.inciso.tipo, '2'), novo(art, TipoDispositivo.inciso.tipo, '2'), novo(art, TipoDispositivo.inciso.tipo, '2')];

      expect(incisos.map(isNumeracaoRepetida)).to.deep.equal([false, true, true]);
      expect([...getUuidsComNumeracaoRepetida(articulacao)]).to.deep.equal([incisos[1].uuid, incisos[2].uuid]);
    });

    it('parágrafos de numeração diferente não se repetem, e artigos repetidos de blocos de alteração diferentes não se comparam', () => {
      const art1 = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
      const art2 = novo(articulacao, TipoDispositivo.artigo.tipo, '2');
      novo(art1, TipoDispositivo.paragrafo.tipo, '1');
      novo(art1, TipoDispositivo.paragrafo.tipo, '2');
      [art1, art2].forEach(a => {
        createAlteracao(a);
        criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, a.alteracoes!, undefined, 0).numero = '10';
      });

      expect(getUuidsComNumeracaoRepetida(articulacao).size).to.equal(0);
    });
  });

  describe('mensagem de validação', () => {
    it('no modo rígido não há a mensagem', () => {
      novo(articulacao, TipoDispositivo.artigo.tipo, '5');
      const art2 = novo(articulacao, TipoDispositivo.artigo.tipo, '5');

      expect(mensagemRepetida(art2)).to.equal(undefined);
    });

    it('no modo flexível, só a 2ª ocorrência tem a mensagem de erro, com correção automática no texto principal', () => {
      registraValidacaoNumeracao('flexivel');
      const art1 = novo(articulacao, TipoDispositivo.artigo.tipo, '5');
      const art2 = novo(articulacao, TipoDispositivo.artigo.tipo, '5');

      expect(mensagemRepetida(art1)).to.equal(undefined);
      expect(mensagemRepetida(art2)).to.deep.include({ tipo: TipoMensagem.ERROR, descricao: 'Dispositivo com numeração repetida', fix: true });
    });

    it('no modo flexível, o artigo de bloco de alteração não tem correção automática', () => {
      registraValidacaoNumeracao('flexivel');
      const hospedeiro = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
      createAlteracao(hospedeiro);
      const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, hospedeiro.alteracoes!, undefined, 0) as Artigo;
      cabeca.numero = '5';
      const segundo = novo(hospedeiro.alteracoes!, TipoDispositivo.artigo.tipo, '5');
      segundo.isDispositivoAlteracao = true;

      expect(mensagemRepetida(segundo)?.fix).to.equal(false);
    });

    for (const [pai, esperado] of [
      ['Novo', true],
      ['Existente', false],
    ] as const) {
      it(`no bloco de alteração, parágrafos repetidos de pai "${pai}": correção automática = ${esperado}`, () => {
        registraValidacaoNumeracao('flexivel');
        const hospedeiro = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
        createAlteracao(hospedeiro);
        const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, hospedeiro.alteracoes!, undefined, 0) as Artigo;
        cabeca.existeNaNormaAlterada = pai === 'Existente';
        novo(cabeca, TipoDispositivo.paragrafo.tipo, '1');
        const segundo = novo(cabeca, TipoDispositivo.paragrafo.tipo, '1');

        expect(mensagemRepetida(segundo)?.fix).to.equal(esperado);
      });
    }

    it('a mensagem antiga de número igual no bloco de alteração permanece junto da nova', () => {
      registraValidacaoNumeracao('flexivel');
      const hospedeiro = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
      createAlteracao(hospedeiro);
      const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, hospedeiro.alteracoes!, undefined, 0) as Artigo;
      cabeca.existeNaNormaAlterada = false;
      novo(cabeca, TipoDispositivo.paragrafo.tipo, '1');
      const segundo = novo(cabeca, TipoDispositivo.paragrafo.tipo, '1');

      const descricoes = validaDispositivo(segundo).map(m => m.descricao);

      expect(descricoes).to.include('O dispositivo tem número igual ao de outro dispositivo');
      expect(descricoes).to.include('Dispositivo com numeração repetida');
    });
  });
});
