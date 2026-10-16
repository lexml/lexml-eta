# Proposal

## Why

A aba de autoria oferece os campos "Quantidade de assinaturas adicionais de Senadores" e "... de Deputados Federais", que não fazem parte do formato de arquivo do LexEdit (nem da especificação, nem do `lexedit.xsd`). A demanda (issue `lexml/lexml-eta#986`) é retirá-los da interface e das classes de domínio.

## What Changes

- Remover da aba de autoria os dois campos numéricos de quantidade de assinaturas adicionais (Senadores e Deputados Federais), com seus tratadores e o template correspondente.
- **BREAKING (API pública)**: remover `quantidadeAssinaturasAdicionaisSenadores` e `quantidadeAssinaturasAdicionaisDeputados` da classe `Autoria` (`Proposicao.autoria`). Quem consome `getProposicao()` ou monta `LexmlEtaParametrosEdicao.proposicao` deixa de ver/enviar esses campos; valores presentes em dados antigos são ignorados.
- Manter a opção "Imprimir partido e UF para os signatários", que reaproveita a classe CSS `assinaturas-adicionais` apenas para layout.
- Atualizar as specs de salvar e abrir (que mencionavam a quantidade apenas para dizer que não é gravada/volta ao padrão), a documentação da API e os fixtures/testes que citam os campos.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `salvar-documento-articulado`: o requisito "Serialização da autoria de parlamentares" deixa de citar a quantidade de assinaturas adicionais, que deixa de existir.
- `abrir-documento-articulado`: o requisito "Recuperação da autoria de parlamentares ao abrir" deixa de citar a quantidade de assinaturas adicionais, que deixa de existir.

## Impact

- Código: `src/components/autoria/autoria.component.ts`, `src/model/proposicao/proposicao.ts`, `src/assets/css/autoria.css.ts` (avaliar se algum seletor fica sem uso).
- Testes: `test/model/documento/autoriaParlamentar.test.ts` (cenário "assinaturas adicionais ficam em 0"), `test/assets/altera_norma_trava_editor.{ts,json}`.
- Docs: `docs/api-componente-lexml-eta.md` (modelo `Autoria` e a armadilha conhecida) e `CLAUDE.md` (menção a assinaturas adicionais no item 13).
- Coordenação cross-repo: o host (`lexeditweb-editor`) pode ter esses campos em DTOs/JSON de `Proposicao`; confirmar antes de publicar uma versão com esta mudança.
