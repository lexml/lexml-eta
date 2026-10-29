## Why

Issue #1032: uma remissão "art. 2º" cujo alvo vira o parágrafo único do art. 1º (TAB) passa a ser escrita só como "parágrafo único", sem o artigo. O link continua apontando para o dispositivo certo, mas o texto passa a indicar outro dispositivo (o parágrafo único do artigo onde a remissão está escrita). A causa é a regra da referência "enxuta": o texto "art. 2º" não tem qualificador ("do X") porque um artigo não precisa de um, e por isso cai na regra que recalcula só o segmento local e nunca acrescenta cadeia.

## What Changes

- Quando o **tipo do dispositivo de destino muda** (ex.: artigo vira parágrafo, inciso vira alínea, parágrafo vira artigo), o texto de uma remissão sem qualificador explícito e sem sufixo contextual é recalculado com a **cadeia completa** (ex.: "parágrafo único do art. 1º"), em vez de ficar só com o segmento local.
- A regra enxuta (D4) continua valendo sem mudança enquanto o tipo do destino não muda. A matriz de testes atual de referência enxuta não muda.
- Referências qualificadas, contextuais ("deste artigo"), editadas manualmente e de texto livre seguem as regras atuais.
- Fica de fora a cadeia mínima, que omitiria o artigo quando a origem está no mesmo artigo do destino: o caso é raro, e cortar a cadeia exige regras próprias para não gerar texto ambíguo (ver design.md).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `remissao-interna`: o requisito "Atualização automática do texto do link em renumeração" ganha um cenário para o destino que muda de tipo, e o cenário da referência "enxuta" passa a ressalvar esse caso.

## Impact

- `src/model/remissao/sincronizarRemissoes.ts` (`sincronizarEntrada`): escolha da regra de texto.
- `src/model/remissao/lexmlIdUtil.ts`: possível função auxiliar para obter o tipo do último segmento de um id.
- Testes: `test/model/remissao/sincronizarRemissoes-referenciaEnxuta.test.ts` (novos casos) e um spec E2E Cypress de TAB com remissão.
- Sem impacto no formato salvo, na detecção ou em outros repositórios.
