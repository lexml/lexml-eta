/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { AnexosComponent, LexmlEtaConfig } from '../../../src';
import { Anexo, MimeType } from '../../../src/model/proposicao/proposicao';

const anexo = (idArquivo: string, nomeArquivo: string, extras: Partial<Anexo> = {}): Anexo => ({
  idArquivo,
  nomeArquivo,
  nomeDocumento: nomeArquivo.replace(/\.[^.]*$/, ''),
  tipo: 'nao.informado',
  mimeType: nomeArquivo.endsWith('.docx') ? MimeType.DOCX : MimeType.PDF,
  ...extras,
});

const TIPOS = [
  { codigo: 'substitutivo', nome: 'Substitutivo' },
  { codigo: 'emenda', nome: 'Emenda' },
];

const configCom = (extras: Partial<LexmlEtaConfig> = {}): LexmlEtaConfig => Object.assign(new LexmlEtaConfig(), { tiposAnexos: TIPOS }, extras);

interface Montagem {
  el: AnexosComponent;
  avisos: string[];
  eventos: string[];
}

const montar = async (anexos: Anexo[] = [], config: LexmlEtaConfig = configCom()): Promise<Montagem> => {
  const el = await fixture<AnexosComponent>(html`<lexml-eta-anexos></lexml-eta-anexos>`);
  const avisos: string[] = [];
  const eventos: string[] = [];
  (el as any).avisar = (mensagem: string): number => avisos.push(mensagem);
  el.addEventListener('onchange', (ev: Event) => eventos.push((ev as CustomEvent).detail.origemEvento));
  el.lexmlEtaConfig = config;
  el.anexos = anexos;
  await el.updateComplete;
  return { el, avisos, eventos };
};

const linhas = (el: AnexosComponent): HTMLElement[] => Array.from(el.querySelectorAll<HTMLElement>('.anexo'));
const botao = (linha: HTMLElement, classe: string): any => linha.querySelector(`.${classe}`);
// sl-button: o .click() depende do shadow DOM já renderizado, então o evento é disparado direto.
const clicar = (elemento: Element): boolean => elemento.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const arquivo = (nome: string, tamanhoBytes = 10, tipo = ''): File => new File([new Uint8Array(tamanhoBytes)], nome, { type: tipo });

const escolherArquivo = async (el: AnexosComponent, file: File): Promise<void> => {
  const campo = el.querySelector<HTMLInputElement>('#input-arquivo-anexo')!;
  const dt = new DataTransfer();
  dt.items.add(file);
  campo.files = dt.files;
  campo.dispatchEvent(new Event('change', { bubbles: true }));
  await el.updateComplete;
};

const digitarNomeNoDialogo = async (el: AnexosComponent, nome: string): Promise<void> => {
  const campo = el.querySelector<any>('#input-nome-anexo');
  campo.value = nome;
  campo.dispatchEvent(new CustomEvent('sl-input', { bubbles: true }));
  await el.updateComplete;
};

const confirmar = (el: AnexosComponent): any => el.querySelector('#btn-confirmar-importacao');

const abrirDialogo = async (el: AnexosComponent): Promise<void> => {
  clicar(el.querySelector('#btn-importar-anexo')!);
  await el.updateComplete;
};

const importar = async (el: AnexosComponent, file: File): Promise<void> => {
  await abrirDialogo(el);
  await escolherArquivo(el, file);
  clicar(confirmar(el));
};

