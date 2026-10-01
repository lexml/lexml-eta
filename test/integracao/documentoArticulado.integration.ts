import { expect } from '@open-wc/testing';
import { executeServerCommand } from '@web/test-runner-commands';
import { criarDocumentoArticulado, DadosLexEdit, DocumentoArticulado, lerDocumentoArticulado } from '../../src/model/lexml/documento/documentoArticulado';
import { buildProjetoNormaFromJsonix, lerIdsRemissoesInvalidas, lerMetadadoLexEdit } from '../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { novoDocumentoArticulado, novoDocumentoComTextoLiteral } from '../doc/documentoArticulado';
import { MPV_885_2019 } from '../assets/mpv_885_2019';
import { Artigo } from '../../src/model/dispositivo/dispositivo';
import { Autoria } from '../../src/model/proposicao/proposicao';

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

  for (const imprimirPartidoUF of [true, false]) {
    it(`valida e reabre um documento com autoria de parlamentares (imprimirPartidoUF ${imprimirPartidoUF})`, async () => {
      const parlamentares: any[] = [
        { identificacao: '1111', nome: 'Davi Alcolumbre', sexo: 'M', siglaPartido: 'UNIÃO', siglaUF: 'AP', siglaCasaLegislativa: 'SF', cargo: 'Presidente do Senado Federal' },
        { identificacao: '2222', nome: 'Soraya Thronicke', sexo: 'F', siglaPartido: 'PSB', siglaUF: 'MS', siglaCasaLegislativa: 'SF', cargo: '' },
        { identificacao: '3333', nome: 'Maria Silva', sexo: 'F', siglaPartido: 'PT', siglaUF: 'SP', siglaCasaLegislativa: 'CD', cargo: '' },
        { identificacao: '4444', nome: 'João Souza', sexo: 'M', siglaPartido: 'PL', siglaUF: 'RJ', siglaCasaLegislativa: 'CD', cargo: 'Líder do Partido' },
      ];
      const autoria = { ...new Autoria(), imprimirPartidoUF, parlamentares };
      const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
      const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { local: 'Sala das sessões', data: '2026-04-24', autoria });

      const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

      expect(retorno.valido, retorno.erro).to.equal(true);
      expect(retorno.xml).to.include(`<lexedit:Autoria tipo="Parlamentar" imprimirPartidoUF="${imprimirPartidoUF}">`);
      const partidoUF = imprimirPartidoUF ? '<p>(UNIÃO - AP)</p>' : '';
      expect(retorno.xml).to.include(`<AssinaturaTexto><p><b>Senador Davi Alcolumbre</b></p>${partidoUF}<p>Presidente do Senado Federal</p></AssinaturaTexto>`);
      expect(retorno.xml).to.include('<p><b>Deputada Maria Silva</b></p>');
      expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
      expect(retorno.jsonix.value.projetoNorma.norma.parteFinal).to.deep.equal((salvo.value.projetoNorma.norma as any).parteFinal);
      const dados = lerMetadadoLexEdit(retorno.jsonix);
      expect(dados.autoria).to.deep.equal(autoria);
      const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
      expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
    });
  }

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
