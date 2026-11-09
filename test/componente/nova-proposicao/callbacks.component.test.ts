import { expect, fixture, html } from '@open-wc/testing';
import { EVENTO_CONCLUIDA, NovaProposicaoComponent } from '../../../src/components/nova-proposicao/nova-proposicao.component';
import { ConfigNovaProposicao } from '../../../src/components/nova-proposicao/urlsNovaProposicao';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const COMISSOES = [
  { siglaCasaLegislativa: 'SF', sigla: 'CCJ', nome: 'Comissão de Constituição, Justiça e Cidadania' },
  { siglaCasaLegislativa: 'CD', sigla: 'CFT', nome: 'Comissão de Finanças e Tributação' },
];
const TEXTO = { value: { texto: 'jsonix do callback' } };
const URN_PL_SN = 'urn:lex:br:senado.federal:projeto.lei;pl:2026;999999';
const URLS = { urlVerificacaoProposicao: '/v/{sigla}/{numero}/{ano}', urlTextoEstruturado: '/t/{sigla}/{numero}/{ano}', urlComissoes: '/c/{casa}' };

describe('lexml-nova-proposicao — callbacks opcionais na configuração', () => {
  let el: NovaProposicaoComponent;
  let fetchOriginal: typeof window.fetch;
  let urlsChamadas: string[];
  let consultas: Array<{ origem: string; arg: unknown }>;

  const pausa = (): Promise<void> => new Promise(r => setTimeout(r, 0));
  const atualizar = async (): Promise<void> => {
    await pausa();
    await el.updateComplete;
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
  const abrirLista = async (id: string): Promise<void> => {
    q<any>(id)!.querySelector('sl-input')!.dispatchEvent(new MouseEvent('click'));
    await atualizar();
  };
  const escolherNaLista = async (id: string, valor: string): Promise<void> => {
    await abrirLista(id);
    el.querySelector<HTMLElement>(`#${id} .ac-lista li[data-value="${valor}"]`)!.click();
    await atualizar();
  };
  const escolherSigla = (id: string, sigla: string): Promise<void> => escolherNaLista(id, q<any>(id)!.items.find((i: any) => i.label === sigla).value);
  const sugestoesDeComissao = async (): Promise<(string | null)[]> => {
    await abrirLista('np-comissao');
    return Array.from(el.querySelectorAll<HTMLElement>('#np-comissao .ac-lista li')).map(li => li.getAttribute('data-value'));
  };
  const concluida = (): { detail?: any } => {
    const r: { detail?: any } = {};
    el.addEventListener(EVENTO_CONCLUIDA, (e: Event) => (r.detail = (e as CustomEvent).detail));
    return r;
  };
  const chamadasDe = (origem: string): unknown[] => consultas.filter(c => c.origem === origem).map(c => c.arg);

  // Callbacks padrão: cada chamada é registrada; `sobrescrever` troca o comportamento de qualquer um.
  const callbacks = (sobrescrever: Partial<ConfigNovaProposicao> = {}): ConfigNovaProposicao => ({
    onObterComissoes: (casa): typeof COMISSOES => {
      consultas.push({ origem: 'comissoes', arg: casa });
      return COMISSOES;
    },
    onVerificarProposicao: (consulta): { ementa: string } => {
      consultas.push({ origem: 'verificacao', arg: consulta });
      return { ementa: `Ementa do callback ${consulta.sigla} ${consulta.numero}` };
    },
    onObterTexto: (consulta): typeof TEXTO => {
      consultas.push({ origem: 'texto', arg: consulta });
      return TEXTO;
    },
    ...sobrescrever,
  });

  const iniciar = async (config: ConfigNovaProposicao): Promise<void> => {
    el = await fixture<NovaProposicaoComponent>(html`<lexml-nova-proposicao></lexml-nova-proposicao>`);
    el.config = { casaLegislativaEditor: 'SF', ...config };
    await atualizar();
  };

  const verificarSubstitutivo = async (numero = '0012'): Promise<void> => {
    await marcar('especie', 'substitutivo');
    await escolherSigla('np-sigla-proposicao', 'PL');
    await digitar('np-numero-proposicao', numero);
    await digitar('np-ano-proposicao', '2026');
    await clicar('np-proposicao-verificar');
  };
  const irParaTela2Substitutivo = async (): Promise<void> => {
    await verificarSubstitutivo();
    await escolherNaLista('np-comissao', 'CCJ');
    await clicar('np-continuar');
  };

  beforeEach(() => {
    urlsChamadas = [];
    consultas = [];
    fetchOriginal = window.fetch;
    window.fetch = (async (url: string): Promise<Response> => {
      // Ícones do Shoelace também passam por fetch (data:); só interessam as URLs da configuração.
      if (url.startsWith('/')) urlsChamadas.push(url);
      const corpo = url.startsWith('/c/') ? COMISSOES : url.startsWith('/t/') ? TEXTO : { ementa: 'Ementa da URL', textoEstruturadoDisponivel: true };
      return new Response(JSON.stringify(corpo), { status: 200 });
    }) as typeof window.fetch;
  });

  afterEach(() => {
    window.fetch = fetchOriginal;
    inicializarVocabulario('SF');
  });

  describe('comissões (onObterComissoes)', () => {
    it('lista as comissões do callback, filtradas pela casa, sem chamar fetch', async () => {
      await iniciar(callbacks());
      await escolherSigla('np-sigla-proposicao', 'PL');
      await marcar('destino', 'Comissão');
      expect(chamadasDe('comissoes')).to.deep.equal(['SF']);
      expect(await sugestoesDeComissao()).to.deep.equal(['CCJ']);
      expect(urlsChamadas).to.deep.equal([]);
    });

    it('rejeição: só Plenário é oferecido e o padrão do substitutivo passa a ser Plenário', async () => {
      await iniciar(callbacks({ onObterComissoes: () => Promise.reject(new Error('falhou')) }));
      await marcar('especie', 'substitutivo');
      await escolherSigla('np-sigla-proposicao', 'PL');
      expect(existe('np-erro-comissoes')).to.be.true;
      expect(el.querySelector<any>('sl-radio[name="destino"][value="Comissão"]')!.disabled).to.be.true;
      expect(el.querySelector<any>('sl-radio[name="destino"][value="Plenário"]')!.checked).to.be.true;
    });

    it('modo de edição: a comissão inicial vem do callback', async () => {
      el = await fixture<NovaProposicaoComponent>(html`<lexml-nova-proposicao></lexml-nova-proposicao>`);
      el.config = { casaLegislativaEditor: 'SF', ...callbacks() };
      el.iniciarModoEdicao({ urn: URN_PL_SN, colegiadoApreciador: { tipoColegiado: 'Comissão', siglaComissao: 'CCJ' } });
      await atualizar();
      expect(q<any>('np-comissao')!.value).to.equal('CCJ');
      expect(botaoHabilitado('np-continuar')).to.be.true;
      expect(chamadasDe('comissoes')).to.deep.equal(['SF']);
      expect(urlsChamadas).to.deep.equal([]);
    });
  });

  describe('verificação (onVerificarProposicao)', () => {
    beforeEach(() => iniciar(callbacks()));

    it('recebe os valores normalizados, exibe a ementa e considera o texto disponível', async () => {
      await verificarSubstitutivo('0012');
      expect(chamadasDe('verificacao')).to.deep.equal([{ sigla: 'PL', numero: '12', ano: '2026' }]);
      expect(q('np-proposicao-ementa')!.textContent).to.equal('Ementa do callback PL 12');
      await escolherNaLista('np-comissao', 'CCJ');
      expect(botaoHabilitado('np-continuar')).to.be.true;
      await clicar('np-continuar');
      expect(existe('np-texto-indisponivel')).to.be.false;
      expect(urlsChamadas).to.deep.equal([]);
    });

    it('undefined: documento não encontrado e Continuar desabilitado', async () => {
      await iniciar(callbacks({ onVerificarProposicao: () => undefined }));
      await verificarSubstitutivo();
      expect(existe('np-nao-encontrado')).to.be.true;
      expect(q('np-proposicao-ementa')!.textContent).to.equal('');
      expect(botaoHabilitado('np-continuar')).to.be.false;
    });

    it('rejeição e exceção síncrona: erro de verificação e nova tentativa permitida', async () => {
      const falhas = [
        (): never => {
          throw new Error('síncrona');
        },
        (): Promise<never> => Promise.reject(new Error('rejeitada')),
      ];
      for (const falha of falhas) {
        await iniciar(callbacks({ onVerificarProposicao: falha }));
        await verificarSubstitutivo();
        expect(existe('np-erro-verificacao')).to.be.true;
        expect(botaoHabilitado('np-proposicao-verificar')).to.be.true;
        expect(botaoHabilitado('np-continuar')).to.be.false;
      }
    });

    it('textoEstruturadoDisponivel falso bloqueia Continuar na opção do referenciado', async () => {
      await iniciar(callbacks({ onVerificarProposicao: () => ({ ementa: 'x', textoEstruturadoDisponivel: false }) }));
      await irParaTela2Substitutivo();
      expect(existe('np-texto-indisponivel')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.false;
    });

    it('complementar verdadeiro define a URN do documento referenciado (PLS)', async () => {
      await iniciar(callbacks({ onVerificarProposicao: () => ({ ementa: 'x', complementar: true }) }));
      const r = concluida();
      await marcar('especie', 'substitutivo');
      await escolherSigla('np-sigla-proposicao', 'PLS');
      await digitar('np-numero-proposicao', '7');
      await digitar('np-ano-proposicao', '2026');
      await clicar('np-proposicao-verificar');
      await escolherNaLista('np-comissao', 'CCJ');
      await clicar('np-continuar');
      await marcar('opcaoTexto', 'vazio');
      await clicar('np-continuar');
      expect(r.detail.urnDocumentoReferenciado).to.equal('urn:lex:br:senado.federal:projeto.lei.complementar;pls:2026;7');
    });

    it('vale também na medida provisória do PLV e em outra proposição', async () => {
      await escolherSigla('np-sigla-proposicao', 'PLV');
      await digitar('np-numero-mpv', '99');
      await digitar('np-ano-mpv', '2026');
      await clicar('np-mpv-verificar');
      expect(q('np-mpv-ementa')!.textContent).to.equal('Ementa do callback MPV 99');
      await clicar('np-continuar');
      await marcar('opcaoTexto', 'outra');
      await escolherSigla('np-sigla-outra', 'PL');
      await digitar('np-numero-outra', '5');
      await digitar('np-ano-outra', '2026');
      await clicar('np-outra-verificar');
      expect(q('np-outra-ementa')!.textContent).to.equal('Ementa do callback PL 5');
      expect(chamadasDe('verificacao')).to.deep.equal([
        { sigla: 'MPV', numero: '99', ano: '2026' },
        { sigla: 'PL', numero: '5', ano: '2026' },
      ]);
      expect(urlsChamadas).to.deep.equal([]);
    });
  });

  describe('texto (onObterTexto)', () => {
    it('recebe os valores normalizados e o texto vai no resultado, sem chamar fetch', async () => {
      await iniciar(callbacks());
      const r = concluida();
      await irParaTela2Substitutivo();
      await clicar('np-continuar');
      expect(chamadasDe('texto')).to.deep.equal([{ sigla: 'PL', numero: '12', ano: '2026' }]);
      expect(r.detail.texto).to.deep.equal(TEXTO);
      expect(urlsChamadas).to.deep.equal([]);
    });

    it('só é chamado com a opção do referenciado ou de outra proposição', async () => {
      await iniciar(callbacks());
      const r = concluida();
      await irParaTela2Substitutivo();
      await marcar('opcaoTexto', 'vazio');
      await clicar('np-continuar');
      expect(chamadasDe('texto')).to.deep.equal([]);
      expect('texto' in r.detail).to.be.false;
    });

    it('undefined: texto indisponível, alerta e Continuar desabilitado', async () => {
      await iniciar(callbacks({ onObterTexto: () => undefined }));
      const r = concluida();
      await irParaTela2Substitutivo();
      await clicar('np-continuar');
      expect(existe('np-texto-indisponivel')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.false;
      expect(r.detail).to.be.undefined;
    });

    it('rejeição: informa o erro e permite nova tentativa', async () => {
      await iniciar(callbacks({ onObterTexto: () => Promise.reject(new Error('falhou')) }));
      await irParaTela2Substitutivo();
      await clicar('np-continuar');
      expect(existe('np-erro-texto')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.true;
    });
  });

  describe('importação (onImportarArquivo)', () => {
    const selecionarArquivo = async (arquivo: File): Promise<void> => {
      const input = q<any>('np-arquivo')!;
      const dt = new DataTransfer();
      dt.items.add(arquivo);
      input.files = dt.files;
      input.dispatchEvent(new Event('change'));
      await atualizar();
    };
    const prepararImportacao = async (onImportarArquivo?: ConfigNovaProposicao['onImportarArquivo']): Promise<void> => {
      await iniciar({ ...callbacks(), onImportarArquivo });
      await escolherSigla('np-sigla-proposicao', 'PL');
      await clicar('np-continuar');
      await marcar('opcaoTexto', 'importar');
    };
    const arquivosRecebidos: File[] = [];
    const registrando =
      (resposta: () => unknown): ConfigNovaProposicao['onImportarArquivo'] =>
      (arquivo): any => {
        arquivosRecebidos.push(arquivo);
        return resposta();
      };

    beforeEach(() => {
      arquivosRecebidos.length = 0;
    });

    it('sucesso: recebe o arquivo e conclui com o texto devolvido', async () => {
      await prepararImportacao(registrando(() => ({ texto: TEXTO, erros: [] })));
      const r = concluida();
      await selecionarArquivo(new File(['x'], 'minuta.docx'));
      await clicar('np-continuar');
      expect(arquivosRecebidos.map(a => a.name)).to.deep.equal(['minuta.docx']);
      expect(r.detail.texto).to.deep.equal(TEXTO);
      expect(r.detail.urn).to.contain('projeto.lei;pl:');
      expect(urlsChamadas).to.deep.equal([]);
    });

    it('erros: Tela 3 com o nome do arquivo e a lista devolvida', async () => {
      await prepararImportacao(registrando(() => ({ erros: ['Linha 3 inválida', 'Artigo sem número'] })));
      const r = concluida();
      await selecionarArquivo(new File(['x'], 'minuta.txt'));
      await clicar('np-continuar');
      expect(q('np-erros-titulo')!.textContent).to.contain('minuta.txt');
      expect(Array.from(el.querySelectorAll('#np-erros li')).map(li => li.textContent)).to.deep.equal(['Linha 3 inválida', 'Artigo sem número']);
      expect(r.detail).to.be.undefined;
    });

    it('sem erros e sem texto: Tela 3 com a mensagem do conversor, sem concluir e sem alterar o array do host', async () => {
      const retorno = { erros: [] as string[] };
      await prepararImportacao(registrando(() => retorno));
      const r = concluida();
      await selecionarArquivo(new File(['x'], 'minuta.docx'));
      await clicar('np-continuar');
      expect(q('np-erros')!.textContent).to.contain('O conversor não devolveu o texto do documento.');
      expect(r.detail).to.be.undefined;
      expect(retorno.erros).to.have.length(0);
    });

    it('rejeição e exceção síncrona: permanece na Tela 2 com erro de comunicação e permite nova tentativa', async () => {
      const falhas = [
        (): never => {
          throw new Error('síncrona');
        },
        (): Promise<never> => Promise.reject(new Error('rejeitada')),
      ];
      for (const falha of falhas) {
        let tentativas = 0;
        await prepararImportacao(registrando(() => (++tentativas === 1 ? falha() : { texto: TEXTO, erros: [] })));
        const r = concluida();
        await selecionarArquivo(new File(['x'], 'minuta.docx'));
        await clicar('np-continuar');
        expect(existe('np-arquivo')).to.be.true;
        expect(q('np-erro-texto')!.textContent).to.contain('Não foi possível converter o arquivo');
        expect(existe('np-erros')).to.be.false;
        expect(botaoHabilitado('np-continuar')).to.be.true;
        await clicar('np-continuar');
        expect(tentativas).to.equal(2);
        expect(r.detail.texto).to.deep.equal(TEXTO);
      }
    });

    it('arquivo acima de 5 MB ou de extensão não aceita não chama o callback', async () => {
      await prepararImportacao(registrando(() => ({ texto: TEXTO, erros: [] })));
      await selecionarArquivo(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.docx'));
      expect(existe('np-erro-arquivo')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.false;
      await clicar('np-continuar');
      await selecionarArquivo(new File(['x'], 'imagem.png'));
      expect(existe('np-erro-arquivo')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.false;
      await clicar('np-continuar');
      expect(arquivosRecebidos).to.have.length(0);
    });

    it('sem o callback, a importação continua simulada e sem chamar URL', async () => {
      await prepararImportacao(undefined);
      await selecionarArquivo(new File(['x'], 'minuta.docx'));
      await clicar('np-continuar');
      expect(q('np-erros')!.textContent).to.contain('simulado');
      expect(urlsChamadas).to.deep.equal([]);
    });
  });

  describe('precedência e independência das origens', () => {
    it('com callbacks e URLs informados, as URLs não são chamadas', async () => {
      await iniciar({ ...URLS, ...callbacks() });
      const r = concluida();
      await irParaTela2Substitutivo();
      await clicar('np-continuar');
      expect(chamadasDe('comissoes')).to.have.length.greaterThan(0);
      expect(chamadasDe('verificacao')).to.have.length(1);
      expect(chamadasDe('texto')).to.have.length(1);
      expect(r.detail.texto).to.deep.equal(TEXTO);
      expect(urlsChamadas).to.deep.equal([]);
    });

    it('callback só na verificação: comissões e texto continuam pelas URLs', async () => {
      await iniciar({ ...URLS, onVerificarProposicao: callbacks().onVerificarProposicao });
      const r = concluida();
      await irParaTela2Substitutivo();
      await clicar('np-continuar');
      expect(chamadasDe('verificacao')).to.have.length(1);
      expect(urlsChamadas).to.include('/c/SF');
      expect(urlsChamadas).to.include('/t/PL/12/2026');
      expect(urlsChamadas.some(u => u.startsWith('/v/'))).to.be.false;
      expect(r.detail.texto).to.deep.equal(TEXTO);
    });

    it('sem callbacks, o comportamento por URL permanece', async () => {
      await iniciar(URLS);
      await verificarSubstitutivo();
      expect(urlsChamadas).to.include('/v/PL/12/2026');
      expect(q('np-proposicao-ementa')!.textContent).to.equal('Ementa da URL');
    });
  });
});
