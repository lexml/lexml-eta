import { expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaParametrosEdicao } from '../../../src';
import { Proposicao } from '../../../src/model/proposicao/proposicao';

let component: LexmlEtaComponent;

describe('LexmlEtaParametrosEdicao - atributo substitutivo', () => {
  it('deve ter valor padrão false', () => {
    const params = new LexmlEtaParametrosEdicao();
    expect(params.substitutivo).to.be.false;
  });
});

describe('LexmlEtaComponent - atributo substitutivo', () => {
  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
  });

  describe('Validação dos parâmetros de inicialização', () => {
    it('deve lançar erro quando sigla não informada', () => {
      const params = new LexmlEtaParametrosEdicao();
      expect(() => (component as any).validarParametrosIdentificacaoProposicao(params)).to.throw('"sigla" é obrigatório');
    });

    it('deve lançar erro quando substitutivo=true e numero não informado', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.ano = '2025';
      params.substitutivo = true;
      expect(() => (component as any).validarParametrosIdentificacaoProposicao(params)).to.throw('"numero" é obrigatório para texto substitutivo');
    });

    it('deve lançar erro quando substitutivo=true e ano não informado', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.numero = '1';
      params.substitutivo = true;
      expect(() => (component as any).validarParametrosIdentificacaoProposicao(params)).to.throw('"ano" é obrigatório para texto substitutivo');
    });

    it('deve preencher numero com "1" quando substitutivo=false e numero não informado', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      (component as any).validarParametrosIdentificacaoProposicao(params);
      expect(params.numero).to.equal('1');
    });

    it('deve preencher ano com o corrente quando substitutivo=false e ano não informado', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      (component as any).validarParametrosIdentificacaoProposicao(params);
      expect(params.ano).to.equal(new Date().getFullYear().toString());
    });

    it('não deve alterar numero e ano quando ambos já informados e substitutivo=false', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.numero = '42';
      params.ano = '2020';
      (component as any).validarParametrosIdentificacaoProposicao(params);
      expect(params.numero).to.equal('42');
      expect(params.ano).to.equal('2020');
    });
  });

  describe('Cenário: Criar nova proposição (resetaProposicao)', () => {
    it('deve ter substitutivo=false ao criar nova proposição sem informar substitutivo', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      (component as any).resetaProposicao(params);
      expect((component as any).substitutivo).to.be.false;
    });

    it('deve ter substitutivo=true ao criar nova proposição com substitutivo=true', () => {
      const params = new LexmlEtaParametrosEdicao();
      params.sigla = 'PL';
      params.numero = '1';
      params.ano = '2025';
      params.substitutivo = true;
      (component as any).resetaProposicao(params);
      expect((component as any).substitutivo).to.be.true;
    });
  });

  describe('Cenário: Carregar proposição de arquivo (setProposicao)', () => {
    it('deve ter substitutivo=false ao carregar proposição com substitutivo=false', () => {
      const proposicao = new Proposicao();
      proposicao.substitutivo = false;
      (component as any).setProposicao(proposicao);
      expect((component as any).substitutivo).to.be.false;
    });

    it('deve ter substitutivo=true ao carregar proposição com substitutivo=true', () => {
      const proposicao = new Proposicao();
      proposicao.substitutivo = true;
      (component as any).setProposicao(proposicao);
      expect((component as any).substitutivo).to.be.true;
    });

    it('deve sobrescrever substitutivo anterior ao carregar nova proposição', () => {
      const proposicaoSubstitutiva = new Proposicao();
      proposicaoSubstitutiva.substitutivo = true;
      (component as any).setProposicao(proposicaoSubstitutiva);
      expect((component as any).substitutivo).to.be.true;

      const proposicaoNormal = new Proposicao();
      proposicaoNormal.substitutivo = false;
      (component as any).setProposicao(proposicaoNormal);
      expect((component as any).substitutivo).to.be.false;
    });
  });
});
