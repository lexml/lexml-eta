## 1. Base: sanitização, validação e serialização

- [x] 1.1 Criar utilitário puro de sanitização do título (mantém só `i`, `u`, `sub`, `sup`; normaliza `em`→`i`; remove `<a>`/remissão preservando o texto interno) com testes unitários
- [x] 1.2 Acrescentar a checagem de título em `validaDispositivo` (nível `WARNING`: título vazio com a mensagem "Não foi informado um texto para o título do <tipo de dispositivo>." e título iniciando em minúscula, ignorando tags e espaços) com testes unitários
- [x] 1.3 Conferir/ajustar `buildJsonixFromProjetoNorma` e `buildProjetoNormaFromJsonix` para título com `i`/`u`/`sub`/`sup`, título vazio não gravado e título em dispositivo de bloco de alteração (ida e volta), com testes unitários

## 2. Action e reducer

- [ ] 2.1 Criar `atualizarTituloDispositivoAction` (`ATUALIZAR_TITULO_DISPOSITIVO`) e a classe de ação com os rótulos "Adicionar título", "Editar título" e "Remover título"
- [ ] 2.2 Criar o reducer `atualizaTituloDispositivo` (localiza o dispositivo, valida permissão/bloqueio, sanitiza, ignora quando inalterado, emite `ElementoModificado` e `ElementoValidado`, registra um passo de histórico) e registrá-lo no `elementoReducer`
- [ ] 2.3 Incluir a ação nas regras de menu de Artigo, Parágrafo, Inciso, Alínea e Item (rótulo conforme exista título; fora de agrupador, caput, omissis, bloqueado e removido em revisão; vale também em bloco de alteração)
- [ ] 2.4 Testes unitários do reducer: adicionar, alterar, remover, sem mudança, bloqueado, dentro de bloco de alteração, título vazio

## 3. Undo/redo

- [ ] 3.1 Restaurar `tituloDispositivo` em `processarModificados` (`undoRedoReducerUtil`) para undo e redo
- [ ] 3.2 Testes unitários de undo/redo para adicionar, alterar e remover título (inclusive em bloco de alteração)

## 4. Revisão

- [ ] 4.1 Mapear descrição própria da revisão de título em `revisaoUtil` e incluir `tituloDispositivo` na comparação de "voltou ao original" em `atualizaRevisao`
- [ ] 4.2 Ajustar `rejeitaRevisao.rejeitaModificacao` para restaurar o título do `elementoAntesRevisao` (sem passo de histórico duplicado) e garantir que aceitar mantém o novo título
- [ ] 4.3 Testes unitários: gerar revisão, rejeitar, aceitar, voltar ao valor original, undo/redo com revisão ativa

## 5. Renderização na linha do editor

- [ ] 5.1 Ensinar `EtaContainerTable` a criar, atualizar e remover o blot do título dinamicamente (exibir para `tituloDispositivo !== undefined`); se a inserção dinâmica for frágil, recriar a linha como contingência
- [ ] 5.2 Fazer o blot do título disparar o `CustomEvent` de edição ao clique, e o `editor.component` tratar o evento e a escolha de menu das novas ações
- [ ] 5.3 Ajustar o CSS do título se necessário (linha de alteração com aspas; título vazio)
- [ ] 5.4 Teste de DOM/unitário da linha: título aparece, atualiza e some sem recriar a linha indevidamente

## 6. Diálogo de edição

- [ ] 6.1 Criar `editarTituloDispositivoDialog` (`sl-dialog` + Quill leve restrito a itálico, sublinhado, subscrito, sobrescrito; botões Cancelar e Ok; mostra aviso de título vazio/minúscula; limpa o `sl-dialog` e devolve o foco ao editor)
- [ ] 6.2 Ligar o diálogo às ações do menu e ao clique no título, despachando a action apenas quando o texto mudou
- [ ] 6.3 Teste unitário do diálogo (abertura, valor inicial, cancelar sem efeito, confirmar com sanitização)

## 7. Testes E2E (Cypress)

- [ ] 7.1 Avaliar a viabilidade à luz de `docs/guia-cypress.md` e registrar a decisão aqui: o fluxo usa `sl-dialog`, `sl-dropdown` e um Quill dentro do diálogo; é viável com os comandos existentes (menu de contexto, `sl-dialog`, `.ql-editor`), com cuidado para a corrida do menu de contexto e para não editar o DOM direto. Se algum cenário não for viável, propor teste de integração alternativo cobrindo o mesmo risco
- [ ] 7.2 Criar spec em `cypress/e2e/titulo-dispositivo/` com: adicionar, editar (pelo menu e pelo clique), remover, cancelar, aviso de vazio/minúscula, formatação restrita, undo/redo
- [ ] 7.3 Cenário E2E de revisão (alterar com revisão ativa, rejeitar e aceitar) e de título em dispositivo dentro de bloco de alteração
- [ ] 7.4 Rodar as suítes unitária (`npm test`), de lint (`npm run lint`) e as específicas do Cypress afetadas (revisão, alteração de norma) para checar regressão

## 8. Fechamento

- [ ] 8.1 Validar a change (`openspec validate`) e revisar os artefatos contra o que foi implementado
- [ ] 8.2 Atualizar `docs/sessao/TODO.md` e, se houver aprendizado novo, o `CLAUDE.md` (itens do projeto)
