## Why

Em modo de revisão, as linhas revisadas da articulação só ganham um fundo azul-claro, igual para inclusão, alteração e exclusão (a exclusão tem também o texto riscado), e não se distingue de relance o que mudou (issue #1095). O editor de emendas (`lexml-emenda`) distingue a situação do dispositivo pela cor da letra: verde para adicionado, azul para modificado e vermelho para suprimido.

## What Changes

- Em modo de revisão, o dispositivo revisado passa a ter a letra (texto, rótulo e título) verde quando foi incluído, azul quando foi alterado e vermelha quando foi excluído, com as mesmas cores do editor de emendas.
- Movido, transformado e renumerado contam como alteração (azul); incluído e depois alterado continua inclusão (verde); excluído vale sobre o resto (vermelho).
- Continuam como estão: o fundo azul-claro das linhas revisadas, o texto riscado do excluído e as cores próprias de mensagens, selo "Novo/Existente", botões da marca e links de remissão.
- Aceitar ou rejeitar a revisão tira a cor, junto com a marca.

## Capabilities

### New Capabilities

- `destaque-revisao-dispositivo`: destaque visual do dispositivo revisado na articulação, conforme o tipo da revisão.

### Modified Capabilities

(nenhuma)

## Impact

- `src/redux/elemento/util/revisaoUtil.ts` (classificação da revisão em inclusão, alteração ou exclusão).
- `src/util/eta-quill/eta-container-table.ts` (`atualizarAtributoRevisao` grava o tipo da revisão na linha).
- `src/assets/css/editor.css.ts` (cores por tipo de revisão).
- Testes: unitário da classificação e E2E novo.
- Sem mudança de API pública nem de formato de arquivo. A classe herdada `dispositivo--adicionado`, aplicada a toda linha sem efeito visual, não muda.
