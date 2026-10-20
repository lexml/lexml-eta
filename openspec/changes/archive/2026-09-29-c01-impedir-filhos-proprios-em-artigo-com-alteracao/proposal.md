## Why

Pela regra do LexML (confirmada com especialista em 28/09/2026), um artigo de alteração — aquele cujo caput traz um bloco de alteração de norma — não pode ter incisos nem parágrafos próprios: seu único conteúdo subordinado é o bloco de alteração. O editor, porém, oferece "Adicionar inciso" no menu desse artigo e, com ela, cria um inciso próprio no caput — uma estrutura inválida que depois quebra outras ações (ao mover, o inciso some do editor e fica com id desatualizado; ao adicionar outro artigo, as linhas aparecem fora de ordem). Além disso, "Adicionar parágrafo" no mesmo menu não cria um parágrafo, e sim um artigo dentro do bloco, o que engana o usuário.

## What Changes

- O menu de um artigo com bloco de alteração deixa de oferecer "Adicionar inciso" e "Adicionar parágrafo".
- Nenhuma ação do editor passa a criar inciso ou parágrafo próprio em artigo com bloco de alteração; caminhos além do menu (ex.: colar) são verificados e, se criarem a estrutura, também são fechados.
- Os casos de teste da change `2026-09-23-c01-atualizar-remissao-ao-mover-dispositivo` que montam parágrafo próprio em artigo com bloco de alteração são removidos, por testarem uma estrutura inválida.

## Capabilities

### New Capabilities

- `bloco-alteracao-norma`: regras estruturais do artigo de alteração de norma (bloco de alteração e o que o artigo pode conter).

### Modified Capabilities

(nenhuma)

## Impact

- **Código:** regras de ações do artigo (`src/model/lexml/regras/regrasArtigo.ts`); eventualmente reducers de colar, conforme a verificação.
- **Sem alteração:** as funções de percurso em `hierarquiaUtil.ts` que visitam só o bloco quando o artigo tem alteração (`getDispositivo`, `buildListaDispositivos`, `getDispositivoByUuid2`) — elas já codificam esta regra.
- **Testes:** unitários das ações disponíveis e do reducer; remoção de casos inválidos em `test/redux/remissao/reducer-atualiza-remissao-mover.test.ts`; E2E avaliado na tasks.
- **Documentos existentes:** o LexML não produz essa estrutura e nenhum documento do corpus de testes a contém (0 de 166 artigos com bloco de alteração); não há migração.
