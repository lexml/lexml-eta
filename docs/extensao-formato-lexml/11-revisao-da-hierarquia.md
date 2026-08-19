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

O dispositivo continua sendo representado pelo elemento LexML correspondente. A revisão é indicada por complementos no id dos dispositivos (no formato de versão) e atributos do namespace `lexedit` com o usuário responsável e a data e hora. Quando necessário, são usadas referências ao dispositivo de origem.

Os exemplos mantêm a convenção `id\(revisao;operacao[;complemento]\)` para identificar o dispositivo revisado. Essa convenção é apenas ilustrativa: ainda deve ser conciliada com a exigência de que o atributo `id` do LexML seja único e estável.

Nos exemplos, `refIdUsuario` aponta para o registro definido em [Registro de usuários](12-registro-usuarios.md), e `data` usa ISO 8601 com fuso horário.

### Inclusão de dispositivo

O novo dispositivo recebe a marca `(revisao;adicionado)`. Seus filhos não precisam de atributos especiais, salvo se também forem objeto de uma revisão própria.

```xml
<Artigo id="art4(revisao;adicionado)"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>Art. 4º</Rotulo>
  <Caput id="art4(revisao;adicionado)_cpt">
    <p>Artigo adicionado na revisão.</p>
  </Caput>
</Artigo>
```

O mesmo padrão se aplica a dispositivos internos, como incisos.

### Exclusão de dispositivo

O dispositivo excluído permanece no XML, permitindo sua apresentação e o desfazimento da operação. Um sequencial diferencia exclusões de dispositivos que passariam a ter o mesmo rótulo.

```xml
<Artigo id="art3(revisao;excluido;1)"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>Art. 3º</Rotulo>
  <Caput id="art3(revisao;excluido;1)_cpt">
    <p>Orig. 3</p>
  </Caput>
</Artigo>
<Artigo id="art3"><Rotulo>Art. 3º</Rotulo>Orig. 4</Artigo>
```

Se o artigo subsequente também for excluído, cria-se outra ocorrência, como `art3(revisao;excluido;2)`. O sequencial preserva a ordem das exclusões e diferencia dispositivos com o mesmo rótulo resultante.

### Alteração de texto de dispositivo

A alteração marca o dispositivo como alterado, e o conteúdo anterior é preservado em um segundo parágrafo, identificado pelo o atributo `lexedit:revisao="original"`.

```xml
<Inciso id="art4_cpt_inc2(revisao;alterado)"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>II -</Rotulo>
  <p>Texto revisado</p>
  <p lexedit:revisao="original">Texto original do dispositivo</p>
</Inciso>
```

### Movimentação de dispositivo

A movimentação preserva o conteúdo, mas altera sua posição na sequência. A revisão deve registrar uma referência de posição que permita reconstruir e desfazer a operação.

O formato da marca de movimentação é `(revisao:movido;<refPosicao>)` on de `<refPosicao>` é o id do dispositivo cuja posição será usada para reposicionamento do dispositivo movido no caso de recusa a revisão.

No exemplo abaixo, o inciso voltaria para a posição do iniciso III atual.

```xml
<!-- Inciso III movido para depois do inciso V -->
<Inciso id="art5_cpt_inc5(revisao;movido;art5_cpt_inc3)"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>V -</Rotulo>
  <p>Conteúdo do inciso III original.</p>
</Artigo>
```

Uma movimentação pode coexistir com exclusão ou alteração textual. Ao desfazê-la, o dispositivo deve retornar à posição correspondente à sua origem, preservando as demais revisões.

Por exemplo, ainda no exemplo acima, caso de exclusão do inciso III fosse excluído, este receberá o id `art5_cpt_inc3(revisao:excluido;1)`, o que alteraria o rótulo e a referência de posição do `art5_cpt_inc5(revisao;movido;art5_cpt_inc3)` para `art5_cpt_inc4(revisao;movido;art5_cpt_inc3(revisao:excluido;1))`.

Após essa exclusão, o nosso inciso original poderia ter seu texto alterado, adicionando a marca de alteração ao seu id, como no exemplo:

```xml
<!-- Inciso III movido para depois do inciso V; exclusão do inciso III; alteração de texto do inciso IV -->
<Artigo id="art5_cpt_inc4(revisao;movido;art5_cpt_inc3(revisao:excluido;1),revisao:alterado)"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>IV -</Rotulo>
  <p>Novo conteúdo do inciso.</p>
  <p lexedit:revisao="original">Conteúdo do inciso III original.</p>
</Artigo>
```

### Transformação de tipo

A transformação muda a espécie do dispositivo e preserva a relação com seu tipo de origem. Por exemplo, um inciso pode ser transformado em alínea, e uma alínea em inciso.

O formato da marca de transformação de tipo é `(revisao:transformado;<tipoOriginal>)` on de `<tipoOriginal>` é tipo do dispositivo antes da transformação.

```xml
<!-- Inciso transformado em alínea -->
<Alinea id="art4_cpt_inc1_ali1(revisao;transformado;inciso)"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>a)</Rotulo>
  ...
</Alinea>

<!-- Alínea transformada em inciso -->
<Inciso id="art4_cpt_inc2(revisao;transformado;alinea)"
    lexedit:refIdUsuario="sf:fragomeni"
    lexedit:data="2026-05-11T15:51:00-03:00">
  <Rotulo>II -</Rotulo>
  ...
</Inciso>
```

A transformação pode ser combinada com alteração de texto (por exemplo: `art4_cpt_inc2(revisao;transformado;alinea,revisao;alterado)`) e movimentação (por exemplo: `art4_cpt_inc1_ali1(revisao;movido;art4_cpt_inc1,revisao;transformado;inciso)`).

O histórico deve conservar todas as operações aplicadas, em vez de substituir uma operação pela outra.

### Alteração de rótulo em alteração de norma

Dentro de `Alteracao`, a mudança de rótulo deve armazenar o rótulo anterior.

O formato da marca de alteração de rótulo é `(revisao:alteracaoRotulo;<idRotuloOriginal>)` on de `<idRotuloOriginal>` é o rótulo antes da alteração.


```xml
<Alteracao id="art2_cpt_alt1">
  <Artigo id="art2_cpt_alt1_art4(revisao;alteracaoRotulo;art2_cpt_alt1_art3)"
      lexedit:refIdUsuario="sf:fragomeni"
      lexedit:data="2026-05-11T15:51:00-03:00">
    <Rotulo>Art. 4º</Rotulo>
    <Caput id="art2_cpt_alt1_art4(revisao;alteracaoRotulo;art2_cpt_alt1_art3)_cpt">...</Caput>
  </Artigo>
</Alteracao>
```

Essa operação pode ser combinada com movimentação, transformação de tipo ou alteração textual.

## Decisões pendentes

- Definir se o histórico de operações ficará no id do dispositivo, em elementos `lexedit:*` associados por referência, ou em ambos.
- Definir um identificador técnico único e estável para dispositivos revisados, sem sobrecarregar ou invalidar o `id` LexML.
- Definir a ordem e a semântica de operações combinadas, inclusive ao desfazer uma operação intermediária.
- Definir como desfazer uma transformação quando houver dispositivos adicionados sob o dispositivo transformado, sem excluí-los indevidamente.

## Problema identificado

```
art4_cpt_inc1
art4_cpt_inc1_ali1(revisao;transformado;inciso) <-- não dá para desfazer sem excluir a alínea b
art4_cpt_inc1_ali2(revisao;adicionado)
```