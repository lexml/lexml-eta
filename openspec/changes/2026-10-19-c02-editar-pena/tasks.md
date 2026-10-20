## 1. Fundação: modelo e ida e volta do arquivo

- [x] 1.1 Provar a ida e volta de `Pena` pelo CLI real (`jsonix-lexml` 2.1.0, `JSONIX_LEXML_CLI`): montar à mão um JSON com `value.pena` em `Paragrafo` e em `Caput`, converter em XML, validar com o esquema e converter de volta, conferindo que o arquivo de saída existe (o CLI sai com código 0 em erro) e que a pena volta igual; registrar o resultado em `design.md`, e se falhar, parar e trazer ao usuário antes de seguir
- [ ] 1.2 Varrer as leituras de `.filhos` e `hasFilhos` (cerca de 205 e 26) e completar o inventário de guardas da seção "Pontos de guarda conhecidos" de `design.md`, classificando cada ponto como "precisa de guarda" ou "não afetado"; verificar revisando a tabela com o usuário na pausa da task
- [x] 1.3 Criar o tipo `Pena` (tipo de dispositivo, `tiposPermitidosFilhos` de Caput, Parágrafo, Inciso, Alínea e Item, verificação `isPena`), a numeração que preserva o rótulo e o `buildHref` `<pai>_pena`; verificar com testes unitários de criação e de id, inclusive `art1_cpt_pena` e um id de bloco de alteração
- [x] 1.4 Garantir a invariante "pena é o último filho" em `addFilho`/`addFilhoOnPosition` de `HierarquiaDispositivo` e `HierarquiaArtigo`, com a pena do artigo encaminhada para o Caput; verificar com testes unitários de inclusão com e sem referência, por posição e de remoção
- [x] 1.5 Gravar a pena em `value.pena` (fora de `lXcontainersOmissis`) em `buildJsonixFromProjetoNorma.ts` e lê-la em `buildProjetoNormaFromJsonix.ts`, normalizando o separador do rótulo para " –"; verificar com testes de conversão (parágrafo com incisos e pena, pena do caput, rótulos "Pena -", "Pena –", U+0096 e "Sanção -", ida e volta)
- [x] 1.6 Ler `value.pena` em `buildDispositivoFromJsonix.ts` (colar); verificar com teste unitário usando uma resposta jsonix gravada como fixture
- [x] 1.7 Confirmar a exibição da pena em linha própria depois da subárvore do dono ao abrir um documento (ordem dos `Elemento`s em `getElementos`/`createElementos`); verificar com teste de `getElementos` para o Art. 197 do CP e o art. 121 com § 1º

## 2. Pena do Caput e do Parágrafo fora de alteração (primeira entrega validável)

- [ ] 2.1 Criar as ações "Adicionar pena, medida administrativa e outros", "Remover" e "Alterar rótulo" e as regras de menu para Caput (pelo artigo) e Parágrafo, sem oferecê-las em bloqueado, removido em revisão, omissis, artigo que carrega bloco de alteração ou dono que já tem pena; verificar com testes de regras de menu, inclusive um que afirme que Tab em Inciso, Alínea e Item não oferece transformação em pena (ver G3)
- [ ] 2.2 Implementar os reducers de adicionar (com o rótulo da primeira pena do documento, se houver), remover e alterar rótulo, cada um como um único passo do histórico, sem passo quando o rótulo não muda; garantir no reducer de adicionar que o dono nunca fica com duas penas (o modelo aceita, a spec diz "no máximo uma"); verificar com testes de reducer, inclusive a tentativa de segunda pena, inclusive desfazer e refazer
- [ ] 2.3 Criar o modal de rótulo (Pena, Penalidade, Medida Administrativa, Infração, Outro com texto obrigatório; seleção inicial pela identidade do rótulo atual), no molde de `editarTituloDispositivoDialog.ts`, aberto pelo menu, pelo clique no rótulo e ao adicionar a primeira pena do documento; verificar com teste de componente (Ok desabilitado com "Outro" vazio, cancelar sem passo)
- [ ] 2.4 Integrar ao editor: linha da pena com rótulo e texto editável inline, foco no texto ao adicionar, atualização da linha ao alterar o rótulo; verificar manualmente no `npm start` e pelo E2E da task 8
- [ ] 2.5 Validar o texto da pena (vazio; inicial minúscula, com a exceção de nome próprio) em `conteudoValidator.ts`/`dispositivoValidator.ts`; verificar com testes unitários dos cenários de "Validação do texto da pena"

## 3. Inciso, Alínea e Item

- [ ] 3.1 Estender as ações e regras de menu a Inciso, Alínea e Item, incluindo penas em donos irmãos (Art. 197 do CP); verificar com testes de regras de menu e de reducer para cada tipo
- [ ] 3.2 Conferir a exibição e a ordem das linhas com penas em vários níveis (pena de inciso dentro de parágrafo com pena); verificar com teste de `getElementos`

## 4. Operações existentes, pontuação e teclado

