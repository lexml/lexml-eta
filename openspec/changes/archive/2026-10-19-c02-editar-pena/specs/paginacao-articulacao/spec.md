## MODIFIED Requirements

### Requirement: Paginação sempre quebra em fronteira de artigo
O sistema SHALL garantir que nenhuma página termine no meio de um artigo — a divisão nunca separa um artigo de seus próprios filhos (caput, parágrafos, incisos, penas etc.).

#### Scenario: Cálculo automático respeita fronteira de artigo
- **WHEN** o sistema calcula onde uma página deve terminar
- **THEN** o ponto de corte é sempre o último artigo completo que cabe no limite, mesmo que isso resulte em menos dispositivos do que o limite configurado

#### Scenario: Agrupadores entre páginas são preservados
- **WHEN** existem agrupadores (Livro, Título, Capítulo, Seção) entre o último artigo de uma página e o primeiro artigo da página seguinte
- **THEN** esses agrupadores são incluídos na página seguinte, mantendo o contexto hierárquico visível

#### Scenario: Pena no último artigo da página
- **WHEN** o último artigo de uma página tem uma pena como seu último dispositivo na ordem de leitura
- **THEN** a pena fica na mesma página do artigo, e a página seguinte começa no artigo seguinte

#### Scenario: Pena adicionada no último artigo da página
- **WHEN** o documento tem várias páginas e o usuário adiciona uma pena a um dispositivo do último artigo de uma página
- **THEN** a pena é inserida na mesma página, depois da subárvore do seu dono
