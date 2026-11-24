## Purpose

Definir para onde levam os botões "Ir para o próximo dispositivo alterado" e "Ir para o dispositivo alterado anterior" do editor da articulação, em que ordem as marcas de revisão são percorridas e como os dispositivos excluídos em revisão entram nessa ordem.

## ADDED Requirements

### Requirement: Navegação pelas marcas na ordem de leitura
Os botões de navegação entre dispositivos alterados SHALL levar o cursor à marca de revisão seguinte ou anterior à linha atual, na ordem de leitura da tela: ementa, preâmbulo e articulação. Cada dispositivo excluído em revisão SHALL ocupar o lugar logo depois do dispositivo acima dele, ou do excluído acima dele quando há excluídos seguidos. Quando não há marca na direção pedida, o cursor SHALL ficar onde está.

#### Scenario: Descer e subir passam pelas mesmas marcas
- **WHEN** o documento tem marcas de revisão, incluindo um dispositivo excluído, e o usuário desce de marca em marca a partir da ementa e depois sobe
- **THEN** a subida passa pelas mesmas marcas da descida, em ordem inversa

#### Scenario: Subir a partir do último dispositivo, excluído
- **WHEN** o último artigo do documento foi excluído em revisão, há uma marca acima dele e o cursor está nele
- **THEN** o botão de subir leva o cursor à marca acima

#### Scenario: Navegar a partir de um excluído até outro excluído
- **WHEN** dois artigos não vizinhos foram excluídos em revisão, sem outras marcas entre eles, e o cursor está no primeiro
- **THEN** o botão de descer leva o cursor ao segundo, e dele o botão de subir volta ao primeiro

#### Scenario: Exclusão logo depois de um dispositivo alterado
- **WHEN** o texto de um artigo foi alterado e o artigo seguinte foi excluído em revisão
- **THEN** a partir do artigo alterado o botão de descer leva ao excluído, e a partir do artigo depois do excluído o botão de subir leva ao excluído

#### Scenario: Dois excluídos seguidos
- **WHEN** dois artigos vizinhos foram excluídos em revisão e o cursor está numa marca acima deles
- **THEN** o botão de descer leva ao primeiro excluído e, em seguida, ao segundo

#### Scenario: Sem marca na direção pedida
- **WHEN** o cursor está na última marca do documento e o usuário usa o botão de descer
- **THEN** o cursor fica onde está
