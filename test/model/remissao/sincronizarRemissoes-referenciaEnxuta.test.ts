import { expect } from '@open-wc/testing';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { sincronizarRemissoesComEstadoAtual } from '../../../src/model/remissao/sincronizarRemissoes';

// D4 do plano de simplificação de remissão (docs/PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md):
// referências "enxutas" (sem qualificador, ex.: "inciso I" sozinho) nunca devem ganhar uma cadeia de
// qualificadores que não tinham originalmente — mesmo que o lexmlId absoluto do alvo mude por causa
// de uma renumeração de ancestral alheio (ex.: inserir um novo artigo em outro lugar da árvore). Só
// devem ser corrigidas quando a posição do próprio alvo, dentro do SEU PAI IMEDIATO, muda de fato.
//
// Regra completa (decidida em conversa com o usuário, casos rastreados a partir de
// docs/teste-atualizacao-contextual.json — o arquivo em si NÃO é usado aqui, a árvore é reconstruída
// via criaDispositivo para não deixar o teste dependente dele):
//   1. Sufixo contextual ("deste/desta X"): texto muda só se a posição relativa ao ancestral
//      compartilhado mudar (já coberto por sincronizarRemissoesComEstadoAtual.test.ts).
//   2. Sem sufixo, texto ENXUTO (sem "do X"/"da X"): texto muda só se a posição do alvo dentro do seu
//      PAI IMEDIATO mudar — nunca ganha cadeia nova.
//   3. Sem sufixo, texto JÁ QUALIFICADO ("do art. N", "do § N do art. N"): sempre recalcula a cadeia
//      inteira, refletindo qualquer mudança em qualquer nível dela (comportamento já existente,
//      inalterado por este arquivo).
//
// IMPORTANTE (bug de teste encontrado durante a escrita): o registro da remissão (com
// `targetLexmlId` = destino.id no momento da detecção) precisa ser criado ANTES da renumeração da
// situação em teste — senão `targetLexmlId` já nasce igual ao id pós-renumeração e
// sincronizarRemissoesComEstadoAtual conclui "nada mudou", sem sequer tentar recalcular o texto.

const criaRegistro = (entries: Partial<RemissaoInternaValue> & { refId: string }): Record<number, RemissaoInternaValue[]> => ({
  [entries.sourceUuid!]: [entries as RemissaoInternaValue],
});

// Chamar SEMPRE antes de qualquer renumeração da situação em teste — captura o lexmlId do alvo "como
// ele era" no momento em que a remissão foi (hipoteticamente) detectada.
const detectaRemissao = (origem: Dispositivo, destino: Dispositivo, textoOriginal: string): Record<number, RemissaoInternaValue[]> => {
  const texto = `Nos termos do ${textoOriginal}, fica estabelecido.`;
  const inicio = texto.indexOf(textoOriginal);
  origem.texto = texto;

  return criaRegistro({
    refId: 'ref1',
    sourceUuid: origem.uuid,
    targetUuid: destino.uuid,
    targetLexmlId: destino.id,
    textoRef: textoOriginal,
    inicio,
  });
};

// Chamar DEPOIS da renumeração da situação em teste.
const textoResultante = (articulacao: any, registro: Record<number, RemissaoInternaValue[]>, origemUuid: number): string => {
  const entrada = sincronizarRemissoesComEstadoAtual(articulacao, registro)[origemUuid][0];
  return entrada.textoRef!;
};

