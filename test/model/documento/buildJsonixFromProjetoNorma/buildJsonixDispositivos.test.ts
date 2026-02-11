import { expect } from '@open-wc/testing';
import { Articulacao } from '../../../../src/model/dispositivo/dispositivo';
import { buildJsonixArticulacaoFromProjetoNorma, buildJsonixFromProjetoNorma } from '../../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma';
import { buildProjetoNormaFromJsonix } from '../../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { criaDispositivo, createArticulacao } from '../../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../../src/model/lexml/tipo/tipoDispositivo';
import { MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR } from '../../../doc/parser/mpv_885_20190617';

let documento: any;

describe('buildJsonixDispositivos', () => {
  describe('Estrutura name', () => {
    it('Deveria criar estrutura name com namespaceURI correto', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.namespaceURI).to.equal('http://www.lexml.gov.br/1.0');
    });

    it('Deveria criar estrutura name com localPart igual ao tipo do dispositivo', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.localPart).to.equal('Artigo');
    });

    it('Deveria criar estrutura name com prefix vazio', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.prefix).to.equal('');
    });

    it('Deveria criar estrutura name com key formatado', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].name.key).to.equal('{http://www.lexml.gov.br/1.0}Artigo');
    });
  });

  describe('Estrutura value e TYPE_NAME', () => {
    it('Deveria criar estrutura value com TYPE_NAME', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value).to.have.property('TYPE_NAME');
    });

    it('Deveria chamar buildTypeName para obter TYPE_NAME', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value.TYPE_NAME).to.equal('br_gov_lexml__1.DispositivoType');
    });
  });

  describe('Tipos de dispositivos básicos', () => {
    const dispositivos = [
      {
        nome: 'Artigo',
        setup: (articulacao: Articulacao) => {
          criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0],
        typeName: 'br_gov_lexml__1.DispositivoType',
      },
      {
        nome: 'Caput',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0],
        typeName: 'br_gov_lexml__1.DispositivoType',
      },
      {
        nome: 'Inciso',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
          criaDispositivo(caput, TipoDispositivo.inciso.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0],
        typeName: 'br_gov_lexml__1.DispositivoType',
      },
      {
        nome: 'Alinea',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
          const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
          criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0],
        typeName: 'br_gov_lexml__1.DispositivoType',
      },
      {
        nome: 'Item',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
          const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
          const alinea = criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
          criaDispositivo(alinea, TipoDispositivo.item.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0],
        typeName: 'br_gov_lexml__1.DispositivoType',
      },
      {
        nome: 'Paragrafo',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[1],
        typeName: 'br_gov_lexml__1.DispositivoType',
      },
      {
        nome: 'Omissis',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
          criaDispositivo(caput, TipoDispositivo.omissis.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0],
        typeName: 'br_gov_lexml__1.Omissis',
      },
    ];

    dispositivos.forEach(({ nome, setup, getNode, typeName }) => {
      it(`Deveria funcionar com tipo ${nome}`, () => {
        const articulacao = createArticulacao();
        setup(articulacao);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
        const node = getNode(resultado);

        expect(node.name.localPart).to.equal(nome);
        expect(node.value.TYPE_NAME).to.equal(typeName);
      });
    });
  });

  describe('Agrupadores', () => {
    const agrupadores = [
      { tipo: TipoDispositivo.livro.tipo, nome: 'Livro' },
      { tipo: TipoDispositivo.titulo.tipo, nome: 'Titulo' },
      { tipo: TipoDispositivo.capitulo.tipo, nome: 'Capitulo' },
      { tipo: TipoDispositivo.secao.tipo, nome: 'Secao' },
      { tipo: TipoDispositivo.subsecao.tipo, nome: 'Subsecao' },
    ];

    agrupadores.forEach(({ tipo, nome }) => {
      it(`Deveria funcionar com agrupador ${nome}`, () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].name.localPart).to.equal(nome);
        expect(resultado.lXhier[0].value.TYPE_NAME).to.equal('br_gov_lexml__1.Hierarchy');
      });
    });
  });

  describe('Chamada a buildDispositivo', () => {
    it('Deveria chamar buildDispositivo para popular value', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // buildDispositivo foi chamado e populou o value com id
      expect(resultado.lXhier[0].value).to.have.property('id');
      expect(resultado.lXhier[0].value.id).to.be.a('string');
    });

    it('Deveria popular value com propriedades do dispositivo', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const artigo = resultado.lXhier[0].value;
      expect(artigo).to.have.property('TYPE_NAME');
      expect(artigo).to.have.property('id');
      expect(artigo).to.have.property('lXcontainersOmissis');
    });
  });

  describe('Estrutura completa do nó', () => {
    it('Deveria ter todas as propriedades obrigatórias do nó', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
      const node = resultado.lXhier[0];

      // Estrutura name
      expect(node.name).to.have.property('namespaceURI');
      expect(node.name).to.have.property('localPart');
      expect(node.name).to.have.property('prefix');
      expect(node.name).to.have.property('key');
      expect(node.name).to.have.property('string');

      // Estrutura value
      expect(node.value).to.have.property('TYPE_NAME');
      expect(node.value).to.have.property('id');

      // Verifica namespace correto
      expect(node.name.namespaceURI).to.equal('http://www.lexml.gov.br/1.0');
      expect(node.name.prefix).to.equal('');
      expect(node.name.key).to.equal('{http://www.lexml.gov.br/1.0}Artigo');
      expect(node.name.string).to.equal('{http://www.lexml.gov.br/1.0}Artigo');
    });
  });
});

