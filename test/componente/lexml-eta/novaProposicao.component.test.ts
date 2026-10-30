import { expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaConfig } from '../../../src';
import { Autoria, ColegiadoApreciador, OpcoesImpressao, Parlamentar } from '../../../src/model/proposicao/proposicao';
import { rootStore } from '../../../src/redux/store';
import { lexeditSalvo, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const URN_PL = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;123';
const dadosMinimos = (): any => ({ urn: URN_PL, epigrafe: 'PROJETO DE LEI Nº 123, DE 2026', preambulo: 'O Congresso Nacional decreta:' });

describe('LexmlEtaComponent — novaProposicao', () => {
  let component: LexmlEtaComponent;
  const documento = (): any => component.getDocumentoArticulado();
  const parteInicial = (): any => documento().value.projetoNorma.norma.parteInicial;

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).getParlamentares = async (): Promise<[]> => [];
  });

  it('cria o documento com URN, epígrafe e preâmbulo informados', async () => {
    await component.novaProposicao(dadosMinimos());

    expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
    expect(parteInicial().epigrafe.content).to.deep.equal(['PROJETO DE LEI Nº 123, DE 2026']);
    expect(parteInicial().preambulo.p[0].content).to.deep.equal(['O Congresso Nacional decreta:']);
    expect(!!rootStore.getState().elementoReducer.articulacao).to.be.true;
  });

  it('opcionais ausentes assumem os padrões', async () => {
    await component.novaProposicao(dadosMinimos());

    expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao).to.deep.equal(new OpcoesImpressao());
    expect((component as any).colegiadoApreciador).to.equal(undefined);
    expect(component.outrosMetadados).to.deep.equal({});
  });

  ['urn', 'epigrafe', 'preambulo'].forEach(campo => {
    it(`rejeita sem ${campo}, nomeia o dado e mantém o documento em edição`, async () => {
      await component.novaProposicao(dadosMinimos());
      let fatal = false;
      component.addEventListener('fatalError', () => (fatal = true));
      const dados = dadosMinimos();
      delete dados[campo];

      let erro: Error | undefined;
      await component.novaProposicao(dados).catch(e => (erro = e));

      expect(erro?.message).to.contain(`'${campo}'`);
      expect(fatal).to.be.true;
      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
    });
  });

  it('aceita preâmbulo vazio', async () => {
    await component.novaProposicao({ ...dadosMinimos(), preambulo: '' });
    expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
  });

  [
    ['norma', 'urn:lex:br:senado.federal:resolucao:2026;1'],
    ['medida provisória', 'urn:lex:br:federal:medida.provisoria:2026-01-01;1'],
    ['autoridade da outra casa', 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;1'],
  ].forEach(([nome, urn]) => {
    it(`rejeita URN de ${nome} sem alterar o documento em edição`, async () => {
      await component.novaProposicao(dadosMinimos());

      let erro: Error | undefined;
      await component.novaProposicao({ ...dadosMinimos(), urn }).catch(e => (erro = e));

      expect(!!erro).to.be.true;
      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
    });
  });

  it('o dado informado vence o padrão da sessão', async () => {
    const parlamentar = (identificacao: string, nome: string): Parlamentar => Object.assign(new Parlamentar(), { identificacao, nome, siglaCasaLegislativa: 'SF' });
    (component as any).getParlamentares = async (): Promise<Parlamentar[]> => [parlamentar('1', 'Fulano'), parlamentar('2', 'Beltrano')];
    component.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), {
      autoriaPadrao: { identificacao: '2', siglaCasaLegislativa: 'SF' },
      opcoesImpressaoPadrao: { imprimirBrasao: false, textoCabecalho: 'Gabinete', tamanhoFonte: 16 },
    });

    await component.novaProposicao(dadosMinimos());
    expect(((component as any)._lexmlAutoria.autoria.parlamentares as Parlamentar[]).map(p => p.nome)).to.deep.equal(['Beltrano']);
    expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao.textoCabecalho).to.equal('Gabinete');

    const autoria = Object.assign(new Autoria(), { parlamentares: [parlamentar('1', 'Fulano')] });
    const opcoesImpressao = Object.assign(new OpcoesImpressao(), { textoCabecalho: 'Outro' });
    await component.novaProposicao({ ...dadosMinimos(), autoria, opcoesImpressao });
    expect(((component as any)._lexmlAutoria.autoria.parlamentares as Parlamentar[]).map(p => p.nome)).to.deep.equal(['Fulano']);
    expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao.textoCabecalho).to.equal('Outro');
  });

  it('aplica destino, outros metadados, anexo de parecer e documento referenciado', async () => {
    const destino = Object.assign(new ColegiadoApreciador(), { tipoColegiado: 'Comissão', siglaComissao: 'CAE' });
    await component.novaProposicao({
      ...dadosMinimos(),
      colegiadoApreciador: destino,
      outrosMetadados: { chave: 'valor' },
      urnDocumentoReferenciado: 'urn:lex:br:senado.federal:projeto.lei;pl:2025;7',
    });

    const destinoAplicado = (component as any).colegiadoApreciador;
    expect(destinoAplicado.tipoColegiado).to.equal('Comissão');
    expect(destinoAplicado.siglaComissao).to.equal('CAE');
    expect(component.outrosMetadados).to.deep.equal({ chave: 'valor' });
    expect(lexeditSalvo(documento()).urnDocumentoReferenciado).to.equal('urn:lex:br:senado.federal:projeto.lei;pl:2025;7');

    await component.novaProposicao({ ...dadosMinimos(), anexoParecer: true });
    expect(lexeditSalvo(documento()).anexoParecer).to.equal(true);
  });

  describe('documento de modelo', () => {
    const modelo = (): any => {
      const m = novoDocumentoArticulado();
      m.value.metadado.identificacao.urn = 'urn:lex:br:senado.federal:projeto.lei;pl:2020;5';
      m.value.projetoNorma.norma.parteInicial.epigrafe.content = ['EPÍGRAFE DO MODELO'];
      m.value.projetoNorma.norma.parteInicial.preambulo.p = [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['PREÂMBULO DO MODELO'] }];
      return m;
    };

    it('os parâmetros sobrescrevem o modelo', async () => {
      await component.novaProposicao({ ...dadosMinimos(), documentoModelo: modelo() });

      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
      expect(parteInicial().epigrafe.content).to.deep.equal(['PROJETO DE LEI Nº 123, DE 2026']);
      expect(parteInicial().preambulo.p[0].content).to.deep.equal(['O Congresso Nacional decreta:']);
    });

    it('aproveita a articulação e a ementa e descarta o resto', async () => {
      const m = modelo();
      m.value.projetoNorma.norma.parteInicial.ementa.content = ['EMENTA DO MODELO'];
      const artigos = m.value.projetoNorma.norma.articulacao.lXhier.length;

      await component.novaProposicao({ ...dadosMinimos(), documentoModelo: m });

      expect(parteInicial().ementa.content).to.deep.equal(['EMENTA DO MODELO']);
      expect(documento().value.projetoNorma.norma.articulacao.lXhier.length).to.equal(artigos);
      expect(component.outrosMetadados).to.deep.equal({});
      expect(lexeditSalvo(documento())).not.to.have.property('revisoesArticulacao');
    });
  });
});
