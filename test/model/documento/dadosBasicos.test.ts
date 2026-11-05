import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { aplicarDadosBasicos, ContextoDadosBasicos, DadosBasicos } from '../../../src/model/lexml/documento/dadosBasicos';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';
import { Autoria, ColegiadoApreciador } from '../../../src/model/proposicao/proposicao';
import { lexeditSalvo, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const URN_PL_SF = 'urn:lex:br:senado.federal:projeto.lei;pls:9999;999999';
const URN_PLP_SF = 'urn:lex:br:senado.federal:projeto.lei.complementar;plp:2026;999999';
const URN_PLV = 'urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999';
const URN_MPV = 'urn:lex:br:federal:medida.provisoria:2026;1200';
const ULTIMA_MODIFICACAO = '2026-10-01T10:00:00-03:00';

const autoria = (): Autoria => ({
  ...new Autoria(),
  imprimirPartidoUF: true,
  parlamentares: [{ identificacao: '1111', nome: 'Davi Alcolumbre', sexo: 'M', siglaPartido: 'UNIÃO', siglaUF: 'AP', siglaCasaLegislativa: 'SF', cargo: '' }],
});

const salvarCompleto = (): any => {
  const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);
  return criarDocumentoArticulado(modelo, URN_PL_SF, undefined, undefined, {
    anexoParecer: false,
    dataUltimaModificacao: ULTIMA_MODIFICACAO,
    local: 'Sala das Sessões',
    data: '2026-10-01',
    autoria: autoria(),
    colegiadoApreciador: { siglaCasaLegislativa: 'SF', tipoColegiado: 'Plenário' },
    outrosMetadados: { chave: 'valor' },
    justificacao: '<p>Justifica.</p>',
  });
};

const dadosBasicos = (parcial: Partial<DadosBasicos> = {}): DadosBasicos => ({
  urn: URN_PL_SF,
  epigrafe: 'PROJETO DE LEI Nº   , DE 9999',
  preambulo: 'O CONGRESSO NACIONAL decreta:',
  colegiadoApreciador: { siglaCasaLegislativa: 'SF', tipoColegiado: 'Plenário' },
  anexoParecer: false,
  ...parcial,
});

const contexto = (parcial: Partial<ContextoDadosBasicos> = {}): ContextoDadosBasicos => ({
  urnAtual: URN_PL_SF,
  anexoParecerAtual: false,
  dataUltimaModificacao: ULTIMA_MODIFICACAO,
  ...parcial,
});

const norma = (documento: any): any => documento.value.projetoNorma.norma;

