import { expect } from '@open-wc/testing';
import { LexmlLinkerClient } from '../../../src/util/lexml-linker/lexmlLinkerClient';

// Corpus extraído de proposições reais (demo/doc/) via buildProjetoNormaFromJsonix — não frases sintéticas.
// Complementa a bateria de paridade CLI/WASM (docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md §8.7/§8.9):
// aqui o objetivo é robustez contra prosa legislativa real (múltiplas citações por frase, faixas de
// artigos, autorreferência "esta Lei"), não paridade de engine. Funciona como baseline de regressão:
// os resultados abaixo foram gerados e conferidos manualmente em 18/08/2026 (ver plano §8.9).
interface CasoCorpus {
  origem: string;
  rotulo: string;
  texto: string;
  matches: { textoRef: string; targetUrn: string; targetFragmento?: string }[];
}

const CORPUS: CasoCorpus[] = [
  {
    origem: 'mpv_1085_2021',
    rotulo: 'Art. 1º',
    texto:
      'Esta Medida Provisória dispõe sobre o Sistema Eletrônico dos Registros Públicos - SERP, de que trata o art. 37 da Lei nº 11.977, de 7 de julho de 2009, e moderniza e simplifica os procedimentos relativos.',
    matches: [{ textoRef: 'art. 37 da Lei nº 11.977, de 7 de julho de 2009', targetUrn: 'urn:lex:br:federal:lei:2009-07-07;11977', targetFragmento: 'art37' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'a)',
    texto: 'os entes públicos, inclusive por meio do Sistema Integrado de Recuperação de Ativos - Sira, de que trata o Capítulo V da Lei nº 14.195, de 26 de agosto de 2021; e',
    matches: [{ textoRef: 'Lei nº 14.195, de 26 de agosto de 2021', targetUrn: 'urn:lex:br:federal:lei:2021-08-26;14195' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: '§ 1º',
    texto: 'Os oficiais dos registros públicos de que trata a Lei nº 6.015, de 1973, integram o SERP.',
    matches: [{ textoRef: 'Lei nº 6.015, de 1973', targetUrn: 'urn:lex:br:federal:lei:1973;6015' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: '§ 4º',
    texto:
      'O SERP terá operador nacional, sob a forma de pessoa jurídica de direito privado, na forma prevista no incisos I ou III do caput do art. 44 da Lei nº 10.406, de 10 de janeiro de 2002 - Código Civil.',
    matches: [{ textoRef: 'caput do art. 44 da Lei nº 10.406, de 10 de janeiro de 2002', targetUrn: 'urn:lex:br:federal:lei:2002-01-10;10406', targetFragmento: 'art44_cpt' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: '§ 2º',
    texto:
      'O descumprimento do disposto neste artigo ensejará a aplicação das penas previstas no art. 32 da Lei nº 8.935, de 18 de novembro de 1994, nos termos estabelecidos pela Corregedoria Nacional de Justiça.',
    matches: [{ textoRef: 'art. 32 da Lei nº 8.935, de 18 de novembro de 1994', targetUrn: 'urn:lex:br:federal:lei:1994-11-18;8935', targetFragmento: 'art32' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'Art. 7º',
    texto:
      'Caberá à Corregedoria Nacional de Justiça do Conselho Nacional de Justiça disciplinar os art. 37 a art. 41 e o art. 45 da Lei nº 11.977, de 2009, e o disposto nesta Medida Provisória.',
    matches: [
      { textoRef: 'art. 41', targetUrn: 'urn:lex:br:federal:lei:2009;11977', targetFragmento: 'art41' },
      { textoRef: 'art. 45 da Lei nº 11.977, de 2009', targetUrn: 'urn:lex:br:federal:lei:2009;11977', targetFragmento: 'art45' },
    ],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'V –',
    texto: 'a forma de integração do Sistema de Registro Eletrônico de Imóveis - SREI, de que trata o art. 76 da Lei nº 13.465, de 11 de julho de 2017, ao SERP;',
    matches: [{ textoRef: 'art. 76 da Lei nº 13.465, de 11 de julho de 2017', targetUrn: 'urn:lex:br:federal:lei:2017-07-11;13465', targetFragmento: 'art76' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'VI –',
    texto: 'a forma de integração da Central Nacional de Registro de Títulos e Documentos, prevista no § 2º do art. 3º da Lei nº 13.775, de 20 de dezembro de 2018, ao SERP;',
    matches: [{ textoRef: '§ 2º do art. 3º da Lei nº 13.775, de 20 de dezembro de 2018', targetUrn: 'urn:lex:br:federal:lei:2018-12-20;13775', targetFragmento: 'art3_par2' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'Art. 10.',
    texto: 'A Lei nº 4.591, de 16 de dezembro de 1964, passa a vigorar com as seguintes alterações:',
    matches: [{ textoRef: 'Lei nº 4.591, de 16 de dezembro de 1964', targetUrn: 'urn:lex:br:federal:lei:1964-12-16;4591' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'Art. 14.',
    texto: 'A Lei nº 10.406, de 10 de janeiro de 2002 - Código Civil passa a vigorar com as seguintes alterações:',
    matches: [{ textoRef: 'Lei nº 10.406, de 10 de janeiro de 2002', targetUrn: 'urn:lex:br:federal:lei:2002-01-10;10406' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'Art. 19.',
    texto: 'O disposto no art. 206-A da Lei nº 6.015, de 1973, deverá ser implementado, em todo o território nacional, no prazo de cento e cinquenta dias.',
    matches: [{ textoRef: 'art. 206-A da Lei nº 6.015, de 1973', targetUrn: 'urn:lex:br:federal:lei:1973;6015', targetFragmento: 'art206-1' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'I –',
    texto: 'os seguintes dispositivos do art. 32 da Lei nº 4.591, de 1964:',
    matches: [{ textoRef: 'art. 32 da Lei nº 4.591, de 1964', targetUrn: 'urn:lex:br:federal:lei:1964;4591', targetFragmento: 'art32' }],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'VII –',
    texto: 'o art. 2º da Lei nº 12.441, de 11 de julho de 2011, na parte em que altera os seguintes dispositivos da Lei nº 10.406, de 2002 - Código Civil:',
    matches: [
      { textoRef: 'art. 2º da Lei nº 12.441, de 11 de julho de 2011', targetUrn: 'urn:lex:br:federal:lei:2011-07-11;12441', targetFragmento: 'art2' },
      { textoRef: 'Lei nº 10.406, de 2002', targetUrn: 'urn:lex:br:federal:lei:2002;10406' },
    ],
  },
  {
    origem: 'mpv_1085_2021',
    rotulo: 'IX –',
    texto: 'o parágrafo único do art. 54 da Lei nº 13.097, de 2015; e',
    matches: [{ textoRef: 'parágrafo único do art. 54 da Lei nº 13.097, de 2015', targetUrn: 'urn:lex:br:federal:lei:2015;13097', targetFragmento: 'art54_par1u' }],
  },
  {
    origem: 'mpv_1170_2023',
    rotulo: 'Art. 2º',
    texto: 'Os Anexos IV-A, V-B e V-C à Lei nº 11.233, de 22 de dezembro de 2005, passam a vigorar, respectivamente, na forma dos Anexos I, II e III a esta Medida Provisória.',
    matches: [{ textoRef: 'Lei nº 11.233, de 22 de dezembro de 2005', targetUrn: 'urn:lex:br:federal:lei:2005-12-22;11233' }],
  },
  {
    origem: 'mpv_1170_2023',
    rotulo: 'Art. 5º',
    texto:
      'Os Anexos XVIII, XVIII-A, XVIII-B e XVIII-C à Lei nº 11.355, de 2006, passam a vigorar, respectivamente, na forma dos Anexos X, XI, XII e XIII a esta Medida Provisória.',
    matches: [{ textoRef: 'Lei nº 11.355, de 2006', targetUrn: 'urn:lex:br:federal:lei:2006;11355' }],
  },
  {
    origem: 'mpv_1170_2023',
    rotulo: 'Art. 92.',
    texto:
      'A remuneração do pessoal submetido ao regime jurídico previsto na Consolidação das Leis do Trabalho, aprovada pelo Decreto-Lei nº 5.452, de 1º de maio de 1943, incluído no quadro de pessoal do Banco Central do Brasil.',
    matches: [
      { textoRef: 'Consolidação das Leis do Trabalho', targetUrn: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452' },
      { textoRef: 'Decreto-Lei nº 5.452, de 1º de maio de 1943', targetUrn: 'urn:lex:br:federal:decreto.lei:1943-05-01;5452' },
    ],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'Art. 1º',
    texto: 'Esta Lei dispõe sobre a atualização da Lei nº 10.406, de 10 de janeiro de 2002 (Código Civil), e da legislação correlata.',
    matches: [{ textoRef: 'Lei nº 10.406, de 10 de janeiro de 2002', targetUrn: 'urn:lex:br:federal:lei:2002-01-10;10406' }],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'Art. 3º',
    texto: 'O Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal), passa a vigorar com a seguinte redação:',
    matches: [{ textoRef: 'Decreto-Lei nº 2.848, de 7 de dezembro de 1940', targetUrn: 'urn:lex:br:federal:decreto.lei:1940-12-07;2848' }],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'IV –',
    texto: 'o Decreto-Lei nº 3.200, de 19 de abril de 1941;',
    matches: [{ textoRef: 'Decreto-Lei nº 3.200, de 19 de abril de 1941', targetUrn: 'urn:lex:br:federal:decreto.lei:1941-04-19;3200' }],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'X –',
    texto: 'os arts. 181 e 182 do Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal); e',
    matches: [
      { textoRef: 'arts. 181', targetUrn: 'urn:lex:br:federal:decreto.lei:1940-12-07;2848', targetFragmento: 'art181' },
      { textoRef: '182 do Decreto-Lei nº 2.848, de 7 de dezembro de 1940', targetUrn: 'urn:lex:br:federal:decreto.lei:1940-12-07;2848', targetFragmento: 'art182' },
    ],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'Art. 7º',
    texto: 'A Lei nº 8.069, de 13 de julho de 1990 (Estatuto da Criança e do Adolescente), passa a vigorar com a seguinte redação:',
    matches: [{ textoRef: 'Lei nº 8.069, de 13 de julho de 1990', targetUrn: 'urn:lex:br:federal:lei:1990-07-13;8069' }],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'Art. 10.',
    texto: 'A Lei nº 13.105, de 16 de março de 2015 (Código de Processo Civil), passa a vigorar com a seguinte redação:',
    matches: [{ textoRef: 'Lei nº 13.105, de 16 de março de 2015', targetUrn: 'urn:lex:br:federal:lei:2015-03-16;13105' }],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'Art. 11.',
    texto: 'As pessoas jurídicas em geral têm o prazo de 2 (dois) anos, a partir da entrada em vigor desta Lei, para se adaptarem às regras nela previstas.',
    matches: [],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'Art. 12.',
    texto:
      'Os prazos de prescrição e de decadência, aumentados ou diminuídos por esta Lei, têm aplicação imediata para os fatos em curso, iniciando-se o prazo da sua entrada em vigor.',
    matches: [],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'Parágrafo único',
    texto:
      'No caso do parágrafo único do art. 1.379 da Lei nº 10.406, de 10 de janeiro de 2002 (Código Civil), deve ser computado o prazo já decorrido até a data da entrada em vigor desta Lei.',
    matches: [{ textoRef: 'Lei nº 10.406, de 10 de janeiro de 2002', targetUrn: 'urn:lex:br:federal:lei:2002-01-10;10406' }],
  },
  {
    origem: 'pl_4_2025',
    rotulo: 'Art. 16.',
    texto: 'A superação, por esta Lei, de causa de nulidade absoluta estabelecida originalmente na Lei nº 10.406, de 10 de janeiro de 2002 (Código Civil), convalida o ato.',
    matches: [{ textoRef: 'Lei nº 10.406, de 10 de janeiro de 2002', targetUrn: 'urn:lex:br:federal:lei:2002-01-10;10406' }],
  },
];

describe('LexmlLinkerClient — corpus real de proposições (integração com o WASM)', () => {
  let client: LexmlLinkerClient;

  beforeEach(() => {
    client = new LexmlLinkerClient();
  });

  afterEach(() => {
    client.encerrar();
  });

  CORPUS.forEach(caso => {
    it(`${caso.origem} ${caso.rotulo}`, async () => {
      const resultado = await client.detectarRemissoesExternas(caso.texto);
      const simplificado = (resultado || []).map(m =>
        m.targetFragmento ? { textoRef: m.textoRef, targetUrn: m.targetUrn, targetFragmento: m.targetFragmento } : { textoRef: m.textoRef, targetUrn: m.targetUrn }
      );
      expect(simplificado).to.deep.equal(caso.matches);
    });
  });
});
