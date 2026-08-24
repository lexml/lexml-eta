# Revisão da hierarquia

## Necessidade informacional

Registrar alterações realizadas na articulação do texto legislativo quando o editor opera em modo de revisão de uma forma que seja possível aceitar ou recusar essas alterações propostas e identificar o autor e momento da alteração.

Este rascunho abrange:
- inclusão e exclusão de dispositivo;
- alteração de texto de dispositivo;
- movimentação na sequência de dispositivos;
- transformação de tipo, por exemplo, de inciso para alínea;
- alteração de rótulo de dispositivo em uma alteração de norma.

As operações podem ocorrer em sequência e, em alguns casos, ser combinadas no mesmo dispositivo. O modelo precisa também permitir o desfazimento de uma operação sem eliminar revisões posteriores.

## Representação proposta

O dispositivo continua sendo representado pelo elemento LexML correspondente. As operações de revisão são registradas no atributo `lexedit:revisao` do próprio dispositivo, acompanhado dos atributos `lexedit:refIdUsuario` e `lexedit:data`, que identificam o responsável e o momento da alteração.

O atributo `refIdUsuario` aponta para o registro definido em [Registro de usuários](12-registro-usuarios.md), e `data` usa ISO 8601 com fuso horário.

É utilizado ainda o atributo `lexedit:textoOriginal="true"` em elementos `<p>` para preservar o texto anterior a uma alteração.


### Gramática do atributo `lexedit:revisao`

```
revisao   = operacao ( "," operacao )*
operacao  = nome ( ";" argumento )*
```

As operações previstas são:

| Operação | Forma | Argumentos |
| --- | --- | --- |
| Inclusão | `adicionado` | — |
| Exclusão | `excluido;<sequencial>` | ordem da exclusão entre dispositivos que passariam a ter o mesmo rótulo |
| Alteração de texto | `alterado` | — |
| Movimentação | `movido;<posicaoOriginal>` | sequencial, iniciando em 1, da posição que o dispositivo ocupava antes da movimentação |
| Transformação de tipo | `transformado;<tipoOriginal>` | tipo do dispositivo antes da transformação |
| Alteração de rótulo | `alteracaoRotulo;<idOriginal>` | id que o dispositivo tinha antes da alteração de rótulo |

### Identificação dos dispositivos

O `id` acompanha o estado proposto do texto: se um dispositivo é movido ou se outro é excluído, os ids subsequentes são recalculados segundo as regras usuais do LexML.

