import { expect, fixture, html } from '@open-wc/testing';
import {
  DadosIniciaisEdicao,
  EVENTO_CANCELADA,
  EVENTO_CONCLUIDA,
  EVENTO_DADOS_BASICOS_ALTERADOS,
  MENSAGEM_PERDA_AUTORIA,
  MENSAGEM_PERDA_JUSTIFICACAO,
  NovaProposicaoComponent,
} from '../../../src/components/nova-proposicao/nova-proposicao.component';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const CONFIG = {
  casaLegislativaEditor: 'SF',
  urlVerificacaoProposicao: '/v/{sigla}/{numero}/{ano}',
  urlTextoEstruturado: '/t/{sigla}/{numero}/{ano}',
  urlComissoes: '/c/{casa}',
  urlImportacaoArquivo: '/importacao',
};
const COMISSOES = [
  { siglaCasaLegislativa: 'SF', sigla: 'CCJ', nome: 'Comissão de Constituição, Justiça e Cidadania' },
  { siglaCasaLegislativa: 'SF', sigla: 'CAE', nome: 'Comissão de Assuntos Econômicos' },
  { siglaCasaLegislativa: 'CD', sigla: 'CFT', nome: 'Comissão de Finanças e Tributação' },
  { siglaCasaLegislativa: 'CN', sigla: 'CMO', nome: 'Comissão Mista de Orçamento' },
];

const URN_PL_123 = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;123';
const URN_PL_SN = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;999999';
const URN_PL_10 = 'urn:lex:br:senado.federal:projeto.lei;pl:2025;10';
const URN_PLV = 'urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999';
const URN_MPV_99 = 'urn:lex:br:federal:medida.provisoria;mpv:2026;99';
const URN_SSP_CD = 'urn:lex:br:camara.deputados:subemenda.substitutiva;ssp:2025;999999';
const URN_SBT_CD_7 = 'urn:lex:br:camara.deputados:substitutivo;sbt:2025;7';
const URN_PL_10_CD = 'urn:lex:br:camara.deputados:projeto.lei;pl:2025;10';
const CONFIG_CD = { ...CONFIG, casaLegislativaEditor: 'CD' };

