import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../src/model/dispositivo/tipo';
import { buildDispositivoFromJsonix } from '../../../src/model/lexml/documento/conversor/buildDispositivoFromJsonix';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { LEXML_COM_PENAS } from '../../doc/pena/lexml-com-penas';

describe('Colar texto com pena (resposta real do conversor)', () => {
  const resultado = buildDispositivoFromJsonix(LEXML_COM_PENAS);
  const lista = getDispositivoAndFilhosAsLista(resultado.articulacao!);
  const penas = lista.filter(isPena);

  it('cria as penas como último filho do dono, em vez de descartá-las', () => {
    expect(penas.map(p => p.id)).to.deep.equal(['art1_cpt_pena', 'art1_par1_inc1_pena', 'art1_par1_pena', 'alt1_art213_cpt_pena']);
    const art1 = resultado.articulacao!.filhos[0] as Artigo;
    expect(art1.caput!.filhos.map(f => f.tipo)).to.deep.equal(['Pena']);
    const par1 = art1.filhos.find(f => f.tipo === 'Paragrafo')!;
    expect(par1.filhos.map(f => f.tipo)).to.deep.equal(['Inciso', 'Inciso', 'Pena']);
    expect(par1.filhos[0].filhos.map(f => f.tipo)).to.deep.equal(['Pena']);
  });

  it('normaliza o rótulo e lê o texto da pena', () => {
    expect(penas.map(p => p.rotulo)).to.deep.equal(['Pena –', 'Infração –', 'Pena –', 'Pena –']);
    expect(penas[0].texto).to.equal('reclusão, de seis a vinte anos.');
    expect(penas[1].texto).to.equal('multa.');
  });

  it('lê a pena do caput omissis em bloco de alteração', () => {
    const penaAlteracao = penas[3];
    expect(penaAlteracao.pai!.tipo).to.equal('Caput');
    expect(penaAlteracao.texto).to.equal('reclusão, de seis a dez anos.');
    expect(penaAlteracao.pai!.filhos.map(f => f.tipo)).to.deep.equal(['Omissis', 'Pena']);
  });
});
