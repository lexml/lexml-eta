# Revisão de texto

## Necessidade informacional

Inclusões e exclusões dentro de um texto precisam preservar autoria e instante.

## Representação proposta

Usar os elementos LexML ins e del, acrescidos da referência ao usuário responsável e a data e hora da revisão.

Exemplo:

```xml
<del lexedit:refIdUsuario='sf:fragomeni' lexedit:data='2026-05-11T15:51:00-03:00'>redação anterior</del>
<ins lexedit:refIdUsuario='sf:fragomeni' lexedit:data='2026-05-11T15:52:00-03:00'>nova redação</ins>
```
