import { expect, fixture, html } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { DadosBasicos } from '../../../src/model/lexml/documento/dadosBasicos';
import { Autoria, Parlamentar } from '../../../src/model/proposicao/proposicao';
import { rootStore } from '../../../src/redux/store';
import { congelarRelogio, lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado, restaurarRelogio } from '../../doc/documentoArticulado';

const URN_PLS = 'urn:lex:br:senado.federal:projeto.lei;pls:9999;999999';
const URN_PL = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;999999';
const URN_PL_NUMERADO = 'urn:lex:br:senado.federal:projeto.lei;pl:2025;10';
const URN_PLP = 'urn:lex:br:senado.federal:projeto.lei.complementar;plp:2026;999999';
const URN_PLV = 'urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999';
const URN_MPV_DOC = 'urn:lex:br:federal:medida.provisoria:2026-01-01;1';
const URN_MPV_REF = 'urn:lex:br:federal:medida.provisoria:2026;1200';
const ULTIMA_MODIFICACAO = '2026-10-01T10:00:00-03:00';

const davi: Parlamentar = { identificacao: '1111', nome: 'Davi Alcolumbre', sexo: 'M', siglaPartido: 'UNIÃO', siglaUF: 'AP', siglaCasaLegislativa: 'SF', cargo: '' };

