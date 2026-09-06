# Revisão de texto

## Necessidade informacional

Inclusões e exclusões dentro de um texto precisam preservar autoria e instante.

## Representação proposta

Usar os elementos LexML ins e del com id's com prefixo `_rt` (revisão textual) para armazenamento dos dados do usuário responsável e a data e hora da revisão.

Exemplo no texto

```xml
<del id='_rt245245234523'>redação anterior</del>
<ins id='_rt879079079778'>nova redação</ins>
```

Informações complementares nos metadados.

```xml
<lexedit:Metadado>
    <lexedit:RevisoesTextuais>
        <lexedit:RevisaoTextual refIdRevisao='_rt245245234523' refIdUsuario='sf:fragomeni' data='2026-05-11T15:51:00-03:00'/>
        <lexedit:RevisaoTextual refIdRevisao='_rt879079079778' refIdUsuario='sf:fragomeni' data='2026-05-11T15:52:00-03:00'/>
    </lexedit:RevisoesTextuais>
<lexedit:Metadado>
```


