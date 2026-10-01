# Spec Delta

## Purpose

Define como a remissão interna se comporta na co-edição: o link é derivado do texto e re-detectado em cada cliente, e a exclusão manual de uma remissão é sincronizada para que o outro cliente não a recrie.

## ADDED Requirements

### Requirement: O link de remissão é derivado do texto
O sistema SHALL tratar o link de remissão interna como derivado do texto: cada cliente o detecta localmente, e o corpo do link MUST NOT ser transmitido entre clientes.

#### Scenario: Só o texto trafega
- **WHEN** um cliente digita uma referência a um artigo
- **THEN** apenas o texto é sincronizado, e o link é criado localmente pelo receptor

### Requirement: Remissão é re-detectada ao receber texto remoto
O sistema SHALL re-detectar as remissões internas de um dispositivo quando recebe texto remoto, sem exigir interação do usuário receptor.

#### Scenario: Link aparece no receptor
- **WHEN** um cliente digita "vide o art. 2º" em um dispositivo
- **THEN** o outro cliente exibe o link para o art. 2º, sem ter interagido com o dispositivo

### Requirement: Exclusão manual é propagada
O sistema SHALL propagar a exclusão manual de uma remissão (tombstone) para os demais clientes, removendo o link do outro cliente e impedindo que a re-detecção o recrie.

#### Scenario: Link removido manualmente em um cliente
- **WHEN** um cliente exclui manualmente uma remissão que já existia nos dois
- **THEN** o link some no outro cliente e não é recriado enquanto o texto permanecer

### Requirement: Identidade semântica da exclusão
O sistema SHALL identificar uma remissão entre clientes pela posição inicial, pelo destino e pelo texto de referência, e MUST NOT usar o identificador local do link, que é gerado em cada cliente.

#### Scenario: Identificador local diferente
- **WHEN** a mesma remissão tem identificadores locais distintos nos dois clientes
- **THEN** a exclusão manual é reconhecida como a mesma remissão nos dois

### Requirement: Aplicação idempotente dos tombstones
O sistema SHALL aplicar tombstones remotos de forma idempotente: um tombstone já aplicado, ou cujo link ainda não foi detectado localmente, MUST NOT causar erro nem alteração.

#### Scenario: Tombstone repetido
- **WHEN** o mesmo tombstone é recebido mais de uma vez
- **THEN** o estado não muda a partir da segunda vez

#### Scenario: Link ainda não detectado
- **WHEN** o tombstone chega antes de o cliente detectar o link correspondente
- **THEN** nenhum erro ocorre e o link, quando detectado, permanece excluído

### Requirement: A validade da remissão é recalculada localmente
O sistema SHALL recalcular em cada cliente a validade das remissões (por exemplo, quando o alvo é removido), sem sincronizá-la como dado próprio.

#### Scenario: Alvo removido
- **WHEN** o dispositivo alvo de uma remissão é removido por um cliente
- **THEN** cada cliente marca localmente a remissão como inválida a partir da remoção propagada
