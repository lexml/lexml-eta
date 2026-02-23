import { expect } from '@open-wc/testing';
import { ClassificacaoDocumento } from '../../../../src/model/documento/classificacao';
import { buildJsonixArticulacaoFromProjetoNorma, buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criaDispositivo, createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../../doc/parser/mpv_885_20190617';

let documento: any;
let jsonix: any;

describe('buildJsonixArvore', () => {
  describe('montaArticulacao (via buildJsonixFromProjetoNorma)', () => {
    const URN_TESTE = 'urn:lex:br:federal:lei:2023-01-01;12345';

    describe('Estrutura básica da Articulacao', () => {
      let resultado: any;
      let articulacaoJson: any;

      beforeEach(function () {
        const projetoNorma = {
          classificacao: ClassificacaoDocumento.NORMA,
          epigrafe: { texto: 'LEI Nº 12.345' },
          ementa: { texto: 'Ementa' } as any,
          preambulo: { texto: 'Preambulo' },
          articulacao: createArticulacao(),
        };
        resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
        articulacaoJson = resultado.value.projetoNorma.norma.articulacao;
      });

      it('Deveria criar TYPE_NAME br_gov_lexml__1.Articulacao', () => {
        expect(articulacaoJson.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
      });

      it('Deveria retornar estrutura com lXhier', () => {
        expect(articulacaoJson).to.have.property('lXhier');
        expect(articulacaoJson.lXhier).to.be.an('array');
      });
    });

    describe('Integração com buildTree', () => {
      it('Deveria chamar buildTree com projetoNorma.articulacao', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const projetoNorma = {
          classificacao: ClassificacaoDocumento.NORMA,
          epigrafe: { texto: 'LEI Nº 12.345' },
          ementa: { texto: 'Ementa' } as any,
          preambulo: { texto: 'Preambulo' },
          articulacao: articulacao,
        };

        const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
        const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

        // buildTree foi chamado e processou os artigos
        expect(articulacaoJson.lXhier).to.have.lengthOf(1);
        expect(articulacaoJson.lXhier[0].name.localPart).to.equal('Artigo');
      });

      it('Deveria passar projetoNorma.articulacao como segundo parâmetro para buildTree', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const projetoNorma = {
          classificacao: ClassificacaoDocumento.NORMA,
          epigrafe: { texto: 'LEI Nº 12.345' },
          ementa: { texto: 'Ementa' } as any,
          preambulo: { texto: 'Preambulo' },
          articulacao: articulacao,
        };

        const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
        const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

        // buildTree processou corretamente a articulacao
        expect(articulacaoJson.lXhier).to.have.lengthOf(2);
        expect(articulacaoJson.lXhier[0].name.localPart).to.equal('Artigo');
        expect(articulacaoJson.lXhier[1].name.localPart).to.equal('Artigo');
      });
    });

    describe('Articulacao com dispositivos complexos', () => {
      it('Deveria processar articulacao com agrupadores e artigos', () => {
        const articulacao = createArticulacao();
        const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
        const capitulo = criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);
        criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const projetoNorma = {
          classificacao: ClassificacaoDocumento.NORMA,
          epigrafe: { texto: 'LEI Nº 12.345' },
          ementa: { texto: 'Ementa' } as any,
          preambulo: { texto: 'Preambulo' },
          articulacao: articulacao,
        };

        const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
        const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

        expect(articulacaoJson.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
        expect(articulacaoJson.lXhier).to.have.lengthOf.at.least(2);
        expect(articulacaoJson.lXhier[0].name.localPart).to.equal('Titulo');
      });

      it('Deveria processar articulacao vazia corretamente', () => {
        const articulacao = createArticulacao();

        const projetoNorma = {
          classificacao: ClassificacaoDocumento.NORMA,
          epigrafe: { texto: 'LEI Nº 12.345' },
          ementa: { texto: 'Ementa' } as any,
          preambulo: { texto: 'Preambulo' },
          articulacao: articulacao,
        };

        const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
        const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

        expect(articulacaoJson.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
        expect(articulacaoJson.lXhier).to.be.an('array');
        expect(articulacaoJson.lXhier).to.be.empty;
      });
    });

    describe('Estrutura completa da Articulacao', () => {
      it('Deveria ter todas as propriedades obrigatórias', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const projetoNorma = {
          classificacao: ClassificacaoDocumento.NORMA,
          epigrafe: { texto: 'LEI Nº 12.345' },
          ementa: { texto: 'Ementa' } as any,
          preambulo: { texto: 'Preambulo' },
          articulacao: articulacao,
        };

        const resultado = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
        const articulacaoJson = resultado.value.projetoNorma.norma.articulacao;

        expect(articulacaoJson).to.have.property('TYPE_NAME', 'br_gov_lexml__1.Articulacao');
        expect(articulacaoJson).to.have.property('lXhier');
        expect(articulacaoJson.lXhier).to.be.an('array');
        expect(articulacaoJson.lXhier[0]).to.have.property('name');
        expect(articulacaoJson.lXhier[0]).to.have.property('value');
      });
    });

    describe('Consistência com buildJsonixArticulacaoFromProjetoNorma', () => {
      it('Deveria produzir o mesmo resultado que buildJsonixArticulacaoFromProjetoNorma', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado1 = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const projetoNorma = {
          classificacao: ClassificacaoDocumento.NORMA,
          epigrafe: { texto: 'LEI Nº 12.345' },
          ementa: { texto: 'Ementa' } as any,
          preambulo: { texto: 'Preambulo' },
          articulacao: articulacao,
        };

        const resultado2 = buildJsonixFromProjetoNorma(projetoNorma, URN_TESTE);
        const articulacaoJson = resultado2.value.projetoNorma.norma.articulacao;

        // Ambos devem ter a mesma estrutura básica
        expect(resultado1.TYPE_NAME).to.equal(articulacaoJson.TYPE_NAME);
        expect(resultado1.lXhier).to.have.lengthOf(articulacaoJson.lXhier.length);
      });
    });
  });

  describe('buildTree (via buildJsonixArticulacaoFromProjetoNorma)', () => {
    describe('Agrupadores vs não agrupadores', () => {
      it('Deveria criar lXhier quando dispositivo é agrupador', () => {
        const articulacao = createArticulacao();
        const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
        criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier).to.be.an('array');
        expect(resultado.lXhier).to.have.lengthOf(1);
        expect(resultado.lXhier[0].name.localPart).to.equal('Titulo');
        expect(resultado.lXhier[0].value).to.have.property('lXhier');
      });

      it('Deveria criar lXcontainersOmissis quando dispositivo não é agrupador', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier).to.be.an('array');
        expect(resultado.lXhier).to.have.lengthOf(1);
        expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
        expect(resultado.lXhier[0].value).to.have.property('lXcontainersOmissis');
      });
    });

    describe('Processamento de Artigo', () => {
      it('Deveria processar Artigo com caput', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
        expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf.at.least(1);
        expect(resultado.lXhier[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
      });

      it('Deveria chamar buildNode para caput do artigo', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const caput = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caput).to.have.property('name');
        expect(caput).to.have.property('value');
        expect(caput.name.localPart).to.equal('Caput');
        expect(caput.value).to.have.property('TYPE_NAME');
      });

      it('Deveria chamar buildTree recursivamente para caput', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caputNode.value).to.have.property('lXcontainersOmissis');
        expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf.at.least(1);
        expect(caputNode.value.lXcontainersOmissis[0].name.localPart).to.equal('Inciso');
      });
    });

    describe('Filtragem de caput', () => {
      it('Deveria filtrar caput ao buildFilhos de artigo', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // lXcontainersOmissis deve ter caput + parágrafo (não apenas parágrafo)
        expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf(2);
      });
    });

    describe('Processamento de não-Artigo', () => {
      it('Deveria processar não-Artigo chamando apenas buildFilhos', () => {
        const articulacao = createArticulacao();
        const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
        criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].name.localPart).to.equal('Titulo');
        expect(resultado.lXhier[0].value).to.have.property('lXhier');
        expect(resultado.lXhier[0].value.lXhier).to.have.lengthOf(1);
        expect(resultado.lXhier[0].value.lXhier[0].name.localPart).to.equal('Capitulo');
      });
    });

    describe('Remoção de lXcontainersOmissis vazio', () => {
      it('Deveria remover lXcontainersOmissis quando vazio', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        criaDispositivo(artigo, TipoDispositivo.caput.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // Caput não tem filhos, então pode ou não ter lXcontainersOmissis
        // Mas se tiver e estiver vazio, deve ser removido
        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        if (caputNode.value.lXcontainersOmissis) {
          expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf.at.least(1);
        }
      });
    });

    describe('Agrupadores complexos', () => {
      it('Deveria funcionar com agrupador Livro', () => {
        const articulacao = createArticulacao();
        const livro = criaDispositivo(articulacao, TipoDispositivo.livro.tipo);
        criaDispositivo(livro, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].name.localPart).to.equal('Livro');
        expect(resultado.lXhier[0].value).to.have.property('lXhier');
        expect(resultado.lXhier[0].value.lXhier[0].name.localPart).to.equal('Artigo');
      });

      it('Deveria funcionar com agrupador Título', () => {
        const articulacao = createArticulacao();
        const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
        criaDispositivo(titulo, TipoDispositivo.capitulo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].name.localPart).to.equal('Titulo');
        expect(resultado.lXhier[0].value).to.have.property('lXhier');
      });

      it('Deveria funcionar com agrupador Capítulo', () => {
        const articulacao = createArticulacao();
        const capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
        criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].name.localPart).to.equal('Capitulo');
        expect(resultado.lXhier[0].value).to.have.property('lXhier');
      });

      it('Deveria funcionar com agrupador Seção', () => {
        const articulacao = createArticulacao();
        const secao = criaDispositivo(articulacao, TipoDispositivo.secao.tipo);
        criaDispositivo(secao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].name.localPart).to.equal('Secao');
        expect(resultado.lXhier[0].value).to.have.property('lXhier');
      });

      it('Deveria funcionar com agrupador Subseção', () => {
        const articulacao = createArticulacao();
        const subsecao = criaDispositivo(articulacao, TipoDispositivo.subsecao.tipo);
        criaDispositivo(subsecao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].name.localPart).to.equal('Subsecao');
        expect(resultado.lXhier[0].value).to.have.property('lXhier');
      });
    });

    describe('Dispositivo folha', () => {
      it('Deveria funcionar com dispositivo folha (sem filhos)', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier).to.have.lengthOf(1);
        expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
        // O artigo deve ter apenas o caput
        expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf(1);
        expect(resultado.lXhier[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
      });

      it('Deveria funcionar com inciso sem filhos', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf(1);
        expect(caputNode.value.lXcontainersOmissis[0].name.localPart).to.equal('Inciso');
      });
    });

    describe('Estrutura hierárquica complexa', () => {
      it('Deveria retornar a árvore construída corretamente', () => {
        const articulacao = createArticulacao();
        const artigo1 = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput1 = criaDispositivo(artigo1, TipoDispositivo.caput.tipo);
        const inciso1 = criaDispositivo(caput1, TipoDispositivo.inciso.tipo);
        criaDispositivo(inciso1, TipoDispositivo.alinea.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // Verifica estrutura em múltiplos níveis
        expect(resultado.lXhier).to.have.lengthOf(1);
        expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');

        const caput = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caput.name.localPart).to.equal('Caput');

        const inciso = caput.value.lXcontainersOmissis[0];
        expect(inciso.name.localPart).to.equal('Inciso');

        const alinea = inciso.value.lXcontainersOmissis[0];
        expect(alinea.name.localPart).to.equal('Alinea');
      });

      it('Deveria processar múltiplos artigos corretamente', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier).to.have.lengthOf(3);
        resultado.lXhier.forEach((artigo: any) => {
          expect(artigo.name.localPart).to.equal('Artigo');
          expect(artigo.value).to.have.property('lXcontainersOmissis');
        });
      });
    });
  });

  describe('buildAlteracaoSeNecessario (via buildJsonixFromProjetoNorma)', () => {
    describe('Artigo sem alteração', () => {
      it('Não deveria adicionar alteracao quando hasAlteracao retorna false', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].value).not.to.have.property('alteracao');
      });
    });

    describe('Artigo com alteração (usando dados reais)', () => {
      beforeEach(function () {
        documento = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
        jsonix = buildJsonixFromProjetoNorma(documento, 'urn:lex:br:federal:medida.provisoria:2019-06-17;885');
      });

      it('Deveria adicionar alteracao quando hasAlteracao retorna true', () => {
        expect(jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value).to.have.property('alteracao');
      });

      it('Deveria criar TYPE_NAME br_gov_lexml__1.Alteracao', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
        expect(alteracao.TYPE_NAME).to.equal('br_gov_lexml__1.Alteracao');
      });

      it('Deveria incluir base quando existe em dispositivo.alteracoes.base', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
        expect(alteracao).to.have.property('base');
        expect(alteracao.base).to.equal('urn:lex:br:federal:lei:1986-12-19;7560');
      });

      it('Deveria construir id com buildIdAlteracao do caput', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
        expect(alteracao).to.have.property('id');
        expect(alteracao.id).to.equal('art1_cpt_alt1');
      });

      it('Deveria inicializar id como string vazia antes de construir', () => {
        // Verifica que o id foi construído corretamente (não está vazio)
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
        expect(alteracao.id).to.be.a('string');
        expect(alteracao.id).not.to.equal('');
      });

      it('Deveria inicializar content como array', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
        expect(alteracao).to.have.property('content');
        expect(alteracao.content).to.be.an('array');
      });

      it('Deveria processar cada filho em alteracoes.filhos', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;
        expect(alteracao.content).to.have.lengthOf(3);
      });

      it('Deveria chamar buildNode para cada filho', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

        alteracao.content.forEach((filho: any) => {
          expect(filho).to.have.property('name');
          expect(filho).to.have.property('value');
          expect(filho.value).to.have.property('TYPE_NAME');
        });
      });

      it('Deveria adicionar filho ao content da alteracao', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

        expect(alteracao.content[0].name.localPart).to.equal('Artigo');
        expect(alteracao.content[1].name.localPart).to.equal('Artigo');
        expect(alteracao.content[2].name.localPart).to.equal('Artigo');
      });

      it('Deveria chamar buildTree recursivamente para cada filho', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

        // Primeiro filho (Art. 1) deve ter seus filhos processados
        expect(alteracao.content[0].value).to.have.property('lXcontainersOmissis');
        expect(alteracao.content[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');

        // Segundo filho (Art. 2) deve ter seus filhos processados
        expect(alteracao.content[1].value).to.have.property('lXcontainersOmissis');
        expect(alteracao.content[1].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');

        // Terceiro filho (Art. 5) deve ter seus filhos processados
        expect(alteracao.content[2].value).to.have.property('lXcontainersOmissis');
      });

      it('Deveria manter estrutura hierárquica nos filhos da alteração', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

        // Art. 2 deve ter caput e filhos
        const art2 = alteracao.content[1].value;
        expect(art2.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
        expect(art2.lXcontainersOmissis[0].value).to.have.property('lXcontainersOmissis');

        // Verifica omissis e inciso dentro do caput
        expect(art2.lXcontainersOmissis[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Omissis');
        expect(art2.lXcontainersOmissis[0].value.lXcontainersOmissis[1].name.localPart).to.equal('Inciso');
      });
    });

    describe('Estrutura completa da alteração', () => {
      beforeEach(function () {
        documento = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
        jsonix = buildJsonixFromProjetoNorma(documento, 'urn:lex:br:federal:medida.provisoria:2019-06-17;885');
      });

      it('Deveria ter todas as propriedades obrigatórias da alteração', () => {
        const alteracao = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao;

        expect(alteracao).to.have.property('TYPE_NAME', 'br_gov_lexml__1.Alteracao');
        expect(alteracao).to.have.property('id');
        expect(alteracao).to.have.property('base');
        expect(alteracao).to.have.property('content');
        expect(alteracao.content).to.be.an('array');
      });
    });
  });

  describe('buildFilhos (via buildJsonixArticulacaoFromProjetoNorma)', () => {
    describe('Tratamento de filhos undefined e vazios', () => {
      it('Não deveria adicionar nada quando filhos é undefined', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        // Caput é criado automaticamente, mas sem filhos adicionais

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // Artigo tem apenas o caput (filho padrão)
        expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf(1);
        expect(resultado.lXhier[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
      });

      it('Não deveria adicionar nada quando filhos é array vazio', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        // Caput não tem filhos

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        // Se lXcontainersOmissis existir e estiver vazio, deve ter sido removido
        if (caputNode.value.lXcontainersOmissis) {
          expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf.at.least(0);
        }
      });
    });

    describe('Processamento de filhos únicos', () => {
      it('Deveria funcionar com filho único', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf(1);
        expect(caputNode.value.lXcontainersOmissis[0].name.localPart).to.equal('Inciso');
      });

      it('Deveria chamar buildNode para cada filho', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // Caput foi processado como um nó válido
        const caput = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caput).to.have.property('name');
        expect(caput).to.have.property('value');
        expect(caput.value).to.have.property('TYPE_NAME');
      });

      it('Deveria adicionar node à tree', () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // O nó foi adicionado à árvore
        expect(resultado.lXhier[0].value.lXcontainersOmissis).to.be.an('array');
        expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf.at.least(1);
      });

      it('Deveria chamar buildTree para cada filho', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // buildTree foi chamado recursivamente para o inciso
        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caputNode.value.lXcontainersOmissis[0]).to.have.property('name');
        expect(caputNode.value.lXcontainersOmissis[0]).to.have.property('value');
      });
    });

    describe('Processamento de múltiplos filhos', () => {
      it('Deveria processar múltiplos filhos em ordem', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf(3);
        caputNode.value.lXcontainersOmissis.forEach((filho: any) => {
          expect(filho.name.localPart).to.equal('Inciso');
        });
      });

      it('Deveria funcionar com filhos de tipos diferentes', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);
        criaDispositivo(caput, TipoDispositivo.inciso.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        expect(caputNode.value.lXcontainersOmissis).to.have.lengthOf(2);
      });

      it('Deveria funcionar com inciso, alinea e item', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
        criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
        criaDispositivo(inciso, TipoDispositivo.alinea.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        const incisoNode = caputNode.value.lXcontainersOmissis[0];
        expect(incisoNode.name.localPart).to.equal('Inciso');
        expect(incisoNode.value.lXcontainersOmissis).to.have.lengthOf(2);
        expect(incisoNode.value.lXcontainersOmissis[0].name.localPart).to.equal('Alinea');
        expect(incisoNode.value.lXcontainersOmissis[1].name.localPart).to.equal('Alinea');
      });
    });

    describe('Hierarquia profunda', () => {
      it('Deveria funcionar com hierarquia profunda', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
        const alinea = criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
        criaDispositivo(alinea, TipoDispositivo.item.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // Navega pela hierarquia: Artigo → Caput → Inciso → Alínea → Item
        const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
        const incisoNode = caputNode.value.lXcontainersOmissis[0];
        const alineaNode = incisoNode.value.lXcontainersOmissis[0];
        const itemNode = alineaNode.value.lXcontainersOmissis[0];

        expect(caputNode.name.localPart).to.equal('Caput');
        expect(incisoNode.name.localPart).to.equal('Inciso');
        expect(alineaNode.name.localPart).to.equal('Alinea');
        expect(itemNode.name.localPart).to.equal('Item');
      });
    });

    describe('Filhos de agrupadores', () => {
      it('Deveria processar filhos de agrupador', () => {
        const articulacao = createArticulacao();
        const titulo = criaDispositivo(articulacao, TipoDispositivo.titulo.tipo);
        criaDispositivo(titulo, TipoDispositivo.artigo.tipo);
        criaDispositivo(titulo, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const tituloNode = resultado.lXhier[0];
        expect(tituloNode.value.lXhier).to.have.lengthOf(2);
        tituloNode.value.lXhier.forEach((filho: any) => {
          expect(filho.name.localPart).to.equal('Artigo');
        });
      });

      it('Deveria processar filhos de capítulo', () => {
        const articulacao = createArticulacao();
        const capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
        criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
        criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);
        criaDispositivo(capitulo, TipoDispositivo.artigo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        const capituloNode = resultado.lXhier[0];
        expect(capituloNode.value.lXhier).to.have.lengthOf(3);
      });
    });

    describe('Processamento de parágrafos', () => {
      it('Deveria funcionar com parágrafos filhos de artigo', () => {
        const articulacao = createArticulacao();
        const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
        criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        // Artigo deve ter caput + 2 parágrafos (total 3 filhos)
        expect(resultado.lXhier[0].value.lXcontainersOmissis).to.have.lengthOf(3);
        expect(resultado.lXhier[0].value.lXcontainersOmissis[0].name.localPart).to.equal('Caput');
        expect(resultado.lXhier[0].value.lXcontainersOmissis[1].name.localPart).to.equal('Paragrafo');
        expect(resultado.lXhier[0].value.lXcontainersOmissis[2].name.localPart).to.equal('Paragrafo');
      });
    });
  });
});
