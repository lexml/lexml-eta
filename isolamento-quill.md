# Plano de conclusão — isolamento do Quill no `lexml-eta`

## Objetivo e critério de aceite

Fazer com que a biblioteca use uma cópia privada do `quill/dist/quill` em desenvolvimento, testes e distribuição. Nenhum código da biblioteca deve depender de `window.Quill`, do import global de Quill, ou alterar o registro do Quill carregado pela aplicação hospedeira. A única fronteira de acesso ao runtime deve ser `src/internal/quill/private-quill.ts`.

O desenho de referência é o dos commits `d512a96f` e `3e0c944e` de `../lexml-emenda`. A infraestrutura já trazida ao ETA (dependências, Rollup, TypeScript, servidores de desenvolvimento/teste, `private-quill.mjs`, `quill1-table` e `src/internal/quill`) corresponde àquela implementação; portanto, o trabalho restante é adaptar os consumidores e a cobertura ao comportamento específico do ETA.

## Estado encontrado

- `src/internal/quill/private-quill.ts`, `quill-types.ts` e `configure-private-quill.ts` já existem e são iguais aos equivalentes do Emenda.
- `src/index.ts` ainda carrega `quill/dist/quill` e registra módulos no Quill global.
- O registro ainda está distribuído entre `EtaQuill.configurar()`, `EditorTextoRicoComponent`, módulos de revisão e nota de rodapé, e a modal de nota de rodapé. Isso permite que o Quill da aplicação seja alterado.
- Há consumidores do global `Quill` no núcleo `src/util/eta-quill`, nos componentes de texto rico, em `editor.component.ts` e no conversor `buildProjetoNormaFromJsonix.ts`.
- `src/typings.d.ts` ainda declara os tipos globais legados (`Quill`, `DeltaStatic`, `RangeStatic`, `Sources` etc.). A interface tipada privada já está disponível em `quill-types.ts`.
- Ainda não há no ETA os cinco testes de integração e o teste de distribuição presentes no Emenda, nem o script `test:bundle-isolation`.

## Plano de implementação

1. Consolidar a inicialização no entrypoint.
   - Em `src/index.ts`, remover o import com efeito colateral de `quill/dist/quill` e os três `Quill.register` globais.
   - Importar e executar `configurePrivateQuill()` uma única vez no carregamento da biblioteca, como no Emenda. Confirmar que todos os componentes públicos do ETA continuam sendo exportados sem mudanças funcionais.

2. Tornar `private-quill.ts` a única referência ao runtime.
   - Substituir cada uso do identificador global `Quill` por um import de `src/internal/quill/private-quill.ts`; não introduzir imports diretos de `quill` ou `quill/dist/quill` fora desse arquivo e dos testes que simulam a aplicação.
   - Migrar o núcleo `src/util/eta-quill/` (`eta-quill.ts`, buffer, keyboard, clipboard, container, blot e blot de omissis). Em particular, fazer `EtaQuill` estender `PrivateQuill`, delegar `find`, `sources` e os imports padrão ao privado e preservar o redirecionamento de `modules/keyboard` e `modules/clipboard` para `EtaKeyboard` e `EtaClipboard`.
   - Migrar `src/components/editor/editor.component.ts`, todos os consumidores em `src/components/editor-texto-rico/` e `src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix.ts`. O Quill temporário usado para normalizar HTML no conversor também deve ser `PrivateQuill`.
   - Fazer uma varredura final para garantir que, em `src`, `quill/dist/quill` só apareça em `private-quill.ts` e que não reste `window.Quill`, `new Quill`, `Quill.import`, `Quill.register` ou tipos globais como dependências da biblioteca.

