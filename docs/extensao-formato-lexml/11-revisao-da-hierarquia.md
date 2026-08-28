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

A articulação do LexML representa sempre a versão atual do documento, já incorporando todas as revisões.

Todas as informações sobre uma revisão — o que mudou, quem mudou e quando — ficam nos metadados do LexEdit, em `lexedit:Metadado/lexedit:RevisoesArticulacao`. Cada alteração é registrada em um elemento `lexedit:RevisaoArticulacao`, com os atributos `revisao`, `refIdUsuario` e `data`.

Os atributos `refIdUsuario` e `data` devem se referir à última operação registrada no caso de mais de uma operação de revisão sobre o mesmo dispositivo.

O atributo `refIdDispositivo` referencia, pelo `id`, o dispositivo da articulação que é alvo da revisão. Ele está presente em todas as operações, exceto na exclusão: como o dispositivo excluído não está na articulação, não há um `id` de articulação para referenciar (ver [Exclusão de dispositivo](#exclusão-de-dispositivo)).

`refIdUsuario` aponta para o registro definido em [Registro de usuários](12-registro-usuarios.md), e `data` usa ISO 8601 com fuso horário.

Quando a revisão precisa preservar conteúdo anterior à alteração — o texto original de um dispositivo alterado, ou o próprio dispositivo excluído —, esse conteúdo fica dentro do elemento `lexedit:RevisaoArticulacao`, e não mais junto ao dispositivo na articulação.

### Gramática do atributo `revisao`

```
revisao   = operacao ( "," operacao )*
operacao  = nome ( ";" argumento )*
```

As operações previstas são:

| Operação | Forma | Argumentos |
| --- | --- | --- |
| Inclusão | `adicionado` | — |
| Exclusão | `excluido` | — |
| Alteração de texto | `alterado` | — |
| Movimentação | `movido;<posicaoOriginal>` | sequencial, iniciando em 1, da posição que o dispositivo ocupava antes da movimentação |
| Transformação de tipo | `transformado;<tipoOriginal>` | tipo do dispositivo antes da transformação |
| Alteração de rótulo | `alteracaoRotulo;<idOriginal>` | id que o dispositivo tinha antes da alteração de rótulo |

### Identificação dos dispositivos

O `id` dos dispositivos na articulação acompanha sempre o estado atual do documento: se um dispositivo é movido ou outro é excluído, os ids subsequentes são recalculados segundo as regras usuais do LexML, sem qualquer necessidade de sufixo adicional — o dispositivo excluído não ocupa mais posição na articulação, logo não disputa id com nenhum outro.

O dispositivo excluído recebe, dentro de `RevisaoArticulacao`, um id próprio: o id que representa a posição de apresentação na edição, acrescido do prefixo `_` de do sufixo `-exc<posicaoExcluido>`.

### Inclusão de dispositivo

O novo dispositivo já aparece na articulação em sua forma final, sem qualquer atributo especial. A revisão é registrada em `RevisaoArticulacao`, que referencia o dispositivo por `refIdDispositivo`.

```xml
<!-- Na articulação -->
<Artigo id="art4">
  <Rotulo>Art. 4º</Rotulo>
  <Caput id="art4_cpt">
    <p>Artigo adicionado na revisão.</p>
  </Caput>
</Artigo>
```

```xml
<!-- Nos metadados do LexEdit -->
<lexedit:RevisaoArticulacao
    refIdDispositivo="art4"
    revisao="adicionado"
    refIdUsuario="sf:fragomeni"
    data="2026-05-11T15:51:00-03:00"/>
```

O mesmo padrão se aplica a dispositivos internos, como incisos.

### Exclusão de dispositivo

O dispositivo excluído não permanece na articulação: os dispositivos seguintes já assumem, desde já, o rótulo e o id que teriam no documento final. O dispositivo excluído fica preservado como filho do próprio elemento `RevisaoArticulacao`, identificado pelo id que o posiciona com o prefixo `_`. Por não estar na articulação, essa revisão não tem o atributo `refIdDispositivo`.

```xml
<!-- Nos metadados do LexEdit -->
<lexedit:RevisaoArticulacao
    revisao="excluido"
    refIdUsuario="sf:fragomeni"
    data="2026-05-11T15:51:00-03:00">
  <Artigo id="_art3-exc1">
    <Rotulo>Art. 3º</Rotulo>
    <Caput id="_art3-exc1_cpt">
      <p>Orig. 3</p>
    </Caput>
  </Artigo>
</lexedit:RevisaoArticulacao>
```

O sequencial em `_exc<sequencial>` posiciona o dispositivo excluído em uma sequência de dispositivos excluídos com o mesmo id, permitindo reconstruir a articulação anterior ao desfazer a operação.

Exemplo:

```
Art 1  (id art1)
Art    (excluído, id _art2-exc1)
Art    (excluído, id _art2-exc2)
Art 2  (id art2)
```

### Alteração de texto de dispositivo

O dispositivo alterado aparece na articulação já com o texto revisado. A revisão é registrada em `RevisaoArticulacao`, que referencia o dispositivo por `refIdDispositivo` e preserva o conteúdo anterior como filho.

```xml
<!-- Na articulação -->
<Inciso id="art4_cpt_inc2">
  <Rotulo>II -</Rotulo>
  <p>Texto revisado</p>
</Inciso>
```

```xml
<!-- Nos metadados do LexEdit -->
<lexedit:RevisaoArticulacao
    refIdDispositivo="art4_cpt_inc2"
    revisao="alterado"
    refIdUsuario="sf:fragomeni"
    data="2026-05-11T15:51:00-03:00">
  <p>Texto original do dispositivo</p>
</lexedit:RevisaoArticulacao>
```

### Movimentação de dispositivo

A movimentação preserva o conteúdo do dispositivo, mas altera sua posição na sequência. A articulação já mostra o dispositivo na posição final; a revisão registra sua posição original, o que permite reconstruir e desfazer a operação.

A operação tem a forma `movido;<posicaoOriginal>`, onde `<posicaoOriginal>` é o sequencial, iniciando em 1, da posição que o dispositivo ocupava entre seus irmãos antes da movimentação.

No exemplo abaixo, o inciso III (terceiro entre os irmãos) é movido para depois do inciso V e, ao desfazer a revisão, voltaria à posição 3.

```xml
<!-- Na articulação: inciso III movido para depois do inciso V -->
<Inciso id="art5_cpt_inc5">
  <Rotulo>V -</Rotulo>
  <p>Conteúdo do inciso III original.</p>
</Inciso>
```

```xml
<!-- Nos metadados do LexEdit -->
<lexedit:RevisaoArticulacao
    refIdDispositivo="art5_cpt_inc5"
    revisao="movido;3"
    refIdUsuario="sf:fragomeni"
    data="2026-05-11T15:51:00-03:00"/>
```

Uma movimentação pode coexistir com exclusão ou alteração textual. Como `<posicaoOriginal>` é um número fixo, e não uma referência a outro dispositivo, ele não precisa ser recalculado quando dispositivos vizinhos são excluídos, movidos ou adicionados. Ao desfazer a movimentação, o dispositivo deve retornar à posição correspondente à sua origem, preservando as demais revisões.

Por exemplo, ainda no exemplo acima, caso o inciso III original fosse excluído, isso não alteraria a marca `movido;3` do dispositivo transferido; apenas os rótulos e ids dos dispositivos subsequentes seriam recalculados.

O inciso movido poderia ainda ter seu texto alterado, acrescentando a operação `alterado` à revisão — nesse caso, o conteúdo original também é preservado como filho de `RevisaoArticulacao`:

```xml
<!-- Na articulação: inciso III movido para depois do inciso V; texto alterado -->
<Inciso id="art5_cpt_inc4">
  <Rotulo>IV -</Rotulo>
  <p>Novo conteúdo do inciso.</p>
</Inciso>
```

```xml
<!-- Nos metadados do LexEdit -->
<lexedit:RevisaoArticulacao
    refIdDispositivo="art5_cpt_inc4"
    revisao="movido;3,alterado"
    refIdUsuario="sf:fragomeni"
    data="2026-05-11T15:51:00-03:00">
  <p>Conteúdo do inciso III original.</p>
</lexedit:RevisaoArticulacao>
```

### Transformação de tipo

A transformação muda a espécie do dispositivo e preserva a relação com seu tipo de origem. Por exemplo, um inciso pode ser transformado em alínea, e uma alínea em inciso. A articulação já mostra o dispositivo com o tipo final.

A operação tem a forma `transformado;<tipoOriginal>`, onde `<tipoOriginal>` é o tipo do dispositivo antes da transformação.

```xml
<!-- Na articulação: inciso transformado em alínea -->
<Alinea id="art4_cpt_inc1_ali1">
  <Rotulo>a)</Rotulo>
  ...
</Alinea>
```

```xml
<!-- Nos metadados do LexEdit -->
<lexedit:RevisaoArticulacao
    refIdDispositivo="art4_cpt_inc1_ali1"
    revisao="transformado;inciso"
    refIdUsuario="sf:fragomeni"
    data="2026-05-11T15:51:00-03:00"/>
```

```xml
<!-- Na articulação: alínea transformada em inciso -->
<Inciso id="art4_cpt_inc2">
  <Rotulo>II -</Rotulo>
  ...
</Inciso>
```

```xml
<!-- Nos metadados do LexEdit -->
<lexedit:RevisaoArticulacao
    refIdDispositivo="art4_cpt_inc2"
    revisao="transformado;alinea"
    refIdUsuario="sf:fragomeni"
    data="2026-05-11T15:51:00-03:00"/>
```

A transformação pode ser combinada com alteração de texto (por exemplo: `revisao="transformado;alinea,alterado"`, preservando o texto original como filho de `RevisaoArticulacao`) e movimentação (por exemplo: `revisao="movido;1,transformado;inciso"`).

O histórico deve conservar todas as operações aplicadas, em vez de substituir uma operação pela outra.

### Alteração de rótulo em alteração de norma

Dentro de `Alteracao`, a mudança de rótulo deve armazenar o rótulo anterior. A articulação já mostra o dispositivo com o id e o rótulo finais.

A operação tem a forma `alteracaoRotulo;<idOriginal>`, onde `<idOriginal>` é o id que o dispositivo tinha antes da alteração e do qual se deriva o rótulo anterior.

```xml
<!-- Na articulação -->
<Alteracao id="art2_cpt_alt1">
  <Artigo id="art2_cpt_alt1_art4">
    <Rotulo>Art. 4º</Rotulo>
    <Caput id="art2_cpt_alt1_art4_cpt">...</Caput>
  </Artigo>
</Alteracao>
```

```xml
<!-- Nos metadados do LexEdit -->
<lexedit:RevisaoArticulacao
    refIdDispositivo="art2_cpt_alt1_art4"
    revisao="alteracaoRotulo;art2_cpt_alt1_art3"
    refIdUsuario="sf:fragomeni"
    data="2026-05-11T15:51:00-03:00"/>
```

Essa operação pode ser combinada com movimentação, transformação de tipo ou alteração textual.

## Problema identificado

```
art4_cpt_inc1
art4_cpt_inc1_ali1  RevisaoArticulacao refIdDispositivo="art4_cpt_inc1_ali1" revisao="transformado;inciso"  <-- não dá para desfazer sem excluir a alínea b
art4_cpt_inc1_ali2  RevisaoArticulacao refIdDispositivo="art4_cpt_inc1_ali2" revisao="adicionado"
```
