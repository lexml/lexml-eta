## REMOVED Requirements

### Requirement: Seletores de arquivo para salvar
**Reason**: O seletor nativo de salvamento do sistema operacional (`showSaveFilePicker`) sugere o mesmo nome a cada salvamento repetido da mesma proposição, sem incrementá-lo, permitindo sobrescrever silenciosamente um arquivo salvo anteriormente. O sistema deixa de escolher entre o seletor nativo e um download alternativo — ver o novo Requirement "Geração do arquivo ao salvar", que descreve o comportamento único que substitui este (sempre baixar pelo navegador).
**Migration**: Nenhuma ação é necessária para quem consome `salvarArquivoDocumentoArticulado`: a função continua exportada com o mesmo nome, mas sua assinatura passa de `Promise<boolean>` para `Promise<void>`, já que não há mais diálogo nativo cujo cancelamento precise ser sinalizado por um retorno `false`.

## ADDED Requirements

### Requirement: Geração do arquivo ao salvar
O sistema SHALL sempre gerar o arquivo por download do navegador, sem usar o seletor nativo de salvamento do sistema operacional, sugerindo o nome de arquivo `documento-articulado - <sigla> nº <número>, de <ano>.json` composto a partir da URN do documento sendo salvo — para que a deduplicação de nomes do próprio navegador evite sobrescrever, sem aviso, um arquivo salvo anteriormente com o mesmo nome; SHALL propagar qualquer erro ocorrido ao gerar o arquivo para a aplicação consumidora tratar.

#### Scenario: Nome do arquivo baixado
- **WHEN** o usuário aciona salvar com um documento em edição
- **THEN** o navegador inicia o download do arquivo com o nome `documento-articulado - <sigla> nº <número>, de <ano>.json`, com sigla, número e ano extraídos da URN do documento

#### Scenario: Número e/ou ano ainda não definidos
- **WHEN** a URN do documento contém as sentinelas de identificação provisória (`9999` para o ano e/ou `999999` para o número)
- **THEN** o nome do arquivo usa essas mesmas sentinelas no lugar do ano e/ou do número

#### Scenario: Falha ao gerar o arquivo
- **WHEN** ocorre um erro ao montar ou serializar o documento para download
- **THEN** o erro é propagado para a aplicação consumidora tratar
