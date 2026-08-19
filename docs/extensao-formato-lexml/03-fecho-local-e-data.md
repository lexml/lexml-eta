# Fecho com local e data

## Necessidade informacional

O editor precisa preencher, validar e atualizar local e data do fecho sem interpretar a redação em linguagem natural exibida no documento.

## Representação proposta

LocalDataFecho permanece sendo o lugar LexML para o texto redacional. A extensão separa os valores estruturados de local e data da forma exibida.

Exemplo:

```xml
<LocalDataFecho
    lexedit:local='Sala das Sessões'
    lexedit:data='2026-04-24'>
    <p>Sala das Sessões, 24 de abril de 2026.</p>
</LocalDataFecho>
```

O conteúdo textual é o que deve ser exibido. Os atributos permitem ao editor preencher, validar ou atualizar o fecho sem interpretar linguagem natural.
