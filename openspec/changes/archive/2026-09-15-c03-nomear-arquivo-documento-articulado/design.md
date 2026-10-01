## Context

Hoje `src/model/lexml/documento/documentoArticulado.ts` exporta a constante `NOME_ARQUIVO_DOCUMENTO_ARTICULADO = 'documento-articulado.json'`, usada por `src/util/arquivoDocumentoArticulado.ts` tanto no `suggestedName` do `showSaveFilePicker` quanto no `link.download` do caminho de download alternativo. Ver proposal.md - Why para a motivação.

O projeto já possui, em `src/model/lexml/documento/urnUtil.ts`, as funções `getSigla`, `getNumero` e `getAno` (extraem os componentes a partir da URN) e as constantes `ANO_PROVISORIO`/`NUMERO_PROVISORIO`, já usadas para compor a URN e a epígrafe provisórias quando o número/ano ainda não são conhecidos (`buildUrnProposicao`, `lexml-eta.component.ts`). O padrão de nome de arquivo a adotar (`<prefixo> - <sigla> nº <numero>, de <ano>.json`) já é usado no projeto irmão lexml-emenda (`demo/components/demoview.ts`, função `salvar()`), adaptado aqui trocando o prefixo dinâmico (`modo`) pelo prefixo fixo `documento-articulado`.

## Goals / Non-Goals

**Goals:**
- Compor o nome sugerido/baixado a partir da URN do próprio documento sendo salvo, sem exigir parâmetros adicionais nas funções públicas de salvar.
- Reaproveitar as sentinelas já existentes (`ANO_PROVISORIO`, `NUMERO_PROVISORIO`) quando número/ano não estiverem definidos, mantendo consistência com a URN e a epígrafe provisórias já geradas.

**Non-Goals:**
- Não altera o fluxo de abrir documento (`abrirArquivoDocumentoArticulado`), que não sugere nome de arquivo hoje.
- Não introduz o conceito de "modo de edição" (emenda/edição) presente no lexml-emenda; o prefixo é fixo (`documento-articulado`).
- Não formata o número com separador de milhar (ex.: `1.234`); segue o mesmo formato usado pelo padrão de referência no lexml-emenda (`emenda.proposicao.numero` bruto).

## Decisions

**Função em vez de constante exportada.** `NOME_ARQUIVO_DOCUMENTO_ARTICULADO` é removida e substituída por uma função (ex.: `nomeArquivoDocumentoArticulado(documento: DocumentoArticulado): string`) que lê `documento.value.metadado.identificacao.urn` e monta o nome com `getSigla`/`getNumero`/`getAno`. Alternativa descartada: manter uma constante de prefixo (`'documento-articulado'`) exportada e montar o nome completo em `arquivoDocumentoArticulado.ts` — descartada porque espalharia a regra de composição do nome entre dois módulos; concentrar a regra junto ao modelo do documento (que já expõe `serializarDocumentoArticulado`/`validarDocumentoArticulado`) mantém a responsabilidade única de "o que é um documento articulado e como ele se representa como arquivo" em um só lugar.

**Sigla sempre presente.** `sigla` é parâmetro obrigatório na inicialização do editor (`lexml-eta.component.ts`, `validarParametrosIdentificacaoProposicao`), então em uso normal `getSigla(urn)` sempre resolve. Não é adicionado nenhum fallback para sigla vazia: se ocorrer (URN malformada chegando por outro caminho que não o editor), o nome do arquivo simplesmente perde o segmento da sigla, sem lançar erro adicional — comportamento aceitável porque a validação de URN (`validarIdentificacaoDocumento`) já rejeita URNs fora do formato esperado antes de chegar a esse ponto.

**Reuso das sentinelas existentes, sem novo fallback dedicado.** `getNumero`/`getAno` já retornam as sentinelas quando a URN foi construída via `buildUrnProposicao`. Não é necessário nenhum tratamento especial no código de nomeação: o nome do arquivo simplesmente reflete o que a URN contém.

