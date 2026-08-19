# Comentários

## Necessidade informacional

O editor precisa manter uma conversa — mensagem inicial e respostas — e ancorá-la com precisão ao texto rico ou a um dispositivo da articulação.

## Representação proposta

Uma sequência de comentários tem id próprio e contém mensagens com referência ao usuário responsável, data e texto do comentário.

O atributo `refIdUsuario` referencia um usuário em `lexedit:Metadado/lexedit:Usuarios`.

Exemplo:

```xml
<lexedit:Metadado>
    <lexedit:Comentarios>
        <lexedit:SequenciaComentario idSequenciaComentario='sc1777387565991'>
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

Na justificação, span com refIdSequenciaComentario delimita o trecho comentado:

```xml
<p>Texto da justificação com <span lexedit:refIdSequenciaComentario='sc1777387565991'>trecho comentado</span>.</p>
```

Na articulação, o atributo fica no elemento do dispositivo inteiro, como no exemplo:

```xml
<Artigo id="art2" lexml:refIdSequenciaComentario="sc1777387565991"> 
    <Rotulo>Art. 2º</Rotulo> 
 	<Caput id="art2_cpt">
        ...
```

## Decisão pendente

- Definir uso de texto rico ou não.
