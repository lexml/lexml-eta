import { expect } from '@open-wc/testing';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { createArticulacao } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { criaStateComNArtigos } from '../../helpers/dispositivo-helper';

const QUEBRA = '<br class="eta-quebra-linha">';

const exibicaoDaEpigrafe = (texto: string): string | undefined => createElemento(createArticulacao(texto)).conteudo?.texto;

describe('createElemento: exibição da epígrafe (#1060)', () => {
  it('duas linhas: só a primeira em negrito', () => {
    expect(exibicaoDaEpigrafe('EMENDA Nº 1 (SUBSTITUTIVO)<br/>(ao Projeto de Lei nº 5.008, de 2023)')).to.equal(
      `<b>EMENDA Nº 1 (SUBSTITUTIVO)</b>${QUEBRA}(ao Projeto de Lei nº 5.008, de 2023)`
    );
  });

  it('três linhas: só a primeira em negrito', () => {
    expect(exibicaoDaEpigrafe('A<br/>B<br>C')).to.equal(`<b>A</b>${QUEBRA}B${QUEBRA}C`);
  });

  it('uma linha: toda em negrito', () => {
    expect(exibicaoDaEpigrafe('PROJETO DE LEI Nº 12, DE 2026')).to.equal('<b>PROJETO DE LEI Nº 12, DE 2026</b>');
  });

  it('primeira linha vazia: sem negrito vazio', () => {
    expect(exibicaoDaEpigrafe('<br/>B')).to.equal(`${QUEBRA}B`);
  });

  it('mantém a formatação existente', () => {
    expect(exibicaoDaEpigrafe('<i>A</i><br/>B <i>c</i>')).to.equal(`<b><i>A</i></b>${QUEBRA}B <i>c</i>`);
  });

  it('o texto do dispositivo não muda', () => {
    const articulacao = createArticulacao('A<br/>B');
    createElemento(articulacao);
    expect(articulacao.texto).to.equal('A<br/>B');
  });

  it('dispositivo não recebe o tratamento', () => {
    const artigo = criaStateComNArtigos(1).artigos[0];
    artigo.texto = 'Texto<br/>do artigo.';
    expect(createElemento(artigo).conteudo?.texto).to.equal('Texto<br/>do artigo.');
  });
});
