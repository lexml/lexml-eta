# Tasks

## 1. Classificação da numeração irregular

- [x] 1.1 Em `model/lexml/numeracao/numeracaoRepetida.ts`, implementar a classificação por grupo (D1, D2) e as duas formas de uso, `getIrregularidadeNumeracao(d)` (local) e `getIrregularidadesNumeracao(articulacao)` (em lote, mapa uuid → tipo). Elas substituem `isNumeracaoRepetida`/`getUuidsComNumeracaoRepetida`, preservando a regra da repetição. Verificar em `test/model/numeracao/numeracaoRepetida.test.ts`, com os cenários da spec e os já existentes de repetição:
  - `1, 3, 4` (lacuna só no 3) e início em `2`;
  - `1, 3, 2, 4` (lacuna no 3, fora de ordem no 2, o 4 sem erro);
  - `1, 2, 3, 2, 4` (repetida prevalece, o 4 sem erro);
  - `3, 3-A, 4`, `3, 3-A, 3-B, 4` e `1, 3-A` (complemento, que prevalece sobre lacuna);
  - incisos I e III; artigos em capítulos diferentes;
  - pai "Existente" e artigo de bloco de alteração sem os três casos novos;
  - grupo com omissis só com repetição;
  - forma local e forma em lote com o mesmo resultado em todos os casos.
- [x] 1.2 Acrescentar ao `AutoFix` (`mensagem.ts`) `NUMERACAO_COMPLEMENTO`, `NUMERACAO_LACUNA` e `NUMERACAO_FORA_DE_ORDEM`, com os textos da spec, e fazer `validaNumeracao` emitir a mensagem do tipo devolvido pela forma local, só no modo flexível, com `fix` verdadeiro para os três novos e a regra atual para a repetição (D4). Verificar em `test/model/numeracao/numeracao.test.ts`:
  - mensagem de cada tipo no dispositivo certo;
  - nenhuma mensagem nova no modo rígido;
  - as mensagens do bloco de alteração inalteradas.

  Restaurar o modo no `afterEach`.
- [x] 1.3 Em `validaNumeracao`, avaliar complemento, lacuna e fora de ordem nos dois modos, e descartar `repetida` no modo rígido (D7). Verificar em `test/model/numeracao/numeracaoRepetida.test.ts`:
  - no rígido, os artigos 1, 3, 2 e 4 têm os erros de lacuna e de fora de ordem, com correção;
  - no rígido, o 2-A de 1, 2, 2-A, 3 tem o erro de complemento;
  - no rígido, dois artigos repetidos de bloco de alteração não têm erro de numeração repetida;
  - o teste antigo "no modo rígido não há mensagem de lacuna, de fora de ordem nem de complemento" é invertido.

## 2. Passagem central, alerta e correção

- [x] 2.1 Trocar `state.numeracaoRepetida` por `state.numeracaoIrregular` (mapa uuid → tipo) e adaptar `sincronizarNumeracaoRepetida` (D3, D5): revalidar quando muda o par (uuid, tipo), usar o alerta `alerta-global-numeracao-irregular` com "Existem dispositivos com numeração irregular." e renomear as constantes exportadas. Ajustar `test/redux/elemento/reducer/numeracaoRepetidaReducer.test.ts` e acrescentar casos:
  - abrir `1, 3, 2, 4` produz o alerta e o mapa;
  - um único alerta com os quatro tipos juntos;
  - mover o "Art. 2º" para antes do "Art. 3º" retira o alerta;
  - mudança de tipo do mesmo dispositivo emite `ElementoValidado`;
  - rígido sem alerta nem mapa.
- [x] 2.2 Em `autoFixElemento.ts`, renomear a correção para `corrigeNumeracaoIrregular` e encaminhar a ela as quatro mensagens, antes da guarda `hasFix` (D4). Verificar em `test/redux/elemento/reducer/autoFixNumeracaoRepetida.test.ts`:
  - `1, 3, 2, 4` corrigido a partir do "Art. 2º" vira 1 a 4, na mesma ordem e com o mesmo texto;
  - `1, 3, 4` vira 1 a 3; `1, 2, 2-A, 3` vira 1 a 4;
  - incisos I e III viram I e II;
  - desfazer devolve a irregularidade com o erro e o alerta;
  - em modo de revisão, a correção não gera revisão.
