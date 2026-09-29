## 1. Verificação e caracterização

- [x] 1.1 Verificar o caminho de colar incisos/parágrafos (`ADICIONAR_ELEMENTOS_FROM_CLIPBOARD`, fixtures de `test/doc/textos-colar/`) sobre um artigo com bloco de alteração, em documento aberto por `ABRIR_ARTICULACAO` (ex.: MPV com alteração de `test/doc/`); registrar aqui se cria filho próprio, se é recusado ou se quebra. Se quebrar por motivo independente desta regra, registrar como achado separado e decidir com o usuário antes de ampliar o escopo

> Resultado (1.1, 29/09/2026, MPV 905/2019 aberta por `ABRIR_ARTICULACAO`, artigo `art25` com bloco de alteração): colar incisos (`TEXTO_013`, com e sem posição) ou parágrafos (`TEXTO_008`) **não cria** filho próprio, mas o reducer **lança** `TypeError: Cannot read properties of undefined (reading 'pai')` (`adicionaElementosNaProposicaoFromClipboard` → `createElemento`). Controle: o mesmo colar num artigo sem bloco (`art6`) funciona normalmente. A quebra decorre do colar não prever filho próprio em artigo com bloco, ou seja, da mesma regra.
- [x] 1.2 Criar `test/model/lexml/regras/regrasArtigo-bloco-alteracao.test.ts` (ou arquivo equivalente seguindo o padrão existente de testes de regras) verificando que o artigo com bloco de alteração oferece hoje "Adicionar inciso" e "Adicionar parágrafo" (falha esperada após a correção inverter a asserção) e que o artigo sem bloco oferece ambas; e criar teste de reducer mostrando que `adicionarIncisoFilho` num artigo com bloco cria inciso próprio hoje; registrar a saída

> Resultado (1.2): testes em `test/redux/adiciona/reducer-artigo-alteracao-sem-filhos-proprios.test.ts` (padrão de `remocao-agrupador-menu-e-reducer.test.ts`: menu e reducer no mesmo arquivo, MPV 905/2019 real), já escritos com o comportamento desejado. Antes da correção: 2 falhas (menu do `art25` oferece as duas ações; `adicionarIncisoFilho` cria inciso próprio) e 4 passando (menu e inciso do `art6`; "Adicionar parágrafo" não cria parágrafo próprio; Enter cria artigo no bloco).

## 2. Correção

- [x] 2.1 Em `regrasArtigo.ts`, não oferecer `adicionarIncisoFilho` nem `adicionarParagrafoFilho` quando o artigo tem bloco de alteração (D1, D2); verificar com os testes de regras da 1.2 (artigo com bloco: ausentes; sem bloco: presentes)
- [x] 2.2 Em `adicionaElemento`, recusar criar inciso/parágrafo filho em artigo com bloco de alteração quando a ação chegar sem passar pelo menu (D3); verificar com o teste de reducer da 1.2 (estrutura inalterada)
- [x] 2.3 Colar incisos ou parágrafos sobre artigo com bloco de alteração: recusar com mensagem, devolvendo o estado sem alteração, em vez de lançar `TypeError` (decisão do usuário após a 1.1); verificar com caso de teste de colar no arquivo da 1.2 (sem exceção, sem filho próprio, com mensagem) e que o colar em artigo sem bloco continua funcionando

> Resultado (grupo 2): `regrasArtigo.ts` deixa de oferecer "Adicionar inciso"/"Adicionar parágrafo" a artigo com bloco; `adicionaElemento` e `adicionaElementosNaProposicaoFromClipboard` recusam com a mensagem `MENSAGEM_ARTIGO_ALTERACAO_SEM_FILHOS_PROPRIOS` (em `reducerUtil.ts`) em vez de criar filho próprio ou lançar `TypeError`. Teste da 1.2 ampliado com os casos de colar: 8 casos passando. Suíte unitária completa em lotes: todos os lotes passando.

## 3. Limpeza da change anterior

- [ ] 3.1 Remover de `test/redux/remissao/reducer-atualiza-remissao-mover.test.ts` o bloco "parágrafo de artigo com bloco de alteração" (um caso ativo e um `it.skip`), que monta estrutura inválida; verificar que o arquivo segue passando

## 4. E2E e regressão

- [ ] 4.1 Avaliar à luz de `docs/guia-cypress.md` um spec E2E: artigo com bloco de alteração (menu "Adicionar alteração de norma") e verificação de que o menu do artigo não oferece "Adicionar inciso" nem "Adicionar parágrafo"; se inviável, registrar a decisão aqui e manter a cobertura pelos testes de regras
- [ ] 4.2 Rodar `npm test` completo e os E2E de remissão interna (`grupo-k-mover-dispositivo`, `grupo-g-atualizacao`); verificar ausência de regressões