describe('lexml-eta-anexos — renderização', () => {
  it('sem anexos mostra a indicação de lista vazia e o botão de importar', async () => {
    const { el } = await montar([]);

    expect(linhas(el)).to.have.length(0);
    expect(el.querySelector('.anexos-vazio')).to.exist;
    expect(el.querySelector('#btn-importar-anexo')).to.exist;
  });

  it('lista os anexos na ordem, com nome do arquivo, tipo, nome do documento e as cinco ações', async () => {
    const { el } = await montar([anexo('a', 'Parecer.pdf', { tipo: 'substitutivo' }), anexo('b', 'Emenda.docx')]);

    const itens = linhas(el);
    expect(itens).to.have.length(2);
    expect(itens[0].querySelector('.anexo-nome-arquivo')?.textContent).to.include('Parecer.pdf');
    expect(itens[1].querySelector('.anexo-nome-arquivo')?.textContent).to.include('Emenda.docx');
    expect(botao(itens[0], 'anexo-tipo').value).to.equal('substitutivo');
    expect(botao(itens[1], 'anexo-tipo').value).to.equal('nao.informado');
    expect(botao(itens[0], 'anexo-nome-documento').value).to.equal('Parecer');
    for (const classe of ['btn-visualizar', 'btn-baixar', 'btn-subir', 'btn-descer', 'btn-excluir']) {
      expect(botao(itens[0], classe), classe).to.exist;
    }
    expect(el.querySelector('.anexos-vazio')).to.be.null;
  });

  it('o campo de tipo fica oculto na lista e no diálogo de importação', async () => {
    const { el } = await montar([anexo('a', 'Parecer.pdf')]);

    expect(getComputedStyle(botao(linhas(el)[0], 'anexo-tipo')).display).to.equal('none');
    expect(getComputedStyle(el.querySelector('#select-tipo-anexo')!).display).to.equal('none');
    expect(getComputedStyle(botao(linhas(el)[0], 'anexo-nome-documento')).display).not.to.equal('none');
  });

  it('o select de tipo oferece os tipos do host mais "Não informado"', async () => {
    const { el } = await montar([anexo('a', 'Parecer.pdf')]);

    const opcoes = Array.from(linhas(el)[0].querySelectorAll('sl-menu-item')).map(item => [item.getAttribute('value'), item.textContent?.trim()]);
    expect(opcoes).to.deep.equal([
      ['substitutivo', 'Substitutivo'],
      ['emenda', 'Emenda'],
      ['nao.informado', 'Não informado'],
    ]);
  });

  it('sem tipos do host o select oferece somente "Não informado" e aceita o valor', async () => {
    const { el } = await montar([anexo('a', 'Parecer.pdf')], new LexmlEtaConfig());

    const item = linhas(el)[0];
    expect(Array.from(item.querySelectorAll('sl-menu-item')).map(opcao => opcao.getAttribute('value'))).to.deep.equal(['nao.informado']);
    expect(botao(item, 'anexo-tipo').value).to.equal('nao.informado');
  });

  it('tipo fora da lista do host passa a "nao.informado", e tipo conhecido é mantido', async () => {
    const { el } = await montar([anexo('a', 'A.pdf', { tipo: 'parecer' }), anexo('b', 'B.pdf', { tipo: 'emenda' })]);

    expect(el.anexos.map(a => a.tipo)).to.deep.equal(['nao.informado', 'emenda']);
    expect(botao(linhas(el)[0], 'anexo-tipo').value).to.equal('nao.informado');
  });

  it('a configuração atribuída depois da lista também normaliza o tipo', async () => {
    const { el } = await montar([anexo('a', 'A.pdf', { tipo: 'emenda' })], new LexmlEtaConfig());
    expect(el.anexos[0].tipo).to.equal('nao.informado');

    el.anexos = [anexo('a', 'A.pdf', { tipo: 'emenda' })];
    el.lexmlEtaConfig = configCom();
    await el.updateComplete;

    expect(el.anexos[0].tipo).to.equal('emenda');
  });

  it('a lista devolvida é uma cópia', async () => {
    const { el } = await montar([anexo('a', 'A.pdf')]);

    el.anexos[0].nomeDocumento = 'alterado';
    el.anexos.pop();

    expect(el.anexos).to.have.length(1);
    expect(el.anexos[0].nomeDocumento).to.equal('A');
  });

  it('definir a lista por código não emite onchange', async () => {
    const { el, eventos } = await montar([anexo('a', 'A.pdf')]);

    el.anexos = [anexo('b', 'B.pdf')];
    await el.updateComplete;

    expect(eventos).to.deep.equal([]);
  });
});

