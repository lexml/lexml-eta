import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoValidator';
import { getIrregularidadeNumeracao, getIrregularidadesNumeracao, NumeracaoIrregular } from '../../../src/model/lexml/numeracao/numeracaoRepetida';
import { registraValidacaoNumeracao } from '../../../src/model/lexml/numeracao/validacaoNumeracao';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { AutoFix, TipoMensagem } from '../../../src/model/lexml/util/mensagem';

const novo = (pai: Dispositivo, tipo: string, numero: string): Dispositivo => {
  const d = criaDispositivo(pai, tipo);
  d.numero = numero;
  return d;
};

const isNumeracaoRepetida = (d: Dispositivo): boolean => getIrregularidadeNumeracao(d) === 'repetida';

const uuidsRepetidos = (articulacao: Dispositivo): number[] => [...getIrregularidadesNumeracao(articulacao)].filter(([, tipo]) => tipo === 'repetida').map(([uuid]) => uuid);

// Devolve a irregularidade de cada dispositivo, exigindo que a forma local e a em lote concordem.
const tiposDe = (articulacao: Dispositivo, dispositivos: Dispositivo[]): (NumeracaoIrregular | undefined)[] => {
  const lote = getIrregularidadesNumeracao(articulacao);
  dispositivos.forEach(d => expect(lote.get(d.uuid!), `lote x local de ${d.numero}`).to.equal(getIrregularidadeNumeracao(d)));
  return dispositivos.map(getIrregularidadeNumeracao);
};

const artigos = (articulacao: Articulacao, numeros: string[]): Dispositivo[] => numeros.map(n => novo(articulacao, TipoDispositivo.artigo.tipo, n));

