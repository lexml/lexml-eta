import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../../src/model/dispositivo/dispositivo';
import { isPena } from '../../../../src/model/dispositivo/tipo';
import { createAlteracao, createArticulacao, criaDispositivo, criaDispositivoCabecaAlteracao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { getDispositivoAndFilhosAsLista } from '../../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { identidadeRotuloPena, normalizaRotuloPena } from '../../../../src/model/lexml/numeracao/rotuloPena';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { buildId, updateIdDispositivoAndFilhos } from '../../../../src/model/lexml/util/idUtil';

const atualizaIds = (articulacao: Articulacao): void => {
  getDispositivoAndFilhosAsLista(articulacao).forEach(d => d.renumeraFilhos());
  articulacao.renumeraFilhos();
  updateIdDispositivoAndFilhos(articulacao);
};

describe('Pena: tipo, numeração e id', () => {
  let articulacao: Articulacao;
  let artigo: Artigo;

  beforeEach(() => {
    articulacao = createArticulacao();
    artigo = criaDispositivo(articulacao, 'Artigo') as Artigo;
    artigo.texto = 'Matar alguém:';
    atualizaIds(articulacao);
  });

  it('o tipo Pena aceita os cinco donos e não tem filhos', () => {
    const tipo = TipoDispositivo.pena;
    expect(tipo.tiposPermitidosPai).to.deep.equal(['Caput', 'Paragrafo', 'Inciso', 'Alinea', 'Item']);
    expect(tipo.tiposPermitidosFilhos).to.deep.equal([]);
    ['caput', 'paragrafo', 'inciso', 'alinea', 'item'].forEach(dono => {
      const filhos = TipoDispositivo[dono].tiposPermitidosFilhos!;
      expect(filhos[filhos.length - 1], dono).to.equal('Pena');
    });
  });

  it('cria a pena do artigo no caput, com o id art1_cpt_pena', () => {
    const pena = criaDispositivo(artigo, 'Pena');
    pena.rotulo = 'Pena –';
    expect(isPena(pena)).to.be.true;
    expect(pena.pai).to.equal(artigo.caput);
    expect(artigo.caput!.filhos).to.deep.equal([pena]);
    expect(buildId(pena)).to.equal('art1_cpt_pena');
  });

  it('cria a pena de parágrafo com o id art1_par2_pena', () => {
    criaDispositivo(artigo, 'Paragrafo');
    const par2 = criaDispositivo(artigo, 'Paragrafo');
    atualizaIds(articulacao);
    const pena = criaDispositivo(par2, 'Pena');
    expect(pena.pai).to.equal(par2);
    expect(buildId(pena)).to.equal('art1_par2_pena');
  });

  it('cria a pena de inciso e de alínea', () => {
    const inciso = criaDispositivo(artigo.caput!, 'Inciso');
    const alinea = criaDispositivo(inciso, 'Alinea');
    atualizaIds(articulacao);
    expect(buildId(criaDispositivo(inciso, 'Pena'))).to.equal('art1_cpt_inc1_pena');
    expect(buildId(criaDispositivo(alinea, 'Pena'))).to.equal('art1_cpt_inc1_ali1_pena');
  });

  it('cria a pena em bloco de alteração com o id do bloco', () => {
    createAlteracao(artigo);
    const cabeca = criaDispositivoCabecaAlteracao('Artigo', artigo.alteracoes!);
    cabeca.numero = '213';
    cabeca.createRotulo(cabeca);
    updateIdDispositivoAndFilhos(articulacao);
    const pena = criaDispositivo(cabeca, 'Pena');
    expect(pena.pai).to.equal((cabeca as Artigo).caput);
    expect(buildId(pena)).to.equal('art1_cpt_alt1_art213_cpt_pena');
  });

  it('preserva o rótulo ao renumerar os irmãos do dono', () => {
    const par = criaDispositivo(artigo, 'Paragrafo');
    const pena = criaDispositivo(par, 'Pena');
    pena.rotulo = 'Infração –';
    pena.createRotulo(pena);
    criaDispositivo(par, 'Inciso');
    par.renumeraFilhos();
    expect(pena.rotulo).to.equal('Infração –');
    expect(pena.numero).to.be.undefined;
  });

  it('createRotulo dá o rótulo padrão quando ainda não há', () => {
    const pena = criaDispositivo(artigo, 'Pena');
    pena.createRotulo(pena);
    expect(pena.rotulo).to.equal('Pena –');
  });

  it('atualiza o id da pena quando o dono é renumerado', () => {
    const par1 = criaDispositivo(artigo, 'Paragrafo');
    const par2 = criaDispositivo(artigo, 'Paragrafo');
    atualizaIds(articulacao);
    const pena = criaDispositivo(par2, 'Pena');
    pena.id = buildId(pena);
    expect(pena.id).to.equal('art1_par2_pena');
    artigo.removeFilho(par1);
    atualizaIds(articulacao);
    expect(par2.id).to.equal('art1_par1u');
    expect(pena.id).to.equal('art1_par1u_pena');
  });
});

describe('rótulo da pena', () => {
  it('normaliza o separador para " –"', () => {
    expect(normalizaRotuloPena('Pena -')).to.equal('Pena –');
    expect(normalizaRotuloPena('Pena –')).to.equal('Pena –');
    expect(normalizaRotuloPena('Pena —')).to.equal('Pena –');
    expect(normalizaRotuloPena('Pena \u0096')).to.equal('Pena –');
    expect(normalizaRotuloPena('Sanção -')).to.equal('Sanção –');
    expect(normalizaRotuloPena('Pena')).to.equal('Pena –');
    expect(normalizaRotuloPena('Sanção-base -')).to.equal('Sanção-base –');
    expect(normalizaRotuloPena(undefined)).to.equal('Pena –');
  });

  it('identifica a opção do modal sem diferenciar maiúsculas', () => {
    expect(identidadeRotuloPena('Pena –')).to.equal('Pena');
    expect(identidadeRotuloPena('PENALIDADE -')).to.equal('Penalidade');
    expect(identidadeRotuloPena('medida administrativa –')).to.equal('Medida Administrativa');
    expect(identidadeRotuloPena('Infração –')).to.equal('Infração');
    expect(identidadeRotuloPena('Sanção –')).to.equal('Outro');
  });
});

describe('Pena como último filho', () => {
  let articulacao: Articulacao;
  let artigo: Artigo;
  const tipos = (d: Dispositivo): string[] => d.filhos.map(f => f.tipo);

  beforeEach(() => {
    articulacao = createArticulacao();
    artigo = criaDispositivo(articulacao, 'Artigo') as Artigo;
    atualizaIds(articulacao);
  });

  it('inclui inciso sem referência antes da pena do parágrafo', () => {
    const par = criaDispositivo(artigo, 'Paragrafo');
    criaDispositivo(par, 'Inciso');
    criaDispositivo(par, 'Pena');
    criaDispositivo(par, 'Inciso');
    expect(tipos(par)).to.deep.equal(['Inciso', 'Inciso', 'Pena']);
  });

  it('inclui com referência na última posição antes da pena', () => {
    const par = criaDispositivo(artigo, 'Paragrafo');
    const inc1 = criaDispositivo(par, 'Inciso');
    const pena = criaDispositivo(par, 'Pena');
    const inc2 = criaDispositivo(par, 'Inciso', inc1);
    expect(par.filhos).to.deep.equal([inc1, inc2, pena]);
  });

  it('referência igual à pena insere antes da pena', () => {
    const par = criaDispositivo(artigo, 'Paragrafo');
    const inc1 = criaDispositivo(par, 'Inciso');
    const pena = criaDispositivo(par, 'Pena');
    const inc2 = criaDispositivo(par, 'Inciso', pena);
    expect(par.filhos).to.deep.equal([inc1, inc2, pena]);
  });

  it('inclui por posição além do fim antes da pena e no meio normalmente', () => {
    const par = criaDispositivo(artigo, 'Paragrafo');
    const inc1 = criaDispositivo(par, 'Inciso');
    const inc2 = criaDispositivo(par, 'Inciso');
    const pena = criaDispositivo(par, 'Pena');
    const inc3 = criaDispositivo(par, 'Inciso', undefined, 99);
    const inc0 = criaDispositivo(par, 'Inciso', undefined, 0);
    expect(par.filhos).to.deep.equal([inc0, inc1, inc2, inc3, pena]);
  });

  it('a pena entra sempre no fim, mesmo com posição', () => {
    const par = criaDispositivo(artigo, 'Paragrafo');
    const inc1 = criaDispositivo(par, 'Inciso');
    const pena = criaDispositivo(par, 'Pena', undefined, 0);
    expect(par.filhos).to.deep.equal([inc1, pena]);
  });

  it('remove a pena sem alterar os demais filhos', () => {
    const par = criaDispositivo(artigo, 'Paragrafo');
    const inc1 = criaDispositivo(par, 'Inciso');
    const pena = criaDispositivo(par, 'Pena');
    par.removeFilho(pena);
    expect(par.filhos).to.deep.equal([inc1]);
  });

  it('artigo: a pena fica no caput, depois dos incisos e antes do § 1º', () => {
    const inc1 = criaDispositivo(artigo, 'Inciso');
    const par1 = criaDispositivo(artigo, 'Paragrafo');
    const pena = criaDispositivo(artigo, 'Pena');
    expect(artigo.caput!.filhos).to.deep.equal([inc1, pena]);
    expect(artigo.filhos.filter(f => f.tipo === 'Paragrafo')).to.deep.equal([par1]);
    expect(artigo.filhos).to.deep.equal([inc1, pena, par1]);
  });

  it('artigo: incisos novos entram antes da pena do caput e parágrafos depois dela', () => {
    const pena = criaDispositivo(artigo, 'Pena');
    const inc1 = criaDispositivo(artigo, 'Inciso');
    const par1 = criaDispositivo(artigo, 'Paragrafo');
    const par0 = criaDispositivo(artigo, 'Paragrafo', undefined, 2);
    const inc2 = criaDispositivo(artigo, 'Inciso', undefined, 1);
    expect(artigo.caput!.filhos).to.deep.equal([inc1, inc2, pena]);
    expect(artigo.filhos).to.deep.equal([inc1, inc2, pena, par0, par1]);
  });

  it('artigo: parágrafo por posição dentro do intervalo do caput entra como primeiro parágrafo', () => {
    criaDispositivo(artigo, 'Inciso');
    criaDispositivo(artigo, 'Pena');
    const par1 = criaDispositivo(artigo, 'Paragrafo');
    const par2 = criaDispositivo(artigo, 'Paragrafo');
    // posição 1 cai antes da pena do caput; sem o limite, splice(-1) o poria entre os dois parágrafos
    const par0 = criaDispositivo(artigo, 'Paragrafo', undefined, 1);
    expect(artigo.filhos.filter(f => f.tipo === 'Paragrafo')).to.deep.equal([par0, par1, par2]);
  });

  it('artigo: a pena é removida do caput', () => {
    const pena = criaDispositivo(artigo, 'Pena');
    const par1 = criaDispositivo(artigo, 'Paragrafo');
    artigo.removeFilho(pena);
    expect(artigo.caput!.filhos).to.deep.equal([]);
    expect(artigo.filhos).to.deep.equal([par1]);
  });

  it('a lista do dispositivo e seus filhos inclui a pena na ordem de leitura', () => {
    const par = criaDispositivo(artigo, 'Paragrafo');
    const inc1 = criaDispositivo(par, 'Inciso');
    const pena = criaDispositivo(par, 'Pena');
    expect(getDispositivoAndFilhosAsLista(par)).to.deep.equal([par, inc1, pena]);
  });
});
