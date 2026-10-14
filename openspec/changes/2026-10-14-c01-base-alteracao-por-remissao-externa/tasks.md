## 1. Número composto no nome da norma

- [x] 1.1 Corrigir `formataNumero` (`urnUtil.ts`) para números com sufixo (`2158-35` → `2.158-35`) e nunca devolver `NaN`; verificar com teste unitário cobrindo `14133`, `2158-35` e entrada não numérica
- [x] 1.2 Verificar que o texto gerado para a URN `urn:lex:br:federal:medida.provisoria:2001;2158-35` exibe "Medida Provisória nº 2.158-35, de 2001" (teste unitário do gerador de texto da norma)

## 2. "Corrigir agora" preserva a remissão externa

- [ ] 2.1 Escrever teste unitário que reproduz o bug: artigo de alteração com `base` vazio e uma remissão externa no texto; ao informar a norma, o HTML ainda contém `data-urn`/`lexml-remissao-externa` e o registro não fica órfão (o teste deve falhar antes da correção)
- [ ] 2.2 Corrigir `atualizaReferenciaElemento` para só definir o `base` quando o artigo já tem remissão externa, sem reescrever o link; manter a geração da frase para artigo sem texto e a inserção da citação quando não há referência; verificar com o teste de 2.1 e os testes existentes do reducer

## 3. Preenchimento do `base` pela remissão única

- [ ] 3.1 No reducer de `ADICIONAR_REMISSAO_EXTERNA`, preencher o `base` quando o artigo tem bloco de alteração, `base` vazio e exatamente uma entrada no registro para o `sourceUuid`; revalidar o artigo e registrar o passo no histórico. Verificar com testes unitários: remissão automática, manual, `base` já preenchido (não muda), duas remissões (não preenche), duas da mesma norma (não preenche), registro com entrada órfã
- [ ] 3.2 Verificar que desfazer volta o `base` a vazio (teste de undo) e que remover a remissão depois não altera o `base`
- [ ] 3.3 Verificar que o alerta "É necessário informar a norma a ser alterada" desaparece do artigo após o preenchimento (teste de validação do elemento resultante)

## 4. Aviso de divergência

- [ ] 4.1 Adicionar a mensagem de aviso em `AutoFix` e a validação no `conteudoValidator`: `base` definido, exatamente um `data-urn` no caput e URN diferente do `base` gera WARNING com as duas normas; nenhum aviso com 0 ou 2+ remissões, sem `base` ou normas iguais. Verificar com testes unitários de cada combinação
- [ ] 4.2 Adicionar o `case` em `autoFixElemento` que define o `base` pela norma da remissão, registra o histórico e revalida o artigo. Verificar com teste de reducer (efeito, desfazer, aviso some)
- [ ] 4.3 Confirmar que o aviso não bloqueia salvar (teste do fluxo de `getProjetoAtualizado`/serialização com o aviso ativo)

## 5. Abertura do documento

- [ ] 5.1 Verificar que ao carregar (`load`/`getElementos`) os artigos de alteração são validados com o novo aviso e que o `base` nunca é alterado; se a abertura não revalidar o artigo, incluir a mensagem no mesmo ponto das mensagens extras do carregamento
- [ ] 5.2 Teste unitário de abertura: documento divergente mostra o aviso e preserva o `base`; documento sem `base` e com uma remissão mantém o alerta de norma não informada; documentos coerentes (fixtures de `test/assets` com alterações) abrem sem nenhum aviso de divergência

## 6. Testes E2E (Cypress)

- [ ] 6.1 Avaliar a viabilidade à luz de `docs/guia-cypress.md` (§3 race conditions, §6 setup, §7 edição de texto, §9 âncoras) e dos specs existentes em `cypress/e2e/remissao-externa/` e `cypress/e2e/alteracao-norma/`, que já exercitam o linker real. Registrar a decisão em `design.md`; se algum cenário não for viável, propor teste de integração equivalente
- [ ] 6.2 Spec E2E em `cypress/e2e/alteracao-norma/`: digitar a frase de alteração, criar o bloco, sair da linha; verificar que o `base` é preenchido e o alerta de norma não informada some
- [ ] 6.3 Spec E2E: artigo com norma alterada diferente da norma citada mostra o aviso; "Corrigir agora" alinha a norma e o aviso some
- [ ] 6.4 Spec E2E: informar a norma por "Corrigir agora" com a remissão existente mantém o popup de ações da remissão externa ao posicionar o cursor sobre ela
- [ ] 6.5 Abrir pela UI um documento com divergência e verificar o aviso sem alteração do `base` (fixture gerada via `criarDocumentoArticulado`, não escrita à mão)

## 7. Fechamento

- [ ] 7.1 Executar a suíte completa (`npm test`) e `npm run lint`, e os specs E2E novos; registrar o resultado
- [ ] 7.2 Atualizar `openspec/specs/bloco-alteracao-norma/spec.md` via arquivamento da change e conferir `openspec validate --strict`