const blocoDeAlteracao = (articulacao: Articulacao, pai: 'Novo' | 'Existente'): Artigo => {
  const hospedeiro = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
  createAlteracao(hospedeiro);
  const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, hospedeiro.alteracoes!, undefined, 0) as Artigo;
  cabeca.existeNaNormaAlterada = pai === 'Existente';
  return cabeca;
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
      expect(uuidsRepetidos(articulacao)).to.deep.equal([art2.uuid]);
    });

    it('os incisos do segundo artigo repetido não têm numeração repetida', () => {
      const art1 = novo(articulacao, TipoDispositivo.artigo.tipo, '5');
      const art2 = novo(articulacao, TipoDispositivo.artigo.tipo, '5');
      [art1, art2].forEach(a => {
        novo(a, TipoDispositivo.inciso.tipo, '1');
        novo(a, TipoDispositivo.inciso.tipo, '2');
      });

      const repetidos = uuidsRepetidos(articulacao);

      expect(repetidos).to.deep.equal([art2.uuid]);
      (art2 as Artigo).caput!.filhos.forEach(inciso => expect(isNumeracaoRepetida(inciso)).to.equal(false));
    });

    it('três incisos "II" no mesmo caput: o segundo e o terceiro têm numeração repetida', () => {
      const art = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
      const incisos = [novo(art, TipoDispositivo.inciso.tipo, '2'), novo(art, TipoDispositivo.inciso.tipo, '2'), novo(art, TipoDispositivo.inciso.tipo, '2')];

      expect(incisos.map(isNumeracaoRepetida)).to.deep.equal([false, true, true]);
      expect(uuidsRepetidos(articulacao)).to.have.members([incisos[1].uuid, incisos[2].uuid]);
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

      expect(getIrregularidadesNumeracao(articulacao).size).to.equal(0);
    });
  });

  describe('lacuna, fora de ordem e complemento', () => {
    it('lacuna: só o "Art. 3º" de 1, 3, 4', () => {
      const a = artigos(articulacao, ['1', '3', '4']);

      expect(tiposDe(articulacao, a)).to.deep.equal([undefined, 'lacuna', undefined]);
    });

    it('lacuna: o primeiro do grupo é comparado com 1', () => {
      const a = artigos(articulacao, ['2', '3']);

      expect(tiposDe(articulacao, a)).to.deep.equal(['lacuna', undefined]);
    });

    it('artigos trocados 1, 3, 2, 4: lacuna no 3, fora de ordem no 2 e o 4 sem irregularidade', () => {
      const a = artigos(articulacao, ['1', '3', '2', '4']);

      expect(tiposDe(articulacao, a)).to.deep.equal([undefined, 'lacuna', 'foraDeOrdem', undefined]);
    });

    it('a repetição prevalece sobre fora de ordem e o artigo seguinte não tem irregularidade', () => {
      const a = artigos(articulacao, ['1', '2', '3', '2', '4']);

      expect(tiposDe(articulacao, a)).to.deep.equal([undefined, undefined, undefined, 'repetida', undefined]);
    });

    it('complemento: só o "Art. 3º-A" de 1, 2, 3, 3-A, 4', () => {
      const a = artigos(articulacao, ['1', '2', '3', '3-1', '4']);

      expect(tiposDe(articulacao, a)).to.deep.equal([undefined, undefined, undefined, 'complemento', undefined]);
    });

    it('complementos seguidos: 3-A e 3-B, e o 4 sem irregularidade', () => {
      const a = artigos(articulacao, ['1', '2', '3', '3-1', '3-2', '4']);

      expect(tiposDe(articulacao, a)).to.deep.equal([undefined, undefined, undefined, 'complemento', 'complemento', undefined]);
    });

    it('o complemento prevalece sobre a lacuna', () => {
      const a = artigos(articulacao, ['1', '3-1']);

      expect(tiposDe(articulacao, a)).to.deep.equal([undefined, 'complemento']);
    });

    it('incisos I e III do texto principal: o III tem lacuna', () => {
      const art = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
      const incisos = [novo(art, TipoDispositivo.inciso.tipo, '1'), novo(art, TipoDispositivo.inciso.tipo, '3')];

      expect(tiposDe(articulacao, incisos)).to.deep.equal([undefined, 'lacuna']);
    });

    it('os artigos de capítulos diferentes formam um só grupo: o "Art. 4º" do Capítulo II tem lacuna', () => {
      const cap1 = novo(articulacao, TipoDispositivo.capitulo.tipo, '1');
      const cap2 = novo(articulacao, TipoDispositivo.capitulo.tipo, '2');
      const a = [novo(cap1, TipoDispositivo.artigo.tipo, '1'), novo(cap1, TipoDispositivo.artigo.tipo, '2'), novo(cap2, TipoDispositivo.artigo.tipo, '4')];

      expect(tiposDe(articulacao, [...a, cap1, cap2])).to.deep.equal([undefined, undefined, 'lacuna', undefined, undefined]);
    });

    it('agrupadores do mesmo tipo: o segundo capítulo pulado tem lacuna', () => {
      const caps = [novo(articulacao, TipoDispositivo.capitulo.tipo, '1'), novo(articulacao, TipoDispositivo.capitulo.tipo, '3')];

      expect(tiposDe(articulacao, caps)).to.deep.equal([undefined, 'lacuna']);
    });

    it('pai "Existente" na norma alterada: parágrafos 1 e 3 não têm lacuna', () => {
      const cabeca = blocoDeAlteracao(articulacao, 'Existente');
      const paragrafos = [novo(cabeca, TipoDispositivo.paragrafo.tipo, '1'), novo(cabeca, TipoDispositivo.paragrafo.tipo, '3')];

      expect(tiposDe(articulacao, paragrafos)).to.deep.equal([undefined, undefined]);
    });

    it('pai "Novo" na norma alterada: o parágrafo 3 depois do 1 tem lacuna', () => {
      const cabeca = blocoDeAlteracao(articulacao, 'Novo');
      const paragrafos = [novo(cabeca, TipoDispositivo.paragrafo.tipo, '1'), novo(cabeca, TipoDispositivo.paragrafo.tipo, '3')];

      expect(tiposDe(articulacao, paragrafos)).to.deep.equal([undefined, 'lacuna']);
    });

    it('artigo de bloco de alteração não é avaliado', () => {
      const cabeca = blocoDeAlteracao(articulacao, 'Novo');
      cabeca.numero = '10';

      expect(tiposDe(articulacao, [cabeca])).to.deep.equal([undefined]);
    });

    it('grupo com omissis: lacuna e complemento não são avaliados, mas a repetição sim', () => {
      const cabeca = blocoDeAlteracao(articulacao, 'Novo');
      const incisos = [novo(cabeca, TipoDispositivo.inciso.tipo, '1'), novo(cabeca, TipoDispositivo.inciso.tipo, '3')];
      criaDispositivo(cabeca.caput!, TipoDispositivo.omissis.tipo);
      const repetido = novo(cabeca, TipoDispositivo.inciso.tipo, '3-1');
      const igual = novo(cabeca, TipoDispositivo.inciso.tipo, '3');

      expect(tiposDe(articulacao, [...incisos, repetido, igual])).to.deep.equal([undefined, undefined, undefined, 'repetida']);
    });
  });

  describe('reaproveitamento da classificação do grupo', () => {
    it('número alterado no próprio dispositivo refaz a classificação', () => {
      const a = artigos(articulacao, ['1', '3', '4']);
      expect(getIrregularidadeNumeracao(a[1])).to.equal('lacuna');

      a[1].numero = '2';

      expect(a.map(getIrregularidadeNumeracao)).to.deep.equal([undefined, undefined, 'lacuna']);
    });

    it('membro incluído no grupo refaz a classificação', () => {
      const a = artigos(articulacao, ['1', '3']);
      expect(getIrregularidadeNumeracao(a[1])).to.equal('lacuna');

      const novoArtigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo, a[0]);
      novoArtigo.numero = '2';

      expect([a[0], novoArtigo, a[1]].map(getIrregularidadeNumeracao)).to.deep.equal([undefined, undefined, undefined]);
    });

    it('pai que passa de "Novo" a "Existente" refaz a classificação', () => {
      const cabeca = blocoDeAlteracao(articulacao, 'Novo');
      const paragrafos = [novo(cabeca, TipoDispositivo.paragrafo.tipo, '1'), novo(cabeca, TipoDispositivo.paragrafo.tipo, '3')];
      expect(getIrregularidadeNumeracao(paragrafos[1])).to.equal('lacuna');

      cabeca.existeNaNormaAlterada = true;

      expect(getIrregularidadeNumeracao(paragrafos[1])).to.equal(undefined);
    });

    it('omissis incluído entre os irmãos refaz a classificação', () => {
      const cabeca = blocoDeAlteracao(articulacao, 'Novo');
      const incisos = [novo(cabeca, TipoDispositivo.inciso.tipo, '1'), novo(cabeca, TipoDispositivo.inciso.tipo, '3')];
      expect(getIrregularidadeNumeracao(incisos[1])).to.equal('lacuna');

      criaDispositivo(cabeca.caput!, TipoDispositivo.omissis.tipo);

      expect(getIrregularidadeNumeracao(incisos[1])).to.equal(undefined);
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

    it('no modo flexível, cada irregularidade tem a mensagem do seu tipo, com correção automática', () => {
      registraValidacaoNumeracao('flexivel');
      const [a1, a3, a2, a4, a4A] = artigos(articulacao, ['1', '3', '2', '4', '4-1']);

      const mensagens = [a1, a3, a2, a4, a4A].map(a => validaDispositivo(a).filter(m => m.descricao?.startsWith('Dispositivo com')));

      expect(mensagens[0]).to.deep.equal([]);
      expect(mensagens[1]).to.deep.equal([{ tipo: TipoMensagem.ERROR, descricao: AutoFix.NUMERACAO_LACUNA, fix: true }]);
      expect(mensagens[2]).to.deep.equal([{ tipo: TipoMensagem.ERROR, descricao: AutoFix.NUMERACAO_FORA_DE_ORDEM, fix: true }]);
      expect(mensagens[3]).to.deep.equal([]);
      expect(mensagens[4]).to.deep.equal([{ tipo: TipoMensagem.ERROR, descricao: AutoFix.NUMERACAO_COMPLEMENTO, fix: true }]);
    });

    it('no modo rígido, lacuna, fora de ordem e complemento também têm a mensagem, com correção automática', () => {
      const [a1, a3, a2, a4, a4A] = artigos(articulacao, ['1', '3', '2', '4', '4-1']);

      const descricoes = [a1, a3, a2, a4, a4A].map(a => validaDispositivo(a).filter(m => m.descricao?.startsWith('Dispositivo com')));

      expect(descricoes[0]).to.deep.equal([]);
      expect(descricoes[1]).to.deep.equal([{ tipo: TipoMensagem.ERROR, descricao: AutoFix.NUMERACAO_LACUNA, fix: true }]);
      expect(descricoes[2]).to.deep.equal([{ tipo: TipoMensagem.ERROR, descricao: AutoFix.NUMERACAO_FORA_DE_ORDEM, fix: true }]);
      expect(descricoes[3]).to.deep.equal([]);
      expect(descricoes[4]).to.deep.equal([{ tipo: TipoMensagem.ERROR, descricao: AutoFix.NUMERACAO_COMPLEMENTO, fix: true }]);
    });

    it('no modo rígido, dois artigos repetidos de bloco de alteração não têm erro de numeração', () => {
      const hospedeiro = novo(articulacao, TipoDispositivo.artigo.tipo, '1');
      createAlteracao(hospedeiro);
      const cabeca = criaDispositivoCabecaAlteracao(TipoDispositivo.artigo.tipo, hospedeiro.alteracoes!, undefined, 0) as Artigo;
      cabeca.numero = '5';
      const segundo = novo(hospedeiro.alteracoes!, TipoDispositivo.artigo.tipo, '5');
      segundo.isDispositivoAlteracao = true;

      expect(validaDispositivo(segundo).filter(m => m.descricao?.startsWith('Dispositivo com'))).to.deep.equal([]);
    });

    it('as mensagens do bloco de alteração permanecem junto da de lacuna no pai "Novo"', () => {
      registraValidacaoNumeracao('flexivel');
      const cabeca = blocoDeAlteracao(articulacao, 'Novo');
      novo(cabeca, TipoDispositivo.paragrafo.tipo, '1');
      const terceiro = novo(cabeca, TipoDispositivo.paragrafo.tipo, '3');

      const descricoes = validaDispositivo(terceiro).map(m => m.descricao);

      expect(descricoes).to.include(AutoFix.NUMERACAO_LACUNA);
      expect(descricoes).to.include(AutoFix.OMISSIS_ANTES);
    });
  });
});
