import { expect } from '@open-wc/testing';
import { executeServerCommand } from '@web/test-runner-commands';
import { criarDocumentoArticulado, DadosLexEdit, DocumentoArticulado, lerDocumentoArticulado } from '../../src/model/lexml/documento/documentoArticulado';
import {
  buildProjetoNormaFromJsonix,
  lerIdsRemissoesInvalidas,
  lerMetadadoLexEdit,
  lerSituacaoNaNormaVigente,
} from '../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { aplicarSituacaoNaNormaVigente } from '../../src/model/lexml/documento/conversor/situacaoNaNormaVigente';
import { createAlteracao, criaDispositivo } from '../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../src/model/lexml/tipo/tipoDispositivo';
import { novoDocumentoArticulado, novoDocumentoComTextoLiteral } from '../doc/documentoArticulado';
import { MPV_885_2019 } from '../assets/mpv_885_2019';
import { Artigo } from '../../src/model/dispositivo/dispositivo';
import { Autoria, ColegiadoApreciador, MimeType } from '../../src/model/proposicao/proposicao';
import { MPV_905_2019 } from '../doc/mpv_905_2019';
import { MPV_1234_2024 } from '../doc/mpv_1234_2024';
import { RENUMERAR_ELEMENTO } from '../../src/model/lexml/acao/renumerarElementoAction';
import { State } from '../../src/redux/state';
import { Elemento } from '../../src/model/elemento';
import { createElemento } from '../../src/model/elemento/elementoUtil';
import { RevisaoElemento } from '../../src/model/revisao/revisao';
import { isRevisaoPrincipal } from '../../src/redux/elemento/util/revisaoUtil';
import { buscaDispositivoById, getDispositivoAndFilhosAsLista } from '../../src/model/lexml/hierarquia/hierarquiaUtil';
import { elementoReducer } from '../../src/redux/elemento/reducer/elementoReducer';
import { ClassificacaoDocumento } from '../../src/model/documento/classificacao';
import { buildJsonixArticulacaoFromProjetoNorma } from '../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { montaRevisoesArticulacao } from '../../src/model/lexml/documento/conversor/revisaoArticulacao';
import { reconstroiRevisoes } from '../../src/model/lexml/documento/conversor/reconstroiRevisoes';
import { aplicarRevisoesAction } from '../../src/model/lexml/acao/aplicarRevisoes';
import { ABRIR_ARTICULACAO } from '../../src/model/lexml/acao/openArticulacaoAction';
import { ATIVAR_DESATIVAR_REVISAO } from '../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_USUARIO } from '../../src/model/lexml/acao/atualizarUsuarioAction';
import { ADICIONAR_ELEMENTO } from '../../src/model/lexml/acao/adicionarElementoAction';
import { REMOVER_ELEMENTO } from '../../src/model/lexml/acao/removerElementoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../src/model/lexml/acao/atualizarTextoElementoAction';
import { MOVER_ELEMENTO_ABAIXO } from '../../src/model/lexml/acao/moverElementoAbaixoAction';
import { TAB } from '../../src/model/lexml/acao/tabAction';
import { REJEITAR_REVISAO } from '../../src/model/lexml/acao/rejeitarRevisaoAction';
import { alterarRotuloPenaAction } from '../../src/model/lexml/acao/penaAction';
import { LEXML_COM_PENAS } from '../doc/pena/lexml-com-penas';
import { adicionarTituloDispositivoAction, editarTituloDispositivoAction, removerTituloDispositivoAction } from '../../src/model/lexml/acao/atualizarTituloDispositivoAction';

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

  it('modo de anexo de parecer e documento referenciado vão e voltam pelo CLI', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const urnDocumentoReferenciado = 'urn:lex:br:senado.federal:projeto.lei;pl:2025;10';
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { anexoParecer: true, urnDocumentoReferenciado });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.match(/<lexedit:Metadado[^>]*urnDocumentoReferenciado="urn:lex:br:senado.federal:projeto.lei;pl:2025;10"[^>]*anexoParecer="true"/);
    const dados = lerMetadadoLexEdit(retorno.jsonix);
    expect(dados).to.deep.equal({ anexoParecer: true, urnDocumentoReferenciado });
    const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
  });

  it('documento de tipo não suportado grava a pendência de documento não suportado', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const salvo = criarDocumentoArticulado(modelo, 'urn:lex:br:federal:medida.provisoria;mpv:2026;1', undefined, undefined, { anexoParecer: false });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<lexedit:Pendencia>Este tipo de documento não é completamente suportado pelo editor.</lexedit:Pendencia>');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
  });

  it('modo normal grava anexoParecer="false" e omite o documento referenciado', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { anexoParecer: false });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('anexoParecer="false"');
    expect(retorno.xml).not.to.include('urnDocumentoReferenciado');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
  });

  for (const [caso, data, texto] of [
    ['com data', '2026-04-24', 'Sala da Comissão, 24 de abril de 2026.'],
    ['sem data', undefined, 'Sala da Comissão,'],
  ] as const) {
    it(`valida e reabre um documento com local e data do fecho (${caso})`, async () => {
      const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
      const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { local: 'Sala da Comissão', ...(data && { data }) });

      const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

      expect(retorno.valido, retorno.erro).to.equal(true);
      expect(retorno.xml).to.include(`<ParteFinal><LocalDataFecho><p>${texto}</p></LocalDataFecho></ParteFinal>`);
      const dados = lerMetadadoLexEdit(retorno.jsonix);
      expect(dados).to.deep.equal({ local: 'Sala da Comissão', ...(data && { data }) });
      const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
      expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
    });
  }

  it('os quatro grupos do LexEdit no mesmo documento vão e voltam pelo CLI', async () => {
    const opcoesImpressao = { imprimirBrasao: true, textoCabecalho: 'Liderança', reduzirEspacoEntreLinhas: false, tamanhoFonte: 12 };
    const { salvo, idPersistido } = documentoComRemissaoInvalida({ local: 'Sala das Sessões', data: '2026-05-01', opcoesImpressao });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<lexedit:Metadado local="Sala das Sessões" data="2026-05-01">');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
    expect(lerMetadadoLexEdit(retorno.jsonix)).to.deep.equal({ local: 'Sala das Sessões', data: '2026-05-01', opcoesImpressao });
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
      const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { local: 'Sala das Sessões', data: '2026-04-24', autoria });

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

  // Artigo com bloco de alteração de dois artigos (art5 existente, art6 novo); sem o parágrafo único, que a leitura descarta.
  const modeloComBlocoDeAlteracao = (): any => {
    const documento = novoDocumentoArticulado();
    documento.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis.pop();
    const modelo: any = buildProjetoNormaFromJsonix(lerDocumentoArticulado(documento), true);
    const artigo = modelo.articulacao.filhos[0] as Artigo;
    createAlteracao(artigo);
    const novoArtigoNoBloco = (numero: number, existe: boolean): void => {
      const a = criaDispositivo(artigo.alteracoes!, TipoDispositivo.artigo.tipo) as Artigo;
      a.isDispositivoAlteracao = true;
      a.id = `art1_cpt_alt1_art${numero}`;
      a.rotulo = `Art. ${numero}º`;
      a.createNumeroFromRotulo(a.rotulo);
      a.caput!.texto = 'Texto do artigo.';
      a.existeNaNormaAlterada = existe;
    };
    novoArtigoNoBloco(5, true);
    novoArtigoNoBloco(6, false);
    return modelo;
  };

  it('valida e reabre um documento com situação na norma vigente e colegiado apreciador', async () => {
    const modelo = modeloComBlocoDeAlteracao();
    const colegiadoApreciador = { siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' } as ColegiadoApreciador;
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { colegiadoApreciador });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<lexedit:SituacaoNaNormaVigente refIdsDispositivosExistentes="art1_cpt_alt1_art5" refIdsDispositivosNovos="art1_cpt_alt1_art6"/>');
    expect(retorno.xml).to.include('<lexedit:ColegiadoApreciador siglaCasaLegislativa="SF" tipoColegiado="Comissão" siglaComissao="CCJ"/>');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
    expect(lerSituacaoNaNormaVigente(retorno.jsonix)).to.deep.equal({ existentes: ['art1_cpt_alt1_art5'], novos: ['art1_cpt_alt1_art6'] });
    const dados = lerMetadadoLexEdit(retorno.jsonix);
    expect(dados.colegiadoApreciador).to.deep.equal(colegiadoApreciador);

    const reaberto: any = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
    aplicarSituacaoNaNormaVigente(reaberto.articulacao, lerSituacaoNaNormaVigente(retorno.jsonix));
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
  });

  it('valida e reabre um documento com outros metadados', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const outrosMetadados = { tituloAntesDaEpigrafe: 'COMISSÃO XPTO', jsonDadosComissao: '{"id":1,"nome":"A & B <C> \\"d\\""}', vazio: '' };
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { outrosMetadados });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<lexedit:OutroMetadado chave="tituloAntesDaEpigrafe">COMISSÃO XPTO</lexedit:OutroMetadado>');
    expect(retorno.xml).to.include('A &amp; B &lt;C>');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
    const dados = lerMetadadoLexEdit(retorno.jsonix);
    expect(dados.outrosMetadados).to.deep.equal(outrosMetadados);
    const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
  });

  it('valida e reabre um documento com anexos', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const anexos = [
      { idArquivo: 'f669f339-4c8c', nomeArquivo: 'Parecer da Comissão.pdf', nomeDocumento: 'Parecer "da" Comissão', tipo: 'substitutivo', mimeType: MimeType.PDF },
      { idArquivo: 'id-2', nomeArquivo: 'Emenda Nº 4 & CCJ.docx', nomeDocumento: 'Emenda Nº 4 & CCJ <final>', tipo: 'nao.informado', mimeType: MimeType.DOCX },
      { idArquivo: 'id-3', nomeArquivo: 'Relatório.pdf', nomeDocumento: "Relatório d'água", tipo: 'emenda', mimeType: MimeType.PDF },
    ];
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { anexos });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<lexedit:Anexo idArquivo="id-2" nomeArquivo="Emenda Nº 4 &amp; CCJ.docx" nomeDocumento="Emenda Nº 4 &amp; CCJ &lt;final>"');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
    const dados = lerMetadadoLexEdit(retorno.jsonix);
    expect(dados.anexos).to.deep.equal(anexos);
    const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
  });

  it('o XSD exige os cinco atributos de lexedit:Anexo', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, {
      anexos: [{ idArquivo: 'id-1', nomeArquivo: 'A.pdf', nomeDocumento: 'A', tipo: 'nao.informado', mimeType: MimeType.PDF }],
    });
    delete (salvo.value.metadado.metadadoProprietario![0].any[0].value.anexos as any).anexo[0].mimeType;

    const retorno = await executeServerCommand<{ valido: boolean; erro: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido).to.equal(false);
    expect(retorno.erro).to.include('mimeType');
  });

  it('o XSD rejeita chave repetida em lexedit:OutrosMetadados', async () => {
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { outrosMetadados: { a: '1', b: '2' } });
    const pares = (salvo.value.metadado.metadadoProprietario![0].any[0].value.outrosMetadados as any).outroMetadado;
    pares[1].chave = 'a';

    const retorno = await executeServerCommand<{ valido: boolean; erro: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido).to.equal(false);
    expect(retorno.erro).to.include('chaveOutroMetadadoUnica');
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

describe('Documento articulado — revisões da hierarquia pelo CLI real e XSD', () => {
  const URN = 'urn:lex:br:senado.federal:projeto.lei:2026;1';
  type Resultado = { valido: boolean; xml: string; jsonix: any; erro?: string };

  const elemento = (s: State, id: string): Elemento => createElemento(buscaDispositivoById(s.articulacao!, id)!);
  const principais = (s: State): RevisaoElemento[] => s.revisoes!.filter(isRevisaoPrincipal) as RevisaoElemento[];
  // A ordem das revisões principais não é preservada (criação na sessão, ordem do documento ao reabrir).
  const resumo = (s: State): string[] =>
    principais(s)
      .map(r => JSON.stringify({ operacoes: r.revisao, stateType: r.stateType, tipo: r.elementoAposRevisao.tipo, usuario: r.usuario?.nome }))
      .sort();
  const json = (s: State): string => JSON.stringify(buildJsonixArticulacaoFromProjetoNorma(s.articulacao!));
  const abreArticulacao = (documento: unknown): State => {
    const projetoNorma = buildProjetoNormaFromJsonix(documento, true);
    return elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  };

  // Em ordem decrescente de artigo, para que as exclusões e movimentações não desloquem os ids usados nas operações seguintes.
  const sessaoComAsCincoOperacoes = (): State => {
    let s = elementoReducer(undefined, {
      type: ABRIR_ARTICULACAO,
      articulacao: buildProjetoNormaFromJsonix(MPV_905_2019).articulacao!,
      classificacao: ClassificacaoDocumento.PROJETO,
    });
    s = elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
    s = elementoReducer(s, { type: ATIVAR_DESATIVAR_REVISAO });
    s = elementoReducer(s, { type: TAB, atual: elemento(s, 'art9_cpt_inc3') });
    s = elementoReducer(s, { type: MOVER_ELEMENTO_ABAIXO, atual: elemento(s, 'art6_cpt_inc1') });
    const alterado = elemento(s, 'art6_cpt_inc2');
    alterado.conteudo!.texto = 'texto do movido, alterado;';
    s = elementoReducer(s, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: alterado });
    s = elementoReducer(s, { type: REMOVER_ELEMENTO, atual: elemento(s, 'art2') });
    const textoAlterado = elemento(s, 'art1_par1u_inc1');
    textoAlterado.conteudo!.texto = 'texto alterado;';
    s = elementoReducer(s, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: textoAlterado });
    return elementoReducer(s, { type: ADICIONAR_ELEMENTO, atual: elemento(s, 'art1_par1u_inc4'), novo: { tipo: 'Inciso' } });
  };

  it('as cinco operações (e uma combinada) vão e voltam pelo CLI, com revisoesArticulacao e usuarios iguais', async () => {
    const sessao = sessaoComAsCincoOperacoes();
    const grupo = montaRevisoesArticulacao(sessao)!;
    const salvo = criarDocumentoArticulado(sessao.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: grupo });

    const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    ['adicionado', 'alterado', 'excluido', 'movido;', 'transformado;inciso'].forEach(operacao => expect(retorno.xml).to.include(`revisao="${operacao}`));
    expect(retorno.xml).to.match(/revisao="movido;\d+,alterado"/);
    expect(retorno.xml).to.include('<lexedit:Usuario idUsuario="sf:fulano" nome="Fulano de Tal" sigla="FT"/>');
    expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
  });

  it('o documento reaberto a partir do retorno do CLI reconstrói as mesmas revisões e rejeitá-las dá o mesmo resultado', async () => {
    const sessao = sessaoComAsCincoOperacoes();
    const salvo = criarDocumentoArticulado(sessao.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: montaRevisoesArticulacao(sessao)! });
    const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);
    expect(retorno.valido, retorno.erro).to.equal(true);

    const aberto = abreArticulacao(lerDocumentoArticulado(retorno.jsonix));
    const lidas = lerMetadadoLexEdit(retorno.jsonix).revisoesLidas!;
    const reaberto = elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas)));

    expect(resumo(reaberto)).to.deep.equal(resumo(sessao));
    expect(json(reaberto)).to.equal(json(sessao));
    const rejeitada = (s: State): string => json(elementoReducer(s, { type: REJEITAR_REVISAO }));
    expect(rejeitada(reaberto)).to.equal(rejeitada(sessao));
  });

  it('o XSD rejeita uma revisão sem o atributo obrigatório revisao', async () => {
    const sessao = sessaoComAsCincoOperacoes();
    const grupo = montaRevisoesArticulacao(sessao)!;
    delete (grupo.revisoesArticulacao.revisaoArticulacao[0] as Record<string, unknown>).revisao;
    const salvo = criarDocumentoArticulado(sessao.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: grupo });

    const retorno = await executeServerCommand<{ valido: boolean; erro: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido).to.equal(false);
    expect(retorno.erro).to.include('revisao');
  });

  describe('alteracaoRotulo (MPV 1234/2024)', () => {
    const ART4 = 'art1_cpt_alt1_art4';

    // Parágrafo 4 renumerado para 9 (só rótulo) e parágrafo 5 renumerado para 8 e com o texto alterado (rótulo e texto).
    const sessaoComRenumeracoes = (): State => {
      let s = elementoReducer(undefined, {
        type: ABRIR_ARTICULACAO,
        articulacao: buildProjetoNormaFromJsonix(MPV_1234_2024).articulacao!,
        classificacao: ClassificacaoDocumento.PROJETO,
      });
      s = elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
      s = elementoReducer(s, { type: ATIVAR_DESATIVAR_REVISAO });
      s = elementoReducer(s, { type: RENUMERAR_ELEMENTO, atual: elemento(s, `${ART4}_par4`), novo: { numero: '9' } });
      s = elementoReducer(s, { type: RENUMERAR_ELEMENTO, atual: elemento(s, `${ART4}_par5`), novo: { numero: '8' } });
      const alterado = elemento(s, `${ART4}_par8`);
      alterado.conteudo!.texto = 'Texto revisado do parágrafo.';
      return elementoReducer(s, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: alterado });
    };

    it('a operação isolada e a combinada com alterado vão e voltam pelo CLI, com revisoesArticulacao e usuarios iguais', async () => {
      const sessao = sessaoComRenumeracoes();
      const grupo = montaRevisoesArticulacao(sessao)!;
      const salvo = criarDocumentoArticulado(sessao.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: grupo });

      const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);

      expect(retorno.valido, retorno.erro).to.equal(true);
      expect(retorno.xml).to.include(`revisao="alteracaoRotulo;${ART4}_par4"`);
      expect(retorno.xml).to.include(`revisao="alteracaoRotulo;${ART4}_par5,alterado"`);
      expect(retorno.xml).to.include('<lexedit:Usuario idUsuario="sf:fulano" nome="Fulano de Tal" sigla="FT"/>');
      expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
      expect(lerMetadadoLexEdit(retorno.jsonix).revisoesLidas).to.have.length(2);
    });

    it('o documento reaberto a partir do retorno do CLI reconstrói as mesmas revisões e rejeitá-las dá o mesmo resultado', async () => {
      const sessao = sessaoComRenumeracoes();
      const salvo = criarDocumentoArticulado(sessao.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: montaRevisoesArticulacao(sessao)! });
      const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);
      expect(retorno.valido, retorno.erro).to.equal(true);

      const aberto = abreArticulacao(lerDocumentoArticulado(retorno.jsonix));
      const lidas = lerMetadadoLexEdit(retorno.jsonix).revisoesLidas!;
      const reaberto = elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas)));

      expect(resumo(reaberto)).to.deep.equal(resumo(sessao));
      expect(json(reaberto)).to.equal(json(sessao));
      const rejeitada = (s: State): string => json(elementoReducer(s, { type: REJEITAR_REVISAO }));
      expect(rejeitada(reaberto)).to.equal(rejeitada(sessao));
    });
  });

  describe('bloco de alteração excluído, com a situação na norma vigente (MPV 1234/2024)', () => {
    const ART4 = 'art1_cpt_alt1_art4';
    const EXISTENTES = ['_art1-exc1_cpt_alt1_art4'];
    const NOVOS = ['_art1-exc1_cpt_alt1_art4_par4', '_art1-exc1_cpt_alt1_art4_par5'];

    const existe = (s: State, id: string): boolean | undefined => buscaDispositivoById(s.articulacao!, id)?.existeNaNormaAlterada;

    // O artigo art1 altera uma norma; o bloco tem um artigo "Existente" e dois parágrafos "Novo", e o art1 é excluído em revisão.
    const sessaoComExclusaoDoBloco = (): State => {
      let s = elementoReducer(undefined, {
        type: ABRIR_ARTICULACAO,
        articulacao: buildProjetoNormaFromJsonix(MPV_1234_2024).articulacao!,
        classificacao: ClassificacaoDocumento.PROJETO,
      });
      s = elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
      buscaDispositivoById(s.articulacao!, ART4)!.existeNaNormaAlterada = true;
      buscaDispositivoById(s.articulacao!, `${ART4}_par4`)!.existeNaNormaAlterada = false;
      buscaDispositivoById(s.articulacao!, `${ART4}_par5`)!.existeNaNormaAlterada = false;
      s = elementoReducer(s, { type: ATIVAR_DESATIVAR_REVISAO });
      return elementoReducer(s, { type: REMOVER_ELEMENTO, atual: elemento(s, 'art1') });
    };

    it('as listas com os ids _<id>-exc<n> vão e voltam pelo CLI', async () => {
      const sessao = sessaoComExclusaoDoBloco();
      const salvo = criarDocumentoArticulado(sessao.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: montaRevisoesArticulacao(sessao)! });

      const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);

      expect(retorno.valido, retorno.erro).to.equal(true);
      expect(retorno.xml).to.include(`<lexedit:SituacaoNaNormaVigente refIdsDispositivosExistentes="${EXISTENTES.join(' ')}" refIdsDispositivosNovos="${NOVOS.join(' ')}"/>`);
      expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
      expect(lerSituacaoNaNormaVigente(retorno.jsonix)).to.deep.equal({ existentes: EXISTENTES, novos: NOVOS });
    });

    it('o documento reaberto a partir do retorno do CLI devolve Existente/Novo ao rejeitar a exclusão', async () => {
      const sessao = sessaoComExclusaoDoBloco();
      const salvo = criarDocumentoArticulado(sessao.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: montaRevisoesArticulacao(sessao)! });
      const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);
      expect(retorno.valido, retorno.erro).to.equal(true);

      const aberto = abreArticulacao(lerDocumentoArticulado(retorno.jsonix));
      const lidas = lerMetadadoLexEdit(retorno.jsonix).revisoesLidas!;
      const reaberto = elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas, lerSituacaoNaNormaVigente(retorno.jsonix))));

      expect(principais(reaberto)).to.have.length(1);
      const rejeitado = elementoReducer(reaberto, { type: REJEITAR_REVISAO, revisao: principais(reaberto)[0] });
      expect(existe(rejeitado, ART4)).to.equal(true);
      expect(existe(rejeitado, `${ART4}_par4`)).to.equal(false);
      expect(existe(rejeitado, `${ART4}_par5`)).to.equal(false);
    });
  });

  describe('título do dispositivo em revisão (MPV 905/2019)', () => {
    const INCISOS = { adicionado: 'art1_par1u_inc1', alterado: 'art1_par1u_inc2', removido: 'art1_par1u_inc3', formatado: 'art1_par1u_inc4' };
    const ARTIGO = 'art4';
    const FORMATADO = 'Do <i>objeto</i> H<sub>2</sub>O';

    const titulo = (s: State, id: string): string | undefined => buscaDispositivoById(s.articulacao!, id)!.tituloDispositivo;
    const defineTitulo = (s: State, id: string, valor: string): State =>
      elementoReducer(s, (titulo(s, id) === undefined ? adicionarTituloDispositivoAction : editarTituloDispositivoAction).execute(elemento(s, id), valor));
    const revisaoDe = (retorno: Resultado, id: string): any =>
      retorno.jsonix.value.metadado.metadadoProprietario[0].any[0].value.revisoesArticulacao.revisaoArticulacao.find((r: any) => r.refIdDispositivo === id);

    // Os títulos "anteriores" são definidos fora de revisão; depois, em revisão, um é adicionado, dois alterados, um removido e o do artigo alterado junto com o texto.
    const sessao = (): { antes: Record<string, string | undefined>; depois: State } => {
      let s = elementoReducer(undefined, {
        type: ABRIR_ARTICULACAO,
        articulacao: buildProjetoNormaFromJsonix(MPV_905_2019).articulacao!,
        classificacao: ClassificacaoDocumento.PROJETO,
      });
      s = elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
      s = defineTitulo(s, INCISOS.alterado, 'Original');
      s = defineTitulo(s, INCISOS.removido, 'Removível');
      s = defineTitulo(s, INCISOS.formatado, FORMATADO);
      s = defineTitulo(s, ARTIGO, 'Do artigo');
      // Valores, não o estado: o reducer altera a articulação compartilhada.
      const antes = Object.fromEntries([...Object.values(INCISOS), ARTIGO].map(id => [id, titulo(s, id)]));
      s = elementoReducer(s, { type: ATIVAR_DESATIVAR_REVISAO });
      s = defineTitulo(s, INCISOS.adicionado, 'Novo título');
      s = defineTitulo(s, INCISOS.alterado, 'Alterado');
      s = elementoReducer(s, removerTituloDispositivoAction.execute(elemento(s, INCISOS.removido)));
      s = defineTitulo(s, INCISOS.formatado, 'Sem formatação');
      s = defineTitulo(s, ARTIGO, 'Artigo alterado');
      const artigo = elemento(s, ARTIGO);
      artigo.conteudo!.texto = 'texto do artigo, alterado;';
      return { antes, depois: elementoReducer(s, { type: ATUALIZAR_TEXTO_ELEMENTO, atual: artigo }) };
    };

    it('o título anterior vai no dispositivo da revisão e a revisão volta idêntica pelo CLI', async () => {
      const { depois } = sessao();
      const salvo = criarDocumentoArticulado(depois.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: montaRevisoesArticulacao(depois)! });

      const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);

      expect(retorno.valido, retorno.erro).to.equal(true);
      expect(retorno.xml).to.include('<TituloDispositivo>Original</TituloDispositivo>');
      expect(retorno.xml).to.include('<TituloDispositivo>Removível</TituloDispositivo>');
      expect(retorno.xml).to.include('<TituloDispositivo>Do <i>objeto</i> H<sub>2</sub>O</TituloDispositivo>');
      expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
      expect(revisaoDe(retorno, INCISOS.adicionado).inciso).to.not.have.property('tituloDispositivo');
      expect(revisaoDe(retorno, INCISOS.alterado).inciso.tituloDispositivo).to.exist;
    });

    it('o documento reaberto restaura os títulos anteriores, inclusive a ausência, ao rejeitar as revisões', async () => {
      const { antes, depois } = sessao();
      const salvo = criarDocumentoArticulado(depois.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: montaRevisoesArticulacao(depois)! });
      const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);
      expect(retorno.valido, retorno.erro).to.equal(true);

      const aberto = abreArticulacao(lerDocumentoArticulado(retorno.jsonix));
      const lidas = lerMetadadoLexEdit(retorno.jsonix).revisoesLidas!;
      const reaberto = elementoReducer(aberto, aplicarRevisoesAction.execute(reconstroiRevisoes(aberto.articulacao!, lidas)));
      // O reducer altera a articulação compartilhada: rejeitar só depois de conferir o estado reaberto.
      expect(resumo(reaberto)).to.deep.equal(resumo(depois));
      expect(titulo(reaberto, INCISOS.alterado)).to.equal('Alterado');
      expect(titulo(reaberto, ARTIGO)).to.equal('Artigo alterado');
      const rejeitado = elementoReducer(reaberto, { type: REJEITAR_REVISAO });
      [...Object.values(INCISOS), ARTIGO].forEach(id => expect(titulo(rejeitado, id), id).to.equal(antes[id]));
    });
  });
});

