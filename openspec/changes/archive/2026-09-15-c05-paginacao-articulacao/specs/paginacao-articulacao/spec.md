## Purpose

Paginação de articulação divide documentos legislativos grandes em múltiplas páginas virtuais, exibindo só uma por vez no editor, para manter performance e usabilidade quando a proposição tem muitos dispositivos.

## ADDED Requirements

### Requirement: Divisão em páginas por limite de dispositivos
O sistema SHALL dividir a articulação em múltiplas páginas quando o número total de dispositivos (incluindo toda a hierarquia — artigo, caput, parágrafos, incisos, alíneas, itens) exceder um limite configurável, com valor padrão de 1250 dispositivos por página.

#### Scenario: Documento pequeno fica em página única
- **WHEN** o documento tem menos dispositivos que o limite configurado
- **THEN** todos os dispositivos ficam em uma única página, e o seletor de página não é exibido na interface

#### Scenario: Documento grande é dividido automaticamente
- **WHEN** o documento é carregado e o total de dispositivos excede o limite
- **THEN** o sistema calcula o número de páginas necessário e distribui os dispositivos entre elas, exibindo um seletor de página

### Requirement: Configuração por ranges explícitos de artigos
O sistema SHALL permitir substituir o cálculo automático por ranges de artigos definidos explicitamente na configuração de paginação.

#### Scenario: Ranges explícitos sobrepõem o limite automático
- **WHEN** a configuração de paginação fornece ranges de artigos explícitos
- **THEN** o sistema cria as páginas exatamente conforme os ranges fornecidos, ignorando o limite de dispositivos por página

### Requirement: Paginação sempre quebra em fronteira de artigo
O sistema SHALL garantir que nenhuma página termine no meio de um artigo — a divisão nunca separa um artigo de seus próprios filhos (caput, parágrafos, incisos etc.).

#### Scenario: Cálculo automático respeita fronteira de artigo
- **WHEN** o sistema calcula onde uma página deve terminar
- **THEN** o ponto de corte é sempre o último artigo completo que cabe no limite, mesmo que isso resulte em menos dispositivos do que o limite configurado

#### Scenario: Agrupadores entre páginas são preservados
- **WHEN** existem agrupadores (Livro, Título, Capítulo, Seção) entre o último artigo de uma página e o primeiro artigo da página seguinte
- **THEN** esses agrupadores são incluídos na página seguinte, mantendo o contexto hierárquico visível

### Requirement: Cada dispositivo pertence a exatamente uma página, localizável por identidade estável
O sistema SHALL manter, para qualquer dispositivo da articulação, a capacidade de localizar em qual página ele está — mesmo depois de renumeração — usando sua identidade estável (uuid), não seu identificador textual (que muda ao renumerar).

#### Scenario: Localização de página sobrevive à renumeração
- **WHEN** um dispositivo é renumerado (seu lexmlId muda) sem mudar de página
- **THEN** o sistema continua localizando corretamente a página que o contém, buscando pelo uuid do dispositivo

### Requirement: Navegação entre páginas recarrega o editor
Ao selecionar uma página diferente, o sistema SHALL recarregar o conteúdo do editor mostrando apenas os dispositivos da página selecionada — não é um simples scroll.

#### Scenario: Usuário seleciona outra página
- **WHEN** o usuário seleciona uma página diferente no seletor
- **THEN** o editor é limpo e recarregado apenas com os dispositivos da página escolhida, e o seletor reflete a nova seleção

### Requirement: Atualização incremental da paginação após ações estruturais
Quando dispositivos são adicionados, removidos ou movidos, o sistema SHALL atualizar a paginação existente incrementalmente, sem recalcular todas as páginas do zero.

#### Scenario: Dispositivo adicionado entra na página correta
- **WHEN** um novo dispositivo é adicionado
- **THEN** ele é inserido na página onde seu ponto de inserção se encontra, sem afetar as demais páginas

#### Scenario: Dispositivo removido sai de todas as páginas
- **WHEN** um dispositivo é removido da articulação
- **THEN** ele é removido de qualquer página que o contivesse

#### Scenario: Dispositivo movido entre páginas leva o usuário à nova página
- **WHEN** um dispositivo é movido de uma página para outra (ex.: movimentação que cruza a fronteira entre páginas)
- **THEN** ele é removido da página de origem e inserido na página de destino; se a página do dispositivo selecionado mudou, o usuário é levado automaticamente para a nova página

### Requirement: Inclusão de dispositivos excluídos em modo de revisão
Quando o modo de revisão está ativo, o sistema SHALL manter dispositivos marcados como excluídos navegáveis dentro da paginação, mesmo não fazendo mais parte da articulação ativa.

#### Scenario: Dispositivo excluído em revisão permanece localizável
- **WHEN** o modo de revisão está ativo e um dispositivo foi marcado como excluído
- **THEN** seu identificador continua presente na página correspondente, permitindo que o usuário navegue até ele

### Requirement: Caso de documento vazio (emenda onde couber)
Quando a proposição não tem articulação prévia (emenda "onde couber"), o sistema SHALL apresentar uma página única vazia, que passa a receber dispositivos conforme eles são adicionados.

#### Scenario: Abrir emenda onde couber
- **WHEN** o usuário abre uma emenda sem articulação prévia
- **THEN** o sistema apresenta uma página única, sem dispositivos e sem seletor de página, pronta para receber conteúdo
