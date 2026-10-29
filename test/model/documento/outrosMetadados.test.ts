import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit, lerOutrosMetadados } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const TYPE_NAME_GRUPO = 'br_gov_lexml_lexedit__1.OutrosMetadados';
const TYPE_NAME_ITEM = 'br_gov_lexml_lexedit__1.OutroMetadado';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const salvar = (outrosMetadados?: any, dados: any = {}): any => {
  const modelo = novoModelo();
  return criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { ...dados, outrosMetadados });
};

const item = (chave: string, value: unknown): any => ({ TYPE_NAME: TYPE_NAME_ITEM, chave, value });

const documentoCom = (outrosMetadados: unknown, demais: object = {}): any => {
  const documento = novoDocumentoArticulado();
  documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ ...demais, outrosMetadados })];
  return documento;
};

describe('Outros metadados — salvar (especificação 15)', () => {
  it('grava um OutroMetadado por par, na ordem informada', () => {
    const lexedit = lexeditSalvo(salvar({ tituloAntesDaEpigrafe: 'COMISSÃO XPTO', jsonDadosComissao: '{"id":1}' }));

    expect(lexedit.outrosMetadados).to.deep.equal({
      TYPE_NAME: TYPE_NAME_GRUPO,
      outroMetadado: [item('tituloAntesDaEpigrafe', 'COMISSÃO XPTO'), item('jsonDadosComissao', '{"id":1}')],
    });
  });

  it('grava os valores como informados, inclusive caracteres especiais e valor vazio', () => {
    const valores = { a: 'A & B <C> "d"', vazio: '' };

    expect(lexeditSalvo(salvar(valores)).outrosMetadados.outroMetadado.map((o: any) => o.value)).to.deep.equal(['A & B <C> "d"', '']);
  });

  it('sem pares o grupo não é gravado', () => {
    expect(salvar(undefined).value.metadado.metadadoProprietario).to.be.undefined;
    expect(salvar({}).value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('chave vazia e valor não textual são descartados', () => {
    const lexedit = lexeditSalvo(salvar({ ok: 'x', ' ': 'y', numero: 1, nulo: null }));

    expect(lexedit.outrosMetadados.outroMetadado).to.deep.equal([item('ok', 'x')]);
  });

  it('não gera pendência', () => {
    expect(lexeditSalvo(salvar({ a: 'b' }))).not.to.have.property('pendencias');
  });

  it('convive com os demais grupos sem alterá-los', () => {
    const opcoesImpressao = { imprimirBrasao: false, textoCabecalho: 'X', reduzirEspacoEntreLinhas: true, tamanhoFonte: 16 };
    const lexedit = lexeditSalvo(salvar({ a: 'b' }, { opcoesImpressao, local: 'Sala', data: '2026-04-24' }));

    expect(lexedit.outrosMetadados.outroMetadado).to.have.length(1);
    expect(lexedit.opcoesImpressao).to.include(opcoesImpressao);
    expect(lexedit.local).to.equal('Sala');
  });
});

describe('Outros metadados — abrir (especificação 15)', () => {
  it('lê os pares', () => {
    expect(lerOutrosMetadados({ outroMetadado: [item('a', '1'), item('b', '2')] })).to.deep.equal({ a: '1', b: '2' });
  });

  it('aceita um único OutroMetadado entregue como objeto', () => {
    expect(lerOutrosMetadados({ outroMetadado: item('a', '1') })).to.deep.equal({ a: '1' });
  });

  it('aceita valor vazio', () => {
    expect(lerOutrosMetadados({ outroMetadado: [item('x', '')] })).to.deep.equal({ x: '' });
  });

  it('em chave repetida vale a primeira ocorrência', () => {
    expect(lerOutrosMetadados({ outroMetadado: [item('x', '1'), item('x', '2')] })).to.deep.equal({ x: '1' });
  });

  it('chave igual a membro de Object.prototype não é tratada como repetida', () => {
    expect(lerOutrosMetadados({ outroMetadado: [item('toString', 'v')] })).to.deep.equal({ toString: 'v' });
  });

  it('descarta entrada sem chave, com chave vazia ou com valor não textual', () => {
    const lido = lerOutrosMetadados({ outroMetadado: [item('ok', 'v'), { value: 'sem chave' }, item('  ', 'v'), item('num', 1), item('nulo', null), 'lixo'] });

    expect(lido).to.deep.equal({ ok: 'v' });
  });

  it('valor que não é objeto, sem pares ou sem pares válidos equivale a grupo ausente', () => {
    expect(lerOutrosMetadados(undefined)).to.be.undefined;
    expect(lerOutrosMetadados('x')).to.be.undefined;
    expect(lerOutrosMetadados({})).to.be.undefined;
    expect(lerOutrosMetadados({ outroMetadado: [item('n', 1)] })).to.be.undefined;
  });

  it('lerMetadadoLexEdit compõe o grupo e o omite quando o arquivo não o tem', () => {
    expect(lerMetadadoLexEdit(documentoCom({ outroMetadado: [item('a', '1')] })).outrosMetadados).to.deep.equal({ a: '1' });
    expect(lerMetadadoLexEdit(novoDocumentoArticulado())).not.to.have.property('outrosMetadados');
  });

  it('grupo inválido não impede a leitura dos demais grupos', () => {
    const opcoes = { imprimirBrasao: false, textoCabecalho: 'X', reduzirEspacoEntreLinhas: false, tamanhoFonte: 16 };
    const dados = lerMetadadoLexEdit(documentoCom('lixo', { opcoesImpressao: opcoes }));

    expect(dados).not.to.have.property('outrosMetadados');
    expect(dados.opcoesImpressao!.tamanhoFonte).to.equal(16);
  });

  it('salvar, ler e salvar de novo gera o mesmo grupo', () => {
    const primeiro = lexeditSalvo(salvar({ a: 'A & B', b: '', c: '{"x":[1,2]}' })).outrosMetadados;
    const lido = lerOutrosMetadados(primeiro);

    expect(lexeditSalvo(salvar(lido)).outrosMetadados).to.deep.equal(primeiro);
  });
});
