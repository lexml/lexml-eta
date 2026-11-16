# Tasks

## 1. Lista de siglas da nova proposição (só ativas)

- [x] 1.1 `getSiglasNovaProposicao` filtra `ativo`; ajustar os testes de `modulosNovaProposicao.test.ts` (lista do SF sem PLS/PLC/PDS e sem inativos)
- [x] 1.2 Remover `siglaInativaSelecionada`, o aviso `np-sigla-inativa` e o texto correspondente de `nova-proposicao.component.ts`; remover/ajustar os testes do alerta
- [x] 1.3 Verificar no componente que a ordenação restante (só ativos) e o destaque em cinza não são mais usados nessa lista

## 2. *Distinct* por sigla nas listas de referenciada e de outra proposição

- [x] 2.1 Aplicar *distinct* por sigla (mantendo o primeiro após `ordenar`) em `getSiglasProposicaoReferenciada` e `getSiglasOutraProposicao`
- [x] 2.2 Testes de unidade: PLS e PLC uma única vez nas duas listas no `SF`; ativas antes das inativas; MPV presente na lista de outra proposição
- [x] 2.3 Sem teste novo de blur: com o *distinct* a sigla digitada casa com exatamente um item, e `aoPerderFoco` (já coberto) a seleciona; a unicidade está garantida pelos testes de 2.2 e pelo E2E 5.1

## 3. Atributo `complementar` e URN de PLS/PLC

- [x] 3.1 `consultar` lê `complementar` (`=== true`, padrão `false`) e o guarda na verificação da proposição referenciada; apagar junto com a ementa quando sigla, número ou ano mudam
- [x] 3.2 `resolverTipoComplementar` (aplicado em `dados`) resolve o tipo irmão (mesma autoridade e sigla) por `complementar`; ignorar o atributo em sigla sem irmão
- [x] 3.3 Testes de unidade de `montaUrnNovaProposicao`: PLS/PLC complementar, ordinário (sem atributo), PL com `complementar: true`, substitutivo do `SF` com `@apresentacao.substitutivo`
- [x] 3.4 Teste de componente: verificação `200` com `complementar: true` em PLS leva à URN `projeto.lei.complementar` no resultado; alterar o número descarta o valor

## 4. Abertura de documento de sigla inativa (regressão)

- [x] 4.1 Teste de unidade/integração: abrir e editar documento de URN `...projeto.lei;pls...` e `...projeto.lei.complementar;pls...` continua funcionando (sem mudar código; se falhar, registrar e tratar)

## 5. E2E (Cypress)

- [x] 5.1 Estender `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts` (consultar `docs/guia-cypress.md`): lista da nova proposição sem PLS/PLC; substitutivo no `SF` com PLS uma só vez e verificação com `complementar: true` produzindo o resultado com `projeto.lei.complementar`; sem alerta de sigla inativa. Se algum cenário não for viável, registrar a decisão e cobrir por teste de componente

## 6. Documentação e demo

- [x] 6.1 Atualizar o mock `/demo-api/proposicoes/...` (`demo/`, incluindo `demo/server/handlers.test.mjs`) para devolver `complementar` em um PLS de exemplo
- [x] 6.2 Atualizar `docs/requisitos/componente-nova-proposicao.md` e `docs/api-componente-lexml-eta.md` (campo `complementar` opcional, padrão `false`; listas sem sigla repetida; nova proposição só com ativas)
- [x] 6.3 Registrar em `docs/migracao-interface-lexml-eta.md` o ponto de coordenação com o `lexeditweb-editor` (campo `complementar` na verificação)
- [x] 6.4 Atualizar o `CLAUDE.md` do projeto se a mudança trouxer invariante nova (ex.: a sigla não identifica o tipo; a URN depende de `complementar`)

## 7. Fechamento

- [x] 7.1 Rodar `npm test` e os specs Cypress de nova proposição; lint só nos arquivos alterados
- [x] 7.2 Validar a change (`openspec validate`) e arquivar com sincronização das specs