**Correção da fixture de teste.** A URN usada em `test/doc/documentoArticulado.ts` (`urn:lex:br:senado.federal:projeto.lei:9999;999999`) não inclui o sufixo de tipo (`;pl`/`;pls`/etc.) presente nas URNs reais construídas por `buildFakeUrn`. Com isso, `getSigla` retorna `''` para essa fixture porque nenhuma entrada do vocabulário casa com um `urnTipoDocumento` indefinido. A fixture será ajustada para `urn:lex:br:senado.federal:projeto.lei;pls:9999;999999` (sigla `PLS`), alinhando-a ao formato realmente produzido pelo editor.

**Abandonar `showSaveFilePicker`, sempre baixar pelo navegador.** Teste manual mostrou que, quando o navegador oferece `showSaveFilePicker` (File System Access API), o lexml-eta abre o diálogo nativo "Salvar como" do sistema operacional a cada clique em salvar. Esse diálogo sugere o nome composto, mas repetir o salvamento da mesma proposição sugere o mesmo nome sem incrementar — o usuário pode substituir o arquivo salvo anteriormente sem perceber, já que a API não tem noção de "já existe um arquivo com esse nome, incrementar". O lexml-emenda nunca teve esse problema porque sua função `salvar()` nunca usa `showSaveFilePicker` — ela sempre cria um link `<a download>` e o clica, deixando o gerenciador de downloads do próprio navegador (que já resolve nomes duplicados incrementando `(1)`, `(2)`, ...) cuidar da deduplicação. Passamos o lexml-eta a fazer o mesmo: remover o branch de `showSaveFilePicker` de `salvarArquivoDocumentoArticulado` e sempre usar o caminho de download.

Alternativa descartada: manter o seletor nativo e tentar detectar/evitar nomes duplicados na própria aplicação (ex.: consultando o sistema de arquivos antes de sugerir o nome) — descartada porque a File System Access API não expõe uma forma de listar arquivos existentes sem pedir permissão adicional de diretório, tornando a solução mais complexa do que simplesmente adotar o mesmo caminho já usado (e validado em produção) pelo lexml-emenda.

**`Promise<boolean>` vira `Promise<void>`.** O retorno `false` de `salvarArquivoDocumentoArticulado` existia apenas para sinalizar cancelamento do diálogo nativo. Sem esse diálogo, não há mais operação cancelável nesse fluxo (clicar em um link de download é síncrono e não tem estado de "cancelado" observável pelo JavaScript) — um booleano que só poderia retornar `true` deixaria de comunicar algo útil. A função passa a retornar `Promise<void>`, continuando a propagar (via rejeição da Promise) qualquer erro ocorrido ao montar ou serializar o documento. O fluxo de abrir (`abrirArquivoDocumentoArticulado`) continua com seletor nativo e cancelamento, pois `showOpenFilePicker` continua em uso e seu cancelamento é um caso real.

## Risks / Trade-offs

- [O caractere `nº`/acentos no nome do arquivo pode ser normalizado de forma diferente pelo sistema operacional/navegador] → Já é o comportamento aceito no lexml-emenda com o mesmo padrão; nenhum tratamento adicional é necessário além do já existente para caracteres reservados de nome de arquivo (nenhum dos campos usados — sigla, número, ano — contém caracteres reservados como `/`, `\`, `:`).
- [Consumidores externos que hoje importam `NOME_ARQUIVO_DOCUMENTO_ARTICULADO` ou dependem do retorno `boolean` de `salvarArquivoDocumentoArticulado` quebram ao atualizar] → Verificado: nenhum dos dois é usado fora deste repositório (o lexml-emenda ainda não depende do lexml-eta como pacote). Mudança de API pública sem plano de migração é aceitável neste momento.
- [Usuário perde a possibilidade de escolher a pasta de destino a cada salvamento, já que o download vai para a pasta padrão de downloads do navegador] → Trade-off aceito conscientemente: é o mesmo comportamento já em uso pelo lexml-emenda, e resolve o problema mais importante (sobrescrita silenciosa) sem exigir nenhuma lógica adicional no lexml-eta.
