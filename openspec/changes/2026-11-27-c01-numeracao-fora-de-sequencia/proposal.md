# Proposal

## Why

O modo flexível de validação de numeração (#1066) trata dois dispositivos de mesmo número em documento importado ou legado, mas não trata os outros erros de numeração que esses documentos trazem: dispositivos fora de ordem (art. 1, art. 3, art. 2, art. 4), lacunas (art. 1, art. 3, art. 4) e complementos no texto principal (art. 3, art. 3-A, art. 4), que a numeração automática nunca gera. Como os ids não se repetem, esses documentos abrem em qualquer modo, com o rótulo do arquivo, sem nenhum aviso. Na primeira ação estrutural, o editor renumera pela posição sem avisar, e as citações em texto puro vindas do original ("conforme o art. 3º") passam a apontar para outro artigo sem que o usuário saiba (issue #1113).

## What Changes

- No modo flexível, a numeração repetida passa a ser um dos casos de **numeração irregular**, ao lado de três novos:
  - **complemento**: o dispositivo tem complemento (`3-A`), que nunca é gerado pela numeração automática;
  - **lacuna**: o número do dispositivo é maior que o maior número anterior do grupo + 1 (o primeiro do grupo deve ser 1);
  - **fora de ordem**: o número é menor que esse esperado.
  A prioridade, quando mais de um caso vale para o mesmo dispositivo, é: repetida, complemento, lacuna ou fora de ordem. O dispositivo com complemento não altera o maior número anterior: em `3, 3-A, 4`, o `4` não tem erro.
- Complemento, lacuna e fora de ordem só são avaliados nos grupos de numeração automática: os artigos do texto principal e, em bloco de alteração, os filhos não artigos de pai "Novo". Nos demais grupos do bloco de alteração a lacuna é legítima e já há as validações próprias (omissis, número menor/maior), que não mudam. Um grupo que contém omissis só tem a repetição avaliada; o tratamento de omissis nesses grupos fica para outra mudança.
- Como na repetição, o erro aparece só no dispositivo que causa a irregularidade, e não nos seguintes: em `1, 3, 2, 4`, o art. 3 tem lacuna, o art. 2 está fora de ordem e o art. 4 não tem erro.
- Erros específicos por dispositivo: "Dispositivo com numeração repetida" (já existe), "Dispositivo com complemento na numeração", "Dispositivo com numeração fora de ordem" e "Dispositivo com lacuna na numeração". Os três novos sempre oferecem "Corrigir agora", que renumera o grupo pela posição, como a correção de hoje. Se o erro estiver na ordem, o usuário move o dispositivo antes de corrigir.
- O alerta da aba Avisos e a pendência passam a ser únicos e genéricos para os quatro casos: "Existem dispositivos com numeração irregular.", no lugar de "Existem dispositivos com numeração repetida.". **BREAKING** para o host que compare o texto da pendência gravada ou entregue em `Proposicao.pendenciasPreenchimento`.
- Reavaliação a cada ação, desfazer e refazer: o mesmo comportamento já definido para a repetição.
- O modo rígido não muda: documentos com complemento no texto principal, lacuna ou fora de ordem continuam abrindo sem erro, alerta ou pendência.
- Fora do escopo: reordenar dispositivos pelo rótulo; a divergência entre "único" e "1º" (rótulo, não sequência); atualizar citações em texto puro; complemento, lacuna e ordem em grupo de numeração automática com omissis.

## Capabilities

### New Capabilities

Nenhuma. A capability `numeracao-repetida` mantém o nome e passa a cobrir a numeração irregular.

### Modified Capabilities

- `numeracao-repetida`: o modo rígido também não produz erros de complemento, lacuna e ordem; novos requisitos de complemento, lacuna e fora de ordem, com erro na causa; a oferta e a correção e a reavaliação a cada ação passam a valer para os quatro casos.
- `pendencias-proposicao`: o alerta e a pendência de numeração repetida passam a ser de numeração irregular, com o novo texto e a nova condição.
- `salvar-documento-articulado`: a pendência gravada passa a ser a de numeração irregular, na mesma posição da ordem das pendências.

## Impact

- **Código**:
  - `src/model/lexml/numeracao/numeracaoRepetida.ts` (detecção de complemento, lacuna e ordem, ao lado da repetição) e `numeracaoValidator.ts` (novas mensagens em `validaNumeracao`);
  - `src/model/lexml/util/mensagem.ts` (novas entradas em `AutoFix`);
  - `src/redux/elemento/reducer/sincronizarNumeracaoRepetida.ts` (conjunto, alerta e eventos para os quatro casos) e `autoFixElemento.ts` (correção oferecida para os quatro);
  - `src/components/lexml-eta.component.ts` (texto da pendência).
- **Documentação**: `docs/api-componente-lexml-eta.md` (comportamento do modo flexível) e `CLAUDE.md` (item 28).
- **Coordenação com o `lexeditweb-editor`**: o texto da pendência muda, e documentos com complemento no texto principal, lacuna ou fora de ordem abertos no modo flexível passam a ter alerta e pendência.
