import { expect } from '@open-wc/testing';
import { buildProjetoNormaFromJsonix } from '../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix';
import { inicializaRemissoesExternasAoAbrir } from '../../../src/redux/elemento/reducer/inicializaRemissoesExternasAoAbrir';
import { MPV_885_2019 } from '../../assets/mpv_885_2019';
import { getDispositivoAndFilhosAsLista } from '../../../src/model/lexml/hierarquia/hierarquiaUtil';

// A MPV 885/2019 possui 3 links urn:lex no texto da ementa (Lei 7560, Lei 11343, Lei 8745)

// ---------------------------------------------------------------------------
// Fluxo de abertura de documentos com links legados (span href="urn:lex:...")
//
// Verifica que o caminho completo de deserialização produz dispositivos com
// data-urn e data-ref-id — condição necessária para o blot Quill ativar.
// ---------------------------------------------------------------------------

describe('Fluxo de abertura — links legados urn:lex', () => {
  let projetoNorma: any;
  let dispositivosComTexto: any[];
  let dispositivo1: any;

  beforeEach(() => {
    projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    dispositivosComTexto = getDispositivoAndFilhosAsLista(projetoNorma.articulacao).filter((d: any) => d.texto && d.texto.includes('urn:lex:'));
    // Artigo 1 tem span com href="urn:lex:br:federal:lei:1986-12-19;7560"
    dispositivo1 = dispositivosComTexto[0];
  });

  // ── Etapa 1: buildProjetoNormaFromJsonix ────────────────────────────────

  describe('Etapa 1 — buildProjetoNormaFromJsonix (montaTag)', () => {
    it('deve existir ao menos um dispositivo no corpo com texto contendo URN', () => {
      expect(dispositivosComTexto.length).to.be.greaterThan(0);
    });

    it('span href="urn:lex:" deve ser convertido para <a data-urn=...> (não href direto)', () => {
      expect(dispositivo1.texto).to.include('data-urn="');
    });

    it('link gerado deve ter class lexml-remissao-externa', () => {
      expect(dispositivo1.texto).to.include('class="lexml-remissao-externa"');
    });

    it('link gerado deve ter href="#" em vez do URN direto', () => {
      expect(dispositivo1.texto).to.include('href="#"');
      expect(dispositivo1.texto).not.to.match(/href="urn:lex:/);
    });

    it('link gerado ainda NÃO deve ter data-ref-id (é adicionado na próxima etapa)', () => {
      expect(dispositivo1.texto).not.to.include('data-ref-id="');
    });
  });

  // ── Etapa 2: inicializaRemissoesExternasAoAbrir ─────────────────────────

  describe('Etapa 2 — inicializaRemissoesExternasAoAbrir', () => {
    let remissoesExternas: Record<string, any>;

    beforeEach(() => {
      remissoesExternas = inicializaRemissoesExternasAoAbrir(projetoNorma.articulacao);
    });

    it('deve retornar entradas no registry para cada link data-urn encontrado', () => {
      expect(Object.keys(remissoesExternas).length).to.be.greaterThan(0);
    });

    it('deve adicionar data-ref-id ao texto do dispositivo com link legado', () => {
      expect(dispositivo1.texto).to.include('data-ref-id="');
    });

    it('data-urn deve ser preservado após a adição do data-ref-id', () => {
      expect(dispositivo1.texto).to.include('data-urn="');
    });

    it('class lexml-remissao-externa deve ser preservada', () => {
      expect(dispositivo1.texto).to.include('class="lexml-remissao-externa"');
    });

    it('a entrada do registry deve ter o URN correto', () => {
      const entrada = Object.values(remissoesExternas)[0];
      expect(entrada.targetUrn).to.match(/^urn:lex:/);
    });

    it('a entrada do registry deve ter refId igual ao data-ref-id no texto', () => {
      const entrada = Object.values(remissoesExternas)[0];
      const refId = entrada.refId;
      expect(dispositivo1.texto).to.include(`data-ref-id="${refId}"`);
    });

    it('a entrada do registry deve ter sourceUuid igual ao uuid do dispositivo', () => {
      const entrada = Object.values(remissoesExternas)[0];
      expect(entrada.sourceUuid).to.equal(dispositivo1.uuid);
    });

    it('texto final deve satisfazer os requisitos do RemissaoExternaBlot (data-urn + data-ref-id + class)', () => {
      // O blot verifica data-ref-id E data-urn para ativar.
      // O texto do dispositivo deve conter ambos após a inicialização.
      const temDataUrn = dispositivo1.texto.includes('data-urn="');
      const temDataRefId = dispositivo1.texto.includes('data-ref-id="');
      const temClasse = dispositivo1.texto.includes('lexml-remissao-externa');
      expect(temDataUrn && temDataRefId && temClasse).to.be.true;
    });
  });
});

// ---------------------------------------------------------------------------
// Remissões na ementa — Fix 7
//
// Verifica que inicializaRemissoesExternasAoAbrir também processa a ementa,
// adicionando data-ref-id e populando o registry com entradas cujo
// sourceUuid corresponde ao uuid da ementa.
// ---------------------------------------------------------------------------

describe('Fluxo de abertura — remissões na ementa', () => {
  let projetoNorma: any;
  let ementa: any;
  let remissoesExternas: Record<string, any>;

  beforeEach(() => {
    projetoNorma = buildProjetoNormaFromJsonix(MPV_885_2019);
    ementa = projetoNorma.articulacao.projetoNorma?.ementa;
    remissoesExternas = inicializaRemissoesExternasAoAbrir(projetoNorma.articulacao);
  });

  it('a ementa deve existir no projetoNorma', () => {
    expect(ementa).to.exist;
  });

  it('buildProjetoNormaFromJsonix deve converter os spans da ementa para <a data-urn>', () => {
    expect(ementa.texto).to.include('data-urn="');
  });

  it('buildProjetoNormaFromJsonix ainda NÃO deve ter data-ref-id na ementa antes da inicialização', () => {
    const pnFresco: any = buildProjetoNormaFromJsonix(MPV_885_2019);
    const ementaFresca = pnFresco.articulacao.projetoNorma?.ementa;
    expect(ementaFresca?.texto).not.to.include('data-ref-id="');
  });

  it('inicializaRemissoesExternasAoAbrir deve adicionar data-ref-id ao texto da ementa', () => {
    expect(ementa.texto).to.include('data-ref-id="');
  });

  it('deve criar 3 entradas no registry (uma por link da ementa)', () => {
    const entradasEmenta = Object.values(remissoesExternas).filter((v: any) => v.sourceUuid === ementa.uuid);
    expect(entradasEmenta.length).to.equal(3);
  });

  it('todas as entradas da ementa devem ter targetUrn começando com urn:lex:', () => {
    const entradasEmenta = Object.values(remissoesExternas).filter((v: any) => v.sourceUuid === ementa.uuid);
    entradasEmenta.forEach((entrada: any) => {
      expect(entrada.targetUrn).to.match(/^urn:lex:/);
    });
  });

  it('os URNs da ementa devem corresponder às leis referenciadas no asset', () => {
    const urns = Object.values(remissoesExternas)
      .filter((v: any) => v.sourceUuid === ementa.uuid)
      .map((v: any) => v.targetUrn)
      .sort();
    expect(urns).to.deep.equal(['urn:lex:br:federal:lei:1986-12-19;7560', 'urn:lex:br:federal:lei:1993-12-09;8745', 'urn:lex:br:federal:lei:2006-08-23;11343']);
  });

  it('o data-ref-id no texto deve corresponder ao refId no registry para cada entrada da ementa', () => {
    const entradasEmenta = Object.values(remissoesExternas).filter((v: any) => v.sourceUuid === ementa.uuid);
    entradasEmenta.forEach((entrada: any) => {
      expect(ementa.texto).to.include(`data-ref-id="${entrada.refId}"`);
    });
  });

  it('texto final da ementa deve satisfazer os requisitos do RemissaoExternaBlot (data-urn + data-ref-id + class)', () => {
    const temDataUrn = ementa.texto.includes('data-urn="');
    const temDataRefId = ementa.texto.includes('data-ref-id="');
    const temClasse = ementa.texto.includes('lexml-remissao-externa');
    expect(temDataUrn && temDataRefId && temClasse).to.be.true;
  });
});
