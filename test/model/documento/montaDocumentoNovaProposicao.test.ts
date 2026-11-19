import { expect } from '@open-wc/testing';
import { montaDocumentoNovaProposicao } from '../../../src/model/lexml/documento/modelo/montaDocumentoNovaProposicao';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { lerIdsRemissoesInvalidas, lerMetadadoLexEdit, lerSituacaoNaNormaVigente } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { metadadoProprietarioLexEdit } from '../../doc/documentoArticulado';

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

  it('descarta os metadados do LexEdit e a justificação do modelo', () => {
    const modelo = JSON.parse(JSON.stringify(DOCUMENTO_PADRAO));
    modelo.value.metadado.metadadoProprietario = [
      metadadoProprietarioLexEdit({
        situacaoNaNormaVigente: { TYPE_NAME: 'br_gov_lexml_lexedit__1.SituacaoNaNormaVigente', refIdsDispositivosExistentes: 'art1_cpt_alt1_art5' },
        remissoesInternasInvalidas: { TYPE_NAME: 'br_gov_lexml_lexedit__1.RemissoesInternasInvalidas', refIdsRemissoesInternas: '_ri1' },
        outrosMetadados: { TYPE_NAME: 'br_gov_lexml_lexedit__1.OutrosMetadados', outroMetadado: [{ chave: 'a', value: 'b' }] },
      }),
    ];
    modelo.value.projetoNorma.justificacao = [{ TYPE_NAME: 'br_gov_lexml__1.OpenStructure' }];

    const doc = montaDocumentoNovaProposicao('urn:x', 'E', 'P', modelo);

    expect(doc.value.metadado).not.to.have.property('metadadoProprietario');
    expect(doc.value.projetoNorma).not.to.have.property('justificacao');
    expect(lerSituacaoNaNormaVigente(doc)).to.deep.equal({ existentes: [], novos: [] });
    expect(lerIdsRemissoesInvalidas(doc)).to.deep.equal([]);
    expect(lerMetadadoLexEdit(doc)).not.to.have.property('outrosMetadados');
    expect(modelo.value.metadado.metadadoProprietario).to.have.length(1);
  });

  it('do modelo só mantém a articulação e a ementa', () => {
    const modelo = JSON.parse(JSON.stringify(DOCUMENTO_PADRAO));
    modelo.value.projetoNorma.norma.parteInicial.ementa.content = ['EMENTA'];
    modelo.value.projetoNorma.norma.parteFinal = { fecho: 'x' };

    const doc = montaDocumentoNovaProposicao('urn:x', 'E', 'P', modelo);

    expect(doc.value.projetoNorma.norma.parteFinal).to.be.undefined;
    expect(doc.value.projetoNorma.norma.parteInicial.ementa.content).to.deep.equal(['EMENTA']);
    expect(doc.value.projetoNorma.norma.articulacao).to.deep.equal(modelo.value.projetoNorma.norma.articulacao);
  });
});
