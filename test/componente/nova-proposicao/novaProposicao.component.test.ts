import { expect, fixture, html } from '@open-wc/testing';
import { EVENTO_CANCELADA, EVENTO_CONCLUIDA, NovaProposicaoComponent } from '../../../src/components/nova-proposicao/nova-proposicao.component';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const CONFIG = { casaLegislativaEditor: 'SF', urlVerificacaoProposicao: '/v/{sigla}/{numero}/{ano}', urlTextoEstruturado: '/t/{sigla}/{numero}/{ano}', urlComissoes: '/c/{casa}' };
const COMISSOES = [
  { siglaCasaLegislativa: 'SF', sigla: 'CCJ', nome: 'Comissão de Constituição, Justiça e Cidadania' },
  { siglaCasaLegislativa: 'CD', sigla: 'CFT', nome: 'Comissão de Finanças e Tributação' },
  { siglaCasaLegislativa: 'CN', sigla: 'CMO', nome: 'Comissão Mista de Orçamento' },
];
const TEXTO = { value: { texto: 'jsonix' } };

type Resposta = { status: number; corpo?: unknown } | 'rede';

describe('lexml-nova-proposicao', () => {
  let el: NovaProposicaoComponent;
  let fetchOriginal: typeof window.fetch;
  let chamadas: string[];
  let rotas: Record<string, Resposta>;

  const pausa = (): Promise<void> => new Promise(r => setTimeout(r, 0));
  const atualizar = async (): Promise<void> => {
    await pausa();
    await el.updateComplete;
  };
  const q = <T extends HTMLElement>(id: string): T | null => el.querySelector<T>(`#${id}`);
  const existe = (id: string): boolean => !!q(id);
  const botaoHabilitado = (id: string): boolean => !!q<any>(id) && !q<any>(id).disabled;
  const clicar = async (id: string): Promise<void> => {
    q<HTMLElement>(id)!.click();
    await atualizar();
  };
  // sl-select/sl-input: o valor é atribuído e o evento do Shoelace disparado (padrão do guia do Cypress).
  const escolher = async (id: string, valor: string): Promise<void> => {
    const s = q<any>(id)!;
    s.value = valor;
    s.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
    await atualizar();
  };
  const digitar = async (id: string, valor: string): Promise<void> => {
    const i = q<any>(id)!;
    i.value = valor;
    i.dispatchEvent(new CustomEvent('sl-input', { bubbles: true }));
    await atualizar();
  };
  const marcar = async (nome: string, valor: string): Promise<void> => {
    el.querySelector<HTMLElement>(`sl-radio[name="${nome}"][value="${valor}"]`)!.click();
    await atualizar();
  };
  const itens = (id: string): HTMLElement[] => Array.from(q(id)!.querySelectorAll<HTMLElement>('sl-menu-item'));
  const textosItens = (id: string): string[] => itens(id).map(i => (i.textContent ?? '').trim());
  const chaveSigla = (id: string, sigla: string): string =>
    itens(id)
      .find(i => (i.textContent ?? '').trim() === sigla)!
      .getAttribute('value')!;
  const escolherSigla = (id: string, sigla: string): Promise<void> => escolher(id, chaveSigla(id, sigla));

  const iniciar = async (config: object = CONFIG): Promise<void> => {
    el = await fixture<NovaProposicaoComponent>(html`<lexml-nova-proposicao></lexml-nova-proposicao>`);
    el.config = config;
    await atualizar();
  };

  beforeEach(() => {
    chamadas = [];
    rotas = {
      '/c/SF': { status: 200, corpo: COMISSOES },
      '/c/CD': { status: 200, corpo: COMISSOES },
      '/c/CN': { status: 200, corpo: COMISSOES },
      '/v/PL/12/2026': { status: 200, corpo: { ementa: 'Ementa do PL 12', textoEstruturadoDisponivel: true } },
      '/v/PL/13/2026': { status: 200, corpo: { ementa: 'Sem texto', textoEstruturadoDisponivel: false } },
      '/v/MPV/99/2026': { status: 200, corpo: { ementa: 'Ementa da MPV 99', textoEstruturadoDisponivel: true } },
      '/t/PL/12/2026': { status: 200, corpo: TEXTO },
      '/t/MPV/99/2026': { status: 200, corpo: TEXTO },
    };
    fetchOriginal = window.fetch;
    window.fetch = (async (url: string): Promise<Response> => {
      chamadas.push(url);
      const r = rotas[url] ?? { status: 404 };
      if (r === 'rede') throw new TypeError('rede');
      return new Response(r.corpo === undefined ? null : JSON.stringify(r.corpo), { status: r.status });
    }) as typeof window.fetch;
  });

  afterEach(() => {
    window.fetch = fetchOriginal;
    inicializarVocabulario('SF');
  });

  describe('configuração', () => {
    ['urlVerificacaoProposicao', 'urlTextoEstruturado', 'urlComissoes'].forEach(nome => {
      it(`sem ${nome}: falha nomeando a URL e não exibe nenhuma tela`, async () => {
        el = await fixture<NovaProposicaoComponent>(html`<lexml-nova-proposicao></lexml-nova-proposicao>`);
        const config: any = { ...CONFIG };
        delete config[nome];
        let erro: Error | undefined;
        try {
          el.config = config;
        } catch (e) {
          erro = e as Error;
        }
        await atualizar();
        expect(erro?.message).to.contain(nome);
        expect(existe('np-erro-configuracao')).to.be.true;
        expect(existe('np-g1')).to.be.false;
      });
    });

    it('casa ausente assume SF e não oferece subemenda substitutiva', async () => {
      const { casaLegislativaEditor, ...semCasa } = CONFIG;
      void casaLegislativaEditor;
      await iniciar(semCasa);
      expect(existe('np-g1')).to.be.true;
      expect(!!el.querySelector('sl-radio[name="especie"][value="subemenda"]')).to.be.false;
      expect(existe('np-g2')).to.be.false;
    });
  });

  describe('Tela 1', () => {
    beforeEach(() => iniciar());

    it('espécie padrão é Proposição, com número s/n, sem Verificar e sem ementa', async () => {
      expect(el.querySelector<any>('sl-radio[name="especie"][value="proposicao"]')!.checked).to.be.true;
      expect(q<any>('np-numero-proposicao')!.value).to.equal('s/n');
      expect(q<any>('np-numero-proposicao')!.disabled).to.be.true;
      expect(existe('np-proposicao-verificar')).to.be.false;
      expect(existe('np-proposicao-ementa')).to.be.false;
    });

    it('padrões em proposição: Plenário e parecer desmarcado', async () => {
      expect(el.querySelector<any>('sl-radio[name="destino"][value="Plenário"]')!.checked).to.be.true;
      expect(q<any>('np-anexo-parecer')!.checked).to.be.false;
    });

    it('lista de siglas: ativos antes de inativos e sem a MPV', async () => {
      const textos = textosItens('np-sigla-proposicao');
      expect(textos).to.include.members(['PL', 'PLP', 'PLV', 'PLS']);
      expect(textos).to.not.include('MPV');
      expect(textos.indexOf('PLS')).to.be.greaterThan(textos.indexOf('PLV'));
    });

    it('sigla inativa exibe alerta sem bloquear; sigla ativa não exibe', async () => {
      await escolherSigla('np-sigla-proposicao', 'PLS');
      expect(existe('np-sigla-inativa')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.true;
      await escolherSigla('np-sigla-proposicao', 'PL');
      expect(existe('np-sigla-inativa')).to.be.false;
    });

    it('Continuar exige a sigla', async () => {
      expect(botaoHabilitado('np-continuar')).to.be.false;
      await escolherSigla('np-sigla-proposicao', 'PL');
      expect(botaoHabilitado('np-continuar')).to.be.true;
    });

    it('PLV exibe o grupo da MPV com sigla fixa; outra sigla não', async () => {
      await escolherSigla('np-sigla-proposicao', 'PLV');
      expect(existe('np-g4')).to.be.true;
      expect(q<any>('np-sigla-mpv')!.value).to.equal('MPV');
      expect(q<any>('np-sigla-mpv')!.disabled).to.be.true;
      await escolherSigla('np-sigla-proposicao', 'PL');
      expect(existe('np-g4')).to.be.false;
    });

    it('PLV exige a MPV verificada', async () => {
      await escolherSigla('np-sigla-proposicao', 'PLV');
      expect(botaoHabilitado('np-continuar')).to.be.false;
      await digitar('np-numero-mpv', '99');
      await clicar('np-mpv-verificar');
      expect(q<any>('np-mpv-ementa')!.value).to.equal('Ementa da MPV 99');
      expect(botaoHabilitado('np-continuar')).to.be.true;
    });

    describe('substitutivo (SF)', () => {
      beforeEach(async () => {
        await marcar('especie', 'substitutivo');
      });

      it('padrões: Comissão e parecer marcado; número editável com Verificar', async () => {
        expect(el.querySelector<any>('sl-radio[name="destino"][value="Comissão"]')!.checked).to.be.true;
        expect(q<any>('np-anexo-parecer')!.checked).to.be.true;
        expect(q<any>('np-numero-proposicao')!.disabled).to.be.false;
        expect(existe('np-proposicao-verificar')).to.be.true;
        expect(existe('np-g2')).to.be.false;
      });

      it('Verificar só habilita com sigla, número e ano', async () => {
        expect(botaoHabilitado('np-proposicao-verificar')).to.be.false;
        await escolherSigla('np-sigla-proposicao', 'PL');
        expect(botaoHabilitado('np-proposicao-verificar')).to.be.false;
        await digitar('np-numero-proposicao', '0012');
        expect(botaoHabilitado('np-proposicao-verificar')).to.be.true;
      });

      it('verifica com valores normalizados, exibe a ementa e apaga ao alterar os campos', async () => {
        await escolherSigla('np-sigla-proposicao', 'PL');
        await digitar('np-numero-proposicao', '0012');
        await clicar('np-proposicao-verificar');
        expect(chamadas).to.include('/v/PL/12/2026');
        expect(q<any>('np-proposicao-ementa')!.value).to.equal('Ementa do PL 12');
        await digitar('np-numero-proposicao', '0013');
        expect(q<any>('np-proposicao-ementa')!.value).to.equal('');
      });

      it('documento inexistente: informa, ementa vazia e Continuar desabilitado', async () => {
        await escolherSigla('np-sigla-proposicao', 'PL');
        await digitar('np-numero-proposicao', '7');
        await clicar('np-proposicao-verificar');
        expect(existe('np-nao-encontrado')).to.be.true;
        expect(q<any>('np-proposicao-ementa')!.value).to.equal('');
        expect(botaoHabilitado('np-continuar')).to.be.false;
      });

      it('falha de comunicação: informa o erro e permite nova tentativa', async () => {
        rotas['/v/PL/12/2026'] = 'rede';
        await escolherSigla('np-sigla-proposicao', 'PL');
        await digitar('np-numero-proposicao', '12');
        await clicar('np-proposicao-verificar');
        expect(existe('np-erro-verificacao')).to.be.true;
        expect(botaoHabilitado('np-proposicao-verificar')).to.be.true;
        expect(botaoHabilitado('np-continuar')).to.be.false;
      });

      it('Continuar exige a comissão e a referência verificada', async () => {
        await escolherSigla('np-sigla-proposicao', 'PL');
        await digitar('np-numero-proposicao', '12');
        await clicar('np-proposicao-verificar');
        expect(botaoHabilitado('np-continuar')).to.be.false;
        await escolher('np-comissao', 'CCJ');
        expect(botaoHabilitado('np-continuar')).to.be.true;
      });
    });

    describe('comissões (g5)', () => {
      it('só as comissões da casa da autoridade do documento são listadas (CN para PLV)', async () => {
        await escolherSigla('np-sigla-proposicao', 'PLV');
        await marcar('destino', 'Comissão');
        expect(chamadas).to.include('/c/CN');
        expect(itens('np-comissao').map(i => i.getAttribute('value'))).to.deep.equal(['CMO']);
      });

      it('falha na obtenção: só Plenário, e o padrão do substitutivo passa a ser Plenário', async () => {
        rotas['/c/SF'] = { status: 500 };
        await marcar('especie', 'substitutivo');
        await escolherSigla('np-sigla-proposicao', 'PL');
        expect(existe('np-erro-comissoes')).to.be.true;
        expect(el.querySelector<any>('sl-radio[name="destino"][value="Comissão"]')!.disabled).to.be.true;
        expect(el.querySelector<any>('sl-radio[name="destino"][value="Plenário"]')!.checked).to.be.true;
      });

      it('destino Comissão sem comissão desabilita Continuar', async () => {
        await escolherSigla('np-sigla-proposicao', 'PL');
        await marcar('destino', 'Comissão');
        expect(botaoHabilitado('np-continuar')).to.be.false;
      });
    });

    it('Cancelar emite o evento sem detail', async () => {
      let detail: unknown = 'nao-emitido';
      el.addEventListener(EVENTO_CANCELADA, (e: Event) => (detail = (e as CustomEvent).detail));
      await clicar('np-cancelar');
      expect(detail).to.be.null;
    });
  });

  describe('Tela 1 na CD', () => {
    beforeEach(() => iniciar({ ...CONFIG, casaLegislativaEditor: 'CD' }));

    it('oferece subemenda e o grupo g2 com número s/n; siglas só do substitutivo', async () => {
      await marcar('especie', 'substitutivo');
      expect(existe('np-g2')).to.be.true;
      expect(q<any>('np-numero-substitutivo')!.value).to.equal('s/n');
      const textos = textosItens('np-sigla-substitutivo');
      expect(textos).to.include('SBT');
      expect(textos).to.not.include('PEP');
      await marcar('especie', 'subemenda');
      expect(textosItens('np-sigla-substitutivo')).to.include('PEP');
    });
  });

  describe('Tela 2', () => {
    const irParaTela2Proposicao = async (): Promise<void> => {
      await escolherSigla('np-sigla-proposicao', 'PL');
      await clicar('np-continuar');
    };
    const irParaTela2Substitutivo = async (): Promise<void> => {
      await marcar('especie', 'substitutivo');
      await escolherSigla('np-sigla-proposicao', 'PL');
      await digitar('np-numero-proposicao', '12');
      await clicar('np-proposicao-verificar');
      await escolher('np-comissao', 'CCJ');
      await clicar('np-continuar');
    };
    const concluida = (): { detail?: any } => {
      const r: { detail?: any } = {};
      el.addEventListener(EVENTO_CONCLUIDA, (e: Event) => (r.detail = (e as CustomEvent).detail));
      return r;
    };
    const opcao = (valor: string): any => el.querySelector<any>(`sl-radio[name="opcaoTexto"][value="${valor}"]`);

    beforeEach(() => iniciar());

    it('proposição: padrão é texto vazio e a opção do documento referenciado não é oferecida', async () => {
      await irParaTela2Proposicao();
      expect(opcao('vazio')!.checked).to.be.true;
      expect(!!opcao('referenciado')).to.be.false;
      expect(q('np-cabecalho')!.textContent).to.contain('Novo(a) Projeto de Lei.');
    });

    it('conclui sem texto: detail sem urnDocumentoReferenciado nem texto', async () => {
      const r = concluida();
      await irParaTela2Proposicao();
      await clicar('np-continuar');
      expect(r.detail.urn).to.equal(`urn:lex:br:senado.federal:projeto.lei;pl:${new Date().getFullYear()};999999`);
      expect(r.detail.epigrafe).to.contain('PROJETO DE LEI Nº');
      expect(r.detail.preambulo).to.equal('O CONGRESSO NACIONAL decreta:');
      expect(r.detail.colegiadoDestino).to.deep.equal({ tipoColegiado: 'Plenário' });
      expect(r.detail.anexoParecer).to.be.false;
      expect('urnDocumentoReferenciado' in r.detail).to.be.false;
      expect('texto' in r.detail).to.be.false;
      expect(chamadas.some(c => c.startsWith('/t/'))).to.be.false;
    });

    it('substitutivo: padrão é o texto referenciado, consultado só ao Continuar', async () => {
      const r = concluida();
      await irParaTela2Substitutivo();
      expect(opcao('referenciado')!.checked).to.be.true;
      expect(chamadas.some(c => c.startsWith('/t/'))).to.be.false;
      await clicar('np-continuar');
      expect(chamadas).to.include('/t/PL/12/2026');
      expect(r.detail.texto).to.deep.equal(TEXTO);
      expect(r.detail.urnDocumentoReferenciado).to.contain('projeto.lei;pl:');
      expect(r.detail.urn).to.contain('@apresentacao.substitutivo');
      expect(r.detail.colegiadoDestino).to.deep.equal({ tipoColegiado: 'Comissão', siglaComissao: 'CCJ' });
      expect(r.detail.anexoParecer).to.be.true;
    });

    it('texto não encontrado (404): alerta e Continuar desabilitado; trocar de opção reabilita', async () => {
      rotas['/t/PL/12/2026'] = { status: 404 };
      await irParaTela2Substitutivo();
      await clicar('np-continuar');
      expect(existe('np-texto-indisponivel')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.false;
      await marcar('opcaoTexto', 'vazio');
      expect(botaoHabilitado('np-continuar')).to.be.true;
    });

    it('indicador de texto indisponível na verificação desabilita Continuar na opção do referenciado', async () => {
      await marcar('especie', 'substitutivo');
      await escolherSigla('np-sigla-proposicao', 'PL');
      await digitar('np-numero-proposicao', '13');
      await clicar('np-proposicao-verificar');
      await escolher('np-comissao', 'CCJ');
      await clicar('np-continuar');
      expect(existe('np-texto-indisponivel')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.false;
      await marcar('opcaoTexto', 'importar');
      expect(existe('np-texto-indisponivel')).to.be.false;
    });

    it('falha na obtenção do texto: informa o erro e permite nova tentativa', async () => {
      rotas['/t/PL/12/2026'] = 'rede';
      await irParaTela2Substitutivo();
      await clicar('np-continuar');
      expect(existe('np-erro-texto')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.true;
    });

    it('texto de outra proposição: exige verificação e aceita qualquer sigla', async () => {
      const r = concluida();
      await irParaTela2Proposicao();
      await marcar('opcaoTexto', 'outra');
      expect(botaoHabilitado('np-continuar')).to.be.false;
      await digitar('np-sigla-outra', 'pl');
      await digitar('np-numero-outra', '12');
      await clicar('np-outra-verificar');
      expect(q<any>('np-outra-ementa')!.value).to.equal('Ementa do PL 12');
      await clicar('np-continuar');
      expect(r.detail.texto).to.deep.equal(TEXTO);
    });

    it('Voltar preserva os dados da Tela 1', async () => {
      await irParaTela2Proposicao();
      await clicar('np-voltar');
      expect(q<any>('np-sigla-proposicao').value).to.equal(chaveSigla('np-sigla-proposicao', 'PL'));
    });

    it('PLV: padrão é o texto da MPV', async () => {
      await escolherSigla('np-sigla-proposicao', 'PLV');
      await digitar('np-numero-mpv', '99');
      await clicar('np-mpv-verificar');
      await clicar('np-continuar');
      expect(opcao('referenciado')!.checked).to.be.true;
      expect(q('np-cabecalho')!.textContent).to.contain('Projeto de Lei de Conversão (Medida Provisória nº 99 de');
      const r = concluida();
      await clicar('np-continuar');
      expect(chamadas).to.include('/t/MPV/99/2026');
      expect(r.detail.urnDocumentoReferenciado).to.contain('federal:medida.provisoria;mpv:');
    });

    describe('importação simulada', () => {
      const selecionarArquivo = async (arquivo: File): Promise<void> => {
        const input = q<any>('np-arquivo')!;
        const dt = new DataTransfer();
        dt.items.add(arquivo);
        input.files = dt.files;
        input.dispatchEvent(new Event('change'));
        await atualizar();
      };

      it('arquivo válido leva à Tela 3 com erro simulado, sem chamar URL de texto', async () => {
        await irParaTela2Proposicao();
        await marcar('opcaoTexto', 'importar');
        expect(botaoHabilitado('np-continuar')).to.be.false;
        await selecionarArquivo(new File(['x'], 'texto.docx'));
        const antes = chamadas.length;
        await clicar('np-continuar');
        expect(q('np-erros-titulo')!.textContent).to.contain('texto.docx');
        expect(q('np-erros')!.textContent).to.contain('simulado');
        expect(chamadas.length).to.equal(antes);
      });

      it('arquivo maior que 5 MB ou de outro formato é recusado', async () => {
        await irParaTela2Proposicao();
        await marcar('opcaoTexto', 'importar');
        await selecionarArquivo(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.docx'));
        expect(q('np-erro-arquivo')!.textContent).to.contain('5 MB');
        expect(botaoHabilitado('np-continuar')).to.be.false;
        await selecionarArquivo(new File(['x'], 'imagem.png'));
        expect(existe('np-erro-arquivo')).to.be.true;
        expect(botaoHabilitado('np-continuar')).to.be.false;
      });

      it('Tela 3: Continuar conclui com documento vazio; Voltar retorna à Tela 2', async () => {
        const r = concluida();
        await irParaTela2Proposicao();
        await marcar('opcaoTexto', 'importar');
        await selecionarArquivo(new File(['x'], 'texto.txt'));
        await clicar('np-continuar');
        await clicar('np-voltar');
        expect(existe('np-arquivo')).to.be.true;
        await clicar('np-continuar');
        await clicar('np-continuar');
        expect('texto' in r.detail).to.be.false;
      });
    });
  });
});
