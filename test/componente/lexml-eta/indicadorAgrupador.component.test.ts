import { expect, fixture, waitUntil } from '@open-wc/testing';
import '../../../src';
import type { LexmlEtaComponent } from '../../../src';
import { TEMPO_INDICADOR_AGRUPADOR_MS } from '../../../src/components/editor/editor.component';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { adicionarAgrupadorArtigoAction } from '../../../src/model/lexml/acao/adicionarAgrupadorArtigoAction';
import { buscaDispositivoById } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';
import { rootStore } from '../../../src/redux/store';
import { novoDocumentoArticulado } from '../../doc/documentoArticulado';

const LEXML = 'http://www.lexml.gov.br/1.0';
const p = (texto: string): any => ({ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] });

const artigo = (n: number): any => ({
  name: { namespaceURI: LEXML, localPart: 'Artigo' },
  value: {
    TYPE_NAME: 'br_gov_lexml__1.DispositivoType',
    id: `art${n}`,
    rotulo: `Art. ${n}${n < 10 ? 'º' : '.'}`,
    lXcontainersOmissis: [
      {
        name: { namespaceURI: LEXML, localPart: 'Caput' },
        value: { TYPE_NAME: 'br_gov_lexml__1.DispositivoType', id: `art${n}_cpt`, p: [p(`Texto do artigo ${n} da proposição de teste.`)] },
      },
    ],
  },
});

const agrupador = (tipo: string, id: string, rotulo: string, nome: string, filhos: any[]): any => ({
  name: { namespaceURI: LEXML, localPart: tipo },
  value: { TYPE_NAME: 'br_gov_lexml__1.Hierarchy', id, rotulo, nomeAgrupador: p(nome), lXhier: filhos },
});

const intervalo = (de: number, ate: number): any[] => Array.from({ length: ate - de + 1 }, (_, i) => artigo(de + i));

// art1 fora de agrupador; Título I (Cap. I: arts. 2-3; Cap. II › Seção I: arts. 4-9); Título II › Cap. I: arts. 10-22.
const documentoComAgrupadores = (): any => {
  const documento = novoDocumentoArticulado();
  documento.value.projetoNorma.norma.articulacao.lXhier = [
    artigo(1),
    agrupador('Titulo', 'tit1', 'TÍTULO I', 'Das Disposições Preliminares', [
      agrupador('Capitulo', 'tit1_cap1', 'CAPÍTULO I', 'Do Objeto', intervalo(2, 3)),
      agrupador('Capitulo', 'tit1_cap2', 'CAPÍTULO II', 'Das Definições', [agrupador('Secao', 'tit1_cap2_sec1', 'Seção I', 'Dos Documentos', intervalo(4, 9))]),
    ]),
    agrupador('Titulo', 'tit2', 'TÍTULO II', 'Da Gestão', [agrupador('Capitulo', 'tit2_cap1', 'CAPÍTULO I', 'Da Classificação', intervalo(10, 22))]),
  ];
  return documento;
};

const aguardaQuadros = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
const espera = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

