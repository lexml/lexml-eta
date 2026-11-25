# navegacao-dispositivos-alterados Specification

## Purpose
Definir os botões "Ir para o próximo dispositivo revisado" e "Ir para o dispositivo revisado anterior" do editor da articulação: onde ficam, quando estão habilitados, para onde levam, em que ordem as marcas de revisão são percorridas e como os dispositivos excluídos em revisão entram nessa ordem.

## Requirements

### Requirement: Navegação pelas marcas na ordem de leitura
Os botões de navegação entre dispositivos revisados SHALL levar o cursor à marca de revisão seguinte ou anterior à linha atual, na ordem de leitura da tela: ementa, preâmbulo e articulação. Cada dispositivo excluído em revisão SHALL ocupar o lugar logo depois do dispositivo acima dele, ou do excluído acima dele quando há excluídos seguidos. Quando não há marca na direção pedida, o cursor SHALL ficar onde está.

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

### Requirement: Botões de navegação entre dispositivos revisados
O editor da articulação SHALL oferecer os botões "Ir para o próximo dispositivo revisado" e "Ir para o dispositivo revisado anterior" no lado direito da barra de ferramentas, logo à esquerda da chave "Marcas de revisão". Com o modo de revisão desligado, os dois botões SHALL ficar desabilitados, em cinza e com o cursor de seta; com o modo ligado, SHALL ficar habilitados.

#### Scenario: Modo de revisão desligado
- **WHEN** o modo de revisão está desligado
- **THEN** os dois botões estão desabilitados, em cinza e com o cursor de seta

#### Scenario: Modo de revisão ligado
- **WHEN** o usuário liga o modo de revisão, ou abre um documento com marcas de revisão
- **THEN** os dois botões ficam habilitados

#### Scenario: Nomes dos botões
- **WHEN** o usuário passa o mouse sobre os botões
- **THEN** os tooltips são "Ir para o próximo dispositivo revisado" e "Ir para o dispositivo revisado anterior"

#### Scenario: Posição junto à chave
- **WHEN** a barra de ferramentas do texto articulado é exibida
- **THEN** os dois botões ficam no lado direito, logo à esquerda da chave "Marcas de revisão"
