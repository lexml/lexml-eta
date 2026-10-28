import { expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaConfig } from '../../../src';
import { Parlamentar } from '../../../src/model/proposicao/proposicao';

const parlamentar = (identificacao: string, nome: string): Parlamentar => Object.assign(new Parlamentar(), { identificacao, nome, siglaCasaLegislativa: 'SF' });

describe('LexmlEtaConfig — padrões da sessão', () => {
  let component: LexmlEtaComponent;
  const params = (): any => ({ substitutivo: false });

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).parlamentares = [parlamentar('1', 'Fulano'), parlamentar('2', 'Beltrano')];
    component.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), {
      autoriaPadrao: { identificacao: '2', siglaCasaLegislativa: 'SF' },
      opcoesImpressaoPadrao: { imprimirBrasao: false, textoCabecalho: 'Gabinete', tamanhoFonte: 16 },
    });
  });

  it('a configuração não tem mais anexoParecer, que é do documento', () => {
    expect('anexoParecer' in new LexmlEtaConfig()).to.be.false;
  });

  it('nova proposição usa a autoria e as opções de impressão padrão', () => {
    (component as any).resetaProposicao(params(), true);

    expect(((component as any)._lexmlAutoria.autoria.parlamentares as Parlamentar[]).map(p => p.nome)).to.deep.equal(['Beltrano']);
    expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao).to.include({ imprimirBrasao: false, textoCabecalho: 'Gabinete', tamanhoFonte: 16 });
  });

  it('abrir um documento não aplica os padrões', () => {
    (component as any).resetaProposicao(params(), false);

    expect(((component as any)._lexmlAutoria.autoria.parlamentares as Parlamentar[]).length).to.equal(0);
    expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao.textoCabecalho).not.to.equal('Gabinete');
  });
});
