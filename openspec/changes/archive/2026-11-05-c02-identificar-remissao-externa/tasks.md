# Tasks

## 1. Configuração e editor

- [x] 1.1 Em `src/model/lexmlEtaConfig.ts`, criar `identificarRemissaoExterna = true`, com comentário de uma linha (desliga a detecção automática de remissão externa e o worker do lexml-linker). Verificar com o `tsc` sem erros.
- [x] 1.2 Em `src/components/editor/editor.component.ts`, retornar no início de `coordenarDeteccaoExterna` quando `this.lexmlEtaConfig?.identificarRemissaoExterna === false` (D2). Verificar com testes em `test/components/editor/deteccaoRemissaoBlur.test.ts`:
  - com `false`, `lexmlLinkerClient.detectarRemissoesExternas` não é chamado na saída de linha nem no Enter, e a remissão interna continua sendo despachada;
  - sem o campo (config padrão), o cliente é chamado como antes;
  - os testes já existentes do arquivo continuam passando.
- [x] 1.3 Rodar eslint e prettier só nos arquivos alterados e verificar que passam.

## 2. Documentação para o host

- [x] 2.1 Em `docs/api-componente-lexml-eta.md`, acrescentar `identificarRemissaoExterna` à tabela da seção 5 e uma frase na receita "Detecção de remissões" (seção 9), dizendo o que continua funcionando com `false`. Verificar relendo os dois trechos.

## 3. E2E

- [x] 3.1 Criar em `cypress/e2e/remissao-externa/` um spec com a detecção desligada, seguindo `docs/guia-cypress.md` (com `export {};`): espionar `win.Worker` no `onBeforeLoad` do `cy.visit`, alterar o campo no objeto de configuração já existente do `<lexml-eta>` antes de `novaProposicao`, digitar a citação completa e sair da linha. Verificar que `win.Worker` não foi chamado e que não existe `a.lexml-remissao-externa`, com o spec passando no servidor de desenvolvimento na porta 8000.
- [x] 3.2 Rodar `grupo-a-deteccao-automatica.cy.ts` e `grupo-b-coexistencia-interna.cy.ts` e verificar que continuam passando (detecção ligada, sem regressão).
  - Resultado: grupo B 1/1; grupo A 3/5. As 2 falhas do grupo A são anteriores a esta change (repetem-se sem o guard) e vêm do deslocamento causado pelo menu de contexto, registrado à parte.

## 4. Verificação integrada

- [x] 4.1 Rodar os testes unitários de remissão (`test/components/editor/` e `test/util/lexml-linker/`) e verificar que passam.
