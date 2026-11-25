## Why

Em alteração de norma, "Omitir Incisos" no primeiro inciso de um artigo põe o omissis depois do último dispositivo do artigo, e não no lugar do inciso (issue #1087). A causa é mais grave que a posição: o omissis fica fora da árvore do documento e não seria gravado. Na conversão do tipo, o dispositivo novo nasce no lugar do antigo e com o mesmo `uuid` (preservado desde `68225295`, correção do bug do TAB), e a remoção do antigo, que filtra os filhos pelo `uuid`, leva os dois. Sem lugar na árvore, a tela põe a linha depois do último filho do artigo.

## What Changes

- As transformações em que o dispositivo continua no mesmo pai passam a deixar o dispositivo novo no lugar do antigo e na árvore do documento: omitir incisos, alíneas, itens, parágrafos e artigos; transformar omissis em dispositivo; transformar dispositivo genérico em inciso, alínea ou item.
- O `uuid` continua preservado na transformação.
- As demais transformações (Tab, Shift+Tab, parágrafo em inciso, artigo em parágrafo) não mudam.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `transformacao-dispositivo`: requisito novo "Transformação no mesmo pai mantém o dispositivo no lugar".

## Impact

- `src/model/lexml/dispositivo/dispositivoLexmlUtil.ts` (`converteDispositivo`, grupo das transformações no mesmo pai).
- Testes: reducer novo em `test/redux/transforma/` e E2E novo.
- Sem mudança de API pública nem de formato de arquivo.
