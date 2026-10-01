## Why

A autoria da proposição não é gravada no `documento-articulado.json`: ao reabrir o arquivo, os parlamentares escolhidos se perdem e voltam à autoria padrão do host, e o documento LexML salvo não traz a representação textual `AssinaturaTexto` prevista pelo padrão. É o tíquete 4 do roteiro de `docs/extensao-formato-lexml/issues.md` (issue #990), especificado em `docs/extensao-formato-lexml/04-assinaturas.md` e na fixture `scripts/fixtures-lexedit/04-autoria-parlamentar.xml`. Segue o padrão por grupo de metadados do LexEdit (item 13 do `CLAUDE.md`).

## What Changes

- Ao salvar, o documento passa a conter `lexedit:Autoria` com `tipo='Parlamentar'`, `imprimirPartidoUF` e um `lexedit:Parlamentar` para cada parlamentar incluído, com identificação, nome, sexo, partido, UF, casa legislativa e cargo.
- Sem nenhum parlamentar identificado, a autoria não é gravada, porque o esquema exige ao menos um parlamentar.
- Ao salvar, o documento passa a conter em `ParteFinal` um `AssinaturaTexto` por parlamentar, depois do `LocalDataFecho`, com três parágrafos. O primeiro traz o tratamento e o nome em negrito (Senador/Senadora para o Senado, Deputado/Deputada para a Câmara, conforme o sexo). O segundo traz `(PARTIDO - UF)`, só quando a impressão de partido e UF estiver marcada. O terceiro traz o cargo, só quando houver cargo.
- Ao abrir, a autoria lida substitui a autoria padrão, com os dados de cada parlamentar tal como estão no arquivo. Sem autoria de parlamentar no arquivo, continua valendo a autoria padrão do host.
- No modo anexo de parecer, nem a autoria nem as assinaturas são gravadas.
- O teste de integração com o CLI real passa a cobrir a ida e volta de `lexedit:Autoria` e de `AssinaturaTexto`.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `salvar-documento-articulado`: passa a serializar a autoria de parlamentares, estruturada e em texto.
- `abrir-documento-articulado`: passa a recuperar a autoria de parlamentares.

## Impact

- Código: `src/model/lexml/documento/documentoArticulado.ts`, `conversor/buildJsonixFromProjetoNorma.ts`, `conversor/buildProjetoNormaFromJsonix.ts` e `src/components/lexml-eta.component.ts`.
- API: `DadosLexEdit` ganha `autoria`; `criarDocumentoArticulado` não muda de assinatura.
- Testes: unitários, de componente, `test/integracao/documentoArticulado.integration.ts` (CLI `jsonix-lexml-win.exe` do `lexeditweb-editor`) e um novo spec Cypress de abertura com fixture em `demo/doc/`.
- Fora do escopo: autoria por comissão (`ColegiadoAutor`), deixada para uma issue futura; quantidade de assinaturas adicionais de senadores e deputados, que não consta da especificação nem do `lexedit.xsd`, volta a 0 ao abrir o arquivo e não gera `AssinaturaTexto`; leitura do texto de `AssinaturaTexto` ao abrir.