describe('ETA — indicador do agrupador atual (#1080)', () => {
  let component: LexmlEtaComponent;
  let editor: any;

  const indicador = (): HTMLElement => editor.querySelector('.lx-eta-area-texto > .indicador-agrupador');
  const niveis = (): string[] => Array.from(indicador().querySelectorAll('.indicador-agrupador__nivel')).map(n => n.textContent!.trim());
  const visivel = (): boolean => indicador().classList.contains('indicador-agrupador--visivel') && indicador().getAttribute('aria-hidden') === 'false';
  const dispositivo = (id: string): any => buscaDispositivoById(rootStore.getState().elementoReducer.articulacao!, id);
  const linha = (id: string): any => editor.quill.getLinhaByUuid2(dispositivo(id).uuid2);
  const atualizado = async (): Promise<void> => {
    await aguardaQuadros();
    await editor.updateComplete;
  };
  // A roda do mouse antes da rolagem a identifica como do usuário.
  const rolarParaOTopo = async (id: string, peloUsuario = true): Promise<void> => {
    peloUsuario && editor.quill.root.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
    linha(id).domNode.scrollIntoView({ block: 'start' });
    await atualizado();
  };

  const abrir = async (documento: any, configuracaoPaginacao?: any): Promise<void> => {
    component = await fixture<LexmlEtaComponent>('<lexml-eta></lexml-eta>');
    (component as any).getParlamentares = async (): Promise<[]> => [];
    if (configuracaoPaginacao) {
      component.lexmlEtaConfig = { ...component.lexmlEtaConfig, configuracaoPaginacao };
    }
    await component.abrirDocumentoArticulado(documento);
    editor = component.querySelector('lexml-eta-proposicao-editor');
    await editor.aguardarCarregamentoDasLinhas();
    // Altura fixa para a área de texto rolar com poucos artigos.
    editor.querySelector('#lx-eta-editor').style.height = '220px';
    // O foco inicial na ementa (setTimeout da carga) rolaria de volta depois da rolagem do teste.
    await waitUntil(() => !!editor.quill.linhaAtual, 'cursor inicial posicionado');
    await espera(100);
    editor.quill.root.scrollTop = 0;
    await atualizado();
  };

  afterEach(() => {
    editor?.cancelarTimerOnChangePendente?.();
    document.querySelectorAll('proposicao-dividida-modal sl-dialog').forEach((d: any) => d.hide?.());
  });

  describe('documento sem agrupadores', () => {
    beforeEach(() => abrir(novoDocumentoArticulado()));

    it('o indicador não aparece ao rolar', async () => {
      editor.quill.root.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      editor.quill.root.scrollTop = editor.quill.root.scrollHeight;
      await atualizado();
      expect(visivel()).to.equal(false);
      expect(niveis()).to.deep.equal([]);
    });
  });

  describe('documento com agrupadores', () => {
    beforeEach(() => abrir(documentoComAgrupadores()));

    it('fica fora do container do Quill e não captura o mouse', async () => {
      await rolarParaOTopo('art5');
      expect(visivel()).to.equal(true);
      expect(editor.querySelector('#lx-eta-editor').contains(indicador())).to.equal(false);
      expect(getComputedStyle(indicador()).pointerEvents).to.equal('none');
    });

    it('não aparece ao abrir o documento', () => {
      expect(visivel()).to.equal(false);
    });

    it('fica oculto com a ementa no topo', async () => {
      await rolarParaOTopo('art5');
      editor.quill.root.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
      editor.quill.root.scrollTop = 0;
      await atualizado();
      expect(visivel()).to.equal(false);
    });

    it('fica oculto com o artigo anterior ao primeiro agrupador no topo', async () => {
      await rolarParaOTopo('art1');
      expect(visivel()).to.equal(false);
    });

    it('artigo de seção no topo mostra a cadeia do mais externo ao mais interno', async () => {
      await rolarParaOTopo('art5');
      expect(visivel()).to.equal(true);
      expect(niveis()).to.deep.equal(['TÍTULO I', 'CAPÍTULO II', 'Seção I']);
    });

    it('agrupador no topo termina a cadeia nele', async () => {
      await rolarParaOTopo('tit1_cap2');
      expect(niveis()).to.deep.equal(['TÍTULO I', 'CAPÍTULO II']);
    });

    it('acompanha a rolagem até outro título', async () => {
      await rolarParaOTopo('art3');
      expect(niveis()).to.deep.equal(['TÍTULO I', 'CAPÍTULO I']);
      await rolarParaOTopo('art12');
      expect(niveis()).to.deep.equal(['TÍTULO II', 'CAPÍTULO I']);
    });

    it('a rolagem feita por código atualiza a cadeia, mas não exibe o indicador', async () => {
      await rolarParaOTopo('art5', false);
      expect(niveis()).to.deep.equal(['TÍTULO I', 'CAPÍTULO II', 'Seção I']);
      expect(visivel()).to.equal(false);
    });

    // A seção, única no capítulo, também é renumerada para "Seção Única".
    it('reflete a renumeração do capítulo', async () => {
      await rolarParaOTopo('art5');
      const capituloI = dispositivo('tit1_cap1');
      rootStore.dispatch(adicionarAgrupadorArtigoAction.execute(createElemento(capituloI), 'Capitulo', undefined, 'antes', false));
      // O ElementoMarcado leva o cursor ao capítulo novo num setTimeout, depois da rolagem.
      await espera(100);
      await rolarParaOTopo('art5');
      expect(niveis()).to.deep.equal(['TÍTULO I', 'CAPÍTULO III', 'Seção Única']);
    });

    it('some 3 s depois da última rolagem, e a rolagem contínua adia o sumiço', async function () {
      this.timeout(15000);
      await rolarParaOTopo('art3');
      await espera(TEMPO_INDICADOR_AGRUPADOR_MS - 1000);
      await rolarParaOTopo('art5');
      await espera(TEMPO_INDICADOR_AGRUPADOR_MS - 1000);
      expect(visivel()).to.equal(true);
      await espera(1300);
      await atualizado();
      expect(visivel()).to.equal(false);
      // Depois da transição, fica fora da árvore de acessibilidade e invisível.
      await espera(500);
      expect(getComputedStyle(indicador()).visibility).to.equal('hidden');
    });

    it('em tela estreita mostra todos os níveis, quebrando a linha se preciso', async () => {
      (editor.querySelector('.lx-eta-area-texto') as HTMLElement).style.width = '200px';
      await rolarParaOTopo('art5');
      const nos = Array.from(indicador().querySelectorAll('.indicador-agrupador__nivel')) as HTMLElement[];
      expect(nos.map(n => getComputedStyle(n).display !== 'none')).to.deep.equal([true, true, true]);
      expect(indicador().getBoundingClientRect().width).to.be.at.most(200);
    });
  });

  describe('documento paginado', () => {
    beforeEach(() =>
      abrir(documentoComAgrupadores(), {
        rangeArtigos: [
          { numInicial: 1, numFinal: 8 },
          { numInicial: 9, numFinal: 22 },
        ],
      })
    );

    it('carregar outra página oculta o indicador até a próxima rolagem', async () => {
      await rolarParaOTopo('art5');
      expect(visivel()).to.equal(true);

      (editor.querySelector('#selectPaginaArticulacao') as HTMLSelectElement).value = '2';
      editor.querySelector('#selectPaginaArticulacao').dispatchEvent(new Event('change'));
      await waitUntil(() => !!linha('art9') && !linha('art2'), 'página 2 carregada');
      await espera(100);
      await atualizado();
      expect(visivel()).to.equal(false);

      // A página 2 começa no meio da Seção I.
      await rolarParaOTopo('art9');
      expect(visivel()).to.equal(true);
      expect(niveis()).to.deep.equal(['TÍTULO I', 'CAPÍTULO II', 'Seção I']);
    });
  });
});
