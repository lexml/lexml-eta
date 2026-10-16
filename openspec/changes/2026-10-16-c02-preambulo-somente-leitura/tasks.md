# Tasks

## 1. Vocabulário, tipo e regras

- [x] 1.1 Adicionar `preambulosPadrao` ao `VOCABULARIO`, indexado pelo tipo da URN sem o `;sigla` (`projeto.lei`, `projeto.lei.complementar`, `projeto.lei.conversao`, `projeto.decreto.legislativo`, `proposta.emenda.constitucional`, `medida.provisoria`) e, para `projeto.resolucao`, também pela autoridade (`senado.federal`, `camara.deputados`, `congresso.nacional`), e criar `getPreambuloPadrao(urn)` em `urnUtil.ts`; verificar com teste unitário uma URN de cada tipo, siglas diferentes no mesmo tipo (`;pl` e `;pls`) com o mesmo texto, as três autoridades de `projeto.resolucao`, autoridade desconhecida e tipo sem texto (`undefined`)
- [x] 1.2 Adicionar o tipo `Preambulo` em `tipoDispositivo.ts`, `isPreambulo` em `tipo.ts`, `PreambuloLexml` na factory e `RegrasPreambulo` sem ações possíveis; verificar com teste unitário que `getAcoesPossiveis`, `getAcaoPossivelTab` e `getAcaoPossivelShiftTab` não retornam ação
- [x] 1.3 Executar o lint e a compilação (`npm run lint`, `npm run build`) e verificar que passam

## 2. Carga e serialização

- [ ] 2.1 Alterar `ParteInicial.preambulo` para `Dispositivo` e criar `buildDispositivoPreambulo` (bloqueado, id `preambulo`, rótulo vazio, `pai` na articulação), no mesmo molde de `buildDispositivoEmenta`, mantendo o HTML com `<p>` de preâmbulo com vários parágrafos
- [ ] 2.2 Aplicar o texto padrão em `buildProjetoNormaFromJsonix` quando o preâmbulo estiver vazio e o tipo tiver padrão; não criar o dispositivo quando continuar vazio; incluir o preâmbulo em `ajustarTextosParaQuill`; verificar com testes unitários: padrão por tipo, preâmbulo preenchido prevalece, vazio sem padrão, norma com e sem preâmbulo
- [ ] 2.3 Verificar a ida e volta em `buildJsonixFromProjetoNorma`: texto padrão gravado, preâmbulo com dois parágrafos preservado, preâmbulo ausente gravado vazio; ajustar apenas se o teste falhar
- [ ] 2.4 Executar os testes de `test/model/documento` e verificar que passam, inclusive `fluxoAbertura.test.ts`

## 3. Estado e reducers

- [ ] 3.1 Criar `hasPreambulo` e `getUltimoDispositivoDaParteInicial` em `hierarquiaUtil.ts`, resolver o id `'preambulo'` em `buscaDispositivoById` e incluir o preâmbulo em `getElementos`, logo depois da ementa; verificar com teste unitário da ordem dos elementos
- [ ] 3.2 Substituir a ementa por `getUltimoDispositivoDaParteInicial` onde ela é referência de posição (`ajustaReferencia`, `elementoUtil`, `agrupaElemento`, `removeElemento`, `undoRedoReducerUtil`, `paginacaoUtil`, `navegaEntreDispositivosAlterados`); verificar com testes de reducer: adicionar artigo e agrupador a partir da ementa, remover o primeiro agrupador, desfazer e refazer, em documentos com e sem preâmbulo
- [ ] 3.3 Impedir avisos de validação do preâmbulo em `conteudoValidator`, excluí-lo dos diálogos de remissão e de `inicializaRemissoesExternasAoAbrir`; verificar com testes unitários
- [ ] 3.4 Executar `npm test` e corrigir os testes que contavam elementos de documentos que agora têm preâmbulo, verificando que a suíte passa

## 4. Interface do editor

- [ ] 4.1 Tratar `Preambulo` como a ementa em `eta-container-table.ts` (classe CSS), `eta-container-td-esquerdo.ts` (sem recuo), no CSS do editor e nos desvios `'Ementa'` de `editor.component.ts`; verificar visualmente na demonstração (`npm start`) a linha bloqueada entre a ementa e o primeiro artigo
- [ ] 4.2 Verificar manualmente na demonstração: tentar digitar, apagar, colar e formatar no preâmbulo; abrir o menu de ações; adicionar artigo e agrupador a partir da ementa; paginar um documento grande; confirmar que o cursor inicial continua na ementa

## 5. Teste E2E (Cypress)

- [ ] 5.1 Avaliado à luz de `docs/guia-cypress.md` e viável: o padrão de `abertura-autoria-parlamentar.cy.ts` e `abertura-opcoes-impressao.cy.ts` (fixture em `demo/doc/` gerada por `criarDocumentoArticulado`, aberta por `#fileUpload`) cobre o fluxo. Gerar as fixtures (PL com preâmbulo vazio e documento com preâmbulo diferente do padrão) e criar `cypress/e2e/documento-articulado/abertura-preambulo.cy.ts` com: preâmbulo padrão exibido entre a ementa e o Art. 1º; texto digitado não altera o preâmbulo; adicionar artigo depois da ementa insere depois do preâmbulo; preâmbulo preenchido prevalece. Verificar com `npm run cy:run:local`

## 6. Fechamento

- [ ] 6.1 Registrar no `CLAUDE.md` os invariantes novos (preâmbulo como dispositivo bloqueado, função da última linha da parte inicial, texto padrão por tipo da URN com autoridade opcional) e as pendências (concordância da MPV, tipos sem texto padrão), e verificar que o texto está coerente com o código entregue

## Workflow follow-up

- Arquivar a change depois da revisão, para que o delta `preambulo-proposicao` entre nas specs principais.
- Coordenar com o `lexeditweb-editor` caso o host dependa do formato do preâmbulo exibido ao abrir arquivos.