describe('Aplicação dos dados básicos ao documento serializado', () => {
  before(() => inicializarVocabulario('SF'));
  after(() => inicializarVocabulario('SF'));

  it('não altera o documento original', () => {
    const original = salvarCompleto();
    const copia = JSON.parse(JSON.stringify(original));
    aplicarDadosBasicos(original, dadosBasicos({ urn: URN_PLP_SF }), contexto());
    expect(original).to.deep.equal(copia);
  });

  it('troca urn, referência, epígrafe, preâmbulo, colegiado e outros metadados', () => {
    const novo = aplicarDadosBasicos(
      salvarCompleto(),
      dadosBasicos({
        urn: URN_PLV,
        urnDocumentoReferenciado: URN_MPV,
        epigrafe: 'PROJETO DE LEI DE CONVERSÃO Nº   , DE 2026',
        preambulo: 'O CONGRESSO NACIONAL decreta:',
        colegiadoApreciador: { siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' },
        outrosMetadados: { outra: 'coisa' },
      }),
      contexto()
    );
    const lexedit = lexeditSalvo(novo);
    expect(novo.value.metadado.identificacao.urn).to.equal(URN_PLV);
    expect(lexedit.urnDocumentoReferenciado).to.equal(URN_MPV);
    expect(lexedit.colegiadoApreciador).to.include({ tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
    expect(lexedit.outrosMetadados.outroMetadado.map((o: any) => [o.chave, o.value])).to.deep.equal([['outra', 'coisa']]);
    expect(norma(novo).parteInicial.epigrafe.content).to.deep.equal(['PROJETO DE LEI DE CONVERSÃO Nº   , DE 2026']);
    expect(norma(novo).parteInicial.preambulo.p[0].content).to.deep.equal(['O CONGRESSO NACIONAL decreta:']);
  });

  it('remove a referência e os outros metadados quando não informados', () => {
    const original = salvarCompleto();
    lexeditSalvo(original).urnDocumentoReferenciado = URN_MPV;
    const lexedit = lexeditSalvo(aplicarDadosBasicos(original, dadosBasicos(), contexto()));
    expect(lexedit).not.to.have.property('urnDocumentoReferenciado');
    expect(lexedit).not.to.have.property('outrosMetadados');
  });

  it('descarta o local do fecho, mantendo a data, e preserva a data da última modificação original', () => {
    const novo = aplicarDadosBasicos(salvarCompleto(), dadosBasicos(), contexto({ dataUltimaModificacao: '2026-01-01T00:00:00-03:00' }));
    const lexedit = lexeditSalvo(novo);
    expect(lexedit).not.to.have.property('local');
    expect(lexedit.data).to.equal('2026-10-01');
    expect(norma(novo).parteFinal.localDataFecho).to.be.undefined;
    expect(lexedit.dataUltimaModificacao).to.equal('2026-01-01T00:00:00-03:00');
  });

  it('sem data original, remove a data da última modificação', () => {
    const lexedit = lexeditSalvo(aplicarDadosBasicos(salvarCompleto(), dadosBasicos(), contexto({ dataUltimaModificacao: undefined })));
    expect(lexedit).not.to.have.property('dataUltimaModificacao');
  });

  it('anexo de parecer: sem colegiado', () => {
    const original = salvarCompleto();
    const lexedit = lexeditSalvo(aplicarDadosBasicos(original, dadosBasicos({ anexoParecer: true }), contexto()));
    expect(lexedit.anexoParecer).to.be.true;
    expect(lexedit).not.to.have.property('colegiadoApreciador');
  });

  describe('exclusões', () => {
    it('troca de casa descarta a autoria (metadado e assinaturas)', () => {
      const original = salvarCompleto();
      expect(norma(original).parteFinal.assinaturaTexto).to.have.length(1);
      const novo = aplicarDadosBasicos(original, dadosBasicos({ urn: URN_PLV, urnDocumentoReferenciado: URN_MPV }), contexto());
      expect(lexeditSalvo(novo)).not.to.have.property('autoria');
      expect(norma(novo).parteFinal).to.be.undefined;
    });

    it('mesma casa mantém a autoria e as assinaturas', () => {
      const novo = aplicarDadosBasicos(salvarCompleto(), dadosBasicos({ urn: URN_PLP_SF }), contexto());
      expect(lexeditSalvo(novo).autoria.parlamentares.parlamentar).to.have.length(1);
      expect(norma(novo).parteFinal.assinaturaTexto).to.have.length(1);
    });

    it('passar a anexo de parecer descarta a justificação', () => {
      const original = salvarCompleto();
      expect(original.value.projetoNorma.justificacao).to.not.be.undefined;
      const novo = aplicarDadosBasicos(original, dadosBasicos({ anexoParecer: true }), contexto());
      expect(novo.value.projetoNorma).not.to.have.property('justificacao');
    });

    it('sem passar a anexo de parecer, mantém a justificação', () => {
      const novo = aplicarDadosBasicos(salvarCompleto(), dadosBasicos(), contexto());
      expect(novo.value.projetoNorma.justificacao).to.not.be.undefined;
    });

    it('deixar de ser anexo de parecer não cria justificação', () => {
      const original = salvarCompleto();
      delete original.value.projetoNorma.justificacao;
      lexeditSalvo(original).anexoParecer = true;
      const novo = aplicarDadosBasicos(original, dadosBasicos({ anexoParecer: false }), contexto({ anexoParecerAtual: true }));
      expect(novo.value.projetoNorma).not.to.have.property('justificacao');
      expect(lexeditSalvo(novo).anexoParecer).to.be.false;
    });

    it('preserva a articulação e o texto', () => {
      const original = salvarCompleto();
      const novo = aplicarDadosBasicos(original, dadosBasicos({ urn: URN_PLV, urnDocumentoReferenciado: URN_MPV, anexoParecer: true }), contexto());
      expect(norma(novo).articulacao).to.deep.equal(norma(original).articulacao);
      expect(norma(novo).parteInicial.ementa).to.deep.equal(norma(original).parteInicial.ementa);
    });
  });

  it('cria o metadado do LexEdit quando o documento não o tem', () => {
    const documento = novoDocumentoArticulado();
    const novo = aplicarDadosBasicos(documento, dadosBasicos({ colegiadoApreciador: new ColegiadoApreciador() }), contexto({ dataUltimaModificacao: undefined }));
    expect(lexeditSalvo(novo).anexoParecer).to.be.false;
  });
});