describe('lexml-eta-anexos — edição e ordem', () => {
  it('escolher outro tipo atualiza o anexo e emite onchange', async () => {
    const { el, eventos } = await montar([anexo('a', 'A.pdf')]);

    const select = botao(linhas(el)[0], 'anexo-tipo');
    select.value = 'emenda';
    select.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
    await el.updateComplete;

    expect(el.anexos[0].tipo).to.equal('emenda');
    expect(eventos).to.deep.equal(['anexo']);
  });

  it('lista reaplicada por código não é sobrescrita pelo eco do sl-change', async () => {
    const { el, eventos } = await montar([anexo('a', 'A.pdf')]);

    el.anexos = [anexo('a', 'A.pdf', { tipo: 'emenda' })];
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 300));

    expect(el.anexos[0].tipo).to.equal('emenda');
    expect(eventos).to.deep.equal([]);
  });

  it('alterar o nome do documento atualiza o anexo, sem mudar o nome do arquivo', async () => {
    const { el, eventos } = await montar([anexo('a', 'Parecer.pdf')]);

    const campo = botao(linhas(el)[0], 'anexo-nome-documento');
    campo.value = 'Parecer da CCJ';
    campo.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
    await el.updateComplete;

    expect(el.anexos[0]).to.include({ nomeDocumento: 'Parecer da CCJ', nomeArquivo: 'Parecer.pdf' });
    expect(eventos).to.deep.equal(['anexo']);
  });

  it('nome do documento vazio volta ao nome do arquivo sem extensão', async () => {
    const { el } = await montar([anexo('a', 'Parecer.pdf', { nomeDocumento: 'Outro nome' })]);

    const campo = botao(linhas(el)[0], 'anexo-nome-documento');
    campo.value = '   ';
    campo.dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
    await el.updateComplete;

    expect(el.anexos[0].nomeDocumento).to.equal('Parecer');
    expect(campo.value).to.equal('Parecer');
  });

  it('nome do documento inalterado não emite onchange', async () => {
    const { el, eventos } = await montar([anexo('a', 'Parecer.pdf')]);

    botao(linhas(el)[0], 'anexo-nome-documento').dispatchEvent(new CustomEvent('sl-change', { bubbles: true }));
    await el.updateComplete;

    expect(eventos).to.deep.equal([]);
  });

  it('mover para baixo e para cima troca as posições e emite onchange', async () => {
    const { el, eventos } = await montar([anexo('a', 'A.pdf'), anexo('b', 'B.pdf'), anexo('c', 'C.pdf')]);

    clicar(botao(linhas(el)[0], 'btn-descer'));
    await el.updateComplete;
    expect(el.anexos.map(a => a.idArquivo)).to.deep.equal(['b', 'a', 'c']);

    clicar(botao(linhas(el)[2], 'btn-subir'));
    await el.updateComplete;
    expect(el.anexos.map(a => a.idArquivo)).to.deep.equal(['b', 'c', 'a']);
    expect(eventos).to.deep.equal(['anexo', 'anexo']);
  });

  it('desabilita "para cima" no primeiro e "para baixo" no último', async () => {
    const { el } = await montar([anexo('a', 'A.pdf'), anexo('b', 'B.pdf')]);

    const itens = linhas(el);
    expect(botao(itens[0], 'btn-subir').disabled).to.be.true;
    expect(botao(itens[0], 'btn-descer').disabled).to.be.false;
    expect(botao(itens[1], 'btn-subir').disabled).to.be.false;
    expect(botao(itens[1], 'btn-descer').disabled).to.be.true;
  });

  it('mover além das pontas não altera a lista nem emite onchange', async () => {
    const { el, eventos } = await montar([anexo('a', 'A.pdf'), anexo('b', 'B.pdf')]);

    clicar(botao(linhas(el)[0], 'btn-subir'));
    clicar(botao(linhas(el)[1], 'btn-descer'));
    await el.updateComplete;

    expect(el.anexos.map(a => a.idArquivo)).to.deep.equal(['a', 'b']);
    expect(eventos).to.deep.equal([]);
  });
});

