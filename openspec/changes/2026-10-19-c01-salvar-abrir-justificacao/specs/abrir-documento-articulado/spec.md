## ADDED Requirements

### Requirement: Recuperação da justificação ao abrir
Ao abrir um documento, o sistema SHALL carregar no editor da justificação o conteúdo de `ProjetoNorma/Justificacao/PartePrincipal`, refazendo o caminho inverso das adaptações feitas ao salvar: `span` com a classe `p` dentro de célula volta a ser parágrafo, a largura em `style` volta a ser a largura do editor, e a imagem dentro de parágrafo volta a ser imagem do editor. Exceção: a largura de tabela e de coluna não volta ao editor, porque o plugin de tabelas do editor não a guarda e a descarta ao carregar o texto; a largura de imagem volta. Documento sem `Justificacao` SHALL abrir com a justificação vazia. O alerta e a pendência de justificação SHALL refletir a justificação aberta.

#### Scenario: Documento com justificação
- **WHEN** o usuário abre um documento cuja justificação tem parágrafos formatados, uma lista, um link, uma tabela e uma imagem
- **THEN** o editor da justificação exibe esse conteúdo, com a mesma formatação, a mesma largura de imagem e as mesmas células mescladas
- **AND** a aba Avisos não exibe o alerta "Não foi informado um texto de justificação."

#### Scenario: Documento sem justificação
- **WHEN** o usuário abre um documento sem `Justificacao`, com uma justificação preenchida antes no editor
- **THEN** o editor da justificação fica vazio, e a aba Avisos exibe o alerta "Não foi informado um texto de justificação." quando a justificação for obrigatória

#### Scenario: Modo anexo de parecer
- **WHEN** o usuário abre, no modo anexo de parecer, um documento que contém `Justificacao`
- **THEN** a justificação do arquivo não é carregada

#### Scenario: Conteúdo fora do subconjunto gravado pelo editor
- **WHEN** o usuário abre um documento cuja justificação contém um elemento LexML que o editor não grava
- **THEN** o documento é aberto, e o texto desse elemento é preservado na justificação

#### Scenario: Salvar e reabrir preserva a justificação
- **WHEN** o usuário salva um documento com a justificação preenchida, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo tem a mesma `Justificacao` do primeiro

#### Scenario: Largura de tabela e de coluna ao abrir
- **WHEN** o usuário abre um documento cuja justificação tem uma tabela com largura de 80% e uma coluna de 40%
- **THEN** a tabela é exibida no editor sem essas larguras
- **AND** salvar o documento aberto grava a tabela sem `style` de largura na tabela e na coluna
