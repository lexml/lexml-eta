import { expect } from '@open-wc/testing';
import { Articulacao, Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { buildDispositivosAssistente, buildReferencia, identificaReferencias } from '../../../src/model/lexml/numeracao/parserReferenciaDispositivo';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { ReferenciaDispositivoParser } from './../../../src/model/lexml/numeracao/parserReferenciaDispositivo';

let artigo: Artigo;
let articulacao: Articulacao;

describe('Parser de texto contendo referência de dispositivo', () => {
  describe('Quando é citado apenas um artigo', () => {
    it('Se o rótulo estiver correto, o tipo e o número são reconhecidos', () => {
      const texto = 'Art. 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em minúscula, ambos são reconhecidos', () => {
      const texto = 'artigo 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em maiúscula, ambos são reconhecidos', () => {
      const texto = 'ARTIGO 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo abreviado no rótulo, sem ponto, ambos são reconhecidos', () => {
      const texto = 'Art. 2';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado artigo único no rótulo, ambos são reconhecidos', () => {
      const texto = 'Artigo único';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref?.numero).to.be.equal('único');
    });
    it('Se for informado artigo unico no rótulo, ambos são reconhecidos mas a grafia errada de único é mantida', () => {
      const texto = 'Artigo unico';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref?.numero).to.be.equal('unico');
    });
    it('Se for informado artigo sem número, somente o tipo é reconhecido', () => {
      const texto = 'Artigo';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref?.numero).to.be.undefined;
    });
  });
  describe('Quando é citado apenas um parágrafo', () => {
    it('Se o rótulo estiver correto, o tipo e o número são reconhecidos', () => {
      const texto = '§ 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em minúscula, ambos são reconhecidos', () => {
      const texto = 'parágrafo 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em maiúscula, ambos são reconhecidos', () => {
      const texto = 'PARÁGRAFO 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo abreviado no rótulo, sem ponto, ambos são reconhecidos', () => {
      const texto = 'par 2';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo abreviado no rótulo, sem ponto, ambos são reconhecidos', () => {
      const texto = 'par. 2';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado Parágrafo único no rótulo, ambos são reconhecidos', () => {
      const texto = 'Parágrafo único';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('único');
    });
    it('Se for informado Paragrafo unico no rótulo, ambos são reconhecidos mas a grafia errada de único é mantida', () => {
      const texto = 'Paragrafo unico';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('unico');
    });
    it('Se for informado parágrafo sem número, somente o tipo é reconhecido', () => {
      const texto = '§';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.undefined;
    });
    it('Se for informado parágrafo sem número, somente o tipo é reconhecido', () => {
      const texto = 'parágrafo';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.undefined;
    });
  });
  describe('Quando é citado apenas um inciso', () => {
    it('Se for informado o tipo por extenso no rótulo e o número, em minúscula, ambos são reconhecidos', () => {
      const texto = 'inciso II';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref?.numero).to.be.equal('II');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em maiúscula, ambos são reconhecidos', () => {
      const texto = 'INCISO II';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref?.numero).to.be.equal('II');
    });
    it('Se for informado o tipo abreviado no rótulo, com ponto, ambos são reconhecidos', () => {
      const texto = 'inc. II';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref?.numero).to.be.equal('II');
    });
    it('Se for informado o tipo abreviado no rótulo, sem ponto, ambos são reconhecidos', () => {
      const texto = 'inc II';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref?.numero).to.be.equal('II');
    });
    it('Se for informado inciso único no rótulo, ambos são reconhecidos', () => {
      const texto = 'inciso único';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref?.numero).to.be.equal('único');
    });
    it('Se for informado inciso unico no rótulo, ambos são reconhecidos mas a grafia errada de único é mantida', () => {
      const texto = 'Inciso unico';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref?.numero).to.be.equal('unico');
    });
    it('Se for informado inciso sem número, somente o tipo é reconhecido', () => {
      const texto = 'inciso';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref?.numero).to.be.undefined;
    });
  });
  describe('Quando é citado apenas um item', () => {
    it('Se for informado o tipo por extenso no rótulo e o número, em minúscula, ambos são reconhecidos', () => {
      const texto = 'item 1';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.item);
      expect(ref?.numero).to.be.equal('1');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em maiúscula, ambos são reconhecidos', () => {
      const texto = 'ITEM 1';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.item);
      expect(ref?.numero).to.be.equal('1');
    });
    it('Se for informado item único no rótulo, ambos são reconhecidos', () => {
      const texto = 'item único';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.item);
      expect(ref?.numero).to.be.equal('único');
    });
    it('Se for informado item unico no rótulo, ambos são reconhecidos mas a grafia errada de único é mantida', () => {
      const texto = 'item unico';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.item);
      expect(ref?.numero).to.be.equal('unico');
    });
    it('Se for informado item sem número, somente o tipo é reconhecido', () => {
      const texto = 'item';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.item);
      expect(ref?.numero).to.be.undefined;
    });
  });
  describe('Quando é citado apenas um parágrafo', () => {
    it('Se o rótulo estiver correto, o tipo e o número são reconhecidos', () => {
      const texto = '§ 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em minúscula, ambos são reconhecidos', () => {
      const texto = 'parágrafo 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em maiúscula, ambos são reconhecidos', () => {
      const texto = 'PARÁGRAFO 2º';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado o tipo abreviado no rótulo, sem ponto, ambos são reconhecidos', () => {
      const texto = '§ 2';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('2');
    });
    it('Se for informado Parágrafo único no rótulo, ambos são reconhecidos', () => {
      const texto = 'Parágrafo único';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('único');
    });
    it('Se for informado Paragrafo unico no rótulo, ambos são reconhecidos mas a grafia errada de único é mantida', () => {
      const texto = 'Paragrafo unico';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.equal('unico');
    });
    it('Se for informado parágrafo sem número, somente o tipo é reconhecido', () => {
      const texto = '§';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.undefined;
    });
    it('Se for informado parágrafo sem número, somente o tipo é reconhecido', () => {
      const texto = 'parágrafo';
      const ref = buildReferencia(texto);
      expect(ref?.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref?.numero).to.be.undefined;
    });
  });
  describe('Quando é citado um inciso de um parágrafo de um artigo', () => {
    it('Se o rótulo estiver correto, o tipo e o número são reconhecidos', () => {
      const texto = 'inciso III do § 2º do Art. 1-A';
      const ref = identificaReferencias(texto);
      expect(ref![0]!.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref![0]!.numero).to.be.equal('iii');
      expect(ref![1]!.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref![1]!.numero).to.be.equal('2');
      expect(ref![2]!.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref![2]!.numero).to.be.equal('1-a');
    });
    it('Se for informado o tipo abreviado no rótulo, sem ponto, ambos são reconhecidos', () => {
      const texto = 'inc iii do par 2  do  art 1';
      const ref = identificaReferencias(texto);
      expect(ref![0]!.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref![0]!.numero).to.be.equal('iii');
      expect(ref![1]!.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref![1]!.numero).to.be.equal('2');
      expect(ref![2]!.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref![2]!.numero).to.be.equal('1');
    });
    it('Se for informado inciso único no rótulo, ambos são reconhecidos', () => {
      const texto = 'inciso único do paragrafo unico  do  art 1';
      const ref = identificaReferencias(texto);
      expect(ref![0]!.tipo).to.be.equal(TipoDispositivo.inciso);
      expect(ref![0]!.numero).to.be.equal('único');
      expect(ref![1]!.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref![1]!.numero).to.be.equal('unico');
      expect(ref![2]!.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref![2]!.numero).to.be.equal('1');
    });
  });
  describe('Quando é citado um parágrafo de um artigo', () => {
    it('Se o rótulo estiver correto, o tipo e o número são reconhecidos', () => {
      const texto = '§ 2º do Art. 1-A';
      const ref = identificaReferencias(texto);
      expect(ref![0]!.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref![0]!.numero).to.be.equal('2');
      expect(ref![1]!.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref![1]!.numero).to.be.equal('1-a');
    });
    it('Se for informado o tipo por extenso no rótulo e o número, em minúscula, ambos são reconhecidos', () => {
      const texto = 'parágrafo 2 do artigo 1';
      const ref = identificaReferencias(texto);
      expect(ref![0]!.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref![0]!.numero).to.be.equal('2');
      expect(ref![1]!.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref![1]!.numero).to.be.equal('1');
    });
    it('Se for informado o tipo abreviado no rótulo, sem ponto, ambos são reconhecidos', () => {
      const texto = 'par 2  do  art 1';
      const ref = identificaReferencias(texto);
      expect(ref![0]!.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref![0]!.numero).to.be.equal('2');
      expect(ref![1]!.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref![1]!.numero).to.be.equal('1');
    });
    it('Se for informado Parágrafo único no rótulo, ambos são reconhecidos', () => {
      const texto = 'paragrafo unico  do  art 1';
      const ref = identificaReferencias(texto);
      expect(ref![0]!.tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(ref![0]!.numero).to.be.equal('unico');
      expect(ref![1]!.tipo).to.be.equal(TipoDispositivo.artigo);
      expect(ref![1]!.numero).to.be.equal('1');
    });
  });
  describe('Gerando os dispositivos', () => {
    beforeEach(function () {
      articulacao = createArticulacao();
      artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
    });
    it('Apenas com artigo', () => {
      const texto = 'Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
    });
    it('Apenas com artigo único no rótulo', () => {
      const texto = 'Artigo unico';

      buildDispositivosAssistente(texto, artigo);
      expect(artigo.alteracoes?.filhos[0].rotulo).to.be.equal('Artigo único.');
    });
    it('Com artigo e um parágrafo', () => {
      const texto = '§ 1º do Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.filhos[0].rotulo).to.be.equal('§ 1º');
    });
    it('Com artigo, um parágrafo e um inciso de parágrafo', () => {
      const texto = 'inciso II do § 1º do Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.filhos[0].rotulo).to.be.equal('§ 1º');
      expect(dispositivo.filhos[0].filhos[0].rotulo).to.be.equal('II –');
      expect(dispositivo.filhos[0].filhos[0].mensagens![1].descricao).to.be.equal('É necessário uma linha pontilhada antes deste dispositivo');
    });
    it('Com artigo, um parágrafo mas um inciso de parágrafo com numeração incorreta', () => {
      const texto = 'inciso II do § 1º do Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.filhos[0].rotulo).to.be.equal('§ 1º');
      expect(dispositivo.filhos[0].filhos[0].tipo).to.be.equal('Inciso');
    });
    it('Com artigo, um parágrafo e um inciso de parágrafo', () => {
      const texto = 'inciso I, § 1º, Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.filhos[0].rotulo).to.be.equal('§ 1º');
      expect(dispositivo.filhos[0].filhos[0].rotulo).to.be.equal('I –');
    });
    it('Com artigo, um parágrafo e um inciso de parágrafo', () => {
      const texto = 'inciso I § 1º Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.filhos[0].rotulo).to.be.equal('§ 1º');
      expect(dispositivo.filhos[0].filhos[0].rotulo).to.be.equal('I –');
    });
    it('Com artigo, um parágrafo e um inciso de parágrafo', () => {
      const texto = 'inciso I par 1º Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.tipo).to.be.equal('Artigo');
      expect(dispositivo.filhos[0].tipo).to.be.equal('Paragrafo');
      expect(dispositivo.filhos[0].rotulo).to.be.equal('§ 1º');
      expect(dispositivo.filhos[0].filhos[0].rotulo).to.be.equal('I –');
    });
    it('Com artigo, um parágrafo e um inciso de caput', () => {
      const texto = 'inciso I  do caput do  Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.tipo).to.be.equal('Artigo');
      expect(dispositivo.filhos[0].tipo).to.be.equal('Inciso');
      expect(dispositivo.filhos[0].rotulo).to.be.equal('I –');
    });
    it('Com artigo, um parágrafo e um inciso de parágrafo', () => {
      const texto = 'inc I par 1º Art. 2º';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.tipo).to.be.equal('Artigo');
      expect(dispositivo.filhos[0].tipo).to.be.equal('Paragrafo');
      expect(dispositivo.filhos[0].rotulo).to.be.equal('§ 1º');
      expect(dispositivo.filhos[0].filhos[0].rotulo).to.be.equal('I –');
    });
    it('Com artigo, um parágrafo e um inciso de parágrafo', () => {
      const texto = 'ali a inc I par 1 art 2';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.tipo).to.be.equal('Artigo');
      expect(dispositivo.filhos[0].tipo).to.be.equal('Paragrafo');
      expect(dispositivo.filhos[0].rotulo).to.be.equal('§ 1º');
      expect(dispositivo.filhos[0].filhos[0].tipo).to.be.equal('Inciso');
      expect(dispositivo.filhos[0].filhos[0].rotulo).to.be.equal('I –');
      expect(dispositivo.filhos[0].filhos[0].filhos[0].tipo).to.be.equal('Alinea');
      expect(dispositivo.filhos[0].filhos[0].filhos[0].rotulo).to.be.equal('a)');
    });
    it('Com artigo, um parágrafo e um inciso de parágrafo', () => {
      const texto = 'ali a inc I art 2';
      const dispositivo = buildDispositivosAssistente(texto, artigo);

      expect(artigo.alteracoes?.filhos[0]).to.be.equal(dispositivo);
      expect(dispositivo.tipo).to.be.equal('Artigo');
      expect(dispositivo.filhos[0].tipo).to.be.equal('Inciso');
      expect(dispositivo.filhos[0].rotulo).to.be.equal('I –');
      expect(dispositivo.filhos[0].filhos[0].tipo).to.be.equal('Alinea');
      expect(dispositivo.filhos[0].filhos[0].rotulo).to.be.equal('a)');
    });
    it('Novo parser apenas artigo', () => {
      const texto = 'artigo. 5º';
      const parser = new ReferenciaDispositivoParser(texto);
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.equal(1);
      expect(parser.referencias[0].tipo).to.be.equal(TipoDispositivo.artigo);
      expect(parser.referencias[0].numero).to.be.equal('5');
    });
    it('Novo parser parágrafo', () => {
      const texto = 'parágrafo único do artigo. 18-B';
      const parser = new ReferenciaDispositivoParser(texto);
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.equal(2);
      expect(parser.referencias[0].tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(parser.referencias[0].numero).to.be.equal('único');
      expect(parser.referencias[1].tipo).to.be.equal(TipoDispositivo.artigo);
      expect(parser.referencias[1].numero).to.be.equal('18-b');
    });
    it('Novo parser item', () => {
      const texto = 'item 12, ali cd, inc XXV, par 49, art 123';
      const parser = new ReferenciaDispositivoParser(texto);
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.equal(5);
      expect(parser.referencias[0].tipo).to.be.equal(TipoDispositivo.item);
      expect(parser.referencias[0].numero).to.be.equal('12');
      expect(parser.referencias[1].tipo).to.be.equal(TipoDispositivo.alinea);
      expect(parser.referencias[1].numero).to.be.equal('cd');
      expect(parser.referencias[2].tipo).to.be.equal(TipoDispositivo.inciso);
      expect(parser.referencias[2].numero).to.be.equal('xxv');
      expect(parser.referencias[3].tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(parser.referencias[3].numero).to.be.equal('49');
      expect(parser.referencias[4].tipo).to.be.equal(TipoDispositivo.artigo);
      expect(parser.referencias[4].numero).to.be.equal('123');
    });

    it('Sufixos válidos 1 Seção', () => {
      const texto = 'item 1-A ali a-A inc X-AAA par 1-AA art 1-A';
      const parser = new ReferenciaDispositivoParser(texto);
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.equal(5);
      expect(parser.referencias[0].tipo).to.be.equal(TipoDispositivo.item);
      expect(parser.referencias[0].numero).to.be.equal('1-a');
      expect(parser.referencias[1].tipo).to.be.equal(TipoDispositivo.alinea);
      expect(parser.referencias[1].numero).to.be.equal('a-a');
      expect(parser.referencias[2].tipo).to.be.equal(TipoDispositivo.inciso);
      expect(parser.referencias[2].numero).to.be.equal('x-aaa');
      expect(parser.referencias[3].tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(parser.referencias[3].numero).to.be.equal('1-aa');
      expect(parser.referencias[4].tipo).to.be.equal(TipoDispositivo.artigo);
      expect(parser.referencias[4].numero).to.be.equal('1-a');
    });

    it('Sufixos válidos 2 Seção', () => {
      const texto = 'item 1-A-A ali a-A-A inc X-AAA-AAA par 1-AA-AA art 1-A-A';
      const parser = new ReferenciaDispositivoParser(texto);
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.equal(5);
      expect(parser.referencias[0].tipo).to.be.equal(TipoDispositivo.item);
      expect(parser.referencias[0].numero).to.be.equal('1-a-a');
      expect(parser.referencias[1].tipo).to.be.equal(TipoDispositivo.alinea);
      expect(parser.referencias[1].numero).to.be.equal('a-a-a');
      expect(parser.referencias[2].tipo).to.be.equal(TipoDispositivo.inciso);
      expect(parser.referencias[2].numero).to.be.equal('x-aaa-aaa');
      expect(parser.referencias[3].tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(parser.referencias[3].numero).to.be.equal('1-aa-aa');
      expect(parser.referencias[4].tipo).to.be.equal(TipoDispositivo.artigo);
      expect(parser.referencias[4].numero).to.be.equal('1-a-a');
    });

    it('Sufixos válidos 3 Seção', () => {
      const texto = 'item 1-A-A-A ali a-A-A-A inc X-AAA-AAA-AAA par 1-AA-AA-AA art 1-A-A-A';
      const parser = new ReferenciaDispositivoParser(texto);
      expect(parser.valido).to.be.true;
      expect(parser.referencias.length).to.be.equal(5);
      expect(parser.referencias[0].tipo).to.be.equal(TipoDispositivo.item);
      expect(parser.referencias[0].numero).to.be.equal('1-a-a-a');
      expect(parser.referencias[1].tipo).to.be.equal(TipoDispositivo.alinea);
      expect(parser.referencias[1].numero).to.be.equal('a-a-a-a');
      expect(parser.referencias[2].tipo).to.be.equal(TipoDispositivo.inciso);
      expect(parser.referencias[2].numero).to.be.equal('x-aaa-aaa-aaa');
      expect(parser.referencias[3].tipo).to.be.equal(TipoDispositivo.paragrafo);
      expect(parser.referencias[3].numero).to.be.equal('1-aa-aa-aa');
      expect(parser.referencias[4].tipo).to.be.equal(TipoDispositivo.artigo);
      expect(parser.referencias[4].numero).to.be.equal('1-a-a-a');
    });

    it('Referências inválidas', () => {
      expect(new ReferenciaDispositivoParser('arts 5 e 6').valido).to.be.false;
      expect(new ReferenciaDispositivoParser('parágrafo 10 e 11 do art 5º').valido).to.be.false;
      expect(new ReferenciaDispositivoParser('alínea a do art 5º').valido).to.be.false;
      expect(new ReferenciaDispositivoParser('alínea a do par 12 do art 5º').valido).to.be.false;
      expect(new ReferenciaDispositivoParser('item 4 do art 5º').valido).to.be.false;
      expect(new ReferenciaDispositivoParser('item 3 do par 12 do art 5º').valido).to.be.false;
      expect(new ReferenciaDispositivoParser('item 5-B, inc X, art 5º').valido).to.be.false;
    });
  });
});
