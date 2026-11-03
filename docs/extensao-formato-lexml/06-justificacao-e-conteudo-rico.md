# Justificação e conteúdo rico

## Necessidade informacional

A justificação precisa preservar conteúdo rico interoperável sem persistir detalhes internos do Quill ou de outro componente de edição.

## Representação adotada

Utilizar o subconjunto HTML utilizado pelo LexML.

Fazer ajustes no LexEdit:
- Não utilizar o “br” e testar no quill se podemos retirar os br’s adicionados automaticamente (em parágrafos e células vazias) sem perder a formatação ao recuperar o texto salvo.
- Testar retirar tbody e atributos de controle do plugin de tabelas (table_id, row_id e cell_id) e verificar se o quill abre direito.
- O atributo table.id é obrigatório no LexML. Ao salvar, criar id no formato `_tabela<sequencial>`. Esse id será criado apenas para adequação ao padrão LexML e não precisará ser recuperado na abertura do arquivo.
- Remover atributo a.rel ao salvar.
- Largura: o LexML não aceita `width` em `td` nem largura percentual em atributo de `table`/`img`, então a largura é gravada em `style="width: N%"`. No editor, a largura de coluna e de imagem é o atributo `width="N%"` e a de tabela é `style="width:N%"`; ao abrir, volta ao mesmo formato. Limitação: o plugin de tabelas não guarda a largura de tabela e de coluna, e o editor a descarta ao carregar o texto (a de imagem volta).
- `td`/`th` só aceitam conteúdo inline no LexML: cada parágrafo de célula é gravado como `<span class="p …">` (com as demais classes do parágrafo) e volta a ser `<p>` ao abrir.
- No editor a imagem é um bloco; no LexML `img` é inline. Ela é gravada dentro de um parágrafo (`<p><img src="data:…" style="width: 50%"/></p>`), e um parágrafo que só tem a imagem volta a ser imagem ao abrir.
- Exceção temporária, até a implementação de `07` e `09`: notas de rodapé são retiradas ao salvar, o texto incluído em revisão (`ins`) fica sem a marca e o texto excluído (`del`) é descartado.

Implementação: `src/model/lexml/documento/conversor/justificacao.ts` (change OpenSpec `2026-10-19-c01-salvar-abrir-justificacao`, issue #991).

Exemplo: 

```xml
<Justificacao>
    <PartePrincipal>
        <p>Esta proposição aperfeiçoa a <b>política pública</b>.</p>
        <table id='_tabela1' border='1' style='width: 80%'>
            <tr>
                <td style='width: 40%'><span class='p align-center'>Indicador</span></td>
                <td style='width: 60%'><span class='p'>Meta</span></td>
            </tr>
        </table>
        <p><img src='data:image/png;base64,…' style='width: 50%'/></p>
    </PartePrincipal>
</Justificacao>
```

