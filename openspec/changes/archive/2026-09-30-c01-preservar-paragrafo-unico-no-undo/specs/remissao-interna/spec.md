## ADDED Requirements

### Requirement: Preservação da forma "único" do parágrafo em ações que o recriam
Toda ação que recria um parágrafo a partir do histórico ou de uma revisão — desfazer/refazer um movimento, desfazer/refazer uma remoção, rejeitar uma revisão de movimentação — SHALL recriá-lo na mesma forma que ele tinha no momento registrado ("Parágrafo único." ou numerada, ex.: "§ 1º") sempre que ele continuar sendo o único parágrafo do seu artigo. O rótulo exibido, o identificador salvo e o texto das remissões que apontam para ele MUST seguir essa forma. Quando o artigo recriado tem mais de um parágrafo, a forma numerada SHALL prevalecer.

#### Scenario: Desfazer o movimento do artigo de um parágrafo único referenciado
- **WHEN** existe uma remissão "parágrafo único do art. 2º", o usuário move o art. 2º para cima e depois desfaz (undo) o movimento
- **THEN** o parágrafo continua "Parágrafo único." e a remissão continua "parágrafo único do art. 2º", nunca "§ 1º do art. 2º"

#### Scenario: Refazer o movimento do artigo de um parágrafo único referenciado
- **WHEN** após desfazer o movimento do cenário anterior o usuário o refaz (redo)
- **THEN** a remissão passa a "parágrafo único do art. 1º", mantendo a forma "único"

#### Scenario: Rejeitar a revisão de movimentação do artigo de um parágrafo único referenciado
- **WHEN** com revisão ativa o usuário move o artigo de um parágrafo único referenciado e depois rejeita essa revisão de movimentação
- **THEN** o parágrafo e a remissão voltam à posição original mantendo a forma "único"

#### Scenario: Desfazer a remoção de um parágrafo único redigido como "§ 1º"
- **WHEN** um documento aberto de arquivo tem um artigo com um único parágrafo redigido pelo autor como "§ 1º", referenciado por uma remissão "§ 1º do art. 2º", e o usuário remove esse parágrafo e desfaz (undo) a remoção
- **THEN** o parágrafo volta como "§ 1º", é salvo com o mesmo identificador de antes da remoção, e a remissão continua "§ 1º do art. 2º", nunca "parágrafo único do art. 2º"

#### Scenario: Artigo recriado com mais de um parágrafo
- **WHEN** uma ação recria um parágrafo registrado como "Parágrafo único." em um artigo que, após a recriação, tem mais de um parágrafo
- **THEN** o parágrafo recebe a forma numerada correspondente à sua posição, e as remissões para ele seguem essa forma