describe('lexml-nova-proposicao — modo de edição de dados básicos', () => {
  let el: NovaProposicaoComponent;
  let fetchOriginal: typeof window.fetch;
  let rotas: Record<string, { status: number; corpo?: unknown }>;
  let eventos: Array<{ nome: string; detail: any }>;

  const pausa = (): Promise<void> => new Promise(r => setTimeout(r, 0));
  const atualizar = async (): Promise<void> => {
    await pausa();
    await el.updateComplete;
    await pausa();
    await el.updateComplete;
  };
  const q = <T extends HTMLElement>(id: string): T | null => el.querySelector<T>(`#${id}`);
  const existe = (id: string): boolean => !!q(id);
  const continuarHabilitado = (): boolean => !!q<any>('np-continuar') && !q<any>('np-continuar').disabled;
  const clicar = async (id: string): Promise<void> => {
    q<HTMLElement>(id)!.click();
    await atualizar();
  };
  const digitar = async (id: string, valor: string): Promise<void> => {
    const i = q<any>(id)!;
    i.value = valor;
    i.dispatchEvent(new CustomEvent('sl-input', { bubbles: true }));
    await atualizar();
  };
  const escolherSigla = async (id: string, sigla: string): Promise<void> => {
    q<any>(id)!.querySelector('sl-input')!.dispatchEvent(new MouseEvent('click'));
    await atualizar();
    const valor = q<any>(id)!.items.find((i: any) => i.label === sigla).value;
    el.querySelector<HTMLElement>(`#${id} .ac-lista li[data-value="${valor}"]`)!.click();
    await atualizar();
  };
  const marcarAnexoParecer = async (marcado: boolean): Promise<void> => {
    const caixa = q<any>('np-anexo-parecer')!;
    caixa.checked = marcado;
    caixa.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
    await atualizar();
  };
  const marcarDestino = async (valor: string): Promise<void> => {
    el.querySelector<HTMLElement>(`sl-radio[name="destino"][value="${valor}"]`)!.click();
    await atualizar();
  };
  const modalAberto = (): boolean => !!q<any>('np-confirmacao')?.open;
  const mensagensDoModal = (): string[] => Array.from(el.querySelectorAll('#np-confirmacao .np-mensagem-perda')).map(m => (m.textContent ?? '').trim());
  const emitidos = (nome: string): any[] => eventos.filter(e => e.nome === nome).map(e => e.detail);

  const abrirEdicao = async (iniciais: DadosIniciaisEdicao, config: object = CONFIG): Promise<void> => {
    el = await fixture<NovaProposicaoComponent>(html`<lexml-nova-proposicao></lexml-nova-proposicao>`);
    eventos = [];
    [EVENTO_CONCLUIDA, EVENTO_CANCELADA, EVENTO_DADOS_BASICOS_ALTERADOS].forEach(nome => el.addEventListener(nome, e => eventos.push({ nome, detail: (e as CustomEvent).detail })));
    el.config = config;
    el.iniciarModoEdicao(iniciais);
    await atualizar();
  };

  beforeEach(() => {
    rotas = {
      '/c/SF': { status: 200, corpo: COMISSOES },
      '/c/CD': { status: 200, corpo: COMISSOES },
      '/c/CN': { status: 200, corpo: COMISSOES },
      '/v/MPV/99/2026': { status: 200, corpo: { ementa: 'Ementa da MPV 99', textoEstruturadoDisponivel: true } },
    };
    fetchOriginal = window.fetch;
    window.fetch = (async (url: string): Promise<Response> => {
      const r = rotas[url] ?? { status: 404 };
      return new Response(r.corpo === undefined ? null : JSON.stringify(r.corpo), { status: r.status });
    }) as typeof window.fetch;
  });

  afterEach(() => {
    window.fetch = fetchOriginal;
    inicializarVocabulario('SF');
  });

  describe('preenchimento da Tela 1', () => {
    it('exibe só a Tela 1, com o título e os dados da URN', async () => {
      await abrirEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Plenário' } });
      expect(q('np-titulo')!.textContent).to.equal('Alterar dados básicos');
      expect(existe('np-g1') && existe('np-g3') && existe('np-g5') && existe('np-g6')).to.be.true;
      expect(el.querySelector<any>('sl-radio[name="especie"][value="proposicao"]').checked).to.be.true;
      expect(q<any>('np-ano-proposicao')!.value).to.equal('2026');
      expect(el.querySelector<any>('sl-radio[name="destino"][value="Plenário"]').checked).to.be.true;
      expect(q<any>('np-anexo-parecer')!.checked).to.be.false;
      expect(continuarHabilitado()).to.be.true;
    });

    it('lê a comissão e a forma de apresentação', async () => {
      await abrirEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Comissão', siglaComissao: 'CCJ' }, anexoParecer: true });
      expect(el.querySelector<any>('sl-radio[name="destino"][value="Comissão"]').checked).to.be.true;
      expect(q<any>('np-comissao')!.value).to.equal('CCJ');
      expect(q<any>('np-anexo-parecer')!.checked).to.be.true;
      expect(continuarHabilitado()).to.be.true;
    });

    it('comissão fora da lista deixa o destino inválido', async () => {
      await abrirEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Comissão', siglaComissao: 'XXX' } });
      expect(q<any>('np-comissao')!.value).to.equal('');
      expect(continuarHabilitado()).to.be.false;
    });

    it('lista de comissões indisponível deixa o destino inválido', async () => {
      rotas['/c/SF'] = { status: 500 };
      await abrirEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Comissão', siglaComissao: 'CCJ' } });
      expect(continuarHabilitado()).to.be.false;
      await marcarDestino('Plenário');
      expect(continuarHabilitado()).to.be.true;
    });

    it('PLV: sigla pela URN e medida provisória pela URN referenciada, já verificada', async () => {
      await abrirEdicao({ urn: URN_PLV, urnDocumentoReferenciado: URN_MPV_99 });
      expect(q<any>('np-sigla-proposicao')!.value).to.not.equal('');
      expect(q<any>('np-numero-mpv')!.value).to.equal('99');
      expect(q<any>('np-ano-mpv')!.value).to.equal('2026');
      expect(continuarHabilitado()).to.be.true;
    });

    it('substitutivo do Senado: espécie, proposição referenciada e Continuar sem verificar', async () => {
      await abrirEdicao({
        urn: `${URN_PL_10}@apresentacao.substitutivo`,
        urnDocumentoReferenciado: URN_PL_10,
        colegiadoApreciador: { tipoColegiado: 'Plenário' },
        anexoParecer: true,
      });
      expect(el.querySelector<any>('sl-radio[name="especie"][value="substitutivo"]').checked).to.be.true;
      expect(q<any>('np-numero-proposicao')!.value).to.equal('10');
      expect(q<any>('np-ano-proposicao')!.value).to.equal('2025');
      expect(continuarHabilitado()).to.be.true;
    });

    it('mudar o número da proposição referenciada exige nova verificação', async () => {
      await abrirEdicao({ urn: `${URN_PL_10}@apresentacao.substitutivo`, urnDocumentoReferenciado: URN_PL_10, colegiadoApreciador: { tipoColegiado: 'Plenário' } });
      await digitar('np-numero-proposicao', '11');
      expect(continuarHabilitado()).to.be.false;
    });

    it('subemenda substitutiva da Câmara: sem grupo de identificação e com o ano da URN', async () => {
      await abrirEdicao({ urn: URN_SSP_CD, urnDocumentoReferenciado: URN_PL_10_CD, colegiadoApreciador: { tipoColegiado: 'Plenário' }, anexoParecer: true }, CONFIG_CD);
      expect(el.querySelector<any>('sl-radio[name="especie"][value="subemenda"]').checked).to.be.true;
      expect(existe('np-g2')).to.be.false;
      expect(q<any>('np-numero-proposicao')!.value).to.equal('10');
      expect(continuarHabilitado()).to.be.true;
      await clicar('np-continuar');
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)[0].urn).to.equal(URN_SSP_CD);
    });

    it('substitutivo da Câmara: o número real e o ano da URN continuam na URN ao trocar o destino', async () => {
      await abrirEdicao({ urn: URN_SBT_CD_7, urnDocumentoReferenciado: URN_PL_10_CD, colegiadoApreciador: { tipoColegiado: 'Plenário' }, anexoParecer: true }, CONFIG_CD);
      expect(existe('np-g2')).to.be.false;
      await clicar('np-continuar');
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)[0].urn).to.equal(URN_SBT_CD_7);
    });

    it('trocar a espécie na Câmara mantém o ano da URN inicial e volta o número a s/n', async () => {
      rotas['/v/PL/10/2025'] = { status: 200, corpo: { ementa: 'Ementa do PL 10', textoEstruturadoDisponivel: true } };
      await abrirEdicao({ urn: URN_SBT_CD_7, urnDocumentoReferenciado: URN_PL_10_CD, colegiadoApreciador: { tipoColegiado: 'Plenário' }, anexoParecer: true }, CONFIG_CD);
      el.querySelector<HTMLElement>('sl-radio[name="especie"][value="subemenda"]')!.click();
      await atualizar();
      await escolherSigla('np-sigla-proposicao', 'PL');
      await digitar('np-numero-proposicao', '10');
      await clicar('np-proposicao-verificar');
      await marcarDestino('Plenário');
      await clicar('np-continuar');
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)[0].urn).to.equal('urn:lex:br:camara.deputados:subemenda.substitutiva;ssp:2025;999999');
    });

    it('URN inválida mostra o erro', async () => {
      await abrirEdicao({ urn: 'urn:lex:br:senado.federal:inexistente;xx:2026;1' });
      expect(existe('np-erro-dados-iniciais')).to.be.true;
    });
  });

  describe('número do documento', () => {
    it('exibe o número real como texto fixo e o mantém na URN do resultado', async () => {
      await abrirEdicao({ urn: URN_PL_123, colegiadoApreciador: { tipoColegiado: 'Plenário' } });
      expect(q('np-numero-proposicao')!.textContent).to.equal('123');
      await marcarDestino('Comissão');
      await clicar('np-comissao');
      el.querySelector<any>('#np-comissao').dispatchEvent(new CustomEvent('autocomplete-change', { detail: { value: 'CCJ' } }));
      await atualizar();
      await clicar('np-continuar');
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)[0].urn).to.equal(URN_PL_123);
    });

    it('mudando a sigla, volta a s/n', async () => {
      await abrirEdicao({ urn: URN_PL_123, colegiadoApreciador: { tipoColegiado: 'Plenário' } });
      await escolherSigla('np-sigla-proposicao', 'PLP');
      expect(q('np-numero-proposicao')!.textContent).to.equal('s/n');
      await clicar('np-continuar');
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)[0].urn).to.contain(';999999');
    });
  });

  describe('resultado e confirmações', () => {
    it('sem perda de dados emite o resultado sem texto e não o evento de conclusão', async () => {
      await abrirEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Plenário' } });
      await marcarDestino('Comissão');
      el.querySelector<any>('#np-comissao').dispatchEvent(new CustomEvent('autocomplete-change', { detail: { value: 'CCJ' } }));
      await atualizar();
      await clicar('np-continuar');
      expect(modalAberto()).to.be.false;
      const detail = emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)[0];
      expect(detail).to.include({ urn: URN_PL_SN, anexoParecer: false });
      expect(detail.colegiadoDestino).to.deep.equal({ tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
      expect(detail).not.to.have.property('outrosMetadados');
      expect(detail.epigrafe).to.be.a('string').and.not.empty;
      expect(detail.preambulo).to.be.a('string');
      expect(detail).not.to.have.property('texto');
      expect(emitidos(EVENTO_CONCLUIDA)).to.have.length(0);
    });

    it('troca de casa pede confirmação: Sim emite', async () => {
      await abrirEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Plenário' } });
      await escolherSigla('np-sigla-proposicao', 'PLV');
      await digitar('np-numero-mpv', '99');
      await clicar('np-mpv-verificar');
      await clicar('np-continuar');
      expect(modalAberto()).to.be.true;
      expect(mensagensDoModal()).to.deep.equal([MENSAGEM_PERDA_AUTORIA]);
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)).to.have.length(0);
      await clicar('np-confirmar-sim');
      expect(modalAberto()).to.be.false;
      const detail = emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)[0];
      expect(detail.urn).to.equal(URN_PLV);
      expect(detail.urnDocumentoReferenciado).to.equal(URN_MPV_99);
    });

    it('passagem a anexo de parecer recusada com Não continua na Tela 1', async () => {
      await abrirEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Plenário' } });
      await marcarAnexoParecer(true);
      await clicar('np-continuar');
      expect(mensagensDoModal()).to.deep.equal([MENSAGEM_PERDA_JUSTIFICACAO]);
      await clicar('np-confirmar-nao');
      expect(modalAberto()).to.be.false;
      expect(existe('np-g1')).to.be.true;
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)).to.have.length(0);
    });

    it('troca de casa e passagem a anexo juntas: um único modal com as duas mensagens', async () => {
      await abrirEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Plenário' } });
      await escolherSigla('np-sigla-proposicao', 'PLV');
      await digitar('np-numero-mpv', '99');
      await clicar('np-mpv-verificar');
      await marcarAnexoParecer(true);
      await clicar('np-continuar');
      expect(el.querySelectorAll('sl-dialog')).to.have.length(1);
      expect(mensagensDoModal()).to.deep.equal([MENSAGEM_PERDA_AUTORIA, MENSAGEM_PERDA_JUSTIFICACAO]);
    });

    it('deixar de ser anexo de parecer não pede confirmação', async () => {
      await abrirEdicao({ urn: URN_PL_SN, anexoParecer: true });
      await marcarAnexoParecer(false);
      await clicar('np-continuar');
      expect(modalAberto()).to.be.false;
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)[0].anexoParecer).to.be.false;
    });

    it('Cancelar emite o cancelamento, sem resultado', async () => {
      await abrirEdicao({ urn: URN_PL_SN });
      await clicar('np-cancelar');
      expect(emitidos(EVENTO_CANCELADA)).to.have.length(1);
      expect(emitidos(EVENTO_DADOS_BASICOS_ALTERADOS)).to.have.length(0);
    });
  });

  describe('reiniciar', () => {
    it('a partir do modo de edição volta à Tela 1 de nova proposição com os padrões', async () => {
      await abrirEdicao({ urn: URN_PL_123, colegiadoApreciador: { tipoColegiado: 'Comissão', siglaComissao: 'CCJ' }, anexoParecer: true });
      el.reiniciar();
      await atualizar();
      expect(el.modo).to.equal('criacao');
      expect(el.dadosIniciais).to.be.undefined;
      expect(q('np-titulo')!.textContent).to.equal('Nova proposição');
      expect(q<any>('np-sigla-proposicao')!.value).to.equal('');
      expect(q('np-numero-proposicao')!.textContent).to.equal('s/n');
      expect(el.querySelector<any>('sl-radio[name="destino"][value="Plenário"]').checked).to.be.true;
      expect(q<any>('np-anexo-parecer')!.checked).to.be.false;
      expect(existe('np-confirmacao')).to.be.false;
    });

    it('a partir da Tela 2 volta à Tela 1 com os padrões', async () => {
      el = await fixture<NovaProposicaoComponent>(html`<lexml-nova-proposicao></lexml-nova-proposicao>`);
      el.config = CONFIG;
      await atualizar();
      await escolherSigla('np-sigla-proposicao', 'PL');
      await clicar('np-continuar');
      expect(existe('np-g1')).to.be.false;
      el.reiniciar();
      await atualizar();
      expect(existe('np-g1')).to.be.true;
      expect(q<any>('np-sigla-proposicao')!.value).to.equal('');
    });
  });
});