describe('buildTypeName (via buildJsonixArticulacaoFromProjetoNorma)', () => {
  describe('Dispositivos que retornam Omissis', () => {
    it('Deveria retornar br_gov_lexml__1.Omissis para tipo Omissis', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.omissis.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const omissis = resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0];
      expect(omissis.value.TYPE_NAME).to.equal('br_gov_lexml__1.Omissis');
    });
  });

  describe('Agrupadores que retornam Hierarchy', () => {
    const agrupadores = [TipoDispositivo.livro.tipo, TipoDispositivo.titulo.tipo, TipoDispositivo.capitulo.tipo, TipoDispositivo.secao.tipo, TipoDispositivo.subsecao.tipo];

    agrupadores.forEach(tipo => {
      it(`Deveria retornar br_gov_lexml__1.Hierarchy para ${tipo}`, () => {
        const articulacao = createArticulacao();
        criaDispositivo(articulacao, tipo);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

        expect(resultado.lXhier[0].value.TYPE_NAME).to.equal('br_gov_lexml__1.Hierarchy');
      });
    });
  });

  describe('Dispositivos que retornam DispositivoType', () => {
    const dispositivos = [
      {
        nome: 'Artigo',
        setup: (articulacao: Articulacao) => {
          criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0],
      },
      {
        nome: 'Caput',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          criaDispositivo(artigo, TipoDispositivo.caput.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0],
      },
      {
        nome: 'Inciso',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
          criaDispositivo(caput, TipoDispositivo.inciso.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0],
      },
      {
        nome: 'Alinea',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
          const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
          criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0],
      },
      {
        nome: 'Item',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
          const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
          const alinea = criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
          criaDispositivo(alinea, TipoDispositivo.item.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0],
      },
      {
        nome: 'Paragrafo',
        setup: (articulacao: Articulacao) => {
          const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
          criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
        },
        getNode: (resultado: any) => resultado.lXhier[0].value.lXcontainersOmissis[0],
      },
    ];

    dispositivos.forEach(({ nome, setup, getNode }) => {
      it(`Deveria retornar br_gov_lexml__1.DispositivoType para ${nome}`, () => {
        const articulacao = createArticulacao();
        setup(articulacao);

        const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);
        const node = getNode(resultado);

        expect(node.value.TYPE_NAME).to.equal('br_gov_lexml__1.DispositivoType');
      });
    });
  });

  describe('Tipos de retorno por categoria', () => {
    it('Deveria diferenciar Omissis dos demais tipos', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      criaDispositivo(caput, TipoDispositivo.omissis.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const inciso = resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0];
      const omissis = resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[1];

      expect(inciso.value.TYPE_NAME).to.equal('br_gov_lexml__1.DispositivoType');
      expect(omissis.value.TYPE_NAME).to.equal('br_gov_lexml__1.Omissis');
    });

    it('Deveria diferenciar agrupadores de dispositivos normais', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.livro.tipo);
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value.TYPE_NAME).to.equal('br_gov_lexml__1.Hierarchy');
      expect(resultado.lXhier[1].value.TYPE_NAME).to.equal('br_gov_lexml__1.DispositivoType');
    });
  });

  describe('Casos especiais', () => {
    it('Deveria funcionar para Articulacao (edge case)', () => {
      // Articulacao é o root, normalmente não é processada por buildNode
      // Mas se fosse, deveria ter tratamento especial
      const articulacao = createArticulacao();

      // buildJsonixArticulacaoFromProjetoNorma não processa articulacao como dispositivo
      // ela é o root, então o teste é verificar que não dá erro
      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado).to.exist;
      expect(resultado.TYPE_NAME).to.equal('br_gov_lexml__1.Articulacao');
    });

    it('Deveria manter consistência de TYPE_NAME em hierarquia profunda', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      const inciso = criaDispositivo(caput, TipoDispositivo.inciso.tipo);
      const alinea = criaDispositivo(inciso, TipoDispositivo.alinea.tipo);
      criaDispositivo(alinea, TipoDispositivo.item.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Todos os dispositivos normais devem ter DispositivoType
      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value.TYPE_NAME).to.equal('br_gov_lexml__1.DispositivoType');

      const incisoNode = caputNode.value.lXcontainersOmissis[0];
      expect(incisoNode.value.TYPE_NAME).to.equal('br_gov_lexml__1.DispositivoType');

      const alineaNode = incisoNode.value.lXcontainersOmissis[0];
      expect(alineaNode.value.TYPE_NAME).to.equal('br_gov_lexml__1.DispositivoType');

      const itemNode = alineaNode.value.lXcontainersOmissis[0];
      expect(itemNode.value.TYPE_NAME).to.equal('br_gov_lexml__1.DispositivoType');
    });
  });
});

