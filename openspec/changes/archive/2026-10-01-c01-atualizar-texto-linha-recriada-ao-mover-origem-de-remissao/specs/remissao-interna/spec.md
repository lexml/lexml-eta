## ADDED Requirements

### Requirement: Texto atualizado da remissão na linha recriada do artigo movido
Toda ação que recria a linha de um dispositivo que contém uma remissão interna — mover para cima ou para baixo, desfazer/refazer, rejeitar uma revisão de movimentação — SHALL exibir o link com o texto correspondente à numeração atual do destino, e não à numeração anterior à ação. O texto exibido, o destino do link e o texto do dispositivo no estado MUST concordar logo após a ação, sem depender de nova edição ou de salvar o documento.

#### Scenario: Mover para cima o artigo que contém a remissão
- **WHEN** o art. 3º contém a remissão "parágrafo único do art. 2º" e o usuário o move para cima, tornando-o art. 2º
- **THEN** o link exibido passa a "parágrafo único do art. 3º" e aponta para o parágrafo único do artigo que passou a ser art. 3º

#### Scenario: Desfazer o movimento
- **WHEN** após o movimento do cenário anterior o usuário desfaz (undo) a ação
- **THEN** o link exibido volta a "parágrafo único do art. 2º", com o destino correto

#### Scenario: Refazer o movimento
- **WHEN** após desfazer o usuário refaz (redo) o movimento
- **THEN** o link exibido volta a "parágrafo único do art. 3º"

#### Scenario: Origem que não é movida
- **WHEN** a remissão está em um artigo que não é movido e o usuário move o artigo de destino
- **THEN** o link exibido é atualizado para a nova numeração do destino, como antes

#### Scenario: Texto de remissão editado manualmente
- **WHEN** a remissão tem texto livre, editado pelo usuário, e o artigo que a contém é movido
- **THEN** o texto livre é preservado, sem ser substituído por texto gerado