describe('lexml-eta-anexos — importação', () => {
  it('importa um PDF: o anexo entra no fim, com o idArquivo do host, nome do documento padrão e onchange', async () => {
    const recebidos: string[] = [];
    const config = configCom({
      onUploadAnexo: async (file: File) => {
        recebidos.push(file.name);
        return '  f669f339  ';
      },
    });
    const { el, eventos } = await montar([anexo('a', 'Antigo.pdf')], config);

    await importar(el, arquivo('parecer.pdf', 10, 'application/pdf'));
    await waitUntil(() => el.anexos.length === 2, 'o anexo deveria ser incluído');

    expect(recebidos).to.deep.equal(['parecer.pdf']);
    expect(el.anexos[1]).to.deep.equal({ idArquivo: 'f669f339', nomeArquivo: 'parecer.pdf', nomeDocumento: 'parecer', tipo: 'nao.informado', mimeType: MimeType.PDF });
    expect(eventos).to.deep.equal(['anexo']);
    expect((el.querySelector('#dlg-importar-anexo') as any).open).to.be.false;
  });

  it('importa um DOCX com o tipo MIME de DOCX, o nome do documento informado e o tipo fixo', async () => {
    const { el } = await montar([], configCom({ onUploadAnexo: async () => 'id-1' }));

    await abrirDialogo(el);
    await escolherArquivo(el, arquivo('emenda.docx'));
    await digitarNomeNoDialogo(el, 'Emenda da CCJ');
    clicar(confirmar(el));
    await waitUntil(() => el.anexos.length === 1);

    expect(el.anexos[0]).to.deep.equal({ idArquivo: 'id-1', nomeArquivo: 'emenda.docx', nomeDocumento: 'Emenda da CCJ', tipo: 'nao.informado', mimeType: MimeType.DOCX });
  });

  it('aceita o formato pelo tipo MIME quando a extensão não é reconhecida', async () => {
    const { el } = await montar([], configCom({ onUploadAnexo: async () => 'id-1' }));

    await importar(el, arquivo('sem-extensao', 10, 'application/pdf'));
    await waitUntil(() => el.anexos.length === 1);

    expect(el.anexos[0].mimeType).to.equal(MimeType.PDF);
  });

  it('recusa formato diferente de PDF e DOCX, com aviso, sem chamar o host nem alterar a lista', async () => {
    let chamadas = 0;
    const { el, avisos } = await montar(
      [],
      configCom({
        onUploadAnexo: async () => {
          chamadas++;
          return 'id';
        },
      })
    );

    await abrirDialogo(el);
    await escolherArquivo(el, arquivo('planilha.xlsx', 10, 'application/vnd.ms-excel'));

    expect(avisos).to.deep.equal(['Arquivo inválido. Envie apenas PDF ou DOCX.']);
    expect(confirmar(el).disabled).to.be.true;
    clicar(confirmar(el));
    expect(chamadas).to.equal(0);
    expect(el.anexos).to.have.length(0);
  });

  it('o botão de confirmar só habilita com um arquivo válido, sem exigir tipo', async () => {
    const { el } = await montar([], configCom({ onUploadAnexo: async () => 'id' }));

    await abrirDialogo(el);
    expect(confirmar(el).disabled).to.be.true;

    await escolherArquivo(el, arquivo('a.pdf'));
    expect(confirmar(el).disabled).to.be.false;
  });

  it('nome de arquivo repetido recebe o menor sufixo livre, sem diferenciar maiúsculas', async () => {
    const { el } = await montar([anexo('a', 'parecer.pdf'), anexo('b', 'Parecer (1).pdf')], configCom({ onUploadAnexo: async () => 'novo' }));

    await importar(el, arquivo('Parecer.pdf'));
    await waitUntil(() => el.anexos.length === 3);

    expect(el.anexos[2]).to.include({ nomeArquivo: 'Parecer (2).pdf', nomeDocumento: 'Parecer (2)' });
  });

  it('falha do host no upload mostra o aviso e não altera a lista', async () => {
    const { el, avisos, eventos } = await montar(
      [],
      configCom({
        onUploadAnexo: async () => {
          throw new Error('indisponível');
        },
      })
    );

    await importar(el, arquivo('a.pdf'));
    await waitUntil(() => avisos.length === 1);

    expect(avisos).to.deep.equal(['Erro ao enviar anexo. Tente novamente mais tarde.']);
    expect(el.anexos).to.have.length(0);
    expect(eventos).to.deep.equal([]);
    expect(confirmar(el).disabled).to.be.false;
  });

  it('host sem callback de upload mostra o aviso e não altera a lista', async () => {
    const { el, avisos } = await montar([], configCom());

    await importar(el, arquivo('a.pdf'));
    await waitUntil(() => avisos.length === 1);

    expect(avisos).to.deep.equal(['Erro ao enviar anexo. Tente novamente mais tarde.']);
    expect(el.anexos).to.have.length(0);
  });

  it('resposta do host sem idArquivo mostra o aviso e não inclui o anexo', async () => {
    const { el, avisos } = await montar([], configCom({ onUploadAnexo: async () => '   ' }));

    await importar(el, arquivo('a.pdf'));
    await waitUntil(() => avisos.length === 1);

    expect(el.anexos).to.have.length(0);
  });

  it('desabilita a confirmação enquanto o upload está em andamento', async () => {
    let concluir!: (id: string) => void;
    const { el } = await montar([], configCom({ onUploadAnexo: () => new Promise<string>(resolve => (concluir = resolve)) }));

    await importar(el, arquivo('a.pdf'));
    await el.updateComplete;
    expect(confirmar(el).disabled).to.be.true;

    clicar(confirmar(el));
    concluir('id-1');
    await waitUntil(() => el.anexos.length === 1);
    expect(el.anexos.map(a => a.idArquivo)).to.deep.equal(['id-1']);
  });

  describe('limite de tamanho', () => {
    it('recusa arquivo acima do limite, com aviso que informa o limite, sem chamar o host', async () => {
      let chamadas = 0;
      const { el, avisos } = await montar(
        [],
        configCom({
          tamanhoMaximoAnexo: 5120,
          onUploadAnexo: async () => {
            chamadas++;
            return 'id';
          },
        })
      );

      await abrirDialogo(el);
      await escolherArquivo(el, arquivo('grande.pdf', 6 * 1024 * 1024));

      expect(avisos).to.have.length(1);
      expect(avisos[0]).to.include('5 MB');
      expect(confirmar(el).disabled).to.be.true;
      clicar(confirmar(el));
      expect(chamadas).to.equal(0);
      expect(el.anexos).to.have.length(0);
    });

    it('aceita arquivo dentro do limite', async () => {
      const { el, avisos } = await montar([], configCom({ tamanhoMaximoAnexo: 5120, onUploadAnexo: async () => 'id' }));

      await importar(el, arquivo('pequeno.pdf', 1024 * 1024));
      await waitUntil(() => el.anexos.length === 1);

      expect(avisos).to.deep.equal([]);
    });

    it('sem limite configurado não limita o tamanho', async () => {
      const { el, avisos } = await montar([], configCom({ onUploadAnexo: async () => 'id' }));

      await importar(el, arquivo('enorme.pdf', 12 * 1024 * 1024));
      await waitUntil(() => el.anexos.length === 1);

      expect(avisos).to.deep.equal([]);
    });

    it('limite não positivo equivale a sem limite', async () => {
      const { el } = await montar([], configCom({ tamanhoMaximoAnexo: 0, onUploadAnexo: async () => 'id' }));

      await importar(el, arquivo('a.pdf', 1024 * 1024));
      await waitUntil(() => el.anexos.length === 1);
    });

    it('informa o limite em KB quando menor que 1 MB', async () => {
      const { el, avisos } = await montar([], configCom({ tamanhoMaximoAnexo: 100 }));

      await abrirDialogo(el);
      await escolherArquivo(el, arquivo('a.pdf', 200 * 1024));

      expect(avisos[0]).to.include('100 KB');
    });
  });
});