const dados = (parcial: Partial<DadosBasicos> = {}): DadosBasicos => ({
  urn: URN_PLP,
  epigrafe: 'PROJETO DE LEI COMPLEMENTAR Nº   , DE 2026',
  preambulo: 'O CONGRESSO NACIONAL decreta:',
  colegiadoApreciador: { siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' },
  anexoParecer: false,
  ...parcial,
});

describe('LexmlEtaComponent — alterarDadosBasicos', () => {
  let component: LexmlEtaComponent;
  let erros: unknown[];
  const campoAutoria = (): any => component.querySelector('lexml-eta-autoria');
  const campoJustificativa = (): any => component.querySelector('lexml-eta-editor-texto-rico[modo="justificativa"]');
  const salvo = (): any => component.getDocumentoArticulado();
  const textoArtigo = (documento: any): string => documento.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content.join('');

  const abrir = async (urn = URN_PLS, grupos: Record<string, unknown> = {}): Promise<void> => {
    const documento = novoDocumentoArticulado();
    documento.value.metadado.identificacao.urn = urn;
    documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ dataUltimaModificacao: ULTIMA_MODIFICACAO, ...grupos })];
    await component.abrirDocumentoArticulado(documento);
  };

  beforeEach(async () => {
    erros = [];
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).getParlamentares = async (): Promise<[]> => [];
    component.addEventListener('fatalError', e => erros.push((e as CustomEvent).detail.err));
    await abrir();
  });

  afterEach(() => {
    restaurarRelogio();
    if (rootStore.getState().elementoReducer.emRevisao) rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
  });

  it('altera os dados básicos e mantém o texto, a autoria, a justificação e a data da última modificação', async () => {
    campoAutoria().autoria = { ...new Autoria(), parlamentares: [davi] };
    campoJustificativa().setContent('<p>Justifica.</p>');
    const textoAntes = textoArtigo(salvo());

    await component.alterarDadosBasicos(dados());

    const depois = salvo();
    const lexedit = lexeditSalvo(depois);
    expect(depois.value.metadado.identificacao.urn).to.equal(URN_PLP);
    expect(lexedit.colegiadoApreciador).to.include({ tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
    expect(textoArtigo(depois)).to.equal(textoAntes);
    expect(lexedit.autoria.parlamentares.parlamentar.map((p: any) => p.identificacao)).to.deep.equal(['1111']);
    expect(depois.value.projetoNorma.justificacao).to.not.be.undefined;
    expect(component.dataUltimaModificacaoDocumento).to.equal(ULTIMA_MODIFICACAO);
    expect(erros).to.have.length(0);
  });

  it('recalcula o local do fecho a partir do colegiado', async () => {
    await abrir(URN_PLS, { local: 'Sala das Sessões', data: '2026-10-01' });
    await component.alterarDadosBasicos(dados());
    const documento = salvo();
    expect(lexeditSalvo(documento).local).to.equal('Sala da Comissão');
    expect(lexeditSalvo(documento).data).to.equal('2026-10-01');
  });

  it('troca de casa descarta a autoria e a passagem a anexo de parecer descarta a justificação', async () => {
    campoAutoria().autoria = { ...new Autoria(), parlamentares: [davi] };
    campoJustificativa().setContent('<p>Justifica.</p>');

    await component.alterarDadosBasicos(dados({ urn: URN_PLV, urnDocumentoReferenciado: URN_MPV_REF, anexoParecer: true, colegiadoApreciador: undefined }));

    const depois = salvo();
    expect(lexeditSalvo(depois)).not.to.have.property('autoria');
    expect(lexeditSalvo(depois).urnDocumentoReferenciado).to.equal(URN_MPV_REF);
    expect(lexeditSalvo(depois).anexoParecer).to.be.true;
    expect(depois.value.projetoNorma).not.to.have.property('justificacao');
  });

  it('mantém os anexos', async () => {
    const anexo = { nome: 'anexo.pdf', tipo: 'pdf' } as any;
    (component as any).aplicarAnexos([anexo]);
    const antes = JSON.stringify(lexeditSalvo(salvo()).anexos);
    await component.alterarDadosBasicos(dados());
    expect(JSON.stringify(lexeditSalvo(salvo()).anexos)).to.equal(antes);
  });

  it('descarta o histórico de desfazer', async () => {
    await component.alterarDadosBasicos(dados());
    expect(rootStore.getState().elementoReducer.past.length).to.equal(0);
  });

  describe('recusas (documento intacto)', () => {
    const recusar = async (entrada: DadosBasicos, trecho: RegExp): Promise<void> => {
      congelarRelogio();
      const antes = salvo();
      let erro: Error | undefined;
      try {
        await component.alterarDadosBasicos(entrada);
      } catch (e) {
        erro = e as Error;
      }
      expect(erro?.message).to.match(trecho);
      expect(erros).to.have.length(1);
      expect(salvo()).to.deep.equal(antes);
    };

    it('sem preâmbulo', () => recusar({ ...dados(), preambulo: undefined } as any, /preambulo/));
    it('sem urn', () => recusar({ ...dados(), urn: '' }, /urn/));
    it('URN de norma', () => recusar(dados({ urn: 'urn:lex:br:federal:lei:2020-01-01;1' }), /Não é possível criar proposição/));
    it('URN da outra casa', () => recusar(dados({ urn: 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;999999' }), /outra casa/));

    it('em modo de revisão', async () => {
      rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
      await recusar(dados(), /modo de revisão/);
    });

    it('sem documento em edição', async () => {
      component.fecharDocumento();
      let erro: Error | undefined;
      try {
        await component.alterarDadosBasicos(dados());
      } catch (e) {
        erro = e as Error;
      }
      expect(erro?.message).to.match(/Não há documento em edição/);
      expect(erros).to.have.length(1);
    });

    it('em documento de tipo não suportado', async () => {
      await abrir(URN_MPV_DOC);
      erros.length = 0;
      await recusar(dados(), /não permite a alteração/);
    });
  });
});

describe('LexmlEtaComponent — grupo "Dados básicos" da aba', () => {
  let component: LexmlEtaComponent;
  const texto = (id: string): string => (component.querySelector(id)?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const botao = (): any => component.querySelector('#botao-alterar-dados-basicos');
  const aviso = (): string | undefined => component.querySelector('#dados-basicos-aviso')?.textContent?.trim();

  const abrir = async (urn: string, grupos: Record<string, unknown> = {}): Promise<void> => {
    const documento = novoDocumentoArticulado();
    documento.value.metadado.identificacao.urn = urn;
    documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit(grupos)];
    await component.abrirDocumentoArticulado(documento);
    await component.updateComplete;
  };

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).getParlamentares = async (): Promise<[]> => [];
  });

  afterEach(() => {
    if (rootStore.getState().elementoReducer.emRevisao) rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
  });

  it('exibe descrição, ano, colegiado e forma de apresentação, com o botão habilitado', async () => {
    await abrir(URN_PL, { colegiadoApreciador: { TYPE_NAME: 'br_gov_lexml_lexedit__1.ColegiadoApreciador', siglaCasaLegislativa: 'SF', tipoColegiado: 'Plenário' } });
    expect(texto('#dados-basicos-descricao')).to.equal('Novo Projeto de Lei (PL)');
    expect(texto('#dados-basicos-ano')).to.contain('2026');
    expect(texto('#dados-basicos-colegiado')).to.contain('Plenário');
    expect(texto('#dados-basicos-parecer')).to.contain('Não');
    expect(botao().disabled).to.be.false;
    expect(aviso()).to.be.undefined;
  });

  it('exibe a comissão com a sigla', async () => {
    await abrir(URN_PL, {
      colegiadoApreciador: { TYPE_NAME: 'br_gov_lexml_lexedit__1.ColegiadoApreciador', siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' },
    });
    expect(texto('#dados-basicos-colegiado')).to.contain('Comissão (CCJ)');
  });

  it('não exibe o ano no substitutivo do Senado', async () => {
    await abrir(`${URN_PL_NUMERADO}@apresentacao.substitutivo`, { urnDocumentoReferenciado: URN_PL_NUMERADO });
    expect(texto('#dados-basicos-descricao')).to.equal('Substitutivo ao Projeto de Lei (PL) nº 10, de 2025');
    expect(component.querySelector('#dados-basicos-ano')).to.be.null;
  });

  it('o clique emite os dados atuais sem alterar o documento', async () => {
    await abrir(URN_PL, { urnDocumentoReferenciado: URN_MPV_REF, anexoParecer: false });
    const antes = JSON.stringify(component.getDocumentoArticulado());
    let detail: any;
    component.addEventListener('alteracao-dados-basicos-solicitada', e => (detail = (e as CustomEvent).detail));
    botao().click();
    expect(detail.urn).to.equal(URN_PL);
    expect(detail.urnDocumentoReferenciado).to.equal(URN_MPV_REF);
    expect(detail.anexoParecer).to.be.false;
    expect(detail.epigrafe).to.be.a('string').and.not.empty;
    expect(detail.preambulo).to.be.a('string');
    expect(detail.colegiadoApreciador.tipoColegiado).to.equal('Plenário');
    expect(detail.outrosMetadados).to.deep.equal({});
    expect(JSON.stringify(component.getDocumentoArticulado())).to.equal(antes);
  });

  it('passa a exibir os dados novos depois da alteração', async () => {
    await abrir(URN_PL);
    await component.alterarDadosBasicos(dados({ urn: URN_PLP, anexoParecer: true, colegiadoApreciador: undefined }));
    await component.updateComplete;
    expect(texto('#dados-basicos-descricao')).to.equal('Novo Projeto de Lei Complementar (PLP)');
    expect(texto('#dados-basicos-parecer')).to.contain('Sim');
    expect(texto('#dados-basicos-colegiado')).to.contain('Não se aplica');
  });

  it('desabilita o botão em modo de revisão, com a mensagem, e reabilita ao sair', async () => {
    await abrir(URN_PL);
    rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
    await component.updateComplete;
    expect(botao().disabled).to.be.true;
    expect(aviso()).to.equal('Os dados básicos não podem ser alterados em modo de revisão.');
    rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
    await component.updateComplete;
    expect(botao().disabled).to.be.false;
    expect(aviso()).to.be.undefined;
  });

  it('desabilita o botão em documento de tipo não suportado', async () => {
    await abrir(URN_MPV_DOC);
    expect(botao().disabled).to.be.true;
    expect(aviso()).to.equal('O tipo deste documento não permite a alteração dos dados básicos.');
  });
});
