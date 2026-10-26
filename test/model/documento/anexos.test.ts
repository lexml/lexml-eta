import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerAnexos, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { Anexo, MimeType } from '../../../src/model/proposicao/proposicao';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const TYPE_NAME_GRUPO = 'br_gov_lexml_lexedit__1.Anexos';
const TYPE_NAME_ITEM = 'br_gov_lexml_lexedit__1.Anexo';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const salvar = (anexos?: any, dados: any = {}): any => {
  const modelo = novoModelo();
  return criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { ...dados, anexos });
};

const anexo = (idArquivo: string, nomeArquivo: string, mimeType: MimeType, extras: Partial<Anexo> = {}): Anexo => ({
  idArquivo,
  nomeArquivo,
  nomeDocumento: nomeArquivo.replace(/\.[^.]*$/, ''),
  tipo: 'nao.informado',
  mimeType,
  ...extras,
});

const lido = (idArquivo: string, nomeArquivo: string, mimeType: string, extras: object = {}): any => ({
  TYPE_NAME: TYPE_NAME_ITEM,
  idArquivo,
  nomeArquivo,
  nomeDocumento: 'Nome',
  tipo: 'emenda',
  mimeType,
  ...extras,
});

const documentoCom = (anexos: unknown, demais: object = {}): any => {
  const documento = novoDocumentoArticulado();
  documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ ...demais, anexos })];
  return documento;
};

