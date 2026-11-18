import { expect, fixture, html } from '@open-wc/testing';
import { EVENTO_CONCLUIDA, NovaProposicaoComponent } from '../../../src/components/nova-proposicao/nova-proposicao.component';
import { ConfigNovaProposicao, DocumentoMateria } from '../../../src/components/nova-proposicao/urlsNovaProposicao';
import { inicializarVocabulario } from '../../../src/model/lexml/documento/vocabulario';

const COMISSOES = [{ siglaCasaLegislativa: 'CD', sigla: 'CFT', nome: 'Comissão de Finanças e Tributação' }];
const TEXTO = { value: { texto: 'jsonix do documento' } };
const URLS = { urlVerificacaoProposicao: '/v/{sigla}/{numero}/{ano}', urlTextoEstruturado: '/t/{sigla}/{numero}/{ano}', urlComissoes: '/c/{casa}', urlImportacaoArquivo: '/i' };

const doc = (o: Partial<DocumentoMateria> = {}): DocumentoMateria => ({
  id: 'd1',
  titulo: 'Substitutivo do relator',
  sigla: 'PRL',
  numero: '1',
  ano: 2025,
  urlDocumento: 'https://exemplo.test/d1',
  nomeAutor: 'Fulana',
  papelAutor: 'Relatora',
  indSexoAutor: 'F',
  dataApresentacao: '2025-09-05',
  siglaComissao: 'CSAUDE',
  ...o,
});
const DOCUMENTOS = [
  doc({ ementa: 'Dispõe sobre a atualização do Código Civil e da legislação correlata.' }),
  doc({
    id: 'd2',
    titulo: 'Parecer do relator 1 – CCJC',
    siglaComissao: 'CCJC',
    nomeAutor: 'Beltrano',
    papelAutor: 'Relator',
    indSexoAutor: 'M',
    dataApresentacao: '2025-08-12',
    tooltipDocumento: 'Parecer na íntegra (PDF)',
  }),
  doc({
    id: 'd3',
    titulo: 'PL 117/2025 (apensado)',
    sigla: 'PL',
    numero: '117',
    siglaComissao: undefined,
    papelAutor: 'Autor',
    textoEstruturadoDisponivel: false,
    urlDocumento: undefined,
  }),
];

