import { expect, fixture } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaConfig, LexmlEtaParametrosEdicao } from '../../../src';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { rootStore } from '../../../src/redux/store';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import {
  lexeditSalvo,
  metadadoProprietarioLexEdit,
  novoDocumentoArticulado,
  novoDocumentoComTextoLiteral,
  TEXTO_LITERAL,
  TYPE_NAME_OPCOES_IMPRESSAO,
} from '../../doc/documentoArticulado';

const JUSTIFICACAO = 'Não foi informado um texto de justificação.';

describe('ETA — salvar e abrir documento articulado', () => {
  let component: LexmlEtaComponent;
  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
  });

  it('abre e exporta a identificação e o conteúdo do arquivo', () => {
    const documento = component.getDocumentoArticulado();
    expect(documento.name.localPart).to.equal('LexML');
    expect(documento.value.metadado.identificacao.urn).to.include(':9999;999999');
    expect(documento.value.projetoNorma.norma.parteInicial.preambulo.p.length).to.equal(2);
  });

  it('preserva aspas e caracteres literais sem interpretá-los como HTML', async () => {
    await component.abrirDocumentoArticulado(novoDocumentoComTextoLiteral());
    const salvo = component.getDocumentoArticulado();
    const norma = salvo.value.projetoNorma.norma;
    expect(norma.parteInicial.epigrafe.content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.parteInicial.ementa.content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.parteInicial.preambulo.p[0].content).to.deep.equal([TEXTO_LITERAL]);
    expect(norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content).to.deep.equal([TEXTO_LITERAL]);
    await component.abrirDocumentoArticulado(salvo);
    expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
  });
  it('uma entrada inválida não substitui o documento aberto', async () => {
    const antes = component.getDocumentoArticulado();
    let rejeitou = false;
    try {
      await component.abrirDocumentoArticulado('{');
    } catch {
      rejeitou = true;
    }
    expect(rejeitou).to.equal(true);
    expect(component.getDocumentoArticulado()).to.deep.equal(antes);
  });

  it('sincroniza a edição pendente antes de obter os dados do arquivo', () => {
    const editor = component.querySelector('lexml-eta-proposicao-editor') as any;
    const flush = editor.flushEdicaoPendente;
    editor.flushEdicaoPendente = (): void => {
      rootStore.getState().elementoReducer.articulacao.filhos[0].texto = 'Última edição ainda na linha.';
    };
    try {
      const salvo = component.getDocumentoArticulado();
      expect(salvo.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis[0].value.p[0].content).to.deep.equal(['Última edição ainda na linha.']);
    } finally {
      editor.flushEdicaoPendente = flush;
    }
  });

  it('iniciar um novo documento não reutiliza o anterior nem altera o modelo padrão', async () => {
    const antes = JSON.stringify(DOCUMENTO_PADRAO);
    const params = new LexmlEtaParametrosEdicao();
    params.sigla = 'PL';
    await component.inicializarEdicao(params);
    const novo = component.getDocumentoArticulado();
    expect(novo.value.metadado.identificacao.urn).to.include(':9999;999999');
    expect(novo.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis).to.have.length(1);
    expect(JSON.stringify(DOCUMENTO_PADRAO)).to.equal(antes);
  });

  it('preserva a autoridade e o evento da URN recebida', async () => {
    const entrada = novoDocumentoArticulado();
    const urn = 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;123@data.evento;leitura;2026-03-19t14.00';
    entrada.value.metadado.identificacao.urn = urn;
    await component.abrirDocumentoArticulado(entrada);
    expect(component.getDocumentoArticulado().value.metadado.identificacao.urn).to.equal(urn);
  });

  it('exporta as opções de impressão do formulário', () => {
    const formulario = component.querySelector('lexml-eta-opcoes-impressao') as any;
    formulario.opcoesImpressao = { imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 16 };

    const salvo = component.getDocumentoArticulado();

    expect(lexeditSalvo(salvo).opcoesImpressao).to.deep.equal({
      TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO,
      imprimirBrasao: false,
      textoCabecalho: 'Gabinete do Senador',
      reduzirEspacoEntreLinhas: true,
      tamanhoFonte: 16,
    });
  });

  it('abre as opções de impressão do arquivo no formulário e volta ao padrão quando o arquivo não as tem', async () => {
    const formulario = component.querySelector('lexml-eta-opcoes-impressao') as any;
    const opcoes = { imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 18 };
    const entrada = novoDocumentoArticulado();
    entrada.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ opcoesImpressao: { TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO, ...opcoes } })];

    await component.abrirDocumentoArticulado(entrada);
    expect({ ...formulario.opcoesImpressao }).to.deep.equal(opcoes);
    expect(lexeditSalvo(component.getDocumentoArticulado()).opcoesImpressao).to.deep.equal({ TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO, ...opcoes });

    await component.abrirDocumentoArticulado(novoDocumentoArticulado());
    expect({ ...formulario.opcoesImpressao }).to.deep.equal({ imprimirBrasao: true, textoCabecalho: '', reduzirEspacoEntreLinhas: false, tamanhoFonte: 14 });
  });

  it('o tamanho de letra escolhido no formulário é gravado ao salvar', async () => {
    const formulario = component.querySelector('lexml-eta-opcoes-impressao') as any;
    await formulario.updateComplete;
    const select = formulario.shadowRoot.querySelector('#select-tamanho-fonte');
    const mudou = new Promise(resolve => select.addEventListener('sl-change', resolve, { once: true }));

    select.value = '16';
    await mudou;

    expect(formulario.opcoesImpressao.tamanhoFonte).to.equal(16);
    expect(lexeditSalvo(component.getDocumentoArticulado()).opcoesImpressao.tamanhoFonte).to.equal(16);
  });

  describe('local e data do fecho — salvar', () => {
    const textoFecho = (documento: any): string => documento.value.projetoNorma.norma.parteFinal?.localDataFecho.p[0].content[0];

    it('exporta o local derivado do destino e a data informada', () => {
      (component as any)._lexmlData.data = '2026-04-24';

      const salvo = component.getDocumentoArticulado();

      const lexedit = lexeditSalvo(salvo);
      expect(lexedit.local).to.equal('Sala das sessões');
      expect(lexedit.data).to.equal('2026-04-24');
      expect(textoFecho(salvo)).to.equal('Sala das sessões, 24 de abril de 2026.');
    });

    it('com "Não informar" exporta só o local', () => {
      (component as any)._lexmlData.data = '';

      const salvo = component.getDocumentoArticulado();

      expect(lexeditSalvo(salvo)).to.not.have.property('data');
      expect(textoFecho(salvo)).to.equal('Sala das sessões,');
    });

    it('com destino Comissão exporta "Sala da comissão"', () => {
      (component.querySelector('lexml-eta-destino') as any).colegiadoApreciador = { siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' };

      const salvo = component.getDocumentoArticulado();

      expect(lexeditSalvo(salvo).local).to.equal('Sala da comissão');
    });

    it('no modo anexo de parecer não exporta fecho', () => {
      (component as any)._lexmlData.data = '2026-04-24';
      (component as any).anexoParecer = true;

      const salvo = component.getDocumentoArticulado();

      const lexedit = lexeditSalvo(salvo);
      expect(lexedit).to.not.have.property('local');
      expect(lexedit).to.not.have.property('data');
      expect(salvo.value.projetoNorma.norma).to.not.have.property('parteFinal');
    });
  });

  describe('local e data do fecho — abrir', () => {
    const entradaComFecho = (lexedit: Record<string, unknown>): any => {
      const entrada = novoDocumentoArticulado();
      entrada.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit(lexedit)];
      return entrada;
    };
    const campoData = (): any => component.querySelector('lexml-eta-data');
    const localSalvo = (): string | undefined => lexeditSalvo(component.getDocumentoArticulado()).local;

    it('aplica a data lida ao campo "Data"', async () => {
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala das sessões', data: '2026-04-24' }));
      await campoData().updateComplete;

      expect(campoData().data).to.equal('2026-04-24');
      expect(campoData().shadowRoot.querySelector('#no-date').checked).to.equal(false);
    });

    it('sem data no arquivo seleciona "Não informar"', async () => {
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala das sessões' }));
      await campoData().updateComplete;

      expect(campoData().data).to.equal('');
      expect(campoData().shadowRoot.querySelector('#no-date').checked).to.equal(true);
    });

    it('preserva o local do arquivo enquanto o destino não muda', async () => {
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala da comissão', data: '2026-04-24' }));

      expect(localSalvo()).to.equal('Sala da comissão');
    });

    it('volta a derivar o local quando o destino muda', async () => {
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala da comissão', data: '2026-04-24' }));
      (component.querySelector('lexml-eta-destino') as any).colegiadoApreciador = {
        siglaCasaLegislativa: 'SF',
        tipoColegiado: 'Plenário via Comissão',
        siglaComissao: 'CCJ',
      };

      expect(localSalvo()).to.equal('Sala das sessões');
    });

    it('abrir outro documento não herda o local nem a data do anterior', async () => {
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala da comissão', data: '2026-04-24' }));
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());

      expect(localSalvo()).to.equal('Sala das sessões');
      expect(campoData().data).to.equal('');
    });

    it('salvar e reabrir preserva local, data e o texto do fecho', async () => {
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala da comissão', data: '2026-05-01' }));
      const salvo = component.getDocumentoArticulado();

      await component.abrirDocumentoArticulado(salvo);

      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
      expect((salvo.value.projetoNorma.norma as any).parteFinal.localDataFecho.p[0].content[0]).to.equal('Sala da comissão, 1º de maio de 2026.');
    });
  });

  describe('arquivo no formato provisório dos metadados do LexEdit', () => {
    const OPCOES = { imprimirBrasao: false, textoCabecalho: 'Gabinete do Senador', reduzirEspacoEntreLinhas: true, tamanhoFonte: 18 };

    // Documento com remissão inválida, opções de impressão e fecho, com MetadadoProprietario reescrito na chave `lexedit`.
    const entradaProvisoria = (): { entrada: any; idRemissao: string } => {
      const modelo = buildProjetoNormaFromJsonix(lerDocumentoArticulado(novoDocumentoArticulado()), true);
      const caput = (modelo.articulacao!.filhos[0] as Artigo).caput!;
      const textoRef = 'educação';
      const remissoes: Record<number, any[]> = {
        [caput.uuid!]: [{ refId: 'ref_x', targetLexmlId: 'artInexistente', textoRef, inicio: caput.texto!.indexOf(textoRef), valida: false }],
      };
      const entrada: any = criarDocumentoArticulado(modelo, modelo.urn!, remissoes, undefined, { local: 'Sala da comissão', data: '2026-04-24', opcoesImpressao: OPCOES });
      const idRemissao = remissoes[caput.uuid!][0].idPersistido;
      entrada.value.metadado.metadadoProprietario = [
        {
          TYPE_NAME: 'br_gov_lexml__1.MetadadoProprietario',
          fonte: 'http://www.lexml.gov.br/lexedit/1.0',
          lexedit: {
            local: 'Sala da comissão',
            data: '2026-04-24',
            opcoesImpressao: OPCOES,
            remissoesInternasInvalidas: { refIdsRemissoesInternas: [idRemissao] },
            pendencias: ['Corrigir remissões internas inválidas.'],
          },
        },
      ];
      return { entrada, idRemissao };
    };

    it('abre os grupos do formato provisório e salva somente no formato novo, com os mesmos valores', async () => {
      const { entrada, idRemissao } = entradaProvisoria();

      await component.abrirDocumentoArticulado(entrada);

      const formulario = component.querySelector('lexml-eta-opcoes-impressao') as any;
      expect({ ...formulario.opcoesImpressao }).to.deep.equal(OPCOES);
      const campoData = component.querySelector('lexml-eta-data') as any;
      await campoData.updateComplete;
      expect(campoData.data).to.equal('2026-04-24');
      const alertas = rootStore.getState().elementoReducer.ui?.alertas || [];
      expect(alertas.some((a: any) => String(a.id).startsWith('alerta-remissao-invalida-'))).to.equal(true);

      const salvo = component.getDocumentoArticulado();
      const [metadado] = salvo.value.metadado.metadadoProprietario!;
      expect(metadado).to.not.have.property('lexedit');
      expect(lexeditSalvo(salvo)).to.deep.equal({
        TYPE_NAME: 'br_gov_lexml_lexedit__1.Metadado',
        local: 'Sala da comissão',
        data: '2026-04-24',
        opcoesImpressao: { TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO, ...OPCOES },
        remissoesInternasInvalidas: { TYPE_NAME: 'br_gov_lexml_lexedit__1.RemissoesInternasInvalidas', refIdsRemissoesInternas: idRemissao },
        pendencias: { TYPE_NAME: 'br_gov_lexml_lexedit__1.Pendencias', pendencia: [JUSTIFICACAO, 'Corrigir remissões internas inválidas.'] },
      });
    });
  });

  describe('pendência de justificação não informada — salvar', () => {
    const pendenciasSalvas = (): string[] => lexeditSalvo(component.getDocumentoArticulado()).pendencias?.pendencia ?? [];

    it('grava a pendência quando a justificação está vazia', () => {
      expect(pendenciasSalvas()).to.deep.equal([JUSTIFICACAO]);
    });

    it('não grava a pendência quando a justificação tem texto', () => {
      (component as any)._lexmlJustificativa.setContent('<p>Justificação.</p>');
      expect(pendenciasSalvas()).to.not.include(JUSTIFICACAO);
    });

    it('não grava a pendência no modo anexo de parecer', () => {
      (component as any).anexoParecer = true;
      expect(pendenciasSalvas()).to.not.include(JUSTIFICACAO);
    });

    it('não grava a pendência com a obrigatoriedade desligada na configuração', () => {
      const config = new LexmlEtaConfig();
      config.justificacaoObrigatoria = false;
      component.lexmlEtaConfig = config;
      expect(pendenciasSalvas()).to.not.include(JUSTIFICACAO);
    });

    it('recalcula a pendência ao salvar, sem usar a gravada no arquivo', async () => {
      const salvo = component.getDocumentoArticulado();
      expect(lexeditSalvo(salvo).pendencias.pendencia).to.deep.equal([JUSTIFICACAO]);

      await component.abrirDocumentoArticulado(salvo);
      (component as any)._lexmlJustificativa.setContent('<p>Justificação.</p>');

      expect(lexeditSalvo(component.getDocumentoArticulado())).to.not.have.property('pendencias');
    });
  });

  describe('pendência de justificação não informada — ida e volta', () => {
    it('com a justificação vazia, salvar o documento reaberto gera os mesmos metadados', async () => {
      const salvo = component.getDocumentoArticulado();

      await component.abrirDocumentoArticulado(salvo);

      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
    });

    it('com a justificação preenchida, salvar o documento reaberto gera o mesmo documento, sem a pendência', async () => {
      (component as any)._lexmlJustificativa.setContent('<p>Justificação.</p>');
      const salvo = component.getDocumentoArticulado();
      expect(lexeditSalvo(salvo)).to.not.have.property('pendencias');

      await component.abrirDocumentoArticulado(salvo);

      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
    });
  });

  describe('justificação', () => {
    const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    // Formato de `texto` (`align-*`), o que setContent espera. Sem largura de tabela e coluna, que não voltam ao abrir.
    const COMPLETO =
      '<p class="align-justify">Texto <strong>negrito</strong>, <em>itálico</em> e <a href="https://www.congressonacional.leg.br" rel="noopener noreferrer" target="_blank">site</a>.</p>' +
      '<ul><li>um</li><li>dois</li></ul>' +
      '<table table_id="t1" border="1"><tr row_id="r1">' +
      '<td class="td-q" table_id="t1" row_id="r1" cell_id="c1"><p class="align-center">1</p><p>2</p></td>' +
      '<td class="td-q" table_id="t1" row_id="r1" cell_id="c2" colspan="2" rowspan="1"><p>3 4</p></td>' +
      '<td cell_id="c3" row_id="r1" table_id="t1" merge_id="c2"><p><br></p></td></tr></table>' +
      `<img src="${PNG}" width="50%"><p>fim</p>`;

    const editor = (): any => (component as any)._lexmlJustificativa;
    // setContent não relê o Quill; updateApenasTexto devolve o HTML como o Quill o normalizou, como numa edição.
    const carregar = (html: string): void => {
      editor().setContent(html);
      editor().updateApenasTexto();
    };
    const justificacaoSalva = (): any => component.getDocumentoArticulado().value.projetoNorma.justificacao;
    const alertaExibido = (): boolean => rootStore.getState().elementoReducer.ui.alertas.some((a: any) => a.id === 'alerta-global-justificativa');

    it('grava a justificação preenchida', () => {
      carregar('<p>Justificação.</p>');
      expect(justificacaoSalva()[0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value.content).to.deep.equal(['Justificação.']);
    });

    it('o documento já obtido não muda quando a justificação é alterada depois', () => {
      carregar('<p>Antes.</p>');
      const salvo = component.getDocumentoArticulado();
      carregar('<p>Depois.</p>');
      expect(salvo.value.projetoNorma.justificacao![0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value.content).to.deep.equal(['Antes.']);
    });

    it('não grava nem carrega a justificação no modo anexo de parecer', async () => {
      carregar('<p>Justificação.</p>');
      const comJustificacao = component.getDocumentoArticulado();
      (component as any).anexoParecer = true;
      expect(justificacaoSalva()).to.be.undefined;

      const config = new LexmlEtaConfig();
      config.anexoParecer = true;
      component.lexmlEtaConfig = config;
      carregar('');
      await component.abrirDocumentoArticulado(comJustificacao);
      expect(editor().texto).to.equal('');
    });

    it('abrir um documento com justificação carrega o texto e não exibe o alerta', async () => {
      carregar('<p>Justificação.</p>');
      const salvo = component.getDocumentoArticulado();
      carregar('');

      await component.abrirDocumentoArticulado(salvo);

      expect(editor().texto).to.equal('<p>Justificação.</p>');
      expect(editor().quill.getText().trim()).to.equal('Justificação.');
      expect(alertaExibido()).to.be.false;
    });

    it('abrir um documento sem justificação esvazia o editor e exibe o alerta', async () => {
      carregar('<p>Texto anterior.</p>');

      await component.abrirDocumentoArticulado(novoDocumentoArticulado());

      expect(editor().texto).to.equal('');
      expect(alertaExibido()).to.be.true;
    });

    it('ida e volta com o Quill real: salvar o documento reaberto gera o mesmo documento', async () => {
      carregar(COMPLETO);
      const salvo = component.getDocumentoArticulado();
      const blocos = salvo.value.projetoNorma.justificacao![0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento;
      expect(blocos.map((b: any) => b.name.localPart)).to.deep.equal(['p', 'ul', 'table', 'p', 'p']);

      expect(JSON.stringify(blocos[0])).to.include('"clazz":"align-justify"');
      expect(JSON.stringify(blocos[2])).to.include('"clazz":"p align-center"');
      expect(JSON.stringify(blocos[3])).to.include('"style":"width: 50%"');

      await component.abrirDocumentoArticulado(salvo);
      editor().updateApenasTexto();

      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
    });

    // Exceção da spec: o plugin de tabelas não guarda largura, e o setContent a descarta.
    it('a largura de tabela e coluna é gravada, mas não volta ao abrir', async () => {
      carregar('<table table_id="t1" border="1" style="width:80%"><tr row_id="r1"><td class="td-q" table_id="t1" row_id="r1" cell_id="c1" width="40%"><p>1</p></td></tr></table>');
      // carregar perde a largura; aplicada no DOM como faz o plugin ao mudar a largura.
      const tabela = editor().quill.root.querySelector('table');
      tabela.setAttribute('style', 'width:80%');
      tabela.querySelector('td').setAttribute('width', '40%');
      editor().updateApenasTexto();
      const salvo = component.getDocumentoArticulado();
      const gravada = salvo.value.projetoNorma.justificacao![0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value;
      expect(gravada.style).to.equal('width: 80%');
      expect(gravada.tr[0].tableCellElement[0].value.style).to.equal('width: 40%');

      await component.abrirDocumentoArticulado(salvo);
      editor().updateApenasTexto();

      const reaberta = component.getDocumentoArticulado().value.projetoNorma.justificacao![0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento[0].value;
      expect(reaberta.style).to.be.undefined;
      expect(reaberta.tr[0].tableCellElement[0].value.style).to.be.undefined;
    });
  });
});
