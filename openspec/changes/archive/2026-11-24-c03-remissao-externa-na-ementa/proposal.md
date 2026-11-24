## Why

A citação a uma lei na ementa não vira link, embora a mesma citação vire link no corpo do texto (issue #1085). Na ementa "Altera a Lei nº 12.965, de 23 de abril de 2014, para…", o Art. 1º com a mesma citação ganha o link ao sair da linha e a ementa não. A ementa não faz parte da árvore da articulação, e dois pontos do caminho da remissão externa só procuram ali.

## What Changes

- A detecção automática de remissão externa passa a valer também para a ementa: ao sair da linha da ementa, as citações a normas externas viram link, como nos dispositivos.
- Ao salvar, as remissões externas da ementa (automáticas ou criadas pelo diálogo) são gravadas no texto da ementa, e voltam como link ao abrir o documento.
- O preâmbulo continua sem detecção: a citação do art. 60 da Constituição no texto padrão da PEC não deve virar link.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `remissao-externa`: requisito novo "Remissão externa na ementa".

## Impact

- `src/components/editor/editor.component.ts` (`coordenarDeteccaoExterna` acha o dispositivo da linha também na ementa).
- `src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts` (`montaParteInicial` recebe as remissões externas e as injeta no texto da ementa).
- Testes: `test/model/documento/roundTripRemissaoExterna.test.ts` e um E2E novo em `cypress/e2e/remissao-externa/`.
- Fora do escopo: remissão interna na ementa (não verificada).
- Sem mudança de API pública nem de formato de arquivo: a ementa já admite o mesmo link (`Remissao`) que os dispositivos, e a abertura já o lê.
