## MODIFIED Requirements

### Requirement: Importação de arquivo
A opção de importação SHALL aceitar arquivos DOCX, TXT ou LexML de até 5 MB; o LexML SHALL poder estar em XML ou em JSON (formato JSONIX, o mesmo usado pelo componente ao abrir um documento). Arquivo acima do limite ou de outro formato MUST ser recusado com mensagem ao usuário, sem executar o parser. Falha do parser SHALL levar à Tela 3. Nesta etapa o tratamento real do arquivo está fora do escopo: o componente SHALL simular o upload e SHALL responder com um erro de parser simulado, levando sempre à Tela 3, sem chamar nenhuma URL.

#### Scenario: Importação simulada
- **WHEN** o usuário seleciona um arquivo DOCX, TXT ou LexML de até 5 MB e aciona **Continuar**
- **THEN** nenhuma URL é chamada e a Tela 3 exibe o nome do arquivo e um erro de parser simulado

#### Scenario: LexML em XML ou JSON
- **WHEN** o usuário seleciona um arquivo LexML em XML ou em JSON (JSONIX) de até 5 MB
- **THEN** o arquivo é aceito para importação e, nesta etapa, segue o fluxo simulado (Tela 3 com erro de parser simulado)

#### Scenario: Arquivo acima do limite
- **WHEN** o usuário seleciona um arquivo maior que 5 MB
- **THEN** o arquivo é recusado com mensagem e **Continuar** permanece desabilitado

#### Scenario: Falha na conversão
- **WHEN** o parser do arquivo importado falha
- **THEN** a Tela 3 exibe o nome do arquivo e a lista de erros do parser

### Requirement: Epígrafe e preâmbulo fornecidos pelo vocabulário
O componente SHALL obter `preambulo` do vocabulário (texto padrão por tipo e autoridade) e `epigrafe` do serviço de epígrafe do vocabulário (issue #1053), a partir de `urn`, `urnDocumentoReferenciado` e um sufixo opcional, e MUST depender apenas dessa interface. No `SF`, o componente SHALL informar o sufixo `- PLEN` quando o destino é Plenário e `- <sigla da comissão>` quando é Comissão; na `CD`, MUST NOT informar sufixo. Enquanto o serviço não estiver implementado, o componente SHALL gerar a epígrafe do caso padrão, sem sufixo, (`<TIPO DO DOCUMENTO POR EXTENSO EM MAIÚSCULAS> Nº   , DE <ANO>`, número em branco e ano corrente), sem alterar o contrato do evento. Quando o tipo não tiver texto padrão, o próprio componente SHALL aplicar o fallback do preâmbulo, sem alterar a função de obtenção do texto padrão nem a abertura de documentos.

#### Scenario: Epígrafe de substitutivo
- **WHEN** o fluxo é concluído para um substitutivo
- **THEN** a `epigrafe` do `detail` é a devolvida pelo serviço do vocabulário para as duas URNs

#### Scenario: Sufixo no SF com destino Plenário
- **WHEN** a casa é `SF` e o destino é Plenário
- **THEN** o componente chama o serviço de epígrafe com o sufixo `- PLEN`

#### Scenario: Sufixo no SF com destino Comissão
- **WHEN** a casa é `SF` e o destino é a comissão de sigla `CCJ`
- **THEN** o componente chama o serviço de epígrafe com o sufixo `- CCJ`

#### Scenario: Sem sufixo na CD
- **WHEN** a casa é `CD`
- **THEN** o componente chama o serviço de epígrafe sem sufixo

#### Scenario: Serviço de epígrafe ainda não implementado
- **WHEN** o fluxo é concluído e o serviço de epígrafe do vocabulário não está disponível
- **THEN** a `epigrafe` do `detail` é a do caso padrão, com o tipo por extenso em maiúsculas, número em branco e o ano corrente

#### Scenario: Preâmbulo sem modelo
- **WHEN** o tipo do documento não tem preâmbulo padrão no vocabulário
- **THEN** o componente registra um log de erro de preâmbulo não encontrado para a URN e usa `O CONGRESSO NACIONAL decreta:` em `preambulo`; a abertura de documentos de tipo sem modelo continua sem preâmbulo e sem log
