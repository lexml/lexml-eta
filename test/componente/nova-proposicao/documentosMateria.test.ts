import { expect } from '@open-wc/testing';
import {
  filtrarDocumentos,
  formataDataApresentacao,
  linhaDetalheDocumento,
  TOOLTIP_DOCUMENTO_PADRAO,
  tooltipDoDocumento,
  urlDocumentoSegura,
} from '../../../src/components/nova-proposicao/documentosMateria';
import { DocumentoMateria } from '../../../src/components/nova-proposicao/urlsNovaProposicao';

const doc = (o: Partial<DocumentoMateria> = {}): DocumentoMateria => ({
  id: 'x',
  titulo: 'Complementação de voto',
  sigla: 'PRL',
  numero: '1',
  ano: 2025,
  urlDocumento: 'https://exemplo.test/x',
  nomeAutor: 'José',
  papelAutor: 'Relator',
  indSexoAutor: 'M',
  dataApresentacao: '2025-09-05',
  siglaComissao: 'CSAUDE',
  ...o,
});

describe('documentosMateria', () => {
  it('formata a data como DD/MM/AAAA e devolve o valor fora do formato como veio', () => {
    expect(formataDataApresentacao('2025-08-12')).to.equal('12/08/2025');
    expect(formataDataApresentacao('ontem')).to.equal('ontem');
  });

  it('linha de detalhe: identificação, autor com "Dep." e data; omite o que não existe', () => {
    expect(linhaDetalheDocumento(doc())).to.equal('PRL 1/2025 CSAUDE · Relator: Dep. José · 05/09/2025');
    expect(linhaDetalheDocumento(doc({ ano: undefined, siglaComissao: undefined, nomeAutor: '' }))).to.equal('PRL 1 · 05/09/2025');
  });

  it('filtro: sem acento e caixa, todos os termos, inclusive a data exibida', () => {
    const lista = [doc(), doc({ id: 'y', titulo: 'Parecer', nomeAutor: 'Maria', dataApresentacao: '2025-08-12' })];
    expect(filtrarDocumentos(lista, 'jose').map(d => d.id)).to.deep.equal(['x']);
    expect(filtrarDocumentos(lista, 'COMPLEMENTACAO').map(d => d.id)).to.deep.equal(['x']);
    expect(filtrarDocumentos(lista, '12/08').map(d => d.id)).to.deep.equal(['y']);
    expect(filtrarDocumentos(lista, 'parecer maria').map(d => d.id)).to.deep.equal(['y']);
    expect(filtrarDocumentos(lista, 'parecer jose')).to.deep.equal([]);
    expect(filtrarDocumentos(lista, '   ')).to.equal(lista);
  });

  it('filtro: alcança a ementa, sem acento e caixa; documento sem ementa não quebra', () => {
    const lista = [doc({ ementa: 'Dispõe sobre a atualização do Código Civil.' }), doc({ id: 'y', titulo: 'Parecer', ementa: undefined })];
    expect(filtrarDocumentos(lista, 'codigo civil').map(d => d.id)).to.deep.equal(['x']);
    expect(filtrarDocumentos(lista, 'ATUALIZACAO').map(d => d.id)).to.deep.equal(['x']);
    expect(filtrarDocumentos(lista, 'parecer').map(d => d.id)).to.deep.equal(['y']);
  });

  it('só http(s) e endereços relativos viram link; ausente ou vazio não vira', () => {
    expect(urlDocumentoSegura('https://a.test/x')).to.equal('https://a.test/x');
    expect(urlDocumentoSegura('/relativo')).to.equal('/relativo');
    expect(urlDocumentoSegura('javascript:alert(1)')).to.equal(undefined);
    expect(urlDocumentoSegura('data:text/html,x')).to.equal(undefined);
    expect(urlDocumentoSegura(undefined)).to.equal(undefined);
    expect(urlDocumentoSegura('   ')).to.equal(undefined);
  });

  it('tooltip: o do host quando preenchido, o padrão quando ausente ou vazio', () => {
    expect(TOOLTIP_DOCUMENTO_PADRAO).to.equal('Abrir o documento em outra aba');
    expect(tooltipDoDocumento(doc())).to.equal(TOOLTIP_DOCUMENTO_PADRAO);
    expect(tooltipDoDocumento(doc({ tooltipDocumento: '   ' }))).to.equal(TOOLTIP_DOCUMENTO_PADRAO);
    expect(tooltipDoDocumento(doc({ tooltipDocumento: 'Parecer na íntegra (PDF)' }))).to.equal('Parecer na íntegra (PDF)');
  });
});
