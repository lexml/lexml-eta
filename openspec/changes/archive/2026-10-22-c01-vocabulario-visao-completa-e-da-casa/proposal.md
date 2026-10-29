## Why

Desde a issue #1026, o vocabulário de URN é montado por casa do editor e não contém a outra casa: no editor do Senado, uma norma citada da Câmara (por exemplo, uma resolução da Câmara dos Deputados) não resolve e falha em `validaUrn`, o que impede usá-la como norma alterada ou referenciada; no editor da Câmara, o Regimento Interno do Senado, que já está nos `atalhosUrn` comuns, também não resolve pelo tipo. O que precisa ficar restrito à casa é a criação de proposições e as consultas por sigla, não a identificação de uma URN que já traz a autoridade.

## What Changes

- O vocabulário passa a ter duas visões, mescladas das mesmas definições por autoridade:
  - **visão completa**, com todas as autoridades (`federal`, `senado.federal`, `camara.deputados`, `congresso.nacional`), usada pelas consultas que partem de uma URN (tipo, sigla, autoridade, nome por extenso, preâmbulo padrão e `validaUrn`);
  - **visão da casa**, com as autoridades da casa do editor, usada pelas consultas sem autoridade (tipo pela sigla, tipos ativos e inativos, tipos de referência do substitutivo) e pela validação de sigla ativa única.
- **BREAKING (comportamento):** a URN de uma norma de autoridade da outra casa passa a resolver e a ser válida (`camara.deputados:...` no editor SF, `senado.federal:...` no editor CD).
- A criação de proposição pela sigla continua restrita à casa do editor.
- Abrir para edição um documento cuja URN tem autoridade fora da casa do editor passa a ser **recusado de forma explícita**, com mensagem própria. Antes falhava por efeito colateral do vocabulário; com a visão completa, abriria sem aviso e com a casa do documento incoerente.

Fora do escopo: abrir e editar um documento da outra casa (casa do documento, listas de parlamentares e comissões, tratamento). Fica para uma change futura, que começa pela remoção da recusa.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `vocabulario-urn`: o vocabulário deixa de ser só o da casa e passa a ter visão completa e visão da casa; a resolução por URN usa a visão completa; a abertura de documento de outra casa é recusada.

## Impact

- `src/model/lexml/documento/vocabulario/` (`index.ts`, `montarVocabulario.ts`, `consultasVocabulario.ts`).
- `src/model/lexml/documento/urnUtil.ts` (consultas por URN passam para a visão completa).
- `src/components/lexml-eta.component.ts` (recusa do documento de outra casa ao iniciar a edição).
- Testes de vocabulário e de `urnUtil` para as duas casas; teste de componente da recusa.
- `docs/requisitos/vocabulario.md` (decisão "norma de autoridade ausente fica sem resolver" e RV-01/RV-16) e o item 18 do `CLAUDE.md`.
- Host (`lexeditweb-editor`): nenhuma mudança de API; um documento de outra casa, se enviado, passa a gerar erro de inicialização explícito.
