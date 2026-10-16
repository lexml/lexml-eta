import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, buildContent } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { ProjetoNorma } from '../../../src/model/lexml/documento/projetoNorma';

const URN_PL = 'urn:lex:br:senado.federal:projeto.lei;pl:9999;999999';
const URN_PRS = 'urn:lex:br:senado.federal:projeto.resolucao;prs:9999;999999';
const URN_LEI = 'urn:lex:br:federal:lei:2020-01-01;1';
const DECRETA = 'O CONGRESSO NACIONAL decreta:';

// Sem parágrafos o preâmbulo vem vazio; o documento padrão traz um parágrafo com conteúdo vazio.
const documentoCom = (urn: string, preambulo?: string[]): any => {
  const documento = JSON.parse(JSON.stringify(DOCUMENTO_PADRAO));
  documento.value.metadado.identificacao.urn = urn;
  if (preambulo) {
    documento.value.projetoNorma.norma.parteInicial.preambulo.p = preambulo.map(texto => ({ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] }));
  }
  return documento;
};

const carregar = (urn: string, preambulo?: string[], preservarTexto = false): ProjetoNorma => buildProjetoNormaFromJsonix(documentoCom(urn, preambulo), preservarTexto);

describe('Carga do preâmbulo como dispositivo', () => {
  it('cria o dispositivo bloqueado, do tipo Preambulo, ligado à articulação', () => {
    const projetoNorma = carregar(URN_PL, ['Preâmbulo do documento:']);
    const preambulo = projetoNorma.preambulo!;
    expect(preambulo.tipo).to.equal('Preambulo');
    expect(preambulo.id).to.equal('preambulo');
    expect(preambulo.rotulo).to.equal('');
    expect(preambulo.bloqueado).to.be.true;
    expect(preambulo.pai).to.equal(projetoNorma.articulacao);
    expect(projetoNorma.articulacao!.projetoNorma!.preambulo).to.equal(preambulo);
  });

  it('o preâmbulo preenchido prevalece sobre o texto padrão', () => {
    expect(carregar(URN_PL, ['Outro texto:']).preambulo!.texto).to.equal('Outro texto:');
  });

  it('aplica o texto padrão do tipo quando o preâmbulo tem conteúdo vazio', () => {
    expect(carregar(URN_PL).preambulo!.texto).to.equal(DECRETA);
    expect(carregar(URN_PL, ['']).preambulo!.texto).to.equal(DECRETA);
  });

  it('aplica o texto padrão quando o preâmbulo não tem parágrafos', () => {
    expect(carregar(URN_PL, []).preambulo!.texto).to.equal(DECRETA);
  });

  it('o texto padrão do projeto de resolução depende da autoridade', () => {
    expect(carregar(URN_PRS).preambulo!.texto).to.equal('O SENADO FEDERAL resolve:');
  });

  it('o texto padrão também é aplicado na abertura de arquivo (texto preservado)', () => {
    expect(carregar(URN_PL, undefined, true).preambulo!.texto).to.equal(DECRETA);
  });

  it('não cria o preâmbulo quando vazio e o tipo não tem texto padrão', () => {
    expect(carregar(URN_LEI).preambulo).to.be.undefined;
    expect(carregar(URN_LEI, ['']).preambulo).to.be.undefined;
  });

  it('norma com preâmbulo preenchido o exibe', () => {
    expect(carregar(URN_LEI, ['O PRESIDENTE DA REPÚBLICA faz saber:']).preambulo!.texto).to.equal('O PRESIDENTE DA REPÚBLICA faz saber:');
  });

  it('preserva os parágrafos de um preâmbulo com mais de um parágrafo', () => {
    expect(carregar(URN_PL, ['Primeiro:', 'Segundo.'], true).preambulo!.texto).to.equal('<p>Primeiro:</p><p>Segundo.</p>');
  });
});

describe('Serialização do preâmbulo', () => {
  const parteInicialSalva = (projetoNorma: ProjetoNorma, urn: string): any => criarDocumentoArticulado(projetoNorma, urn).value.projetoNorma.norma.parteInicial;

  it('grava o texto padrão aplicado', () => {
    const parteInicial = parteInicialSalva(carregar(URN_PL, undefined, true), URN_PL);
    expect(parteInicial.preambulo.p.length).to.equal(1);
    expect(buildContent(parteInicial.preambulo.p[0].content)).to.equal(DECRETA);
  });

  it('o texto padrão gravado é lido de volta como o mesmo preâmbulo', () => {
    const salvo = criarDocumentoArticulado(carregar(URN_PL, undefined, true), URN_PL);
    expect(buildProjetoNormaFromJsonix(salvo, true).preambulo!.texto).to.equal(DECRETA);
  });

  it('preserva dois parágrafos do preâmbulo ao salvar', () => {
    const parteInicial = parteInicialSalva(carregar(URN_PL, ['Primeiro:', 'Segundo.'], true), URN_PL);
    expect(parteInicial.preambulo.p.map((p: any) => buildContent(p.content))).to.deep.equal(['Primeiro:', 'Segundo.']);
  });

  it('grava o preâmbulo vazio quando não há preâmbulo nem texto padrão', () => {
    const parteInicial = parteInicialSalva(carregar(URN_LEI, undefined, true), URN_LEI);
    expect(parteInicial.preambulo.p.map((p: any) => buildContent(p.content)).join('')).to.equal('');
  });
});
