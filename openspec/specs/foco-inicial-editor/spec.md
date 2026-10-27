# Foco Inicial Editor

## Purpose

Define as regras de posicionamento de foco e seleção ativa do primeiro dispositivo editável (ementa) ao inicializar o editor em uma proposição ou documento articulado.

## Requirements

### Requirement: Seleção e foco inicial na ementa
Ao carregar uma nova proposição ou documento articulado (sem troca de página), o sistema SHALL posicionar o cursor no início do conteúdo da ementa e marcar a linha da ementa como o dispositivo selecionado ativo no editor, ativando sua borda visual e notificando a seleção.

#### Scenario: Inicialização padrão de nova proposição
- **WHEN** uma nova proposição com ementa é aberta no editor e o usuário ainda não interagiu com outro elemento
- **THEN** o cursor físico de texto deve ser posicionado na ementa, a linha da ementa deve exibir a borda de elemento ativo e ser registrada como a linha atual do editor

### Requirement: Preservação de foco do usuário em caso de interação prévia
Se o usuário já tiver interagido e selecionado outro dispositivo antes da execução da rotina assíncrona de foco inicial, o sistema SHALL preservar a seleção do usuário e não forçar o foco ou seleção para a ementa.

#### Scenario: Usuário clica no primeiro artigo antes da inicialização concluir
- **WHEN** o usuário clica no primeiro artigo antes do término da rotina assíncrona de foco inicial
- **THEN** a seleção e o cursor devem permanecer no primeiro artigo, não sendo movidos para a ementa

### Requirement: Tolerância a ausência transitória de linha atual no teclado
Os handlers de evento de teclado do editor SHALL operar de forma tolerante caso acionados em um estado onde nenhuma linha esteja registrada como ativa, não lançando exceções não tratadas.

#### Scenario: Tecla pressionada sem linha atual selecionada
- **WHEN** um evento de teclado ocorre antes da definição da linha atual no editor
- **THEN** o sistema não deve disparar erro não tratado de leitura de propriedade de indefinido no console
