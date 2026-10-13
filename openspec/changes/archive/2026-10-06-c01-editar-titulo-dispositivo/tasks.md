## 1. Base: sanitização, validação e serialização

- [x] 1.1 Criar utilitário puro de sanitização do título (mantém só `i`, `u`, `sub`, `sup`; normaliza `em`→`i`; remove `<a>`/remissão preservando o texto interno) com testes unitários
- [x] 1.2 Acrescentar a checagem de título em `validaDispositivo` (nível `WARNING`: título vazio com a mensagem "Não foi informado um texto para o título do <tipo de dispositivo>." e título iniciando em minúscula, ignorando tags e espaços) com testes unitários
- [x] 1.3 Conferir/ajustar `buildJsonixFromProjetoNorma` e `buildProjetoNormaFromJsonix` para título com `i`/`u`/`sub`/`sup`, título vazio não gravado e título em dispositivo de bloco de alteração (ida e volta), com testes unitários

## 2. Action e reducer

- [x] 2.1 Criar `atualizarTituloDispositivoAction` (`ATUALIZAR_TITULO_DISPOSITIVO`) e a classe de ação com os rótulos "Adicionar título do dispositivo", "Editar título" e "Remover título"
- [x] 2.2 Criar o reducer `atualizaTituloDispositivo` (localiza o dispositivo, valida permissão/bloqueio, sanitiza, ignora quando inalterado, emite `ElementoModificado` e `ElementoValidado`, registra um passo de histórico) e registrá-lo no `elementoReducer`
- [x] 2.3 Incluir a ação nas regras de menu de Artigo, Parágrafo, Inciso, Alínea e Item (rótulo conforme exista título; fora de agrupador, caput, omissis, bloqueado e removido em revisão; vale também em bloco de alteração)
- [x] 2.4 Testes unitários do reducer: adicionar, alterar, remover, sem mudança, bloqueado, dentro de bloco de alteração, título vazio

## 3. Undo/redo

- [x] 3.1 Restaurar `tituloDispositivo` em `processarModificados` (`undoRedoReducerUtil`) para undo e redo
- [x] 3.2 Testes unitários de undo/redo para adicionar, alterar e remover título (inclusive em bloco de alteração)

## 4. Revisão

- [x] 4.1 Mapear descrição própria da revisão de título em `revisaoUtil` e incluir `tituloDispositivo` na comparação de "voltou ao original" em `atualizaRevisao`
- [x] 4.2 Ajustar `rejeitaRevisao.rejeitaModificacao` para restaurar o título do `elementoAntesRevisao` (sem passo de histórico duplicado) e garantir que aceitar mantém o novo título
- [x] 4.3 Testes unitários: gerar revisão, rejeitar, aceitar, voltar ao valor original, undo/redo com revisão ativa

## 5. Renderização na linha do editor

- [x] 5.1 Ensinar `EtaContainerTable` a criar, atualizar e remover o blot do título dinamicamente (exibir para `tituloDispositivo !== undefined`); se a inserção dinâmica for frágil, recriar a linha como contingência
- [x] 5.2 Fazer o blot do título disparar o `CustomEvent` de edição ao clique, e o `editor.component` tratar o evento e a escolha de menu das novas ações
- [x] 5.3 Ajustar o CSS do título se necessário (linha de alteração com aspas; título vazio)
- [x] 5.4 Teste de DOM/unitário da linha: título aparece, atualiza e some sem recriar a linha indevidamente

## 6. Diálogo de edição

- [x] 6.1 Criar `editarTituloDispositivoDialog` (`sl-dialog` + Quill leve restrito a itálico, sublinhado, subscrito, sobrescrito; botões Cancelar e Ok; mostra aviso de título vazio/minúscula; limpa o `sl-dialog` e devolve o foco ao editor)
- [x] 6.2 Ligar o diálogo às ações do menu e ao clique no título, despachando a action apenas quando o texto mudou
- [x] 6.3 Teste unitário do diálogo (abertura, valor inicial, cancelar sem efeito, confirmar com sanitização)

## 7. Testes E2E (Cypress)

- [x] 7.1 Avaliar a viabilidade à luz de `docs/guia-cypress.md` e registrar a decisão aqui: o fluxo usa `sl-dialog`, `sl-dropdown` e um Quill dentro do diálogo; é viável com os comandos existentes (menu de contexto, `sl-dialog`, `.ql-editor`), com cuidado para a corrida do menu de contexto e para não editar o DOM direto. Se algum cenário não for viável, propor teste de integração alternativo cobrindo o mesmo risco
  - **Decisão (viável):** o spec `cypress/e2e/titulo-dispositivo/titulo-dispositivo.cy.ts` cobre tudo com os comandos existentes (`selecionarOpcaoDeMenuDoDispositivo`, `getOpcoesDeMenuDoDispositivo`, revisão). O texto do diálogo é definido pela API do Quill do diálogo (`cy.type` não é confiável em contenteditable) e o undo/redo usa o botão da toolbar. Nenhum cenário precisou de alternativa de integração.
- [x] 7.2 Criar spec em `cypress/e2e/titulo-dispositivo/` com: adicionar, editar (pelo menu e pelo clique), remover, cancelar, aviso de vazio/minúscula, formatação restrita, undo/redo
- [x] 7.3 Cenário E2E de revisão (alterar com revisão ativa, rejeitar e aceitar) e de título em dispositivo dentro de bloco de alteração
- [x] 7.4 Rodar as suítes unitária (`npm test`), de lint (`npm run lint`) e as específicas do Cypress afetadas (revisão, alteração de norma) para checar regressão
  - **Resultado:** `npm test` e ESLint/Prettier dos arquivos da change sem erros; Cypress: título (12/12), revisão, alteração de norma, transformação e `grupo-l-caput-undo` passando. `remissao-interna/grupo-g-atualizacao` falha em 4 casos (CT-G-02/05/06/08, no `beforeEach`: `art1_par1u` no lugar de `art1_par1`) — **pré-existente**: reproduzido igual no commit anterior ao grupo 5 (73fadf35). Possível flakiness/dependência de timing do setup; não relacionado ao título.

## 8. Fechamento

- [x] 8.1 Validar a change (`openspec validate`) e revisar os artefatos contra o que foi implementado
- [x] 8.2 Atualizar `docs/sessao/TODO.md` e, se houver aprendizado novo, o `CLAUDE.md` (itens do projeto)

## 9. Evolução: rótulo e botão Remover no diálogo

- [x] 9.1 Renomear "Adicionar título" para "Adicionar título do dispositivo" (ação de menu e título do diálogo) e atualizar testes unitários e E2E
- [x] 9.2 Botão "Remover" (danger) no diálogo, visível só quando há título, reutilizando `removerTituloDispositivoAction`
- [x] 9.3 Teste unitário do botão (ausente sem título; com título, variante danger, despacha a remoção e fecha o diálogo)
- [x] 9.4 Ok desabilitado sem texto (adicionar e editar; Enter respeita o bloqueio): código, teste unitário (substitui "ok vazio grava título vazio") e ajuste do E2E de aviso de vazio
- [x] 9.5 E2E Cypress: remover pelo botão do diálogo (título some, menu volta a oferecer "Adicionar título do dispositivo", desfazer restaura) e botão ausente ao adicionar
- [x] 9.6 Rodar `npm test`, lint e o spec `titulo-dispositivo`; revalidar a change (`openspec validate --strict`)
  - **Resultado 9.6:** `npm test` (106 arquivos, todos os lotes) sem falhas; ESLint e `tsc --noEmit` limpos; Cypress `titulo-dispositivo` 15/15.
