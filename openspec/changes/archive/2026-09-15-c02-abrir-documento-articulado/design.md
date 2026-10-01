## Context

Ver [design.md de `2026-09-15-c01-salvar-documento-articulado`](../2026-09-15-c01-salvar-documento-articulado/design.md) para o contrato do arquivo (raiz Jsonix `LexML`, cinco grupos, sentinelas de identificação provisória) e a motivação geral da entrega. Esta capability apenas consome esse contrato ao ler.

O leitor legado da demonstração (usado fora do fluxo desta capability, para inicializar um documento novo) lia o objeto `Proposicao` com o invólucro antigo, reconstruía a identidade a partir de dados parciais, recuperava apenas o primeiro item de conteúdo da epígrafe e o primeiro parágrafo do preâmbulo, e normalizava tipograficamente o texto (aspas retas em curvas). O novo leitor de arquivo não aceita mais esse invólucro.

## Goals / Non-Goals

**Goals:**
- Validar estruturalmente o documento recebido (raiz, URN, listas de dispositivos, IDs não repetidos) antes de substituir o estado do editor.
- Preservar a URN recebida ao abrir, inclusive quando provisória, e recuperar todo o conteúdo suportado da parte inicial e da articulação.
- Preservar caracteres literais (aspas retas) no novo caminho de abertura, sem alterar o comportamento do caminho legado de inicialização.
- Fornecer seletores de abertura com fallback e tratamento de cancelamento e erros.

**Non-Goals:**
- Definição do contrato do arquivo — capability irmã `salvar-documento-articulado` (change `2026-09-15-c01-salvar-documento-articulado`).
- Implementação integral do XSD no navegador — a validação completa roda na suíte de integração local já definida em c01.
- Migração automática de arquivos antigos no formato `Proposicao`.
- Correção da diferença observada na marcação de link do título do Capítulo V ao reabrir o exemplo da MPV 905 — aceita como comportamento preexistente.
- Especificações 02 a 13.

## Decisions

**Verificação estrutural própria antes de interpretar o documento**, reaproveitando `validarDocumentoArticulado` (definida em c01) — não uma reimplementação do XSD no navegador. Mesma justificativa de c01: validação XSD completa exige Java e o conversor `jsonix-lexml` real, indisponíveis no ambiente do usuário final.

**`lerDocumentoArticulado` exercita o conversor (`buildProjetoNormaFromJsonix`) antes de permitir que a interface substitua seu estado.** Garante que um documento estruturalmente válido mas que o conversor não consegue interpretar seja rejeitado na abertura, em vez de deixar o editor num estado parcialmente corrompido.

**Preservação literal (`preservarTexto` / `escaparTextoJsonix`) somente no novo caminho de abertura.** Alternativa descartada: aplicar a mesma preservação também ao caminho legado de inicialização de um documento novo — rejeitada para não alterar o comportamento de fluxos de inicialização que não passam pelo arquivo de intercâmbio e já tinham a normalização tipográfica como padrão estabelecido.

**Rejeição do invólucro `Proposicao` antigo**, sem caminho de compatibilidade dentro de `abrirDocumentoArticulado()`. `getProposicao()` continua disponível separadamente para integrações que ainda dependem do formato antigo, mas o novo leitor de arquivo não o reconhece.

**Seletores de abertura com fallback**: `showOpenFilePicker` nativo quando disponível, senão um input HTML de arquivo oculto — mesmo padrão usado em c01 para salvar.

**Cancelamento retorna `undefined`** (diferente de `salvarArquivoDocumentoArticulado`, que retorna `false`). Assimetria intencional: "nenhum arquivo selecionado" é representado de forma mais natural por `undefined` (ausência de documento) do que por um booleano de sucesso/cancelamento.

## Risks / Trade-offs

- [Risco] A verificação estrutural do navegador não é uma implementação integral do XSD, podendo aceitar como aberto um documento estruturalmente válido para o ETA mas inválido para o esquema em algum caso não coberto → Mitigação: a mesma suíte de integração local definida em c01 (Jsonix real + XSD + Java) cobre a validação completa, incluindo um teste negativo (XML sem identificação obrigatória rejeitado pelo esquema).
- [Trade-off] A abertura de um arquivo gerado manualmente a partir da MPV 905 revelou normalização de espaços, conversão de aspas retas em curvas (produzida pelo leitor legado, fora desta capability) e uma diferença na marcação de link do título do Capítulo V, em comparação com o exemplo de origem → Aceito como comportamento preexistente por decisão do solicitante; não tratado como correção desta entrega. A comparação foi feita com a representação de origem anterior à primeira gravação por este contrato — o ciclo salvar-e-reabrir dentro do próprio contrato preserva o conteúdo gravado.
- [Risco] Arquivos antigos com invólucro `Proposicao` param de abrir, sem aviso migratório automático → Mitigação: rejeição explícita com mensagem de erro descritiva ("O arquivo deve conter um documento LexML em JSON"), propagada para a aplicação consumidora tratar; migração automática fica fora de escopo, conforme já registrado em c01.

## Migration Plan

Ver Migration Plan de c01: nenhum dado de produção depende deste formato; a demonstração (único consumidor afetado) foi atualizada no mesmo conjunto de commits. Arquivos antigos no formato `Proposicao` simplesmente deixam de abrir por este caminho.