A exclusão é o único caso em que dois dispositivos disputariam o mesmo id, já que o dispositivo excluído permanece no XML enquanto o seguinte assume o seu rótulo. Enquanto não se define um identificador técnico próprio (ver [Decisões pendentes](#decisões-pendentes)), o dispositivo excluído recebe o sufixo `-exc<sequencial>` no id, usado apenas para garantir unicidade.

### Inclusão de dispositivo

O novo dispositivo recebe `lexedit:revisao="adicionado"`. Seus filhos não precisam de atributos especiais, salvo se também forem objeto de uma revisão própria.

```xml
<Artigo id="art4"
    lexedit:revisao="adicionado"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>Art. 4º</Rotulo>
  <Caput id="art4_cpt">
    <p>Artigo adicionado na revisão.</p>
  </Caput>
</Artigo>
```

O mesmo padrão se aplica a dispositivos internos, como incisos.

### Exclusão de dispositivo

O dispositivo excluído permanece no XML, permitindo sua apresentação e o desfazimento da operação. O sequencial preserva a ordem das exclusões e diferencia dispositivos que passariam a ter o mesmo rótulo.

```xml
<Artigo id="art3-exc1"
    lexedit:revisao="excluido;1"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>Art. 3º</Rotulo>
  <Caput id="art3-exc1_cpt">
    <p>Orig. 3</p>
  </Caput>
</Artigo>
<Artigo id="art3"><Rotulo>Art. 3º</Rotulo>Orig. 4</Artigo>
```

Se o artigo subsequente também for excluído, ele recebe `id="art3-exc2"` e `lexedit:revisao="excluido;2"`.

### Alteração de texto de dispositivo

A alteração marca o dispositivo com `lexedit:revisao="alterado"`, e o conteúdo anterior é preservado em um segundo parágrafo, identificado pelo atributo `lexedit:textoOriginal="true"`.

```xml
<Inciso id="art4_cpt_inc2"
    lexedit:revisao="alterado"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>II -</Rotulo>
  <p>Texto revisado</p>
  <p lexedit:textoOriginal="true">Texto original do dispositivo</p>
</Inciso>
```

### Movimentação de dispositivo

A movimentação preserva o conteúdo, mas altera sua posição na sequência. A revisão registra a posição original do dispositivo, o que permite reconstruir e desfazer a operação.

A operação tem a forma `movido;<posicaoOriginal>`, onde `<posicaoOriginal>` é o sequencial, iniciando em 1, da posição que o dispositivo ocupava entre seus irmãos antes da movimentação.

No exemplo abaixo, o inciso III (terceiro entre os irmãos) é movido para depois do inciso V e, ao desfazer a revisão, voltaria à posição 3.

```xml
<!-- Inciso III movido para depois do inciso V -->
<Inciso id="art5_cpt_inc5"
    lexedit:revisao="movido;3"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>V -</Rotulo>
  <p>Conteúdo do inciso III original.</p>
</Inciso>
```

Uma movimentação pode coexistir com exclusão ou alteração textual. Como `<posicaoOriginal>` é um número fixo, e não uma referência a outro dispositivo, ele não precisa ser recalculado quando dispositivos vizinhos são excluídos, movidos ou adicionados. Ao desfazer a movimentação, o dispositivo deve retornar à posição correspondente à sua origem, preservando as demais revisões.

Por exemplo, ainda no exemplo acima, caso o inciso III original fosse excluído, isso não alteraria a marca `movido;3` do dispositivo transferido; apenas os rótulos e ids dos dispositivos subsequentes seriam recalculados.

O inciso movido poderia ainda ter seu texto alterado, acrescentando a operação `alterado` ao atributo, como no exemplo:

```xml
<!-- Inciso III movido para depois do inciso V; exclusão do novo inciso III; alteração de texto do inciso resultante -->
<Inciso id="art5_cpt_inc4"
    lexedit:revisao="movido;3,alterado"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>IV -</Rotulo>
  <p>Novo conteúdo do inciso.</p>
  <p lexedit:textoOriginal="true">Conteúdo do inciso III original.</p>
</Inciso>
```

### Transformação de tipo

A transformação muda a espécie do dispositivo e preserva a relação com seu tipo de origem. Por exemplo, um inciso pode ser transformado em alínea, e uma alínea em inciso.

A operação tem a forma `transformado;<tipoOriginal>`, onde `<tipoOriginal>` é o tipo do dispositivo antes da transformação.

```xml
<!-- Inciso transformado em alínea -->
<Alinea id="art4_cpt_inc1_ali1"
    lexedit:revisao="transformado;inciso"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>a)</Rotulo>
  ...
</Alinea>

<!-- Alínea transformada em inciso -->
<Inciso id="art4_cpt_inc2"
    lexedit:revisao="transformado;alinea"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>II -</Rotulo>
  ...
</Inciso>
```

A transformação pode ser combinada com alteração de texto (por exemplo: `lexedit:revisao="transformado;alinea,alterado"`) e movimentação (por exemplo: `lexedit:revisao="movido;1,transformado;inciso"`).

O histórico deve conservar todas as operações aplicadas, em vez de substituir uma operação pela outra.

### Alteração de rótulo em alteração de norma

Dentro de `Alteracao`, a mudança de rótulo deve armazenar o rótulo anterior.

A operação tem a forma `alteracaoRotulo;<idOriginal>`, onde `<idOriginal>` é o id que o dispositivo tinha antes da alteração e do qual se deriva o rótulo anterior.

```xml
<Alteracao id="art2_cpt_alt1">
  <Artigo id="art2_cpt_alt1_art4"
      lexedit:revisao="alteracaoRotulo;art2_cpt_alt1_art3"
      lexedit:refIdUsuario="sf:fragomeni"
      lexedit:data="2026-05-11T15:51:00-03:00">
    <Rotulo>Art. 4º</Rotulo>
    <Caput id="art2_cpt_alt1_art4_cpt">...</Caput>
  </Artigo>
</Alteracao>
```

Essa operação pode ser combinada com movimentação, transformação de tipo ou alteração textual.

## Decisões pendentes

- Definir um identificador técnico único e estável para dispositivos excluídos, substituindo o sufixo `-exc<sequencial>` adotado provisoriamente.
- Definir se `lexedit:refIdUsuario` e `lexedit:data` devem se referir à última operação registrada ou se cada operação precisa de autoria e momento próprios.
- Definir a ordem e a semântica de operações combinadas, inclusive ao desfazer uma operação intermediária.
- Definir como desfazer uma transformação quando houver dispositivos adicionados sob o dispositivo transformado, sem excluí-los indevidamente.

## Problema identificado

```
art4_cpt_inc1
art4_cpt_inc1_ali1  lexedit:revisao="transformado;inciso"  <-- não dá para desfazer sem excluir a alínea b
art4_cpt_inc1_ali2  lexedit:revisao="adicionado"
```