describe('Documento articulado — penas pelo CLI real e XSD', () => {
  const URN = 'urn:lex:br:senado.federal:projeto.lei:2026;1';
  type Resultado = { valido: boolean; xml: string; jsonix: any; erro?: string };

  const penasDe = (s: State): { id?: string; rotulo?: string; texto?: string }[] =>
    getDispositivoAndFilhosAsLista(s.articulacao!)
      .filter(d => d.tipo === 'Pena')
      .map(d => ({ id: d.id, rotulo: d.rotulo, texto: d.texto }));

  const abre = (documento: unknown): State => {
    const projetoNorma = buildProjetoNormaFromJsonix(documento, true);
    return elementoReducer(undefined, { type: ABRIR_ARTICULACAO, articulacao: projetoNorma.articulacao!, classificacao: ClassificacaoDocumento.PROJETO });
  };

  it('as penas do caput, do parágrafo, do inciso e do bloco de alteração vão e voltam pelo CLI, idênticas', async () => {
    const modelo = buildProjetoNormaFromJsonix(LEXML_COM_PENAS, true);
    const salvo = criarDocumentoArticulado(modelo, URN);

    const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    ['art1_cpt_pena', 'art1_par1_inc1_pena', 'art1_par1_pena', 'art2_cpt_alt1_art213_cpt_pena'].forEach(id => expect(retorno.xml).to.match(new RegExp(`<Pena[^>]* id="${id}"`)));
    const reaberto = abre(lerDocumentoArticulado(retorno.jsonix));
    expect(penasDe(reaberto)).to.deep.equal(penasDe(abre(salvo)));
    expect(penasDe(reaberto)).to.have.length(4);
    expect(criarDocumentoArticulado(reaberto.articulacao!.projetoNorma!, URN)).to.deep.equal(salvo);
  });

  // O jsonix-lexml 2.1.0 descarta, sem erro, a pena dentro de RevisaoArticulacao. O teste decide pela versão do CLI, não pelo
  // resultado: a partir do 2.2.0 exige a ida e volta completa (uma regressão que volte a descartar a pena falha); abaixo, confirma o descarte.
  it('a revisão da pena (rótulo alterado e pena excluída) é válida no XSD e depende do CLI 2.2.0 para voltar', async () => {
    let s = abre(LEXML_COM_PENAS);
    s = elementoReducer(s, { type: ATUALIZAR_USUARIO, usuario: { nome: 'Fulano de Tal', id: 'sf:fulano', sigla: 'FT' } });
    s = elementoReducer(s, { type: ATIVAR_DESATIVAR_REVISAO });
    const pena = (id: string): Elemento => createElemento(buscaDispositivoById(s.articulacao!, id)!);
    s = elementoReducer(s, alterarRotuloPenaAction.execute(pena('art1_cpt_pena'), 'Infração'));
    s = elementoReducer(s, { type: REMOVER_ELEMENTO, atual: pena('art1_par1_inc1_pena') });
    const salvo = criarDocumentoArticulado(s.articulacao!.projetoNorma!, URN, {}, {}, { revisoes: montaRevisoesArticulacao(s)! });
    const revisoesComPena = (doc: any): any[] => (doc.value.metadado.metadadoProprietario[0].any[0].value.revisoesArticulacao?.revisaoArticulacao ?? []).filter((r: any) => r.pena);
    expect(revisoesComPena(salvo), 'o editor grava a pena em RevisaoArticulacao').to.have.length(2);

    const retorno = await executeServerCommand<Resultado, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    const versao = await executeServerCommand<string, unknown>('versao-jsonix-lexml', null);
    const [maior, menor] = (/\d+\.\d+\.\d+/.exec(versao)?.[0] ?? '0.0.0').split('.').map(Number);
    if (maior > 2 || (maior === 2 && menor >= 2)) {
      expect(retorno.jsonix.value.metadado.metadadoProprietario).to.deep.equal(salvo.value.metadado.metadadoProprietario);
    } else {
      expect(revisoesComPena(retorno.jsonix), `jsonix-lexml ${versao} deveria descartar a pena`).to.have.length(0);
      // eslint-disable-next-line no-console
      console.warn('jsonix-lexml anterior ao 2.2.0: a pena dentro de RevisaoArticulacao foi descartada (esperado até a atualização do CLI).');
    }
  });
});
