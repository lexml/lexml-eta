import { expect } from '@open-wc/testing';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { isDispositivoCabecaAlteracao, buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { createAlteracao, createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { SBT_2_PEC_18_2025 } from '../../../demo/doc/sbt_2_pec_18_2025';

// ============================================================
// Contexto do bug
// ============================================================
//
// Documentos como o SBT_2_PEC_18_2025 podem ter artigos que abrem aspas
// ("abreAspas": "s") dentro de agrupadores (Seção, Capítulo, etc.)
// que por sua vez estão dentro de um bloco de alteração (articulacaoAlteracao).
//
// Exemplo concreto:
//   art1.alteracoes
//     └─ sec3 (Seção, isDispositivoAlteracao=true, cabecaAlteracao=true)
//          └─ art144-2 (Artigo, isDispositivoAlteracao=true)
//          └─ art228  (Artigo, isDispositivoAlteracao=true, cabecaAlteracao=true)
//
// O campo `cabecaAlteracao = true` é corretamente atribuído em
// `buildProjetoNormaFromJsonix.buildDispositivo()`, mas
// `createElemento()` em `elementoUtil.ts` calcula `abreAspas` usando apenas
// `isDispositivoCabecaAlteracao(dispositivo)`, que verifica se o PAI DIRETO
// é uma articulacaoAlteracao. Como o pai de art228 é sec3 (Seção), a função
// retorna false e a aspa de abertura não é exibida no Quill.
// ============================================================

describe('abreAspas em dispositivo dentro de agrupador na articulacaoAlteracao', () => {
  // ----------------------------------------------------------
  // Caso SANIDADE: artigo DIRETAMENTE na articulacaoAlteracao
  // ----------------------------------------------------------
  describe('Caso sanidade: artigo diretamente na articulacaoAlteracao', () => {
    let artigo: Artigo;

    beforeEach(() => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      createAlteracao(art1);

      artigo = criaDispositivo(art1.alteracoes!, TipoDispositivo.artigo.tipo) as Artigo;
      artigo.isDispositivoAlteracao = true;
      (artigo as any).cabecaAlteracao = true;
    });

    it('isDispositivoCabecaAlteracao deve retornar true quando o pai é articulacaoAlteracao', () => {
      expect(isDispositivoCabecaAlteracao(artigo)).to.equal(true);
    });

    it('createElemento deve retornar abreAspas=true quando o pai é articulacaoAlteracao', () => {
      const elemento = createElemento(artigo);
      expect(elemento.abreAspas).to.equal(true);
    });
  });

  // ----------------------------------------------------------
  // Caso BUG: artigo dentro de agrupador (Seção) na articulacaoAlteracao
  // ----------------------------------------------------------
  describe('Caso com bug: artigo dentro de agrupador (Seção) na articulacaoAlteracao', () => {
    let artigoNaSecao: Artigo;

    beforeEach(() => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      createAlteracao(art1);

      // Seção diretamente na articulacaoAlteracao (cabeça de alteração)
      const secao = criaDispositivo(art1.alteracoes!, TipoDispositivo.secao.tipo);
      secao.isDispositivoAlteracao = true;
      (secao as any).cabecaAlteracao = true;

      // Artigo dentro da Seção — também marcado como cabeça de alteração
      // (situação real encontrada em sbt_2_pec_18_2025: art1_cpt_alt1_art228)
      artigoNaSecao = criaDispositivo(secao, TipoDispositivo.artigo.tipo) as Artigo;
      artigoNaSecao.isDispositivoAlteracao = true;
      (artigoNaSecao as any).cabecaAlteracao = true;
    });

    it('isDispositivoCabecaAlteracao retorna false para artigo dentro de Seção (demonstra o bug)', () => {
      // Demonstração: a função atual retorna false porque o pai é a Seção,
      // não a articulacaoAlteracao diretamente.
      expect(isDispositivoCabecaAlteracao(artigoNaSecao)).to.equal(false);
    });

    it('dispositivo.cabecaAlteracao é true (parseado corretamente pelo buildProjetoNormaFromJsonix)', () => {
      expect((artigoNaSecao as any).cabecaAlteracao).to.equal(true);
    });

    it('createElemento deve retornar abreAspas=true para artigo com cabecaAlteracao=true dentro de Seção [BUG]', () => {
      // Este teste FALHA com o código atual porque createElemento usa apenas
      // isDispositivoCabecaAlteracao, que ignora o flag cabecaAlteracao.
      const elemento = createElemento(artigoNaSecao);
      expect(elemento.abreAspas).to.equal(true);
    });
  });

  // ----------------------------------------------------------
  // Caso BUG: artigo dentro de agrupador (Capítulo) na articulacaoAlteracao
  // ----------------------------------------------------------
  describe('Caso com bug: artigo dentro de agrupador (Capítulo) na articulacaoAlteracao', () => {
    let artigoNoCapitulo: Artigo;

    beforeEach(() => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo) as Artigo;
      createAlteracao(art1);

      const capitulo = criaDispositivo(art1.alteracoes!, TipoDispositivo.capitulo.tipo);
      capitulo.isDispositivoAlteracao = true;

      artigoNoCapitulo = criaDispositivo(capitulo, TipoDispositivo.artigo.tipo) as Artigo;
      artigoNoCapitulo.isDispositivoAlteracao = true;
      (artigoNoCapitulo as any).cabecaAlteracao = true;
    });

    it('createElemento deve retornar abreAspas=true para artigo com cabecaAlteracao=true dentro de Capítulo [BUG]', () => {
      // Este teste FALHA com o código atual.
      const elemento = createElemento(artigoNoCapitulo);
      expect(elemento.abreAspas).to.equal(true);
    });
  });

  // ----------------------------------------------------------
  // Teste de integração: parse do sbt_2_pec_18_2025
  // ----------------------------------------------------------
  describe('Integração: sbt_2_pec_18_2025 — art1_cpt_alt1_art228', () => {
    let articulacao: any;

    before(() => {
      const projetoNorma = buildProjetoNormaFromJsonix(SBT_2_PEC_18_2025);
      articulacao = projetoNorma.articulacao;
    });

    it('O documento deve ser parseado sem erros', () => {
      expect(articulacao).to.not.equal(undefined);
    });

    it('art1_cpt_alt1_art228 deve ser encontrado na árvore de dispositivos', () => {
      const dispositivo = buscaDispositivoById(articulacao, 'art1_cpt_alt1_art228');
      expect(dispositivo).to.not.equal(undefined);
    });

    it('art1_cpt_alt1_art228 deve ter cabecaAlteracao=true (parseado corretamente do JSON)', () => {
      const dispositivo = buscaDispositivoById(articulacao, 'art1_cpt_alt1_art228');
      expect((dispositivo as any)?.cabecaAlteracao).to.equal(true);
    });

    it('art1_cpt_alt1_art228: elemento gerado por createElemento deve ter abreAspas=true [BUG]', () => {
      // Este teste FALHA com o código atual:
      // art1_cpt_alt1_art228 está dentro da Seção art1_cpt_alt1_sec3,
      // então isDispositivoCabecaAlteracao retorna false (pai = Seção, não articulacaoAlteracao).
      // Porém o campo cabecaAlteracao=true está corretamente presente no dispositivo.
      const dispositivo = buscaDispositivoById(articulacao, 'art1_cpt_alt1_art228');
      expect(dispositivo).to.not.equal(undefined);
      const elemento = createElemento(dispositivo!);
      expect(elemento.abreAspas).to.equal(true);
    });

    it('art1_cpt_alt1_sec3 (agrupador Seção) deve ter abreAspas=true (caso que já funciona)', () => {
      // A Seção é filha direta da articulacaoAlteracao, então funciona corretamente.
      const dispositivo = buscaDispositivoById(articulacao, 'art1_cpt_alt1_sec3');
      expect(dispositivo).to.not.equal(undefined);
      const elemento = createElemento(dispositivo!);
      expect(elemento.abreAspas).to.equal(true);
    });
  });
});