describe('lexml-eta-anexos — exclusão, visualização e download', () => {
  const blobPdf = (): Blob => new Blob(['%PDF'], { type: 'application/pdf' });

  describe('exclusão', () => {
    it('chama o host com o anexo e, concluído, remove da lista e emite onchange', async () => {
      const excluidos: Anexo[] = [];
      const { el, eventos } = await montar(
        [anexo('a', 'A.pdf'), anexo('b', 'B.pdf')],
        configCom({
          onDeleteAnexo: async a => {
            excluidos.push(a);
          },
        })
      );

      clicar(botao(linhas(el)[0], 'btn-excluir'));
      await waitUntil(() => el.anexos.length === 1);

      expect(excluidos.map(a => a.idArquivo)).to.deep.equal(['a']);
      expect(el.anexos.map(a => a.idArquivo)).to.deep.equal(['b']);
      expect(eventos).to.deep.equal(['anexo']);
    });

    it('falha do host mantém o anexo e mostra o aviso', async () => {
      const { el, avisos, eventos } = await montar(
        [anexo('a', 'A.pdf')],
        configCom({
          onDeleteAnexo: async () => {
            throw new Error('indisponível');
          },
        })
      );

      clicar(botao(linhas(el)[0], 'btn-excluir'));
      await waitUntil(() => avisos.length === 1);

      expect(avisos).to.deep.equal(['Não foi possível excluir o anexo. Tente novamente.']);
      expect(el.anexos).to.have.length(1);
      expect(eventos).to.deep.equal([]);
    });

    it('host sem callback de exclusão mantém o anexo e mostra o aviso', async () => {
      const { el, avisos } = await montar([anexo('a', 'A.pdf')], configCom());

      clicar(botao(linhas(el)[0], 'btn-excluir'));
      await waitUntil(() => avisos.length === 1);

      expect(el.anexos).to.have.length(1);
    });
  });

  describe('visualização', () => {
    let abertas: unknown[][];
    let urlsCriadas: Blob[];
    let originais: { open: typeof window.open; criar: typeof URL.createObjectURL; revogar: typeof URL.revokeObjectURL };

    beforeEach(() => {
      abertas = [];
      urlsCriadas = [];
      originais = { open: window.open, criar: URL.createObjectURL, revogar: URL.revokeObjectURL };
      window.open = ((...args: unknown[]): null => {
        abertas.push(args);
        return null;
      }) as typeof window.open;
      URL.createObjectURL = (blob: Blob | MediaSource): string => {
        urlsCriadas.push(blob as Blob);
        return 'blob:teste';
      };
      URL.revokeObjectURL = (): void => undefined;
    });

    afterEach(() => {
      window.open = originais.open;
      URL.createObjectURL = originais.criar;
      URL.revokeObjectURL = originais.revogar;
    });

    it('usa o callback de visualização do host quando existe', async () => {
      const visualizados: string[] = [];
      const { el } = await montar(
        [anexo('a', 'A.pdf')],
        configCom({
          onVisualizarAnexo: async a => {
            visualizados.push(a.idArquivo);
          },
        })
      );

      clicar(botao(linhas(el)[0], 'btn-visualizar'));
      await waitUntil(() => visualizados.length === 1);

      expect(visualizados).to.deep.equal(['a']);
      expect(abertas).to.have.length(0);
    });

    it('sem callback de visualização abre o conteúdo obtido do host em outra aba', async () => {
      const blob = blobPdf();
      const { el } = await montar([anexo('a', 'A.pdf')], configCom({ onObterAnexoBlob: async () => ({ blob, contentType: 'application/pdf' }) }));

      clicar(botao(linhas(el)[0], 'btn-visualizar'));
      await waitUntil(() => abertas.length === 1);

      expect(urlsCriadas).to.deep.equal([blob]);
      expect(abertas[0]).to.deep.equal(['blob:teste', '_blank', 'noopener']);
    });

    it('o anexo DOCX não é visualizável, mas pode ser baixado', async () => {
      const { el } = await montar([anexo('a', 'A.docx')]);

      const item = linhas(el)[0];
      expect(botao(item, 'btn-visualizar').disabled).to.be.true;
      expect(botao(item, 'btn-baixar').disabled).to.be.false;
    });

    it('a dica do botão de visualizar explica que só PDF é visualizável', async () => {
      const { el } = await montar([anexo('a', 'A.pdf'), anexo('b', 'B.docx')]);

      const [pdf, docx] = linhas(el);
      expect(botao(pdf, 'btn-visualizar').getAttribute('title')).to.equal('Visualizar');
      expect(botao(docx, 'btn-visualizar').getAttribute('title')).to.equal('Visualização disponível apenas para PDF');
    });

    it('clique na visualização de um DOCX não chama o host', async () => {
      let chamadas = 0;
      const { el } = await montar(
        [anexo('a', 'A.docx')],
        configCom({
          onVisualizarAnexo: async () => {
            chamadas++;
          },
        })
      );

      clicar(botao(linhas(el)[0], 'btn-visualizar'));
      await el.updateComplete;

      expect(chamadas).to.equal(0);
    });

    it('falha do callback de visualização mostra o aviso', async () => {
      const { el, avisos } = await montar(
        [anexo('a', 'A.pdf')],
        configCom({
          onVisualizarAnexo: async () => {
            throw new Error('indisponível');
          },
        })
      );

      clicar(botao(linhas(el)[0], 'btn-visualizar'));
      await waitUntil(() => avisos.length === 1);

      expect(avisos).to.deep.equal(['Não foi possível visualizar o anexo. Tente novamente.']);
    });

    it('host sem nenhum callback de conteúdo mostra o aviso', async () => {
      const { el, avisos } = await montar([anexo('a', 'A.pdf')], configCom());

      clicar(botao(linhas(el)[0], 'btn-visualizar'));
      await waitUntil(() => avisos.length === 1);

      expect(abertas).to.have.length(0);
    });

    it('baixa o conteúdo obtido do host com o nome do arquivo do anexo', async () => {
      const baixados: string[] = [];
      const clickOriginal = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement): void {
        baixados.push(`${this.download}|${this.href}`);
      };
      try {
        const { el } = await montar([anexo('a', 'Parecer da CCJ.pdf')], configCom({ onObterAnexoBlob: async () => ({ blob: blobPdf(), contentType: null }) }));

        clicar(botao(linhas(el)[0], 'btn-baixar'));
        await waitUntil(() => baixados.length === 1);

        expect(baixados[0]).to.equal('Parecer da CCJ.pdf|blob:teste');
      } finally {
        HTMLAnchorElement.prototype.click = clickOriginal;
      }
    });

    it('falha ao obter o conteúdo no download mostra o aviso', async () => {
      const { el, avisos } = await montar(
        [anexo('a', 'A.pdf')],
        configCom({
          onObterAnexoBlob: async () => {
            throw new Error('indisponível');
          },
        })
      );

      clicar(botao(linhas(el)[0], 'btn-baixar'));
      await waitUntil(() => avisos.length === 1);

      expect(avisos).to.deep.equal(['Não foi possível baixar o anexo. Tente novamente.']);
    });
  });
});
