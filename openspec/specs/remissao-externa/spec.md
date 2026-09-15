# Remissão Externa

## Purpose

Remissão externa é a detecção, criação, atualização e remoção de referências a normas **fora** do documento sendo editado (ex.: "art. 5º da Lei nº 8.069, de 13 de julho de 1990"), representadas como links navegáveis apontando para a URN LexML da norma citada. Ver também a capability irmã `remissao-interna` (referências dentro do mesmo documento) — mesmo diálogo de criação manual, mesmo gatilho de blur, coordenação mútua na detecção.

## Requirements

### Requirement: Detecção automática de citação a norma externa
O sistema SHALL detectar automaticamente, no texto de um dispositivo, citações a normas externas (ex.: "Lei nº 8.069, de 13 de julho de 1990" e variantes abreviadas) e criar um link apontando para a URN LexML correspondente, sem diálogo de confirmação.

#### Scenario: Citação completa reconhecida
- **WHEN** o usuário digita um texto contendo uma citação completa de norma externa (ex.: "art. 5º da Lei nº 8.069, de 13 de julho de 1990") e sai da linha
- **THEN** o sistema cria automaticamente um link apontando para a URN LexML da norma citada, sem exigir confirmação do usuário

#### Scenario: Detecção roda no navegador, sem chamada de rede
- **WHEN** o texto do dispositivo é analisado em busca de citações
- **THEN** o reconhecimento é feito localmente por um parser rodando em um Web Worker no navegador, sem requisição de rede para a detecção em si

#### Scenario: Chamada obsoleta é descartada
- **WHEN** uma nova análise de texto é disparada antes de uma análise anterior do mesmo fluxo terminar
- **THEN** o resultado da análise anterior é descartado, e só o resultado da mais recente é aplicado

### Requirement: Criação de remissão externa só ao sair do dispositivo em edição
A criação automática de remissões externas SHALL seguir o mesmo gatilho por blur usado pela remissão interna — nunca a cada pausa de digitação.

#### Scenario: Detecção compartilha o gatilho da remissão interna
- **WHEN** o usuário sai do dispositivo em edição (troca de linha, foco sai do editor, ou aciona salvar sem sair da linha)
- **THEN** a detecção de remissão externa roda no mesmo momento em que a detecção de remissão interna roda, sem gatilho próprio adicional

### Requirement: Coordenação com a detecção de remissão interna
Quando um trecho de texto é reconhecido como citação de norma externa, o sistema SHALL garantir que esse mesmo trecho não permaneça também marcado como remissão interna.

#### Scenario: Número de artigo dentro de uma citação externa não vira remissão interna
- **WHEN** um texto como "art. 5º da Lei nº 8.069, de 1990" é digitado, e a detecção interna (síncrona) inicialmente trata "art. 5º" como referência local antes da externa (assíncrona) resolver
- **THEN** assim que a remissão externa é criada, a remissão interna conflitante para o mesmo trecho é removida — tanto do registro quanto do link já renderizado no editor

#### Scenario: Citação externa cujo número de artigo colide com um artigo local
- **WHEN** o número de artigo citado numa referência externa coincide com o número de um artigo existente no próprio documento
- **THEN** apenas a remissão externa é criada para aquele trecho; nenhuma remissão interna é criada para o mesmo texto

### Requirement: Criação e edição manual de remissão externa via diálogo compartilhado
O sistema SHALL permitir criar ou editar manualmente uma remissão externa através do mesmo diálogo usado para remissão interna (aba "Externa" — ver `openspec/specs/remissao-interna/spec.md`), com busca de norma por nome/autocomplete.

#### Scenario: Criar remissão externa manualmente
- **WHEN** o usuário seleciona um trecho de texto, abre o diálogo de remissão na aba "Externa" e escolhe uma norma via autocomplete
- **THEN** o sistema cria um link de remissão externa para a URN da norma escolhida, cobrindo casos que a detecção automática não reconhece (apelidos não suportados, formatos atípicos)

#### Scenario: Editar remissão automática sem nome de norma
- **WHEN** o usuário abre para edição uma remissão externa que foi criada automaticamente (e portanto não tem nome amigável da norma preenchido)
- **THEN** o sistema busca o nome da norma a partir da URN para preencher o diálogo de edição

### Requirement: Colagem de link de remissão externa
O sistema SHALL reconhecer links de remissão externa colados no editor, convertendo-os para o formato interno quando necessário.

#### Scenario: Colar link já no formato de remissão externa
- **WHEN** o usuário cola um trecho contendo um link já formatado como remissão externa (de outro ponto do mesmo editor, ou de um documento aberto)
- **THEN** o link é preservado no formato de remissão externa

#### Scenario: Colar link legado com URN direta no href
- **WHEN** o usuário cola um link cujo `href` aponta diretamente para uma URN LexML, mas sem os atributos do formato próprio de remissão externa
- **THEN** o sistema converte o link colado para o formato próprio de remissão externa

### Requirement: Persistência das remissões externas ao salvar e abrir o documento
O sistema SHALL serializar as remissões externas no LexML salvo, usando o mesmo elemento de remissão da remissão interna (diferenciado pela forma da URN no lugar de um id local de dispositivo), e reconstruí-las ao reabrir o documento.

#### Scenario: Salvar aciona a mesma cadeia determinística da remissão interna
- **WHEN** o usuário salva o documento
- **THEN** o sistema força a detecção pendente da última linha editada antes de serializar, garantindo que nenhuma citação recém-digitada seja perdida por não ter saído da linha

#### Scenario: Abrir documento reconstrói o registro a partir do texto
- **WHEN** um documento salvo é reaberto
- **THEN** o sistema reconstrói o registro de remissões externas varrendo o texto de cada dispositivo em busca dos atributos do link, sem depender de nenhuma marcação especial produzida pelo parser XML

#### Scenario: Nome amigável da norma não sobrevive ao reload
- **WHEN** um documento com remissões externas é reaberto
- **THEN** o nome amigável da norma não é restaurado automaticamente (fica vazio até o usuário abrir a remissão para edição, que aciona a busca reversa por URN) — comportamento esperado, não uma falha de persistência

#### Scenario: Undo/redo recomputa em vez de reverter incrementalmente
- **WHEN** o usuário desfaz ou refaz uma ação depois de criar/remover uma remissão externa
- **THEN** o registro de remissões externas é recomputado do zero a partir do texto resultante, em vez de reverter incrementalmente a última mudança — a remissão externa não precisa de recálculo por renumeração, já que aponta para uma norma fora do documento
