## Why

Os botões "Ir para o próximo dispositivo alterado" e "Ir para o dispositivo alterado anterior" erram com dispositivos excluídos em revisão (issue #1096). No arquivo da issue (MPV 930/2020), descer pelas marcas chega ao último artigo, excluído, e dele o botão de subir não sai do lugar. Lendo o mesmo código, há outros três casos em que a navegação pula ou repete marcas.

## What Changes

- A navegação entre dispositivos alterados segue a ordem de leitura da tela: ementa, preâmbulo e articulação, com cada dispositivo excluído logo depois do dispositivo acima dele (ou do excluído acima dele, quando há excluídos seguidos).
- O botão de subir, a partir de um dispositivo excluído, vai para a marca acima dele, mesmo quando o excluído é o último dispositivo do documento.
- A partir de um dispositivo excluído, os dois botões consideram as demais exclusões (hoje ignoram todas).
- Uma exclusão logo depois de um dispositivo alterado deixa de ser pulada, nos dois sentidos.
- Dois excluídos logo abaixo do mesmo dispositivo são alcançados um depois do outro, na ordem da tela.
- Descer e subir passam pelas mesmas marcas, em ordem inversa.

## Capabilities

### New Capabilities

- `navegacao-dispositivos-alterados`: ordem e alcance dos botões que levam o cursor ao dispositivo alterado seguinte ou anterior, incluindo os excluídos em revisão.

### Modified Capabilities

(nenhuma)

## Impact

- `src/redux/elemento/reducer/navegaEntreDispositivosAlterados.ts` (busca reescrita sobre uma lista na ordem de leitura).
- `src/redux/elemento/util/revisaoUtil.ts` passa a exportar a localização do excluído acima de outro excluído, hoje privada em `atualizaRevisao.ts`, que a reutiliza.
- Testes: um teste de reducer novo e um E2E novo em `cypress/e2e/revisao/`.
- Fora do escopo, registrado como issue a abrir: no arquivo da issue, a revisão de inclusão de um inciso sem número (`…_inc[sn:1593]`) não se liga ao inciso ao abrir.
- Sem mudança de API pública nem de formato de arquivo.
