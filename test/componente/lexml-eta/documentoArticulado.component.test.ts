import { expect, fixture } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { DOCUMENTO_PADRAO } from '../../../src/model/lexml/documento/modelo/documentoPadrao';
import { rootStore } from '../../../src/redux/store';
import { encodeHtml } from '../../../src/util/string-util';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { criarDocumentoArticulado, lerDocumentoArticulado } from '../../../src/model/lexml/documento/documentoArticulado';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { Autoria, Parlamentar } from '../../../src/model/proposicao/proposicao';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { RENUMERAR_ELEMENTO } from '../../../src/model/lexml/acao/renumerarElementoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { MPV_1234_2024 } from '../../doc/mpv_1234_2024';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { removerAlerta } from '../../../src/model/alerta/acao/removerAlerta';
import {
  congelarRelogio,
  DATA_ULTIMA_MODIFICACAO_CONGELADA,
  lexeditSalvo,
  metadadoProprietarioLexEdit,
  novoDocumentoArticulado,
  novoDocumentoComTextoLiteral,
  restaurarRelogio,
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

  afterEach(restaurarRelogio);

  it('abre e exporta a identificação e o conteúdo do arquivo', () => {
    const documento = component.getDocumentoArticulado();
    expect(documento.name.localPart).to.equal('LexML');
    expect(documento.value.metadado.identificacao.urn).to.include(':9999;999999');
    expect(documento.value.projetoNorma.norma.parteInicial.preambulo.p.length).to.equal(2);
  });

  it('preserva aspas e caracteres literais sem interpretá-los como HTML', async () => {
    congelarRelogio();
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
    await component.novaProposicao({ urn: 'urn:lex:br:senado.federal:projeto.lei;pl:9999;999999', epigrafe: 'PROJETO DE LEI', preambulo: '' });
    const novo = component.getDocumentoArticulado();
    expect(novo.value.metadado.identificacao.urn).to.include(':9999;999999');
    expect(novo.value.projetoNorma.norma.articulacao.lXhier[0].value.lXcontainersOmissis).to.have.length(1);
    expect(JSON.stringify(DOCUMENTO_PADRAO)).to.equal(antes);
  });

  it('preserva a autoridade e o evento da URN recebida', async () => {
    const entrada = novoDocumentoArticulado();
    const urn = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;123@data.evento;leitura;2026-03-19t14.00';
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

    it('no modo anexo de parecer exporta local, data e o fecho', () => {
      (component as any)._lexmlData.data = '2026-04-24';
      (component as any).anexoParecer = true;

      const salvo = component.getDocumentoArticulado();

      const lexedit = lexeditSalvo(salvo);
      expect(lexedit.local).to.equal('Sala das sessões');
      expect(lexedit.data).to.equal('2026-04-24');
      expect(textoFecho(salvo)).to.equal('Sala das sessões, 24 de abril de 2026.');
    });

    it('no modo anexo de parecer sem data exporta só o local', () => {
      (component as any)._lexmlData.data = '';
      (component as any).anexoParecer = true;

      const salvo = component.getDocumentoArticulado();

      expect(lexeditSalvo(salvo)).to.not.have.property('data');
      expect(textoFecho(salvo)).to.equal('Sala das sessões,');
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

    it('no modo anexo de parecer aplica a data lida e preserva local e data ao salvar e reabrir', async () => {
      congelarRelogio();
      await component.abrirDocumentoArticulado(entradaComFecho({ anexoParecer: true, local: 'Sala da comissão', data: '2026-04-24' }));
      await campoData().updateComplete;

      expect(campoData().data).to.equal('2026-04-24');
      const salvo = component.getDocumentoArticulado();
      expect(lexeditSalvo(salvo).local).to.equal('Sala da comissão');
      expect(lexeditSalvo(salvo).data).to.equal('2026-04-24');

      await component.abrirDocumentoArticulado(salvo);
      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
      // Remover o componente antes de o sl-tab-group renderizar lança no ResizeObserver do Shoelace.
      await (component.querySelector('sl-tab-group') as any).updateComplete;
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
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala das sessões', data: '2026-04-24' }));
      (component.querySelector('lexml-eta-destino') as any).colegiadoApreciador = {
        siglaCasaLegislativa: 'SF',
        tipoColegiado: 'Comissão',
        siglaComissao: 'CCJ',
      };

      expect(localSalvo()).to.equal('Sala da comissão');
    });

    it('abrir outro documento não herda o local nem a data do anterior', async () => {
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala da comissão', data: '2026-04-24' }));
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());

      expect(localSalvo()).to.equal('Sala das sessões');
      expect(campoData().data).to.equal('');
    });

    it('salvar e reabrir preserva local, data e o texto do fecho', async () => {
      congelarRelogio();
      await component.abrirDocumentoArticulado(entradaComFecho({ local: 'Sala da comissão', data: '2026-05-01' }));
      const salvo = component.getDocumentoArticulado();

      await component.abrirDocumentoArticulado(salvo);

      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
      expect((salvo.value.projetoNorma.norma as any).parteFinal.localDataFecho.p[0].content[0]).to.equal('Sala da comissão, 1º de maio de 2026.');
    });
  });

  describe('data da última modificação', () => {
    const DATA_ARQUIVO = '2026-05-12T10:15:00-03:00';
    const salvoCom = (dataUltimaModificacao: unknown): any => {
      const entrada = novoDocumentoArticulado();
      entrada.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ dataUltimaModificacao, opcoesImpressao: { tamanhoFonte: 18 } })];
      return entrada;
    };
    const opcoesImpressao = (): any => (component.querySelector('lexml-eta-opcoes-impressao') as any).opcoesImpressao;

    it('salvar grava o instante do salvamento, com fuso', () => {
      congelarRelogio();
      expect(lexeditSalvo(component.getDocumentoArticulado()).dataUltimaModificacao).to.equal(DATA_ULTIMA_MODIFICACAO_CONGELADA);
      expect(DATA_ULTIMA_MODIFICACAO_CONGELADA).to.match(/^2026-10-29T10:15:30[+-]\d{2}:\d{2}$/);
    });

    it('salvar de novo, num instante posterior, grava o novo instante', () => {
      const relogio = congelarRelogio();
      const primeiro = lexeditSalvo(component.getDocumentoArticulado()).dataUltimaModificacao;
      relogio.tick(65_000);

      const segundo = lexeditSalvo(component.getDocumentoArticulado()).dataUltimaModificacao;

      expect(segundo).to.not.equal(primeiro);
      expect(Date.parse(segundo) - Date.parse(primeiro)).to.equal(65_000);
    });

    it('abrir um arquivo com a data preenche a propriedade, e obter o documento não a altera', async () => {
      await component.abrirDocumentoArticulado(salvoCom(DATA_ARQUIVO));
      expect(component.dataUltimaModificacaoDocumento).to.equal(DATA_ARQUIVO);

      const salvo = component.getDocumentoArticulado();

      expect(lexeditSalvo(salvo).dataUltimaModificacao).to.not.equal(DATA_ARQUIVO);
      expect(component.dataUltimaModificacaoDocumento).to.equal(DATA_ARQUIVO);
    });

    it('abrir um arquivo sem a data, depois de outro que a tinha, deixa a propriedade indefinida', async () => {
      await component.abrirDocumentoArticulado(salvoCom(DATA_ARQUIVO));
      await component.abrirDocumentoArticulado(salvoCom(undefined));

      expect(component.dataUltimaModificacaoDocumento).to.be.undefined;
      expect(opcoesImpressao().tamanhoFonte).to.equal(18);
    });

    it('data inválida no arquivo deixa a propriedade indefinida e aplica os demais metadados', async () => {
      await component.abrirDocumentoArticulado(salvoCom('ontem'));

      expect(component.dataUltimaModificacaoDocumento).to.be.undefined;
      expect(opcoesImpressao().tamanhoFonte).to.equal(18);
    });

    it('nova proposição e documento fechado deixam a propriedade indefinida', async () => {
      await component.abrirDocumentoArticulado(salvoCom(DATA_ARQUIVO));
      await component.novaProposicao({ urn: 'urn:lex:br:senado.federal:projeto.lei;pl:9999;999999', epigrafe: 'PROJETO DE LEI', preambulo: '' });
      expect(component.dataUltimaModificacaoDocumento).to.be.undefined;

      await component.abrirDocumentoArticulado(salvoCom(DATA_ARQUIVO));
      component.fecharDocumento();
      expect(component.dataUltimaModificacaoDocumento).to.be.undefined;
    });
  });

  describe('outros metadados', () => {
    const outros = { tituloAntesDaEpigrafe: 'COMISSÃO XPTO', jsonDadosComissao: '{"id":1}' };
    const entradaComOutros = (pares: unknown): any => {
      const entrada = novoDocumentoArticulado();
      entrada.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ outrosMetadados: pares })];
      return entrada;
    };
    const arquivoCom = (valores: Record<string, string>): any =>
      entradaComOutros({
        outroMetadado: Object.entries(valores).map(([chave, value]) => ({ TYPE_NAME: 'br_gov_lexml_lexedit__1.OutroMetadado', chave, value })),
      });

    it('começa vazia e não grava o grupo', () => {
      expect(component.outrosMetadados).to.deep.equal({});
      expect(lexeditSalvo(component.getDocumentoArticulado())).not.to.have.property('outrosMetadados');
    });

    it('salva os pares definidos pelo host', () => {
      component.outrosMetadados = outros;

      const pares = lexeditSalvo(component.getDocumentoArticulado()).outrosMetadados.outroMetadado;

      expect(pares.map((p: any) => [p.chave, p.value])).to.deep.equal(Object.entries(outros));
    });

    it('no modo anexo de parecer também salva', () => {
      (component as any).anexoParecer = true;
      component.outrosMetadados = outros;

      expect(lexeditSalvo(component.getDocumentoArticulado()).outrosMetadados.outroMetadado).to.have.length(2);
    });

    it('abrir um arquivo preenche a propriedade', async () => {
      await component.abrirDocumentoArticulado(arquivoCom(outros));

      expect(component.outrosMetadados).to.deep.equal(outros);
    });

    it('arquivo sem o grupo esvazia a propriedade, sem herdar a do documento anterior', async () => {
      await component.abrirDocumentoArticulado(arquivoCom(outros));
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());

      expect(component.outrosMetadados).to.deep.equal({});
    });

    it('salvar e reabrir preserva os pares', async () => {
      congelarRelogio();
      component.outrosMetadados = outros;
      const salvo = component.getDocumentoArticulado();

      await component.abrirDocumentoArticulado(salvo);

      expect(component.outrosMetadados).to.deep.equal(outros);
      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
    });
  });

  describe('colegiado apreciador', () => {
    const destino = (): any => component.querySelector('lexml-eta-destino');
    const entradaComColegiado = (colegiado: Record<string, unknown>, extra: Record<string, unknown> = {}): any => {
      const entrada = novoDocumentoArticulado();
      entrada.value.metadado.metadadoProprietario = [metadadoProprietarioLexEdit({ colegiadoApreciador: colegiado, ...extra })];
      return entrada;
    };

    it('salva o destino Plenário atual', () => {
      const colegiado = lexeditSalvo(component.getDocumentoArticulado()).colegiadoApreciador;

      expect(colegiado.tipoColegiado).to.equal('Plenário');
      expect(colegiado).not.to.have.property('siglaComissao');
    });

    it('salva o destino Comissão com a sigla escolhida', () => {
      destino().colegiadoApreciador = { siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' };

      const colegiado = lexeditSalvo(component.getDocumentoArticulado()).colegiadoApreciador;

      expect(colegiado).to.include({ siglaCasaLegislativa: 'SF', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
    });

    it('no modo anexo de parecer não salva o colegiado', () => {
      (component as any).anexoParecer = true;

      expect(lexeditSalvo(component.getDocumentoArticulado())).not.to.have.property('colegiadoApreciador');
    });

    it('abre o destino Comissão do arquivo', async () => {
      await component.abrirDocumentoArticulado(entradaComColegiado({ siglaCasaLegislativa: 'CN', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' }));

      expect(destino().colegiadoApreciador).to.include({ tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
    });

    it('mantém a casa do host em vez da casa do arquivo', async () => {
      const casaDoHost = destino().colegiadoApreciador.siglaCasaLegislativa;
      const casaDoArquivo = casaDoHost === 'SF' ? 'CD' : 'SF';

      await component.abrirDocumentoArticulado(entradaComColegiado({ siglaCasaLegislativa: casaDoArquivo, tipoColegiado: 'Plenário' }));

      expect(destino().colegiadoApreciador.siglaCasaLegislativa).to.equal(casaDoHost);
    });

    it('arquivo sem o grupo mantém o destino padrão, sem herdar o do documento anterior', async () => {
      await component.abrirDocumentoArticulado(entradaComColegiado({ siglaCasaLegislativa: 'CN', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' }));
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());

      expect(destino().colegiadoApreciador.tipoColegiado).to.equal('Plenário');
    });

    it('tipo desconhecido no arquivo assume Plenário', async () => {
      await component.abrirDocumentoArticulado(entradaComColegiado({ siglaCasaLegislativa: 'CN', tipoColegiado: 'Plenário via Comissão' }));

      expect(destino().colegiadoApreciador.tipoColegiado).to.equal('Plenário');
    });

    it('tipo desconhecido enviado pelo host assume Plenário', () => {
      destino().colegiadoApreciador = { siglaCasaLegislativa: 'SF', tipoColegiado: 'Plenário via Comissão' };

      expect(destino().colegiadoApreciador.tipoColegiado).to.equal('Plenário');
    });

    it('mantém o local do arquivo enquanto o destino aplicado não muda', async () => {
      await component.abrirDocumentoArticulado(entradaComColegiado({ siglaCasaLegislativa: 'CN', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' }, { local: 'Sala da comissão' }));

      expect(lexeditSalvo(component.getDocumentoArticulado()).local).to.equal('Sala da comissão');
    });

    it('salvar e reabrir preserva o destino', async () => {
      await component.abrirDocumentoArticulado(entradaComColegiado({ siglaCasaLegislativa: 'CN', tipoColegiado: 'Comissão', siglaComissao: 'CCJ' }));
      const salvo = component.getDocumentoArticulado();

      await component.abrirDocumentoArticulado(salvo);

      expect(lexeditSalvo(component.getDocumentoArticulado()).colegiadoApreciador).to.deep.equal(lexeditSalvo(salvo).colegiadoApreciador);
    });
  });

  describe('autoria de parlamentares — salvar', () => {
    const davi = { identificacao: '1111', nome: 'Davi Alcolumbre', sexo: 'M', siglaPartido: 'UNIÃO', siglaUF: 'AP', siglaCasaLegislativa: 'SF', cargo: '' };
    const soraya = { identificacao: '2222', nome: 'Soraya Thronicke', sexo: 'F', siglaPartido: 'PSB', siglaUF: 'MS', siglaCasaLegislativa: 'SF', cargo: '' };
    const campoAutoria = (): any => component.querySelector('lexml-eta-autoria');
    const identificacoesSalvas = (documento: any): string[] => lexeditSalvo(documento).autoria.parlamentares.parlamentar.map((p: any) => p.identificacao);

    it('exporta os parlamentares da aba de autoria e as assinaturas', () => {
      campoAutoria().autoria = { ...new Autoria(), parlamentares: [davi, soraya] };

      const salvo = component.getDocumentoArticulado();

      expect(identificacoesSalvas(salvo)).to.deep.equal(['1111', '2222']);
      expect((salvo.value.projetoNorma.norma as any).parteFinal.assinaturaTexto).to.have.length(2);
    });

    it('descarta a linha de parlamentar em branco', () => {
      campoAutoria().autoria = { ...new Autoria(), parlamentares: [davi, { ...new Parlamentar() }] };

      expect(identificacoesSalvas(component.getDocumentoArticulado())).to.deep.equal(['1111']);
    });

    it('no modo anexo de parecer exporta a autoria e as assinaturas', () => {
      campoAutoria().autoria = { ...new Autoria(), parlamentares: [davi] };
      (component as any).anexoParecer = true;

      const salvo = component.getDocumentoArticulado();

      expect(identificacoesSalvas(salvo)).to.deep.equal(['1111']);
      expect((salvo.value.projetoNorma.norma as any).parteFinal.assinaturaTexto).to.have.length(1);
    });
  });

  describe('autoria de parlamentares — abrir', () => {
    const davi = {
      identificacao: '1111',
      nome: 'Davi Alcolumbre',
      sexo: 'M',
      siglaPartido: 'UNIÃO',
      siglaUF: 'AP',
      siglaCasaLegislativa: 'SF',
      cargo: 'Presidente do Senado Federal',
    };
    const soraya = { identificacao: '2222', nome: 'Soraya Thronicke', sexo: 'F', siglaPartido: 'PSB', siglaUF: 'MS', siglaCasaLegislativa: 'SF', cargo: '' };
    const campoAutoria = (): any => component.querySelector('lexml-eta-autoria');
    const entradaComAutoria = (parlamentares: any[], imprimirPartidoUF = true): any => {
      const entrada = novoDocumentoArticulado();
      entrada.value.metadado.metadadoProprietario = [
        metadadoProprietarioLexEdit({
          autoria: {
            TYPE_NAME: 'br_gov_lexml_lexedit__1.Autoria',
            tipo: 'Parlamentar',
            imprimirPartidoUF,
            parlamentares: { TYPE_NAME: 'br_gov_lexml_lexedit__1.Parlamentares', parlamentar: parlamentares },
          },
        }),
      ];
      return entrada;
    };

    it('exibe os parlamentares do arquivo, na ordem, e a opção de partido e UF', async () => {
      await component.abrirDocumentoArticulado(entradaComAutoria([davi, soraya], false));
      await campoAutoria().updateComplete;

      expect(campoAutoria().getAutoriaAtualizada().parlamentares).to.deep.equal([davi, soraya]);
      expect(campoAutoria().shadowRoot.querySelector('#chk-exibir-partido-uf').checked).to.be.false;
    });

    it('mantém o partido do arquivo mesmo quando a lista do host tem outro', async () => {
      (component as any).getParlamentares = async (): Promise<any[]> => [{ ...davi, siglaPartido: 'PSD' }];

      await component.abrirDocumentoArticulado(entradaComAutoria([davi]));

      expect(campoAutoria().getAutoriaAtualizada().parlamentares[0].siglaPartido).to.equal('UNIÃO');
    });

    it('sem autoria no arquivo mantém a autoria padrão do editor, sem herdar a do documento anterior', async () => {
      await component.abrirDocumentoArticulado(entradaComAutoria([davi]));
      await component.abrirDocumentoArticulado(novoDocumentoArticulado());

      expect(campoAutoria().getAutoriaAtualizada().parlamentares).to.deep.equal([]);
      expect(lexeditSalvo(component.getDocumentoArticulado())).to.not.have.property('autoria');
    });

    it('salvar e reabrir preserva a autoria e as assinaturas', async () => {
      congelarRelogio();
      await component.abrirDocumentoArticulado(entradaComAutoria([davi, soraya]));
      const salvo = component.getDocumentoArticulado();

      await component.abrirDocumentoArticulado(salvo);

      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
      expect((salvo.value.projetoNorma.norma as any).parteFinal.assinaturaTexto).to.have.length(2);
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
      congelarRelogio();
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
        anexoParecer: false,
        dataUltimaModificacao: DATA_ULTIMA_MODIFICACAO_CONGELADA,
        local: 'Sala da comissão',
        data: '2026-04-24',
        opcoesImpressao: { TYPE_NAME: TYPE_NAME_OPCOES_IMPRESSAO, ...OPCOES },
        // O arquivo provisório não tem destino: vale o padrão do editor, com a casa derivada da URN.
        colegiadoApreciador: { TYPE_NAME: 'br_gov_lexml_lexedit__1.ColegiadoApreciador', siglaCasaLegislativa: 'SF', tipoColegiado: 'Plenário' },
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
      congelarRelogio();
      const salvo = component.getDocumentoArticulado();

      await component.abrirDocumentoArticulado(salvo);

      expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
    });

    it('com a justificação preenchida, salvar o documento reaberto gera o mesmo documento, sem a pendência', async () => {
      congelarRelogio();
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

      // O modo vem do arquivo: um anexo de parecer com Justificacao não a carrega.
      lexeditSalvo(comJustificacao).anexoParecer = true;
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
      congelarRelogio();
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

    describe('notas de rodapé', () => {
      // Nota no formato de `texto`: o atributo `texto` é o HTML do modal, codificado.
      const nota = (id: string, textoHtml: string, numero: number): string => {
        const el = document.createElement('lexml-eta-nota-rodape');
        el.setAttribute('class', 'lexml-eta-nota-rodape');
        el.setAttribute('contenteditable', 'false');
        el.setAttribute('id-lexml-eta-nota-rodape', id);
        el.setAttribute('numero', String(numero));
        el.setAttribute('texto', encodeHtml(textoHtml));
        el.textContent = String(numero);
        return el.outerHTML;
      };
      // Números fora de ordem, para conferir a renumeração ao abrir.
      const COM_NOTAS =
        `<p class="align-justify">Texto${nota('nr1', '<p>Nota <b>formatada</b>.</p>', 5)} e mais.</p>` +
        `<ul><li>item${nota('nr2', '<p>Na lista.</p>', 6)}</li></ul>` +
        '<table table_id="t1" border="1"><tr row_id="r1">' +
        `<td class="td-q" table_id="t1" row_id="r1" cell_id="c1"><p>2025${nota('nr3', '<p>Na tabela.</p>', 7)}</p></td></tr></table>`;
      const notasDoEditor = (): HTMLElement[] => Array.from(editor().quill.root.querySelectorAll('lexml-eta-nota-rodape'));

      it('ida e volta com o Quill real: salvar o documento reaberto gera o mesmo documento, com as notas', async () => {
        congelarRelogio();
        carregar(COM_NOTAS);
        const salvo = component.getDocumentoArticulado();
        expect(JSON.stringify(salvo.value.projetoNorma.justificacao)).to.include('"localPart":"NotaDeRodape"');

        await component.abrirDocumentoArticulado(salvo);
        editor().updateApenasTexto();

        expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
      });

      it('ao abrir, as notas são numeradas pela ordem e listadas na aba Notas', async () => {
        carregar(COM_NOTAS);
        const salvo = component.getDocumentoArticulado();
        carregar('');

        await component.abrirDocumentoArticulado(salvo);

        // O Quill envolve o embed com \uFEFF.
        expect(notasDoEditor().map(n => [n.getAttribute('numero'), n.textContent!.replace(/\uFEFF/g, '')])).to.deep.equal([
          ['1', '1'],
          ['2', '2'],
          ['3', '3'],
        ]);
        const lista = editor().notasRodape;
        expect(lista.map((n: any) => n.numero)).to.deep.equal([1, 2, 3].map(String));
        expect(lista.map((n: any) => n.texto)).to.deep.equal(['<p>Nota <b>formatada</b>.</p>', '<p>Na lista.</p>', '<p>Na tabela.</p>']);
        expect((component as any).notasRodape).to.deep.equal(lista);
      });

      it('abrir um documento sem notas, com uma nota antes no editor, esvazia a lista', async () => {
        carregar(COM_NOTAS);
        editor().updateNotasRodape();
        (component as any).notasRodape = editor().notasRodape;
        expect((component as any).notasRodape.length).to.equal(3);

        await component.abrirDocumentoArticulado(novoDocumentoArticulado());

        expect(notasDoEditor()).to.have.length(0);
        expect(editor().notasRodape).to.deep.equal([]);
        expect((component as any).notasRodape).to.deep.equal([]);
      });
    });

    describe('revisões de texto', () => {
      const ID_INS = 'a1b2c3d4-0000-4000-8000-000000000001';
      const ID_SUB = 'a1b2c3d4-0000-4000-8000-000000000002';
      const ID_EXC = 'a1b2c3d4-0000-4000-8000-000000000003';
      const marca = (tag: 'ins' | 'del', idRevisao: string, conteudo: string): string =>
        `<${tag} usuario="Fulano de Tal" date="2026-05-11 15:51:00 " id-revisao="${idRevisao}" id-usuario="sf:fulano" sigla-usuario="FT">${conteudo}</${tag}>`;
      const notaHtml = (): string => {
        const el = document.createElement('lexml-eta-nota-rodape');
        el.setAttribute('class', 'lexml-eta-nota-rodape');
        el.setAttribute('contenteditable', 'false');
        el.setAttribute('id-lexml-eta-nota-rodape', 'nr1');
        el.setAttribute('numero', '1');
        el.setAttribute('texto', encodeHtml('<p>Da exclusão.</p>'));
        el.textContent = '1';
        return el.outerHTML;
      };
      // Inclusão, substituição e exclusão que atravessa negrito, com nota no trecho excluído.
      const COM_MARCAS =
        `<p>Texto ${marca('ins', ID_INS, 'incluído')} e ${marca('del', ID_SUB, 'antigo')}${marca('ins', ID_SUB, 'novo')}.</p>` +
        `<p>${marca('del', ID_EXC, 'excluído ')}<strong>${marca('del', ID_EXC, `em negrito${notaHtml()}`)}</strong> fim.</p>`;
      const marcasDoEditor = (): HTMLElement[] => Array.from(editor().quill.root.querySelectorAll('ins, del'));
      const moduloRevisao = (): any => editor().quill.revisao;
      const alertaRevisaoExibido = (): boolean => rootStore.getState().elementoReducer.ui.alertas.some((a: any) => a.id === 'alerta-global-revisao');
      const aguardarAlertas = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 20));
      const badgeJustificacao = (): string | undefined => editor().querySelector('#badge-marca-alteracao-justificativa')?.textContent?.trim();

      const abrirComMarcas = async (): Promise<any> => {
        carregar(COM_MARCAS);
        const salvo = component.getDocumentoArticulado();
        carregar('');
        await component.abrirDocumentoArticulado(salvo);
        return salvo;
      };

      afterEach(() => {
        // Marcas no editor religam a revisão desligada e contaminam os testes seguintes.
        carregar('');
        if (rootStore.getState().elementoReducer.emRevisao) rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
      });

      it('ida e volta com o Quill real: salvar o documento reaberto gera o mesmo documento', async () => {
        congelarRelogio();
        carregar(COM_MARCAS);
        const salvo = component.getDocumentoArticulado();
        const lexedit = lexeditSalvo(salvo);
        expect(lexedit.revisoesTextuais.revisaoTextual).to.have.length(5);
        expect(lexedit.usuarios.usuario).to.deep.equal([{ TYPE_NAME: 'br_gov_lexml_lexedit__1.Usuario', idUsuario: 'sf:fulano', nome: 'Fulano de Tal', sigla: 'FT' }]);
        expect(lexedit.pendencias.pendencia).to.include('Resolver marcas de revisão de texto.');
        expect(JSON.stringify(salvo.value.projetoNorma.justificacao)).to.include('"localPart":"NotaDeRodape"');

        await component.abrirDocumentoArticulado(salvo);
        editor().updateApenasTexto();

        expect(component.getDocumentoArticulado()).to.deep.equal(salvo);
      });

      it('ao abrir, as marcas têm os atributos do editor, o contador indica os grupos e o alerta de revisão é exibido', async () => {
        await abrirComMarcas();
        await aguardarAlertas();

        const marcas = marcasDoEditor();
        expect(marcas.map(m => m.tagName)).to.deep.equal(['INS', 'DEL', 'INS', 'DEL', 'DEL']);
        marcas.forEach(m => {
          expect(m.getAttribute('usuario')).to.equal('Fulano de Tal');
          expect(m.getAttribute('date')).to.equal('2026-05-11 15:51:00 ');
          expect(m.getAttribute('id-usuario')).to.equal('sf:fulano');
          expect(m.getAttribute('sigla-usuario')).to.equal('FT');
        });
        expect(marcas.map(m => m.getAttribute('id-revisao'))).to.deep.equal([ID_INS, ID_SUB, ID_SUB, ID_EXC, ID_EXC]);
        // Grupos: inclusão, exclusão e inclusão da substituição, exclusão em dois trechos.
        expect(moduloRevisao().getQuantidadeRevisoes()).to.equal(4);
        expect(alertaRevisaoExibido()).to.be.true;
        expect(badgeJustificacao()).to.equal('4');
      });

      it('um evento Redux posterior não troca o contador da justificação pela contagem da articulação', async () => {
        await abrirComMarcas();
        await aguardarAlertas();

        rootStore.dispatch(removerAlerta('alerta-global-revisao'));

        expect(badgeJustificacao()).to.equal('4');
      });

      it('rejeitar pela marca de um trecho a exclusão gravada em dois del devolve os dois trechos', async () => {
        await abrirComMarcas();
        expect(moduloRevisao().emRevisao).to.be.true;

        // Como a dica: todos os elementos de mesma tag e id-revisao.
        const grupo = Array.from(editor().quill.root.querySelectorAll(`del[id-revisao="${ID_EXC}"]`)) as HTMLElement[];
        expect(grupo).to.have.length(2);
        moduloRevisao().revisar(grupo, false);

        expect(editor().quill.root.querySelectorAll(`del[id-revisao="${ID_EXC}"]`)).to.have.length(0);
        expect(editor().quill.getText()).to.include('excluído em negrito');
        expect(moduloRevisao().getQuantidadeRevisoes()).to.equal(3);
      });

      it('aceitar todas e salvar não grava ins, del, RevisoesTextuais nem a pendência', async () => {
        await abrirComMarcas();

        moduloRevisao().revisarTodos(true);
        editor().updateApenasTexto();

        expect(marcasDoEditor()).to.have.length(0);
        const salvo = component.getDocumentoArticulado();
        expect(JSON.stringify(salvo.value.projetoNorma.justificacao)).to.not.match(/"localPart":"(ins|del)"/);
        const lexedit: any = salvo.value.metadado.metadadoProprietario?.[0].any[0].value ?? {};
        expect(lexedit).to.not.have.property('revisoesTextuais');
        expect(lexedit.pendencias?.pendencia ?? []).to.not.include('Resolver marcas de revisão de texto.');
        expect(editor().quill.getText()).to.include('incluído');
        expect(editor().quill.getText()).to.not.include('antigo');
      });

      it('salvar e reabrir dá o mesmo arquivo', async () => {
        const salvo = await abrirComMarcas();
        editor().updateApenasTexto();
        const segundo = component.getDocumentoArticulado();

        expect(segundo.value.projetoNorma.justificacao).to.deep.equal(salvo.value.projetoNorma.justificacao);
        expect(lexeditSalvo(segundo).revisoesTextuais).to.deep.equal(lexeditSalvo(salvo).revisoesTextuais);
        expect(lexeditSalvo(segundo).usuarios).to.deep.equal(lexeditSalvo(salvo).usuarios);
      });
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

  describe('revisões da hierarquia — salvar', () => {
    const emRevisao = (): boolean => !!rootStore.getState().elementoReducer.emRevisao;

    const alteraPrimeiroArtigoEmRevisao = (): void => {
      rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
      const elemento = createElemento(rootStore.getState().elementoReducer.articulacao.filhos[0]);
      elemento.conteudo!.texto = 'Texto revisado.';
      rootStore.dispatch({ type: ATUALIZAR_TEXTO_ELEMENTO, atual: elemento });
    };

    afterEach(() => {
      if (emRevisao()) rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
    });

    it('exporta as revisões, os usuários e a pendência', () => {
      alteraPrimeiroArtigoEmRevisao();

      const lexedit = lexeditSalvo(component.getDocumentoArticulado());

      expect(lexedit.revisoesArticulacao.revisaoArticulacao).to.have.length(1);
      expect(lexedit.revisoesArticulacao.revisaoArticulacao[0]).to.include({ revisao: 'alterado', refIdDispositivo: 'art1' });
      expect(lexedit.usuarios.usuario).to.have.length(1);
      expect(lexedit.pendencias.pendencia).to.include('Resolver marcas de revisão na articulação.');
    });

    it('sem revisão não exporta o grupo, os usuários nem a pendência', () => {
      // Com a justificação vazia, a pendência dela seria gravada.
      (component as any)._lexmlJustificativa.setContent('<p>Justificação.</p>');
      const lexedit = lexeditSalvo(component.getDocumentoArticulado());

      expect(lexedit).to.not.have.property('revisoesArticulacao');
      expect(lexedit).to.not.have.property('usuarios');
      expect(lexedit).to.not.have.property('pendencias');
    });
  });

  describe('revisões da hierarquia — abrir', () => {
    const estado = (): any => rootStore.getState().elementoReducer;
    const principais = (): any[] => (estado().revisoes ?? []).filter((r: any) => !r.idRevisaoElementoPrincipal);

    afterEach(() => {
      if (estado().emRevisao) rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
    });

    const salvaComRevisao = (): any => {
      rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
      const elemento = createElemento(estado().articulacao.filhos[0]);
      elemento.conteudo!.texto = 'Texto revisado.';
      rootStore.dispatch({ type: ATUALIZAR_TEXTO_ELEMENTO, atual: elemento });
      return component.getDocumentoArticulado();
    };

    it('reaplica as revisões do arquivo e entra em modo de revisão', async () => {
      const salvo = salvaComRevisao();

      await component.abrirDocumentoArticulado(salvo);

      expect(estado().emRevisao).to.equal(true);
      expect(principais()).to.have.length(1);
      expect(principais()[0]).to.include({ revisao: 'alterado' });
    });

    it('desenha na tela a marca da revisão reaplicada, sem depender de novo evento do dispositivo', async () => {
      const salvo = salvaComRevisao();

      await component.abrirDocumentoArticulado(salvo);

      expect(component.querySelectorAll('.container__revisao')).to.have.length(1);
    });

    it('salvar e reabrir preserva as revisões, os usuários e a pendência', async () => {
      const salvo = salvaComRevisao();
      const grupo = lexeditSalvo(salvo);

      await component.abrirDocumentoArticulado(salvo);
      const novo = lexeditSalvo(component.getDocumentoArticulado());

      expect(novo.revisoesArticulacao).to.deep.equal(grupo.revisoesArticulacao);
      expect(novo.usuarios).to.deep.equal(grupo.usuarios);
      expect(novo.pendencias).to.deep.equal(grupo.pendencias);
    });

    it('abrir outro documento sem revisões não herda as marcas nem o modo de revisão', async () => {
      await component.abrirDocumentoArticulado(salvaComRevisao());

      await component.abrirDocumentoArticulado(novoDocumentoArticulado());

      expect(principais()).to.have.length(0);
      expect(estado().emRevisao).to.equal(false);
    });

    it('arquivo sem revisões abre sem modo de revisão', () => {
      expect(estado().emRevisao).to.equal(false);
      expect(principais()).to.have.length(0);
    });

    describe('renumeração em alteração de norma (alteracaoRotulo)', () => {
      const PAR = 'art1_cpt_alt1_art4_par4';

      const salvaComRenumeracao = async (): Promise<any> => {
        await component.abrirDocumentoArticulado(JSON.parse(JSON.stringify(MPV_1234_2024)));
        rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
        rootStore.dispatch({ type: RENUMERAR_ELEMENTO, atual: createElemento(buscaDispositivoById(estado().articulacao, PAR)!), novo: { numero: '9' } });
        return component.getDocumentoArticulado();
      };

      it('salva a operação com o id original e a reabre com a marca na tela', async () => {
        const salvo = await salvaComRenumeracao();
        expect(lexeditSalvo(salvo).revisoesArticulacao.revisaoArticulacao[0]).to.include({ revisao: `alteracaoRotulo;${PAR}`, refIdDispositivo: 'art1_cpt_alt1_art4_par9' });

        await component.abrirDocumentoArticulado(salvo);

        expect(principais()).to.have.length(1);
        expect(principais()[0]).to.include({ revisao: `alteracaoRotulo;${PAR}` });
        expect(component.querySelectorAll('.container__revisao')).to.have.length(1);
      });

      it('criar, serializar, ler, reaplicar e serializar de novo mantém revisões, usuários e pendências', async () => {
        const salvo = await salvaComRenumeracao();
        const grupo = lexeditSalvo(salvo);

        await component.abrirDocumentoArticulado(salvo);
        const novo = lexeditSalvo(component.getDocumentoArticulado());

        expect(novo.revisoesArticulacao).to.deep.equal(grupo.revisoesArticulacao);
        expect(novo.usuarios).to.deep.equal(grupo.usuarios);
        expect(novo.pendencias).to.deep.equal(grupo.pendencias);
      });
    });
  });
});
