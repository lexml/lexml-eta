# Proposal

## Why

Documentos importados de PDF, DOCX ou TXT e arquivos legados trazem com frequência erros de numeração no original, como dois "Art. 5º". Como o identificador de um dispositivo é montado a partir do número (`buildId`), esses documentos têm ids repetidos, e o editor os recusa ao abrir e ao salvar. Hoje o usuário não tem como abri-los para corrigir a numeração no próprio editor (issue #1066).

## What Changes

- Nova configuração do componente, o modo de validação de numeração, com dois valores: **rígida** (padrão, comportamento atual) e **flexível**. Sem configuração, vale a rígida, e o comportamento atual não muda.
- No modo flexível, a validação estrutural ao abrir (inclusive o documento de modelo da nova proposição e a reabertura de "Alterar dados básicos") e ao salvar passa a aceitar ids repetidos **somente** nos elementos cujo id é montado pela hierarquia (dispositivos, `Caput`, `Pena` e alteração). Os demais ids continuam únicos.
- No modo flexível, ao salvar, o arquivo grava os ids como estão, inclusive os repetidos. O XML convertido dessa forma não é válido pelo esquema (`xsd:ID`), e o host não o valida.
- No modo flexível, enquanto houver numeração repetida:
  - a aba Avisos exibe o alerta crítico "Existem dispositivos com numeração repetida.", que o usuário não pode fechar;
  - a pendência de mesmo texto é gravada no arquivo (`lexedit:Pendencias`) e entregue em `Proposicao.pendenciasPreenchimento`, para constar no PDF;
  - o erro "Dispositivo com numeração repetida" aparece na 2ª ocorrência e nas seguintes, só no dispositivo que causa a repetição. Um descendente cujo id só se repete porque o do pai se repete não recebe o erro.
- O erro oferece "Corrigir agora" onde a renumeração automática já é permitida (texto principal e pai "Novo" na norma alterada). A correção renumera o grupo, o que corrige o dispositivo, as demais ocorrências e os descendentes. Com pai "Existente" na norma alterada não há correção automática: o usuário usa "Renumerar".
- Alerta, pendência e erros são reavaliados depois de toda ação, inclusive desfazer e refazer. Somem quando a repetição deixa de existir, seja por renumeração automática, por "Corrigir agora" ou por renumeração manual.
- Referências por id (remissão interna, comentário da articulação, situação na norma vigente) que apontam para um id repetido continuam resolvendo para a 1ª ocorrência. É uma limitação documentada.
- O modo rígido não muda: o arquivo com ids repetidos é recusado ao abrir, a mensagem existente do bloco de alteração ("O dispositivo tem número igual ao de outro dispositivo") permanece nos dois modos, e salvar com ids repetidos continua falhando.

## Capabilities

### New Capabilities
- `numeracao-repetida`: modo de validação de numeração e tratamento de dispositivos com numeração repetida no modo flexível (erro contextual na causa, "Corrigir agora", reavaliação a cada ação e limitação das referências).

### Modified Capabilities
- `abrir-documento-articulado`: a validação estrutural na abertura passa a depender do modo de validação de numeração, e no modo flexível os ids de dispositivo podem se repetir.
- `salvar-documento-articulado`: salvar aceita ids de dispositivo repetidos no modo flexível, há nova pendência de numeração repetida e a ordem das pendências passa a incluí-la.
- `pendencias-proposicao`: novo alerta e nova pendência de numeração repetida, com a mesma condição.
- `interface-lexml-eta`: a configuração da sessão passa a incluir o modo de validação de numeração.

## Impact

- **Código**:
  - `src/model/lexmlEtaConfig.ts` (novo campo);
  - `src/model/lexml/documento/documentoArticulado.ts` (validação com o modo, em `lerDocumentoArticulado`/`criarDocumentoArticulado`);
  - `src/model/lexml/numeracao/` (detecção da causa e nova mensagem em `validaNumeracao`, nova entrada em `AutoFix`);
  - `src/redux/elemento/reducer/` (passagem central depois de cada ação, autofix);
  - `src/components/lexml-eta.component.ts` (repasse do modo, pendência);
  - `src/components/lexml-eta-proposicao.component.ts` (salvar).
- **API pública**: `LexmlEtaConfig.validacaoNumeracao` e a opção de modo em `lerDocumentoArticulado` (exportada). Os dois têm padrão rígido e são compatíveis com quem já usa o componente.
- **Documentação**: `docs/api-componente-lexml-eta.md` (configuração e comportamento) e `CLAUDE.md` (invariantes novas).
- **Coordenação com o `lexeditweb-editor`**: o host precisa informar `validacaoNumeracao: 'flexivel'` para ativar o modo, e precisa aceitar arquivos com ids de dispositivo repetidos, cujo XML não valida contra o esquema.
