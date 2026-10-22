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
import { lerJustificacao } from '../../src/model/lexml/documento/conversor/justificacao';
import { Artigo } from '../../src/model/dispositivo/dispositivo';
import { encodeHtml } from '../../src/util/string-util';
import { Autoria, ColegiadoApreciador } from '../../src/model/proposicao/proposicao';
import { MPV_905_2019 } from '../doc/mpv_905_2019';
import { MPV_1234_2024 } from '../doc/mpv_1234_2024';
import { RENUMERAR_ELEMENTO } from '../../src/model/lexml/acao/renumerarElementoAction';
import { State } from '../../src/redux/state';
import { Elemento } from '../../src/model/elemento';
import { createElemento } from '../../src/model/elemento/elementoUtil';
import { RevisaoElemento } from '../../src/model/revisao/revisao';
import { isRevisaoPrincipal } from '../../src/redux/elemento/util/revisaoUtil';
import { buscaDispositivoById } from '../../src/model/lexml/hierarquia/hierarquiaUtil';
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

  // Nota de rodapé no formato de `texto` do editor: `texto` é o HTML do modal, codificado.
  const nota = (id: string, textoHtml: string): string => {
    const el = document.createElement('lexml-eta-nota-rodape');
    el.setAttribute('id-lexml-eta-nota-rodape', id);
    el.setAttribute('numero', '9');
    el.setAttribute('texto', encodeHtml(textoHtml));
    el.textContent = '9';
    return el.outerHTML;
  };

  it('a justificação vai e volta pelo CLI e valida no XSD, com as notas de rodapé', async () => {
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    // HTML no formato de `texto` do editor da justificação.
    const justificacao =
      `<p class="align-justify">Texto <strong>negrito</strong> <em>itálico</em>, <u>sublinhado</u>, x<sup>2</sup>, A &amp; B e <a href="https://www.congressonacional.leg.br" rel="noopener noreferrer" target="_blank">site</a>${nota(
        'nr1',
        '<p>Nota <strong>formatada</strong> com <a href="https://www.senado.leg.br" rel="noopener noreferrer" target="_blank">link</a>.</p>'
      )}.</p>` +
      `<ul><li>um${nota('nr2', '<p>Primeiro.</p><p>Segundo.</p>')}</li><li class="indent-1">dois</li></ul><ol><li>a</li></ol><p><br></p>` +
      '<table table_id="t1" border="1" style="width:80%"><tbody><tr row_id="r1">' +
      '<td class="td-q" table_id="t1" row_id="r1" cell_id="c1" width="40%"><p class="align-center">1</p><p>2</p></td>' +
      `<td class="td-q" table_id="t1" row_id="r1" cell_id="c2" colspan="2" rowspan="1"><p>3${nota('nr3', '<p>Na tabela.</p>')}</p></td></tr>` +
      '<tr row_id="r2"><td class="td-q" table_id="t1" row_id="r2" cell_id="c3"><p><br></p></td></tr></tbody></table>' +
      `<img src="${png}" width="50%"><p class="ql-text-indent-0px">fim</p>`;
    const modelo = buildProjetoNormaFromJsonix(novoDocumentoArticulado(), true);
    const salvo = criarDocumentoArticulado(modelo, modelo.urn!, undefined, undefined, { justificacao });

    const retorno = await executeServerCommand<{ valido: boolean; xml: string; jsonix: any; erro?: string }, unknown>('validar-documento-lexml', salvo);

    expect(retorno.valido, retorno.erro).to.equal(true);
    expect(retorno.xml).to.include('<Justificacao><PartePrincipal>');
    expect(retorno.xml).to.include('<table border="1" id="_tabela1" style="width: 80%">');
    expect(retorno.xml).to.include('site</a><NotaDeRodape>Nota <b>formatada</b> com <a xlink:href="https://www.senado.leg.br" target="_blank">link</a>.</NotaDeRodape>.');
    expect(retorno.xml).to.include('<li>um<NotaDeRodape>Primeiro. Segundo.</NotaDeRodape></li>');
    expect(retorno.xml).to.include('<span class="p">3<NotaDeRodape>Na tabela.</NotaDeRodape></span>');
    // O editor troca `ql-indent` por `indent` ao ler o Quill; o leitor devolve `ql-indent`.
    const lida = lerJustificacao(retorno.jsonix).replace(/ql-indent/g, 'indent');
    const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(retorno.jsonix), true);
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, { justificacao: lida })).to.deep.equal(salvo);
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