describe('Anexos — salvar (especificação 05)', () => {
  it('grava um Anexo por anexo, na ordem informada, só com os cinco atributos', () => {
    const lexedit = lexeditSalvo(
      salvar([anexo('id-1', 'Parecer.pdf', MimeType.PDF, { tipo: 'substitutivo' }), { ...anexo('id-2', 'Emenda.docx', MimeType.DOCX), base64: 'AAAA', extra: 1 }])
    );

    expect(lexedit.anexos).to.deep.equal({
      TYPE_NAME: TYPE_NAME_GRUPO,
      anexo: [
        { TYPE_NAME: TYPE_NAME_ITEM, idArquivo: 'id-1', nomeArquivo: 'Parecer.pdf', nomeDocumento: 'Parecer', tipo: 'substitutivo', mimeType: MimeType.PDF },
        { TYPE_NAME: TYPE_NAME_ITEM, idArquivo: 'id-2', nomeArquivo: 'Emenda.docx', nomeDocumento: 'Emenda', tipo: 'nao.informado', mimeType: MimeType.DOCX },
      ],
    });
  });

  it('grava os valores como informados, inclusive caracteres especiais', () => {
    const lexedit = lexeditSalvo(salvar([anexo('id-1', 'Relatório.pdf', MimeType.PDF, { nomeDocumento: 'A & B <C> "d"' })]));

    expect(lexedit.anexos.anexo[0].nomeDocumento).to.equal('A & B <C> "d"');
    expect(lexedit.anexos.anexo[0].nomeArquivo).to.equal('Relatório.pdf');
  });

  it('nome do documento e tipo vazios assumem o nome do arquivo e "nao.informado"', () => {
    const lexedit = lexeditSalvo(salvar([anexo('id-1', 'Parecer.pdf', MimeType.PDF, { nomeDocumento: ' ', tipo: '' })]));

    expect(lexedit.anexos.anexo[0]).to.include({ nomeDocumento: 'Parecer.pdf', tipo: 'nao.informado' });
  });

  it('sem anexos o grupo não é gravado', () => {
    expect(salvar(undefined).value.metadado.metadadoProprietario).to.be.undefined;
    expect(salvar([]).value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('descarta anexo sem idArquivo ou sem nomeArquivo', () => {
    const lexedit = lexeditSalvo(salvar([anexo('', 'A.pdf', MimeType.PDF), anexo('id-2', ' ', MimeType.PDF), null, anexo('id-3', 'C.pdf', MimeType.PDF)]));

    expect(lexedit.anexos.anexo.map((a: any) => a.idArquivo)).to.deep.equal(['id-3']);
  });

  it('só anexos inválidos equivalem a nenhum anexo', () => {
    expect(salvar([anexo('', 'A.pdf', MimeType.PDF)]).value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('não gera pendência', () => {
    expect(lexeditSalvo(salvar([anexo('id-1', 'A.pdf', MimeType.PDF)]))).not.to.have.property('pendencias');
  });

  it('convive com os demais grupos sem alterá-los', () => {
    const opcoesImpressao = { imprimirBrasao: false, textoCabecalho: 'X', reduzirEspacoEntreLinhas: true, tamanhoFonte: 16 };
    const lexedit = lexeditSalvo(salvar([anexo('id-1', 'A.pdf', MimeType.PDF)], { opcoesImpressao, outrosMetadados: { a: 'b' }, local: 'Sala', data: '2026-04-24' }));

    expect(lexedit.anexos.anexo).to.have.length(1);
    expect(lexedit.opcoesImpressao).to.include(opcoesImpressao);
    expect(lexedit.outrosMetadados.outroMetadado).to.have.length(1);
    expect(lexedit.local).to.equal('Sala');
  });
});

describe('Anexos — abrir (especificação 05)', () => {
  it('lê os anexos, na ordem do arquivo', () => {
    const anexos = lerAnexos({ anexo: [lido('id-1', 'A.pdf', MimeType.PDF), lido('id-2', 'B.docx', MimeType.DOCX)] });

    expect(anexos).to.deep.equal([
      { idArquivo: 'id-1', nomeArquivo: 'A.pdf', nomeDocumento: 'Nome', tipo: 'emenda', mimeType: MimeType.PDF },
      { idArquivo: 'id-2', nomeArquivo: 'B.docx', nomeDocumento: 'Nome', tipo: 'emenda', mimeType: MimeType.DOCX },
    ]);
  });

  it('aceita um único Anexo entregue como objeto', () => {
    expect(lerAnexos({ anexo: lido('id-1', 'A.pdf', MimeType.PDF) })?.map(a => a.idArquivo)).to.deep.equal(['id-1']);
  });

  it('nomeDocumento ausente assume o nome do arquivo sem extensão, e tipo ausente ou vazio assume "nao.informado"', () => {
    const anexos = lerAnexos({
      anexo: [
        lido('id-1', 'Parecer da CCJ.v2.pdf', MimeType.PDF, { nomeDocumento: undefined, tipo: undefined }),
        lido('id-2', 'B.pdf', MimeType.PDF, { nomeDocumento: ' ', tipo: '' }),
      ],
    });

    expect(anexos?.map(a => [a.nomeDocumento, a.tipo])).to.deep.equal([
      ['Parecer da CCJ.v2', 'nao.informado'],
      ['B', 'nao.informado'],
    ]);
  });

  it('descarta anexo sem idArquivo ou nomeArquivo, ou de formato diferente de PDF e DOCX, e mantém os demais', () => {
    const anexos = lerAnexos({
      anexo: [
        lido('id-1', 'A.pdf', MimeType.PDF),
        lido('', 'B.pdf', MimeType.PDF),
        lido('id-3', '', MimeType.PDF),
        lido('id-4', 'D.png', 'image/png'),
        lido('id-5', 'E.pdf', undefined as any),
        'texto',
        null,
        lido('id-7', 'G.docx', MimeType.DOCX),
      ],
    });

    expect(anexos?.map(a => a.idArquivo)).to.deep.equal(['id-1', 'id-7']);
  });

  it('entrada ausente, inválida ou sem anexos válidos devolve undefined', () => {
    expect(lerAnexos(undefined)).to.be.undefined;
    expect(lerAnexos('texto')).to.be.undefined;
    expect(lerAnexos({})).to.be.undefined;
    expect(lerAnexos({ anexo: [lido('', 'A.pdf', MimeType.PDF)] })).to.be.undefined;
  });

  it('lerMetadadoLexEdit lê o grupo do documento aberto', () => {
    const dados = lerMetadadoLexEdit(lerDocumentoArticulado(documentoCom({ anexo: [lido('id-1', 'A.pdf', MimeType.PDF)] })));

    expect(dados.anexos?.map(a => a.idArquivo)).to.deep.equal(['id-1']);
  });

  it('documento sem o grupo não tem anexos', () => {
    expect(lerMetadadoLexEdit(lerDocumentoArticulado(novoDocumentoArticulado())).anexos).to.be.undefined;
  });

  it('grupo inválido não impede a leitura dos demais grupos', () => {
    const opcoesImpressao = { imprimirBrasao: false, textoCabecalho: 'X', reduzirEspacoEntreLinhas: true, tamanhoFonte: 16 };
    const dados = lerMetadadoLexEdit(lerDocumentoArticulado(documentoCom({ anexo: [lido('', 'A.pdf', MimeType.PDF)] }, { opcoesImpressao })));

    expect(dados.anexos).to.be.undefined;
    expect(dados.opcoesImpressao).to.include(opcoesImpressao);
  });

  it('ida e volta: salvar, ler e salvar de novo gera o mesmo documento', () => {
    const anexos = [anexo('id-1', 'Parecer.pdf', MimeType.PDF, { tipo: 'substitutivo' }), anexo('id-2', 'Emenda.docx', MimeType.DOCX)];
    const salvo = salvar(anexos);

    const dados = lerMetadadoLexEdit(lerDocumentoArticulado(salvo));
    const reaberto = buildProjetoNormaFromJsonix(lerDocumentoArticulado(salvo), true);

    expect(dados.anexos).to.deep.equal(anexos);
    expect(criarDocumentoArticulado(reaberto, reaberto.urn!, undefined, undefined, dados)).to.deep.equal(salvo);
  });
});
