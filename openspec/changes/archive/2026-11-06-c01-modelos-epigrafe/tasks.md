# Tasks

## 1. Modelos de epígrafe no vocabulário

- [x] 1.1 Acrescentar `ModeloEpigrafeItem`, `VocabularioAutoridade.modelosEpigrafe`, `TipoDocumentoItem.modeloEpigrafe`/`modeloEpigrafeSubstitutivo` e `Vocabulario.modelosEpigrafe` (carimbado com a autoridade) em `tiposVocabulario.ts`/`mesclarVocabulario.ts`; verificar com `npx tsc` sem erros.
- [x] 1.2 Validar na mesclagem o código duplicado por autoridade e o código inexistente na autoridade do tipo, com erro descritivo; verificar com novos casos em `test/model/documento/vocabulario.mesclar.test.ts` (duplicado, inexistente, modelo de outra autoridade não serve).
- [x] 1.3 Declarar os modelos iniciais e as associações (Senado: todos os tipos com `aceita substitutivo` → `modeloEpigrafeSubstitutivo: 'substitutivo'`; Câmara: SBT → `substitutivo`, PEP → `subemenda.substitutiva`; Congresso: PLV → `plv`), com os textos dos modelos copiados literalmente da issue #1053; verificar com testes de consulta à visão completa que cubram os cenários de "Modelos de epígrafe iniciais" (inclusive "Demais tipos").
- [x] 1.4 Documentar os modelos e os novos atributos em `docs/requisitos/vocabulario.md`; verificar por leitura que a tabela de atributos do tipo e a lista de modelos estão coerentes com os dados.

## 2. Serviço `montaEpigrafe`

- [x] 2.1 Criar `src/model/lexml/documento/epigrafe.ts` com `montaEpigrafe(urn, urnDocumentoReferenciado?, sufixo?)` e `MODELO_EPIGRAFE_PADRAO` (D2: seleção do modelo, placeholders da URN e do referenciado, preposição pelo gênero, milhar, número provisório com 7 espaços, ano provisório vazio, codificação XML de todo valor substituído, placeholder desconhecido mantido); verificar com `test/model/documento/epigrafe.test.ts` cobrindo todos os cenários da spec `epigrafe-proposicao` (substitutivo SF com e sem sufixo, substitutivo e subemenda da CD, PLV, padrão, PL do SF não substitutivo, tipo não resolvido, sem referenciado, escape do sufixo e da descrição, `<br/>` do modelo preservado, independência da casa do editor).
- [x] 2.2 Exportar `montaEpigrafe` em `src/index.ts` e acrescentar a exportação aos testes de ponto de entrada (`test/integracao/registros-entrypoint.test.ts`) e à allowlist de `scripts/validate-package.mjs`, se ela listar exports; verificar com o teste e com `npm run prepublish`.
- [x] 2.3 Documentar `montaEpigrafe` em `docs/api-componente-lexml-eta.md` (assinatura, placeholders, sufixo, possível `<br/>` no resultado) e remover a nota "Enquanto o serviço de epígrafe (#1053) não existe…"; verificar por leitura.

## 3. Nova proposição usa o serviço

- [x] 3.1 Em `nova-proposicao.component.ts#concluir`, trocar `montaEpigrafePadrao` por `montaEpigrafe(urn, urnDocumentoReferenciado, sufixo)`, com sufixo `- PLEN`/`- <comissão>` no SF e nenhum na CD; remover `epigrafePadrao.ts` e o seu teste em `modulosNovaProposicao.test.ts`; verificar com casos em `novaProposicao.component.test.ts` para os cenários de sufixo (SF Plenário, SF Comissão, CD) e de PL sem modelo (7 espaços).

## 4. Quebra de linha (`br`) só na epígrafe — conversão

- [x] 4.1 Confirmar a forma Jsonix do `br` com o `tojson` do CLI real (`C:/jsonix-lexml-win/desenv`) sobre um XML com `<Epigrafe>…<br/>…</Epigrafe>` e registrar o formato no `design.md` (D4); verificar com o JSON resultante anotado.
- [x] 4.2 Criar `conversor/epigrafe.ts` com `montaConteudoEpigrafe(texto)` e `lerConteudoEpigrafe(content)` (D4), sem alterar `montaTag` nem `parseHTMLTags`; verificar com testes unitários de ida e volta (`br` entre trechos, `br` com `b`/`i`, entidades `&amp;` sem reescape, epígrafe sem `br` idêntica ao comportamento atual).
- [x] 4.3 Usar o conversor em `montaDocumentoNovaProposicao`, `getParteInicial`/`buildTextoEpigrafeFromDocument` e `montaParteInicial`; verificar com `montaDocumentoNovaProposicao.test.ts` (epígrafe com `<br/>` gera o elemento `br`) e com um teste de ida e volta do documento (salvar → abrir preserva a quebra; ementa e dispositivos inalterados).
- [x] 4.4 Acrescentar à integração com o CLI real (`documentoArticulado.integration.ts`) um cenário de epígrafe com `br` (`toxml` + `tojson`, ida e volta validada com o XSD); verificar com `npm run test:documento-articulado:xml`.

## 5. Quebra de linha (`br`) só na epígrafe — exibição

- [x] 5.1 Criar e registrar o blot `EtaBlotQuebraLinha` em `src/util/eta-quill/` e o CSS da quebra, e converter `<br>` para o blot só na linha da epígrafe em `createElemento` (D5), mantendo o `texto` do dispositivo com `<br/>`; verificar com teste de componente que monta o editor com epígrafe com `br` e confere que a linha da epígrafe contém o blot e que a sua altura corresponde a duas linhas (se o embed falhar, aplicar a alternativa do D5 decidida no mesmo teste).
- [x] 5.2 Verificar que a navegação do cursor não é afetada pela epígrafe com quebra; verificar rodando `navegacaoCursor.component.test.ts` com um caso extra de epígrafe com `br` (↑ no início da ementa não entra na epígrafe).

## 6. Verificação ponta a ponta

- [x] 6.1 E2E Cypress (viável: `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts` já cria PLV pela MPV 1089/2021 do backend simulado e captura o arquivo salvo por `URL.createObjectURL`): novo caso que cria o PLV, confere a epígrafe exibida em duas linhas (`(Medida Provisória nº 1.089, de 2021)` na segunda) e, no arquivo salvo, a `epigrafe` com o elemento `br`; e um caso de substitutivo do SF com destino Comissão conferindo o sufixo `- <comissão>`; verificar com `npm run cy:run:local -- --spec cypress/e2e/nova-proposicao/nova-proposicao.cy.ts`.
- [x] 6.2 Rodar `npm test` completo (com o servidor parado) e o Cypress de `documento-articulado/*`; verificar que só falham os casos já conhecidos (TODO: `abertura-pena`, grupos de remissão interna).
- [x] 6.3 Registrar no `CLAUDE.md` (item novo) o serviço, o conversor dedicado da epígrafe, o blot de quebra e a coordenação com o `lexeditweb-editor` (`montaEpigrafe` disponível; epígrafe pode trazer `<br/>`); verificar por leitura.
