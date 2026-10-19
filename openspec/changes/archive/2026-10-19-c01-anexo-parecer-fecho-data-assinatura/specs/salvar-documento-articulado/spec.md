## REMOVED Requirements

### Requirement: Fecho no modo anexo de parecer
**Reason**: O modo anexo de parecer passa a ocultar apenas a aba de justificação; local, data e fecho são salvos como no modo normal (issue #1022).
**Migration**: Aplicar as regras gerais de serialização do local e da data do fecho e de `ParteFinal`; ver a capability `modo-anexo-parecer`.

### Requirement: Autoria no modo anexo de parecer
**Reason**: Autoria e assinaturas passam a ser salvas também no modo anexo de parecer (issue #1022).
**Migration**: Aplicar as regras gerais de serialização da autoria de parlamentares e das assinaturas; ver a capability `modo-anexo-parecer`.
