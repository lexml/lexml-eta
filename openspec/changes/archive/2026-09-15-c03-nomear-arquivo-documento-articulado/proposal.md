## Why

Hoje o arquivo de intercâmbio é sempre salvo com o nome fixo `documento-articulado.json`, independentemente de qual proposição está em edição. Isso obriga o usuário a renomear o arquivo manualmente para distingui-lo de outras edições salvas na mesma pasta. O projeto irmão lexml-emenda já resolve esse problema compondo o nome a partir dos dados da proposição (`<modo> - <sigla> nº <numero>, de <ano>.json`); queremos trazer esse mesmo padrão para o lexml-eta, adaptado ao prefixo fixo `documento-articulado`.

Teste manual desta change revelou um segundo problema, também relacionado a nome de arquivo: ao salvar a mesma proposição duas vezes seguidas, o lexml-eta abre o seletor nativo de salvamento do sistema operacional (`showSaveFilePicker`), que sugere o mesmo nome e não incrementa automaticamente — o usuário corre o risco de sobrescrever o arquivo salvo anteriormente sem perceber. O lexml-emenda não tem esse problema porque nunca usa esse seletor nativo: ele sempre baixa o arquivo pelo navegador, que evita sobrescrita incrementando o nome automaticamente (`nome (1).json`, `nome (2).json`, ...). Alinhamos o lexml-eta a esse mesmo comportamento.

## What Changes

- O nome sugerido/baixado ao salvar passa a ser `documento-articulado - <SIGLA> nº <numero>, de <ano>.json`, montado a partir da URN do documento (`getSigla`, `getNumero`, `getAno`, já existentes em `urnUtil.ts`).
- Quando número e/ou ano ainda não estiverem definidos, o nome usa as sentinelas já adotadas pelo projeto para identificação provisória (`999999` e `9999`), mantendo consistência com a URN provisória e a epígrafe provisória já geradas hoje.
- A constante pública `NOME_ARQUIVO_DOCUMENTO_ARTICULADO` é substituída por uma função que recebe o documento e retorna o nome do arquivo.
- **BREAKING**: `salvarArquivoDocumentoArticulado` deixa de usar o seletor nativo de salvamento do sistema operacional (`showSaveFilePicker`) e passa a sempre baixar o arquivo pelo navegador (mesmo mecanismo do lexml-emenda), deixando o próprio navegador evitar sobrescrita ao repetir o nome. Como não há mais operação cancelável nesse fluxo, a função deixa de retornar `Promise<boolean>` e passa a retornar `Promise<void>`, ainda propagando erros para a aplicação consumidora tratar.
- O fluxo de abrir documento (`abrirArquivoDocumentoArticulado`) não muda: continua usando o seletor nativo de abertura quando disponível, com _fallback_ para um `<input type="file">`.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `salvar-documento-articulado`: o Requirement "Seletores de arquivo para salvar" (nome fixo, escolha entre seletor nativo e download) é removido e substituído pelo novo Requirement "Geração do arquivo ao salvar" — sempre baixa pelo navegador, com o nome composto a partir de sigla, número e ano da proposição (sentinelas para valores ainda não definidos), deixando a deduplicação de nomes do próprio navegador evitar sobrescrita silenciosa.

## Impact

- `src/model/lexml/documento/documentoArticulado.ts`: remove a constante `NOME_ARQUIVO_DOCUMENTO_ARTICULADO`, adiciona a função de composição do nome.
- `src/util/arquivoDocumentoArticulado.ts`: `salvarArquivoDocumentoArticulado` deixa de usar `showSaveFilePicker`, sempre usa `link.download` com o nome composto pela nova função; a assinatura passa de `Promise<boolean>` para `Promise<void>`.
- `src/index.ts`: atualiza o export público (constante → função).
- `test/util/arquivoDocumentoArticulado.test.ts`: remove os testes do seletor nativo e de cancelamento ao salvar (não existem mais nesse fluxo); adiciona testes para o download com o nome composto e para propagação de erro ao salvar um documento inválido; ajusta o teste de cancelamento ao abrir, que continua existindo apenas no fluxo de abertura.
- `test/doc/documentoArticulado.ts`: corrige a URN de teste, que hoje não inclui o sufixo de tipo (`;pl`/`;pls`) usado pelas URNs reais geradas pelo editor, o que hoje faz `getSigla` retornar vazio para essa fixture.
- `openspec/specs/salvar-documento-articulado/spec.md`: reescreve o Requirement "Seletores de arquivo para salvar".
