import { expect, fixture } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaParametrosEdicao } from '../../../src';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { rootStore } from '../../../src/redux/store';
import { novoDocumentoArticulado, novoDocumentoComTextoLiteral, TEXTO_LITERAL } from '../../doc/documentoArticulado';

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

    expect(salvo.value.metadado.metadadoProprietario![0].lexedit.opcoesImpressao).to.deep.equal({
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
    entrada.value.metadado.metadadoProprietario = [
      { TYPE_NAME: 'br_gov_lexml__1.MetadadoProprietario', fonte: 'http://www.lexml.gov.br/lexedit/1.0', lexedit: { opcoesImpressao: opcoes } },
    ];

    await component.abrirDocumentoArticulado(entrada);
    expect({ ...formulario.opcoesImpressao }).to.deep.equal(opcoes);
    expect(component.getDocumentoArticulado().value.metadado.metadadoProprietario![0].lexedit.opcoesImpressao).to.deep.equal(opcoes);

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
    expect(component.getDocumentoArticulado().value.metadado.metadadoProprietario![0].lexedit.opcoesImpressao!.tamanhoFonte).to.equal(16);
  });

  describe('local e data do fecho — salvar', () => {
    const textoFecho = (documento: any): string => documento.value.projetoNorma.norma.parteFinal?.localDataFecho.p[0].content[0];

    it('exporta o local derivado do destino e a data informada', () => {
      (component as any)._lexmlData.data = '2026-04-24';

      const salvo = component.getDocumentoArticulado();

      const lexedit = salvo.value.metadado.metadadoProprietario![0].lexedit;
      expect(lexedit.local).to.equal('Sala das sessões');
      expect(lexedit.data).to.equal('2026-04-24');
      expect(textoFecho(salvo)).to.equal('Sala das sessões, 24 de abril de 2026.');
    });

    it('com "Não informar" exporta só o local', () => {
      (component as any)._lexmlData.data = '';

      const salvo = component.getDocumentoArticulado();

      expect(salvo.value.metadado.metadadoProprietario![0].lexedit).to.not.have.property('data');
      expect(textoFecho(salvo)).to.equal('Sala das sessões,');
    });

    it('com destino Comissão exporta "Sala da comissão"', () => {
      (component.querySelector('lexml-eta-destino') as any).colegiadoApreciador = { siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' };

      const salvo = component.getDocumentoArticulado();

      expect(salvo.value.metadado.metadadoProprietario![0].lexedit.local).to.equal('Sala da comissão');
    });

    it('no modo anexo de parecer não exporta fecho', () => {
      (component as any)._lexmlData.data = '2026-04-24';
      (component as any).anexoParecer = true;

      const salvo = component.getDocumentoArticulado();

      const lexedit = salvo.value.metadado.metadadoProprietario![0].lexedit;
      expect(lexedit).to.not.have.property('local');
      expect(lexedit).to.not.have.property('data');
      expect(salvo.value.projetoNorma.norma).to.not.have.property('parteFinal');
    });
  });

  describe('local e data do fecho — abrir', () => {
    const entradaComFecho = (lexedit: Record<string, unknown>): any => {
      const entrada = novoDocumentoArticulado();
      entrada.value.metadado.metadadoProprietario = [{ TYPE_NAME: 'br_gov_lexml__1.MetadadoProprietario', fonte: 'http://www.lexml.gov.br/lexedit/1.0', lexedit }];
      return entrada;
    };
    const campoData = (): any => component.querySelector('lexml-eta-data');
    const localSalvo = (): string | undefined => component.getDocumentoArticulado().value.metadado.metadadoProprietario![0].lexedit.local;

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
});
