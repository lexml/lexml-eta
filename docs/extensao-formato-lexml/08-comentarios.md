# Comentários

## Necessidade informacional

O editor precisa manter uma conversa — mensagem inicial e respostas — e ancorá-la com precisão ao texto rico ou a um dispositivo da articulação.

## Representação adotada

Uma sequência de comentários tem uma referência para o elemento comentado no LexML (que podem ser dispositivos da articulação ou trechos da justificação) e mensagens com referência ao usuário responsável, data e texto do comentário.

Para textos da justificação, convenciona-se o uso de elementos `span` com id's prefixados com `_tc` (texto comentado) e, para os dispositivos da articulação, utiliza-se o próprio id do elemento.

**Implementado só para a justificação (#972).** Comentário sobre dispositivo da articulação continua previsto aqui, mas o editor não o grava nem o lê.

### Id de cada fragmento

O id do `span` é `_tc<idSequencia>_<n>`: o sufixo `_<n>` está sempre presente, e `n` começa em 1 na ordem do documento, por sequência. Um trecho que atravessa parágrafos, células ou outras marcas vira um `span` por fragmento, todos da mesma sequência. O `refIdElementoComentado` é o id do primeiro fragmento (`_1`). Se o id da sequência não for um NCName válido, os ids do `span` e do ref usam o mesmo substituto estável. Os ids são únicos no documento, inclusive em relação aos de `ins` e `del` (`_rt<id-revisao>_<n>`).

Os comentários só são gravados em sequências que tenham trecho e ao menos um comentário. Cada linha do texto vira um `p`. O arquivo ganha a pendência "Remover comentários." e os autores entram em `Usuarios`.

### Leitura tolerante

- `span` `_tc` sem sequência correspondente vira texto comum, e a sequência sem trecho na justificação é descartada.
- `refIdElementoComentado` sem prefixo `_tc` (como o de um dispositivo) é descartado.
- Sequência sem comentário é descartada; em ids repetidos vale a primeira.
- Autor sem registro em `Usuarios` aparece pelo próprio id; data inválida vira a da abertura.
- O sufixo `_<n>` é opcional na leitura (`_tc1777387565991` também é aceito).

Exemplo:

```xml
<lexedit:Metadado>
    <lexedit:Comentarios>
        <lexedit:SequenciaComentario refIdElementoComentado='_tc1777387565991_1'>
            <lexedit:Comentario refIdUsuario='sf:fulano' data='2026-05-11T15:51:00-03:00'>
                <p>Confirmar a fonte deste dado.</p>
            </lexedit:Comentario>
            <lexedit:Comentario refIdUsuario='sf:fulano' data='2026-05-12T16:10:00-03:00'>
                <p>Já deveria ter sido confirmada.</p>
            </lexedit:Comentario>
        </lexedit:SequenciaComentario>
    </lexedit:Comentarios>
</lexedit:Metadado>
```

Na justificação, span com id delimita o trecho comentado; um trecho em dois parágrafos tem um `span` em cada:

```xml
<p>Texto da justificação com <span id='_tc1777387565991_1'>trecho</span></p>
<p><span id='_tc1777387565991_2'>comentado</span>.</p>
```

Na articulação, utiliza-se o id do elemento do próprio dispositivo, como no exemplo:

```xml
<Artigo id="art2"> 
    <Rotulo>Art. 2º</Rotulo> 
 	<Caput id="art2_cpt">
        ...
```

Obs: no caso de comentários ao caput do artigo, utilizar o id do caput em vez do id do artigo para identificação do comentário.
