## Context

Ver `proposal.md` (Why). A detecção de remissão interna roda em `detectarReferencias()` (`adicionaRemissaoInterna.ts`) em cinco passagens; a absoluta (`detectarReferenciasAbsolutas`) casa `REGEX_ABSOLUTA`, que já aceita `caput` como segmento opcional antes do artigo, e entrega o trecho a `ReferenciaDispositivoParser`.

O problema, confirmado por `test/redux/remissao/reducer-detecta-caput-absoluto.test.ts` (3 passam, 4 falham antes da correção):

- `preparaTexto()` remove `\scaput\s` — exige espaço antes. Em "caput do art. 2º" o "caput" abre a string, sobra "caput art 2" e a regex do parser não casa (`valido = false`). Em "inciso I do caput do art. 2º" funciona.
- O parser descarta a palavra "caput" e `ReferenciaDispositivo` não tem tipo caput: mesmo com o parser válido, `buscarDispositivoPorReferencia` devolveria o **Artigo**.
- O caput nunca está em `artigo.filhos` (invariante n); o destino certo é `artigo.caput`.

Já suportam o caput, sem mudança: a renumeração (`sincronizarEntrada` aplica a regra qualificada e `textoCanonicoDoDispositivo(caput)` gera "caput do art. N"), a busca do destino por `uuid`/`uuid2` e a serialização (`targetLexmlId` = `art{N}_cpt`, igual ao caminho de abrir arquivo). A sobreposição com `REGEX_CADEIA_IMPL` é segura: o `LOOKAHEAD_IMPL` bloqueia "caput" seguido de "do/da".

## Goals / Non-Goals

**Goals:**
- "caput do art. N" (com ou sem º, qualquer caixa) cria uma remissão para o caput desse artigo, cobrindo o trecho inteiro.
- Nenhuma regressão nas formas composta, contextual e implícita, nem no que o corpus real detecta hoje.

**Non-Goals:**
- Alterar `ReferenciaDispositivoParser`, `buscaDispositivoById` ou `buscarDispositivoPorReferencia`.
- Alterar renumeração, serialização ou abertura de arquivo.
- Caso de borda de `isTextoCanonico` (abaixo).

## Decisions

**D1 — Resolver o caput dentro de `detectarReferenciasAbsolutas`, antes de chamar o parser.**
Se o match tem exatamente a forma `caput do art. N` (caput, conector, artigo, sem nível intermediário), extrai o artigo e devolve `artigo.caput`, sem passar pelo parser. É o mesmo padrão do caso especial contextual (`prefixText === 'caput'`, "caput deste artigo"), então a semântica fica simétrica nas duas formas.
Alternativas descartadas:
- *Corrigir o parser para entender "caput" (opção B):* mais geral, mas o parser é compartilhado com o assistente de alteração e com `textoParaFragmentoLexmlId`, e exigiria um tipo caput em `ReferenciaDispositivo`. Risco de regressão desproporcional.
- *Corrigir só a normalização `^caput\s` (opção C):* uma linha, mas resolveria para o Artigo e criaria o link com destino errado — pior que não detectar.

**D2 — Forma composta fica como está.** "inciso I do caput do art. 2º" já resolve (o "caput" tem espaço antes e o parser o ignora; o inciso é achado a partir do artigo, pois o modelo não põe filhos no caput). D1 só atua quando o caput é o nível mais específico.

**D3 — A fixture `demo/doc/teste_remissao_caput.json` é mantida.** Ela cobre o caminho de abrir arquivo; o E2E ganha um caso digitado, que cobre o caminho de criação ao vivo.

## Risks / Trade-offs

- [Falso positivo ao tratar o trecho como caput em vez de "art. N" inteiro] → o trecho só é tratado assim quando "caput" está literalmente presente; "art. N" sozinho continua resolvendo para o Artigo (teste de controle).
- [Mudar o que é detectado pode alterar o round-trip de documentos reais] → regressão completa, incluindo `buildJsonixFromProjetoNorma.integracao.test.ts` (corpus real).
- [Dedup: match novo mais longo que o "art. N" contido] → `removerSobrepostos` mantém o mais longo; coberto pelo cenário misto ("caput do art. 2º e o art. 3º").

## Fora do escopo: limite pré-existente em `isTextoCanonico` para caput

`isTextoCanonico("caput do art. 2º", "art2_cpt")` retorna `false`: `parseLexmlId` descarta o segmento `cpt` (a regex de segmento exige ao menos um dígito), então a forma canônica derivada do id é "art. 2º", não "caput do art. 2º". Só afeta o caminho `restauradoParaCanonicoDoAlvoAntigo` de `sincronizarEntrada`: uma entrada marcada `revisao:true` por edição manual, cujo texto o usuário restaura à mão para a forma canônica do caput, não sai sozinha desse estado na renumeração seguinte. O caminho principal (`aindaBateComGravado`, texto igual ao gravado) não é afetado.

Já vale hoje para caputs vindos de arquivo; esta change não o causa nem o agrava (os links criados pela detecção nova seguem o mesmo caminho). Fica para uma issue própria — a correção natural é `isTextoCanonico` reconhecer o `cpt` do id, ou comparar via `textoCanonicoDoDispositivo` (que já trata caput).
