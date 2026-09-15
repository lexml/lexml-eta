## Context

O lexml-eta manipula uma versão Jsonix do documento LexML e, até esta entrega, não possuía uma infraestrutura própria de persistência: a demonstração salvava um objeto `Proposicao` da aplicação, com o documento LexML aninhado em uma propriedade `projetoNorma`, inicializado com número `1` e ano corrente, e lia apenas o primeiro item de conteúdo da epígrafe e o primeiro parágrafo do preâmbulo.

O esquema LexML já define o XSD utilizado pelo editor; esta entrega não altera esse esquema (premissa central da [especificação 00](../../../docs/extensao-formato-lexml/00-especificacao-esquema-lexedit.md)) e usa o ramo `ProjetoNorma/Norma` já previsto nele — a denominação "Norma" nesse ramo é uma exigência estrutural do esquema, não uma indicação de que a proposição foi aprovada.

A análise inicial consultou `lexml-emenda`, `lexeditweb` e `eta-backend-services` para levantar padrões já usados no ecossistema (coleta de dados, serialização, preparação de documento final), mas não resultou em nenhuma alteração nesses projetos; o reaproveitamento ficou concentrado no modelo e conversores já existentes no ETA. Checkouts locais observados nessa análise: lexml-eta `a61bafc3`, lexml-emenda `5b698bb9`, lexeditweb `efee66ab9`, eta-backend-services `79c58f2` (identificam apenas os checkouts examinados, sem afirmar equivalência com versões implantadas).

Ver proposal.md para a motivação completa da mudança.

## Goals / Non-Goals

**Goals:**
- Definir o contrato do arquivo de intercâmbio `documento-articulado.json`, com a raiz Jsonix `LexML` diretamente (sem invólucro `Proposicao`).
- Gerar identificação provisória por sentinelas quando ano/número ainda não são conhecidos, preservando integralmente a URN recebida quando definitiva.
- Serializar os cinco grupos suportados: identificação, epígrafe, ementa, preâmbulo e articulação — com todo o conteúdo suportado (não apenas o primeiro item/parágrafo).
- Expor APIs reutilizáveis de obtenção e salvamento do documento, com seletores de arquivo que funcionam com ou sem File System Access API.
- Demonstrar, com verificação local (conversor Jsonix real + XSD), que o JSON produzido é um LexML válido.

**Non-Goals:**
- Leitura/abertura do arquivo — capability irmã `abrir-documento-articulado` (change `2026-09-15-c02-abrir-documento-articulado`).
- Especificações 02 a 13 (opções de impressão, fecho, assinaturas, anexos, justificação e conteúdo rico, notas de rodapé, comentários, revisão de texto, remissões internas enquanto grupo da série numerada, revisão da hierarquia, registro de usuários, outros metadados do LexEdit).
- Persistência de autoria, anexos, justificação, comentários ou metadados de revisão.
- Integração nova com lexeditweb ou eta-backend-services; conversão para XML como serviço de produção; geração de PDF.
- Novas telas específicas para editar epígrafe e preâmbulo.
- Migração automática dos arquivos antigos salvos pela demonstração anterior.

## Decisions

**Raiz do arquivo é o documento Jsonix LexML diretamente.** Alternativa descartada: manter o invólucro `Proposicao` da demonstração anterior. Rejeitada porque amarraria o contrato de intercâmbio ao modelo interno do ETA em vez do próprio padrão LexML, contrariando a premissa de que o arquivo deve ser lido por qualquer consumidor do padrão.

**Sentinelas de identificação provisória: ano `9999`, número `999999`, na ordem `:ano;número`.** Corrige o exemplo invertido (`:999999;9999`) da especificação 01, decisão confirmada pelo solicitante: o caso geral da URN LexML usa `data-ou-ano;número`, então as sentinelas devem seguir a mesma ordem.

**Preservação integral da URN recebida** (autoridade, data, evento) em vez de reconstruí-la a partir de dados parciais (`sigla`/`numero`/`ano`). Evita perda de informação em identificações já definitivas — a URN só é (re)construída por sentinela quando nenhuma URN foi recebida.

