## 1. Visões do vocabulário

- [x] 1.1 Em `montarVocabulario.ts`, declarar a lista de todas as autoridades e montar a visão completa; em `index.ts`, expor `getVocabularioCompleto()` (montada uma vez) e `getVocabularioDaCasa()` (reinicializada por `inicializarVocabulario`), removendo `getVocabulario()` (D1). Verificação: `npm run build` sem erros de tipo.
- [x] 1.2 Ajustar a validação (D3): sigla ativa única e `tiposReferenciaveis` validados em cada visão de casa; a visão completa valida só a chave duplicada e dispara a validação das duas visões de casa. Verificação: `vocabulario.mesclar.test.ts` com os cenários "Sigla duplicada entre ativos", "Sigla repetida entre casas", "Sigla repetida com inativo" e "Referência inexistente".
- [x] 1.3 Testes das visões em `vocabulario.porCasa.test.ts`: cenários "Vocabulário do Senado", "Vocabulário da Câmara", "Visão completa" e "Reatribuição da configuração" (a resolução por URN não muda com a casa), restaurando `'SF'` no `afterEach`. Verificação: `npm test` com os testes de vocabulário verdes.

## 2. Distribuição das consultas

- [ ] 2.1 Em `urnUtil.ts`, passar `getAutoridade`, `getTipo` (e, por consequência, `getSigla`/`getTipoDocumentoUrn`), `getPreambuloPadrao` e `getNomeExtensoComDataExtenso` (`atalhosUrn`) para a visão completa; em `consultasVocabulario.ts`, passar todas as consultas para a visão da casa (D2). Verificação: `npm run build` e busca sem ocorrências de `getVocabulario()`.
- [ ] 2.2 Testes em `vocabulario.lookup.test.ts`, para `SF` e `CD`: "Norma da outra casa no editor do Senado" (RICD), "Norma da outra casa no editor da Câmara" (RISF), "Tipo da outra casa" (PL da Câmara no SF resolve e `validaUrn` é verdadeiro), mantendo "Sem fallback para outra autoridade" e "Tipo sem sigla e autoridade que não o declara". Verificação: `npm test`.
- [ ] 2.3 Testes em `vocabulario.consultas.test.ts` confirmando que as consultas sem autoridade seguem restritas: "Sigla de outra casa" (`PRC` no SF é vazio), tipos ativos de `SF` sem tipo da Câmara e `getTiposReferenciaveis` de `substitutivo;sbt` em `CD` sem tipos do Senado. Verificação: `npm test`.

## 3. Recusa de documento de outra casa

- [ ] 3.1 Criar em `urnUtil.ts` a verificação pura da autoridade da URN contra a visão da casa, lançando `Error` com a mensagem de documento de outra casa (D4), e testá-la em `vocabulario.lookup.test.ts` (ou arquivo de `urnUtil`) para `SF` e `CD`, incluindo `federal` (MPV) e `congresso.nacional` (PLV) aceitos. Verificação: `npm test`.
- [ ] 3.2 Chamar a verificação em `lerDocumentoArticulado` (`documentoArticulado.ts`), depois da validação de formato. Verificação: teste unitário de `lerDocumentoArticulado` com URN `camara.deputados` no `SF` lançando a mensagem.
- [ ] 3.3 Chamar a verificação no início de `LexmlEtaComponent.inicializarEdicao`, antes de qualquer atribuição, só para URN recebida de fora (arquivo, `params.urn`, `proposicao.urn`). Verificação: teste de componente (`test/componente/lexml-eta/vocabularioCasaEditor.component.test.ts`) — URN da outra casa rejeita a promise com a mensagem e não altera `projetoNorma`; proposição nova pela sigla e MPV/PLV em `CD` iniciam normalmente.
- [ ] 3.4 E2E Cypress (viável à luz de `docs/guia-cypress.md`, no padrão de `cypress/e2e/documento-articulado/abertura-*.cy.ts`): abrir pelo `#fileUpload` um documento lido de uma fixture existente com a URN trocada em memória para `camara.deputados` (sem fixture nova), com `window.alert` interceptado; verificar a mensagem de documento de outra casa e que o documento anterior continua no editor. A norma da outra casa (seção 2) fica coberta pelos testes unitários, sem E2E: o risco é de resolução de vocabulário, sem comportamento de tela próprio. Verificação: `npm run cy:run:local` com o novo spec verde.

## 4. Documentação

- [ ] 4.1 Atualizar `docs/requisitos/vocabulario.md` (§3.1, §4, RV-01, RV-16, decisões da §6 — a norma de autoridade da outra casa passa a resolver; documento de outra casa recusado e abertura fora do escopo), o item 18 do `CLAUDE.md` (duas visões, recusa e aviso ao `lexeditweb-editor`) e `docs/api-componente-lexml-eta.md` (§4.4 e a resolução da URN em `inicializarEdicao`). Verificação: leitura cruzada com `specs/vocabulario-urn/spec.md` da change.

## 5. Integração

- [ ] 5.1 Rodar `npm test` completo e `npm run lint`. Verificação: suíte e lint verdes.
