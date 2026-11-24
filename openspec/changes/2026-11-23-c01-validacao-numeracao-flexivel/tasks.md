# Tasks

## 1. Modo de validação e validação estrutural

- [x] 1.1 Criar `model/lexml/numeracao/validacaoNumeracao.ts` com o tipo `'rigida' | 'flexivel'`, a normalização (ausente ou desconhecido vira `'rigida'`) e o estado de módulo (registrar, consultar, restaurar). Acrescentar `validacaoNumeracao?` em `LexmlEtaConfig`. Verificar com teste unitário da normalização.
- [x] 1.2 Em `validarDocumentoArticulado`, `lerDocumentoArticulado` e `criarDocumentoArticulado`, acrescentar a opção `validacaoNumeracao` (padrão `'rigida'`). Separar os ids de hierarquia (`lXhier`/`lXcontainersOmissis`, inclusive `Caput`, `pena` e `alteracao`) dos demais, e tolerar a repetição só dos primeiros no modo flexível (design D2). Verificar em `test/model/documento/documentoArticulado.test.ts`:
  - rígido recusa artigos repetidos com a mensagem de hoje;
  - flexível aceita artigos repetidos, inclusive caput, incisos, pena e alteração herdados;
  - flexível recusa `Remissao` com `id` repetido;
  - flexível recusa id de hierarquia igual a um id de outro elemento.
- [x] 1.3 Integração com o CLI real (`documentoArticulado.integration.ts`): um documento com artigos repetidos, salvo no modo flexível, faz a ida e volta pelo `jsonix-lexml` sem perder nenhuma ocorrência. Não validar com o XSD, porque o esquema recusa ids repetidos por decisão desta change. Verificar com `npm run test:documento-articulado:xml`.

## 2. Detecção e erro contextualizado

- [x] 2.1 Implementar `isNumeracaoRepetida` (D3) e o cálculo linear do conjunto de dispositivos com numeração repetida em `model/lexml/numeracao/`. Verificar com testes unitários dos cenários da spec `numeracao-repetida`:
  - artigos repetidos em capítulos diferentes (só o segundo);
  - incisos do artigo repetido não marcados;
  - três incisos "II" no mesmo caput (segundo e terceiro);
  - artigos repetidos em bloco de alteração herdado não marcados.
- [x] 2.2 Acrescentar `AutoFix.NUMERACAO_REPETIDA` e a mensagem ERROR em `validaNumeracaoDispositivo` e em `validaNumeracaoDispositivoAlteracao`, só no modo flexível, com `fix` conforme D4. Verificar em `test/model/numeracao/numeracao.test.ts`:
  - sem mensagem no modo rígido;
  - mensagem só na 2ª ocorrência;
  - `fix` falso para artigo de alteração e para pai "Existente";
  - a mensagem antiga do bloco de alteração permanece.

  Restaurar `'rigida'` no `afterEach`.

## 3. Passagem central, alerta e pendência

- [x] 3.1 Implementar `sincronizarNumeracaoRepetida` (D5): capturar o conjunto anterior no início de `elementoReducer`, chamar a passagem depois de `atualizaMensagemCritical`, emitir `ElementoValidado` para os dispositivos que entraram ou saíram do conjunto e incluir ou retirar o alerta crítico sem fechar, sem duplicar. Em `RESETAR_DOCUMENTO`, zerar o conjunto. Verificar com teste de reducer em `test/redux/elemento/reducer/`:
  - abrir com repetição produz o alerta e o conjunto;
  - incluir artigo (renumeração) retira o alerta e emite `ElementoValidado` para o antigo segundo "Art. 5º";
  - desfazer restaura o alerta;
  - várias ações sem correção mantêm um único alerta;
  - correção parcial mantém o alerta;
  - no modo rígido não há alerta nem conjunto.
- [x] 3.2 Incluir a pendência "Existem dispositivos com numeração repetida." em `getDocumentoArticulado` (logo depois da de justificação) e em `getPendenciasPreenchimento`, a partir do mesmo conjunto (D6). Verificar:
  - em `test/model/documento/pendencias.test.ts`, a ordem no arquivo (justificação, numeração repetida, remissões);
  - em teste de componente, a pendência coincide com o alerta e some depois da correção;
  - a pendência gravada não gera alerta ao abrir um documento sem repetição.
- [x] 3.3 Teste de reducer de robustez (risco do design): abrir, no modo flexível, um documento com artigos repetidos, com remissão interna para `art5` e situação na norma vigente, e exercitar incluir, remover, mover, desfazer, refazer e salvar. Verificar que não há exceção e que a remissão e a situação resolvem para a 1ª ocorrência (D8).

## 4. Correção automática

