## Why

A funcionalidade de remissão externa (referências a normas fora do documento em edição) já foi implementada e entregue em duas ondas — fluxo manual via diálogo (14/05/2026 em diante) e detecção automática via `lexml-linker`/WASM (13–18/08/2026) — fora da metodologia OpenSpec. `openspec/specs/remissao-externa/spec.md` já existe (commit `59aaccc5`/`8c400c28`), mas nunca passou pelo ciclo `changes/` → `changes/archive/` correspondente. Esta change traz essa entrega para a metodologia, documentando o comportamento já implementado e testado, antes que o conhecimento fique preservado apenas em documentos soltos (`docs/planos/PLANO_REMISSAO_EXTERNA.md`, `docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md`, `docs/referencia/REMISSAO_EXTERNA.md`, `docs/guias/REMISSAO_EXTERNA_GUIA_TESTES.md`, `docs/guias/TREINAMENTO_REMISSAO_EXTERNA.md`), não versionados no repositório principal.

## What Changes

- Criação e edição manual de remissão externa via diálogo compartilhado com remissão interna (aba "Externa"): autocomplete de norma, campo de dispositivo em texto livre, seleção de texto obrigatória (diferente da remissão interna, que dispensa seleção).
- Detecção automática de citações completas a normas externas (ex.: "Lei nº 8.069, de 13 de julho de 1990" e variantes abreviadas número/ano) via `lexml-linker` compilado para WASM, rodando em Web Worker local, sem chamada de rede na detecção em si; link criado diretamente, sem diálogo de confirmação.
- Gatilho de criação compartilhado com a remissão interna: só ao sair do dispositivo em edição (blur/flush), nunca por debounce de digitação.
- Coordenação com a detecção de remissão interna: um trecho reconhecido como citação externa nunca permanece também marcado como remissão interna, mesmo quando o número de artigo citado colide com um artigo local — resolve um falso positivo pré-existente na detecção interna, exposto (não introduzido) por este trabalho.
- Popup de ações (Abrir / Editar / Excluir) ao posicionar o cursor sobre um link de remissão externa, reaproveitando o mesmo componente de popup da remissão interna — "Abrir" leva ao portal de normas (`urlPortalNormas` configurável), sem deep link para o dispositivo específico (o portal não suporta).
- Resolução de nome amigável da norma por busca reversa via URN, usada tanto na edição de remissões automáticas (que nascem sem nome preenchido) quanto ao reabrir o documento (o nome não é persistido, é recalculado sob demanda).
- Reconhecimento de links de remissão externa colados no editor, incluindo conversão de um formato legado (URN direta no `href`, sem os atributos do formato próprio).
- Persistência: serialização no mesmo elemento `<Remissao>` do LexML usado pela remissão interna, diferenciado pela forma da URN no `href` (com fragmento de dispositivo após `!`, quando disponível) em vez de um id local; reconstrução ao reabrir varrendo o texto, sem depender de estado de sessão anterior. Sem mecanismo de invalidação (ao contrário da remissão interna) — se a norma/dispositivo externo deixar de existir, o link simplesmente abre uma página de erro no portal, comportamento aceito.

Esta change não propõe trabalho futuro: descreve, com requisitos e cenários, o comportamento já implementado e coberto por testes automatizados (unitários e Cypress E2E).

## Capabilities

### New Capabilities
- `remissao-externa`: detecção automática (via `lexml-linker`/WASM), criação/edição manual via diálogo compartilhado, coordenação com a detecção de remissão interna, popup de ações, reconhecimento de link colado, e persistência de referências a normas fora do documento.

### Modified Capabilities
(nenhuma — `remissao-interna` continua com os mesmos requisitos; esta capability apenas compartilha o diálogo de criação, o gatilho de blur e o mecanismo de popup com ela, e coordena com sua detecção para evitar sobreposição, sem alterar seu contrato.)

## Impact

- **Código principal — fluxo manual**: [remissao.ts](../../../src/model/remissao/remissao.ts) (`RemissaoExternaValue`), [lexmlEtaConfig.ts](../../../src/model/lexmlEtaConfig.ts) (`urlPortalNormas`), [remissaoDialog.ts](../../../src/components/editor/remissaoDialog.ts) (aba Externa), [eta-blot-remissao-externa.ts](../../../src/util/eta-quill/eta-blot-remissao-externa.ts) (blot), [moduloRemissao.ts](../../../src/components/editor/moduloRemissao.ts) (criação/renderização/remoção), [editor.component.ts](../../../src/components/editor/editor.component.ts) (popup, handlers), [adicionaRemissaoExterna.ts](../../../src/redux/elemento/reducer/adicionaRemissaoExterna.ts) e reducer de remoção.
- **Código principal — detecção automática (WASM)**: [src/util/lexml-linker/](../../../src/util/lexml-linker/) (vendorização do artefato `.wasm`/`.mjs`, Worker, cliente, parser de offsets do HTML decorado), coordenação em `editor.component.ts` (`detectarRemissoesAoSairDaLinha`) e exclusão de spans já reivindicados pela externa em `adicionaRemissaoInterna.ts`.
- **Código principal — persistência**: [buildJsonixFromProjetoNorma.ts](../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts) e [buildProjetoNormaFromJsonix.ts](../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix.ts) (serialização/deserialização diferenciando URN de id local pelo prefixo `urn:lex:`).
- **Sem impacto** em `remissao-interna` (capability irmã, contrato próprio inalterado, só compartilha diálogo/gatilho/popup e recebe exclusão de spans), `paginacao-articulacao`, ou nos fluxos de salvar/abrir documento articulado além de consumir o registro de remissões externas já pronto na serialização/deserialização da articulação.
- **Documentação**: `docs/referencia/REMISSAO_EXTERNA.md` e `docs/guias/REMISSAO_EXTERNA_GUIA_TESTES.md`/`TREINAMENTO_REMISSAO_EXTERNA.md` (não versionados no git) continuam como referência técnica/QA/treinamento detalhados; esta change consolida o contrato observável em `specs/remissao-externa/spec.md`.
- **Testes**: suíte unitária (`test/model/remissao/`, `test/redux/elemento/reducer/`, `test/components/editor/`, `test/util/lexml-linker/`) e Cypress (`cypress/e2e/remissao-externa/`).
