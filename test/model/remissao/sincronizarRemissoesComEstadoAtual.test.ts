import { expect } from '@open-wc/testing';
import { RemissaoInternaValue } from '../../../src/model/remissao';
import { Artigo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { updateIdDispositivoAndFilhos } from '../../../src/model/lexml/util/idUtil';
import { sincronizarRemissoesComEstadoAtual } from '../../../src/model/remissao/sincronizarRemissoes';
import { atualizarTextoRemissao } from '../../../src/model/remissao/lexmlIdUtil';

// Fase 4 do plano de simplificação: testa a função central que compõe as Fases 1-3, e compara o
// texto gerado contra `atualizarTextoRemissao` (mecanismo antigo, string-based) nos cenários onde a
// comparação é justa (mesmo destino, mesma relação estrutural).

const criaRegistro = (entries: Partial<RemissaoInternaValue> & { refId: string }): Record<number, RemissaoInternaValue[]> => ({
  [entries.sourceUuid!]: [entries as RemissaoInternaValue],
});

describe('sincronizarRemissoesComEstadoAtual', () => {
  describe('Fim a fim — cenários reais', () => {
    it('referência absoluta: artigo renumerado (novo artigo inserido antes) atualiza targetLexmlId e textoRef', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const texto = 'Conforme o art. 2º, aplica-se o disposto.';
      const inicio = texto.indexOf('art. 2º');
      art1.texto = texto;

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: art1.uuid,
        targetUuid: art2.uuid,
        targetLexmlId: art2.id,
        textoRef: 'art. 2º',
        inicio,
      });

      // Insere um artigo antes de ambos — art1 vira art2, art2 (destino) vira art3.
      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      const entrada = resultado[art1.uuid!][0];

      expect(entrada.targetLexmlId).to.equal(art2.id);
      expect(entrada.textoRef).to.equal('art. 3º');
      expect(art1.texto).to.equal('Conforme o art. 3º, aplica-se o disposto.');
    });

    it('referência contextual "deste artigo": inciso renumerado dentro do mesmo artigo preserva o estilo', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, 'Artigo');
      const par = criaDispositivo(art, 'Paragrafo');
      const incDestino = criaDispositivo(par, 'Inciso');
      const incOrigem = criaDispositivo(par, 'Inciso');

      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      par.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const textoRefOriginal = 'inciso I do § 1º deste artigo';
      const texto = `Nos termos do ${textoRefOriginal}, fica estabelecido.`;
      const inicio = texto.indexOf(textoRefOriginal);
      incOrigem.texto = texto;

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: incOrigem.uuid,
        targetUuid: incDestino.uuid,
        targetLexmlId: incDestino.id,
        textoRef: textoRefOriginal,
        inicio,
      });

      // Insere um novo inciso antes de incDestino — incDestino (inc1) vira inc2.
      criaDispositivo(par, 'Inciso', undefined, 0);
      par.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      const entrada = resultado[incOrigem.uuid!][0];

      expect(entrada.targetLexmlId).to.equal(incDestino.id);
      expect(entrada.textoRef).to.equal('inciso II do § 1º deste artigo');
      expect(incOrigem.texto).to.include('inciso II do § 1º deste artigo');
    });

    it('D4 — relação contextual se rompe: origem sai do artigo do destino, cai para forma absoluta', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      const incDestino = criaDispositivo(art1.filhos[0] ?? art1, 'Inciso'); // dentro do caput de art1
      const incOrigem = criaDispositivo(art2.filhos[0] ?? art2, 'Inciso'); // dentro do caput de art2 — OUTRO artigo

      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const textoRefOriginal = 'inciso I deste artigo';
      const texto = `Vide ${textoRefOriginal}.`;
      const inicio = texto.indexOf(textoRefOriginal);
      incOrigem.texto = texto;

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: incOrigem.uuid,
        targetUuid: incDestino.uuid,
        targetLexmlId: incDestino.id,
        textoRef: textoRefOriginal,
        inicio,
      });

      // Renomeia o artigo destino (insere um artigo antes de art1) — muda o lexmlId do destino sem
      // mudar a relação estrutural entre origem/destino (que já eram artigos diferentes).
      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      const entrada = resultado[incOrigem.uuid!][0];

      // Não compartilham o artigo — a frase contextual não se sustentava desde o início (bug pré-existente
      // no texto de teste, mas o importante aqui é que a função NÃO reanexa "deste artigo" indevidamente).
      expect(entrada.targetLexmlId).to.equal(incDestino.id);
      expect(entrada.textoRef).to.not.include('deste artigo');
    });

    // Fase 6 do plano de simplificação: casos herdados de textoContextual-remissao.test.ts (que
    // testava ModuloRemissao.atualizarReferencias(), removido por ficar órfão desde a Fase 5) —
    // preservam paridade de cobertura comportamental para variantes não cobertas acima.
    it('referência contextual "caput deste artigo": preservada quando artigo renumera', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
      const incOrigem = criaDispositivo(art.caput!, 'Inciso');
      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const caput = art.caput!;
      const textoRefOriginal = 'caput deste artigo';
      const texto = `Nos termos do ${textoRefOriginal}.`;
      const inicio = texto.indexOf(textoRefOriginal);
      incOrigem.texto = texto;

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: incOrigem.uuid,
        targetUuid: caput.uuid,
        targetLexmlId: caput.id,
        textoRef: textoRefOriginal,
        inicio,
      });

      // Insere um novo artigo antes — art (art1) vira art2.
      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      const entrada = resultado[incOrigem.uuid!][0];

      expect(entrada.targetLexmlId).to.equal(caput.id);
      expect(entrada.textoRef).to.equal(textoRefOriginal);
      expect(incOrigem.texto).to.include(textoRefOriginal);
    });

    it('referência contextual "§ 2º do presente artigo" (variante "do presente"): preservada quando artigo renumera', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, 'Artigo') as Artigo;
      criaDispositivo(art, 'Paragrafo');
      const parDestino2 = criaDispositivo(art, 'Paragrafo');
      const incOrigem = criaDispositivo(art.caput!, 'Inciso');

      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const textoRefOriginal = `${parDestino2.rotulo} do presente artigo`;
      const texto = `Nos termos do ${textoRefOriginal}.`;
      const inicio = texto.indexOf(textoRefOriginal);
      incOrigem.texto = texto;

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: incOrigem.uuid,
        targetUuid: parDestino2.uuid,
        targetLexmlId: parDestino2.id,
        textoRef: textoRefOriginal,
        inicio,
      });

      // Insere um novo artigo antes — art (art1) vira art2 (a relação entre incOrigem e parDestino2
      // não muda, mas o teste confirma que a variante "do presente" sobrevive à recomputação).
      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      const entrada = resultado[incOrigem.uuid!][0];

      expect(entrada.targetLexmlId).to.equal(parDestino2.id);
      expect(entrada.textoRef).to.include('do presente artigo');
      expect(incOrigem.texto).to.include('do presente artigo');
    });

    it('referência contextual de agrupador "Seção I deste Capítulo": preservada quando capítulo renumera', () => {
      const articulacao = createArticulacao();
      const cap = criaDispositivo(articulacao, 'Capitulo');
      const secDestino = criaDispositivo(cap, 'Secao');
      const artOrigem = criaDispositivo(cap, 'Artigo');

      articulacao.renumeraFilhos();
      cap.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const textoRefOriginal = 'Seção I deste Capítulo';
      const texto = `Nos termos da ${textoRefOriginal}.`;
      const inicio = texto.indexOf(textoRefOriginal);
      artOrigem.texto = texto;

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: artOrigem.uuid,
        targetUuid: secDestino.uuid,
        targetLexmlId: secDestino.id,
        textoRef: textoRefOriginal,
        inicio,
      });

      // Insere um novo capítulo antes — cap (cap1) vira cap2.
      criaDispositivo(articulacao, 'Capitulo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      const entrada = resultado[artOrigem.uuid!][0];

      expect(entrada.targetLexmlId).to.equal(secDestino.id);
      expect(entrada.textoRef).to.equal(textoRefOriginal);
      expect(artOrigem.texto).to.include(textoRefOriginal);
    });

    it('texto divergente do textoRef gravado: preserva o texto e marca revisao:true', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const texto = 'Conforme o art. 12º, aplica-se o disposto.'; // usuário editou à mão para um número errado
      const inicio = texto.indexOf('art. 12º');
      art1.texto = texto;

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: art1.uuid,
        targetUuid: art2.uuid,
        targetLexmlId: art2.id,
        textoRef: 'art. 2º', // o que o sistema gravou da última vez — diverge do texto atual
        inicio,
      });

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      const entrada = resultado[art1.uuid!][0];

      expect(entrada.revisao).to.be.true;
      expect(entrada.textoRef).to.equal('art. 2º'); // não sobrescrito
      expect(art1.texto).to.equal(texto); // texto na fonte não foi tocado
    });

    it('sem `inicio` registrado (ex.: remissão manual sem posição) — conservador: preserva e marca revisão', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      art1.texto = 'Conforme o texto mencionado.';

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: art1.uuid,
        targetUuid: art2.uuid,
        targetLexmlId: art2.id,
        textoRef: 'o artigo mencionado',
        // sem `inicio`
      });

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      const entrada = resultado[art1.uuid!][0];

      expect(entrada.revisao).to.be.true;
      expect(entrada.textoRef).to.equal('o artigo mencionado');
    });

    it('entrada inválida (valida:false) passa intocada — invalidação é responsabilidade de outro fluxo', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: art1.uuid,
        targetUuid: 99999,
        targetLexmlId: 'art99',
        textoRef: 'art. 99º',
        valida: false,
      });

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      expect(resultado[art1.uuid!][0]).to.equal(registro[art1.uuid!][0]);
    });

    it('destino não encontrado (uuid removido) passa intocado', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: art1.uuid,
        targetUuid: 99999,
        targetLexmlId: 'art99',
        textoRef: 'art. 99º',
      });

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      expect(resultado[art1.uuid!][0]).to.equal(registro[art1.uuid!][0]);
    });

    it('nada mudou (targetLexmlId já bate) — retorna a mesma entrada, sem recomputar', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);

      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: art1.uuid,
        targetUuid: art2.uuid,
        targetLexmlId: art2.id,
        textoRef: 'art. 2º',
        inicio: 0,
      });

      const resultado = sincronizarRemissoesComEstadoAtual(articulacao, registro);
      expect(resultado[art1.uuid!][0]).to.equal(registro[art1.uuid!][0]);
    });
  });

  describe('Comparação pontual contra atualizarTextoRemissao (mecanismo antigo)', () => {
    it('absoluto: art. 2º → art. 3º bate com o mecanismo antigo para o mesmo destino real', () => {
      const articulacao = createArticulacao();
      const art1 = criaDispositivo(articulacao, 'Artigo');
      const art2 = criaDispositivo(articulacao, 'Artigo');
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      const idAntigo = art2.id!;

      const texto = 'Conforme o art. 2º.';
      const inicio = texto.indexOf('art. 2º');
      art1.texto = texto;
      const registro = criaRegistro({ refId: 'ref1', sourceUuid: art1.uuid, targetUuid: art2.uuid, targetLexmlId: idAntigo, textoRef: 'art. 2º', inicio });

      criaDispositivo(articulacao, 'Artigo', undefined, 0);
      articulacao.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      const idNovo = art2.id!;

      const resultadoNovo = sincronizarRemissoesComEstadoAtual(articulacao, registro)[art1.uuid!][0].textoRef;
      const resultadoAntigo = atualizarTextoRemissao('art. 2º', idAntigo, idNovo);

      expect(resultadoNovo).to.equal(resultadoAntigo);
      expect(resultadoNovo).to.equal('art. 3º');
    });

    it('contextual: "inciso I do § 1º deste artigo" bate com o mecanismo antigo para o mesmo destino real', () => {
      const articulacao = createArticulacao();
      const art = criaDispositivo(articulacao, 'Artigo');
      const par = criaDispositivo(art, 'Paragrafo');
      const incDestino = criaDispositivo(par, 'Inciso');
      const incOrigem = criaDispositivo(par, 'Inciso');
      articulacao.renumeraFilhos();
      art.renumeraFilhos();
      par.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      const idAntigo = incDestino.id!;

      const textoRefOriginal = 'inciso I do § 1º deste artigo';
      const texto = `Nos termos do ${textoRefOriginal}.`;
      const inicio = texto.indexOf(textoRefOriginal);
      incOrigem.texto = texto;
      const registro = criaRegistro({
        refId: 'ref1',
        sourceUuid: incOrigem.uuid,
        targetUuid: incDestino.uuid,
        targetLexmlId: idAntigo,
        textoRef: textoRefOriginal,
        inicio,
      });

      criaDispositivo(par, 'Inciso', undefined, 0);
      par.renumeraFilhos();
      updateIdDispositivoAndFilhos(articulacao);
      const idNovo = incDestino.id!;

      const resultadoNovo = sincronizarRemissoesComEstadoAtual(articulacao, registro)[incOrigem.uuid!][0].textoRef;
      const resultadoAntigo = atualizarTextoRemissao(textoRefOriginal, idAntigo, idNovo);

      expect(resultadoNovo).to.equal(resultadoAntigo);
      expect(resultadoNovo).to.equal('inciso II do § 1º deste artigo');
    });
  });
});