- [x] 4.1 Implementar o caso `AutoFix.NUMERACAO_REPETIDA` em `autoFixElemento` (D7): renumerar o grupo com `renumeraArtigos`/`renumeraFilhos`, gerar eventos e `past` no formato de `renumeraElemento.ts` e incluir `AUTO_FIX` em `ACOES_ESTRUTURAIS`. Verificar com teste de reducer:
  - os artigos 1, 1 e 2 passam a 1, 2 e 3;
  - os ids dos descendentes são recalculados;
  - uma remissão para o antigo "Art. 2º" passa a "art. 3º";
  - desfazer devolve os dois "Art. 5º" com os ids e o erro;
  - refazer corrige de novo.
- [x] 4.2 Correção em modo de revisão: verificar com teste de reducer que a correção não gera revisão `alterado` nem `alteracaoRotulo` nos dispositivos renumerados. Se gerar, aplicar a mitigação do design (renumerados em `SituacaoElementoModificada`) e manter o teste.

## 5. Componente e configuração

- [ ] 5.1 Em `novaProposicao`, `abrirDocumentoArticulado` e `alterarDadosBasicos`, ler `lexmlEtaConfig.validacaoNumeracao` ao começar, passá-lo a `lerDocumentoArticulado` e registrar o modo só depois de a leitura dar certo, antes de `inicializarEdicao` (D1). `lexml-eta-proposicao.component.ts#getDocumentoArticulado` passa o modo registrado a `criarDocumentoArticulado`. Verificar em `test/componente/lexml-eta/documentoArticulado.component.test.ts`:
  - sem configuração, a abertura de documento repetido é recusada e o documento em edição fica intacto;
  - com `'flexivel'`, a abertura e o salvamento funcionam e o arquivo mantém os ids;
  - o modelo da nova proposição com artigos repetidos é aceito no flexível;
  - uma abertura recusada não muda o modo do documento em edição;
  - salvar no rígido com dois artigos de alteração renumerados para o mesmo número propaga o erro.
- [ ] 5.2 Teste de reducer do "Corrigir agora" em dispositivo que não é artigo (`test/redux/elemento/reducer/autoFixNumeracaoRepetida.test.ts`), cobrindo o `renumeraFilhos` do pai:
  - três incisos "II" no mesmo caput do texto principal: a correção no segundo renumera para I, II e III, recalcula os ids dos alíneas/itens descendentes, retira o erro e o alerta, e desfazer devolve os três "II";
  - parágrafos repetidos de artigo "Novo" em bloco de alteração: a correção renumera os irmãos e desfazer restaura a repetição;
  - em modo de revisão, nenhum desses casos gera revisão.
- [ ] 5.3 Documentar em `docs/api-componente-lexml-eta.md`:
  - na tabela de configuração, `validacaoNumeracao`;
  - em `abrirDocumentoArticulado` e no salvamento, o comportamento do modo flexível, o XML inválido pelo esquema e a limitação das referências.

  Acrescentar ao `CLAUDE.md` um item com as invariantes (modo por documento, tolerância só a ids de hierarquia, detecção local por grupo, passagem central única, histórico da correção). Verificar por revisão dos textos.

## 6. E2E (Cypress)

- [ ] 6.1 Gerar a fixture `demo/doc/teste_numeracao_repetida.json` com `criarDocumentoArticulado(..., { validacaoNumeracao: 'flexivel' })`, a partir de uma articulação com dois "Art. 5º" (o segundo com incisos) seguidos de um "Art. 6º", sem escrever o JSON à mão. Verificar que `lerDocumentoArticulado` recusa a fixture no modo rígido e aceita no flexível.
- [ ] 6.2 Criar `cypress/e2e/documento-articulado/abertura-numeracao-repetida.cy.ts`, seguindo `docs/guia-cypress.md`: atribuir uma nova configuração com `validacaoNumeracao: 'flexivel'` ao `lexml-eta` antes de abrir por `#fileUpload` e cobrir três casos:
  - no flexível, o alerta da aba Avisos (no shadow root de `lexml-eta-alertas`) aparece, o erro aparece só no segundo "Art. 5º" e os incisos dele não têm erro;
  - "Corrigir agora" no segundo artigo renumera para 5, 6 e 7 e retira o alerta e o erro;
  - no rígido, o mesmo arquivo é recusado.

  Verificar com `npm run cy:run:local -- --spec cypress/e2e/documento-articulado/abertura-numeracao-repetida.cy.ts`.

## Workflow follow-up

- Avisar o `lexeditweb-editor`: informar `validacaoNumeracao: 'flexivel'` para ativar o modo, e o arquivo salvo nesse modo pode ter ids de dispositivo repetidos, cujo XML não valida pelo esquema.
- Arquivar a change depois da revisão.
