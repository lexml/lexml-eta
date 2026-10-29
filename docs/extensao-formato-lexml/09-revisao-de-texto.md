# Revisão de texto

## Necessidade informacional

Inclusões e exclusões dentro de um texto precisam preservar autoria e instante.

As revisões de texto ocorrem apenas na justificação, não na articulação, que tem seu próprio mecanismo de revisão, descrito em [Revisão da hierarquia](11-revisao-da-hierarquia.md).

## Representação adotada

Usar os elementos LexML `ins` e `del` com ids de prefixo `_rt` (revisão textual). O usuário responsável e a data e hora da revisão ficam nos metadados.

### Id de cada elemento

O id de cada elemento é `_rt<id-revisao>_<n>`:

- `id-revisao` identifica a revisão no editor. Uma mesma revisão pode gerar vários elementos: a substituição gera um `del` e um `ins`, e a exclusão que atravessa uma formatação (ex.: negrito) gera um `del` para cada trecho.
- `n` é a posição do elemento, a partir de 1, entre os de mesmo `id-revisao`, na ordem do documento, contando `ins` e `del` juntos. O sufixo garante que o id seja único (`xsd:ID`).

Ao abrir, o `id-revisao` é o id sem o prefixo `_rt` e sem o sufixo `_<n>`, o que reagrupa os elementos da mesma revisão para serem aceitos ou rejeitados juntos. Um id `_rt…` sem sufixo usa o resto como `id-revisao`.

Exemplo no texto (substituição, `id-revisao` `a1b2…0002`)

```xml
<del id='_rta1b2c3d4-0000-4000-8000-000000000002_1'>redação anterior</del>
<ins id='_rta1b2c3d4-0000-4000-8000-000000000002_2'>nova redação</ins>
```

### Metadados

Há um `RevisaoTextual` por elemento, porque `refIdRevisao` aponta para um único id. Os elementos da mesma revisão repetem o autor e a data.

```xml
<lexedit:Metadado>
    <lexedit:RevisoesTextuais>
        <lexedit:RevisaoTextual refIdRevisao='_rta1b2c3d4-0000-4000-8000-000000000002_1' refIdUsuario='sf:fulano' data='2026-05-11T15:51:00-03:00'/>
        <lexedit:RevisaoTextual refIdRevisao='_rta1b2c3d4-0000-4000-8000-000000000002_2' refIdUsuario='sf:fulano' data='2026-05-11T15:51:00-03:00'/>
    </lexedit:RevisoesTextuais>
<lexedit:Metadado>
```

O autor de cada revisão entra em `Usuarios` ([Registro de usuários](12-registro-usuarios.md)), junto com os das revisões da hierarquia, e a pendência "Resolver marcas de revisão de texto." é gravada enquanto houver marca ([Outros metadados](13-outros-metadados-do-lexedit.md)).

### Casos particulares

- **Marca só com o cursor:** o editor pode deixar um `ins`/`del` que só contém o caractere de cursor. Ela é gravada como texto comum, sem `RevisaoTextual`.
- **`ins`/`del` sem `RevisaoTextual` ao abrir** (ex.: arquivo editado fora do LexEdit): vira marca do usuário "Anônimo", com a data e hora da abertura. O `id-revisao` sai do id quando ele tem o prefixo `_rt`; sem esse prefixo, ou sem id, a marca forma uma revisão sozinha.
- **Usuário não registrado em `Usuarios`:** o `refIdUsuario` é usado como identificador e como nome.
- **`ins`/`del` dentro de uma nota de rodapé:** fica só com o conteúdo, sem marca.


