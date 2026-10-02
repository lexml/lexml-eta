## MODIFIED Requirements

### Requirement: Detecção automática de referências a dispositivos do mesmo documento
O sistema SHALL detectar automaticamente, no texto de um dispositivo, referências a outros dispositivos do mesmo documento (artigo, parágrafo, inciso, alínea, item, agrupador) e transformá-las em links de remissão.

#### Scenario: Referência absoluta simples
- **WHEN** o usuário digita um texto contendo "art. 3º" (ou variantes: "artigo 3", "Art. 3", case-insensitive)
- **THEN** o sistema cria uma remissão apontando para o artigo correspondente, se ele existir na articulação

#### Scenario: Referência absoluta composta (múltiplos níveis)
- **WHEN** o texto contém uma referência composta como "inciso I do § 2º do art. 3º" (até 4 níveis: artigo, parágrafo, inciso, alínea)
- **THEN** o sistema cria uma única remissão para o dispositivo mais específico, sem gerar links duplicados para os níveis intermediários

#### Scenario: Referência absoluta ao caput de um artigo
- **WHEN** o texto contém "caput do art. 3º" (ou "caput do art. 3", sem o ordinal, em qualquer caixa)
- **THEN** o sistema cria uma única remissão cujo destino é o caput do art. 3º — não o artigo inteiro — cobrindo o trecho completo "caput do art. 3º", sem gerar um segundo link para "art. 3º" dentro dele

#### Scenario: Referência ao caput ao lado de outra referência no mesmo texto
- **WHEN** o texto contém "caput do art. 2º e o art. 3º"
- **THEN** o sistema cria duas remissões distintas: uma para o caput do art. 2º e outra para o art. 3º

#### Scenario: Referência a agrupador
- **WHEN** o texto contém "Capítulo I", "Seção II do Capítulo I", ou "Capítulo Único"/"Seção Única"
- **THEN** o sistema resolve o agrupador correspondente percorrendo a árvore da articulação; para "único/única", só cria a remissão se existir exatamente um filho daquele tipo

#### Scenario: Referência contextual relativa ao dispositivo de origem
- **WHEN** o texto contém um padrão relativo como "§ 2º deste artigo", "caput deste artigo", "inciso I deste parágrafo", ou "desta Seção"
- **THEN** o sistema resolve o alvo subindo pela cadeia de ancestrais do dispositivo de origem até encontrar o tipo indicado, sem exigir um número de artigo explícito

#### Scenario: Referência implícita sem qualificador
- **WHEN** o texto contém um padrão "bare" como "§ 1º" ou "inciso II", sem sufixo "deste/desta" e sem âncora de artigo explícita
- **THEN** o sistema tenta resolver o alvo pelo contexto estrutural do dispositivo de origem (ex.: um "§ N" sem qualificador é resolvido em relação ao artigo do próprio dispositivo)

#### Scenario: Nenhuma remissão duplicada quando padrões colidem no mesmo trecho
- **WHEN** mais de uma passagem de detecção encontra um match no mesmo intervalo de texto
- **THEN** o sistema mantém apenas o match mais longo, priorizando detecção explícita sobre implícita

#### Scenario: Dispositivo referenciado não existe
- **WHEN** o texto contém um padrão de referência sintaticamente válido, mas o dispositivo apontado não existe na articulação atual
- **THEN** nenhuma remissão é criada para aquele trecho
