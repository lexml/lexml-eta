import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { lexeditSalvo, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const JUSTIFICACAO = 'Não foi informado um texto de justificação.';
const REMISSAO = 'Corrigir remissões internas inválidas.';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const remissaoInvalidaNoCaput = (modelo: any): Record<number, any[]> => {
  const caput = (modelo.articulacao.filhos[0] as Artigo).caput!;
  const textoRef = 'educação';
  return { [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }] };
};

describe('Pendências do LexEdit (especificação 13)', () => {
  it('grava as pendências do editor', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { pendencias: [JUSTIFICACAO] });

    expect(lexeditSalvo(documento).pendencias).to.deep.equal({ TYPE_NAME: 'br_gov_lexml_lexedit__1.Pendencias', pendencia: [JUSTIFICACAO] });
  });

  it('grava as pendências do editor antes da de remissões internas inválidas', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, remissaoInvalidaNoCaput(modelo), undefined, { pendencias: [JUSTIFICACAO] });

    expect(lexeditSalvo(documento).pendencias.pendencia).to.deep.equal([JUSTIFICACAO, REMISSAO]);
  });

  it('não altera a lista recebida do editor', () => {
    const modelo = novoModelo();
    const pendencias = [JUSTIFICACAO];
    criarDocumentoArticulado(modelo, modelo.urn, remissaoInvalidaNoCaput(modelo), undefined, { pendencias });

    expect(pendencias).to.deep.equal([JUSTIFICACAO]);
  });

  it('lista vazia sem outro grupo não gera MetadadoProprietario', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { pendencias: [] });

    expect(documento.value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('não lê as pendências ao abrir', () => {
    const modelo = novoModelo();
    const documento = criarDocumentoArticulado(modelo, modelo.urn, remissaoInvalidaNoCaput(modelo), undefined, { pendencias: [JUSTIFICACAO] });

    expect(lerMetadadoLexEdit(documento)).to.not.have.property('pendencias');
  });
});
