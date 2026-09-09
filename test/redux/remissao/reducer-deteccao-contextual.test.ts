import { expect } from '@open-wc/testing';
import { State } from '../../../src/redux/state';
import { criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createElemento } from '../../../src/model/elemento/elementoUtil';
import { adicionaRemissaoInterna } from '../../../src/redux/elemento/reducer/adicionaRemissaoInterna';
import { criaStateComNArtigos, detectaRemissoes, marcaAdicionado } from '../../helpers/dispositivo-helper';

describe('Detecção de Remissões Contextuais (Etapas 1.2 + 1.3)', () => {
  describe('1.2 — Parágrafo contextual: "§ N deste artigo"', () => {
    let state: State;
    let art1: any;
    let par2: any;
    let inc1EmPar1: any;

    beforeEach(() => {
      ({
        state,
        artigos: [art1],
      } = criaStateComNArtigos(1));

      const par1 = criaDispositivo(art1, 'Paragrafo');
      par2 = criaDispositivo(art1, 'Paragrafo');
      par1.texto = 'Par 1.';
      par2.texto = 'Par 2.';

      inc1EmPar1 = criaDispositivo(par1, 'Inciso');
      inc1EmPar1.texto = 'Inciso I.';

      [par1, par2, inc1EmPar1].forEach(marcaAdicionado);
      art1.renumeraFilhos();
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-X1] "§ 2º deste artigo" → 1 remissão para art1_par2', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 2º deste artigo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art1_par2');
    });

    it('[CT-X2] "§ 2º deste artigo" → exatamente 1 remissão (sem double-match)', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 2º deste artigo.');
      expect(remissoes).to.have.length(1, 'deve gerar 1 remissão, não 2');
    });

    it('[CT-X3] "§ 2º do presente artigo" (forma alternativa) → 1 remissão para art1_par2', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 2º do presente artigo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art1_par2');
    });

    it('[CT-X4] "parágrafo único deste artigo" → não cria remissão quando artigo não tem parágrafo', () => {
      const { state: state2, artigos: artigos2 } = criaStateComNArtigos(2);
      const art2 = artigos2[1]; // art2 has no paragraphs
      const remissoes = detectaRemissoes(state2, art2, 'Conforme o parágrafo único deste artigo.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-X5] textoRef preserva o texto original digitado', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 2º deste artigo.');
      expect(remissoes[0].textoRef).to.equal('§ 2º deste artigo');
    });
  });

  describe('1.2 — Inciso contextual de artigo: "inciso I deste artigo"', () => {
    let state: State;
    let art1: any;
    let inc1NoCaput: any;
    let par1: any;
    let inc1EmPar1: any;

    beforeEach(() => {
      ({
        state,
        artigos: [art1],
      } = criaStateComNArtigos(1));

      inc1NoCaput = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
      inc1NoCaput.texto = 'Inciso do caput.';

      par1 = criaDispositivo(art1, 'Paragrafo');
      par1.texto = 'Par 1.';

      inc1EmPar1 = criaDispositivo(par1, 'Inciso');
      inc1EmPar1.texto = 'Inciso do par.';

      [inc1NoCaput, par1, inc1EmPar1].forEach(marcaAdicionado);
      (art1 as Artigo).caput!.renumeraFilhos();
      art1.renumeraFilhos();
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-X6] "inciso I deste artigo" (editando § 1) → 1 remissão para inciso I do caput', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o inciso I deste artigo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.match(/^art1_cpt_inc/);
    });

    it('[CT-X7] "inciso I deste artigo" → não confunde inciso do caput com inciso do §', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o inciso I deste artigo.');
      expect(remissoes[0].targetLexmlId).to.include('_cpt_');
    });
  });

  describe('1.2 — Inciso contextual de parágrafo: "inciso I deste parágrafo"', () => {
    let state: State;
    let art1: any;
    let inc1EmPar1: any;
    let ali1: any;

    beforeEach(() => {
      ({
        state,
        artigos: [art1],
      } = criaStateComNArtigos(1));

      const par1 = criaDispositivo(art1, 'Paragrafo');
      par1.texto = 'Par 1.';

      inc1EmPar1 = criaDispositivo(par1, 'Inciso');
      inc1EmPar1.texto = 'Inciso I.';

      ali1 = criaDispositivo(inc1EmPar1, 'Alinea');
      ali1.texto = 'Alínea a.';

      [par1, inc1EmPar1, ali1].forEach(marcaAdicionado);
      art1.renumeraFilhos();
      par1.renumeraFilhos();
      inc1EmPar1.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-X8] "inciso I deste parágrafo" (editando alínea) → 1 remissão para art1_par1_inc1', () => {
      const remissoes = detectaRemissoes(state, ali1, 'Conforme o inciso I deste parágrafo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal(inc1EmPar1.id);
      expect(remissoes[0].targetLexmlId).to.match(/^art1_par1_inc/);
    });

    it('[CT-X9] "inciso I deste parágrafo" → exatamente 1 remissão', () => {
      const remissoes = detectaRemissoes(state, ali1, 'Conforme o inciso I deste parágrafo.');
      expect(remissoes).to.have.length(1);
    });

    it('[CT-X10] Inciso inexistente no parágrafo → 0 remissões', () => {
      const remissoes = detectaRemissoes(state, ali1, 'Conforme o inciso X deste parágrafo.');
      expect(remissoes).to.have.length(0);
    });
  });

  describe('1.2 — Multi-nível contextual: "inciso I do § 2º deste artigo"', () => {
    let state: State;
    let art1: any;
    let ali1EmPar1Inc1: any;
    let inc1EmPar2: any;

    beforeEach(() => {
      ({
        state,
        artigos: [art1],
      } = criaStateComNArtigos(1));

      const par1 = criaDispositivo(art1, 'Paragrafo');
      const par2 = criaDispositivo(art1, 'Paragrafo');
      par1.texto = 'Par 1.';
      par2.texto = 'Par 2.';

      const inc1EmPar1 = criaDispositivo(par1, 'Inciso');
      inc1EmPar1.texto = 'Inc I de par1.';

      ali1EmPar1Inc1 = criaDispositivo(inc1EmPar1, 'Alinea');
      ali1EmPar1Inc1.texto = 'Alínea a.';

      inc1EmPar2 = criaDispositivo(par2, 'Inciso');
      inc1EmPar2.texto = 'Inc I de par2.';

      [par1, par2, inc1EmPar1, ali1EmPar1Inc1, inc1EmPar2].forEach(marcaAdicionado);
      art1.renumeraFilhos();
      par1.renumeraFilhos();
      inc1EmPar1.renumeraFilhos();
      par2.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-X11] "inciso I do § 2º deste artigo" → 1 remissão para art1_par2_inc1', () => {
      const remissoes = detectaRemissoes(state, ali1EmPar1Inc1, 'Conforme o inciso I do § 2º deste artigo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal(inc1EmPar2.id);
      expect(remissoes[0].targetLexmlId).to.match(/^art1_par2_inc/);
    });

    it('[CT-X12] "inciso I do § 2º deste artigo" → exatamente 1 remissão (sem double-match)', () => {
      const remissoes = detectaRemissoes(state, ali1EmPar1Inc1, 'Conforme o inciso I do § 2º deste artigo.');
      expect(remissoes).to.have.length(1, 'deve criar 1 remissão, não 3');
    });

    it('[CT-X13] "alínea a do inciso I deste parágrafo" (multi-nível, ancestor=§1) → 1 remissão', () => {
      const remissoes = detectaRemissoes(state, ali1EmPar1Inc1, 'Conforme a alínea a do inciso I deste parágrafo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal(ali1EmPar1Inc1.id);
    });
  });

  describe('1.3 — Caput como destino: "caput deste artigo"', () => {
    let state: State;
    let art1: any;
    let inc1NoCaput: any;

    beforeEach(() => {
      ({
        state,
        artigos: [art1],
      } = criaStateComNArtigos(1));

      inc1NoCaput = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
      inc1NoCaput.texto = 'Inciso do caput.';

      marcaAdicionado(inc1NoCaput);
      (art1 as Artigo).caput!.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-X14] "caput deste artigo" (editando inciso do caput) → 1 remissão para o caput', () => {
      const remissoes = detectaRemissoes(state, inc1NoCaput, 'Para os fins do caput deste artigo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art1_cpt');
    });

    it('[CT-X15] "caput deste artigo" → targetUuid aponta para o caput (não para o artigo)', () => {
      const remissoes = detectaRemissoes(state, inc1NoCaput, 'Para os fins do caput deste artigo.');
      expect(remissoes[0].targetUuid).to.equal((art1 as Artigo).caput!.uuid);
    });

    it('[CT-X16] "caput deste artigo" → exatamente 1 remissão', () => {
      const remissoes = detectaRemissoes(state, inc1NoCaput, 'Para os fins do caput deste artigo.');
      expect(remissoes).to.have.length(1);
    });
  });

  describe('1.3 — Inciso do caput como destino: "inciso N do caput deste artigo"', () => {
    let state: State;
    let art1: any;
    let par1: any;
    let inc1EmPar1: any;
    let inc1NoCaput: any;

    beforeEach(() => {
      ({
        state,
        artigos: [art1],
      } = criaStateComNArtigos(1));

      inc1NoCaput = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
      inc1NoCaput.texto = 'Inciso do caput.';

      par1 = criaDispositivo(art1, 'Paragrafo');
      par1.texto = 'Par 1.';

      inc1EmPar1 = criaDispositivo(par1, 'Inciso');
      inc1EmPar1.texto = 'Inciso do par.';

      [inc1NoCaput, par1, inc1EmPar1].forEach(marcaAdicionado);
      (art1 as Artigo).caput!.renumeraFilhos();
      art1.renumeraFilhos();
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-X17] "inciso I do caput deste artigo" → 1 remissão para o inciso I do caput', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o inciso I do caput deste artigo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal(inc1NoCaput.id);
      expect(remissoes[0].targetLexmlId).to.match(/^art1_cpt_inc/);
    });

    it('[CT-X18] "inciso I do caput deste artigo" → exatamente 1 remissão (sem double-match)', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o inciso I do caput deste artigo.');
      expect(remissoes).to.have.length(1, 'deve criar 1 remissão, não 2 ou 3');
    });
  });

  describe('Casos que NÃO devem criar remissão contextual', () => {
    it('[CT-X19] "§ 2º" bare — source é o próprio artigo (sem ancestral artigo) → 0 remissões', () => {
      // Source = artigos[0] (o artigo em si, não um filho). buscarAncestralPorTipo parte do pai
      // do artigo, que é a articulação — sem artigo ancestral → resolução falha → 0 remissões.
      // Nota: 0 remissões ocorre pela ausência de ancestral artigo, não por falta de qualificador.
      const { state, artigos } = criaStateComNArtigos(2);
      const art2 = artigos[1];
      const par = criaDispositivo(art2, 'Paragrafo');
      par.texto = 'Par.';
      art2.renumeraFilhos();
      par.createRotulo(par);
      updateIdDispositivoAndFilhos(state.articulacao!);
      marcaAdicionado(par);

      const remissoes = detectaRemissoes(state, artigos[0], 'Conforme o § 2º.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-X20] "inciso I" bare — source é o próprio artigo (sem ancestral artigo) → 0 remissões', () => {
      // Mesma razão que CT-X19: source é o artigo, não tem artigo ancestral.
      const { state, artigos } = criaStateComNArtigos(2);
      const remissoes = detectaRemissoes(state, artigos[0], 'Conforme o inciso I.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-X21] "§ 2º desta Lei" → 0 remissões (qualificador ignorado)', () => {
      const { state, artigos } = criaStateComNArtigos(1);
      const remissoes = detectaRemissoes(state, artigos[0], 'Conforme o § 2º desta Lei.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-X22] Ancestor não existe (source não está dentro de artigo) → graceful null', () => {
      const { state, artigos } = criaStateComNArtigos(2);
      const art1 = artigos[0];
      const remissoes = detectaRemissoes(state, art1, 'Conforme o § 2º deste parágrafo.');
      expect(remissoes).to.have.length(0);
    });

    it('[CT-X23] Parágrafo único + qualifier: remissão criada quando existe', () => {
      const { state, artigos } = criaStateComNArtigos(1);
      const art1 = artigos[0];

      const parUnico = criaDispositivo(art1, 'Paragrafo');
      parUnico.texto = 'Parágrafo único.';
      (parUnico as any).informouParagrafoUnico = true;

      const incUnico = criaDispositivo(parUnico, 'Inciso');
      incUnico.texto = 'Inciso.';

      [parUnico, incUnico].forEach(marcaAdicionado);
      art1.renumeraFilhos();
      parUnico.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);

      const remissoes = detectaRemissoes(state, incUnico, 'Conforme o parágrafo único deste artigo.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.match(/^art1_par/);
    });
  });

  describe('Coexistência: referências absolutas e contextuais no mesmo texto', () => {
    let state: State;
    let artigos: any[];
    let par2: any;
    let inc1EmPar1: any;

    beforeEach(() => {
      ({ state, artigos } = criaStateComNArtigos(3));
      const art1 = artigos[0];
      const art3 = artigos[2];

      const par1 = criaDispositivo(art1, 'Paragrafo');
      par2 = criaDispositivo(art1, 'Paragrafo');
      par1.texto = 'Par 1.';
      par2.texto = 'Par 2.';

      inc1EmPar1 = criaDispositivo(par1, 'Inciso');
      inc1EmPar1.texto = 'Inc.';

      const par1Art3 = criaDispositivo(art3, 'Paragrafo');
      par1Art3.texto = 'Par art3.';

      [par1, par2, inc1EmPar1, par1Art3].forEach(marcaAdicionado);
      art1.renumeraFilhos();
      par1.renumeraFilhos();
      art3.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);
    });

    it('[CT-X24] Texto com absoluta + contextual → 2 remissões corretas', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 1º do art. 3º e o § 2º deste artigo.');

      expect(remissoes).to.have.length(2);
      const ids = remissoes.map((r: any) => r.targetLexmlId);
      expect(ids).to.include('art3_par1');
      expect(ids).to.include('art1_par2');
    });

    it('[CT-X25] Duas contextuais no mesmo texto → 2 remissões corretas', () => {
      const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 1º deste artigo e o § 2º deste artigo.');

      expect(remissoes).to.have.length(2);
      const ids = remissoes.map((r: any) => r.targetLexmlId);
      expect(ids).to.include('art1_par1');
      expect(ids).to.include('art1_par2');
    });
  });

  describe('Detecção implícita sem qualificador (Etapa 1.5)', () => {
    describe('1.5a — Parágrafo bare (§ N)', () => {
      let state: State;
      let art1: any;
      let par1: any;
      let par2: any;
      let inc1EmPar1: any;

      beforeEach(() => {
        ({
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1));

        par1 = criaDispositivo(art1, 'Paragrafo');
        par2 = criaDispositivo(art1, 'Paragrafo');
        par1.texto = 'Par 1.';
        par2.texto = 'Par 2.';

        inc1EmPar1 = criaDispositivo(par1, 'Inciso');
        inc1EmPar1.texto = 'Inc.';

        [par1, par2, inc1EmPar1].forEach(marcaAdicionado);
        art1.renumeraFilhos();
        par1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);
      });

      it('[CT-X28] "§ 1º." bare → 1 remissão para par1 do artigo atual', () => {
        const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 1º.');
        expect(remissoes).to.have.length(1);
        expect(remissoes[0].targetLexmlId).to.equal(par1.id);
        expect(remissoes[0].targetLexmlId).to.equal('art1_par1');
      });

      it('[CT-X28b] "§ 2º." bare → 1 remissão para par2 do artigo atual', () => {
        const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 2º.');
        expect(remissoes).to.have.length(1);
        expect(remissoes[0].targetLexmlId).to.equal(par2.id);
        expect(remissoes[0].targetLexmlId).to.equal('art1_par2');
      });

      it('[CT-X29] "parágrafo único." bare → 1 remissão para parágrafo único', () => {
        const {
          state: s2,
          artigos: [art],
        } = criaStateComNArtigos(1);
        const incCaput = criaDispositivo((art as Artigo).caput!, 'Inciso');
        incCaput.texto = 'Inc.';
        const parUnico = criaDispositivo(art, 'Paragrafo');
        parUnico.texto = 'Parágrafo único.';
        (parUnico as any).informouParagrafoUnico = true;
        [incCaput, parUnico].forEach(marcaAdicionado);
        (art as Artigo).caput!.renumeraFilhos();
        art.renumeraFilhos();
        updateIdDispositivoAndFilhos(s2.articulacao!);

        const remissoes = detectaRemissoes(s2, incCaput, 'Conforme o parágrafo único.');
        expect(remissoes).to.have.length(1);
        expect(remissoes[0].targetLexmlId).to.match(/^art1_par/);
      });

      it('[CT-X30] "§ 1º." bare — artigo sem parágrafos → 0 remissões (alvo inexistente)', () => {
        const {
          state: s2,
          artigos: [art],
        } = criaStateComNArtigos(1);
        const incCaput = criaDispositivo((art as Artigo).caput!, 'Inciso');
        incCaput.texto = 'Inc.';
        marcaAdicionado(incCaput);
        (art as Artigo).caput!.renumeraFilhos();
        updateIdDispositivoAndFilhos(s2.articulacao!);

        const remissoes = detectaRemissoes(s2, incCaput, 'Conforme o § 1º.');
        expect(remissoes).to.have.length(0);
      });

      it('[CT-X31] "§ 1º deste artigo" explícita com bare ativa → exatamente 1 remissão (sem duplicata)', () => {
        const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 1º deste artigo.');
        expect(remissoes).to.have.length(1, 'deduplicação deve impedir duplo match no mesmo offset');
        expect(remissoes[0].targetLexmlId).to.equal('art1_par1');
      });
    });

    describe('1.5b — Inciso bare com cascata parágrafo → artigo', () => {
      it('[CT-X32] "inciso II." bare — source em alínea do caput → resolve para caput', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const inc1Caput = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const inc2Caput = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const ali1 = criaDispositivo(inc1Caput, 'Alinea');
        [inc1Caput, inc2Caput, ali1].forEach(marcaAdicionado);
        (art1 as Artigo).caput!.renumeraFilhos();
        inc1Caput.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, ali1, 'Conforme o inciso II.');
        expect(remissoes).to.have.length(1);
        expect(remissoes[0].targetLexmlId).to.equal(inc2Caput.id);
        expect(remissoes[0].targetLexmlId).to.match(/^art1_cpt_inc/);
      });

      it('[CT-X33] "inciso II." bare — source em alínea de § que tem inciso II → resolve para o §', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const par1 = criaDispositivo(art1, 'Paragrafo');
        const inc1EmPar1 = criaDispositivo(par1, 'Inciso');
        const inc2EmPar1 = criaDispositivo(par1, 'Inciso');
        const ali1EmInc1Par1 = criaDispositivo(inc1EmPar1, 'Alinea');
        [par1, inc1EmPar1, inc2EmPar1, ali1EmInc1Par1].forEach(marcaAdicionado);
        art1.renumeraFilhos();
        par1.renumeraFilhos();
        inc1EmPar1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, ali1EmInc1Par1, 'Conforme o inciso II.');
        expect(remissoes).to.have.length(1);
        expect(remissoes[0].targetLexmlId).to.equal(inc2EmPar1.id);
        expect(remissoes[0].targetLexmlId).to.match(/^art1_par1_inc/);
      });

      it('[CT-X34] "inciso II." bare — § não tem inciso II → fallback para caput', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const inc1Caput = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const inc2Caput = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const par1 = criaDispositivo(art1, 'Paragrafo');
        const inc1EmPar1 = criaDispositivo(par1, 'Inciso'); // par1 tem só inciso I
        const ali1EmInc1Par1 = criaDispositivo(inc1EmPar1, 'Alinea');
        [inc1Caput, inc2Caput, par1, inc1EmPar1, ali1EmInc1Par1].forEach(marcaAdicionado);
        (art1 as Artigo).caput!.renumeraFilhos();
        art1.renumeraFilhos();
        par1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, ali1EmInc1Par1, 'Conforme o inciso II.');
        expect(remissoes).to.have.length(1);
        expect(remissoes[0].targetLexmlId).to.equal(inc2Caput.id);
        expect(remissoes[0].targetLexmlId).to.match(/^art1_cpt_inc/);
      });

      it('[CT-X34b] "inciso I." bare — § não tem inciso I e caput também não → 0 remissões', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const par1 = criaDispositivo(art1, 'Paragrafo');
        par1.texto = 'Par.';
        marcaAdicionado(par1);
        art1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, par1, 'Conforme o inciso I.');
        expect(remissoes).to.have.length(0);
      });

      it('[CT-X38] "inciso I deste artigo" explícita com bare ativa → exatamente 1 remissão (sem duplicata)', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const inc1Caput = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const par1 = criaDispositivo(art1, 'Paragrafo');
        const inc1EmPar1 = criaDispositivo(par1, 'Inciso');
        [inc1Caput, par1, inc1EmPar1].forEach(marcaAdicionado);
        (art1 as Artigo).caput!.renumeraFilhos();
        art1.renumeraFilhos();
        par1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o inciso I deste artigo.');
        expect(remissoes).to.have.length(1, 'deduplicação deve impedir duplo match no mesmo offset');
        expect(remissoes[0].targetLexmlId).to.match(/^art1_cpt_inc/);
      });
    });

    describe('1.5c — Alínea bare', () => {
      it('[CT-X35] "alínea b." bare — source em item dentro de inciso → resolve para alínea b do inciso', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const ali1 = criaDispositivo(inc1, 'Alinea');
        const ali2 = criaDispositivo(inc1, 'Alinea');
        const ite1 = criaDispositivo(ali1, 'Item');
        [inc1, ali1, ali2, ite1].forEach(marcaAdicionado);
        (art1 as Artigo).caput!.renumeraFilhos();
        inc1.renumeraFilhos();
        ali1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, ite1, 'Conforme a alínea b.');
        expect(remissoes).to.have.length(1);
        expect(remissoes[0].targetLexmlId).to.equal(ali2.id);
        expect(remissoes[0].targetLexmlId).to.match(/^art1_cpt_inc1_ali/);
      });

      it('[CT-X35b] "alínea a." bare — alínea não existe no inciso → 0 remissões', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        // inc1 sem alíneas
        marcaAdicionado(inc1);
        (art1 as Artigo).caput!.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, inc1, 'Conforme a alínea a.');
        expect(remissoes).to.have.length(0);
      });
    });

    describe('1.5d — Item bare', () => {
      it('[CT-X36] "item 2." bare — source em alínea → resolve para item 2 da alínea', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const inc1 = criaDispositivo((art1 as Artigo).caput!, 'Inciso');
        const ali1 = criaDispositivo(inc1, 'Alinea');
        const ite1 = criaDispositivo(ali1, 'Item');
        const ite2 = criaDispositivo(ali1, 'Item');
        [inc1, ali1, ite1, ite2].forEach(marcaAdicionado);
        (art1 as Artigo).caput!.renumeraFilhos();
        inc1.renumeraFilhos();
        ali1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, ite1, 'Conforme o item 2.');
        expect(remissoes).to.have.length(1);
        expect(remissoes[0].targetLexmlId).to.equal(ite2.id);
        expect(remissoes[0].targetLexmlId).to.match(/^art1_cpt_inc1_ali1_ite/);
      });
    });

    describe('Blocos de alteração — sem detecção implícita', () => {
      it('[CT-X37] "§ 1º." em dispositivo de bloco de alteração → 0 remissões', () => {
        // createElemento falha se isDispositivoAlteracao=true sem bloco de alteração completo,
        // por isso criamos o elemento antes e marcamos o dispositivo depois.
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const par1 = criaDispositivo(art1, 'Paragrafo');
        const inc1EmPar1 = criaDispositivo(par1, 'Inciso');
        [par1, inc1EmPar1].forEach(marcaAdicionado);
        art1.renumeraFilhos();
        par1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        inc1EmPar1.texto = 'Conforme o § 1º.';
        const elemento = createElemento(inc1EmPar1, true);
        (inc1EmPar1 as any).isDispositivoAlteracao = true;

        const result = adicionaRemissaoInterna(state, { atual: elemento });
        const remissoes = (result.remissoes as any)[inc1EmPar1.uuid!] ?? [];
        expect(remissoes).to.have.length(0);
      });
    });

    describe('Deduplicação e coexistência com detecções explícitas', () => {
      it('[CT-X39] "§ 1º e § 2º deste artigo" → 2 remissões: bare para par1, contextual para par2', () => {
        const {
          state,
          artigos: [art1],
        } = criaStateComNArtigos(1);
        const par1 = criaDispositivo(art1, 'Paragrafo');
        const par2 = criaDispositivo(art1, 'Paragrafo');
        const inc1EmPar1 = criaDispositivo(par1, 'Inciso');
        [par1, par2, inc1EmPar1].forEach(marcaAdicionado);
        art1.renumeraFilhos();
        par1.renumeraFilhos();
        updateIdDispositivoAndFilhos(state.articulacao!);

        const remissoes = detectaRemissoes(state, inc1EmPar1, 'Conforme o § 1º e o § 2º deste artigo.');
        expect(remissoes).to.have.length(2);
        const ids = remissoes.map((r: any) => r.targetLexmlId);
        expect(ids).to.include('art1_par1');
        expect(ids).to.include('art1_par2');
      });
    });
  });

  describe('Retrocompatibilidade — detecção absoluta ainda funciona', () => {
    it('[CT-X26] "art. 3º" absoluto ainda cria remissão (regressão 1.1)', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const remissoes = detectaRemissoes(state, artigos[0], 'Conforme o art. 3º.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art3');
    });

    it('[CT-X27] "§ 2º do art. 3º" absoluto ainda cria remissão (regressão 1.1)', () => {
      const { state, artigos } = criaStateComNArtigos(3);
      const art3 = artigos[2];

      const par1 = criaDispositivo(art3, 'Paragrafo');
      const par2 = criaDispositivo(art3, 'Paragrafo');
      par1.texto = 'P1.';
      par2.texto = 'P2.';
      [par1, par2].forEach(marcaAdicionado);
      art3.renumeraFilhos();
      updateIdDispositivoAndFilhos(state.articulacao!);

      const remissoes = detectaRemissoes(state, artigos[0], 'Conforme o § 2º do art. 3º.');
      expect(remissoes).to.have.length(1);
      expect(remissoes[0].targetLexmlId).to.equal('art3_par2');
    });
  });
});
