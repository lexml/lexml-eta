## 1. Testes de unidade que reproduzem o bug

- [x] 1.1 Em `test/model/remissao/sincronizarRemissoes-referenciaEnxuta.test.ts`, adicionar um bloco para destino que muda de tipo: (a) origem no art. 3º, texto "art. 2º", art. 2º vira parágrafo único do art. 1º e o texto esperado é "parágrafo único do art. 1º"; (b) origem no caput do art. 1º, mesmo TAB, texto esperado "parágrafo único do art. 1º"; (c) origem citando "inciso II", o inciso II vira alínea a) do inciso I e o texto esperado é a cadeia completa; (d) texto "parágrafo único", destino volta a ser artigo (SHIFT_TAB) e o texto esperado é "art. 2º". Verificar que (a), (b) e (c) falham antes da correção (`npm test`).

## 2. Correção

- [x] 2.1 Criar em `src/model/remissao/lexmlIdUtil.ts` a função que devolve o tipo do último segmento de um id (prefixo alfabético, incluindo `cpt` e `pena`), com teste de unidade para `art2`, `art1_par1u`, `art1_cpt`, `art1_cpt_inc2` e um id de bloco de alteração.
- [x] 2.2 Em `sincronizarEntrada` (`src/model/remissao/sincronizarRemissoes.ts`), aplicar a regra enxuta só quando o tipo de `entry.targetLexmlId` for igual ao de `destino.id` (ou quando `targetLexmlId` não existir); caso contrário, usar `textoCanonicoDoDispositivo`. Verificar que os casos da task 1.1 passam e que a matriz D4 existente continua verde (`npm test`).

## 3. E2E

- [x] 3.1 Criar `cypress/e2e/remissao-interna/grupo-n-alvo-muda-tipo.cy.ts`: criar o art. 3º com remissão "art. 2º", dar TAB no art. 2º (keydown `Tab`, como em `cypress/e2e/transformacao/tab-artigo-em-paragrafo.cy.ts`) e conferir que o link mostra "parágrafo único do art. 1º" e aponta para o parágrafo; depois desfazer e conferir "art. 2º". Seguir `docs/guia-cypress.md` (criar a estrutura antes de detectar, usar `digitarTextoRemissao`/`dispararDeteccaoRemissao`, clicar no menu antes de editar o texto do mesmo dispositivo). Verificar com `npm run cy:run:local -- --spec <arquivo>` e rodar também `grupo-h-referencia-enxuta.cy.ts` e `grupo-g-atualizacao.cy.ts` para descartar regressões.

## 4. Fechamento

- [x] 4.1 Rodar `npm run lint` e a suíte completa (`npm test`) e confirmar que ambos passam.
