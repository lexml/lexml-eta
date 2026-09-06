# Comentários

## Necessidade informacional

O editor precisa manter uma conversa — mensagem inicial e respostas — e ancorá-la com precisão ao texto rico ou a um dispositivo da articulação.

## Representação proposta

Uma sequência de comentários tem uma referência para o elemento comentado no LexML (que podem ser dispositivos da articulação ou trechos da justificação) e mensagens com referência ao usuário responsável, data e texto do comentário.

Para textos da justificação, convenciona-se o uso de elementos `span` com id's prefixados com `_tc` (texto comentado) e, para os dispositivos da articulação, utiliza-se o próprio id do elemento.

Exemplo:

```xml
<lexedit:Metadado>
    <lexedit:Comentarios>
        <lexedit:SequenciaComentario refIdElementoComentado='_tc1777387565991'>
            <lexedit:Comentario refIdUsuario='sf:fragomeni' data='2026-05-11T15:51:00-03:00'>
                <p>Confirmar a fonte deste dado.</p>
            </lexedit:Comentario>
            <lexedit:Comentario refIdUsuario='sf:fragomeni' data='2026-05-12T16:10:00-03:00'>
                <p>Já deveria ter sido confirmada.</p>
            </lexedit:Comentario>
        </lexedit:SequenciaComentario>
    </lexedit:Comentarios>
</lexedit:Metadado>
```

Na justificação, span com id delimita o trecho comentado:

```xml
<p>Texto da justificação com <span id='_tc1777387565991'>trecho comentado</span>.</p>
```

Na articulação, utiliza-se o id do elemento do próprio dispositivo, como no exemplo:

```xml
<Artigo id="art2"> 
    <Rotulo>Art. 2º</Rotulo> 
 	<Caput id="art2_cpt">
        ...
```
