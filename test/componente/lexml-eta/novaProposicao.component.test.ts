import { expect, fixture, html } from '@open-wc/testing';
import { LexmlEtaComponent, LexmlEtaConfig } from '../../../src';
import { Autoria, ColegiadoApreciador, OpcoesImpressao, Parlamentar } from '../../../src/model/proposicao/proposicao';
import { rootStore } from '../../../src/redux/store';
import { ATIVAR_DESATIVAR_REVISAO } from '../../../src/model/lexml/acao/ativarDesativarRevisaoAction';
import { ATUALIZAR_TEXTO_ELEMENTO } from '../../../src/model/lexml/acao/atualizarTextoElementoAction';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { lexeditSalvo, novoDocumentoArticulado } from '../../doc/documentoArticulado';

const URN_PL = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;123';
const dadosMinimos = (): any => ({ urn: URN_PL, epigrafe: 'PROJETO DE LEI Nº 123, DE 2026', preambulo: 'O Congresso Nacional decreta:' });

describe('LexmlEtaComponent — novaProposicao', () => {
  let component: LexmlEtaComponent;
  const documento = (): any => component.getDocumentoArticulado();
  const parteInicial = (): any => documento().value.projetoNorma.norma.parteInicial;

  beforeEach(async () => {
    component = await fixture<LexmlEtaComponent>(html`<lexml-eta></lexml-eta>`);
    (component as any).getParlamentares = async (): Promise<[]> => [];
  });

  it('cria o documento com URN, epígrafe e preâmbulo informados', async () => {
    await component.novaProposicao(dadosMinimos());

    expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
    expect(parteInicial().epigrafe.content).to.deep.equal(['PROJETO DE LEI Nº 123, DE 2026']);
    expect(parteInicial().preambulo.p[0].content).to.deep.equal(['O Congresso Nacional decreta:']);
    expect(!!rootStore.getState().elementoReducer.articulacao).to.be.true;
  });

  it('opcionais ausentes assumem os padrões', async () => {
    await component.novaProposicao(dadosMinimos());

    expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao).to.deep.equal(new OpcoesImpressao());
    expect((component as any).colegiadoApreciador).to.equal(undefined);
    expect(component.outrosMetadados).to.deep.equal({});
  });

  ['urn', 'epigrafe', 'preambulo'].forEach(campo => {
    it(`rejeita sem ${campo}, nomeia o dado e mantém o documento em edição`, async () => {
      await component.novaProposicao(dadosMinimos());
      let fatal = false;
      component.addEventListener('fatalError', () => (fatal = true));
      const dados = dadosMinimos();
      delete dados[campo];

      let erro: Error | undefined;
      await component.novaProposicao(dados).catch(e => (erro = e));

      expect(erro?.message).to.contain(`'${campo}'`);
      expect(fatal).to.be.true;
      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
    });
  });

  it('aceita preâmbulo vazio', async () => {
    await component.novaProposicao({ ...dadosMinimos(), preambulo: '' });
    expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
  });

  [
    ['norma', 'urn:lex:br:senado.federal:resolucao:2026;1'],
    ['medida provisória', 'urn:lex:br:federal:medida.provisoria:2026-01-01;1'],
    ['autoridade da outra casa', 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;1'],
  ].forEach(([nome, urn]) => {
    it(`rejeita URN de ${nome} sem alterar o documento em edição`, async () => {
      await component.novaProposicao(dadosMinimos());

      let erro: Error | undefined;
      await component.novaProposicao({ ...dadosMinimos(), urn }).catch(e => (erro = e));

      expect(!!erro).to.be.true;
      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
    });
  });

  it('o dado informado vence o padrão da sessão', async () => {
    const parlamentar = (identificacao: string, nome: string): Parlamentar => Object.assign(new Parlamentar(), { identificacao, nome, siglaCasaLegislativa: 'SF' });
    (component as any).getParlamentares = async (): Promise<Parlamentar[]> => [parlamentar('1', 'Fulano'), parlamentar('2', 'Beltrano')];
    component.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), {
      autoriaPadrao: { identificacao: '2', siglaCasaLegislativa: 'SF' },
      opcoesImpressaoPadrao: { imprimirBrasao: false, textoCabecalho: 'Gabinete', tamanhoFonte: 16 },
    });

    await component.novaProposicao(dadosMinimos());
    expect(((component as any)._lexmlAutoria.autoria.parlamentares as Parlamentar[]).map(p => p.nome)).to.deep.equal(['Beltrano']);
    expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao.textoCabecalho).to.equal('Gabinete');

    const autoria = Object.assign(new Autoria(), { parlamentares: [parlamentar('1', 'Fulano')] });
    const opcoesImpressao = Object.assign(new OpcoesImpressao(), { textoCabecalho: 'Outro' });
    await component.novaProposicao({ ...dadosMinimos(), autoria, opcoesImpressao });
    expect(((component as any)._lexmlAutoria.autoria.parlamentares as Parlamentar[]).map(p => p.nome)).to.deep.equal(['Fulano']);
    expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao.textoCabecalho).to.equal('Outro');
  });

  it('aplica destino, outros metadados, anexo de parecer e documento referenciado', async () => {
    const destino = Object.assign(new ColegiadoApreciador(), { tipoColegiado: 'Comissão', siglaComissao: 'CAE' });
    await component.novaProposicao({
      ...dadosMinimos(),
      colegiadoApreciador: destino,
      outrosMetadados: { chave: 'valor' },
      urnDocumentoReferenciado: 'urn:lex:br:senado.federal:projeto.lei;pl:2025;7',
    });

    const destinoAplicado = (component as any).colegiadoApreciador;
    expect(destinoAplicado.tipoColegiado).to.equal('Comissão');
    expect(destinoAplicado.siglaComissao).to.equal('CAE');
    expect(component.outrosMetadados).to.deep.equal({ chave: 'valor' });
    expect(lexeditSalvo(documento()).urnDocumentoReferenciado).to.equal('urn:lex:br:senado.federal:projeto.lei;pl:2025;7');

    await component.novaProposicao({ ...dadosMinimos(), anexoParecer: true });
    expect(lexeditSalvo(documento()).anexoParecer).to.equal(true);
  });

  describe('documento de modelo', () => {
    const modelo = (): any => {
      const m = novoDocumentoArticulado();
      m.value.metadado.identificacao.urn = 'urn:lex:br:senado.federal:projeto.lei;pl:2020;5';
      m.value.projetoNorma.norma.parteInicial.epigrafe.content = ['EPÍGRAFE DO MODELO'];
      m.value.projetoNorma.norma.parteInicial.preambulo.p = [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: ['PREÂMBULO DO MODELO'] }];
      return m;
    };

    it('os parâmetros sobrescrevem o modelo', async () => {
      await component.novaProposicao({ ...dadosMinimos(), documentoModelo: modelo() });

      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
      expect(parteInicial().epigrafe.content).to.deep.equal(['PROJETO DE LEI Nº 123, DE 2026']);
      expect(parteInicial().preambulo.p[0].content).to.deep.equal(['O Congresso Nacional decreta:']);
    });

    it('aproveita a articulação e a ementa e descarta o resto', async () => {
      const m = modelo();
      m.value.projetoNorma.norma.parteInicial.ementa.content = ['EMENTA DO MODELO'];
      const artigos = m.value.projetoNorma.norma.articulacao.lXhier.length;

      await component.novaProposicao({ ...dadosMinimos(), documentoModelo: m });

      expect(parteInicial().ementa.content).to.deep.equal(['EMENTA DO MODELO']);
      expect(documento().value.projetoNorma.norma.articulacao.lXhier.length).to.equal(artigos);
      expect(component.outrosMetadados).to.deep.equal({});
      expect(lexeditSalvo(documento())).not.to.have.property('revisoesArticulacao');
    });
  });

  describe('documento importado', () => {
    const MENSAGEM_ANEXOS = 'Não foi possível recuperar os anexos do documento importado. A proposição foi criada sem eles; se necessário, inclua-os novamente na aba Anexos.';
    const davi: Parlamentar = { identificacao: '1111', nome: 'Davi Alcolumbre', sexo: 'M', siglaPartido: 'UNIÃO', siglaUF: 'AP', siglaCasaLegislativa: 'SF', cargo: '' };
    const estado = (): any => rootStore.getState().elementoReducer;
    const alertaAnexos = (): any => (estado().ui?.alertas ?? []).find((a: any) => a.id === 'alerta-global-anexos-nao-recuperados');
    // Notificação passageira (sl-alert com toast), fora do componente.
    const notificacoes = (): any[] =>
      Array.from(document.querySelectorAll('sl-alert')).filter(a => a.closest('lexml-eta') === null && (a.textContent ?? '').includes('anexos do documento importado'));
    const impressao = Object.assign(new OpcoesImpressao(), { imprimirBrasao: false, textoCabecalho: 'Do arquivo', tamanhoFonte: 16 });

    // Documento salvo pelo próprio editor, com justificação, revisão, autoria, impressão, fecho, outros metadados e um anexo.
    const salvarFonte = async ({ comAutoria = true, comAnexo = true } = {}): Promise<any> => {
      const origem = novoDocumentoArticulado();
      origem.value.metadado.identificacao.urn = 'urn:lex:br:senado.federal:projeto.lei;pl:2020;5';
      origem.value.projetoNorma.norma.parteInicial.ementa.content = ['EMENTA DO ARQUIVO'];
      await component.abrirDocumentoArticulado(origem);
      if (comAutoria) (component as any)._lexmlAutoria.autoria = { ...new Autoria(), parlamentares: [davi] };
      (component as any)._lexmlOpcoesImpressao.opcoesImpressao = impressao;
      (component as any)._lexmlJustificativa.setContent('<p>Justificação do arquivo.</p>');
      (component as any)._lexmlData.data = '2026-05-10';
      component.outrosMetadados = { origem: 'arquivo' };
      if (comAnexo) (component as any).aplicarAnexos([{ idArquivo: 'arq-1', nomeArquivo: 'anexo.pdf', nomeDocumento: 'Anexo', mimeType: 'application/pdf' }]);
      rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
      const elemento = createElemento(estado().articulacao.filhos[0]);
      elemento.conteudo!.texto = 'Texto revisado no arquivo.';
      rootStore.dispatch({ type: ATUALIZAR_TEXTO_ELEMENTO, atual: elemento });
      const fonte = component.getDocumentoArticulado();
      rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
      return fonte;
    };

    afterEach(() => {
      if (estado().emRevisao) rootStore.dispatch({ type: ATIVAR_DESATIVAR_REVISAO });
      document.querySelectorAll('sl-alert').forEach(a => a.closest('lexml-eta') === null && a.remove());
    });

    it('aproveita o conteúdo do arquivo e usa a identidade e o destino informados', async () => {
      const fonte = await salvarFonte();
      const destino = Object.assign(new ColegiadoApreciador(), { tipoColegiado: 'Comissão', siglaComissao: 'CAE' });

      await component.novaProposicao({ ...dadosMinimos(), colegiadoApreciador: destino, documentoImportado: fonte });

      const lexedit = lexeditSalvo(documento());
      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
      expect(parteInicial().epigrafe.content).to.deep.equal(['PROJETO DE LEI Nº 123, DE 2026']);
      expect(parteInicial().preambulo.p[0].content).to.deep.equal(['O Congresso Nacional decreta:']);
      expect(parteInicial().ementa.content).to.deep.equal(['EMENTA DO ARQUIVO']);
      expect((component as any).colegiadoApreciador).to.include({ tipoColegiado: 'Comissão', siglaComissao: 'CAE' });
      expect(lexedit.autoria.parlamentares.parlamentar.map((p: any) => p.identificacao)).to.deep.equal(['1111']);
      expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao).to.deep.equal(impressao);
      expect((component as any)._lexmlJustificativa.texto).to.contain('Justificação do arquivo.');
      expect((component as any)._lexmlData.data).to.equal('2026-05-10');
      expect(component.outrosMetadados).to.deep.equal({ origem: 'arquivo' });
      expect(estado().emRevisao).to.equal(true);
      expect((estado().revisoes ?? []).filter((r: any) => !r.idRevisaoElementoPrincipal)).to.have.length(1);
      expect(component.dataUltimaModificacaoDocumento).to.equal(undefined);
    });

    it('descarta os anexos e exibe o alerta, que não vira pendência ao salvar', async () => {
      const fonte = await salvarFonte();

      await component.novaProposicao({ ...dadosMinimos(), documentoImportado: fonte });

      expect((component as any)._lexmlAnexos.anexos).to.have.length(0);
      expect(lexeditSalvo(documento())).not.to.have.property('anexos');
      expect(alertaAnexos()).to.include({ tipo: 'WARNING', mensagem: MENSAGEM_ANEXOS, podeFechar: true });
      expect(notificacoes()).to.have.length(1);
      expect(notificacoes()[0].variant).to.equal('warning');
      expect(notificacoes()[0].duration).to.equal(8000);
      expect(JSON.stringify(lexeditSalvo(documento()).pendencias ?? {})).not.to.contain('anexo');
    });

    it('sem anexos no arquivo, o alerta não é exibido', async () => {
      const fonte = await salvarFonte({ comAnexo: false });

      await component.novaProposicao({ ...dadosMinimos(), documentoImportado: fonte });

      expect(alertaAnexos()).to.equal(undefined);
      expect(notificacoes()).to.have.length(0);
    });

    it('autoria e impressão dos parâmetros só valem quando o arquivo não as traz', async () => {
      const autoriaParametro = { ...new Autoria(), parlamentares: [{ ...davi, identificacao: '2222', nome: 'Outro' }] };
      const impressaoParametro = Object.assign(new OpcoesImpressao(), { imprimirBrasao: true, textoCabecalho: 'Do parâmetro', tamanhoFonte: 14 });

      await component.novaProposicao({ ...dadosMinimos(), autoria: autoriaParametro, opcoesImpressao: impressaoParametro, documentoImportado: await salvarFonte() });
      expect(lexeditSalvo(documento()).autoria.parlamentares.parlamentar[0].identificacao).to.equal('1111');
      expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao).to.deep.equal(impressao);

      // O editor sempre grava a impressão; um arquivo sem o grupo vem de fora dele.
      const semGrupos = await salvarFonte({ comAutoria: false });
      delete lexeditSalvo(semGrupos).opcoesImpressao;
      await component.novaProposicao({ ...dadosMinimos(), autoria: autoriaParametro, opcoesImpressao: impressaoParametro, documentoImportado: semGrupos });
      expect(lexeditSalvo(documento()).autoria.parlamentares.parlamentar[0].identificacao).to.equal('2222');
      expect((component as any)._lexmlOpcoesImpressao.opcoesImpressao).to.deep.equal(impressaoParametro);
    });

    it('aceita arquivo cuja URN é da outra casa e descarta a autoria dele', async () => {
      const fonte = await salvarFonte();
      fonte.value.metadado.identificacao.urn = 'urn:lex:br:camara.deputados:projeto.lei;pl:2020;5';

      await component.novaProposicao({ ...dadosMinimos(), documentoImportado: fonte });

      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
      expect(lexeditSalvo(documento())).not.to.have.property('autoria');
      expect((component as any)._lexmlJustificativa.texto).to.contain('Justificação do arquivo.');
    });

    it('outros metadados dos parâmetros só valem quando o arquivo não os traz', async () => {
      await component.novaProposicao({ ...dadosMinimos(), outrosMetadados: { origem: 'parâmetro' }, documentoImportado: await salvarFonte() });
      expect(component.outrosMetadados).to.deep.equal({ origem: 'arquivo' });

      await component.novaProposicao({ ...dadosMinimos(), outrosMetadados: { origem: 'parâmetro' }, documentoImportado: novoDocumentoArticulado() });
      expect(component.outrosMetadados).to.deep.equal({ origem: 'parâmetro' });
    });

    it('documento inválido é rejeitado com erro fatal e mantém o documento em edição', async () => {
      await component.novaProposicao(dadosMinimos());
      let fatal = false;
      component.addEventListener('fatalError', () => (fatal = true));

      let erro: Error | undefined;
      await component
        .novaProposicao({ ...dadosMinimos(), urn: 'urn:lex:br:senado.federal:projeto.lei;pl:2026;9', documentoImportado: { nao: 'é documento' } })
        .catch(e => (erro = e));

      expect(!!erro).to.be.true;
      expect(fatal).to.be.true;
      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
    });

    it('rejeita documento de modelo e documento importado juntos', async () => {
      await component.novaProposicao(dadosMinimos());

      let erro: Error | undefined;
      await component.novaProposicao({ ...dadosMinimos(), documentoModelo: novoDocumentoArticulado(), documentoImportado: novoDocumentoArticulado() }).catch(e => (erro = e));

      expect(erro?.message).to.contain('documentoImportado');
      expect(documento().value.metadado.identificacao.urn).to.equal(URN_PL);
    });
  });
});
