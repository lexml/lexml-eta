import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix, lerColegiadoApreciador, lerMetadadoLexEdit } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { ColegiadoApreciador } from '../../../src/model/proposicao/proposicao';
import { lexeditSalvo, metadadoProprietarioLexEdit, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const TYPE_NAME_COLEGIADO = 'br_gov_lexml_lexedit__1.ColegiadoApreciador';

const novoModelo = (): any => buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);

const salvar = (colegiadoApreciador?: any): any => {
  const modelo = novoModelo();
  return lexeditSalvo(criarDocumentoArticulado(modelo, modelo.urn, undefined, undefined, { colegiadoApreciador }));
};

describe('Colegiado apreciador — salvar (especificação 14)', () => {
  it('Plenário grava casa e tipo, sem comissão', () => {
    const lexedit = salvar({ siglaCasaLegislativa: 'SF', tipoColegiado: 'Plenário' });

    expect(lexedit.colegiadoApreciador).to.deep.equal({ TYPE_NAME: TYPE_NAME_COLEGIADO, siglaCasaLegislativa: 'SF', tipoColegiado: 'Plenário' });
  });

  it('Comissão grava também a sigla da comissão', () => {
    const lexedit = salvar({ siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });

    expect(lexedit.colegiadoApreciador).to.deep.equal({ TYPE_NAME: TYPE_NAME_COLEGIADO, siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
  });

  it('sigla de comissão vazia ou em branco não é gravada', () => {
    expect(salvar({ siglaCasaLegislativa: 'CD', tipoColegiado: 'Plenário', siglaComissao: '' }).colegiadoApreciador).not.to.have.property('siglaComissao');
    expect(salvar({ siglaCasaLegislativa: 'CD', tipoColegiado: 'Comissão', siglaComissao: '  ' }).colegiadoApreciador).not.to.have.property('siglaComissao');
  });

  it('valores fora das enumerações assumem o padrão', () => {
    const lexedit = salvar({ siglaCasaLegislativa: 'XX', tipoColegiado: 'Plenário via Comissão' });

    expect(lexedit.colegiadoApreciador.siglaCasaLegislativa).to.equal('CN');
    expect(lexedit.colegiadoApreciador.tipoColegiado).to.equal('Plenário');
  });

  it('casa ausente assume o padrão', () => {
    expect(salvar({ tipoColegiado: 'Plenário' }).colegiadoApreciador.siglaCasaLegislativa).to.equal('CN');
  });

  it('sem colegiado o elemento não é gravado', () => {
    const modelo = novoModelo();

    expect(criarDocumentoArticulado(modelo, modelo.urn).value.metadado.metadadoProprietario).to.be.undefined;
  });

  it('não grava campos extras que o host envie no objeto', () => {
    const lexedit = salvar({ siglaCasaLegislativa: 'SF', tipoColegiado: 'Plenário', outro: 'x' });

    expect(Object.keys(lexedit.colegiadoApreciador).sort()).to.deep.equal(['TYPE_NAME', 'siglaCasaLegislativa', 'tipoColegiado']);
  });
});

describe('Colegiado apreciador — abrir (especificação 14)', () => {
  const documentoComColegiado = (colegiado: unknown): any => {
    const documento = novoDocumentoArticulado();
    documento.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ colegiadoApreciador: colegiado })];
    return documento;
  };

  it('lê casa, tipo e comissão', () => {
    const colegiado = lerColegiadoApreciador({ siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });

    expect(colegiado).to.deep.equal({ siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
  });

  it('atributo ausente assume o padrão da classe', () => {
    const colegiado = lerColegiadoApreciador({})!;

    expect(colegiado.siglaCasaLegislativa).to.equal(new ColegiadoApreciador().siglaCasaLegislativa);
    expect(colegiado.tipoColegiado).to.equal('Plenário');
    expect(colegiado.siglaComissao).to.be.undefined;
  });

  it('atributo inválido assume o padrão sem invalidar os demais', () => {
    const colegiado = lerColegiadoApreciador({ siglaCasaLegislativa: 'XX', tipoColegiado: 'Plenário via Comissão', siglaComissao: 'CCJ' })!;

    expect(colegiado.siglaCasaLegislativa).to.equal('CN');
    expect(colegiado.tipoColegiado).to.equal('Plenário');
    expect(colegiado.siglaComissao).to.equal('CCJ');
  });

  it('valor que não é objeto equivale a grupo ausente', () => {
    expect(lerColegiadoApreciador(undefined)).to.be.undefined;
    expect(lerColegiadoApreciador('SF')).to.be.undefined;
  });

  it('lerMetadadoLexEdit compõe o grupo e o omite quando o arquivo não o tem', () => {
    expect(lerMetadadoLexEdit(documentoComColegiado({ siglaCasaLegislativa: 'CD', tipoColegiado: 'Plenário' })).colegiadoApreciador?.siglaCasaLegislativa).to.equal('CD');
    expect(lerMetadadoLexEdit(novoDocumentoArticulado())).not.to.have.property('colegiadoApreciador');
  });

  it('salvar, ler e salvar de novo gera o mesmo grupo', () => {
    const primeiro = salvar({ siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' }).colegiadoApreciador;
    const lido = lerColegiadoApreciador(primeiro);

    expect(salvar(lido).colegiadoApreciador).to.deep.equal(primeiro);
  });
});
