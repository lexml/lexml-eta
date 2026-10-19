import { expect } from '@open-wc/testing';
import { executeServerCommand } from '@web/test-runner-commands';
import { criarDocumentoArticulado, DadosLexEdit, DocumentoArticulado, lerDocumentoArticulado } from '../../src/model/lexml/documento/documentoArticulado';
import { buildProjetoNormaFromJsonix, lerIdsRemissoesInvalidas, lerMetadadoLexEdit } from '../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { novoDocumentoArticulado, novoDocumentoComTextoLiteral } from '../doc/documentoArticulado';
import { MPV_885_2019 } from '../assets/mpv_885_2019';
import { lerJustificacao } from '../../src/model/lexml/documento/conversor/justificacao';
import { Artigo } from '../../src/model/dispositivo/dispositivo';

describe('Documento articulado — conversor Jsonix real e XSD LexML', () => {
  for (const [nome, entrada] of [
    ['proposição provisória', novoDocumentoArticulado()],
    ['norma com alterações e remissões', MPV_885_2019],
    ['texto literal', novoDocumentoComTextoLiteral()],
  ] as const) {
    it('valida e reabre ' + nome, async () => {
      const modelo = buildProjetoNormaFromJsonix(entrada, true);
      const salvo = criarDocumentoArticulado(modelo, modelo.urn!);
      const retorno = await executeServerCommand<{ xml: string; jsonix: unknown }, unknown>('validar-documento-lexml', salvo);
      expect(retorno.xml).to.include('<LexML');
      const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
      expect(criarDocumentoArticulado(reaberto, reaberto.urn!)).to.deep.equal(salvo);
    });
  }

  it('comprova que o XSD rejeita um documento estruturalmente inválido', async () => {
    const entrada = novoDocumentoArticulado();
    delete entrada.value.metadado.identificacao;
    const retorno = await executeServerCommand<{ valido: boolean; erro: string }, unknown>('validar-documento-lexml', entrada);
    expect(retorno.valido).to.equal(false);
    expect(retorno.erro).to.include('Identificacao');
  });

  // Documento com uma remissão interna inválida no caput do art. 1º; devolve também o id persistido.
  const documentoComRemissaoInvalida = (dados?: DadosLexEdit): { salvo: DocumentoArticulado; idPersistido: string } => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const caput = (modelo.articulacao!.filhos[0] as Artigo).caput!;
    const textoRef = 'educação';
    const remissoes: Record<number, any[]> = {
      [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }],
    };
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, remissoes, undefined, dados);
    return { salvo, idPersistido: remissoes[caput.uuid!][0].idPersistido };
  };

  it('remissão interna inválida: RemissoesInternasInvalidas e Pendencias vão e voltam pelo CLI', async () => {
    const { salvo, idPersistido } = documentoComRemissaoInvalida();

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.match(new RegExp(`<Remissao[^>]*xlink:href="artInexistente"[^>]*id="${idPersistido}"`));
    expect(retorno.xml).to.include(`<lexedit:RemissoesInternasInvalidas refIdsRemissoesInternas="${idPersistido}"/>`);
    expect(retorno.xml).to.include('<lexedit:Pendencias><lexedit:Pendencia>Corrigir remissões internas inválidas.</lexedit:Pendencia></lexedit:Pendencias>');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
    expect(lerIdsRemissoesInvalidas(retorno.jsonix)).to.deep.equal([idPersistido]);
  });

  it('pendência de justificação e de remissão vão e voltam pelo CLI, na ordem', async () => {
    const { salvo } = documentoComRemissaoInvalida({ pendencias: ['Não foi informado um texto de justificação.'] });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include(
      '<lexedit:Pendencias><lexedit:Pendencia>Não foi informado um texto de justificação.</lexedit:Pendencia><lexedit:Pendencia>Corrigir remissões internas inválidas.</lexedit:Pendencia></lexedit:Pendencias>'
    );
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
    expect(lerMetadadoLexEdit(retorno.jsonix)).to.not.have.property('pendencias');
  });

  it('valida e reabre um documento com opções de impressão', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const opcoesImpressao = { imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 16 };
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { opcoesImpressao });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<lexedit:OpcoesImpressao imprimirBrasao="false" textoCabecalho="Gabinete do Senador" reduzirEspacoEntreLinhas="true" tamanhoFonte="16"/>');
    const dados = lerMetadadoLexEdit(retorno.jsonix);
    expect(dados).to.deep.equal({ opcoesImpressao });
    const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
  });

  for (const [caso, data, texto] of [
    ['com data', '2026-04-24', 'Sala da comissão, 24 de abril de 2026.'],
    ['sem data', undefined, 'Sala da comissão,'],
  ] as const) {
    it(`valida e reabre um documento com local e data do fecho (${caso})`, async () => {
      const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
      const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { local: 'Sala da comissão', ...(data && { data }) });

      const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

      expect(retorno.valido, retorno.erro).to.equal(true);
      expect(retorno.xml).to.include(`<ParteFinal><LocalDataFecho><p>${texto}</p></LocalDataFecho></ParteFinal>`);
      const dados = lerMetadadoLexEdit(retorno.jsonix);
      expect(dados).to.deep.equal({ local: 'Sala da comissão', ...(data && { data }) });
      const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
      expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
    });
  }

  it('os quatro grupos do LexEdit no mesmo documento vão e voltam pelo CLI', async () => {
    const opcoesImpressao = { imprimirBrasao: true, textoCabecalho: 'Liderança', reduzirEspacoEntreLinhas: false, tamanhoFonte: 12 };
    const { salvo, idPersistido } = documentoComRemissaoInvalida({ local: 'Sala das sessões', data: '2026-05-01', opcoesImpressao });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<lexedit:Metadado local="Sala das sessões" data="2026-05-01">');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
    expect(lerMetadadoLexEdit(retorno.jsonix)).to.deep.equal({ local: 'Sala das sessões', data: '2026-05-01', opcoesImpressao });
    expect(lerIdsRemissoesInvalidas(retorno.jsonix)).to.deep.equal([idPersistido]);
  });

  it('a justificação vai e volta pelo CLI e valida no XSD', async () => {
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    // HTML no formato de `texto` do editor da justificação.
    const justificacao =
      '<p class="align-justify">Texto <strong>negrito</strong> <em>itálico</em>, <u>sublinhado</u>, x<sup>2</sup>, A &amp; B e <a href="https://www.congressonacional.leg.br" rel="noopener noreferrer" target="_blank">site</a>.</p>' +
      '<ul><li>um</li><li class="indent-1">dois</li></ul><ol><li>a</li></ol><p><br></p>' +
      '<table table_id="t1" border="1" style="width:80%"><tbody><tr row_id="r1">' +
      '<td class="td-q" table_id="t1" row_id="r1" cell_id="c1" width="40%"><p class="align-center">1</p><p>2</p></td>' +
      '<td class="td-q" table_id="t1" row_id="r1" cell_id="c2" colspan="2" rowspan="1"><p>3</p></td></tr>' +
      '<tr row_id="r2"><td class="td-q" table_id="t1" row_id="r2" cell_id="c3"><p><br></p></td></tr></tbody></table>' +
      `<img src="${png}" width="50%"><p class="ql-text-indent-0px">fim</p>`;
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { justificacao });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<Justificacao><PartePrincipal>');
    expect(retorno.xml).to.include('<table border="1" id="_tabela1" style="width: 80%">');
    // O editor troca `ql-indent` por `indent` ao ler o Quill; o leitor devolve `ql-indent`.
    const lida = lerJustificacao(retorno.jsonix).replace(/ql-indent/g, 'indent');
    const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, { justificacao: lida })).to.deep.equal(salvo);
  });

  // Com lexml-simples.xsd sozinho este valor passaria: o conteúdo do xsd:any lax não seria checado.
  it('o XSD detecta valor inválido dentro de lexedit:Metadado', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const opcoesImpressao = { imprimirBrasao: true, textoCabecalho: '', reduzirEspacoEntreLinhas: false, tamanhoFonte: 0 };
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { opcoesImpressao });

    const retorno = await executeServerCommand<{ valido: boolean; erro: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido).to.equal(false);
    expect(retorno.erro).to.include('positiveInteger');
  });
});
