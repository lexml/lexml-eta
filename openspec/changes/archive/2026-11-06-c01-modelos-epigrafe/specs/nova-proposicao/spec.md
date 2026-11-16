## REMOVED Requirements

### Requirement: Epígrafe e preâmbulo fornecidos pelo vocabulário
**Reason**: O serviço de epígrafe (#1053) passa a existir, e o caso provisório "serviço ainda não implementado" deixa de fazer sentido. Substituído por "Epígrafe e preâmbulo obtidos do vocabulário", sem esse caso.
**Migration**: Nenhuma para o host: o contrato do evento não muda; a `epigrafe` passa a vir de `montaEpigrafe`.

## ADDED Requirements

### Requirement: Epígrafe e preâmbulo obtidos do vocabulário
O componente SHALL obter `preambulo` do vocabulário (texto padrão por tipo e autoridade) e `epigrafe` do serviço de epígrafe do vocabulário (`montaEpigrafe`), a partir de `urn`, `urnDocumentoReferenciado` e um sufixo opcional, e MUST depender apenas dessa interface. No `SF`, o componente SHALL informar o sufixo `- PLEN` quando o destino é Plenário e `- <sigla da comissão>` quando é Comissão; na `CD`, MUST NOT informar sufixo. Quando o tipo não tiver texto padrão, o próprio componente SHALL aplicar o fallback do preâmbulo, sem alterar a função de obtenção do texto padrão nem a abertura de documentos.

#### Scenario: Epígrafe de substitutivo
- **WHEN** o fluxo é concluído para um substitutivo
- **THEN** a `epigrafe` do `detail` é a devolvida pelo serviço do vocabulário para as duas URNs

#### Scenario: Sufixo no SF com destino Plenário
- **WHEN** a casa é `SF` e o destino é Plenário
- **THEN** o componente chama o serviço de epígrafe com o sufixo `- PLEN`

#### Scenario: Sufixo no SF com destino Comissão
- **WHEN** a casa é `SF` e o destino é a comissão de sigla `CCJ`
- **THEN** o componente chama o serviço de epígrafe com o sufixo `- CCJ`

#### Scenario: Sem sufixo na CD
- **WHEN** a casa é `CD`
- **THEN** o componente chama o serviço de epígrafe sem sufixo

#### Scenario: Proposição sem modelo de epígrafe
- **WHEN** o fluxo é concluído para um PL não numerado do `SF` em 2026
- **THEN** a `epigrafe` do `detail` é `PROJETO DE LEI Nº ` seguido de 7 espaços e de `, DE 2026`

#### Scenario: Preâmbulo sem modelo
- **WHEN** o tipo do documento não tem preâmbulo padrão no vocabulário
- **THEN** o componente registra um log de erro de preâmbulo não encontrado para a URN e usa `O CONGRESSO NACIONAL decreta:` em `preambulo`; a abertura de documentos de tipo sem modelo continua sem preâmbulo e sem log