describe('lexml-nova-proposicao — Tela 2b (documento de origem na CD)', () => {
  let el: NovaProposicaoComponent;
  let consultas: Array<{ origem: string; arg: unknown }>;
  let contextos: unknown[];
  let respostas: { listar: (c: any) => unknown; texto: (c: any) => unknown; verificar: (c: any) => unknown };

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
  const concluida = (): { detail?: any } => {
    const r: { detail?: any } = {};
    el.addEventListener(EVENTO_CONCLUIDA, (e: Event) => (r.detail = (e as CustomEvent).detail));
    return r;
  };
  const chamadasDe = (origem: string): unknown[] => consultas.filter(c => c.origem === origem).map(c => c.arg);
  const linhas = (): HTMLElement[] => Array.from(el.querySelectorAll<HTMLElement>('#np-docs-lista .np-doc'));
  const linha = (id: string): HTMLElement => el.querySelector<HTMLElement>(`#np-docs-lista .np-doc[data-id="${id}"]`)!;
  const textoDe = (id: string): string => (q(id)?.textContent ?? '').replace(/\s+/g, ' ').trim();

  const config = (): ConfigNovaProposicao => ({
    casaLegislativaEditor: 'CD',
    ...URLS,
    urlDocumentosMateria: '/m/{sigla}/{numero}/{ano}',
    urlTextoDocumento: '/d/{id}',
    onObterComissoes: () => COMISSOES,
    onVerificarProposicao: (c): any => {
      consultas.push({ origem: 'verificacao', arg: c });
      return respostas.verificar(c);
    },
    onListarDocumentos: (c, contexto): any => {
      consultas.push({ origem: 'listar', arg: c });
      contextos.push(contexto);
      return respostas.listar(c);
    },
    onObterTextoDocumento: (c): any => {
      consultas.push({ origem: 'textoDocumento', arg: c });
      return respostas.texto(c);
    },
  });

  const iniciar = async (): Promise<void> => {
    el = await fixture<NovaProposicaoComponent>(html`<lexml-nova-proposicao></lexml-nova-proposicao>`);
    el.config = config();
    await atualizar();
  };

  // Tela 1 (subemenda substitutiva ao PL 12/2026) -> Tela 2 (outra proposição) -> Tela 2b.
  const irParaTela2b = async (): Promise<void> => {
    await marcar('especie', 'subemenda');
    await escolherSigla('np-sigla-proposicao', 'PL');
    await digitar('np-numero-proposicao', '0012');
    await digitar('np-ano-proposicao', '2026');
    await clicar('np-proposicao-verificar');
    await escolherNaLista('np-comissao', 'CFT');
    await clicar('np-continuar');
    await marcar('opcaoTexto', 'outra');
    await clicar('np-continuar');
  };

  beforeEach(() => {
    consultas = [];
    contextos = [];
    respostas = { listar: () => DOCUMENTOS, texto: () => TEXTO, verificar: () => ({ ementa: 'Ementa' }) };
  });

  afterEach(() => inicializarVocabulario('SF'));

  describe('matéria', () => {
    beforeEach(async () => {
      await iniciar();
      await irParaTela2b();
    });

    it('"Nesta mesma matéria" é o padrão e lista os documentos da proposição referenciada', async () => {
      expect(existe('np-tela-2b')).to.be.true;
      expect((el.querySelector<any>('sl-radio[name="materia"][value="mesma"]') as any).checked).to.be.true;
      expect(existe('np-sigla-materia')).to.be.false;
      expect(chamadasDe('listar')).to.deep.equal([{ sigla: 'PL', numero: '12', ano: '2026' }]);
      expect(linhas().length).to.equal(3);
    });

    it('o callback de listagem recebe o contexto da subemenda; o documento referenciado é o da Tela 1, mesmo em outra matéria', async () => {
      const referenciado = { urn: 'urn:lex:br:camara.deputados:projeto.lei;pl:2026;12', sigla: 'PL', numero: '12', ano: '2026' };
      const c: any = contextos[0];
      expect(c.casa).to.equal('CD');
      expect(c.especie).to.equal('subemenda');
      expect(c.siglaDocumento).to.equal('SSP');
      expect(c.urn).to.match(/^urn:lex:br:camara\.deputados:subemenda\.substitutiva;ssp:\d{4};999999$/);
      expect(c.documentoReferenciado).to.deep.equal(referenciado);
      expect(Object.isFrozen(c)).to.be.true;

      await marcar('materia', 'outra');
      await escolherSigla('np-sigla-materia', 'PL');
      await digitar('np-numero-materia', '0004');
      await digitar('np-ano-materia', '2025');
      await clicar('np-materia-verificar');
      expect(chamadasDe('listar').pop()).to.deep.equal({ sigla: 'PL', numero: '4', ano: '2025' });
      expect((contextos.pop() as any).documentoReferenciado).to.deep.equal(referenciado);
    });

    it('"Em outra matéria": lista só depois de verificar e descarta a seleção anterior', async () => {
      linha('d1').click();
      await atualizar();
      expect(existe('np-fonte-selecionada')).to.be.true;

      await marcar('materia', 'outra');
      expect(existe('np-sigla-materia')).to.be.true;
      expect(existe('np-docs-lista')).to.be.false;
      expect(botaoHabilitado('np-materia-verificar')).to.be.false;

      await escolherSigla('np-sigla-materia', 'PL');
      await digitar('np-numero-materia', '0004');
      await digitar('np-ano-materia', '2025');
      expect(botaoHabilitado('np-materia-verificar')).to.be.true;
      await clicar('np-materia-verificar');

      expect(chamadasDe('verificacao').pop()).to.deep.equal({ sigla: 'PL', numero: '4', ano: '2025' });
      expect(chamadasDe('listar').pop()).to.deep.equal({ sigla: 'PL', numero: '4', ano: '2025' });
      expect(linhas().length).to.equal(3);
      expect(existe('np-fonte-selecionada')).to.be.false;
    });

    it('"Em outra matéria" inexistente: informa e não exibe a lista', async () => {
      respostas.verificar = () => undefined;
      await marcar('materia', 'outra');
      await escolherSigla('np-sigla-materia', 'PL');
      await digitar('np-numero-materia', '9');
      await digitar('np-ano-materia', '2025');
      await clicar('np-materia-verificar');
      expect(existe('np-nao-encontrado')).to.be.true;
      expect(existe('np-docs-lista')).to.be.false;
      expect(chamadasDe('listar').length).to.equal(1);
    });

    it('alterar o número da outra matéria invalida a verificação e a lista', async () => {
      await marcar('materia', 'outra');
      await escolherSigla('np-sigla-materia', 'PL');
      await digitar('np-numero-materia', '4');
      await digitar('np-ano-materia', '2025');
      await clicar('np-materia-verificar');
      expect(linhas().length).to.equal(3);
      await digitar('np-numero-materia', '5');
      expect(existe('np-docs-lista')).to.be.false;
    });
  });

  describe('lista de documentos', () => {
    beforeEach(async () => {
      await iniciar();
      await irParaTela2b();
    });

    it('mostra título, identificação, autor com "Dep." e data DD/MM/AAAA', async () => {
      const l1 = (linha('d1').textContent ?? '').replace(/\s+/g, ' ');
      expect(l1).to.contain('Substitutivo do relator');
      expect(l1).to.contain('PRL 1/2025 CSAUDE');
      expect(l1).to.contain('Relatora: Dep. Fulana');
      expect(l1).to.contain('05/09/2025');
    });

    it('o tratamento é "Dep." mesmo com indSexoAutor masculino', async () => {
      expect((linha('d2').textContent ?? '').replace(/\s+/g, ' ')).to.contain('Relator: Dep. Beltrano');
    });

    it('Continuar só habilita com documento selecionado; a faixa mostra a fonte e Trocar desfaz', async () => {
      expect(botaoHabilitado('np-continuar')).to.be.false;
      linha('d2').click();
      await atualizar();
      expect(botaoHabilitado('np-continuar')).to.be.true;
      expect(textoDe('np-fonte-selecionada')).to.contain('Parecer do relator 1 – CCJC');
      expect(textoDe('np-fonte-selecionada')).to.contain('matéria PL 12/2026');
      await clicar('np-trocar');
      expect(existe('np-fonte-selecionada')).to.be.false;
      expect(botaoHabilitado('np-continuar')).to.be.false;
    });

    it('a seleção é única', async () => {
      linha('d1').click();
      await atualizar();
      linha('d2').click();
      await atualizar();
      expect(
        linhas()
          .filter(l => l.getAttribute('aria-selected') === 'true')
          .map(l => l.dataset.id)
      ).to.deep.equal(['d2']);
    });

    it('documento sem texto estruturado aparece desabilitado, com aviso, e não é selecionável', async () => {
      expect(linha('d3').getAttribute('aria-disabled')).to.equal('true');
      expect(linha('d3').textContent).to.contain('Texto estruturado não disponível');
      linha('d3').click();
      await atualizar();
      expect(existe('np-fonte-selecionada')).to.be.false;
      expect(botaoHabilitado('np-continuar')).to.be.false;
    });

    it('o ícone do documento abre em outra aba sem selecionar o documento', async () => {
      const a = linha('d1').querySelector<HTMLAnchorElement>('a.np-doc-link')!;
      expect(a.getAttribute('href')).to.equal('https://exemplo.test/d1');
      expect(a.getAttribute('target')).to.equal('_blank');
      expect(a.getAttribute('rel')).to.contain('noopener');
      a.addEventListener('click', e => e.preventDefault());
      a.click();
      await atualizar();
      expect(existe('np-fonte-selecionada')).to.be.false;
    });

    it('sem urlDocumento a linha não exibe o ícone', async () => {
      expect(linha('d3').querySelector('a.np-doc-link')).to.equal(null);
      expect(linha('d1').querySelector('a.np-doc-link')).to.not.equal(null);
    });

    it('tooltip e aria-label: o padrão sem tooltipDocumento e o do host quando informado', async () => {
      const padrao = linha('d1').querySelector<HTMLAnchorElement>('a.np-doc-link')!;
      expect(padrao.getAttribute('title')).to.equal('Abrir o documento em outra aba');
      expect(padrao.getAttribute('aria-label')).to.equal('Abrir o documento em outra aba');
      const host = linha('d2').querySelector<HTMLAnchorElement>('a.np-doc-link')!;
      expect(host.getAttribute('title')).to.equal('Parecer na íntegra (PDF)');
      expect(host.getAttribute('aria-label')).to.equal('Parecer na íntegra (PDF)');
    });

    it('a ementa aparece abaixo do título, limitada a 2 linhas, com o texto completo no tooltip; sem ementa não há bloco', async () => {
      const ementa = linha('d1').querySelector<HTMLElement>('.np-doc-ementa')!;
      expect(ementa.textContent?.trim()).to.equal('Dispõe sobre a atualização do Código Civil e da legislação correlata.');
      expect(ementa.getAttribute('title')).to.equal('Dispõe sobre a atualização do Código Civil e da legislação correlata.');
      expect(getComputedStyle(ementa).webkitLineClamp).to.equal('2');
      const titulo = linha('d1').querySelector('.np-doc-titulo')!;
      const detalhe = linha('d1').querySelector('.np-doc-detalhe')!;
      expect(titulo.nextElementSibling).to.equal(ementa);
      expect(ementa.nextElementSibling).to.equal(detalhe);
      expect(linha('d2').querySelector('.np-doc-ementa')).to.equal(null);
    });

    it('o filtro alcança a ementa', async () => {
      await digitar('np-docs-filtro', 'codigo civil');
      expect(linhas().map(l => l.dataset.id)).to.deep.equal(['d1']);
    });

    it('o filtro é textual, sem acento nem caixa, e alcança a data exibida', async () => {
      await digitar('np-docs-filtro', 'PARECER');
      expect(linhas().map(l => l.dataset.id)).to.deep.equal(['d2']);
      await digitar('np-docs-filtro', '12/08/2025');
      expect(linhas().map(l => l.dataset.id)).to.deep.equal(['d2']);
      await digitar('np-docs-filtro', 'beltrano ccjc');
      expect(linhas().map(l => l.dataset.id)).to.deep.equal(['d2']);
      await digitar('np-docs-filtro', 'zzz');
      expect(linhas().length).to.equal(0);
      expect(existe('np-docs-sem-resultado')).to.be.true;
    });
  });

  describe('listagem por URL', () => {
    const fetchOriginal = window.fetch;
    let urls: string[];

    beforeEach(async () => {
      urls = [];
      window.fetch = (async (url: string) => {
        urls.push(url);
        return new Response(JSON.stringify(DOCUMENTOS), { status: 200 });
      }) as typeof fetch;
      el = await fixture<NovaProposicaoComponent>(html`<lexml-nova-proposicao></lexml-nova-proposicao>`);
      el.config = { ...config(), onListarDocumentos: undefined, urlDocumentosMateria: '/m/{sigla}/{numero}/{ano}?especie={especie}&ref={urnDocumentoReferenciado}' };
      await atualizar();
      await irParaTela2b();
    });

    afterEach(() => {
      window.fetch = fetchOriginal;
    });

    it('preenche e codifica os placeholders do contexto na URL de listagem', () => {
      expect(urls).to.deep.equal(['/m/PL/12/2026?especie=subemenda&ref=urn%3Alex%3Abr%3Acamara.deputados%3Aprojeto.lei%3Bpl%3A2026%3B12']);
    });
  });

  describe('estados da lista', () => {
    it('não cria link para endereço que não é http(s)', async () => {
      respostas.listar = () => [doc({ urlDocumento: 'javascript:alert(1)' })];
      await iniciar();
      await irParaTela2b();
      expect(linhas().length).to.equal(1);
      expect(el.querySelector('a.np-doc-link')).to.equal(null);
    });

    it('matéria sem documentos', async () => {
      respostas.listar = () => [];
      await iniciar();
      await irParaTela2b();
      expect(existe('np-docs-vazia')).to.be.true;
      expect(botaoHabilitado('np-continuar')).to.be.false;
    });

    it('matéria inexistente (callback devolve undefined)', async () => {
      respostas.listar = () => undefined;
      await iniciar();
      await irParaTela2b();
      expect(existe('np-materia-nao-encontrada')).to.be.true;
      expect(existe('np-docs-lista')).to.be.false;
    });

    it('falha na listagem informa o erro e permite tentar novamente', async () => {
      respostas.listar = () => Promise.reject(new Error('rede'));
      await iniciar();
      await irParaTela2b();
      expect(existe('np-docs-erro')).to.be.true;
      respostas.listar = () => DOCUMENTOS;
      await clicar('np-docs-tentar-novamente');
      expect(linhas().length).to.equal(3);
    });
  });

  describe('Continuar, Voltar e Cancelar', () => {
    beforeEach(async () => {
      await iniciar();
      await irParaTela2b();
    });

    it('obtém o texto por id (sem sigla, número nem ano) e conclui com texto', async () => {
      const r = concluida();
      linha('d2').click();
      await atualizar();
      await clicar('np-continuar');
      expect(chamadasDe('textoDocumento')).to.deep.equal([{ id: 'd2' }]);
      expect(chamadasDe('texto')).to.deep.equal([]);
      expect(r.detail.texto).to.equal(TEXTO);
      expect(r.detail.documentoImportado).to.equal(undefined);
      expect(r.detail.urn).to.match(/^urn:lex:br:camara\.deputados:subemenda\.substitutiva;ssp:\d{4};999999$/);
      expect(r.detail.urnDocumentoReferenciado).to.equal('urn:lex:br:camara.deputados:projeto.lei;pl:2026;12');
    });

    it('enquanto o texto não chega, Voltar e Cancelar ficam desabilitados', async () => {
      let liberar!: (v: unknown) => void;
      respostas.texto = () => new Promise(resolve => (liberar = resolve));
      linha('d2').click();
      await atualizar();
      await clicar('np-continuar');
      expect(botaoHabilitado('np-voltar') || botaoHabilitado('np-cancelar')).to.be.false;
      liberar(undefined);
      await atualizar();
      expect(botaoHabilitado('np-voltar') && botaoHabilitado('np-cancelar')).to.be.true;
    });

    it('texto indisponível: informa, permanece na Tela 2b e permite escolher outro documento', async () => {
      respostas.texto = () => undefined;
      const r = concluida();
      linha('d1').click();
      await atualizar();
      await clicar('np-continuar');
      expect(existe('np-texto-indisponivel')).to.be.true;
      expect(existe('np-tela-2b')).to.be.true;
      expect(r.detail).to.equal(undefined);
      linha('d2').click();
      await atualizar();
      expect(existe('np-texto-indisponivel')).to.be.false;
      expect(botaoHabilitado('np-continuar')).to.be.true;
    });

    it('falha ao obter o texto: informa o erro e permite tentar novamente', async () => {
      respostas.texto = () => Promise.reject(new Error('rede'));
      const r = concluida();
      linha('d1').click();
      await atualizar();
      await clicar('np-continuar');
      expect(existe('np-erro-texto')).to.be.true;
      expect(r.detail).to.equal(undefined);
      respostas.texto = () => TEXTO;
      await clicar('np-continuar');
      expect(r.detail.texto).to.equal(TEXTO);
    });

    it('Voltar leva à Tela 2 com "Texto de outra proposição" preservada; voltar à 2b mantém a seleção', async () => {
      linha('d2').click();
      await atualizar();
      await clicar('np-voltar');
      expect(existe('np-tela-2b')).to.be.false;
      expect((el.querySelector<any>('sl-radio[name="opcaoTexto"][value="outra"]') as any).checked).to.be.true;
      await clicar('np-continuar');
      expect(existe('np-fonte-selecionada')).to.be.true;
      expect(chamadasDe('listar').length).to.equal(1);
    });

    it('Cancelar emite o cancelamento', async () => {
      let cancelada = false;
      el.addEventListener('nova-proposicao-cancelada', () => (cancelada = true));
      await clicar('np-cancelar');
      expect(cancelada).to.be.true;
    });
  });
});
