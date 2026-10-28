import { expect } from '@open-wc/testing';
import { montaDocumentoNovaProposicao } from '../../../src/model/lexml/documento/modelo/montaDocumentoNovaProposicao';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';

describe('montaDocumentoNovaProposicao', () => {
  it('sem modelo parte do documento padrão e não o altera', () => {
    const doc = montaDocumentoNovaProposicao('urn:x', 'EPÍGRAFE', 'Preâmbulo');
    const norma = doc.value.projetoNorma.norma;

    expect(doc.value.metadado.identificacao.urn).to.equal('urn:x');
    expect(norma.parteInicial.epigrafe.content).to.deep.equal(['EPÍGRAFE']);
    expect(DOCUMENTO_PADRAO.value.metadado.identificacao.urn).to.equal('');
  });

  it('divide o preâmbulo em parágrafos', () => {
    const doc = montaDocumentoNovaProposicao('urn:x', 'E', '<p>Um</p><p>Dois</p>');
    expect(doc.value.projetoNorma.norma.parteInicial.preambulo.p.map(p => p.content[0])).to.deep.equal(['Um', 'Dois']);
  });

  it('do modelo só mantém a articulação e a ementa', () => {
    const modelo = JSON.parse(JSON.stringify(DOCUMENTO_PADRAO));
    modelo.value.metadadoProprietario = [{}];
    modelo.value.projetoNorma.norma.parteInicial.ementa.content = ['EMENTA'];
    modelo.value.projetoNorma.norma.parteFinal = { fecho: 'x' };

    const doc = montaDocumentoNovaProposicao('urn:x', 'E', 'P', modelo);

    expect(doc.value.metadadoProprietario).to.be.undefined;
    expect(doc.value.projetoNorma.norma.parteFinal).to.be.undefined;
    expect(doc.value.projetoNorma.norma.parteInicial.ementa.content).to.deep.equal(['EMENTA']);
    expect(doc.value.projetoNorma.norma.articulacao).to.deep.equal(modelo.value.projetoNorma.norma.articulacao);
  });
});