**Cópias independentes por `JSON.parse(JSON.stringify(...))`** em vez de reaproveitar referências do documento padrão ou de um documento anterior. Garante que múltiplos documentos abertos/criados na mesma sessão não compartilhem estado nem mutem o objeto padrão.

**Sincronização da edição pendente antes de obter o documento** (`flushEdicaoPendente`), para que o botão Salvar nunca serialize um dispositivo ainda em edição sem que o texto tenha sido confirmado.

**Preservação de espaços entre marcações inline** (`preservarEspacosJsonix`): o unmarshaller Jsonix ignora nós de texto compostos só de espaço; sem tratamento, palavras adjacentes a marcações (ex.: `<b>` seguido de espaço) se colariam na reconversão.

**Decodificação de texto para caracteres literais** (`decodificarTextoJsonix`): o modelo interno de edição usa HTML; o Jsonix espera o texto literal que o XML apresentaria (`<`, `&`, etc.), então o texto é decodificado antes de entrar no documento Jsonix.

**Seletores de arquivo com fallback**: usa `showSaveFilePicker` (File System Access API) quando disponível; caso contrário, usa download via link `<a download>`. Cobre navegadores sem suporte ao seletor nativo sem exigir biblioteca adicional.

**Validação estrutural própria, não uma implementação integral do XSD**, na função `validarDocumentoArticulado` (raiz correta, URN com formato válido, listas de dispositivos, IDs não repetidos). Alternativa descartada: validar contra o XSD completo no navegador — rejeitada por exigir Java e o conversor `jsonix-lexml` real, indisponíveis no ambiente do usuário final. A validação XSD completa fica na suíte de integração local.

**`ProjetoNorma/Norma` sempre, mesmo em proposição em elaboração.** Alternativa seria usar `ProjetoNorma/Projeto` (outro ramo do XSD); descartada porque produziria um documento fora do fluxo já suportado pelos conversores existentes do ETA, e a nomenclatura do ramo é uma questão estrutural do esquema, não uma afirmação sobre o status de aprovação da proposição.

## Risks / Trade-offs

- [Risco] Arquivos antigos no formato `Proposicao` (com número `1`/ano corrente) deixam de ser aceitos pelo novo leitor → Mitigação: `getProposicao()` continua disponível para integrações existentes que ainda dependem do formato antigo; migração automática fica fora de escopo desta entrega.
- [Risco] A verificação estrutural feita no navegador ao abrir não é uma implementação integral do XSD, podendo aceitar um documento estruturalmente válido para o ETA mas inválido para o esquema em algum caso não coberto → Mitigação: validação completa (Jsonix real + XSD + Java) roda na suíte de integração local, fixada na revisão `3f570910f6034d09e1bfb657b7e15ef2c6717012` do `jsonix-lexml`; o XSD usa `anyURI` na identificação, então sua aprovação sozinha não comprova a regra de ano/número provisórios — por isso `validarIdentificacaoDocumento` verifica essa regra separadamente, com uma expressão regular própria, antes da serialização.
- [Trade-off] A análise de um arquivo gerado manualmente a partir da MPV 905 mostrou normalização de espaços, conversão de aspas retas em curvas pelo leitor legado, e uma diferença na marcação de link do título do Capítulo V, ao comparar com o exemplo de origem → Aceito como comportamento preexistente por decisão do solicitante; não é tratado como correção desta entrega. O ciclo de serialização e reabertura (JSON/XML/JSON) preserva o conteúdo gravado por este contrato; a diferença observada é em relação à representação de origem usada *antes* da primeira gravação por este novo caminho, não uma perda introduzida pelo ciclo em si.

## Migration Plan

Não há dado de produção a migrar: nenhum backend depende deste formato ainda, e a demonstração (único consumidor afetado) foi atualizada no mesmo conjunto de commits desta entrega. Arquivos antigos salvos pela demonstração anterior (formato `Proposicao`) simplesmente deixam de ser aceitos pelo novo leitor; não há rota de migração automática — decisão de escopo registrada em proposal.md.
