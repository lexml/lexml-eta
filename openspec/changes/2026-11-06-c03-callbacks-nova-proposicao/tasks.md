# Tasks

## 1. Configuração e tipos

- [x] 1.1 Acrescentar a `ConfigNovaProposicao` os callbacks `onObterComissoes`, `onVerificarProposicao`, `onObterTexto` e `onImportarArquivo` com seus tipos auxiliares, e exportá-los em `src/index.ts`; verificar com `npx tsc --noEmit -p tsconfig.json` sem erros
- [x] 1.2 Trocar em `validarConfigNovaProposicao` a obrigatoriedade das três URLs por "callback ou URL" por origem, mantendo o nome da URL na mensagem; verificar com testes em `modulosNovaProposicao.test.ts` (sem URL e sem callback lança erro que nomeia a URL; com callback no lugar da URL passa; `onImportarArquivo` não é exigido)
- [x] 1.3 Extrair a normalização de sigla e número usada em `montaUrlProposicao` para uma função reutilizável pelos dois caminhos; verificar que os testes existentes de `montaUrlProposicao` continuam passando

## 2. Origens de dados no componente

- [x] 2.1 Fazer `buscarComissoes` usar `onObterComissoes(casa)` quando existir, mantendo o filtro por `siglaCasaLegislativa` e `'indisponivel'` na rejeição; verificar com testes de componente em que o `fetch` não é chamado, em criação e no modo de edição (`alterarDadosBasicos.component.test.ts`)
- [x] 2.2 Fazer `consultar` usar `onVerificarProposicao({ sigla, numero, ano })` quando existir (`undefined` = inexistente, rejeição = erro, `textoEstruturadoDisponivel` verdadeiro por padrão, `complementar`); verificar com testes de componente para existente, inexistente, falha, valores normalizados (`pl`/`0012` chega como `PL`/`12`), PLS complementar e uso nos três grupos (referenciada, MPV e outra proposição)
- [x] 2.3 Fazer `buscarTexto` usar `onObterTexto({ sigla, numero, ano })` quando existir (`undefined` = indisponível, rejeição = erro); verificar com testes de componente para texto obtido no `detail`, indisponível (alerta e **Continuar** bloqueado) e falha (nova tentativa)
- [x] 2.4 Verificar com teste de componente que, com callback e URL informados, a URL não é chamada, e que as origens são independentes (callback numa e URL nas demais)

## 3. Importação de arquivo

- [ ] 3.1 Fazer `converterArquivoImportado` usar `onImportarArquivo(arquivo)` quando existir, mantendo o erro simulado quando não existir; tratar `erros` não vazio (Tela 3), sucesso com `texto` (conclui), sem erros e sem texto (Tela 3 com mensagem própria) e rejeição (Tela 2 com mensagem de erro de comunicação da importação e nova tentativa); verificar com testes de componente para cada caso
- [ ] 3.2 Verificar com teste de componente que o callback não é chamado para arquivo acima de 5 MB nem para extensão não aceita, e que sem callback o comportamento simulado dos testes existentes permanece

## 4. Documentação

- [ ] 4.1 Atualizar a seção 11 de `docs/api-componente-lexml-eta.md` (configuração, callbacks, contrato de cada um, precedência sobre a URL, nota de importação) e a seção 9 de `docs/requisitos/componente-nova-proposicao.md`; verificar relendo que nenhuma frase ainda diz que as três URLs são sempre obrigatórias nem que a importação é sempre simulada

## 5. Teste E2E (Cypress)

- [ ] 5.1 Avaliar à luz de `docs/guia-cypress.md` e escrever `cypress/e2e/nova-proposicao/callbacks.cy.ts`: abrir o modal da demo, substituir `config` do `<lexml-nova-proposicao>` por callbacks com `cy.stub` (via `cy.window`, usando os auxiliares de `cypress/support/nova-proposicao.ts`) e conferir pela UI real a verificação com a ementa do stub, o texto no documento criado, a lista de comissões e a conclusão da importação; verificar com `npm run cy:run:local` limitado a esse spec. Se o `config` não puder ser substituído de forma estável em Cypress, registrar a decisão e manter a cobertura nos testes de componente das tarefas 2 e 3

## 6. Verificação final

- [ ] 6.1 Rodar a suíte de testes da nova proposição (`test/componente/nova-proposicao/`) e `openspec validate 2026-11-06-c03-callbacks-nova-proposicao --strict`; verificar que passam sem falhas e que o lint dos arquivos alterados está limpo (apenas nos arquivos alterados)
