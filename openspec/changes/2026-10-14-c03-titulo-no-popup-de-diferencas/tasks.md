# Tasks

## 1. Dados do popup e comparação do título

- [x] 1.1 Em `src/components/editor/exibirDiferencaDialog.ts`, estender `TextoDiff` com `tituloAtual?`, `tituloAntesRevisao?` e `comRevisao`, e em `editor.component.ts#exibirDiferencas` preencher esses campos a partir de `elemento.tituloDispositivo`, `revisao.elementoAntesRevisao.tituloDispositivo` e `elemento.revisao`. Verificar com `npx tsc` sem erros e com um teste unitário em `test/components/editor/exibirDiferencaDialog.test.ts` que chama `exibirDiferencasDialog` com e sem título e confirma que o popup abre em `#slDialogExibirDiferencas`.
- [x] 1.2 Extrair a comparação em duas etapas (`diffWords` e `diffChars` sobre o resultado sem espaços duplicados) para uma função local `comparaHtml(antes, depois)` e usá-la nas duas abas, sem alterar o resultado do texto. Verificar no mesmo teste unitário: o HTML do card "Diferença" de texto, em um caso com texto alterado e sem título, é igual ao produzido antes da extração (comparar com o valor esperado fixado no teste, escrito antes da extração).

## 2. Exibição do título nos cards

- [x] 2.1 Desenhar, acima do texto de cada card da aba "Texto antes da revisão", a linha de título (negrito): título anterior, comparação com ins/del no card "Diferença" e título atual, passando o título por `sanitizarTituloDispositivo`; quando só um lado tem título, mostrar "Sem título" (itálico, cinza) no card do lado vazio, fora da comparação, e comparar o lado ausente como `''`; sem título nos dois lados, manter o HTML de hoje. Verificar com testes unitários em `exibirDiferencaDialog.test.ts` para: título alterado, parcialmente alterado ("Do objeto" para "Do objeto e da finalidade", com o trecho inserido em `<ins>`), adicionado, removido, só o texto alterado em dispositivo com título, sem título nos dois lados e título com itálico e subscrito preservados.
- [x] 2.2 Fazer a aba de revisão depender de `comRevisao` e não do texto anterior, e manter a aba "Texto original" sem título. Verificar com testes unitários: aba de revisão presente com texto anterior vazio e título alterado, aba "Texto original" sem a linha de título em dispositivo de alteração de norma com título.
- [ ] 2.3 Acrescentar ao `<style>` do popup as classes da linha de título e do marcador "Sem título". Verificar visualmente com o servidor local (popup com título alterado, adicionado e removido) e confirmar que o popup de dispositivo sem título não muda.

## 3. E2E (Cypress)

- [ ] 3.1 Em `cypress/e2e/titulo-dispositivo/titulo-dispositivo.cy.ts`, no describe de revisão, adicionar testes do popup: título alterado (antes "Do objeto", atual "Da finalidade", comparação com ins/del), título adicionado ("Sem título" no card anterior) e título removido ("Sem título" no card atual). Abrir pelo botão `[id^="buttonExibirDiferencas"]` com `click({ force: true })` e ler o popup em `#slDialogExibirDiferencas` (o conteúdo é light DOM do `sl-dialog`; os cards são `sl-card`); fechar pelo botão "Fechar". Avaliação à luz de `docs/guia-cypress.md`: viável, pois o popup é criado em `document.body` e os cards ficam no light DOM, sem depender do menu de contexto. Verificar rodando o spec com o servidor local (porta própria, com configuração de ambiente temporária removida ao final).
- [ ] 3.2 Estender o teste existente "salvar e reabrir preserva a revisão e rejeitar restaura o título anterior" para abrir o popup depois de reabrir e conferir o título anterior e o atual, antes de rejeitar. Verificar rodando o spec: o teste passa e o popup do documento reaberto exibe os mesmos títulos da sessão.

## 4. Documentação e verificação final

- [ ] 4.1 Registrar no `CLAUDE.md`, no item do título de dispositivo (item 14), que o popup de diferenças exibe o título nos três cards e que a aba de revisão depende de `comRevisao`. Verificar relendo o texto contra os cenários do delta de spec.
- [ ] 4.2 Rodar `openspec validate 2026-10-14-c03-titulo-no-popup-de-diferencas`, `npx tsc`, o lint dos arquivos alterados, `npm test` (comparando a contagem com a de antes da change, sem testes removidos ou ignorados) e os specs Cypress de `titulo-dispositivo/` e `revisao/`. Verificar que tudo passa; as falhas já conhecidas de `remissao-interna` (CT-F-11, CT-G-02, 05, 06, 08) não fazem parte desta verificação.

## Workflow follow-up

- Criar uma branch de feature a partir da `develop` antes de implementar (hoje o working tree está na `develop`).
- Não commitar sem pedido explícito; ao fim de cada grupo numerado, pausar e pedir validação.
- Arquivar a change (`/opsx-archive`) depois da validação e do commit.
