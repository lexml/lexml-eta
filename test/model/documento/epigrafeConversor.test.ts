import { expect } from '@open-wc/testing';
import { buildJsonixFromProjetoNorma } from '../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildContent, buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criaElementoBr, isElementoBr, lerConteudoEpigrafe, montaConteudoEpigrafe, montaConteudoEpigrafeDeXml } from '../../../src/model/lexml/documento/conversor/epigrafe';
import { montaDocumentoNovaProposicao } from '../../../src/model/lexml/documento/modelo/montaDocumentoNovaProposicao';

const URN = 'urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999';
const EPIGRAFE = 'PROJETO DE LEI DE CONVERSÃO Nº        , DE 2026<br/>(Medida Provisória nº 1.234, de 2026)';

const estrutura = (jsonix: any): any => jsonix.value.projetoNorma.norma ?? jsonix.value.projetoNorma.projeto;
const conteudoEpigrafe = (jsonix: any): any[] => estrutura(jsonix).parteInicial.epigrafe.content;
const resumo = (conteudo: any[]): any[] => conteudo.map(e => (isElementoBr(e) ? 'BR' : typeof e === 'string' ? e : `<${e.name.localPart}>`));

describe('conversor da epígrafe', () => {
  describe('montaConteudoEpigrafeDeXml', () => {
    it('converte o <br/> em elemento br', () => {
      expect(resumo(montaConteudoEpigrafeDeXml(EPIGRAFE))).to.deep.equal(['PROJETO DE LEI DE CONVERSÃO Nº        , DE 2026', 'BR', '(Medida Provisória nº 1.234, de 2026)']);
    });

    it('decodifica as entidades XML em texto', () => {
      expect(montaConteudoEpigrafeDeXml('EMENDA - CCJ &amp; CAE')).to.deep.equal(['EMENDA - CCJ & CAE']);
    });

    it('sem br, devolve o texto como único conteúdo', () => {
      expect(montaConteudoEpigrafeDeXml('PROJETO DE LEI Nº 12, DE 2026')).to.deep.equal(['PROJETO DE LEI Nº 12, DE 2026']);
    });

    it('XML malformado fica como texto, como antes', () => {
      expect(montaConteudoEpigrafeDeXml('A & B')).to.deep.equal(['A & B']);
    });
  });

  describe('montaConteudoEpigrafe e lerConteudoEpigrafe', () => {
    const trechoComoTexto = (trecho: string): any[] => [trecho];

    it('intercala br entre os trechos, inclusive no fim', () => {
      expect(resumo(montaConteudoEpigrafe('A<br>B<br/>', trechoComoTexto))).to.deep.equal(['A', 'BR', 'B', 'BR']);
    });

    it('sem br, só o trecho', () => {
      expect(montaConteudoEpigrafe('A', trechoComoTexto)).to.deep.equal(['A']);
    });

    it('lê o br como <br/> e delega o resto', () => {
      const negrito = { name: { localPart: 'b' }, value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['X'] } };
      expect(lerConteudoEpigrafe(['A ', negrito, criaElementoBr(), 'B'], buildContent)).to.equal('A <b>X</b><br/>B');
    });

    it('conteúdo ausente vira texto vazio', () => {
      expect(lerConteudoEpigrafe(undefined, buildContent)).to.equal('');
    });
  });

  describe('documento', () => {
    it('nova proposição grava o elemento br na epígrafe', () => {
      const doc = montaDocumentoNovaProposicao(URN, EPIGRAFE, 'O CONGRESSO NACIONAL decreta:');
      expect(resumo(conteudoEpigrafe(doc))).to.deep.equal(['PROJETO DE LEI DE CONVERSÃO Nº        , DE 2026', 'BR', '(Medida Provisória nº 1.234, de 2026)']);
    });

    it('abrir preserva a quebra, e salvar e reabrir também', () => {
      const aberto = buildProjetoNormaFromJsonix(montaDocumentoNovaProposicao(URN, EPIGRAFE, 'O CONGRESSO NACIONAL decreta:'));
      expect(aberto.epigrafe).to.equal(EPIGRAFE);
      expect((aberto.articulacao as any).texto).to.equal(EPIGRAFE);

      const salvo = buildJsonixFromProjetoNorma(aberto, URN);
      expect(resumo(conteudoEpigrafe(salvo))).to.deep.equal(['PROJETO DE LEI DE CONVERSÃO Nº        , DE 2026', 'BR', '(Medida Provisória nº 1.234, de 2026)']);
      expect(buildProjetoNormaFromJsonix(salvo).epigrafe).to.equal(EPIGRAFE);
    });

    it('a ementa não ganha tratamento de br', () => {
      const doc = montaDocumentoNovaProposicao(URN, EPIGRAFE, 'P');
      estrutura(doc).parteInicial.ementa = { TYPE_NAME: 'br_gov_lexml__1.GenInline', id: 'ementa', content: ['Linha', criaElementoBr(), 'Outra'] };
      expect(buildProjetoNormaFromJsonix(doc).ementa?.texto).to.equal('LinhaOutra');
    });

    it('epígrafe sem br é gravada como antes', () => {
      const doc = montaDocumentoNovaProposicao('urn:lex:br:senado.federal:projeto.lei;pl:2026;999999', 'PROJETO DE LEI Nº 12, DE 2026', 'P');
      expect(conteudoEpigrafe(buildJsonixFromProjetoNorma(buildProjetoNormaFromJsonix(doc), 'urn:x'))).to.deep.equal(['PROJETO DE LEI Nº 12, DE 2026']);
    });
  });
});
