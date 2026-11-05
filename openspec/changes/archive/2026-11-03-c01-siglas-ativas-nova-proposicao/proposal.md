# Proposal

## Why

Reabertura da issue #1050: no `SF`, as siglas PLS e PLC aparecem em duplicidade nas listas de siglas do componente de nova proposição. O vocabulário do Senado tem cada uma duas vezes (`projeto.lei` e `projeto.lei.complementar`, ambas inativas), e as listas mostram só a sigla. Além da duplicidade, a regra atual permite iniciar um documento novo com sigla inativa, o que não faz sentido de negócio: siglas inativas existem para abrir e editar documentos antigos, não para criar novos.

## What Changes

- A lista de siglas da **nova proposição** (espécie Proposição) passa a conter só tipos **ativos**. A ordenação "ativos antes dos inativos" e o destaque em cinza deixam de valer nessa lista.
- O **alerta de sigla inativa** deixa de existir (a sigla inativa não pode mais ser escolhida na nova proposição).
- As listas de **proposição referenciada** (Substitutivo e Subemenda substitutiva) e de **texto de outra proposição** continuam com ativas e inativas (permitem partir do texto de um PLS antigo ou apresentar um substitutivo a um PLS em tramitação), mas passam a ter **uma entrada por sigla** (*distinct*): a duplicidade de PLS e PLC some.
- A resposta de verificação de proposição ganha o atributo opcional **`complementar`** (booleano, padrão `false`). Para PLS e PLC, ele decide se a URN do documento referenciado e a do substitutivo usam `projeto.lei.complementar` ou `projeto.lei`.
- **BREAKING (contrato com o host, compatível por padrão):** o serviço de verificação do `lexeditweb-editor` precisa devolver `complementar: true` para PLS e PLC complementares; sem o campo, a URN usa `projeto.lei`.
- Abrir e editar documentos de sigla inativa **não muda**; passa a ter teste de regressão.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `nova-proposicao`: lista de siglas da nova proposição só com ativas; remoção do requisito "Sigla inativa em nova proposição"; listas de proposição referenciada e de outra proposição com uma entrada por sigla; atributo `complementar` na resposta de verificação e seu efeito na URN.

## Impact

- Código: `src/components/nova-proposicao/` (`siglasNovaProposicao.ts`, `nova-proposicao.component.ts`, `montaUrnNovaProposicao.ts`, `tiposNovaProposicao.ts`).
- Documentação: `docs/requisitos/componente-nova-proposicao.md`, `docs/api-componente-lexml-eta.md`.
- Demo: `/demo-api/proposicoes/...` (`demo/components/demoview.ts` e mock correspondente).
- Host `lexeditweb-editor`: ponto de coordenação cross-repo (campo `complementar` na verificação).
- Testes: unitários de siglas e URN, de componente e E2E.