- [x] 2.3 Fazer a passagem central (`sincronizarNumeracaoIrregular`) rodar nos dois modos, descartando `repetida` no rígido (D7). Verificar em `test/redux/elemento/reducer/numeracaoRepetidaReducer.test.ts` e `autoFixNumeracaoRepetida.test.ts`:
  - abrir, no rígido, os artigos 1, 3 e 4 produz o alerta e o mapa só com a lacuna;
  - incluir um artigo, no rígido, renumera e retira o alerta;
  - "Corrigir agora", no rígido, corrige 1, 3, 2, 4, e desfazer devolve o alerta;
  - o teste antigo "no modo rígido não há alerta nem mapa" passa a usar um documento só com repetição.
- [x] 2.4 Reaproveitar a classificação por grupo na forma local (D8), para que validar todos os dispositivos de um documento grande não fique quadrático no modo padrão. Verificar:
  - testes de reaproveitamento em `test/model/numeracao/numeracaoRepetida.test.ts` (número alterado, membro incluído, pai "Novo" → "Existente", omissis incluído);
  - medição no reducer, no rígido, com 1.000 e 2.000 artigos (abrir, validar e incluir no início), no nível da `develop`.

## 3. Pendência no componente

- [ ] 3.1 Em `lexml-eta.component.ts`, usar `MENSAGEM_NUMERACAO_IRREGULAR` e o novo estado em `getDocumentoArticulado` e `getPendenciasPreenchimento`, na mesma posição da lista (D5). Ajustar `test/model/documento/pendencias.test.ts` e `test/componente/lexml-eta/documentoArticulado.component.test.ts` para o novo texto e acrescentar:
  - salvar `1, 3, 2, 4` grava a pendência uma única vez, nos dois modos;
  - a pendência some depois da correção;
  - um arquivo com a pendência antiga ("numeração repetida") e sem irregularidade abre sem alerta.
- [ ] 3.2 Atualizar `docs/api-componente-lexml-eta.md`: o comportamento dos dois modos com os quatro casos (a repetição só no flexível) e o novo texto do alerta e da pendência. Atualizar o item 28 do `CLAUDE.md`: a classificação única por grupo, o filtro da repetição pelo modo, o mapa por tipo no estado, o grupo com omissis e o risco das mensagens duplicadas no bloco com pai "Novo". Verificar por revisão dos textos.
- [ ] 3.3 Rodar a suíte unitária completa (`npm test`) e tratar as falhas causadas pelos erros novos no modo rígido (design, risco dos testes existentes): ajustar o teste quando a irregularidade é incidental à fixture e manter o erro quando for o comportamento esperado. Verificar que a suíte passa e listar, na pausa, os testes ajustados e o motivo de cada um.

## 4. E2E (Cypress)

- [ ] 4.1 Gerar a fixture `demo/doc/teste_numeracao_irregular.json` com `criarDocumentoArticulado(..., { validacaoNumeracao: 'flexivel' })`, do mesmo jeito que `teste_numeracao_repetida.json`, sem escrever o JSON à mão. A fixture tem os artigos 1, 3, 2, 4, 4-A e 5, nessa ordem e cada um com texto próprio. Verificar que `lerDocumentoArticulado` a aceita.
- [ ] 4.2 Criar `cypress/e2e/documento-articulado/abertura-numeracao-irregular.cy.ts` seguindo `docs/guia-cypress.md`: `#validacaoNumeracao` em `flexivel` antes do `selectFile`, alertas no shadow root de `lexml-eta-alertas` e linha marcada com `getOpcoesDeMenuDoDispositivo` antes do "Corrigir agora". O spec deve cobrir quatro casos:
  - "Dispositivo com lacuna na numeração" no 3, "Dispositivo com numeração fora de ordem" no 2 e "Dispositivo com complemento na numeração" no 4-A, sem erro no 1, no 4 e no 5, e o alerta "Existem dispositivos com numeração irregular.";
  - "Corrigir agora" no 2 renumera para 1 a 6, mantém a ordem dos textos e retira os erros e o alerta;
  - desfazer devolve os erros;
  - no modo rígido, o mesmo arquivo abre com os mesmos erros e o mesmo alerta.

  Ajustar o texto do alerta em `abertura-numeracao-repetida.cy.ts`. Verificar com `npm run cy:run:local -- --spec "cypress/e2e/documento-articulado/abertura-numeracao-*.cy.ts"`.

## 5. Verificação final

- [ ] 5.1 Rodar `npm test` e `openspec validate 2026-11-27-c01-numeracao-fora-de-sequencia --strict`, e verificar que ambos passam.

## Workflow follow-up

- Avisar o `lexeditweb-editor`: o texto da pendência passou a "Existem dispositivos com numeração irregular.", e documentos com complemento no texto principal, lacuna ou fora de ordem passam a ter erro, alerta e pendência em qualquer modo, inclusive no padrão (rígido).
- Arquivar a change depois da revisão.