3. Centralizar e revisar o registro específico do ETA.
   - Remover `EtaQuill.configurar()` e as chamadas de registro feitas durante a criação/uso de editores, modais e módulos. A configuração não deve depender da ordem de abertura de um editor.
   - Manter `configurePrivateQuill()` idempotente e conferir sua lista contra a configuração atual do ETA: módulos de aspas curvas, revisão, nota de rodapé, tabela, teclado/clipboard ETA e de revisão; blots e attributors próprios do ETA (incluindo contêineres esquerdo/direito, revisão, menus e tabela); formatos de estilo, indentação, margem; ícones e a troca de tags de negrito/itálico para `b`/`i`.
   - Remover os auto-registros de `moduloRevisao.ts` e `moduloNotaRodape.ts`, pois seus módulos, blots e formatos passarão a ser registrados exclusivamente por `configurePrivateQuill()`. Validar especialmente os fluxos de revisão, nota de rodapé e tabela, que antes restauravam módulos no registro global.

4. Trocar a tipagem global pela fronteira interna.
   - Importar de `quill-types.ts` os tipos usados por cada consumidor (`QuillOptions`, `QuillRange`, `QuillSource`, `QuillDelta`, `QuillDeltaOperation` e os handlers de eventos).
   - Usar `InstanceType<typeof PrivateQuill>` onde for necessário expor uma instância sem ampliar a API pública. Manter casts localizados apenas onde a API de um componente não possa ser expressa com a interface privada.
   - Após a migração, remover de `src/typings.d.ts` as declarações globais do Quill que se tornarem obsoletas; manter somente declarações que ainda descrevam dependências não relacionadas ao Quill. Rodar `tsc` para descobrir lacunas reais na interface `QuillRuntime` e completar `quill-types.ts` de forma mínima, sem voltar a usar `any` global.

5. Portar e adaptar os testes de isolamento.
   - Criar `test/integracao/private-quill.test.ts` para assegurar que Quill, Parchment e Delta exportados vêm da mesma cópia privada e permitem criar um editor funcional.
   - Criar `test/integracao/quill-registro-entrypoint.test.ts` para provar que importar implementações não registra nada e que importar o entrypoint registra os módulos somente no registro privado.
   - Criar `test/integracao/quill-registry-isolado-dev.test.ts` e `test/integracao/quill-isolamento-definitivo.test.ts`: carregar `quill/dist/quill` como Quill da aplicação, registrar módulos/formats conflitantes nele e verificar que os dois registries e seus módulos padrão permanecem independentes, inclusive com editores ricos e estruturado criados/destruídos simultaneamente.
   - Criar `test/integracao/eta-quill-privado.test.ts` e adaptá-lo às classes exclusivas do ETA. Cobrir herança dos blots/containers, `EtaQuill`, buffer e módulos próprios; repetição idempotente de `configurePrivateQuill()`; e conversão de conteúdo pelo buffer privado.
   - Criar `test/distribuicao/quill-bundle-isolado.test.js`, acrescentar `test:bundle-isolation` ao `package.json` e verificar, depois de `prepublish`, que importar `dist/index.js` não substitui `window.Quill`, não altera seu registry e não registra os módulos ETA no Quill da aplicação.

6. Verificar o resultado em todas as camadas.
   - Executar `npm run build` e corrigir erros de tipos/imports.
   - Executar os novos testes de integração pelo Web Test Runner e a suíte existente com `npm test`.
   - Executar `npm run prepublish` seguido de `npm run test:bundle-isolation`; confirmar que as validações do Rollup encontram a cópia privada no bundle, não externalizam Quill e não expõem `window.Quill`/`globalThis.Quill`.
   - Fazer uma checagem estática final (`rg`) dos imports e registros e uma verificação manual de editor estruturado, editor de texto rico, revisão, nota de rodapé e tabela em desenvolvimento.

## Ordem sugerida

Implementar as etapas 1 a 4 em uma única mudança coerente, compilar, depois portar os testes da etapa 5 e rodar a verificação da etapa 6. Os testes não devem ser copiados cegamente: os nomes de elementos, o entrypoint e o conjunto de blots do ETA precisam permanecer os do ETA, embora a estratégia de isolamento seja a mesma do Emenda.
