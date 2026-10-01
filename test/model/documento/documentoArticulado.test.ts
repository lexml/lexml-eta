import { expect } from '@open-wc/testing';
import { buildContent, buildProjetoNormaFromJsonix, lerIdsRemissoesInvalidas } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import {
  criarDocumentoArticulado,
  lerDocumentoArticulado,
  nomeArquivoDocumentoArticulado,
  serializarDocumentoArticulado,
  validarDocumentoArticulado,
} from '../../../src/model/lexml/documento/documentoArticulado';
import { buildUrnProposicao, validaUrn } from '../../../src/model/lexml/documento/urnUtil';
import { novoDocumentoArticulado, novoDocumentoComTextoLiteral, TEXTO_LITERAL } from '../../doc/documentoArticulado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { ClassificacaoDocumento } from '../../../src/model/documento/classificacao';
import { elementoReducer } from '../../../src/redux/elemento/reducer/elementoReducer';
import { ABRIR_ARTICULACAO } from '../../../src/model/lexml/acao/openArticulacaoAction';
import { completarRegistroRemissoes } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';

describe('Documento articulado — especificações 00 e 01', () => {
  for (const [numero, ano, esperado] of [
    ['', '', ':9999;999999'],
    ['', '2026', ':2026;999999'],
    ['123', '', ':9999;123'],
    ['123', '2026', ':2026;123'],
  ]) {
    it('identifica os campos desconhecidos: ' + esperado, () => {
      const urn = buildUrnProposicao('PL', numero, ano);
      expect(urn.endsWith(esperado)).to.equal(true);
      expect(validaUrn(urn)).to.equal(true);
    });
  }

  it('preserva a parte inicial completa e a articulação após salvar e reabrir', () => {
    const entrada = novoDocumentoArticulado();
    const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(entrada));
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!);
    const reaberto = lerDocumentoArticulado(serializarDocumentoArticulado(salvo));
    const inicial = reaberto.value.projetoNorma.norma.parteInicial;
    expect(buildContent(inicial.epigrafe.content)).to.equal('PROJETO <b>DE LEI</b>');
    expect(buildContent(inicial.ementa.content)).to.equal('<b>Dispõe </b><i>sobre</i> educação e saúde.');
    expect(inicial.preambulo.p.map(p => buildContent(p.content))).to.deep.equal(['O Congresso Nacional <b>decreta</b>:', 'Segundo parágrafo <i>do preâmbulo</i>.']);
    expect(reaberto.value.projetoNorma.norma.articulacao).to.deep.equal(salvo.value.projetoNorma.norma.articulacao);
    const modeloReaberto = buildProjetoNormaFromJsonix(reaberto);
    const salvoNovamente = criarDocumentoArticulado(modeloReaberto, modeloReaberto.urn!);
    expect(salvoNovamente).to.deep.equal(salvo);
    expect(salvo.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[1].value.id).to.equal('art1_par1u');
  });

  it('preserva aspas e caracteres literais sem interpretá-los como HTML', () => {
    const entrada = novoDocumentoComTextoLiteral();
    const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(entrada), true);
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!);
    const norma = salvo.value.projetoNorma.norma;
    expect(norma.parteInicial.epigrafe.content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.parteInicial.ementa.content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.parteInicial.preambulo.p[0].content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content).to.deep.equal([TEXTO_LITERAL]);
    const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(salvo), true);
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!)).to.deep.equal(salvo);
  });
  it('exporta somente identificação, parte inicial e articulação, sem modificar a origem', () => {
    const entrada = novoDocumentoArticulado();
    entrada.value.metadado.metadadoProprietario = [{ fonte: 'teste' }];
    entrada.value.projetoNorma.justificacao = [{ partePrincipal: {} }];
    const antes = JSON.stringify(entrada);
    const modelo = buildProjetoNormaFromJsonix(entrada);
    const chavesArticulacao = Object.keys(modelo.articulacao!);
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!);
    expect(Object.keys(salvo.value.metadado)).to.deep.equal(['TYPE_NAME', 'identificacao']);
    expect(Object.keys(salvo.value.projetoNorma)).to.deep.equal(['TYPE_NAME', 'norma']);
    expect(Object.keys(salvo.value.projetoNorma.norma)).to.deep.equal(['TYPE_NAME', 'parteInicial', 'articulacao']);
    expect(JSON.stringify(entrada)).to.equal(antes);
    expect(Object.keys(modelo.articulacao!)).to.deep.equal(chavesArticulacao);
  });

  it('preserva a URN definitiva completa, incluindo evento', () => {
    const entrada = novoDocumentoArticulado();
    entrada.value.metadado.identificacao.urn = 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;123@data.evento;leitura;2026-03-19t14.00';
    const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(entrada));
    expect(criarDocumentoArticulado(modelo, modelo.urn!).value.metadado.identificacao.urn).to.equal(entrada.value.metadado.identificacao.urn);
  });

  it('não compartilha objetos com o arquivo recebido', () => {
    const entrada = novoDocumentoArticulado();
    const copia = lerDocumentoArticulado(entrada);
    copia.value.metadado.identificacao.urn = 'outra';
    expect(entrada.value.metadado.identificacao.urn).not.to.equal('outra');
  });

  it('aceita JSON UTF-8 com BOM', () => {
    expect(lerDocumentoArticulado('\uFEFF' + JSON.stringify(novoDocumentoArticulado())).name.localPart).to.equal('LexML');
  });

  for (const entrada of ['{', 'null', JSON.stringify({ projetoNorma: novoDocumentoArticulado() })]) {
    it('rejeita conteúdo inválido ou o invólucro antigo: ' + entrada.slice(0, 15), () => {
      expect(() => lerDocumentoArticulado(entrada)).to.throw();
    });
  }

  it('rejeita a inversão do ano e número que o XSD anyURI não detecta', () => {
    const entrada = novoDocumentoArticulado();
    entrada.value.metadado.identificacao.urn = 'urn:lex:br:senado.federal:projeto.lei:999999;9999';
    expect(() => lerDocumentoArticulado(entrada)).to.throw('ano e número');
  });

  it('rejeita IDs duplicados antes de abrir o documento', () => {
    const entrada = novoDocumentoArticulado();
    entrada.value.projetoNorma.norma.parteInicial.ementa.id = 'epigrafe';
    expect(() => validarDocumentoArticulado(entrada)).to.throw('repetidos');
  });

  it('rejeita uma árvore incompatível antes de abrir o documento', () => {
    const entrada = novoDocumentoArticulado();
    entrada.value.projetoNorma.norma.articulacao.lXhier = {};
    expect(() => lerDocumentoArticulado(entrada)).to.throw('articulação');
  });

  it('compõe o nome do arquivo a partir de sigla, número e ano da URN', () => {
    const entrada = novoDocumentoArticulado();
    entrada.value.metadado.identificacao.urn = buildUrnProposicao('MPV', '905', '2019');
    expect(nomeArquivoDocumentoArticulado(entrada)).to.equal('documento-articulado - MPV nº 905, de 2019.json');
  });

  it('usa as sentinelas de número e ano provisórios no nome do arquivo', () => {
    const entrada = novoDocumentoArticulado();
    entrada.value.metadado.identificacao.urn = buildUrnProposicao('PL', '', '');
    expect(nomeArquivoDocumentoArticulado(entrada)).to.equal('documento-articulado - PL nº 999999, de 9999.json');
  });

  it('abrir e salvar novamente sem editar a remissão inválida preserva o mesmo id "_ri..." (especificação 10)', () => {
    const entrada = novoDocumentoArticulado();
    const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(entrada));
    const caput = (modelo.articulacao!.filhos[0] as Artigo).caput!;
    const textoRef = 'educação';

    const remissoes: Record<number, any[]> = {
      [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }],
    };

    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, remissoes);
    const idOriginal = remissoes[caput.uuid!][0].idPersistido;
    expect(idOriginal).to.match(/^_ri\d+$/);

    // Reabre o documento do zero, do JSON serializado — sem reaproveitar nenhum estado em memória.
    const reaberto = lerDocumentoArticulado(serializarDocumentoArticulado(salvo));
    const modeloReaberto = buildProjetoNormaFromJsonix(reaberto);
    const idsRemissoesInvalidas = lerIdsRemissoesInvalidas(reaberto);

    const estado = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: modeloReaberto.articulacao!,
      classificacao: ClassificacaoDocumento.NORMA,
      idsRemissoesInvalidas,
    });

    const registroCompleto = completarRegistroRemissoes(estado.articulacao!, estado.remissoes ?? {});
    const salvoNovamente = criarDocumentoArticulado(estado.articulacao!.projetoNorma!, modeloReaberto.urn!, registroCompleto);

    const getRemissaoId = (doc: any): string => {
      const content = doc.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content;
      return content.find((c: any) => c?.name?.localPart === 'Remissao').value.id;
    };

    expect(getRemissaoId(salvoNovamente)).to.equal(idOriginal);
  });
});
