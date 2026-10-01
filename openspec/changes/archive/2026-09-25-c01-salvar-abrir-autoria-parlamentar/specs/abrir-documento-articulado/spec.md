## ADDED Requirements

### Requirement: Recuperação da autoria de parlamentares ao abrir
Ao abrir um documento com autoria de tipo `Parlamentar` nos metadados do LexEdit, o sistema SHALL exibir na aba de autoria os parlamentares registrados, na ordem do arquivo, com os dados tal como gravados (sem consultar novamente a lista de parlamentares do host), e a opção de imprimir partido e UF registrada. Parlamentares sem identificação ou sem nome SHALL ser desconsiderados; atributo ausente ou inválido dos demais SHALL assumir o valor padrão do editor, e imprimir partido e UF ausente ou inválido SHALL assumir o valor padrão (marcado). Quando o documento não tiver autoria, tiver autoria de outro tipo ou não tiver nenhum parlamentar válido, SHALL valer a autoria padrão do editor. O texto de `AssinaturaTexto` não SHALL ser interpretado: os dados estruturados são a fonte, e o texto é gerado novamente ao salvar. A quantidade de assinaturas adicionais SHALL assumir o valor padrão.

#### Scenario: Documento com dois parlamentares
- **WHEN** o usuário abre um documento cuja autoria registra Davi Alcolumbre e Soraya Thronicke, nessa ordem
- **THEN** a aba de autoria exibe os dois parlamentares nessa ordem, com o cargo do primeiro preenchido

#### Scenario: Impressão de partido e UF desmarcada
- **WHEN** o usuário abre um documento cuja autoria registra imprimir partido e UF como falso
- **THEN** a opção "Imprimir partido e UF para os signatários" aparece desmarcada

#### Scenario: Documento sem autoria
- **WHEN** o usuário abre um documento sem autoria nos metadados do LexEdit, mesmo que contenha `AssinaturaTexto`
- **THEN** a aba de autoria exibe a autoria padrão do editor

#### Scenario: Autoria de comissão
- **WHEN** o usuário abre um documento cuja autoria é de tipo `Comissão`
- **THEN** a aba de autoria exibe a autoria padrão do editor, sem impedir a abertura do documento

#### Scenario: Dados do arquivo prevalecem sobre a lista do host
- **WHEN** o usuário abre um documento cuja autoria registra para um parlamentar um partido diferente do informado na lista de parlamentares do host
- **THEN** a aba de autoria exibe o partido registrado no arquivo

#### Scenario: Salvar e reabrir preserva a autoria
- **WHEN** o usuário salva um documento com parlamentares, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo registra a mesma autoria e os mesmos `AssinaturaTexto` do primeiro
