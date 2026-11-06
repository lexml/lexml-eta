import { expect } from '@open-wc/testing';
import { descricaoDocumento } from '../../../src/components/nova-proposicao/descricaoDocumento';
import { lerDadosIdentificacao } from '../../../src/components/nova-proposicao/lerDadosIdentificacao';
import { montaUrnNovaProposicao } from '../../../src/components/nova-proposicao/montaUrnNovaProposicao';
import { getSiglasNovaProposicao, getSiglasProposicaoReferenciada } from '../../../src/components/nova-proposicao/siglasNovaProposicao';
import { DadosIdentificacao } from '../../../src/components/nova-proposicao/tiposNovaProposicao';
import { getVocabularioDaCasa, inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';
import { CasaLegislativaEditor, TipoRelacaoSubstitutivo } from '../../../src/model/lexml/documento/vocabulario/tiposVocabulario';

const nova = (casa: CasaLegislativaEditor, sigla: string): any => getSiglasNovaProposicao(casa).find(t => t.sigla === sigla);
const referenciada = (sigla: string): any => getSiglasProposicaoReferenciada().find(t => t.sigla === sigla);
const substitutivoCd = (relacao: TipoRelacaoSubstitutivo.E_SUBSTITUTIVO | TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA, sigla: string): any =>
  getVocabularioDaCasa().tiposDocumento.find(t => t.sigla === sigla && t.tipoRelacaoSubstitutivo === relacao);

const dados = (casa: CasaLegislativaEditor, parcial: Partial<DadosIdentificacao>): DadosIdentificacao => ({
  casa,
  especie: 'proposicao',
  numeroProposicao: '',
  anoProposicao: '2026',
  anoSubstitutivo: '2026',
  numeroMpv: '',
  anoMpv: '2026',
  ...parcial,
});

describe('Leitura da URN para a Tela 1 e descrição do documento', () => {
  after(() => inicializarVocabulario('SF'));

  const casos: { nome: string; casa: CasaLegislativaEditor; monta: () => DadosIdentificacao }[] = [
    { nome: 'proposição SF', casa: 'SF', monta: () => dados('SF', { tipoProposicao: nova('SF', 'PEC') }) },
    { nome: 'PLV', casa: 'SF', monta: () => dados('SF', { tipoProposicao: nova('SF', 'PLV'), numeroMpv: '1200', anoMpv: '2026' }) },
    {
      nome: 'substitutivo SF',
      casa: 'SF',
      monta: () => dados('SF', { especie: 'substitutivo', tipoProposicao: referenciada('PL'), numeroProposicao: '10', anoProposicao: '2025' }),
    },
    { nome: 'proposição CD', casa: 'CD', monta: () => dados('CD', { tipoProposicao: nova('CD', 'PL') }) },
    {
      nome: 'substitutivo CD',
      casa: 'CD',
      monta: () =>
        dados('CD', {
          especie: 'substitutivo',
          tipoProposicao: referenciada('PL'),
          numeroProposicao: '10',
          anoProposicao: '2025',
          tipoSubstitutivo: substitutivoCd(TipoRelacaoSubstitutivo.E_SUBSTITUTIVO, 'SBT'),
        }),
    },
    {
      nome: 'subemenda CD',
      casa: 'CD',
      monta: () =>
        dados('CD', {
          especie: 'subemenda',
          tipoProposicao: referenciada('PL'),
          numeroProposicao: '10',
          anoProposicao: '2025',
          tipoSubstitutivo: substitutivoCd(TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA, 'SSP'),
        }),
    },
  ];

  casos.forEach(({ nome, casa, monta }) => {
    it(`ida e volta da URN: ${nome}`, () => {
      inicializarVocabulario(casa);
      const d = monta();
      const { urn, urnDocumentoReferenciado } = montaUrnNovaProposicao(d);
      const lido = lerDadosIdentificacao(urn, urnDocumentoReferenciado, casa);
      expect(lido.dados.especie).to.equal(d.especie);
      expect(lido.numeroOriginal).to.be.undefined;
      expect(montaUrnNovaProposicao(lido.dados)).to.deep.equal(urnDocumentoReferenciado ? { urn, urnDocumentoReferenciado } : { urn });
    });
  });

  it('lê o PLV pela sigla da URN e a MPV da URN referenciada', () => {
    inicializarVocabulario('SF');
    const { urn, urnDocumentoReferenciado } = montaUrnNovaProposicao(dados('SF', { tipoProposicao: nova('SF', 'PLV'), numeroMpv: '1200', anoMpv: '2026' }));
    const { dados: lido } = lerDadosIdentificacao(urn, urnDocumentoReferenciado, 'SF');
    expect(lido.especie).to.equal('proposicao');
    expect(lido.tipoProposicao?.sigla).to.equal('PLV');
    expect([lido.numeroMpv, lido.anoMpv]).to.deep.equal(['1200', '2026']);
  });

  it('lê o substitutivo do Senado como substitutivo da proposição referenciada', () => {
    inicializarVocabulario('SF');
    const { urn, urnDocumentoReferenciado } = montaUrnNovaProposicao(
      dados('SF', { especie: 'substitutivo', tipoProposicao: referenciada('PL'), numeroProposicao: '10', anoProposicao: '2025' })
    );
    const { dados: lido } = lerDadosIdentificacao(urn, urnDocumentoReferenciado, 'SF');
    expect([lido.especie, lido.tipoProposicao?.sigla, lido.numeroProposicao, lido.anoProposicao]).to.deep.equal(['substitutivo', 'PL', '10', '2025']);
  });

  it('lê a subemenda da Câmara com a proposição referenciada', () => {
    inicializarVocabulario('CD');
    const d = dados('CD', {
      especie: 'subemenda',
      tipoProposicao: referenciada('PL'),
      numeroProposicao: '10',
      anoProposicao: '2025',
      tipoSubstitutivo: substitutivoCd(TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA, 'SSP'),
    });
    const { urn, urnDocumentoReferenciado } = montaUrnNovaProposicao(d);
    const { dados: lido } = lerDadosIdentificacao(urn, urnDocumentoReferenciado, 'CD');
    expect([lido.especie, lido.tipoSubstitutivo?.sigla, lido.anoSubstitutivo, lido.tipoProposicao?.sigla, lido.numeroProposicao, lido.anoProposicao]).to.deep.equal([
      'subemenda',
      'SSP',
      '2026',
      'PL',
      '10',
      '2025',
    ]);
  });

  describe('número do documento preservado', () => {
    const urnPl123 = (): string => montaUrnNovaProposicao(dados('SF', { tipoProposicao: nova('SF', 'PL') })).urn.replace(';999999', ';123');

    it('guarda o número real e o reaproveita enquanto espécie e sigla não mudam', () => {
      inicializarVocabulario('SF');
      const urn = urnPl123();
      const { dados: lido, numeroOriginal } = lerDadosIdentificacao(urn, undefined, 'SF');
      expect(numeroOriginal?.numero).to.equal('123');
      expect(montaUrnNovaProposicao(lido, numeroOriginal).urn).to.equal(urn);
    });

    it('sem número original, usa 999999', () => {
      inicializarVocabulario('SF');
      const { dados: lido } = lerDadosIdentificacao(urnPl123(), undefined, 'SF');
      expect(montaUrnNovaProposicao(lido).urn).to.contain(';999999');
    });

    it('sigla diferente volta a 999999', () => {
      inicializarVocabulario('SF');
      const { dados: lido, numeroOriginal } = lerDadosIdentificacao(urnPl123(), undefined, 'SF');
      const trocada = { ...lido, tipoProposicao: nova('SF', 'PLP') };
      expect(montaUrnNovaProposicao(trocada, numeroOriginal).urn).to.contain(';999999');
    });

    it('espécie diferente volta a 999999 (substitutivo da Câmara)', () => {
      inicializarVocabulario('CD');
      const base = dados('CD', {
        especie: 'substitutivo',
        tipoProposicao: referenciada('PL'),
        numeroProposicao: '10',
        anoProposicao: '2025',
        tipoSubstitutivo: substitutivoCd(TipoRelacaoSubstitutivo.E_SUBSTITUTIVO, 'SBT'),
      });
      const { urn: urnBase, urnDocumentoReferenciado } = montaUrnNovaProposicao(base);
      const urn = urnBase.replace(';999999', ';7');
      const { dados: lido, numeroOriginal } = lerDadosIdentificacao(urn, urnDocumentoReferenciado, 'CD');
      expect(numeroOriginal?.numero).to.equal('7');
      expect(montaUrnNovaProposicao(lido, numeroOriginal).urn).to.equal(urn);
      const subemenda = { ...lido, especie: 'subemenda' as const, tipoSubstitutivo: substitutivoCd(TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA, 'SSP') };
      expect(montaUrnNovaProposicao(subemenda, numeroOriginal).urn).to.contain(';999999');
    });
  });

  describe('descrição do documento', () => {
    const urnDe = (casa: CasaLegislativaEditor, parcial: Partial<DadosIdentificacao>): { urn: string; ref?: string } => {
      const { urn, urnDocumentoReferenciado } = montaUrnNovaProposicao(dados(casa, parcial));
      return { urn, ref: urnDocumentoReferenciado };
    };

    it('proposição sem número, sem "Novo/Nova"', () => {
      inicializarVocabulario('SF');
      expect(descricaoDocumento(urnDe('SF', { tipoProposicao: nova('SF', 'PEC') }).urn, undefined, 'SF')).to.equal('Proposta de Emenda Constitucional (PEC)');
      expect(descricaoDocumento(urnDe('SF', { tipoProposicao: nova('SF', 'PL') }).urn, undefined, 'SF')).to.equal('Projeto de Lei (PL)');
    });

    it('proposição com número', () => {
      inicializarVocabulario('SF');
      const urn = urnDe('SF', { tipoProposicao: nova('SF', 'PL') }).urn.replace(';999999', ';123');
      expect(descricaoDocumento(urn, undefined, 'SF')).to.equal('Projeto de Lei (PL) nº 123, de 2026');
    });

    it('substitutivo do Senado', () => {
      inicializarVocabulario('SF');
      const { urn, ref } = urnDe('SF', { especie: 'substitutivo', tipoProposicao: referenciada('PL'), numeroProposicao: '10', anoProposicao: '2025' });
      expect(descricaoDocumento(urn, ref, 'SF')).to.equal('Substitutivo ao Projeto de Lei (PL) nº 10, de 2025');
    });

    it('substitutivo e subemenda da Câmara', () => {
      inicializarVocabulario('CD');
      const comum = { tipoProposicao: referenciada('PL'), numeroProposicao: '10', anoProposicao: '2025' };
      const sbt = urnDe('CD', { ...comum, especie: 'substitutivo', tipoSubstitutivo: substitutivoCd(TipoRelacaoSubstitutivo.E_SUBSTITUTIVO, 'SBT') });
      const ssp = urnDe('CD', { ...comum, especie: 'subemenda', tipoSubstitutivo: substitutivoCd(TipoRelacaoSubstitutivo.E_SUBEMENDA_SUBSTITUTIVA, 'SSP') });
      expect(descricaoDocumento(sbt.urn, sbt.ref, 'CD')).to.equal('Substitutivo (SBT) ao Projeto de Lei (PL) nº 10, de 2025');
      expect(descricaoDocumento(ssp.urn, ssp.ref, 'CD')).to.equal('Subemenda Substitutiva (SSP) ao Projeto de Lei (PL) nº 10, de 2025');
    });

    it('PLV sem número', () => {
      inicializarVocabulario('SF');
      const { urn, ref } = urnDe('SF', { tipoProposicao: nova('SF', 'PLV'), numeroMpv: '1200', anoMpv: '2026' });
      expect(descricaoDocumento(urn, ref, 'SF')).to.equal('Projeto de Lei de Conversão (MPV nº 1200, de 2026)');
    });

    it('PLV com número', () => {
      inicializarVocabulario('SF');
      const { urn, ref } = urnDe('SF', { tipoProposicao: nova('SF', 'PLV'), numeroMpv: '1200', anoMpv: '2026' });
      expect(descricaoDocumento(urn.replace(';999999', ';5'), ref, 'SF')).to.equal('Projeto de Lei de Conversão (PLV) nº 5, de 2026 (MPV nº 1200, de 2026)');
    });
  });
});
