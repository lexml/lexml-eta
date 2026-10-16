## 1. Número composto no nome da norma

- [x] 1.1 Corrigir `formataNumero` (`urnUtil.ts`) para números com sufixo (`2158-35` → `2.158-35`) e nunca devolver `NaN`; verificar com teste unitário cobrindo `14133`, `2158-35` e entrada não numérica
- [x] 1.2 Verificar que o texto gerado para a URN `urn:lex:br:federal:medida.provisoria:2001;2158-35` exibe "Medida Provisória nº 2.158-35, de 2001" (teste unitário do gerador de texto da norma)

## 2. "Corrigir agora" preserva a remissão externa

- [x] 2.1 Escrever teste unitário que reproduz o bug: artigo de alteração com `base` vazio e uma remissão externa no texto; ao informar a norma, o HTML ainda contém `data-urn`/`lexml-remissao-externa` e o registro não fica órfão (o teste deve falhar antes da correção)
- [x] 2.2 Corrigir `atualizaReferenciaElemento` para só definir o `base` quando o artigo já tem remissão externa, sem reescrever o link; manter a geração da frase para artigo sem texto e a inserção da citação quando não há referência; verificar com o teste de 2.1 e os testes existentes do reducer

## 3. Preenchimento do `base` pela remissão única

- [x] 3.1 No reducer de `ADICIONAR_REMISSAO_EXTERNA`, preencher o `base` quando o artigo tem bloco de alteração, `base` vazio e exatamente uma entrada no registro para o `sourceUuid`; revalidar o artigo e registrar o passo no histórico. Verificar com testes unitários: remissão automática, manual, `base` já preenchido (não muda), duas remissões (não preenche), duas da mesma norma (não preenche), registro com entrada órfã
- [x] 3.2 Verificar que desfazer volta o `base` a vazio (teste de undo) e que remover a remissão depois não altera o `base`
- [x] 3.3 Verificar que o alerta "É necessário informar a norma a ser alterada" desaparece do artigo após o preenchimento (teste de validação do elemento resultante)

## 4. Aviso de divergência

Reaberto após a validação em tela: o aviso baseado no texto do estado não aparecia ao vivo (ver design D2). O que foi feito antes e permanece: a entrada `AutoFix.NORMA_ALTERADA_DIVERGENTE` e o helper `getUrnsRemissoesExternas`.

- [x] 4.1 Criar a regra pura `avaliarNormaAlteradaDivergente(base, urnsCitadas)` no modelo (WARNING com as duas normas e `fix`, `detalhe` com `autoFix` e a URN alvo) e remover a validação por texto de `conteudoValidator`. Verificar com testes unitários de cada combinação: base diferente, iguais, 0 ou 2+ remissões, sem base
- [x] 4.2 Reunir as URNs citadas no editor (links `a.lexml-remissao-externa[data-urn]` da linha + entradas do registro sem link no DOM com `textoRef` no texto; órfãs não contam) e aplicar o aviso numa cópia do elemento nos dois pontos que desenham mensagens (`atualizarQuill` e `atualizarMensagemQuill`). Extrair a reunião das entradas para função pura e testá-la (órfã, manual sem `textoRef`, remissão ainda não desenhada)
- [x] 4.3 Revalidar o artigo quando o registro muda: `ADICIONAR_REMISSAO_EXTERNA` e `REMOVER_REMISSAO_EXTERNA` emitem `ElementoValidado` do artigo com bloco e `base`; o editor dispara a validação após desenhar o link. Verificar com testes de reducer (evento emitido; ausente quando o artigo não tem bloco) e com o E2E da seção 6
- [x] 4.4 `case` em `autoFixElemento` tratado antes da guarda `hasFix`: confere a URN de `detalhe` no registro do artigo, define o `base`, registra o histórico e revalida. Verificar com teste de reducer (efeito, desfazer, URN ausente do registro não faz nada)
- [x] 4.5 Alinhar a regra de entradas órfãs do preenchimento do `base` (grupo 3) à do projeto (`textoRef` ou `data-ref-id` no texto). Verificar com teste: remissão criada antes de um desfazer do `base` e ainda sem link no texto é contada
- [x] 4.6 Confirmar que o aviso não bloqueia salvar (teste de `atualizaMensagemCritical`, já escrito) e que não aparece em `dispositivo.mensagens`

## 5. Abertura do documento

- [x] 5.1 Aplicar o aviso na abertura no mesmo ponto em que `ativarRemissoesInternas` trata a remissão inválida (o DOM só existe depois do carregamento) e verificar que o `base` nunca é alterado
- [x] 5.2 Teste unitário de abertura: documento divergente mostra o aviso e preserva o `base`; documento sem `base` e com uma remissão mantém o alerta de norma não informada; documentos coerentes (fixtures de `test/assets` com alterações) abrem sem nenhum aviso de divergência
- [x] 5.3 "Corrigir agora" do erro "informar a norma" preenche o `base` pela remissão externa única do artigo, sem abrir o diálogo; com 0 ou 2+ remissões abre o diálogo (helper `remissoesDoArtigo` compartilhado com o preenchimento automático; testes em `autoFixNormaDivergente.test.ts`)

## 6. Testes E2E (Cypress)

- [ ] 6.1 Avaliar a viabilidade à luz de `docs/guia-cypress.md` (§3 race conditions, §6 setup, §7 edição de texto, §9 âncoras) e dos specs existentes em `cypress/e2e/remissao-externa/` e `cypress/e2e/alteracao-norma/`, que já exercitam o linker real. Registrar a decisão em `design.md`; se algum cenário não for viável, propor teste de integração equivalente
- [ ] 6.2 Spec E2E em `cypress/e2e/alteracao-norma/`: digitar a frase de alteração, criar o bloco, sair da linha; verificar que o `base` é preenchido e o alerta de norma não informada some
- [ ] 6.3 Spec E2E: artigo com norma alterada diferente da norma citada mostra o aviso; "Corrigir agora" alinha a norma e o aviso some
- [ ] 6.4 Spec E2E: informar a norma por "Corrigir agora" com a remissão existente mantém o popup de ações da remissão externa ao posicionar o cursor sobre ela
- [ ] 6.5 Abrir pela UI um documento com divergência e verificar o aviso sem alteração do `base` (fixture gerada via `criarDocumentoArticulado`, não escrita à mão)

## 7. Fechamento

- [ ] 7.1 Executar a suíte completa (`npm test`) e `npm run lint`, e os specs E2E novos; registrar o resultado
- [ ] 7.2 Atualizar `openspec/specs/bloco-alteracao-norma/spec.md` via arquivamento da change e conferir `openspec validate --strict`
