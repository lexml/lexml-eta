# Proposal

## Why

Em `Proposicao`, o campo `dataUltimaModificacao` guarda a data do campo "Data" do fecho, a data de impressão escolhida pelo usuário, e não a data da última modificação. O nome engana o host. Por isso a documentação precisa avisar "apesar do nome, não é a data do último salvamento", e a classe nasce com um timestamp que o componente tem de zerar e normalizar. A issue #1034 separa as duas datas: o metadado traz a data da última modificação, e um campo próprio guarda a data de impressão.

## What Changes

- **BREAKING:** `Proposicao.dataUltimaModificacao` deixa de ser a data do campo "Data" e passa a ser o instante em que a proposição é obtida (`getProposicao()`), no mesmo formato gravado no arquivo (`xsd:dateTime` com o fuso local, ex.: `2026-11-04T10:15:30-03:00`). Ela fica no bloco de metadados padronizados, ao lado de `aplicacao` e `versaoAplicacao`.
- **BREAKING:** novo campo `Proposicao.data`, com a data do campo "Data" (`AAAA-MM-DD`). Ele vem vazio (`''`) quando o usuário mantém "Não informar" e é o que o host deve ler para a data de impressão. Hoje esse caso devolve `undefined`.
- `Proposicao.data` nasce vazio na classe, o que corresponde a "Não informar". Os pontos do componente que zeravam o timestamp padrão (documento novo, descarte do documento) deixam de ser necessários.
- O arquivo LexML não muda: `lexedit:Metadado@dataUltimaModificacao` (instante do salvamento, #997) e a data do fecho em `lexedit:Metadado@data` continuam como estão.
- A documentação da API, a nota de migração para o `lexeditweb-editor` e o `CLAUDE.md` passam a descrever as duas datas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `campo-data-documento`: a proposição obtida pelo host passa a trazer a data do campo "Data" em `data` (vazia quando "Não informar") e o instante da obtenção em `dataUltimaModificacao`.
- `modo-anexo-parecer`: os cenários de data da proposição no modo anexo de parecer passam de `dataUltimaModificacao` para `data`.

## Impact

- **Código:**
  - `src/model/proposicao/proposicao.ts` (campos `data` e `dataUltimaModificacao`);
  - `src/components/lexml-eta.component.ts` (`getProposicao`, `setProposicao`, `resetaProposicao`, `descartarDocumentoAtual`);
  - o comentário de `normalizarDataFecho` em `src/model/lexml/documento/urnUtil.ts`.
- **Testes:** `test/componente/lexml-eta/lexml-eta-data.test.ts` e `lexml-eta-anexo-parecer.test.ts`.
- **Documentação:**
  - `docs/api-componente-lexml-eta.md` (seções 4.2 e 8);
  - `docs/migracao-interface-lexml-eta.md` (nova seção **BREAKING**);
  - `CLAUDE.md`, invariante (w) e item 23.
- **Host (`lexeditweb-editor`):** precisa ler a data de impressão em `Proposicao.data`. Quem hoje lê `dataUltimaModificacao` como `AAAA-MM-DD` passa a receber um `xsd:dateTime` e não terá erro de compilação, porque o campo continua existindo com outro significado.
- **Sem mudança:** formato do arquivo LexML, `DadosLexEdit` e a propriedade `dataUltimaModificacaoDocumento`.