describe('sincronizarRemissoesComEstadoAtual — D4: referência enxuta não ganha qualificador novo', () => {
  // ---------------------------------------------------------------------------------------------
  // Origem: inciso II do caput do art. 2 — texto "inciso I" (enxuto) — alvo: inciso I do mesmo caput
  // ---------------------------------------------------------------------------------------------
  describe('Origem "inciso II do art. 2", texto "inciso I" (enxuto), alvo irmão no mesmo caput', () => {
    const monta = (): { articulacao: any; art1: Artigo; art2: Artigo; origem: Dispositivo; destino: Dispositivo } => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const art2 = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const destino = criaDispositivo(art2.caput!, 'Inciso'); // inciso I
      const origem = criaDispositivo(art2.caput!, 'Inciso'); // inciso II
      articulacao.renumeraFilhos();
      art2.caput!.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, art1, art2, origem, destino };
    };

    it('Situação 1 — novo artigo 1 (inserido antes de tudo): NÃO atualiza', () => {
      const { articulacao, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso I');
    });

    it('Situação 2 — novo artigo 2 (inserido entre art1 e art2): NÃO atualiza', () => {
      const { articulacao, art1, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I');

      criaDispositivo(articulacao, 'Artigo', art1); // insere logo depois de art1 = nova posição 2
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso I');
    });

    it('Situação 3 — novo inciso 1 no mesmo caput do alvo: ATUALIZA (alvo vira inciso II)', () => {
      const { articulacao, art2, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I');

      criaDispositivo(art2.caput!, 'Inciso', undefined, 0); // novo inciso antes do destino
      art2.caput!.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso II');
    });
  });

  // ---------------------------------------------------------------------------------------------
  // Origem: caput do art. 3 — texto "art. 2" (forma já completa) — alvo: art. 2 inteiro
  // ---------------------------------------------------------------------------------------------
  describe('Origem "art. 3, caput", texto "art. 2" (artigo não tem forma mais enxuta), alvo: outro artigo inteiro', () => {
    it('Situação 1 — novo artigo 1: ATUALIZA (art. 2 vira art. 3)', () => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, 'Artigo'); // art1 (preenchimento, não usado na remissão)
      const destino = criaDispositivo(articulacao, 'Artigo') as Artigo; // art2 -> alvo
      const art3 = criaDispositivo(articulacao, 'Artigo') as Artigo; // art3 -> origem
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const registro = detectaRemissao(art3.caput!, destino, 'art. 2º');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, art3.caput!.uuid!)).to.equal('art. 3º');
    });
  });

  // ---------------------------------------------------------------------------------------------
  // Origem: inciso I do § 1 do art. 3 — texto "caput deste artigo" (contextual) — alvo: caput do
  // mesmo artigo
  // ---------------------------------------------------------------------------------------------
  describe('Origem "inciso I do § 1 do art. 3", texto "caput deste artigo" (contextual), alvo: caput do mesmo artigo', () => {
    const monta = (): { articulacao: any; art: Artigo; par1: Dispositivo; origem: Dispositivo } => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const par1 = criaDispositivo(art, 'Paragrafo');
      const origem = criaDispositivo(par1, 'Inciso');
      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, art, par1, origem };
    };

    it('Situação 1 — novo artigo 1: NÃO atualiza (mesmo artigo compartilhado, caput não tem numeral)', () => {
      const { articulacao, art, origem } = monta();
      const registro = detectaRemissao(origem, art.caput!, 'caput deste artigo');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('caput deste artigo');
    });

    it('Situação 2 — novo parágrafo 1 no mesmo artigo: NÃO atualiza (alvo é o caput, não depende de parágrafos)', () => {
      const { articulacao, art, origem } = monta();
      const registro = detectaRemissao(origem, art.caput!, 'caput deste artigo');

      criaDispositivo(art, 'Paragrafo', undefined, 0);
      art.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('caput deste artigo');
    });

    it('Situação 3 — novo inciso 1 (irmão da origem): NÃO atualiza (não afeta o caput)', () => {
      const { articulacao, art, par1, origem } = monta();
      const registro = detectaRemissao(origem, art.caput!, 'caput deste artigo');

      criaDispositivo(par1, 'Inciso', undefined, 0);
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('caput deste artigo');
    });
  });

  // ---------------------------------------------------------------------------------------------
  // Origem: inciso II do § 1 do art. 3 — texto "inciso II do art. 2" (com qualificador) — alvo:
  // inciso II do caput do art. 2 (outro artigo)
  // ---------------------------------------------------------------------------------------------
  describe('Origem "inciso II do § 1 do art. 3", texto "inciso II do art. 2" (com qualificador), alvo em outro artigo', () => {
    const monta = (): { articulacao: any; art3: Artigo; art2: Artigo; par1: Dispositivo; origem: Dispositivo; destino: Dispositivo } => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, 'Artigo'); // art1 (preenchimento)
      const art2 = criaDispositivo(articulacao, 'Artigo') as Artigo;
      criaDispositivo(art2.caput!, 'Inciso'); // inciso I do art2 (irrelevante aqui)
      const destino = criaDispositivo(art2.caput!, 'Inciso'); // inciso II do art2 — alvo
      const art3 = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const par1 = criaDispositivo(art3, 'Paragrafo');
      criaDispositivo(par1, 'Inciso'); // inciso I do par1 (irrelevante aqui)
      const origem = criaDispositivo(par1, 'Inciso'); // inciso II do par1 — origem
      articulacao.renumeraFilhos();
      art2.caput!.renumeraFilhos();
      art3.renumeraFilhos();
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, art3, art2, par1, origem, destino };
    };

    it('Situação 1 — novo artigo 1: ATUALIZA (art. 2 vira art. 3)', () => {
      const { articulacao, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso II do art. 2º');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso II do art. 3º');
    });

    it('Situação 2 — novo parágrafo 1 no artigo da origem (art. 3): NÃO atualiza (não toca no art. 2 nem no alvo)', () => {
      const { articulacao, art3, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso II do art. 2º');

      criaDispositivo(art3, 'Paragrafo', undefined, 0);
      art3.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso II do art. 2º');
    });

    it('Situação 3 — novo inciso 1 no art. 2 (mesmo caput do alvo): ATUALIZA (alvo vira inciso III)', () => {
      const { articulacao, art2, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso II do art. 2º');

      criaDispositivo(art2.caput!, 'Inciso', undefined, 0);
      art2.caput!.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso III do art. 2º');
    });
  });

  // ---------------------------------------------------------------------------------------------
  // Origem: inciso I do § 2 do art. 3 — texto "inciso I do § 1 deste artigo" (contextual) — alvo:
  // inciso I do § 1 do mesmo artigo
  // ---------------------------------------------------------------------------------------------
  describe('Origem "inciso I do § 2 do art. 3", texto "inciso I do § 1 deste artigo" (contextual)', () => {
    const monta = (): { articulacao: any; art: Artigo; par1: Dispositivo; par2: Dispositivo; origem: Dispositivo; destino: Dispositivo } => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const par1 = criaDispositivo(art, 'Paragrafo');
      const destino = criaDispositivo(par1, 'Inciso'); // inciso I do § 1
      const par2 = criaDispositivo(art, 'Paragrafo');
      const origem = criaDispositivo(par2, 'Inciso'); // inciso I do § 2
      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      par1.renumeraFilhos();
      par2.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, art, par1, par2, origem, destino };
    };

    it('Situação 1 — novo artigo 1: NÃO atualiza', () => {
      const { articulacao, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I do § 1º deste artigo');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso I do § 1º deste artigo');
    });

    it('Situação 2 — novo parágrafo 1 no mesmo artigo (§ 1 do alvo vira § 2): ATUALIZA', () => {
      const { articulacao, art, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I do § 1º deste artigo');

      criaDispositivo(art, 'Paragrafo', undefined, 0);
      art.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso I do § 2º deste artigo');
    });

    it('Situação 3 — novo inciso 1 no § 1 deste artigo (mesmo pai do alvo): ATUALIZA (alvo vira inciso II)', () => {
      const { articulacao, par1, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I do § 1º deste artigo');

      criaDispositivo(par1, 'Inciso', undefined, 0);
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso II do § 1º deste artigo');
    });

    it('Situação 4 — novo inciso 2 no § 1 deste artigo (depois do alvo): NÃO atualiza', () => {
      const { articulacao, par1, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I do § 1º deste artigo');

      criaDispositivo(par1, 'Inciso'); // adicionado ao final = novo inciso 2, depois do alvo (posição 1)
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso I do § 1º deste artigo');
    });
  });

  // ---------------------------------------------------------------------------------------------
  // Origem: inciso II do § 2 do art. 3 — texto "art. 1" — alvo: art. 1 inteiro
  // ---------------------------------------------------------------------------------------------
  describe('Origem "inciso II do § 2 do art. 3", texto "art. 1", alvo: outro artigo inteiro', () => {
    const monta = (): { articulacao: any; art3: Artigo; par2: Dispositivo; origem: Dispositivo; destino: Artigo } => {
      const articulacao = createArticulacao();
      const destino = criaDispositivo(articulacao, 'Artigo') as Artigo; // art1 — alvo
      const art3 = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const par2 = criaDispositivo(art3, 'Paragrafo');
      criaDispositivo(par2, 'Inciso');
      const origem = criaDispositivo(par2, 'Inciso');
      articulacao.renumeraFilhos();
      art3.renumeraFilhos();
      par2.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, art3, par2, origem, destino };
    };

    it('Situação 1 — novo artigo 1: ATUALIZA (art. 1 vira art. 2)', () => {
      const { articulacao, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'art. 1');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('art. 2º');
    });

    it('Situação 2 — novo parágrafo 1 no artigo da origem: NÃO atualiza (não afeta o art. 1)', () => {
      const { articulacao, art3, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'art. 1');

      criaDispositivo(art3, 'Paragrafo', undefined, 0);
      art3.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('art. 1');
    });

    it('Situação 3 — novo inciso 1 no § 1 deste artigo: NÃO atualiza (não afeta o art. 1)', () => {
      const { articulacao, art3, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'art. 1');

      const par1 = criaDispositivo(art3, 'Paragrafo', undefined, 0);
      art3.renumeraFilhos();
      criaDispositivo(par1, 'Inciso');
      par1.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('art. 1');
    });
  });

  // ---------------------------------------------------------------------------------------------
  // Origem: inciso III do § 2 do art. 3 — texto "inciso I" (enxuto) — alvo: inciso I do mesmo § 2
  // ---------------------------------------------------------------------------------------------
  describe('Origem "inciso III do § 2 do art. 3", texto "inciso I" (enxuto), alvo irmão no mesmo parágrafo', () => {
    const monta = (): { articulacao: any; art3: Artigo; par2: Dispositivo; origem: Dispositivo; destino: Dispositivo } => {
      const articulacao = createArticulacao();
      const art3 = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const par2 = criaDispositivo(art3, 'Paragrafo');
      const destino = criaDispositivo(par2, 'Inciso'); // inciso I
      criaDispositivo(par2, 'Inciso'); // inciso II
      const origem = criaDispositivo(par2, 'Inciso'); // inciso III
      articulacao.renumeraFilhos();
      art3.renumeraFilhos();
      par2.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, art3, par2, origem, destino };
    };

    it('Situação 1 — novo artigo 1: NÃO atualiza', () => {
      const { articulacao, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso I');
    });

    it('Situação 2 — novo parágrafo 1 no artigo da origem: NÃO atualiza (forma enxuta não carrega o número do parágrafo)', () => {
      const { articulacao, art3, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I');

      criaDispositivo(art3, 'Paragrafo', undefined, 0);
      art3.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso I');
    });

    it('Situação 3 — novo inciso 1 no § 2 deste artigo (mesmo pai do alvo): ATUALIZA (alvo vira inciso II)', () => {
      const { articulacao, par2, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I');

      criaDispositivo(par2, 'Inciso', undefined, 0);
      par2.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso II');
    });
  });

  // ---------------------------------------------------------------------------------------------
  // Origem: art. 5, caput — texto "inciso II do § 2 do art. 3" (com qualificador) — alvo: inciso II
  // do § 2 do art. 3 (outro artigo)
  // ---------------------------------------------------------------------------------------------
  describe('Origem "art. 5, caput", texto "inciso II do § 2 do art. 3" (com qualificador), alvo em outro artigo', () => {
    const monta = (): { articulacao: any; art3: Artigo; par2: Dispositivo; origem: Artigo; destino: Dispositivo } => {
      const articulacao = createArticulacao();
      criaDispositivo(articulacao, 'Artigo'); // art1 (preenchimento)
      criaDispositivo(articulacao, 'Artigo'); // art2 (preenchimento)
      const art3 = criaDispositivo(articulacao, 'Artigo') as Artigo;
      criaDispositivo(art3, 'Paragrafo'); // § 1º (preenchimento)
      const par2 = criaDispositivo(art3, 'Paragrafo'); // § 2º
      criaDispositivo(par2, 'Inciso'); // inciso I
      const destino = criaDispositivo(par2, 'Inciso'); // inciso II — alvo
      criaDispositivo(par2, 'Inciso'); // inciso III
      criaDispositivo(articulacao, 'Artigo'); // art4 (preenchimento)
      const origem = criaDispositivo(articulacao, 'Artigo') as Artigo; // art5
      articulacao.renumeraFilhos();
      art3.renumeraFilhos();
      par2.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, art3, par2, origem, destino };
    };

    it('Situação 1 — novo artigo 1: ATUALIZA (art. 3 vira art. 4)', () => {
      const { articulacao, origem, destino } = monta();
      const registro = detectaRemissao(origem.caput!, destino, 'inciso II do § 2º do art. 3º');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.caput!.uuid!)).to.equal('inciso II do § 2º do art. 4º');
    });

    it('Situação 2 — novo parágrafo 1 no art. 3 (§ 2 do alvo vira § 3): ATUALIZA', () => {
      const { articulacao, art3, origem, destino } = monta();
      const registro = detectaRemissao(origem.caput!, destino, 'inciso II do § 2º do art. 3º');

      criaDispositivo(art3, 'Paragrafo', undefined, 0);
      art3.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.caput!.uuid!)).to.equal('inciso II do § 3º do art. 3º');
    });

    it('Situação 3 — novo inciso 1 no § 2 do art. 3 (antes do alvo): ATUALIZA (alvo vira inciso III)', () => {
      const { articulacao, par2, origem, destino } = monta();
      const registro = detectaRemissao(origem.caput!, destino, 'inciso II do § 2º do art. 3º');

      criaDispositivo(par2, 'Inciso', undefined, 0);
      par2.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.caput!.uuid!)).to.equal('inciso III do § 2º do art. 3º');
    });

    it('Situação 4 — novo inciso 3 no § 2 do art. 3 (depois do alvo): NÃO atualiza', () => {
      const { articulacao, par2, origem, destino } = monta();
      const registro = detectaRemissao(origem.caput!, destino, 'inciso II do § 2º do art. 3º');

      // insere na posição 2 (índice 2, 0-based) — depois do alvo (inciso II, índice 1), antes do
      // antigo inciso III (índice 2) — ou seja, o novo dispositivo ASSUME a posição 3.
      criaDispositivo(par2, 'Inciso', undefined, 2);
      par2.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.caput!.uuid!)).to.equal('inciso II do § 2º do art. 3º');
    });
  });

  // ---------------------------------------------------------------------------------------------
  // Caso adicional levantado em conversa: referência enxuta com sufixo contextual quando o alvo é
  // filho DIRETO do caput (sem parágrafo no meio) — cobre o fix em textoCanonicoRelativoATipo para
  // não gerar "inciso I do caput" (bug encontrado ao raciocinar sobre este caso antes de implementar).
  // ---------------------------------------------------------------------------------------------
  describe('Origem "inciso II do art. 2", texto "inciso I deste artigo" (contextual, alvo filho direto do caput)', () => {
    const monta = (): { articulacao: any; art2: Artigo; origem: Dispositivo; destino: Dispositivo } => {
      const articulacao = createArticulacao();
      const art2 = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const destino = criaDispositivo(art2.caput!, 'Inciso'); // inciso I
      const origem = criaDispositivo(art2.caput!, 'Inciso'); // inciso II
      articulacao.renumeraFilhos();
      art2.caput!.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      return { articulacao, art2, origem, destino };
    };

    it('Situação 1 — novo artigo 1: NÃO atualiza (mesmo artigo compartilhado, posição do alvo no caput não muda)', () => {
      const { articulacao, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I deste artigo');

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso I deste artigo');
    });

    it('Situação 2 — novo inciso 1 no mesmo caput do alvo: ATUALIZA (alvo vira inciso II) — sem "do caput" espúrio', () => {
      const { articulacao, art2, origem, destino } = monta();
      const registro = detectaRemissao(origem, destino, 'inciso I deste artigo');

      criaDispositivo(art2.caput!, 'Inciso', undefined, 0);
      art2.caput!.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      expect(textoResultante(articulacao, registro, origem.uuid!)).to.equal('inciso II deste artigo');
    });
  });
});