describe('buildDispositivo (via buildJsonixFromProjetoNorma)', () => {
  describe('12.1. ID e Rótulo', () => {
    it('Deveria incluir id criado com buildId', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      (artigo as any).numero = 1;

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value).to.have.property('id');
      expect(resultado.lXhier[0].value.id).to.be.a('string');
      expect(resultado.lXhier[0].value.id).to.match(/art\d+/);
    });

    it('Não deveria incluir rotulo para tipo Caput', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caput = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caput.value).not.to.have.property('rotulo');
    });

    it('Não deveria incluir rotulo para tipo Omissis', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.omissis.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const omissis = resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0];
      expect(omissis.value).not.to.have.property('rotulo');
    });

    it('Deveria incluir rotulo para outros tipos', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      (artigo as any).numero = 1;
      (artigo as any).rotulo = 'Art. 1º';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value).to.have.property('rotulo');
      expect(resultado.lXhier[0].value.rotulo).to.be.a('string');
    });
  });

  describe('12.2. HREF (usando dados reais com alterações)', () => {
    let jsonix: any;

    beforeEach(function () {
      documento = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
      jsonix = buildJsonixFromProjetoNorma(documento, 'urn:lex:br:federal:medida.provisoria:2019-06-17;885');
    });

    it('Deveria incluir href para dispositivo de alteracao tipo Artigo', () => {
      const artigo = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0];

      expect(artigo.value).to.have.property('href');
      expect(artigo.value.href).to.equal('art1');
    });

    it('Deveria incluir href para dispositivo de alteracao tipo Caput', () => {
      const caput = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.lXcontainersOmissis[0];

      expect(caput.value).to.have.property('href');
      expect(caput.value.href).to.equal('art1_cpt');
    });

    it('Deveria incluir href para dispositivo de alteracao tipo Inciso', () => {
      const inciso =
        jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[1].value.lXcontainersOmissis[0].value.lXcontainersOmissis[1];

      expect(inciso.value).to.have.property('href');
      expect(inciso.value.href).to.equal('art2_cpt_inc7');
    });

    it('Deveria incluir href para dispositivo de alteracao tipo Paragrafo', () => {
      const paragrafo = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[5];

      expect(paragrafo.value).to.have.property('href');
      expect(paragrafo.value.href).to.equal('art5_par4');
    });

    it('Para Caput não IncisoCaput, deveria usar href pai + "_" + href próprio', () => {
      const caput = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.lXcontainersOmissis[0];

      expect(caput.value.href).to.equal('art1_cpt');
    });

    it('Não deveria incluir href para dispositivo que não é alteracao', () => {
      // Artigo sem alteração
      const artigo = jsonix.value.projetoNorma.norma.articulacao.lXhier[4];

      expect(artigo.value).not.to.have.property('href');
    });
  });

  describe('12.3. Aspas e Nota de Alteração (usando dados reais)', () => {
    let jsonix: any;

    beforeEach(function () {
      documento = buildProjetoNormaFromJsonix(MEDIDA_PROVISORIA_COM_ALTERACAO_SEM_AGRUPADOR);
      jsonix = buildJsonixFromProjetoNorma(documento, 'urn:lex:br:federal:medida.provisoria:2019-06-17;885');
    });

    it('Deveria incluir abreAspas=s quando cabecaAlteracao existe', () => {
      const artigo = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0];

      expect(artigo.value).to.have.property('abreAspas', 's');
    });

    it('Deveria incluir rotulo quando cabecaAlteracao existe', () => {
      const artigo = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0];

      expect(artigo.value).to.have.property('rotulo');
      expect(artigo.value.rotulo).to.be.a('string');
    });

    it('Deveria incluir fechaAspas=s para Caput com irmão único', () => {
      const caput = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.lXcontainersOmissis[0];

      expect(caput.value).to.have.property('fechaAspas', 's');
    });

    it('Deveria incluir notaAlteracao com valor ou NR', () => {
      const caput = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[0].value.lXcontainersOmissis[0];

      expect(caput.value).to.have.property('notaAlteracao', 'NR');
    });

    it('Deveria incluir fechaAspas=s para última alteracao', () => {
      const paragrafo = jsonix.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.alteracao.content[2].value.lXcontainersOmissis[5];

      expect(paragrafo.value).to.have.property('fechaAspas', 's');
      expect(paragrafo.value).to.have.property('notaAlteracao');
    });
  });

  describe('12.4. Título do Dispositivo', () => {
    it('Não deveria incluir tituloDispositivo quando isValidText retorna false', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value).not.to.have.property('tituloDispositivo');
    });

    it('Deveria incluir tituloDispositivo quando definido', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      (artigo as any).tituloDispositivo = 'Título do Artigo';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value).to.have.property('tituloDispositivo');
      expect(resultado.lXhier[0].value.tituloDispositivo.TYPE_NAME).to.equal('br_gov_lexml__1.GenInline');
    });
  });

  describe('12.6. Agrupadores', () => {
    it('Deveria incluir nomeAgrupador para agrupadores', () => {
      const articulacao = createArticulacao();
      const capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
      (capitulo as any).texto = 'Capítulo I';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value).to.have.property('nomeAgrupador');
      expect(resultado.lXhier[0].value.nomeAgrupador.TYPE_NAME).to.equal('br_gov_lexml__1.GenInline');
    });

    it('Deveria chamar buildStructuredContent com campo texto para agrupadores', () => {
      const articulacao = createArticulacao();
      const capitulo = criaDispositivo(articulacao, TipoDispositivo.capitulo.tipo);
      (capitulo as any).texto = 'Capítulo Dos Dispositivos';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      expect(resultado.lXhier[0].value.nomeAgrupador.content).to.be.an('array');
      expect(resultado.lXhier[0].value.nomeAgrupador.content[0]).to.equal('Capítulo Dos Dispositivos');
    });
  });

  describe('12.7. Texto de Dispositivos', () => {
    it('Não deveria incluir texto/p para Artigo', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Artigo não tem p, tem lXcontainersOmissis
      expect(resultado.lXhier[0].value).not.to.have.property('p');
      expect(resultado.lXhier[0].value).to.have.property('lXcontainersOmissis');
    });

    it('Não deveria incluir texto/p para Omissis', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      criaDispositivo(caput, TipoDispositivo.omissis.tipo);

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const omissis = resultado.lXhier[0].value.lXcontainersOmissis[0].value.lXcontainersOmissis[0];
      expect(omissis.value).not.to.have.property('p');
    });

    it('Deveria incluir array p para dispositivo normal com texto', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Texto do caput';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value).to.have.property('p');
      expect(caputNode.value.p).to.be.an('array');
      expect(caputNode.value.p[0].TYPE_NAME).to.equal('br_gov_lexml__1.GenInline');
    });

    it('Deveria chamar buildStructuredContent com campo texto para p', () => {
      const articulacao = createArticulacao();
      const artigo = criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      const caput = criaDispositivo(artigo, TipoDispositivo.caput.tipo);
      (caput as any).texto = 'Texto do caput';

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      const caputNode = resultado.lXhier[0].value.lXcontainersOmissis[0];
      expect(caputNode.value.p[0].content).to.be.an('array');
      expect(caputNode.value.p[0].content[0]).to.equal('Texto do caput');
    });
  });

  describe('12.5. Retorno Antecipado', () => {
    it('Deveria retornar early quando tipo é Artigo', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, TipoDispositivo.artigo.tipo);
      (articulacao as any).texto = 'Texto do artigo'; // não deve ser processado

      const resultado = buildJsonixArticulacaoFromProjetoNorma(articulacao);

      // Artigo tem lXcontainersOmissis mas não tem p
      expect(resultado.lXhier[0].value).to.have.property('lXcontainersOmissis');
      expect(resultado.lXhier[0].value).not.to.have.property('p');
    });
  });
});
