# Justificação e conteúdo rico

## Necessidade informacional

A justificação precisa preservar conteúdo rico interoperável sem persistir detalhes internos do Quill ou de outro componente de edição.

## Representação proposta

Utilizar o subconjunto HTML utilizado pelo LexML.

Fazer ajustes no LexEdit:
- Não utilizar o “br” e testar no quill se podemos retirar os br’s adicionados automaticamente (em parágrafos e células vazias) sem perder a formatação ao recuperar o texto salvo.
- Testar retirar tbody e atributos de controle do plugin de tabelas (table_id, row_id e cell_id) e verificar se o quill abre direito.
- O atributo table.id é obrigatório no LexML. Verificar se podemos remover essa obrigatoriedade ou utilizamos o atributo table_id do quill.
- Será adicionado o elemento “u” ao LexML. 
- Remover atributo a.rel ao salvar.
- Converter style width (quill) de/para atributo (lexml)

Exemplo: 

```xml
<Justificacao>
    <PartePrincipal>
        <p>Esta proposição aperfeiçoa a <b>política pública</b>.</p>
        <table id='t1'>
            <tr>
                <td width='40%'>Indicador</td>
                <td width='60%'>Meta</td>
            </tr>
        </table>
    </PartePrincipal>
</Justificacao>
```