- [ ] 4.1 Aplicar as guardas do inventário da task 1.2: incluir filho antes da pena (menu, posição "filho", Enter no dono terminado em ":", colar, desfazer, refazer, rejeitar), sem mover para depois da pena, e sem mover, transformar, renumerar ou converter a pena em omissis; tirar a pena das listas de tipos permitidos mostradas ao usuário (`hierarquiaValidator.ts:65-68`, `colarUtil.ts:359`, G23); verificar com um teste por operação, "com e sem pena", como pede a issue
- [ ] 4.2 Garantir que a pena acompanha o dono ao mover, transformar (inclusive Parágrafo ↔ Artigo, via caput) e remover; verificar com testes de reducer, inclusive desfazer
- [ ] 4.3 Implementar a regra de pontuação "o dispositivo imediatamente anterior à pena na ordem de leitura termina com ':'", isentando-o da exigência de "." de último de enumeração, fora e dentro de alteração, exceto omissis; verificar com testes dos cenários de "Pontuação do dispositivo anterior à pena"
- [ ] 4.4 Tratar o Enter na pena (no fim: irmão do dono logo depois; na pena do caput: primeiro parágrafo; antes do fim: nada) e confirmar que TAB e Alt+setas não têm efeito; verificar com testes de reducer e pelo E2E da task 8

## 5. Bloco de alteração de norma

- [ ] 5.1 Habilitar a pena dentro do bloco (Existente/Novo, `SituacaoNaNormaVigente`, caput omissis seguido de pena, aspas e "(NR)" na linha da pena quando é a última) e bloquear a pena no artigo que carrega o bloco, inclusive por ação que não passa pelo menu; verificar com testes de reducer, de `createElemento` (fecha aspas) e de conversão com `SituacaoNaNormaVigente`

## 6. Revisão

- [ ] 6.1 Incluir o rótulo da pena na comparação de alteração (`isMesmoTextoETitulo` ou equivalente) e a descrição "Rótulo do dispositivo foi alterado" / "Texto e rótulo do dispositivo foram alterados"; verificar com testes de revisão (gerar, descartar ao voltar ao original, descrição)
- [ ] 6.2 Restaurar o rótulo ao rejeitar e mantê-lo ao aceitar; verificar com testes de rejeitar e aceitar, inclusive pena adicionada e removida em revisão
- [ ] 6.3 Gravar o `Rotulo` anterior no estado anterior da revisão `alterado` da pena e reconstruí-lo ao abrir (ausente = igual ao atual); verificar com teste de ida e volta que compara a descrição e rejeita depois de reaberto

## 7. Remissão e paginação

- [ ] 7.1 Excluir a pena dos destinos do diálogo de remissão interna e da detecção automática, mantendo as remissões no texto da pena; verificar com testes unitários do filtro de destinos e da detecção
- [ ] 7.2 Cobrir a paginação: pena no último artigo de uma página e pena adicionada nesse artigo; verificar com testes unitários de `paginacaoUtil` (decisão: sem E2E, porque o risco é de cálculo, já coberto pelo unitário)

## 8. E2E, integração e fechamento

- [ ] 8.1 Escrever o E2E Cypress `cypress/e2e/pena/pena.cy.ts`, seguindo `docs/guia-cypress.md` e o precedente `titulo-dispositivo.cy.ts`: adicionar pena pelo menu (com o modal na primeira), editar o texto (marcando a linha antes de digitar), alterar o rótulo pelo clique, incluir um inciso num parágrafo com pena e conferir que ele entra antes dela, Enter na pena do inciso, remover, salvar capturando o blob de `URL.createObjectURL` e reabrir por `#fileUpload`; verificar rodando o spec em `npm run cy:run:local`
- [ ] 8.2 Escrever o E2E de abertura com uma fixture gerada por `criarDocumentoArticulado` (penas em caput, parágrafo e inciso, rótulo com hífen, pena em bloco de alteração com caput omissis), no molde de `abertura-preambulo.cy.ts`; verificar rodando o spec
- [ ] 8.3 Colar: sem E2E, porque depende do parser externo de homologação; o risco fica coberto pelo teste unitário da task 1.6 (decisão registrada)
- [ ] 8.4 Acrescentar à integração com o CLI real (`documentoArticulado.integration.ts`) um cenário com penas e com a revisão de rótulo; verificar com `npm run test:documento-articulado:xml` (CLI 2.1.0 em `C:\desenv\arquivos\jsonix-lexml-win.exe`; amostras com `Pena` em `C:\desenv\workspace\jsonix-lexml\samples`, ver `design.md`)
- [ ] 8.5 Rodar `npm test` e `npm run lint` completos; verificar que não há regressão
- [ ] 8.6 Preparar o texto do comentário para a issue #1019 com as duas divergências (inicial minúscula e ":" antes da pena), com a evidência do corpus, e entregá-lo ao usuário para publicar
- [ ] 8.7 Atualizar o CLAUDE.md com as invariantes novas (pena como último filho, ponto único de guarda, rótulo por identidade) e marcar a pendência "Implementar edição de pena" em `docs/requisitos/pendencias.md`; verificar revisando o diff com o usuário
